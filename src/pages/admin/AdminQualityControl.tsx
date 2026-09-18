import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';

export const AdminQualityControl: React.FC = () => {
  const {
    bookings,
    workers,
    adminReviewQualityIssue,
    adminReassignQualityIssue,
    completeRevisit,
  } = useCooperativeStore();

  const [selectedDisputeBooking, setSelectedDisputeBooking] =
    useState<Booking | null>(null);
  const [reassignWorkerId, setReassignWorkerId] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const disputedBookings = bookings.filter(
    (b) => b.qualityIssue !== undefined || b.state === 'QUALITY_ISSUE' || b.state === 'REVISIT'
  );

  const handleReview = (bookingId: string) => {
    adminReviewQualityIssue(
      bookingId,
      resolutionNotes || 'Coordinator contacted resident. Authorized complimentary master rework.'
    );
    setSelectedDisputeBooking(null);
  };

  const handleReassignAndRevisit = (bookingId: string) => {
    const workerToAssign = reassignWorkerId || workers[0].id;
    adminReassignQualityIssue(bookingId, workerToAssign);
    setSelectedDisputeBooking(null);
  };

  const handleResolve = (bookingId: string) => {
    completeRevisit(bookingId);
    setSelectedDisputeBooking(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="danger" className="mb-2">
          Consumer Protection & Standards
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Quality Control & Dispute Resolution
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Cooperative assurance: when work does not meet professional standards, administrators review evidence and schedule a zero-cost revisit with a senior specialist.
        </p>
      </div>

      {/* Disputed Bookings Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#292824]">
          Quality Issue Queue (<span className="font-mono">{disputedBookings.length}</span>)
        </h2>

        {disputedBookings.length === 0 ? (
          <Card className="p-8 text-center text-[#77736B] space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#6E8B67] mx-auto" />
            <h3 className="font-bold text-[#292824]">Zero Open Quality Disputes</h3>
            <p className="text-xs text-[#77736B]">
              All completed services are verified and meeting cooperative satisfaction standards.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {disputedBookings.map((b) => (
              <Card key={b.id} className="p-5 border-[#F3C5B8] bg-[#FAEDE8]/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#292824] text-base">
                        Booking <span className="font-mono font-bold">#{b.id}</span> — {b.serviceCategory}
                      </span>
                      <Badge variant="danger">
                        {b.qualityIssue?.status === 'revisit_assigned'
                          ? 'Revisit Assigned'
                          : b.qualityIssue?.status === 'resolved'
                          ? 'Resolved'
                          : 'Investigation Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong>{b.customerName}</strong> ({b.societyName}) · Original Worker: <strong>{b.matchedWorker?.name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDisputeBooking(b)}
                    >
                      Inspect Details
                    </Button>
                    {b.state === 'REVISIT' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolve(b.id)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Confirm Revisit Complete
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setSelectedDisputeBooking(b)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Reassign Revisit
                      </Button>
                    )}
                  </div>
                </div>

                {b.qualityIssue && (
                  <div className="p-3 bg-white border border-rose-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-rose-900 uppercase tracking-wider">
                        Issue Type: {b.qualityIssue.type.replace('_', ' ')}
                      </span>
                      <span>Reported: {b.qualityIssue.reportedAt}</span>
                    </div>
                    <p className="text-slate-700 italic">"{b.qualityIssue.description}"</p>
                    {b.qualityIssue.reassignedWorkerName && (
                      <div className="text-teal-800 font-semibold pt-1 border-t border-slate-100">
                        Senior Revisit Specialist Assigned: {b.qualityIssue.reassignedWorkerName}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* DISPUTE RESOLUTION MODAL */}
      <Modal
        isOpen={selectedDisputeBooking !== null}
        onClose={() => setSelectedDisputeBooking(null)}
        title="Dispute Review & Revisit Assignment"
        subtitle={selectedDisputeBooking ? `Booking #${selectedDisputeBooking.id}` : ''}
        maxWidth="md"
      >
        {selectedDisputeBooking && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
              <div><strong>Customer:</strong> {selectedDisputeBooking.customerName}</div>
              <div><strong>Address:</strong> {selectedDisputeBooking.customerAddress}</div>
              <div><strong>Complaint:</strong> {selectedDisputeBooking.qualityIssue?.description}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Senior Worker for Revisit:
              </label>
              <select
                value={reassignWorkerId}
                onChange={(e) => setReassignWorkerId(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
              >
                <option value="">Choose Reassignment Specialist</option>
                {workers
                  .filter((w) => w.verificationStatus === 'VERIFIED')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rating: {w.rating} ★, Proficiency: {w.proficiencyScore}%)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Coordinator Investigation Note:
              </label>
              <textarea
                rows={2}
                placeholder="Add audit notes or instructions for the revisit worker..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => handleReview(selectedDisputeBooking.id)}
              >
                Mark Reviewed
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleReassignAndRevisit(selectedDisputeBooking.id)}
              >
                Assign Revisit Specialist
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
