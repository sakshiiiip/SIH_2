import React, { useState } from 'react';
import { Worker, WorkerDocument, DocumentStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  Calendar,
  Building,
  User,
  ExternalLink,
  Award,
  Lock,
} from 'lucide-react';

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
  document: WorkerDocument | null;
  onReview: (documentId: string, status: DocumentStatus, notes?: string) => void;
}

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  isOpen,
  onClose,
  worker,
  document,
  onReview,
}) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !worker || !document) return null;

  const handleAction = (status: DocumentStatus) => {
    setIsProcessing(true);
    setTimeout(() => {
      onReview(document.id, status, notes.trim() || undefined);
      setIsProcessing(false);
      onClose();
    }, 300);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="verified" size="sm">✓ Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="sm">✗ Rejected</Badge>;
      case 'CORRECTION_REQUIRED':
        return <Badge variant="urgent" size="sm">Needs Correction</Badge>;
      default:
        return <Badge variant="pending" size="sm">Pending Review</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verification Document Review"
      subtitle={`Worker: ${worker.name} · ${worker.skills[0] || 'Specialist'}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Document Header Metadata */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAEDE8] border border-[#F3C5B8] flex items-center justify-center text-[#80432E] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#292824]">{document.title}</h3>
                {getStatusBadge(document.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#77736B] mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Uploaded: {document.uploadedAt}</span>
                </span>
                <span>·</span>
                <span>Type: <strong className="capitalize text-[#292824]">{document.documentType}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Visual Document Preview Mockup */}
        <div className="p-5 bg-gradient-to-br from-[#FAF7F2] to-[#F3EEE4] border-2 border-[#E8E2D5] rounded-2xl shadow-subtle relative overflow-hidden">
          <div className="flex items-start justify-between pb-3 border-b border-[#E8E2D5]/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#6E8B67]" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#77736B] block leading-none">
                  Official Verification Record
                </span>
                <span className="text-xs font-bold text-[#292824]">
                  Maharashtra Cooperative Federation Registry
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#77736B] bg-white px-2 py-0.5 rounded border border-[#E8E2D5]">
              DOC-REF-{document.id.toUpperCase().slice(-8)}
            </span>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Worker Photo & Member Stamp */}
            <div className="flex sm:flex-col items-center gap-3 text-center">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-xs"
              />
              <div>
                <strong className="text-xs font-bold text-[#292824] block">{worker.name}</strong>
                <span className="text-[10px] text-[#77736B] font-mono">{worker.cooperativeMemberId}</span>
              </div>
            </div>

            {/* Document Details */}
            <div className="sm:col-span-2 space-y-2 text-xs">
              <div className="p-3 bg-white/80 rounded-xl border border-[#E8E2D5] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#77736B]">Document Category:</span>
                  <strong className="text-[#292824] capitalize">{document.documentType} Verification</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736B]">Attached Record:</span>
                  <strong className="text-[#292824] truncate max-w-[200px]">{document.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736B]">Society Station:</span>
                  <strong className="text-[#80432E]">{worker.societyName || 'Green Residency'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736B]">Verification Checksum:</span>
                  <span className="font-mono text-[10px] text-[#6E8B67] font-bold">SHA256: 4f8b91...c29a</span>
                </div>
              </div>

              {document.reviewNotes && (
                <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E8E2D5] text-[11px] text-[#524E47]">
                  <strong>Prior Review Note:</strong> {document.reviewNotes}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E2D5]/70 flex items-center justify-between text-[10px] text-[#77736B]">
            <span>Encrypted local custody storage</span>
            <span className="text-[#445D3E] font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Tamper-evident verification</span>
            </span>
          </div>
        </div>

        {/* Reviewer Note Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#524E47] block">
            Reviewer Remarks / Feedback (Optional)
          </label>
          <input
            type="text"
            placeholder="Add note for worker (e.g. 'Clear copy verified', 'Address matches society ward', etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
          />
        </div>

        {/* Action Buttons: Approve, Request Correction, Reject */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction('REJECTED')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#C93B2B] text-xs font-bold rounded-xl transition-colors border border-[#F3C5B8] cursor-pointer"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction('CORRECTION_REQUIRED')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#80432E] text-xs font-bold rounded-xl transition-colors border border-[#E8E2D5] cursor-pointer"
            >
              Request Correction
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction('APPROVED')}
              className="flex-1 sm:flex-none px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Document</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
