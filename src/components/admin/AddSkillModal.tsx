import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Wrench,
  Upload,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  onSkillAdded?: (skillName: string) => void;
}

const PRIMARY_SKILLS = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Cleaner',
  'Appliance Repairs',
  'HVAC & AC Service',
  'Masonry',
  'Pest Control',
  'Gardening',
];

const SERVICE_AREAS = [
  'Baner / Pashan (Pune 411045)',
  'Aundh / Kothrud (Pune 411007)',
  'Wakad / Hinjewadi (Pune 411057)',
  'Bavdhan / Paud Rd (Pune 411021)',
  'Pune Metropolitan Area',
  'Mumbai Suburban',
  'Thane & Navi Mumbai',
];

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  workerId,
  workerName,
  onSkillAdded,
}) => {
  const { addWorkerSkill, showToast } = useCooperativeStore();

  const [primarySkill, setPrimarySkill] = useState(PRIMARY_SKILLS[0]);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [description, setDescription] = useState('');
  const [certificateFile, setCertificateFile] = useState<{ name: string; url: string } | null>(null);
  const [serviceArea, setServiceArea] = useState(SERVICE_AREAS[0]);
  const [customArea, setCustomArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate 5 MB max
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Skill Certificate file must be under 5 MB.');
      return;
    }

    setValidationError(null);
    const fakeUrl = URL.createObjectURL(file);
    setCertificateFile({
      name: file.name,
      url: fakeUrl,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation rules
    if (!primarySkill) {
      setValidationError('Please select a primary skill / trade.');
      return;
    }

    if (experienceYears < 0 || experienceYears > 50) {
      setValidationError('Years of experience must be between 0 and 50.');
      return;
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 20 || trimmedDesc.length > 500) {
      setValidationError('Skill description must be between 20 and 500 characters.');
      return;
    }

    const effectiveArea = customArea.trim() || serviceArea;
    if (!effectiveArea) {
      setValidationError('Please specify the service area.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addWorkerSkill(workerId, {
        name: primarySkill,
        experienceYears,
        description: trimmedDesc,
        certificateUrl: certificateFile?.url || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600&auto=format&fit=crop&q=80',
        certificateName: certificateFile?.name || `${primarySkill} Certificate`,
        serviceArea: effectiveArea,
      });

      setIsSubmitting(false);
      showToast({
        title: 'Skill Added Successfully',
        message: `${primarySkill} (${experienceYears} yrs) recorded for ${workerName}. Ready for Manager check.`,
        type: 'success',
      });

      if (onSkillAdded) {
        onSkillAdded(primarySkill);
      }

      // Reset form and close
      setDescription('');
      setCertificateFile(null);
      setCustomArea('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Wrench className="w-5 h-5 text-[#80432E]" />
          <span>Add Worker Skill</span>
        </div>
      }
      subtitle={`Level 2: Skill Information Record for ${workerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Purpose Banner */}
        <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-[#524E47] leading-relaxed">
          <strong className="text-[#292824] block mb-0.5">Manager-Side Skill Record:</strong>
          This form records the skilled worker's trade experience and service area for cooperative database management.
        </div>

        {validationError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Primary Skill / Trade */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            1. Primary Skill / Trade <span className="text-rose-600">*</span>
          </label>
          <select
            value={primarySkill}
            onChange={(e) => setPrimarySkill(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
          >
            {PRIMARY_SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Years of Experience */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            2. Years of Experience (0–50 years) <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={experienceYears}
            onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E]"
            placeholder="e.g. 5"
            required
          />
        </div>

        {/* 3. Skill Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              3. Skill Description (20–500 characters) <span className="text-rose-600">*</span>
            </label>
            <span className={`text-[10px] ${description.length < 20 || description.length > 500 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
              {description.length}/500 chars
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe specific trade expertise, equipment handled, problem resolution capabilities..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E] placeholder:text-slate-400"
            required
          />
        </div>

        {/* 4. Skill Certificate */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            4. Skill Certificate (Optional · JPG / JPEG / PNG / PDF, max 5 MB)
          </label>
          <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-[#80432E] shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-slate-800 block truncate">
                  {certificateFile ? certificateFile.name : 'No file selected'}
                </span>
                <span className="text-[10px] text-slate-400">Trade diploma, vocational certificate, or training card</span>
              </div>
            </div>

            <label className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#292824] rounded-lg border border-[#E8E2D5] font-bold text-xs cursor-pointer shrink-0 transition-colors">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              Choose File
            </label>
          </div>
        </div>

        {/* 5. Service Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            5. Service Area (Area / City / PIN) <span className="text-rose-600">*</span>
          </label>
          <select
            value={serviceArea}
            onChange={(e) => {
              setServiceArea(e.target.value);
              setCustomArea('');
            }}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E] mb-2"
          >
            {SERVICE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or enter custom Area / PIN code (e.g. Baner, Pune 411045)"
            value={customArea}
            onChange={(e) => setCustomArea(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80432E] placeholder:text-slate-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E2D5]">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isSubmitting}
            className="bg-[#80432E] hover:bg-[#683523] text-white"
            leftIcon={<Wrench className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Saving Skill...' : 'Save Skill Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
