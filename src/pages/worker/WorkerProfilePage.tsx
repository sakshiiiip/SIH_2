import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { WorkerOnboarding } from './WorkerOnboarding';
import { SupportPanel } from '../../components/worker/SupportPanel';
import {
  Phone,
  Mail,
  Star,
  ShieldCheck,
  Briefcase,
  Edit3,
  CheckCircle2,
  Save,
  Lock,
  ToggleLeft,
  ToggleRight,
  HeadphonesIcon,
  AlertCircle,
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, workers, showToast } = useCooperativeStore();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentWorker.name);
  const [editedPhone, setEditedPhone] = useState(currentWorker.phone);
  const [editedEmail, setEditedEmail] = useState(currentWorker.email);
  const [editedBio, setEditedBio] = useState(
    currentWorker.bio || 'Certified residential trade specialist with 6+ years experience in societies across Baner and Pune.'
  );

  // Account Settings state
  const [rememberMe, setRememberMe] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modals
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    showToast({
      title: t('worker.profile.profileUpdated', 'Profile Updated'),
      message: t('worker.profile.profileUpdatedMsg', 'Your personal and trade information has been saved.'),
      type: 'success',
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({ title: t('common.error', 'Error'), message: 'Please fill all fields.', type: 'warning' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ title: t('common.error', 'Error'), message: 'Passwords do not match.', type: 'warning' });
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast({
      title: t('worker.profile.passwordSuccess', 'Password Changed Successfully! 🔒'),
      message: t('worker.profile.passwordSuccessMsg', 'Your credentials have been securely updated.'),
      type: 'success',
    });
  };

  const VERIFICATION_POINTS = [
    { label: t('worker.profile.verifIdentity', 'Identity'), desc: t('worker.profile.verifIdentityDesc', 'Government Aadhaar / ID verified with biometric match'), status: t('common.verified', 'Approved') },
    { label: t('worker.profile.verifMembership', 'Membership'), desc: t('worker.profile.verifMembershipDesc', { society: currentWorker.societyName || 'Green Residency', defaultValue: `Registered member of ${currentWorker.societyName || 'Green Residency'} hub` }), status: t('common.verified', 'Approved') },
    { label: t('worker.profile.verifSkills', 'Skills'), desc: t('worker.profile.verifSkillsDesc', 'Certified in plumbing, pipe pressure diagnostics, and fittings'), status: t('common.verified', 'Approved') },
    { label: t('worker.profile.verifSociety', 'Society'), desc: t('worker.profile.verifSocietyDesc', 'Endorsed by Society Manager with local residency trust certificate'), status: t('common.verified', 'Approved') },
    { label: t('worker.profile.verifAssessment', 'Assessment'), desc: t('worker.profile.verifAssessmentDesc', 'Field practical assessment passed with 94% safety grade'), status: t('common.verified', 'Approved') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ============================================================ */}
      {/* TOP HEADER & BASIC PROFILE PHOTO / CARD                      */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={currentWorker.avatar}
                alt={currentWorker.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#B8CBDD] shadow-xs"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  currentWorker.availability === 'online' ? 'bg-[#6E8B67]' : 'bg-[#B86B6B]'
                }`}
              />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-3 py-1 bg-white border border-[#B8CBDD] rounded-xl text-lg font-bold text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] mb-1"
                />
              ) : (
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#292824] leading-tight">
                  {currentWorker.name}
                </h1>
              )}
              <p className="text-sm font-semibold text-[#537895]">{currentWorker.skills[0] || 'General Maintenance'}</p>
              <div className="flex items-center gap-2 text-xs text-[#77736B] mt-1 flex-wrap">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-[#B37055] text-[#B37055]" />
                  <strong className="text-[#292824]">{currentWorker.rating} ★</strong> ({currentWorker.totalReviews} {t('common.reviews', 'reviews')})
                </span>
                <span>·</span>
                <span>{t('worker.profile.experience', 'Experience:')} <strong>6+ Years</strong></span>
                <span>·</span>
                <span>{currentWorker.societyName || 'Green Residency'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isEditing) handleSaveProfile();
              else setIsEditing(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto ${
              isEditing
                ? 'bg-[#6E8B67] hover:bg-[#587352] text-white shadow-xs'
                : 'bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824]'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{t('worker.profile.saveChanges', 'Save Changes')}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('worker.profile.editProfile', 'Edit Profile')}</span>
              </>
            )}
          </button>
        </div>

        {/* Contact details row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#77736B]">{t('worker.profile.email', 'Email Address')}</span>
            {isEditing ? (
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824]"
              />
            ) : (
              <div className="flex items-center gap-2 text-[#524E47]">
                <Mail className="w-3.5 h-3.5 text-[#537895]" />
                <span className="font-medium">{currentWorker.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#77736B]">{t('worker.profile.phone', 'Phone Number')}</span>
            {isEditing ? (
              <input
                type="tel"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824]"
              />
            ) : (
              <div className="flex items-center gap-2 text-[#524E47]">
                <Phone className="w-3.5 h-3.5 text-[#537895]" />
                <span className="font-medium">{currentWorker.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1 pt-1 border-t border-[#E8E2D5]">
          <span className="text-[10px] font-bold uppercase text-[#77736B]">{t('worker.profile.tradeBio', 'About & Background')}</span>
          {isEditing ? (
            <textarea
              rows={3}
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:ring-2 focus:ring-[#537895] resize-none"
            />
          ) : (
            <p className="text-xs text-[#524E47] leading-relaxed">
              {editedBio}
            </p>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: PROFESSIONAL INFORMATION                           */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E4EDF4] text-[#324F66] flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#292824]">{t('worker.profile.personalInfo', 'Professional Information')}</h2>
          </div>
          <Badge variant="neutral" size="sm">Tier 6 Trade Specialist</Badge>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#77736B] block mb-1.5">{t('worker.profile.tradeSkills', 'Trade Skills')}</span>
            <div className="flex flex-wrap gap-2">
              {currentWorker.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[#E4EDF4] text-[#2B4C68] border border-[#B8CBDD] rounded-full text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl">
              <span className="text-[10px] text-[#77736B] block">{t('worker.profile.experience', 'Experience')}</span>
              <strong className="text-sm font-bold text-[#292824]">6+ Years</strong>
            </div>
            <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl">
              <span className="text-[10px] text-[#77736B] block">{t('worker.profile.completedJobs', 'Completed Jobs')}</span>
              <strong className="text-sm font-bold text-[#292824]">{currentWorker.completedJobs || 24}</strong>
            </div>
            <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl">
              <span className="text-[10px] text-[#77736B] block">{t('worker.profile.memberSince', 'Member Since')}</span>
              <strong className="text-sm font-bold text-[#292824]">Jan 2023</strong>
            </div>
            <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl">
              <span className="text-[10px] text-[#77736B] block">{t('worker.profile.memberId', 'Member ID')}</span>
              <strong className="text-sm font-mono font-bold text-[#292824]">
                {currentWorker.cooperativeMemberId || 'W-2024-001'}
              </strong>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase text-[#77736B] block mb-1.5">
              {t('worker.profile.certifications', 'Certificates & Trade Qualifications')}
            </span>
            <div className="space-y-1.5">
              {currentWorker.certificates.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl text-xs text-[#292824]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67] shrink-0" />
                  <span className="font-medium">{cert}</span>
                  <span className="ml-auto text-[10px] font-mono text-[#77736B]">{t('worker.profile.verifiedByBoard', 'Verified by Board')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: VERIFICATION                                      */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E6ECE4] text-[#364A32] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292824]">{t('worker.profile.verificationStatus', 'Verification Status')}</h2>
              <span className="text-xs text-[#77736B]">{t('worker.profile.trustPipeline', '5-Point Trust & Cooperative Compliance Pipeline')}</span>
            </div>
          </div>
          <Badge variant="verified" size="sm">{t('worker.profile.allVerifiedBadge', 'ALL VERIFIED ✓')}</Badge>
        </div>

        {/* 5 Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VERIFICATION_POINTS.map((item) => (
            <div key={item.label} className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6E8B67] shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-bold text-[#292824]">{item.label}</strong>
                  <span className="text-[10px] font-semibold text-[#364A32] bg-[#E6ECE4] px-1.5 py-0.2 rounded">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#77736B] mt-0.5 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-[#77736B]">
            {t('worker.profile.kycNotice', 'Managed via the Society Manager KYC verification module.')}
          </p>
          <button
            type="button"
            onClick={() => setShowVerificationModal(true)}
            className="px-3.5 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            {t('worker.profile.viewCertBtn', 'View Verification Certificate →')}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: ACCOUNT SETTINGS                                  */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAEDE8] text-[#80432E] flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#292824]">{t('worker.profile.accountSecurity', 'Account Settings')}</h2>
          </div>
          <span className="text-xs text-[#77736B]">{t('worker.profile.securitySessions', 'Security & Sessions')}</span>
        </div>

        <div className="space-y-3 divide-y divide-[#E8E2D5]">
          {/* Change Password */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-bold text-[#292824]">{t('worker.profile.changePassword', 'Change Password')}</p>
              <p className="text-[11px] text-[#77736B]">{t('worker.profile.changePasswordSub', 'Update your login passphrase regularly for security.')}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-3.5 py-1.5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              {t('worker.profile.updatePasswordBtn', 'Update Password')}
            </button>
          </div>

          {/* Login Settings / 2FA */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-bold text-[#292824]">{t('worker.profile.twoFactor', 'Login Settings (Two-Factor Authentication)')}</p>
              <p className="text-[11px] text-[#77736B]">{t('worker.profile.twoFactorSub', 'Require SMS OTP code for logins on new devices.')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTwoFactorAuth(!twoFactorAuth);
                showToast({
                  title: !twoFactorAuth ? '2FA Enabled' : '2FA Disabled',
                  message: !twoFactorAuth ? 'Two-factor SMS authentication is active.' : '2FA disabled.',
                  type: !twoFactorAuth ? 'success' : 'warning',
                });
              }}
              className="cursor-pointer text-[#6E8B67]"
            >
              {twoFactorAuth ? (
                <ToggleRight className="w-8 h-8 fill-[#6E8B67] text-[#6E8B67]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-[#9A958B]" />
              )}
            </button>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-bold text-[#292824]">{t('worker.profile.rememberDevice', 'Remember Me on This Device')}</p>
              <p className="text-[11px] text-[#77736B]">{t('worker.profile.rememberDeviceSub', 'Stay signed into the worker dashboard on this browser.')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRememberMe(!rememberMe);
                showToast({
                  title: !rememberMe ? 'Remember Me Enabled' : 'Remember Me Disabled',
                  message: !rememberMe ? 'Your session will persist on this device.' : 'Session will expire on tab close.',
                  type: 'info',
                });
              }}
              className="cursor-pointer text-[#6E8B67]"
            >
              {rememberMe ? (
                <ToggleRight className="w-8 h-8 fill-[#6E8B67] text-[#6E8B67]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-[#9A958B]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: SUPPORT                                           */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFEBF4] text-[#3D314C] flex items-center justify-center font-bold">
              <HeadphonesIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292824]">{t('worker.support.humanAgentTitle', 'Worker Support & Human Agent')}</h2>
              <span className="text-xs text-[#77736B]">{t('worker.support.supportSub', 'Human assistance for dispute resolution & job support')}</span>
            </div>
          </div>
          <Badge variant="coop" size="sm">{t('worker.support.hoursBadge', '7 AM – 10 PM IST')}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#292824]">{t('worker.support.directTollFree', 'Direct Toll-Free Helpline')}</p>
              <p className="text-[11px] text-[#537895] font-mono mt-0.5">+91 1800 200 4567</p>
              <span className="text-[10px] text-[#77736B]">{t('worker.support.dispatchNotice', 'Immediate dispatch to on-duty manager')}</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Calling Worker Support Hotline: +91 1800 200 4567')}
              className="px-3 py-1.5 bg-[#324F66] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#263D50]"
            >
              {t('worker.support.callAgent', 'Call Agent')}
            </button>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#292824]">{t('worker.support.chatDesk', 'Live Agent Chat Desk')}</p>
              <p className="text-[11px] text-[#77736B] mt-0.5">{t('worker.support.avgWaitTime', 'Average wait time: < 2 mins')}</p>
              <span className="text-[10px] text-[#6E8B67] font-semibold">{t('worker.support.agentsOnline', 'Agents Online')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="px-3 py-1.5 bg-[#6E8B67] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#587352]"
            >
              {t('worker.support.openChat', 'Open Chat')}
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={t('worker.profile.changePassword', 'Change Password')}
        subtitle={t('worker.profile.passwordModalSub', 'Secure your cooperative specialist login')}
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordChange} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              {t('worker.profile.currentPassword', 'Current Password:')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs focus:ring-2 focus:ring-[#537895]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              {t('worker.profile.newPassword', 'New Password:')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('worker.profile.passwordMinChars', 'At least 8 characters')}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs focus:ring-2 focus:ring-[#537895]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              {t('worker.profile.confirmNewPassword', 'Confirm New Password:')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('worker.profile.confirmPasswordPlaceholder', 'Confirm new password')}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs focus:ring-2 focus:ring-[#537895]"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
            <Button variant="subtle" size="sm" onClick={() => setShowPasswordModal(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {t('worker.profile.updatePasswordBtn', 'Update Password')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VERIFICATION MODAL */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title={t('worker.profile.verificationCertTitle', 'Worker Verification Certificate')}
        subtitle={t('worker.profile.trustPipelineSub', 'Verified 6-Tier Trust Pipeline')}
        maxWidth="lg"
      >
        <WorkerOnboarding />
      </Modal>

      {/* LIVE SUPPORT MODAL */}
      <Modal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        title={t('worker.support.humanAgentTitle', 'Human Agent Support Desk')}
        subtitle={t('worker.support.careSubtitle', 'Cooperative Specialist Care')}
        maxWidth="md"
      >
        <SupportPanel onClose={() => setShowSupportModal(false)} />
      </Modal>
    </div>
  );
};
