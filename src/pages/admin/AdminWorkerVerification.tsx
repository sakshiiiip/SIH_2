import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Worker, WorkerVerificationStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText, UserCheck } from 'lucide-react';

export const AdminWorkerVerification: React.FC = () => {
  const { workers, updateWorkerVerification } = useCooperativeStore();

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const handleUpdateStatus = (workerId: string, newStatus: WorkerVerificationStatus) => {
    updateWorkerVerification(workerId, newStatus);
    setSelectedWorker(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="verified" className="mb-2">
          Regulatory Compliance
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Worker Verification Administration
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Evaluate cooperative membership documents, practical assessment scores, and local society approvals before granting verified active status.
        </p>
      </div>

      {/* Workers Verification Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Applicant Roster</h2>

        <div className="space-y-3">
          {workers.map((worker) => (
            <Card
              key={worker.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-200"
            >
              <div className="flex items-start gap-4">
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {worker.name}
                    </h3>
                    <Badge
                      variant={
                        worker.verificationStatus === 'VERIFIED'
                          ? 'verified'
                          : worker.verificationStatus === 'CORRECTION_REQUIRED'
                          ? 'urgent'
                          : worker.verificationStatus === 'FAILED'
                          ? 'danger'
                          : 'pending'
                      }
                      size="sm"
                    >
                      {worker.verificationStatus}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Trade Skills:</strong> {worker.skills.join(', ')} · Member #{worker.cooperativeMemberId}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>
                      KYC Documents: <strong>{worker.kycDocumentsCount}/4 verified</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Assessment: <strong>{worker.proficiencyScore}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Local Verification:{' '}
                      <strong className={worker.localVerificationStatus === 'verified' ? 'text-emerald-700' : 'text-amber-600'}>
                        {worker.localVerificationStatus === 'verified' ? 'Completed ✓' : 'Pending Society Visit'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWorker(worker)}
                >
                  Review Dossier
                </Button>

                {worker.verificationStatus !== 'VERIFIED' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(worker.id, 'VERIFIED')}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve
                  </Button>
                ) : (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => handleUpdateStatus(worker.id, 'CORRECTION_REQUIRED')}
                    className="text-amber-800"
                  >
                    Request Re-check
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* REVIEW DOSSIER MODAL */}
      <Modal
        isOpen={selectedWorker !== null}
        onClose={() => setSelectedWorker(null)}
        title="Worker Verification Dossier"
        subtitle={selectedWorker ? `${selectedWorker.name} · ${selectedWorker.skills.join(', ')}` : ''}
        maxWidth="lg"
      >
        {selectedWorker && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Aadhaar / KYC Status</span>
                <span className="font-bold text-slate-800">
                  {selectedWorker.kycDocumentsCount === 4 ? 'Verified & Cryptographically Signed' : 'Incomplete Upload'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Coop Membership ID</span>
                <span className="font-bold text-slate-800">{selectedWorker.cooperativeMemberId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Practical Trade Exam</span>
                <span className="font-bold text-emerald-800">{selectedWorker.proficiencyScore}% Score</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">Local Society RWA Signoff</span>
                <span className="font-bold text-slate-800 capitalize">{selectedWorker.localVerificationStatus}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                Verified Credentials & Diplomas:
              </span>
              <div className="p-3 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
                {selectedWorker.certificates.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleUpdateStatus(selectedWorker.id, 'FAILED')}
              >
                Reject Applicant
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedWorker.id, 'CORRECTION_REQUIRED')}
                  className="text-amber-800 bg-amber-50 hover:bg-amber-100"
                >
                  Request Correction
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedWorker.id, 'VERIFIED')}
                >
                  Approve & Certify
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
