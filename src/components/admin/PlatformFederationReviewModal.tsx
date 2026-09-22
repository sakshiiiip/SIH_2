import React, { useState } from 'react';
import { FederationApplication, FederationDocumentItem } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  RotateCcw,
  Send,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface PlatformFederationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: FederationApplication | null;
  onActionComplete?: () => void;
}

export const PlatformFederationReviewModal: React.FC<PlatformFederationReviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onActionComplete,
}) => {
  const {
    approveFederationApplication,
    requestChangesFederationApplication,
    rejectFederationApplication,
    reviewFederationDocument,
    showToast,
  } = useCooperativeStore();

  const [activeTab, setActiveTab] = useState<'details' | 'societies' | 'documents' | 'history'>('details');
  const [adminNotes, setAdminNotes] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionView, setActionView] = useState<'idle' | 'approve' | 'request_changes' | 'reject'>('idle');
  const [previewDoc, setPreviewDoc] = useState<FederationDocumentItem | null>(null);

  if (!isOpen || !application) return null;

  const isPending = application.status === 'PENDING_VERIFICATION';
  const isApproved = application.status === 'APPROVED';
  const isChangesRequired = application.status === 'CHANGES_REQUIRED';
  const isRejected = application.status === 'REJECTED';

  const docs = application.documents || [];
  const verifiedDocsCount = docs.filter((d) => d.status === 'VERIFIED').length;
  const correctionDocsCount = docs.filter((d) => d.status === 'NEEDS_CORRECTION').length;

  const handleApprove = () => {
    approveFederationApplication(
      application.id,
      adminNotes.trim() || 'Federation registration and statutory documents verified and approved.'
    );
    setActionView('idle');
    setAdminNotes('');
    if (onActionComplete) onActionComplete();
    onClose();
  };

  const handleRequestChanges = () => {
    if (!changeReason.trim()) {
      showToast({
        title: 'Reason Required',
        message: 'Please provide clear guidance on what changes/documents are required.',
        type: 'warning',
      });
      return;
    }

    requestChangesFederationApplication(application.id, changeReason.trim(), adminNotes.trim());
    setActionView('idle');
    setChangeReason('');
    setAdminNotes('');
    if (onActionComplete) onActionComplete();
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      showToast({
        title: 'Reason Required',
        message: 'A rejection rationale is required.',
        type: 'warning',
      });
      return;
    }

    rejectFederationApplication(application.id, rejectReason.trim(), adminNotes.trim());
    setActionView('idle');
    setRejectReason('');
    setAdminNotes('');
    if (onActionComplete) onActionComplete();
    onClose();
  };

  const getStatusBadge = () => {
    switch (application.status) {
      case 'APPROVED':
        return <Badge variant="success" size="md">APPROVED · ACCREDITED APEX</Badge>;
      case 'PENDING_VERIFICATION':
        return <Badge variant="warning" size="md">PENDING VERIFICATION</Badge>;
      case 'CHANGES_REQUIRED':
        return <Badge variant="warning" size="md">CHANGES REQUESTED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="md">APPLICATION REJECTED</Badge>;
      default:
        return <Badge variant="neutral" size="md">{application.status}</Badge>;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Federation Application Audit</span>
            <span className="text-xs font-mono font-normal text-[#77736B]">#{application.id}</span>
          </div>
        }
        subtitle={`Platform Central Authority · Apex Registrar Desk`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#F7F5F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-200 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#141413]">
                  {application.federationName}
                </h3>
                <p className="text-xs text-[#77736B] flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>{application.federationType}</span>
                  <span>•</span>
                  <span>Reg: <strong className="text-[#141413]">{application.registrationNumber}</strong></span>
                  <span>•</span>
                  <span>{application.district}, {application.state}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>

          {/* Status Alerts if applicable */}
          {isChangesRequired && application.changeRequestReason && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Revisions Requested by Registrar:</span> {application.changeRequestReason}
                {application.reviewedAt && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Requested on {application.reviewedAt} by {application.reviewedBy || 'Central Authority'}
                  </p>
                )}
              </div>
            </div>
          )}

          {isRejected && application.rejectionReason && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-900">
                <span className="font-bold">Rejection Reason:</span> {application.rejectionReason}
                {application.reviewedAt && (
                  <p className="text-[11px] text-red-700 mt-1">
                    Rejected on {application.reviewedAt} by {application.reviewedBy || 'Central Authority'}
                  </p>
                )}
              </div>
            </div>
          )}

          {isApproved && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-xs text-green-900">
                <span className="font-bold">Accredited & Active:</span> This federation has been verified by the Platform Admin. Its declared societies operate under its cooperative governance framework.
                {application.reviewedAt && (
                  <p className="text-[11px] text-green-700 mt-1">
                    Approved on {application.reviewedAt} by {application.reviewedBy || 'Central Authority'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Nav Tabs */}
          <div className="flex border-b border-[#D5D0C7] text-xs font-medium text-[#77736B] gap-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'border-b-2 border-purple-700 text-purple-900 font-bold'
                  : 'hover:text-[#141413]'
              }`}
            >
              <Building2 className="w-4 h-4" /> Basic Details
            </button>
            <button
              onClick={() => setActiveTab('societies')}
              className={`pb-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'societies'
                  ? 'border-b-2 border-purple-700 text-purple-900 font-bold'
                  : 'hover:text-[#141413]'
              }`}
            >
              <Layers className="w-4 h-4" /> Declared Societies ({application.declaredSocieties?.length || application.societiesCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'border-b-2 border-purple-700 text-purple-900 font-bold'
                  : 'hover:text-[#141413]'
              }`}
            >
              <FileText className="w-4 h-4" /> Documents ({verifiedDocsCount}/{docs.length} Verified)
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-b-2 border-purple-700 text-purple-900 font-bold'
                  : 'hover:text-[#141413]'
              }`}
            >
              <Clock className="w-4 h-4" /> Timeline & Notes
            </button>
          </div>

          {/* Tab 1: Basic Details & Representative */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Federation Details */}
              <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" /> Federation Registration Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#77736B] block">Legal Name:</span>
                    <span className="font-semibold text-[#141413]">{application.federationName}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Federation Type:</span>
                    <span className="font-semibold text-[#141413]">{application.federationType}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Registration Number:</span>
                    <span className="font-semibold text-[#141413] font-mono">{application.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Registration Date:</span>
                    <span className="font-semibold text-[#141413]">{application.registrationDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">State & District:</span>
                    <span className="font-semibold text-[#141413]">{application.district}, {application.state}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Official Email:</span>
                    <span className="font-semibold text-[#141413]">{application.officialEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Official Phone:</span>
                    <span className="font-semibold text-[#141413]">{application.officialPhone}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Website / Portal:</span>
                    {application.website ? (
                      <a href={application.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-700 hover:underline flex items-center gap-1">
                        {application.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[#77736B]">Not provided</span>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E8E6DF] text-xs">
                  <span className="text-[#77736B] block">Registered Apex Office Address:</span>
                  <p className="text-[#141413] font-medium mt-0.5">{application.fullAddress}</p>
                </div>
              </div>

              {/* Authorized Representative */}
              <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" /> Authorized Representative (Federation Manager / Lead)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#77736B] block">Representative Name:</span>
                    <span className="font-semibold text-[#141413]">{application.authorizedPersonName}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Designation:</span>
                    <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                      {application.authorizedPersonDesignation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Direct Email:</span>
                    <span className="font-semibold text-[#141413]">{application.authorizedPersonEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Direct Phone:</span>
                    <span className="font-semibold text-[#141413]">{application.authorizedPersonPhone}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">Identity Proof Type:</span>
                    <span className="font-semibold text-[#141413]">{application.authorizedPersonIdType || 'Government ID'}</span>
                  </div>
                  <div>
                    <span className="text-[#77736B] block">ID Number / Reference:</span>
                    <span className="font-semibold text-[#141413] font-mono">{application.authorizedPersonIdNumber || 'Verified in attached doc'}</span>
                  </div>
                </div>
              </div>

              {/* Declared Service Categories */}
              <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> Declared Federation Service Domains
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {application.selectedServices && application.selectedServices.length > 0 ? (
                    application.selectedServices.map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200"
                      >
                        {srv}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#77736B]">Standard Trades & Facility Maintenance</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Declared Member Societies */}
          {activeTab === 'societies' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2">
                <Layers className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Declared Member Cooperatives ({application.declaredSocieties?.length || 0}):</span>
                  <p className="mt-0.5 text-purple-900">
                    These societies are registered under this Federation's cooperative network. Note: Each cooperative manager still performs independent local onboarding, subject to society-level audit.
                  </p>
                </div>
              </div>

              <div className="border border-[#D5D0C7] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F7F5F0] border-b border-[#D5D0C7] text-[#77736B] font-semibold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Society / Cooperative Name</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Pincode</th>
                      <th className="p-3">Households</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6DF] bg-white">
                    {application.declaredSocieties && application.declaredSocieties.length > 0 ? (
                      application.declaredSocieties.map((soc, idx) => (
                        <tr key={soc.id || idx} className="hover:bg-[#FAF9F5]">
                          <td className="p-3 text-[#77736B]">{idx + 1}</td>
                          <td className="p-3 font-semibold text-[#141413] flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-purple-600" />
                            {soc.name}
                          </td>
                          <td className="p-3 font-mono text-[#77736B]">{soc.code || 'N/A'}</td>
                          <td className="p-3 text-[#141413]">{soc.district || application.district}</td>
                          <td className="p-3 text-[#77736B] font-mono">{soc.pincode || '—'}</td>
                          <td className="p-3 text-[#141413]">{soc.totalHouseholds ? `${soc.totalHouseholds} units` : '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-xs text-[#77736B]">
                          No member societies declared yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Documents Review */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#77736B]">
                <span>Statutory Compliance Checklist:</span>
                <span className="font-semibold text-[#141413]">
                  {verifiedDocsCount} / {docs.length} Verified
                  {correctionDocsCount > 0 && ` · ${correctionDocsCount} Action Required`}
                </span>
              </div>

              <div className="space-y-3">
                {docs.map((doc) => {
                  const isDocVerified = doc.status === 'VERIFIED';
                  const isDocCorrection = doc.status === 'NEEDS_CORRECTION';
                  return (
                    <div
                      key={doc.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isDocVerified
                          ? 'border-green-200 bg-green-50/50'
                          : isDocCorrection
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-[#D5D0C7] bg-[#FAF9F5]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isDocVerified
                              ? 'bg-green-100 text-green-700'
                              : isDocCorrection
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#141413]">{doc.title}</span>
                            {isDocVerified && <Badge variant="success" size="sm">VERIFIED</Badge>}
                            {isDocCorrection && <Badge variant="warning" size="sm">NEEDS RE-UPLOAD</Badge>}
                            {doc.status === 'UPLOADED' && <Badge variant="neutral" size="sm">SUBMITTED</Badge>}
                          </div>
                          <p className="text-[11px] text-[#77736B] mt-0.5 flex items-center gap-2">
                            <span className="font-mono">{doc.fileName}</span>
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                            <span>•</span>
                            <span>Uploaded: {doc.uploadedAt}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons per document */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#D5D0C7] bg-white text-xs font-medium text-[#141413] hover:bg-[#F7F5F0] flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#77736B]" /> View File
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => reviewFederationDocument(application.id, doc.id, 'VERIFIED')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                                isDocVerified
                                  ? 'bg-green-700 text-white'
                                  : 'bg-green-50 text-green-800 border border-green-300 hover:bg-green-100'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" /> {isDocVerified ? 'Verified' : 'Verify'}
                            </button>
                            <button
                              onClick={() => reviewFederationDocument(application.id, doc.id, 'NEEDS_CORRECTION')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                                isDocCorrection
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Flag Correction
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Timeline & Notes */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">
                  Application Audit Lifecycle
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Send className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#141413]">Application Submitted</div>
                      <div className="text-[#77736B]">{application.submittedAt}</div>
                      <div className="text-[11px] text-[#77736B] mt-0.5">Submitted by {application.authorizedPersonName} ({application.authorizedPersonDesignation})</div>
                    </div>
                  </div>

                  {application.updatedAt !== application.submittedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <RotateCcw className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#141413]">Application Updated / Resubmitted</div>
                        <div className="text-[#77736B]">{application.updatedAt}</div>
                      </div>
                    </div>
                  )}

                  {application.reviewedAt && (
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        application.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : application.status === 'CHANGES_REQUIRED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {application.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="font-semibold text-[#141413]">
                          Registrar Decision: {application.status}
                        </div>
                        <div className="text-[#77736B]">{application.reviewedAt} by {application.reviewedBy || 'Central Authority'}</div>
                        {application.adminNotes && (
                          <div className="mt-1 p-2 bg-white rounded border border-[#E8E6DF] text-[#141413]">
                            <strong>Audit Note:</strong> {application.adminNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Platform Admin Decision Action Panels */}
          {isPending && (
            <div className="pt-4 border-t border-[#D5D0C7] space-y-3">
              {actionView === 'idle' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-[#77736B]">
                    Select Platform Central Authority action for this application:
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setActionView('request_changes')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Request Revisions
                    </button>
                    <button
                      onClick={() => setActionView('reject')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-900 border border-red-300 hover:bg-red-100 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => setActionView('approve')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Accredit
                    </button>
                  </div>
                </div>
              )}

              {/* Approve Form */}
              {actionView === 'approve' && (
                <div className="p-4 rounded-xl border-2 border-green-400 bg-green-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-green-950 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-700" /> Confirm Federation Accreditation
                    </h4>
                    <button
                      onClick={() => setActionView('idle')}
                      className="text-xs text-[#77736B] hover:text-[#141413]"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-green-900">
                    Approving will grant <strong>{application.federationName}</strong> official Apex Federation status on the platform. The declared representative ({application.authorizedPersonName}) will be empowered to oversee societies and coordinate cross-society services.
                  </p>
                  <div>
                    <label className="text-xs font-medium text-green-950 block mb-1">
                      Compliance Audit Note (Optional):
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. All 4 statutory documents verified. Registration validity verified with state apex registrar."
                      className="w-full text-xs p-2.5 rounded-lg border border-green-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActionView('idle')}
                      className="px-3 py-1.5 rounded-lg border border-green-300 text-xs font-medium text-green-900 hover:bg-green-100"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-1.5 rounded-lg bg-green-700 text-white text-xs font-bold hover:bg-green-800 shadow flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Grant Central Accreditation
                    </button>
                  </div>
                </div>
              )}

              {/* Request Changes Form */}
              {actionView === 'request_changes' && (
                <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-amber-700" /> Request Revisions from Federation
                    </h4>
                    <button
                      onClick={() => setActionView('idle')}
                      className="text-xs text-[#77736B] hover:text-[#141413]"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-amber-900">
                    The federation status will change to <strong>CHANGES_REQUIRED</strong>. The representative will be notified and given the opportunity to update data and re-upload required documents.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-amber-950 block mb-1">
                      Specific Changes & Re-upload Instructions (Required):
                    </label>
                    <textarea
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. Please re-upload a clear certified copy of the 2026 Board Resolution and official registered lease deed."
                      className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActionView('idle')}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-medium text-amber-900 hover:bg-amber-100"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRequestChanges}
                      className="px-4 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 shadow flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Change Request
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {actionView === 'reject' && (
                <div className="p-4 rounded-xl border-2 border-red-400 bg-red-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-red-950 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-700" /> Reject Federation Application
                    </h4>
                    <button
                      onClick={() => setActionView('idle')}
                      className="text-xs text-[#77736B] hover:text-[#141413]"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-red-900">
                    Rejecting will disqualify this application from apex platform participation. Please provide a formal regulatory reason.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-red-950 block mb-1">
                      Official Rejection Rationale (Required):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. Failure to establish legal registration under the Multi-State Cooperative Societies Act."
                      className="w-full text-xs p-2.5 rounded-lg border border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActionView('idle')}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-xs font-medium text-red-900 hover:bg-red-100"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold hover:bg-red-800 shadow flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Confirm Formal Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Document Preview Safe Viewer Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.title}`}
          subtitle={`File: ${previewDoc.fileName} (${previewDoc.fileSize})`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed border-[#D5D0C7] rounded-xl bg-[#FAF9F5] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-[#141413]">{previewDoc.title}</h4>
              <p className="text-xs text-[#77736B] font-mono mt-1">{previewDoc.fileName} · {previewDoc.fileSize}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={previewDoc.status === 'VERIFIED' ? 'success' : previewDoc.status === 'NEEDS_CORRECTION' ? 'warning' : 'neutral'} size="sm">
                  {previewDoc.status}
                </Badge>
                <span className="text-xs text-[#77736B]">Uploaded {previewDoc.uploadedAt}</span>
              </div>
              <div className="mt-4 p-3 bg-white border border-[#E8E6DF] rounded-lg text-xs text-[#77736B] max-w-md">
                <p className="font-medium text-[#141413] mb-1">Official Statutory Document Verified Seal</p>
                This document is certified on the platform under Multi-State Cooperative Society registry compliance guidelines.
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-[#141413] text-white text-xs font-semibold hover:bg-black"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
