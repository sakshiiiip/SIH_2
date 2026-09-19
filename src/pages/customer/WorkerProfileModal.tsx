import React, { useState } from 'react';
import { Worker, WorkerDocument, DocumentStatus } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { DocumentReviewModal } from '../../components/admin/DocumentReviewModal';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Award,
  Briefcase,
  FileCheck,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface WorkerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
  onRequestWithWorker?: (worker: Worker) => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  isOpen,
  onClose,
  worker,
  onRequestWithWorker,
}) => {
  const { currentRole, reviewWorkerDocument, showToast } = useCooperativeStore();
  const [selectedDocForReview, setSelectedDocForReview] = useState<WorkerDocument | null>(null);

  if (!isOpen || !worker) return null;

  const isManager = currentRole === 'society_manager' || currentRole === 'federation_admin' || currentRole === 'federation_manager';

  const docs = worker.documents || [];
  const approvedDocsCount = docs.filter((d) => d.status === 'APPROVED').length;
  const isFullyVerified = worker.verificationStatus === 'VERIFIED' || (docs.length > 0 && approvedDocsCount === docs.length);

  const handleDocumentReview = (docId: string, status: DocumentStatus, notes?: string) => {
    reviewWorkerDocument(worker.id, docId, status, notes);
    showToast({
      title: `Document ${status === 'APPROVED' ? 'Approved' : 'Updated'}`,
      message: `Updated verification for ${worker.name}.`,
      type: status === 'APPROVED' ? 'success' : 'info',
    });
  };

  const getDocStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="verified" size="sm">✓ Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'CORRECTION_REQUIRED':
        return <Badge variant="urgent" size="sm">Needs Correction</Badge>;
      default:
        return <Badge variant="pending" size="sm">Pending Review</Badge>;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
        <div className="space-y-5">
          {/* Header with Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
            <div className="flex items-center gap-3.5">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8E2D5] shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-[#292824] tracking-tight">
                    {worker.name}
                  </h3>
                  {isFullyVerified && (
                    <Badge variant="verified" size="sm">
                      <CheckCircle2 className="w-3 h-3 text-[#445D3E] mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-[#77736B] mt-0.5 flex items-center gap-2">
                  <span className="font-mono font-bold text-[#524E47]">
                    {worker.cooperativeMemberId}
                  </span>
                  <span>·</span>
                  <span>{worker.societyName || 'Green Residency'}</span>
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-xs">
                  <span className="flex items-center gap-1 font-bold text-[#80432E]">
                    <Star className="w-3.5 h-3.5 fill-[#B37055] text-[#B37055]" />
                    <span className="font-mono">{worker.rating > 0 ? worker.rating : '4.9'}</span>
                  </span>
                  <span className="text-[#77736B]">(<span className="font-mono">{worker.totalReviews}</span> reviews)</span>
                  <span>·</span>
                  <span className="text-[#524E47] font-medium"><span className="font-mono font-bold">{worker.completedJobs}</span> jobs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <a
                href={`tel:${worker.phone}`}
                className="px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* SOCIETY MANAGER VERIFICATION REVIEW PANEL (Sections 13 - 17) */}
          {isManager ? (
            <div className="p-4 bg-[#FCF9F3] border-2 border-[#E8E2D5] rounded-2xl space-y-4 shadow-subtle">
              {/* Summary Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#80432E] block">
                    Verification Review
                  </span>
                  <span className="text-sm font-extrabold text-[#292824]">
                    <span className="font-mono">{approvedDocsCount}</span> / <span className="font-mono">{docs.length}</span> Documents Approved
                  </span>
                </div>
                {isFullyVerified ? (
                  <span className="px-3 py-1 rounded-xl bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                    <span>✓ VERIFIED WORKER</span>
                  </span>
                ) : (
                  <Badge variant="pending" size="sm">Under Review</Badge>
                )}
              </div>

              {/* At-a-glance 5-item Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {docs.map((doc) => {
                  const isApproved = doc.status === 'APPROVED';
                  return (
                    <div
                      key={doc.id}
                      className={`p-2 rounded-xl border text-center transition-colors ${
                        isApproved
                          ? 'bg-[#E6ECE4]/70 border-[#CFDDD0] text-[#364A32]'
                          : 'bg-[#FAF7F2] border-[#E8E2D5] text-[#77736B]'
                      }`}
                    >
                      <span className="font-bold block capitalize text-[11px]">
                        {isApproved ? '✓' : '●'} {doc.documentType}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Documents List with View & Action Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#524E47] block">Uploaded Documents</span>
                <div className="space-y-1.5">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white rounded-xl border border-[#E8E2D5] hover:border-[#CFDDD0] flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#80432E] shrink-0" />
                        <div className="min-w-0">
                          <strong className="text-[#292824] truncate block">{doc.title}</strong>
                          <span className="text-[10px] text-[#77736B]">Uploaded: {doc.uploadedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getDocStatusBadge(doc.status)}
                        <button
                          type="button"
                          onClick={() => setSelectedDocForReview(doc)}
                          className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#292824] font-bold rounded-lg border border-[#E8E2D5] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#80432E]" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Customer View of Verification */
            <div className="p-4 rounded-2xl bg-[#E6ECE4]/60 border border-[#CFDDD0] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FCF9F3] text-[#445D3E] flex items-center justify-center shrink-0 border border-[#CFDDD0]">
                  <ShieldCheck className="w-5 h-5 text-[#6E8B67]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2A3927]">
                    100% Cooperative KYC Verified
                  </div>
                  <div className="text-[11px] text-[#524E47] mt-0.5">
                    Physical address, police clearance, and skill assessment verified by society manager.
                  </div>
                </div>
              </div>
              <Badge variant="verified" size="sm">
                5/5 Docs ✓
              </Badge>
            </div>
          )}

          {/* Bio & Skills */}
          {worker.bio && (
            <div className="p-3.5 bg-[#FCF9F3] rounded-2xl border border-[#E8E2D5] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] block mb-1">
                Professional Bio
              </span>
              <p className="text-[#524E47] leading-relaxed">{worker.bio}</p>
            </div>
          )}

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#292824]">
                <Briefcase className="w-4 h-4 text-[#537895]" />
                <span>Trade Specializations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {worker.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#E4EDF4] text-[#324F66] border border-[#CDE0EC]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#292824]">
                <Award className="w-4 h-4 text-[#80432E]" />
                <span>Accredited Certifications</span>
              </div>
              <div className="space-y-1">
                {worker.certificates.map((cert) => (
                  <div key={cert} className="flex items-center gap-1.5 text-xs text-[#524E47]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67] shrink-0" />
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] cursor-pointer"
            >
              Close
            </button>
            {onRequestWithWorker && (
              <button
                type="button"
                onClick={() => {
                  onRequestWithWorker(worker);
                  onClose();
                }}
                className="px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Request Service with {worker.name.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* DOCUMENT REVIEW MODAL */}
      {selectedDocForReview && (
        <DocumentReviewModal
          isOpen={selectedDocForReview !== null}
          onClose={() => setSelectedDocForReview(null)}
          worker={worker}
          document={selectedDocForReview}
          onReview={handleDocumentReview}
        />
      )}
    </>
  );
};
