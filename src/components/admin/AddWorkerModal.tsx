import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { workerAuthService } from '../../services/workerAuthService';
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
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { Button } from '../common/Button';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  societyId: string;
  societyName: string;
  onWorkerAdded?: (workerId: string) => void;
}

const COMMON_SKILLS = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Appliance Repairs',
  'HVAC & AC Service',
  'Masonry',
];

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen,
  onClose,
  societyId,
  societyName,
  onWorkerAdded,
}) => {
  const { addWorker, workers, showToast } = useCooperativeStore();

  // Generate next default Worker ID
  const nextWorkerNum = workers.length + 1;
  const defaultWorkerId = `WRK${String(nextWorkerNum).padStart(3, '0')}`;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [workerId, setWorkerId] = useState(defaultWorkerId);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Plumbing']);
  const [customSkill, setCustomSkill] = useState('');
  const [experience, setExperience] = useState('3-5 years');
  const [tempPassword, setTempPassword] = useState(`TempPass@${Math.floor(100 + Math.random() * 900)}`);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Success summary state
  const [createdCredentials, setCreatedCredentials] = useState<{
    workerId: string;
    name: string;
    email: string;
    phone: string;
    tempPassword: string;
    skills: string[];
    societyName: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !tempPassword.trim()) {
      showToast({
        title: 'Validation Error',
        message: 'Please fill out all required fields.',
        type: 'warning',
      });
      return;
    }

    if (selectedSkills.length === 0) {
      showToast({
        title: 'Validation Error',
        message: 'Please select at least one skill or trade.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Create in Worker Auth Vault
      const authResult = workerAuthService.createWorkerByManager({
        name: fullName,
        email,
        phone,
        workerId,
        skills: selectedSkills,
        experience,
        societyId,
        societyName,
        temporaryPassword: tempPassword,
      });

      if (!authResult.success) {
        setIsLoading(false);
        showToast({
          title: 'Registration Error',
          message: authResult.error || 'Failed to register worker.',
          type: 'warning',
        });
        return;
      }

      // 2. Add to cooperative store
      addWorker({
        id: workerId,
        name: fullName,
        email,
        phone,
        skills: selectedSkills,
        profession: selectedSkills[0],
        societyId,
        societyName,
        verificationStatus: 'PENDING',
        bio: `${experience} experience in ${selectedSkills.join(', ')}. Registered by Society Management.`,
      });

      setIsLoading(false);

      // 3. Display credentials summary
      setCreatedCredentials({
        workerId,
        name: fullName,
        email,
        phone,
        tempPassword,
        skills: selectedSkills,
        societyName,
      });

      if (onWorkerAdded) {
        onWorkerAdded(workerId);
      }
    }, 600);
  };

  const handleResetAndClose = () => {
    setCreatedCredentials(null);
    setFullName('');
    setEmail('');
    setPhone('+91 ');
    setWorkerId(`WRK${String(workers.length + 2).padStart(3, '0')}`);
    setTempPassword(`TempPass@${Math.floor(100 + Math.random() * 900)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8E2D5] flex items-center justify-between sticky top-0 bg-[#FCF9F3]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAEDE8] border border-[#F3C5B8] flex items-center justify-center text-[#80432E]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#292824]">
                {createdCredentials ? 'Worker Credentials Generated' : 'Add New Cooperative Worker'}
              </h2>
              <p className="text-xs text-[#77736B]">
                Society Manager Desk · {societyName}
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

        {/* Content */}
        {createdCredentials ? (
          /* SUCCESS SUMMARY & CREDENTIALS ISSUED */
          <div className="p-5 sm:p-6 space-y-6">
            <div className="p-4 bg-[#EEF4FA] border border-[#B8CBDD] rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#537895] shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-[#324F66] block">
                  Worker Account Successfully Created!
                </strong>
                <p className="text-xs text-[#537895] mt-1 leading-relaxed">
                  Provide these credentials to the worker. When they log in to the Worker Portal,
                  the system will immediately require them to set their permanent password.
                </p>
              </div>
            </div>

            {/* Credential Card */}
            <div className="p-5 bg-white border border-[#E8E2D5] rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#80432E]">
                    Assigned Worker
                  </span>
                  <h3 className="text-base font-bold text-[#292824]">
                    {createdCredentials.name}
                  </h3>
                  <span className="text-xs text-[#77736B]">
                    {createdCredentials.skills.join(' · ')}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]">
                  Pending First Login
                </span>
              </div>

              {/* Worker ID Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider">
                  Worker ID
                </label>
                <div className="flex items-center justify-between bg-[#F8F4EC] border border-[#E8E2D5] rounded-xl px-3.5 py-2.5">
                  <span className="font-mono text-sm font-bold text-[#292824]">
                    {createdCredentials.workerId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.workerId, 'workerId')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#537895] hover:text-[#324F66]"
                  >
                    {copiedField === 'workerId' ? <Check className="w-3.5 h-3.5 text-[#364A32]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'workerId' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider">
                  Registered Email
                </label>
                <div className="flex items-center justify-between bg-[#F8F4EC] border border-[#E8E2D5] rounded-xl px-3.5 py-2.5">
                  <span className="font-mono text-xs font-semibold text-[#292824]">
                    {createdCredentials.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.email, 'email')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#537895] hover:text-[#324F66]"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#364A32]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Temporary Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3 h-3 text-[#B37055]" />
                  <span>Temporary Password</span>
                </label>
                <div className="flex items-center justify-between bg-[#FAEDE8] border border-[#F3C5B8] rounded-xl px-3.5 py-2.5">
                  <span className="font-mono text-sm font-bold text-[#80432E]">
                    {createdCredentials.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdCredentials.tempPassword, 'tempPassword')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#80432E] hover:text-[#50281A]"
                  >
                    {copiedField === 'tempPassword' ? <Check className="w-3.5 h-3.5 text-[#364A32]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'tempPassword' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="w-full bg-[#B37055] hover:bg-[#9C583E] text-white py-3"
                onClick={handleResetAndClose}
              >
                Done & View in Roster
              </Button>
            </div>
          </div>
        ) : (
          /* ADD WORKER FORM */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Hierarchy banner */}
            <div className="flex items-center justify-between p-3 bg-[#FAEDE8] border border-[#F3C5B8] rounded-xl text-xs text-[#80432E]">
              <span className="font-semibold">Cooperative Hierarchy:</span>
              <span className="font-mono font-bold text-[11px]">
                Federation → Society Manager → Worker Account
              </span>
            </div>

            {/* Row 1: Full Name & Worker ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#524E47] block mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#524E47] block mb-1 uppercase tracking-wider">
                  Worker ID *
                </label>
                <input
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value.toUpperCase())}
                  placeholder="WRK004"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm font-mono font-bold text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  required
                />
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#524E47] block mb-1 uppercase tracking-wider">
                  Official / Contact Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@worker.coop"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#524E47] block mb-1 uppercase tracking-wider">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98234 56789"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Society & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#524E47] block mb-1 uppercase tracking-wider">
                  Society / Cooperative
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={societyName}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-sm font-medium text-[#77736B] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#524E47] block mb-1 uppercase tracking-wider">
                  Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                >
                  <option value="1-2 years">1 - 2 years</option>
                  <option value="3-5 years">3 - 5 years</option>
                  <option value="5-10 years">5 - 10 years</option>
                  <option value="10+ years">10+ years (Master Craftsman)</option>
                </select>
              </div>
            </div>

            {/* Row 4: Skills Selection */}
            <div>
              <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                Skills / Trade Specialization *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] font-bold'
                          : 'bg-white text-[#77736B] border border-[#E8E2D5] hover:border-[#CFDDD0]'
                      }`}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Temporary Password */}
            <div className="pt-2 border-t border-[#E8E2D5]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#524E47] uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#80432E]" />
                  <span>Temporary Password (Issued to Worker) *</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setTempPassword(`TempPass@${Math.floor(100 + Math.random() * 900)}`)
                  }
                  className="text-[11px] font-bold text-[#80432E] hover:underline cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm font-mono text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A958B] hover:text-[#524E47]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#77736B] mt-1">
                The worker must enter this temporary password upon first login and will then be forced to set their permanent password.
              </p>
            </div>

            {/* Submit & Cancel */}
            <div className="flex gap-3 pt-3">
              <Button
                variant="outline"
                type="button"
                className="flex-1"
                onClick={handleResetAndClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#B37055] hover:bg-[#9C583E] text-white"
              >
                {isLoading ? 'Creating Account...' : 'Add Worker & Issue Credentials'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
