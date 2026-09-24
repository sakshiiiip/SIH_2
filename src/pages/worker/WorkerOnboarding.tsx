import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Users,
  MapPin,
  FileCheck,
  HardHat,
  Sparkles,
} from 'lucide-react';

export const WorkerOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const { workers, currentUser } = useCooperativeStore();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const verificationSteps = [
    {
      step: 1,
      title: t('worker.onboarding.tier1Title', 'Identity & KYC'),
      desc: t('worker.onboarding.tier1Desc', 'Government Aadhaar and residence verification'),
      status: 'VERIFIED',
      docs: t('worker.onboarding.tier1Docs', 'Aadhaar Card, PAN, Voter ID (Directly Authenticated)'),
      badge: t('worker.onboarding.tier1Badge', 'Tier 1 Certified'),
    },
    {
      step: 2,
      title: t('worker.onboarding.tier2Title', 'Cooperative Membership'),
      desc: t('worker.onboarding.tier2Desc', 'Affiliation with Baner Ward Workers Cooperative Collective'),
      status: 'VERIFIED',
      docs: t('worker.onboarding.tier2Docs', { id: currentWorker.cooperativeMemberId || 'COP-PUN-3820', defaultValue: `Coop Member ID: ${currentWorker.cooperativeMemberId || 'COP-PUN-3820'}` }),
      badge: t('worker.onboarding.tier2Badge', 'Tier 2 Active'),
    },
    {
      step: 3,
      title: t('worker.onboarding.tier3Title', 'Skill Classification'),
      desc: t('worker.onboarding.tier3Desc', 'Declared and practical trade skills'),
      status: 'VERIFIED',
      docs: currentWorker.skills.join(', '),
      badge: t('worker.onboarding.tier3Badge', 'Tier 3 Master'),
    },
    {
      step: 4,
      title: t('worker.onboarding.tier4Title', 'Certificates & Credentials'),
      desc: t('worker.onboarding.tier4Desc', 'ITI / NCVT vocational trade diploma verification'),
      status: 'VERIFIED',
      docs: currentWorker.certificates?.join(', ') || t('worker.onboarding.tier4DocsDefault', 'ITI Vocational Trade Diploma'),
      badge: t('worker.onboarding.tier4Badge', 'Tier 4 Endorsed'),
    },
    {
      step: 5,
      title: t('worker.onboarding.tier5Title', 'Proficiency Assessment'),
      desc: t('worker.onboarding.tier5Desc', 'Standardized practical troubleshooting examination'),
      status: 'VERIFIED',
      docs: t('worker.onboarding.tier5Docs', { score: currentWorker.proficiencyScore || 94, defaultValue: `Score: ${currentWorker.proficiencyScore || 94}% (Grade A Master Tier)` }),
      badge: t('worker.onboarding.tier5Badge', 'Tier 5 Passed'),
    },
    {
      step: 6,
      title: t('worker.onboarding.tier6Title', 'Local Society Verification'),
      desc: t('worker.onboarding.tier6Desc', 'Physical address & gate security verification by Society Manager'),
      status: currentWorker.localVerificationStatus === 'verified' ? 'VERIFIED' : 'PENDING',
      docs: t('worker.onboarding.tier6Docs', 'Green Residency Society Manager Endorsed'),
      badge: t('worker.onboarding.tier6Badge', 'Tier 6 Society Pass'),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#324F66] bg-[#E4EDF4] px-2.5 py-0.5 rounded-md border border-[#B8CBDD]">
            {t('worker.onboarding.credentialPassport', 'Cooperative Credential Passport')}
          </span>
          <Badge variant="verified" size="sm">{t('worker.onboarding.trustStandard', '6-Tier Trust Standard')}</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#292824]">
          {t('worker.onboarding.title', 'Worker Verification & Trust Passport')}
        </h1>
        <p className="text-xs sm:text-sm text-[#77736B] mt-1 leading-relaxed">
          {t('worker.onboarding.subtitle', 'Cooperative workers undergo a comprehensive 6-tier verification framework spanning identity, cooperative registry, vocational certifications, skill assessment, and local society management endorsement.')}
        </p>
      </div>

      {/* Verification Summary Card */}
      <Card className="p-6 bg-[#FCF9F3] border-2 border-[#CFDDD0] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentWorker.avatar}
              alt={currentWorker.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FCF9F3] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#292824]">
                  {currentWorker.name}
                </h3>
                <span className="text-xs font-bold bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] px-2.5 py-0.5 rounded-full">
                  {t('worker.onboarding.verifiedSpecialist', 'VERIFIED SPECIALIST')}
                </span>
              </div>
              <p className="text-xs text-[#77736B] mt-0.5">
                {currentWorker.skills.join(' · ')} · {currentWorker.societyName || 'Green Residency'}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#445D3E] font-bold mt-1">
                <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />
                <span>{t('worker.onboarding.milestonesFulfilled', '6/6 Verification Milestones Fulfilled')}</span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#E8E2D5] sm:pl-6">
            <span className="text-[11px] font-bold text-[#77736B] uppercase block">{t('worker.onboarding.proficiencyScore', 'Proficiency Score')}</span>
            <span className="text-3xl font-bold font-mono text-[#445D3E]">
              {currentWorker.proficiencyScore || 94}%
            </span>
            <span className="text-[10px] text-[#77736B] block">{t('worker.onboarding.gradeAMaster', 'Grade A Master')}</span>
          </div>
        </div>
      </Card>

      {/* 6-STEP VERIFICATION TIMELINE */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-extrabold text-[#292824]">{t('worker.onboarding.tiersTitle', 'The 6 Verification Tiers')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verificationSteps.map((s) => (
            <Card key={s.step} className="p-5 flex flex-col justify-between space-y-3 bg-[#FCF9F3] border-[#E8E2D5] shadow-card">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] font-bold font-mono text-xs flex items-center justify-center">
                      {s.step}
                    </span>
                    <h4 className="font-bold text-[#292824] text-sm">{s.title}</h4>
                  </div>
                  <Badge variant={s.status === 'VERIFIED' ? 'verified' : 'pending'} size="sm">
                    {s.status === 'VERIFIED' ? t('common.verified', 'Verified') : t('common.pending', 'Pending')}
                  </Badge>
                </div>
                <p className="text-xs text-[#77736B]">{s.desc}</p>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#524E47] font-mono border border-[#E8E2D5]">
                {s.docs}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
