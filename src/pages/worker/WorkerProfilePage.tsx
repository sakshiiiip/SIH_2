import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  Award,
  Edit3,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { currentUser, workers } = useCooperativeStore();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentWorker.name);
  const [editedPhone, setEditedPhone] = useState(currentWorker.phone);
  const [editedEmail, setEditedEmail] = useState(currentWorker.email);
  const [editedBio, setEditedBio] = useState(currentWorker.bio || '');

  const handleSave = () => {
    // TODO: Connect to store update when backend is ready
    setIsEditing(false);
  };

  const verificationColor = {
    VERIFIED:            { badge: 'verified' as const, text: '✅ Verified', sub: 'All documents approved' },
    PENDING:             { badge: 'pending' as const,  text: '⏳ Pending',  sub: 'Verification in progress' },
    UNDER_REVIEW:        { badge: 'pending' as const,  text: '🔍 Under Review', sub: 'Manager reviewing documents' },
    FAILED:              { badge: 'danger' as const,   text: '❌ Failed',   sub: 'Please re-submit documents' },
    CORRECTION_REQUIRED: { badge: 'urgent' as const,   text: '⚠️ Correction Required', sub: 'Action needed on documents' },
  }[currentWorker.verificationStatus] ?? { badge: 'neutral' as const, text: 'Unknown', sub: '' };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-[#537895]" />
          My Profile
        </h1>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl cursor-pointer transition-colors"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* PROFILE CARD                                                  */}
      {/* ============================================================ */}
      <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={currentWorker.avatar}
              alt={currentWorker.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#B8CBDD] shadow-xs"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              currentWorker.availability === 'online' ? 'bg-[#6E8B67]' : 'bg-[#B86B6B]'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#B8CBDD] rounded-xl text-lg font-bold text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] mb-1"
              />
            ) : (
              <h2 className="text-xl font-extrabold text-[#292824] leading-tight">{currentWorker.name}</h2>
            )}
            <p className="text-sm text-[#537895] font-semibold">{currentWorker.skills[0] || 'General Worker'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-4 h-4 fill-[#B37055] text-[#B37055]" />
              <span className="text-sm font-bold text-[#292824]">{currentWorker.rating}</span>
              <span className="text-xs text-[#77736B]">({currentWorker.totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#77736B]">Email</label>
            {isEditing ? (
              <input
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895]"
              />
            ) : (
              <div className="flex items-center gap-2 text-[#524E47]">
                <Mail className="w-4 h-4 text-[#537895]" />
                <span>{currentWorker.email}</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#77736B]">Phone</label>
            {isEditing ? (
              <input
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895]"
              />
            ) : (
              <div className="flex items-center gap-2 text-[#524E47]">
                <Phone className="w-4 h-4 text-[#537895]" />
                <span>{currentWorker.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-[#77736B]">Bio / About</label>
          {isEditing ? (
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              rows={3}
              placeholder="Tell customers about your experience and skills…"
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] resize-none"
            />
          ) : (
            <p className="text-sm text-[#524E47]">
              {currentWorker.bio || 'No bio added yet. Click Edit Profile to add one.'}
            </p>
          )}
        </div>

        {isEditing && (
          <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<Save className="w-3.5 h-3.5" />} className="w-full">
            Save Changes
          </Button>
        )}
      </div>

      {/* ============================================================ */}
      {/* STATS                                                         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jobs Done', value: currentWorker.completedJobs, icon: <Briefcase className="w-4 h-4 text-[#537895]" /> },
          { label: 'Rating',    value: `${currentWorker.rating}★`,  icon: <Star className="w-4 h-4 text-[#B37055]" /> },
          { label: 'Member Since', value: currentWorker.joinedDate?.split('-')[0] || '2023', icon: <Clock className="w-4 h-4 text-[#77736B]" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center">
            <div className="flex justify-center mb-1">{icon}</div>
            <span className="text-lg font-bold font-mono text-[#292824] block">{value}</span>
            <span className="text-[10px] text-[#77736B]">{label}</span>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* SKILLS & CERTIFICATES                                         */}
      {/* ============================================================ */}
      <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#537895]" />
          Skills & Certificates
        </h3>
        <div className="flex flex-wrap gap-2">
          {currentWorker.skills.map((skill) => (
            <span key={skill} className="px-2.5 py-1 bg-[#E4EDF4] text-[#2B4C68] border border-[#B8CBDD] rounded-full text-xs font-semibold">
              {skill}
            </span>
          ))}
        </div>
        {currentWorker.certificates.length > 0 && (
          <>
            <h4 className="text-[10px] font-bold uppercase text-[#77736B] mt-2">Certificates</h4>
            <div className="space-y-1.5">
              {currentWorker.certificates.map((cert) => (
                <div key={cert} className="flex items-center gap-2 text-xs text-[#524E47]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67] shrink-0" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* COOPERATIVE INFORMATION                                       */}
      {/* ============================================================ */}
      <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#537895]" />
          Cooperative / Society
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[10px] text-[#77736B] block">Society</span>
            <strong className="text-[#292824] text-xs">{currentWorker.societyName || '—'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#77736B] block">Member ID</span>
            <strong className="text-[#292824] text-xs font-mono">{currentWorker.cooperativeMemberId}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#77736B] block">Manager</span>
            <strong className="text-[#292824] text-xs">{currentWorker.managerName || '—'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#77736B] block">Location</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#537895]" />
              <strong className="text-[#292824] text-xs">{currentWorker.lastKnownArea || 'Green Residency'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* VERIFICATION STATUS — Integration point for Person 4         */}
      {/* ============================================================ */}
      <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#537895]" />
            KYC / Verification Status
          </h3>
          <Badge variant={verificationColor.badge} size="sm">{verificationColor.text}</Badge>
        </div>
        <p className="text-xs text-[#77736B]">{verificationColor.sub}</p>

        {/* Document checklist */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {['Identity', 'Address', 'Skill Certificate', 'Cooperative Membership', 'Background Check', 'Manager Approval'].map((doc, i) => (
            <div key={doc} className="flex items-center gap-1.5 text-[#364A32] font-medium">
              {i < currentWorker.kycDocumentsCount ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67] shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#B37055] shrink-0" />
              )}
              <span className={i < currentWorker.kycDocumentsCount ? 'text-[#364A32]' : 'text-[#77736B]'}>{doc}</span>
            </div>
          ))}
        </div>

        {/* ============================================================
            PERSON 4 INTEGRATION POINT
            The full KYC verification flow, document upload, and
            manager review system is owned by Person 4.
            This button should link to Person 4's KYC module.
            ============================================================ */}
        <div className="pt-2 border-t border-[#E8E2D5]">
          <div className="flex items-center gap-2 p-3 bg-[#E4EDF4] border border-[#B8CBDD] rounded-xl">
            <AlertCircle className="w-4 h-4 text-[#324F66] shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-[#324F66]">Full KYC & Document Verification</p>
              <p className="text-[10px] text-[#537895]">Managed by Society Manager — Person 4's module</p>
            </div>
            <button
              type="button"
              onClick={() => alert('KYC Verification module — Managed by Person 4 (Society Manager Dashboard)')}
              className="px-3 py-1.5 bg-[#324F66] hover:bg-[#263D50] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
