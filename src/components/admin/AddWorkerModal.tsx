import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { workerAuthService } from '../../services/workerAuthService';
import { AddSkillModal } from './AddSkillModal';
import {
  X,
  UserPlus,
  Lock,
  Mail,
  Phone,
  HardHat,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Key,
  Upload,
  Calendar,
  User,
  MapPin,
  FileText,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../common/Button';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  societyId: string;
  societyName: string;
  onWorkerAdded?: (workerId: string) => void;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen,
  onClose,
  societyId,
  societyName,
  onWorkerAdded,
}) => {
  const { addWorker, societies, workers, showToast } = useCooperativeStore();

  // Generate unique Worker ID & 20+ character default secure password
  const nextWorkerNum = workers.length + 1;
  const defaultWorkerId = `WRK${String(nextWorkerNum).padStart(3, '0')}`;

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let pass = 'CoopSecure@';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass; // 23 characters total
  };

  // Level 1: Personal KYC Form State
  const [profilePhoto, setProfilePhoto] = useState<string>('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80');
  const [profilePhotoName, setProfilePhotoName] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1992-05-15');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(generateSecurePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSocietyId, setSelectedSocietyId] = useState(societyId || 'soc_gr');

  React.useEffect(() => {
    if (societyId) {
      setSelectedSocietyId(societyId);
    }
  }, [societyId, isOpen]);

  const [aadhaarCardName, setAadhaarCardName] = useState('');
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('411045');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Success summary state (Level 1 completed)
  const [createdWorkerSummary, setCreatedWorkerSummary] = useState<{
    workerId: string;
    name: string;
    email: string;
    phone: string;
    tempPassword: string;
    societyName: string;
  } | null>(null);

  // Level 2 Add Skill modal trigger
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSelectedSociety =
    societies.find((s) => s.id === selectedSocietyId) ||
    societies.find((s) => s.id === societyId) ||
    societies.find((s) => s.name.toLowerCase() === societyName?.toLowerCase()) ||
    societies[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Profile Photo must be less than 5 MB.');
      return;
    }
    setProfilePhotoName(file.name);
    setProfilePhoto(URL.createObjectURL(file));
    setValidationError(null);
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Aadhaar Card document must be less than 5 MB.');
      return;
    }
    setAadhaarCardName(file.name);
    setAadhaarCardUrl(URL.createObjectURL(file));
    setValidationError(null);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Full Name: 2-60 characters
    if (fullName.trim().length < 2 || fullName.trim().length > 60) {
      setValidationError('Full Name must be between 2 and 60 characters.');
      return;
    }

    // Phone: exactly 10 digits
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setValidationError('Phone Number must be exactly 10 digits.');
      return;
    }

    // Email
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    // Password: min 20 characters
    if (password.length < 20) {
      setValidationError('Password must be minimum 20 characters.');
      return;
    }

    // Aadhaar Number: exactly 12 digits
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setValidationError('Aadhaar Number must be exactly 12 digits.');
      return;
    }

    // PIN Code: exactly 6 digits
    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setValidationError('PIN Code must be exactly 6 digits.');
      return;
    }

    // Address
    if (!address.trim() || address.trim().length < 5) {
      setValidationError('Please enter a complete residential address.');
      return;
    }

    // Emergency Contact Name
    if (!emergencyName.trim()) {
      setValidationError('Please provide an emergency contact person name.');
      return;
    }

    // Emergency Contact Number: exactly 10 digits
    const cleanEmergencyPhone = emergencyPhone.replace(/\D/g, '');
    if (cleanEmergencyPhone.length !== 10) {
      setValidationError('Emergency contact phone number must be exactly 10 digits.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const workerIdToUse = `WRK${String(workers.length + 1).padStart(3, '0')}`;

      // 1. Register in worker auth vault
      workerAuthService.createWorkerByManager({
        name: fullName.trim(),
        email: email.trim(),
        phone: `+91 ${cleanPhone}`,
        workerId: workerIdToUse,
        skills: [],
        experience: 'Skilled Tradesperson',
        societyId: currentSelectedSociety.id,
        societyName: currentSelectedSociety.name,
        temporaryPassword: password,
      });

      // 2. Add to cooperative store (Personal KYC = VERIFIED, 0 skills yet -> not customer visible yet)
      const newWorker = addWorker({
        id: workerIdToUse,
        name: fullName.trim(),
        email: email.trim(),
        phone: `+91 ${cleanPhone}`,
        avatar: profilePhoto,
        gender,
        dob,
        aadhaarNumber: cleanAadhaar,
        aadhaarCardUrl: aadhaarCardUrl || 'https://images.unsplash.com/photo-1633409381658-a0c21b3dc704?w=600&auto=format&fit=crop&q=80',
        address: address.trim(),
        pinCode: cleanPin,
        emergencyContactName: emergencyName.trim(),
        emergencyContactNumber: `+91 ${cleanEmergencyPhone}`,
        personalKycStatus: 'VERIFIED',
        personalKycVerifiedBy: 'Society Manager',
        personalKycVerifiedAt: new Date().toISOString().split('T')[0],
        societyId: currentSelectedSociety.id,
        societyName: currentSelectedSociety.name,
        skills: [],
        skillEntries: [],
        verificationStatus: 'PENDING', // NOT customer-visible until at least 1 skill is verified
        bio: `Cooperative worker profile for ${fullName.trim()} registered under ${currentSelectedSociety.name}.`,
      });

      setIsLoading(false);

      setCreatedWorkerSummary({
        workerId: workerIdToUse,
        name: fullName.trim(),
        email: email.trim(),
        phone: `+91 ${cleanPhone}`,
        tempPassword: password,
        societyName: currentSelectedSociety.name,
      });

      if (onWorkerAdded) {
        onWorkerAdded(newWorker.id);
      }
    }, 500);
  };

  const handleResetAndClose = () => {
    setCreatedWorkerSummary(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setAadhaarNumber('');
    setAddress('');
    setEmergencyName('');
    setEmergencyPhone('');
    setPassword(generateSecurePassword());
    setValidationError(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E2D5] flex items-center justify-between sticky top-0 bg-[#FCF9F3]/95 backdrop-blur z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAEDE8] border border-[#F3C5B8] flex items-center justify-center text-[#80432E]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#292824]">
                  {createdWorkerSummary ? 'Worker Profile Created (Personal KYC Verified)' : 'Level 1: Personal KYC & Profile Creation'}
                </h2>
                <p className="text-xs text-[#77736B]">
                  Manager Verification Desk · {currentSelectedSociety.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-lg text-[#9A958B] hover:text-[#292824] hover:bg-[#F3EEE4] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {createdWorkerSummary ? (
            /* SUCCESS VIEW AFTER LEVEL 1: PERSONAL KYC VERIFIED */
            <div className="p-5 sm:p-6 space-y-5 text-xs">
              <div className="p-4 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#445D3E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm font-bold text-[#2A3927] block">
                    Level 1 Personal KYC Complete & Profile Created!
                  </strong>
                  <p className="text-xs text-[#524E47] mt-0.5 leading-relaxed">
                    Personal identity documents verified. <strong>Note:</strong> Worker is not customer-visible yet until at least one verified skill is added.
                  </p>
                </div>
              </div>

              {/* Status Box */}
              <div className="p-4 bg-white border border-[#E8E2D5] rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Worker Profile</span>
                    <h3 className="text-sm font-bold text-slate-900">{createdWorkerSummary.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">#{createdWorkerSummary.workerId}</span>
                  </div>
                  <span className="px-3 py-1 bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] rounded-xl text-xs font-bold">
                    Personal KYC: ✓ VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Phone:</span>
                    <strong>{createdWorkerSummary.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email:</span>
                    <strong>{createdWorkerSummary.email}</strong>
                  </div>
                </div>

                {/* Secure Password Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Generated Portal Password (20+ chars)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdWorkerSummary.tempPassword, 'password')}
                      className="text-xs text-[#80432E] hover:underline font-bold flex items-center gap-1"
                    >
                      {copiedField === 'password' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'password' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-800 break-all block">
                    {createdWorkerSummary.tempPassword}
                  </span>
                </div>
              </div>

              {/* Prominent "+ Add Skill" CTA */}
              <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#80432E] block">Level 2: Add Worker Trade Skills</span>
                  <p className="text-[11px] text-slate-600">
                    Add primary skills, trade experience, and service area to enable customer visibility.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAddSkillOpen(true)}
                  className="bg-[#80432E] hover:bg-[#683523] text-white shrink-0"
                  leftIcon={<Wrench className="w-4 h-4" />}
                >
                  + Add Skill
                </Button>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#E8E2D5]">
                <Button variant="outline" size="sm" onClick={handleResetAndClose}>
                  Done & Return to Roster
                </Button>
              </div>
            </div>
          ) : (
            /* LEVEL 1: PERSONAL KYC FORM */
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. Profile Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Profile Photo (JPG / JPEG / PNG, max 5 MB) <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <img
                    src={profilePhoto}
                    alt="Worker Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 block truncate text-xs">
                      {profilePhotoName || 'Default cooperative profile avatar'}
                    </span>
                    <span className="text-[10px] text-slate-400">Clear frontal face photograph</span>
                  </div>
                  <label className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#292824] rounded-lg border border-[#E8E2D5] font-bold text-xs cursor-pointer shrink-0 transition-colors">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    Upload Photo
                  </label>
                </div>
              </div>

              {/* 2. Full Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Full Name (2–60 characters) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={60}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Gender <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* 4. DOB & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Date of Birth <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5. Phone Number (exactly 10 digits) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Email ID & 7. Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6. Email ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="worker@coop.org"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      7. Password (min 20 chars) <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateSecurePassword())}
                      className="text-[10px] text-[#80432E] hover:underline font-bold"
                    >
                      Generate New
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={20}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 8. Society / Cooperative */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  8. Society / Cooperative <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                >
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. Aadhaar Card File & 10. Aadhaar Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    9. Aadhaar Card (JPG / PNG / PDF, max 5 MB) <span className="text-rose-600">*</span>
                  </label>
                  <div className="p-2.5 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 truncate font-medium">
                      {aadhaarCardName || 'UIDAI document file'}
                    </span>
                    <label className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#292824] rounded-lg border border-[#E8E2D5] font-bold text-[11px] cursor-pointer shrink-0 transition-colors">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleAadhaarUpload}
                        className="hidden"
                      />
                      Upload
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    10. Aadhaar Number (exactly 12 digits) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456789012"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>
              </div>

              {/* 11. Residential Address & 12. PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    11. Residential Address <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Room/Flat No, Chawl/Colony, Sector/Ward..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    12. PIN Code (6 digits) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="411045"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>
              </div>

              {/* 13. Emergency Contact Name & 14. Emergency Contact Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    13. Emergency Contact Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Spouse / Parent / Next of kin"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    14. Emergency Contact Number (10 digits) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9820011223"
                      className="w-full pl-12 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Submission */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E2D5]">
                <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#80432E] hover:bg-[#683523] text-white"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  {isLoading ? 'Creating Profile...' : 'Complete Level 1 & Create Profile'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Level 2 Add Skill Modal */}
      {createdWorkerSummary && (
        <AddSkillModal
          isOpen={isAddSkillOpen}
          onClose={() => setIsAddSkillOpen(false)}
          workerId={createdWorkerSummary.workerId}
          workerName={createdWorkerSummary.name}
          onSkillAdded={() => {
            showToast({
              title: 'Trade Skill Recorded',
              message: `Trade skill recorded for ${createdWorkerSummary.name}. Society Manager can now verify the skill.`,
              type: 'success',
            });
          }}
        />
      )}
    </>
  );
};
