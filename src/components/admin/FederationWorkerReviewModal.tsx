import React, { useState } from 'react';
import { Worker, WorkerDocument } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  FileText,
  Building2,
  Calendar,
  Award,
  Eye,
  Check,
  Star,
  HardHat,
  Send,
} from 'lucide-react';

interface FederationWorkerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
  onApproved?: (workerId: string) => void;
  onRejected?: (workerId: string, reason: string) => void;
}

export const FederationWorkerReviewModal: React.FC<FederationWorkerReviewModalProps> = ({
  isOpen,
  onClose,
  worker,
  onApproved,
  onRejected,
}) => {
  const { approveWorkerByFederation, rejectWorkerByFederation, showToast } = useCooperativeStore();

  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<WorkerDocument | null>(null);

  if (!isOpen || !worker) return null;

  const isManagerVerified = worker.verificationStatus === 'MANAGER_VERIFIED';
  const isAlreadyVerified = worker.verificationStatus === 'VERIFIED';
  const isPendingManager = worker.verificationStatus === 'PENDING' || worker.verificationStatus === 'UNDER_REVIEW';
  const isRejected = worker.verificationStatus === 'FEDERATION_REJECTED' || worker.verificationStatus === 'MANAGER_REJECTED';

  const docs = worker.documents || [];
  const approvedDocsCount = docs.filter((d) => d.status === 'APPROVED').length;

  const handleApprove = () => {
    // Strict verification rule: only MANAGER_VERIFIED workers can be approved by Federation
    if (!isManagerVerified) {
      showToast({
        title: 'Compliance Violation',
        message: 'Only candidates endorsed by their Society Manager (MANAGER_VERIFIED) can be approved.',
        type: 'warning',
      });
      return;
    }

    approveWorkerByFederation(worker.id, approvalNotes || 'Federation Council compliance and credential audit approved.');
    if (onApproved) onApproved(worker.id);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      showToast({
        title: 'Reason Required',
        message: 'A rejection rationale is required for returning application to Society Management.',
        type: 'warning',
      });
      return;
    }

    rejectWorkerByFederation(worker.id, rejectReason.trim());
    if (onRejected) onRejected(worker.id, rejectReason.trim());
    setShowRejectForm(false);
    setRejectReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span>Federation Accreditation Review</span>
          <span className="text-xs font-mono font-normal text-[#77736B]">#{worker.cooperativeMemberId}</span>
        </div>
      }
      subtitle={`Central Regulatory Audit · ${worker.societyName || 'Affiliated Cooperative'}`}
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Worker Profile Card */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#E8E2D5] shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-[#292824] tracking-tight">{worker.name}</h3>
                {isAlreadyVerified ? (
                  <Badge variant="verified" size="sm">✓ Fully Verified</Badge>
                ) : isManagerVerified ? (
                  <Badge variant="coop" size="sm">Endorsed by Manager</Badge>
                ) : isRejected ? (
                  <Badge variant="danger" size="sm">Rejected</Badge>
                ) : (
                  <Badge variant="pending" size="sm">Pending Manager Review</Badge>
                )}
              </div>
              <p className="text-[11px] text-[#80432E] font-bold mt-0.5">
                {worker.skills.join(', ')} · {worker.profession || 'General Tradesperson'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[#77736B] flex-wrap text-[10px]">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#504161]" />
                  <span>{worker.societyName || 'Green Residency'}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Registered {worker.joinedDate}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-bold text-[#80432E]">
                  <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                  <span>{worker.rating}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#E8E2D5] sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-[#77736B] block">Hourly Tariff</span>
            <span className="text-lg font-mono font-bold text-[#292824] block">₹{worker.hourlyRate || 350}/hr</span>
            <span className="text-[10px] text-[#6E8B67] font-semibold">70% Direct Worker Payout</span>
          </div>
        </div>

        {/* Status Alert Banner */}
        {isManagerVerified ? (
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Manager Endorsement Received · Ready for Federation Accreditation</strong>
              <p className="text-blue-900 leading-relaxed mt-0.5">
                Candidate's identity, residence, and trade certification have been reviewed and endorsed by Society Manager{' '}
                <strong>{worker.managerVerification?.verifiedBy || worker.managerName || 'Priya Sharma'}</strong>.
                Approving grants full regional accreditation and activates the worker for customer AI matching.
              </p>
            </div>
          </div>
        ) : isAlreadyVerified ? (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Candidate Holds Full Regional Federation Accreditation</strong>
              <p className="text-emerald-900 leading-relaxed mt-0.5">
                Approved by Federation Council on {worker.federationVerification?.approvedAt || 'Active Ledger'}. Worker is currently eligible for automated job matching and emergency customer dispatches across all affiliated societies.
              </p>
            </div>
          </div>
        ) : isPendingManager ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Pending Local Society Manager Endorsement (Strict Governance)</strong>
              <p className="text-amber-900 leading-relaxed mt-0.5">
                According to cooperative bylaws, applicants must first be reviewed and endorsed by their local Society Manager (MANAGER_VERIFIED) before the Federation Council can grant regional accreditation.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Application In Correction / Rejection State</strong>
              <p className="text-rose-900 leading-relaxed mt-0.5">
                Reason: "{worker.rejectionReason || 'Pending remediation of required documents.'}"
              </p>
            </div>
          </div>
        )}

        {/* Manager Endorsement Audit Trail */}
        {worker.managerVerification && (
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#80432E] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#6E8B67]" />
                <span>Society Manager Audit Record</span>
              </span>
              <span className="text-[10px] font-mono text-[#77736B]">
                {worker.managerVerification.verifiedAt}
              </span>
            </div>
            <p className="text-[#524E47]">
              Endorsed by: <strong className="text-[#292824]">{worker.managerVerification.verifiedBy}</strong>
            </p>
            {worker.managerVerification.notes && (
              <div className="p-2.5 bg-white rounded-lg border border-[#E8E2D5] italic text-[#524E47]">
                "{worker.managerVerification.notes}"
              </div>
            )}
          </div>
        )}

        {/* KYC Document Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[#504161] text-[11px] block">
              Audited KYC Documents ({approvedDocsCount} / {docs.length} Approved)
            </span>
            <span className="text-[10px] text-[#77736B]">Physical & Digital Evidence Check</span>
          </div>

          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-white rounded-xl border border-[#E8E2D5] hover:border-[#DFD8E8] flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFEBF4] text-[#504161] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[#292824] block truncate">{doc.title}</strong>
                    <div className="flex items-center gap-2 text-[10px] text-[#77736B] flex-wrap mt-0.5">
                      <span className="capitalize">{doc.documentType} proof</span>
                      <span>·</span>
                      <span>Uploaded {doc.uploadedAt}</span>
                      {doc.reviewedBy && (
                        <>
                          <span>·</span>
                          <span className="text-[#445D3E]">Reviewed by {doc.reviewedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      doc.status === 'APPROVED'
                        ? 'verified'
                        : doc.status === 'REJECTED'
                        ? 'danger'
                        : doc.status === 'CORRECTION_REQUIRED'
                        ? 'urgent'
                        : 'pending'
                    }
                    size="sm"
                  >
                    {doc.status}
                  </Badge>

                  {doc.fileUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#504161] font-bold text-[11px] rounded-lg border border-[#E8E2D5] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Quick Preview Drawer */}
        {previewDoc && (
          <div className="p-3.5 bg-white rounded-xl border-2 border-[#504161] space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <strong className="text-xs text-[#292824]">Inspecting Document: {previewDoc.title}</strong>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {previewDoc.fileUrl ? (
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-h-48 w-full object-contain rounded-lg border border-slate-200 bg-slate-50"
              />
            ) : (
              <p className="text-slate-400 italic">No document image attached.</p>
            )}
            {previewDoc.reviewNotes && (
              <p className="text-[11px] text-slate-600">Review Note: "{previewDoc.reviewNotes}"</p>
            )}
          </div>
        )}

        {/* Rejection Form (Revealed upon clicking Reject) */}
        {showRejectForm && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-rose-950 font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Return Application to Society Manager</span>
              </strong>
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="text-rose-700 hover:text-rose-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-rose-900">
              Specify the compliance shortfall or credential defect. The local Society Manager and applicant will be instructed to address the issue.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Electrical license registration number could not be cross-verified on state electricity board portal. Please attach certified copy."
              className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={handleReject}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Return & Reject</span>
              </button>
            </div>
          </div>
        )}

        {/* Optional Federation Approval Notes */}
        {!showRejectForm && isManagerVerified && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#524E47] block">
              Federation Accreditation Notes (Optional)
            </label>
            <input
              type="text"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g. Regional central compliance and police clearance cross-checked."
              className="w-full p-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs focus:ring-2 focus:ring-[#504161] focus:outline-none"
            />
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] cursor-pointer"
          >
            Close
          </button>

          {!showRejectForm && (
            <div className="flex items-center gap-2">
              {!isAlreadyVerified && (
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject / Return to Society</span>
                </button>
              )}

              {/* Requirement 6: Federation Admin must NOT accidentally approve workers that are still PENDING or UNDER_REVIEW */}
              <button
                type="button"
                disabled={!isManagerVerified}
                onClick={handleApprove}
                className="px-5 py-2 bg-[#445D3E] hover:bg-[#33472F] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isAlreadyVerified
                    ? 'Accreditation Already Active'
                    : isManagerVerified
                    ? 'Approve & Grant Full Federation Accreditation'
                    : 'Awaiting Manager Endorsement'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
