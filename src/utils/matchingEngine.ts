import { Worker, CandidateScore, PlatformConfig } from '../types';

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function calculateCandidateScores(
  serviceCategory: string,
  workers: Worker[],
  weights: PlatformConfig['matchingWeights'],
  excludedWorkerIds: string[] = [],
  customerLocation?: { lat: number; lng: number }
): CandidateScore[] {
  const eligibleWorkers = workers.filter(
    (w) => !excludedWorkerIds.includes(w.id) && w.verificationStatus === 'VERIFIED'
  );

  const scoredCandidates: CandidateScore[] = eligibleWorkers.map((worker) => {
    // 1. Skill Compatibility (0 - 100)
    const hasCategory = worker.skills.some(
      (s) => s.toLowerCase() === serviceCategory.toLowerCase()
    );
    const hasGeneralSkill = worker.skills.some(
      (s) => s.toLowerCase().includes('repairs') || s.toLowerCase().includes('general')
    );
    const skillCompatibility = hasCategory ? 100 : hasGeneralSkill ? 65 : 25;

    // 2. Worker Proficiency (0 - 100)
    const proficiency = Math.min(100, Math.max(0, worker.proficiencyScore));

    // 3. Distance Score (0 - 100, closer is higher)
    // Use real-time GPS coordinates if available, fallback gracefully to pre-computed distanceKm
    let effectiveDistanceKm = worker.distanceKm;
    if (
      customerLocation &&
      worker.latitude !== undefined &&
      worker.longitude !== undefined
    ) {
      effectiveDistanceKm = calculateHaversineKm(
        customerLocation.lat,
        customerLocation.lng,
        worker.latitude,
        worker.longitude
      );
    }
    const distanceScore = Math.min(100, Math.max(10, Math.round(100 - effectiveDistanceKm * 9)));

    // 4. Availability Score (0 - 100)
    const availabilityScore =
      worker.availability === 'online' ? 100 : worker.availability === 'busy' ? 40 : 0;

    // 5. Workload Balance (Fair Allocation: 0 - 100)
    // Workers with fewer active jobs/lower workload get higher balance score
    const workloadBalance = Math.min(100, Math.max(10, 100 - worker.currentWorkload));

    // Weighted Calculation
    const totalWeights =
      weights.skillCompatibility +
      weights.proficiency +
      weights.distance +
      weights.availability +
      weights.workloadBalance;

    const weightedScore =
      (skillCompatibility * weights.skillCompatibility +
        proficiency * weights.proficiency +
        distanceScore * weights.distance +
        availabilityScore * weights.availability +
        workloadBalance * weights.workloadBalance) /
      (totalWeights || 1);

    const matchScore = Math.min(99, Math.max(15, Math.round(weightedScore)));

    return {
      worker,
      matchScore,
      skillCompatibility,
      proficiency,
      distanceScore,
      availabilityScore,
      workloadBalance,
    };
  });

  // Sort by highest matchScore first
  return scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
}
