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

/**
 * Normalizes trade names and strictly tests if a worker's trade/skills match the job category.
 * Prevents cross-category job leaks (e.g. plumbing jobs showing to electricians).
 */
export function isWorkerSkillMatching(
  worker: { skill?: string; skills?: string[]; profession?: string; tradeProfession?: string },
  jobCategory?: string
): boolean {
  if (!jobCategory) return false;
  const category = jobCategory.toLowerCase().trim();

  const workerSkills = [
    worker.skill,
    worker.profession,
    worker.tradeProfession,
    ...(worker.skills || []),
  ]
    .filter(Boolean)
    .map((s) => s!.toLowerCase().trim());

  if (workerSkills.length === 0) return false;

  // Exact or substring match
  const directMatch = workerSkills.some(
    (s) => s === category || s.includes(category) || category.includes(s)
  );
  if (directMatch) return true;

  // Trade-specific semantic equivalences
  const TRADE_GROUPS: Record<string, string[]> = {
    plumbing: ['plumb', 'pipe', 'tap', 'leak', 'drain', 'siphon', 'water', 'valve'],
    electrical: ['electr', 'wire', 'wiring', 'socket', 'switch', 'mcb', 'fuse', 'spark', 'short circuit'],
    carpentry: ['carpent', 'wood', 'door', 'furniture', 'hinge', 'lock'],
    cleaning: ['clean', 'deep clean', 'descaling', 'maid', 'sanitiz', 'housekeeping'],
    painting: ['paint', 'waterproof', 'wall'],
    appliance: ['appliance', 'ac', 'fridge', 'refrigerator', 'microwave', 'washing machine', 'geyser'],
    pest: ['pest', 'termite', 'cockroach', 'mosquito'],
    gardening: ['garden', 'greenery', 'plant', 'tree', 'trimming'],
    security: ['cctv', 'security', 'camera', 'surveillance'],
  };

  for (const [key, aliases] of Object.entries(TRADE_GROUPS)) {
    const categoryMatchesGroup = category.includes(key) || aliases.some((a) => category.includes(a));
    if (categoryMatchesGroup) {
      const workerMatchesGroup = workerSkills.some(
        (s) => s.includes(key) || aliases.some((a) => s.includes(a))
      );
      if (workerMatchesGroup) return true;
      // If category belongs to this group, but worker does not, reject to prevent cross-leak
      return false;
    }
  }

  return false;
}

export function calculateCandidateScores(
  serviceCategory: string,
  workers: Worker[],
  weights: PlatformConfig['matchingWeights'],
  excludedWorkerIds: string[] = [],
  customerLocation?: { lat: number; lng: number }
): CandidateScore[] {
  // STRICT filter: Exclude workers who do not match the required trade category
  const eligibleWorkers = workers.filter(
    (w) =>
      !excludedWorkerIds.includes(w.id) &&
      w.verificationStatus === 'VERIFIED' &&
      isWorkerSkillMatching(w, serviceCategory)
  );

  const scoredCandidates: CandidateScore[] = eligibleWorkers.map((worker) => {
    // 1. Skill Compatibility (Strict Match: 90 - 100)
    const hasCategory = worker.skills.some(
      (s) => s.toLowerCase() === serviceCategory.toLowerCase()
    );
    const skillCompatibility = hasCategory ? 100 : 90;

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
