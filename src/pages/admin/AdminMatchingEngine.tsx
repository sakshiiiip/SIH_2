import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking, Worker } from '../../types';
import { calculateCandidateScores } from '../../utils/matchingEngine';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Cpu, CheckCircle2, UserCheck, Sliders, ShieldCheck, Star, MapPin } from 'lucide-react';

export const AdminMatchingEngine: React.FC = () => {
  const {
    bookings,
    workers,
    config,
    updateConfig,
    adminManualAssignWorker,
  } = useCooperativeStore();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings[0]?.id || ''
  );

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  // Recalculate candidate scores for selected booking
  const candidates = selectedBooking
    ? calculateCandidateScores(
        selectedBooking.serviceCategory,
        workers,
        config.matchingWeights,
        selectedBooking.rejectedWorkerIds || []
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="coop" className="mb-2">
          Fair Allocation Architecture
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          AI / Fair Work Allocation Engine
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Rather than funneling all jobs to the highest-reviewed worker, our matching algorithm dynamically balances <strong>skill compatibility, distance, availability, and worker workload</strong> to prevent worker burnout and ensure equitable local distribution.
        </p>
      </div>

      {/* Booking Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 pr-2">
          Select Request:
        </span>
        {bookings.slice(0, 6).map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBookingId(b.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
              b.id === selectedBookingId
                ? 'bg-[#6E8B67] text-white border-[#587352] shadow-xs font-bold'
                : 'bg-white text-[#524E47] border-[#E8E2D5] hover:bg-[#FAF7F2]'
            }`}
          >
            <span className="font-mono font-bold">#{b.id}</span> — {b.serviceCategory} ({b.urgencyTier})
          </button>
        ))}
      </div>

      {/* Active Request Breakdown */}
      {selectedBooking && (
        <Card className="p-5 border-[#E8E2D5] bg-[#FAF7F2]/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#292824]">
                  Request <span className="font-mono font-bold">#{selectedBooking.id}</span> · {selectedBooking.serviceCategory}
                </span>
                <Badge
                  variant={
                    selectedBooking.urgencyTier === 'EMERGENCY'
                      ? 'emergency'
                      : selectedBooking.urgencyTier === 'URGENT'
                      ? 'urgent'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {selectedBooking.urgencyTier}
                </Badge>
              </div>
              <p className="text-xs text-[#524E47] mt-0.5">
                {selectedBooking.problemType} — {selectedBooking.customerAddress} ({selectedBooking.societyName})
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#77736B] block">Current Status</span>
              <Badge variant="coop">{selectedBooking.state}</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* CANDIDATE WORKERS SCORECARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#292824] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#6E8B67]" />
            <span>Candidate Scorecards (<span className="font-mono">{candidates.length}</span> Verified Specialists)</span>
          </h2>
          <span className="text-xs text-[#77736B]">
            Sorted by computed Fair Match Score
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((cand, idx) => {
            const isAssigned = selectedBooking?.matchedWorkerId === cand.worker.id;

            return (
              <Card
                key={cand.worker.id}
                className={`p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isAssigned
                    ? 'border-[#6E8B67] bg-[#E6ECE4]/20 ring-1 ring-[#6E8B67] shadow-card'
                    : 'border-[#E8E2D5]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.worker.avatar}
                        alt={cand.worker.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D5]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-[#292824] text-base">
                            {cand.worker.name}
                          </h3>
                          {idx === 0 && (
                            <Badge variant="verified" size="sm">Top Match</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#77736B]">
                          <span className="flex items-center gap-1 text-[#80432E] font-semibold">
                            <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                            <span className="font-mono">{cand.worker.rating}</span>
                          </span>
                          <span>·</span>
                          <span className="font-mono">{cand.worker.distanceKm} km away</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#77736B] block">Match Score</span>
                      <span className="text-2xl font-bold font-mono text-[#445D3E]">
                        {cand.matchScore}%
                      </span>
                    </div>
                  </div>

                  {/* Multi-Factor Score Bars */}
                  <div className="space-y-2 text-xs pt-2 border-t border-[#E8E2D5]">
                    <div>
                      <div className="flex justify-between text-[#524E47] mb-0.5">
                        <span>Skill Compatibility</span>
                        <span className="font-semibold font-mono">{cand.skillCompatibility}%</span>
                      </div>
                      <div className="w-full bg-[#E8E2D5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#6E8B67] h-full rounded-full"
                          style={{ width: `${cand.skillCompatibility}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#524E47] mb-0.5">
                        <span>Trade Proficiency (Exam Score)</span>
                        <span className="font-semibold font-mono">{cand.proficiency}%</span>
                      </div>
                      <div className="w-full bg-[#E8E2D5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#537895] h-full rounded-full"
                          style={{ width: `${cand.proficiency}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#524E47] mb-0.5">
                        <span>Distance Proximity</span>
                        <span className="font-semibold font-mono">{cand.distanceScore}%</span>
                      </div>
                      <div className="w-full bg-[#E8E2D5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#6E8B67] h-full rounded-full"
                          style={{ width: `${cand.distanceScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#524E47] mb-0.5">
                        <span>Fair Workload Balance (Anti-burnout)</span>
                        <span className="font-semibold font-mono">{cand.workloadBalance}%</span>
                      </div>
                      <div className="w-full bg-[#E8E2D5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#B37055] h-full rounded-full"
                          style={{ width: `${cand.workloadBalance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {isAssigned ? (
                    <div className="p-2.5 bg-teal-100/70 text-teal-900 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      <span>Currently Assigned Specialist</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:border-teal-700 hover:text-teal-900"
                      onClick={() => {
                        if (selectedBooking) {
                          adminManualAssignWorker(selectedBooking.id, cand.worker.id);
                          alert(`Manual Override: Assigned ${cand.worker.name} to Booking #${selectedBooking.id}.`);
                        }
                      }}
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    >
                      Override & Assign Directly
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
