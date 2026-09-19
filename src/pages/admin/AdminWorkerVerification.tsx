import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Worker, WorkerVerificationStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  Clock,
  ArrowRight,
  Eye,
  Check,
  X,
  Search,
  Users,
} from 'lucide-react';

export const AdminWorkerVerification: React.FC = () => {
  const {
    workers,
    endorseWorkerByManager,
    rejectWorkerByManager,
    approveWorkerByFederation,
    rejectWorkerByFederation,
    showToast,
  } = useCooperativeStore();

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal state
  const [rejectWorkerTarget, setRejectWorkerTarget] = useState<Worker | null>(null);
  const [rejectStage, setRejectStage] = useState<'manager' | 'federation'>('manager');
  const [rejectionReason, setRejectionReason] = useState('');

  // Endorsement modal state
  const [endorseTarget, setEndorseTarget] = useState<Worker | null>(null);
  const [endorsementNotes, setEndorsementNotes] = useState('');

  // Accreditation modal state
  const [accreditTarget, setAccreditTarget] = useState<Worker | null>(null);
  const [accreditationNotes, setAccreditationNotes] = useState('');

  const renderVerificationBadge = (status: WorkerVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#364A32] bg-[#E6ECE4] px-2.5 py-1 rounded-lg border border-[#CFDDD0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
            <span>✓ Federation Verified</span>
          </span>
        );
      case 'MANAGER_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Endorsed · Awaiting Federation Approval</span>
          </span>
        );
      case 'MANAGER_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            <X className="w-3.5 h-3.5 text-rose-600" />
            <span>Manager Rejected</span>
          </span>
        );
      case 'FEDERATION_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Rejected / Returned to Society</span>
          </span>
        );
      case 'CORRECTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Correction Required</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Manager Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pending Manager Review</span>
          </span>
        );
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.cooperativeMemberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.societyName && w.societyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'ALL' ||
      w.verificationStatus === filterStatus ||
      (filterStatus === 'PENDING_GROUP' &&
        (w.verificationStatus === 'PENDING' ||
          w.verificationStatus === 'UNDER_REVIEW' ||
          w.verificationStatus === 'CORRECTION_REQUIRED')) ||
      (filterStatus === 'REJECTED_GROUP' &&
        (w.verificationStatus === 'MANAGER_REJECTED' ||
          w.verificationStatus === 'FEDERATION_REJECTED'));

    return matchesSearch && matchesStatus;
  });

  const handleConfirmEndorse = () => {
    if (!endorseTarget) return;
    endorseWorkerByManager(endorseTarget.id, endorsementNotes.trim() || undefined);
    setEndorseTarget(null);
    setEndorsementNotes('');
    if (selectedWorker?.id === endorseTarget.id) {
      setSelectedWorker(null);
    }
  };

  const handleConfirmAccredit = () => {
    if (!accreditTarget) return;
    approveWorkerByFederation(accreditTarget.id, accreditationNotes.trim() || undefined);
    setAccreditTarget(null);
    setAccreditationNotes('');
    if (selectedWorker?.id === accreditTarget.id) {
      setSelectedWorker(null);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectWorkerTarget) return;
    if (!rejectionReason.trim()) {
      showToast({
        title: 'Rejection Reason Required',
        message: 'Please provide a clear reason for the rejection.',
        type: 'warning',
      });
      return;
    }

    if (rejectStage === 'manager') {
      rejectWorkerByManager(rejectWorkerTarget.id, rejectionReason.trim());
    } else {
      rejectWorkerByFederation(rejectWorkerTarget.id, rejectionReason.trim());
    }

    setRejectWorkerTarget(null);
    setRejectionReason('');
    if (selectedWorker?.id === rejectWorkerTarget.id) {
      setSelectedWorker(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="max-w-3xl space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EFEBF4] text-[#504161] border border-[#DFD8E8]">
              Two-Tier Regulatory Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Worker Verification Administration
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Strict two-tier verification workflow: Society Manager Endorsement followed by Central Federation Council Accreditation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Workforce</span>
            <strong className="text-base text-slate-900 font-mono">{workers.length}</strong> Workers
          </div>
          <div className="px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs">
            <span className="text-blue-700 block text-[10px] uppercase font-bold">Awaiting Fed.</span>
            <strong className="text-base text-blue-900 font-mono">
              {workers.filter((w) => w.verificationStatus === 'MANAGER_VERIFIED').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Verification Hierarchy Guide */}
      <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#504161] block mb-2">
          Cooperative Accreditation Flow
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Society Manager Review</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Local manager reviews KYC documents, tradesperson identity, and signs off. Result: <strong>MANAGER_VERIFIED</strong>.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Federation Accreditation</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Federation Council audits manager endorsement and compliance. Result: <strong>VERIFIED</strong>.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Automated Job Dispatch</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Only <strong>VERIFIED</strong> workers are eligible for customer booking matching and dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search worker name, member ID, skill, or society..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#504161]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'ALL', label: `All (${workers.length})` },
            {
              id: 'PENDING_GROUP',
              label: `Pending Manager (${workers.filter((w) => ['PENDING', 'UNDER_REVIEW', 'CORRECTION_REQUIRED'].includes(w.verificationStatus)).length})`,
            },
            {
              id: 'MANAGER_VERIFIED',
              label: `Awaiting Fed. (${workers.filter((w) => w.verificationStatus === 'MANAGER_VERIFIED').length})`,
            },
            {
              id: 'VERIFIED',
              label: `Verified (${workers.filter((w) => w.verificationStatus === 'VERIFIED').length})`,
            },
            {
              id: 'REJECTED_GROUP',
              label: `Rejected (${workers.filter((w) => ['MANAGER_REJECTED', 'FEDERATION_REJECTED'].includes(w.verificationStatus)).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#504161] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Roster */}
      <div className="space-y-3">
        {filteredWorkers.length === 0 ? (
          <div className="p-10 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <strong className="text-sm text-slate-800 block">No workers found</strong>
            <p className="text-xs text-slate-500">Try adjusting your search query or filter selection.</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const approvedDocs = (worker.documents || []).filter((d) => d.status === 'APPROVED').length;
            const totalDocs = (worker.documents || []).length || 5;

            const isPendingManager =
              worker.verificationStatus === 'PENDING' ||
              worker.verificationStatus === 'UNDER_REVIEW' ||
              worker.verificationStatus === 'CORRECTION_REQUIRED';
            const isManagerVerified = worker.verificationStatus === 'MANAGER_VERIFIED';
            const isVerified = worker.verificationStatus === 'VERIFIED';

            return (
              <Card
                key={worker.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-200 hover:border-[#CFDDD0] transition-all"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                        {worker.name}
                      </h3>
                      {renderVerificationBadge(worker.verificationStatus)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#504161] font-semibold">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{worker.societyName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-normal">Member #{worker.cooperativeMemberId}</span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Trade Skills:</strong> {worker.skills.join(', ')}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 pt-0.5">
                      <span>
                        KYC Documents: <strong className="text-slate-800">{approvedDocs}/{totalDocs} Approved</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Assessment: <strong className="text-slate-800">{worker.proficiencyScore}%</strong>
                      </span>
                      {worker.managerVerification && (
                        <>
                          <span>·</span>
                          <span className="text-blue-900 font-semibold">
                            Endorsed by {worker.managerVerification.verifiedBy} ({worker.managerVerification.verifiedAt})
                          </span>
                        </>
                      )}
                    </div>

                    {worker.rejectionReason && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 mt-1">
                        <strong>Rejection Reason: </strong>
                        {worker.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions aligned strictly with 2-tier governance */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWorker(worker)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Review Dossier
                  </Button>

                  {isPendingManager && (
                    <>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setRejectWorkerTarget(worker);
                          setRejectStage('manager');
                          setRejectionReason('');
                        }}
                        className="text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setEndorseTarget(worker);
                          setEndorsementNotes('');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                      >
                        Endorse (Tier 1)
                      </Button>
                    </>
                  )}

                  {isManagerVerified && (
                    <>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setRejectWorkerTarget(worker);
                          setRejectStage('federation');
                          setRejectionReason('');
                        }}
                        className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                      >
                        Return to Society
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setAccreditTarget(worker);
                          setAccreditationNotes('');
                        }}
                        className="bg-[#504161] hover:bg-[#3f334d] text-white"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Accredit (Tier 2)
                      </Button>
                    </>
                  )}

                  {isVerified && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      Active for Dispatch
                    </span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* REVIEW DOSSIER MODAL */}
      <Modal
        isOpen={selectedWorker !== null}
        onClose={() => setSelectedWorker(null)}
        title="Worker Verification Dossier"
        subtitle={selectedWorker ? `${selectedWorker.name} · Member #${selectedWorker.cooperativeMemberId}` : ''}
        maxWidth="lg"
      >
        {selectedWorker && (
          <div className="space-y-5 text-xs">
            {/* Top overview */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Stage</span>
                <div className="mt-1">{renderVerificationBadge(selectedWorker.verificationStatus)}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Affiliated Society</span>
                <strong className="text-slate-900 text-xs">{selectedWorker.societyName}</strong>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Assessment</span>
                <strong className="text-sm font-bold text-emerald-800">{selectedWorker.proficiencyScore}%</strong>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">KYC Docs</span>
                <strong className="text-sm font-bold text-slate-800">
                  {(selectedWorker.documents || []).filter((d) => d.status === 'APPROVED').length}/
                  {(selectedWorker.documents || []).length || 5} Approved
                </strong>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Experience</span>
                <strong className="text-sm font-bold text-slate-800">
                  {selectedWorker.completedJobs || 0} Jobs
                </strong>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Hourly Rate</span>
                <strong className="text-sm font-bold text-slate-800">₹{selectedWorker.hourlyRate}</strong>
              </div>
            </div>

            {/* Documents List */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">
                KYC & Credential Verification Checklist:
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(selectedWorker.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#504161] shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-slate-900 block truncate">{doc.title}</strong>
                        <span className="text-[10px] text-slate-500">
                          {doc.reviewedBy ? `Reviewed by ${doc.reviewedBy}` : 'Pending review'}
                        </span>
                      </div>
                    </div>
                    <Badge variant={doc.status === 'APPROVED' ? 'verified' : 'pending'} size="sm">
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Manager Endorsement Details if present */}
            {selectedWorker.managerVerification && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span>Tier 1: Society Manager Endorsement ✓</span>
                  <span className="text-[10px] text-blue-700">{selectedWorker.managerVerification.verifiedAt}</span>
                </div>
                <p className="text-[11px] text-blue-800 italic">
                  "{selectedWorker.managerVerification.notes || 'Documents verified and endorsed by Society Manager.'}"
                </p>
                <span className="text-[10px] text-blue-700 block">
                  Endorser: <strong>{selectedWorker.managerVerification.verifiedBy}</strong>
                </span>
              </div>
            )}

            {/* Federation Verification Details if present */}
            {selectedWorker.federationVerification && (
              <div className="p-3 bg-[#EFEBF4] border border-[#DFD8E8] rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[#504161] font-bold">
                  <span>Tier 2: Federation Council Review</span>
                  <span className="text-[10px] text-slate-600">{selectedWorker.federationVerification.approvedAt}</span>
                </div>
                <p className="text-[11px] text-slate-700 italic">
                  "{selectedWorker.federationVerification.notes}"
                </p>
                <span className="text-[10px] text-slate-600 block">
                  Auditor: <strong>{selectedWorker.federationVerification.approvedBy}</strong> (Status: {selectedWorker.federationVerification.status})
                </span>
              </div>
            )}

            {/* Modal Actions based strictly on current verification tier */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedWorker(null)}>
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedWorker.verificationStatus === 'PENDING' ||
                selectedWorker.verificationStatus === 'UNDER_REVIEW' ||
                selectedWorker.verificationStatus === 'CORRECTION_REQUIRED' ? (
                  <>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setRejectWorkerTarget(selectedWorker);
                        setRejectStage('manager');
                        setRejectionReason('');
                      }}
                      className="text-rose-800 bg-rose-50 hover:bg-rose-100"
                    >
                      Reject Application
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEndorseTarget(selectedWorker);
                        setEndorsementNotes('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      Endorse to Federation
                    </Button>
                  </>
                ) : selectedWorker.verificationStatus === 'MANAGER_VERIFIED' ? (
                  <>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setRejectWorkerTarget(selectedWorker);
                        setRejectStage('federation');
                        setRejectionReason('');
                      }}
                      className="text-amber-800 bg-amber-50 hover:bg-amber-100"
                    >
                      Return to Society
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setAccreditTarget(selectedWorker);
                        setAccreditationNotes('');
                      }}
                      className="bg-[#504161] hover:bg-[#3f334d] text-white"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Accredit Worker
                    </Button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    ✓ Full Federation Accreditation Granted
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ENDORSEMENT CONFIRMATION MODAL */}
      {endorseTarget && (
        <Modal
          isOpen={endorseTarget !== null}
          onClose={() => setEndorseTarget(null)}
          title="Endorse Worker to Federation"
          subtitle={`Tier 1 Endorsement · ${endorseTarget.name} (#${endorseTarget.cooperativeMemberId})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <strong className="text-blue-900 block font-bold">Manager Endorsement Confirmation</strong>
              <p className="text-blue-800">
                You are endorsing <strong>{endorseTarget.name}</strong> to the Central Federation. Worker status will transition to <strong>MANAGER_VERIFIED</strong> and appear in the Federation review queue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Manager Notes (Optional)</label>
              <textarea
                rows={3}
                value={endorsementNotes}
                onChange={(e) => setEndorsementNotes(e.target.value)}
                placeholder="Confirm that trade skills and local KYC documents have been reviewed..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setEndorseTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmEndorse}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              >
                Confirm Endorsement
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ACCREDITATION CONFIRMATION MODAL */}
      {accreditTarget && (
        <Modal
          isOpen={accreditTarget !== null}
          onClose={() => setAccreditTarget(null)}
          title="Grant Federation Accreditation"
          subtitle={`Tier 2 Accreditation · ${accreditTarget.name} (#${accreditTarget.cooperativeMemberId})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#EFEBF4] border border-[#DFD8E8] rounded-xl space-y-1">
              <strong className="text-[#504161] block font-bold">Federation Council Accreditation</strong>
              <p className="text-slate-700">
                Granting accreditation will set <strong>{accreditTarget.name}</strong> to <strong>VERIFIED</strong>. The worker will immediately become active and eligible for customer job dispatch across member societies.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Federation Audit Notes (Optional)</label>
              <textarea
                rows={3}
                value={accreditationNotes}
                onChange={(e) => setAccreditationNotes(e.target.value)}
                placeholder="Enter regulatory compliance audit observations..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#504161] placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setAccreditTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAccredit}
                className="bg-[#504161] hover:bg-[#3f334d] text-white"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Grant Full Accreditation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECTION / RETURN MODAL */}
      {rejectWorkerTarget && (
        <Modal
          isOpen={rejectWorkerTarget !== null}
          onClose={() => setRejectWorkerTarget(null)}
          title={rejectStage === 'manager' ? 'Reject Worker Application' : 'Return Application to Society'}
          subtitle={`${rejectWorkerTarget.name} (#${rejectWorkerTarget.cooperativeMemberId})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <strong>Action Rationale Required: </strong>
              <span>
                {rejectStage === 'manager'
                  ? 'Please specify why this applicant does not meet local cooperative membership standards.'
                  : 'Please specify the compliance defect so the local Society Manager can request corrections.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Rationale <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Identity document expired, police clearance copy blurred, trade certificate requires verification..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setRejectWorkerTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Confirm {rejectStage === 'manager' ? 'Rejection' : 'Return'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
