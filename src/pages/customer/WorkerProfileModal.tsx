import React, { useState } from 'react';
import { Worker, WorkerDocument, DocumentStatus, WorkerSkillEntry } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DocumentReviewModal } from '../../components/admin/DocumentReviewModal';
import { AddSkillModal } from '../../components/admin/AddSkillModal';
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
  Plus,
  Check,
  X,
  MapPin,
  Calendar,
  User,
  ShieldAlert,
  AlertTriangle,
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
  const {
    currentRole,
    reviewWorkerDocument,
    verifyWorkerPersonalKyc,
    verifyWorkerSkill,
    showToast,
  } = useCooperativeStore();

  const [selectedDocForReview, setSelectedDocForReview] = useState<WorkerDocument | null>(null);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [personalKycNotes, setPersonalKycNotes] = useState('');
  const [skillRejectNotes, setSkillRejectNotes] = useState<Record<string, string>>({});

  if (!isOpen || !worker) return null;

  const isManager =
    currentRole === 'society_manager' ||
    currentRole === 'federation_admin' ||
    currentRole === 'federation_manager';

  const docs = worker.documents || [];
  const approvedDocsCount = docs.filter((d) => d.status === 'APPROVED').length;
  const isPersonalKycVerified = worker.personalKycStatus === 'VERIFIED';
  const skillEntries: WorkerSkillEntry[] = worker.skillEntries || [];
  const verifiedSkillsCount = skillEntries.filter((s) => s.status === 'VERIFIED').length;
  const isFullyEligible = worker.verificationStatus === 'VERIFIED';

  const handleDocumentReview = (docId: string, status: DocumentStatus, notes?: string) => {
    reviewWorkerDocument(worker.id, docId, status, notes);
    showToast({
      title: `Document ${status === 'APPROVED' ? 'Approved' : 'Updated'}`,
      message: `Updated verification for ${worker.name}.`,
      type: status === 'APPROVED' ? 'success' : 'info',
    });
  };

  const handleVerifyPersonalKyc = (status: 'VERIFIED' | 'REJECTED') => {
    verifyWorkerPersonalKyc(worker.id, status, personalKycNotes);
  };

  const handleVerifySkill = (skillId: string, status: 'VERIFIED' | 'REJECTED') => {
    const notes = skillRejectNotes[skillId] || '';
    verifyWorkerSkill(worker.id, skillId, status, notes);
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

  const getSkillStatusBadge = (status: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#364A32] bg-[#E6ECE4] px-2 py-0.5 rounded-md border border-[#CFDDD0]">
            <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
            <span>Verified</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Check</span>
          </span>
        );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-[#292824] tracking-tight">
                    {worker.name}
                  </h3>
                  {isFullyEligible ? (
                    <Badge variant="verified" size="sm">
                      <CheckCircle2 className="w-3 h-3 text-[#445D3E] mr-1" />
                      Verified & Active
                    </Badge>
                  ) : (
                    <Badge variant="pending" size="sm">
                      Pending Manager Verification
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

          {/* SOCIETY MANAGER 2-LEVEL VERIFICATION SYSTEM */}
          {isManager ? (
            <div className="space-y-4">
              {/* Overall Eligibility Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isFullyEligible
                    ? 'bg-[#E6ECE4]/70 border-[#CFDDD0] text-[#2A3927]'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isFullyEligible ? (
                    <CheckCircle2 className="w-5 h-5 text-[#6E8B67] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <strong className="font-bold block">
                      {isFullyEligible
                        ? 'Eligible for Customer Job Matching'
                        : 'Not Yet Visible to Customers'}
                    </strong>
                    <span className="text-[11px] opacity-90 block">
                      {isFullyEligible
                        ? 'Personal KYC is verified and at least 1 trade skill is verified.'
                        : 'Requires Personal KYC verified + at least 1 trade skill verified by Society Manager.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-white rounded-lg border border-[#E8E2D5]">
                    Personal KYC: {isPersonalKycVerified ? '✓ Verified' : 'Pending'}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-white rounded-lg border border-[#E8E2D5]">
                    Verified Skills: {verifiedSkillsCount}/{skillEntries.length || worker.skills.length}
                  </span>
                </div>
              </div>

              {/* LEVEL 1: PERSONAL KYC / IDENTITY */}
              <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#80432E]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#80432E]">
                      Level 1: Personal KYC Details
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isPersonalKycVerified
                        ? 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {isPersonalKycVerified ? '✓ Personal KYC Verified' : 'Pending Manager Review'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D5]">
                    <span className="text-[10px] font-bold text-[#77736B] block uppercase">Phone & Email</span>
                    <strong className="text-[#292824] block">{worker.phone}</strong>
                    <span className="text-[11px] text-[#77736B] block truncate">{worker.email || 'N/A'}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D5]">
                    <span className="text-[10px] font-bold text-[#77736B] block uppercase">Aadhaar Number</span>
                    <strong className="text-[#292824] font-mono block">
                      {worker.aadhaarNumber ? `XXXX-XXXX-${worker.aadhaarNumber.slice(-4)}` : 'Verified on File'}
                    </strong>
                    {worker.aadhaarCardUrl && (
                      <a
                        href={worker.aadhaarCardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#80432E] underline flex items-center gap-0.5 mt-0.5"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Aadhaar Document</span>
                      </a>
                    )}
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D5]">
                    <span className="text-[10px] font-bold text-[#77736B] block uppercase">Gender & DOB</span>
                    <strong className="text-[#292824] block capitalize">{worker.gender || 'Not specified'}</strong>
                    <span className="text-[11px] text-[#77736B]">{worker.dob || 'DOB on record'}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D5] sm:col-span-2">
                    <span className="text-[10px] font-bold text-[#77736B] block uppercase">Residential Address & PIN</span>
                    <p className="text-[#292824]">{worker.address || 'Address provided during onboarding'}</p>
                    <span className="text-[10px] text-[#77736B]">PIN Code: {worker.pinCode || '411045'}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#E8E2D5]">
                    <span className="text-[10px] font-bold text-[#77736B] block uppercase">Emergency Contact</span>
                    <strong className="text-[#292824] block">{worker.emergencyContactName || 'Family Member'}</strong>
                    <span className="text-[11px] text-[#77736B]">{worker.emergencyContactNumber || worker.phone}</span>
                  </div>
                </div>

                {/* Manager Personal KYC Verification Action */}
                {!isPersonalKycVerified && (
                  <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#77736B]">
                      Check identity and Aadhaar details to verify worker's personal record.
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleVerifyPersonalKyc('VERIFIED')}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Verify Personal KYC
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyPersonalKyc('REJECTED')}
                        className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* LEVEL 2: SKILL INFORMATION & RECORDS */}
              <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#80432E]" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#80432E]">
                        Level 2: Skill Information Records
                      </h4>
                      <p className="text-[11px] text-[#77736B]">
                        Workers can have multiple trade skills. Each skill is verified individually.
                      </p>
                    </div>
                  </div>

                  {/* REAL CLICKABLE BUTTON: + Add Skill */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddSkillOpen(true)}
                    className="text-xs font-bold text-[#80432E] border-[#80432E] hover:bg-[#FAF7F2] shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    + Add Skill
                  </Button>
                </div>

                {/* Skills List */}
                <div className="space-y-2.5">
                  {skillEntries.length > 0 ? (
                    skillEntries.map((skill) => (
                      <div
                        key={skill.id}
                        className="p-3.5 bg-white rounded-xl border border-[#E8E2D5] space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-xs font-extrabold text-[#292824]">
                                {skill.name}
                              </strong>
                              {getSkillStatusBadge(skill.status)}
                            </div>
                            <span className="text-[11px] text-[#77736B]">
                              Experience: <strong>{skill.experienceYears} Years</strong> · Area: {skill.serviceArea}
                            </span>
                          </div>

                          {/* Skill Action Buttons for Manager */}
                          {skill.status !== 'VERIFIED' && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleVerifySkill(skill.id, 'VERIFIED')}
                                className="text-xs py-1 px-2.5"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Verify Skill
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifySkill(skill.id, 'REJECTED')}
                                className="text-xs py-1 px-2 text-rose-700 border-rose-300 hover:bg-rose-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {skill.description && (
                          <p className="text-xs text-[#524E47] bg-[#FCF9F3] p-2 rounded-lg border border-[#E8E2D5]">
                            {skill.description}
                          </p>
                        )}

                        {skill.certificateUrl && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#80432E]">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Certificate: <strong>{skill.certificateName || 'Skill_Certificate.pdf'}</strong></span>
                            <a
                              href={skill.certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="underline ml-1 font-semibold"
                            >
                              View File
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-[#E8E2D5] text-center space-y-2">
                      <p className="text-xs text-[#77736B]">
                        No structured skill entries added yet for {worker.name}.
                      </p>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setIsAddSkillOpen(true)}
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        + Add Skill Now
                      </Button>
                    </div>
                  )}
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
                KYC & Skill Verified ✓
              </Badge>
            </div>
          )}

          {/* Bio */}
          {worker.bio && (
            <div className="p-3.5 bg-[#FCF9F3] rounded-2xl border border-[#E8E2D5] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] block mb-1">
                Professional Bio
              </span>
              <p className="text-[#524E47] leading-relaxed">{worker.bio}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-[#E8E2D5]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddSkillOpen(true)}
              className="text-xs text-[#80432E] border-[#80432E]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              + Add Another Skill
            </Button>

            <div className="flex items-center gap-2">
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

      {/* ADD SKILL MODAL */}
      {isAddSkillOpen && (
        <AddSkillModal
          isOpen={isAddSkillOpen}
          onClose={() => setIsAddSkillOpen(false)}
          workerId={worker.id}
          workerName={worker.name}
          onSkillAdded={(skillName) => {
            showToast({
              title: 'Skill Added',
              message: `${skillName} added for ${worker.name}.`,
              type: 'success',
            });
          }}
        />
      )}
    </>
  );
};
