import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { INITIAL_SERVICES } from '../../store/initialData';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SahaAILogo } from '../../components/common/SahaAILogo';
import {
  CheckCircle2,
  ShieldCheck,
  Scale,
  Users,
  Coins,
  ArrowRight,
  Zap,
  Wrench,
  Sparkles,
  Hammer,
  Paintbrush,
  Cpu,
  HeartHandshake,
  Package,
  Clock,
  ShieldAlert,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onRequestService: (categoryName?: string) => void;
  onExploreServices: () => void;
  onExploreCommunity: () => void;
  onWorkerOnboarding: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRequestService,
  onExploreServices,
  onExploreCommunity,
  onWorkerOnboarding,
}) => {
  const { t } = useTranslation();
  const { setRole } = useCooperativeStore();

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-teal-700" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-sky-600" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-orange-600" />;
      case 'Paintbrush':
        return <Paintbrush className="w-5 h-5 text-indigo-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'Package':
        return <Package className="w-5 h-5 text-emerald-600" />;
      default:
        return <Users className="w-5 h-5 text-teal-700" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="pt-8 sm:pt-14 text-center max-w-4xl mx-auto px-4">
        <SahaAILogo variant="full" size="lg" className="mx-auto mb-5" />

        {/* Subtle trust pill */}
        <div className="inline-flex items-center gap-2 bg-teal-50/90 border border-teal-200/80 px-3.5 py-1.5 rounded-full text-xs font-medium text-teal-900 mb-6 shadow-xs animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          <span>{t('landing.trustPill', { defaultValue: 'सहाAI — India’s First Democratic Worker Cooperative Gig Platform' })}</span>
        </div>

        {/* Editorial Heading */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#292824] leading-[1.08]">
          {t('landing.heroTitle', { defaultValue: 'Trusted help.' })}{' '}
          <br className="hidden sm:inline" />
          <span className="text-[#445D3E] font-normal italic">{t('landing.heroSubtitle', { defaultValue: 'Powered by your community.' })}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-[#524E47] max-w-2xl mx-auto font-normal leading-relaxed">
          {t('landing.heroDescription', {
            defaultValue: 'Book verified local workers for everyday household and community services. Fair allocation, transparent pay, and neighbourhood backed.',
          })}
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <Button
            size="lg"
            variant="primary"
            onClick={() => onRequestService()}
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('landing.getService', { defaultValue: 'Get a Service' })}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setRole('worker');
              onWorkerOnboarding();
            }}
            className="w-full sm:w-auto"
          >
            {t('landing.becomeWorker', { defaultValue: 'Become a Worker' })}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 pt-8 border-t border-[#E8E2D5] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#445D3E] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#524E47]">{t('landing.verifiedWorkers', { defaultValue: 'Verified workers' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#445D3E] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#524E47]">{t('landing.fairAllocation', { defaultValue: 'Fair allocation' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#445D3E] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#524E47]">{t('landing.communityBacked', { defaultValue: 'Community backed' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#445D3E] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#524E47]">{t('landing.transparentPricing', { defaultValue: 'Transparent pricing' })}</span>
          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#292824]">
              {t('landing.everydayServices', { defaultValue: 'Everyday Services' })}
            </h2>
            <p className="text-sm sm:text-base text-[#77736B] mt-1 font-normal">
              {t('landing.everydayServicesDesc', { defaultValue: 'Select a service to match with a nearby certified cooperative technician.' })}
            </p>
          </div>
          <button
            onClick={onExploreServices}
            className="text-sm font-semibold text-[#445D3E] hover:text-[#2A3927] flex items-center gap-1 group cursor-pointer"
          >
            <span>{t('landing.viewAllCategories', { defaultValue: 'View all 9 categories' })}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {INITIAL_SERVICES.slice(0, 10).map((service) => (
            <Card
              key={service.id}
              interactive
              onClick={() => onRequestService(service.name)}
              className="p-4 sm:p-5 flex flex-col justify-between hover:border-[#CFDDD0] group transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center mb-3 group-hover:bg-[#E6ECE4] transition-colors">
                  {getServiceIcon(service.iconName)}
                </div>
                <h3 className="font-semibold text-[#292824] text-sm sm:text-base tracking-tight mb-1">
                  {t(`services.${service.name.toLowerCase().replace(/[\s/&-]+/g, '_')}.name`, { defaultValue: service.name })}
                </h3>
                <p className="text-xs text-[#77736B] line-clamp-2 leading-relaxed font-normal">
                  {t(`services.${service.name.toLowerCase().replace(/[\s/&-]+/g, '_')}.desc`, { defaultValue: service.description })}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
                <span className="text-[#77736B] font-medium">{t('landing.fromPrice', { defaultValue: 'From ₹{{price}}', price: service.basePrice })}</span>
                <span className="text-[#445D3E] font-semibold group-hover:translate-x-0.5 transition-transform">
                  {t('landing.bookAction', { defaultValue: 'Book →' })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="coop" className="mb-3">
            {t('landing.simpleTransparent', { defaultValue: 'Simple & Transparent' })}
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#292824]">
            {t('landing.howItWorks', { defaultValue: 'How It Works' })}
          </h2>
          <p className="text-[#77736B] mt-2 text-base font-normal">
            {t('landing.howItWorksDesc', { defaultValue: 'From the initial tap to guaranteed satisfaction, the cooperative journey is straightforward.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-[#FCF9F3] border-[#E8E2D5]">
            <div className="text-3xl font-mono font-semibold text-[#6E8B67]/30 mb-3 tracking-tight">
              01
            </div>
            <h3 className="text-lg font-semibold text-[#292824] mb-2 tracking-tight">{t('landing.step1Title', { defaultValue: 'Request' })}</h3>
            <p className="text-sm text-[#524E47] leading-relaxed font-normal">
              {t('landing.step1Desc', { defaultValue: 'Tell us what you need in seconds. Choose standard, urgent, or community batch modes.' })}
            </p>
          </Card>

          <Card className="relative overflow-hidden bg-[#FCF9F3] border-[#E8E2D5]">
            <div className="text-3xl font-mono font-semibold text-[#6E8B67]/30 mb-3 tracking-tight">
              02
            </div>
            <h3 className="text-lg font-semibold text-[#292824] mb-2 tracking-tight">{t('landing.step2Title', { defaultValue: 'Match' })}</h3>
            <p className="text-sm text-[#524E47] leading-relaxed font-normal">
              {t('landing.step2Desc', { defaultValue: 'Our fair AI matching engine evaluates skill, proficiency, distance, and workload balance.' })}
            </p>
          </Card>

          <Card className="relative overflow-hidden bg-[#FCF9F3] border-[#E8E2D5]">
            <div className="text-3xl font-mono font-semibold text-[#6E8B67]/30 mb-3 tracking-tight">
              03
            </div>
            <h3 className="text-lg font-semibold text-[#292824] mb-2 tracking-tight">{t('landing.step3Title', { defaultValue: 'Get it done' })}</h3>
            <p className="text-sm text-[#524E47] leading-relaxed font-normal">
              {t('landing.step3Desc', { defaultValue: 'Track arrival in real time. Verify your worker with a 4-digit OTP for peace of mind.' })}
            </p>
          </Card>

          <Card className="relative overflow-hidden bg-[#FCF9F3] border-[#E8E2D5]">
            <div className="text-3xl font-mono font-semibold text-[#6E8B67]/30 mb-3 tracking-tight">
              04
            </div>
            <h3 className="text-lg font-semibold text-[#292824] mb-2 tracking-tight">{t('landing.step4Title', { defaultValue: 'Strengthen community' })}</h3>
            <p className="text-sm text-[#524E47] leading-relaxed font-normal">
              {t('landing.step4Desc', { defaultValue: 'Every rupee is transparently split: worker earnings, society share, and emergency fund.' })}
            </p>
          </Card>
        </div>
      </section>

      {/* COOPERATIVE PILLARS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#292824] text-[#FAF7F2] rounded-3xl p-6 sm:p-12 overflow-hidden relative shadow-float">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6E8B67]/15 rounded-full blur-3xl -z-0" />

          <div className="relative z-10 max-w-3xl">
            <span className="text-[#A8B9A3] text-xs font-semibold uppercase tracking-wider">
              {t('landing.differenceTag', { defaultValue: 'The Cooperative Difference' })}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight mt-2 mb-4 leading-tight">
              {t('landing.differenceHeadline1', { defaultValue: 'Not another exploitative aggregator.' })} <br />
              <span className="text-[#CFDDD0] font-normal italic">{t('landing.differenceHeadline2', { defaultValue: 'A self-governed worker collective.' })}</span>
            </h2>
            <p className="text-[#D8D3C8] text-sm sm:text-base leading-relaxed mb-8 font-normal">
              {t('landing.differenceBody', {
                defaultValue: 'Commercial platforms take 30–40% commissions and pit workers in a race to the bottom. At Cooperative, workers are co-owners. Platform surpluses fund medical relief, quality tools, and resident society dividends.',
              })}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#383530]">
            {/* Pillar 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#CFDDD0] font-semibold text-base">
                <ShieldCheck className="w-5 h-5 text-[#8DA387]" />
                <span>{t('landing.pillar1Title', { defaultValue: 'Verified & Tested' })}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#BCB7AD] leading-relaxed font-normal">
                {t('landing.pillar1Desc', { defaultValue: '5-step verification: Aadhaar identity, address proof, ITI trade certificate, society membership, and background check.' })}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#CFDDD0] font-semibold text-base">
                <Users className="w-5 h-5 text-[#8DA387]" />
                <span>{t('landing.pillar2Title', { defaultValue: 'Community Batches' })}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#BCB7AD] leading-relaxed font-normal">
                {t('landing.pillar2Desc', { defaultValue: 'Apartment societies group maintenance requests for a 20% discount while keeping workers locally engaged.' })}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#CFDDD0] font-semibold text-base">
                <Coins className="w-5 h-5 text-[#8DA387]" />
                <span>{t('landing.pillar3Title', { defaultValue: '100% Transparent Split' })}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#BCB7AD] leading-relaxed font-normal">
                {t('landing.pillar3Desc', { defaultValue: '70% directly to worker, 5% to resident society development, and 25% into the collective safety net.' })}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={onExploreCommunity}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('landing.exploreCommunityBatches', { defaultValue: 'Explore Community Batches' })}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="bg-transparent text-white border-[#524E47] hover:bg-[#383530]"
              onClick={() => onRequestService()}
            >
              {t('landing.bookEverydayService', { defaultValue: 'Book an Everyday Service' })}
            </Button>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="text-center max-w-3xl mx-auto px-4">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#292824]">
          {t('landing.ctaTitle', { defaultValue: 'Ready for dependable, community-powered service?' })}
        </h2>
        <p className="text-[#524E47] mt-3 text-base font-normal">
          {t('landing.ctaSubtitle', { defaultValue: 'Join thousands of resident families and hundreds of certified cooperative specialists today.' })}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => onRequestService()}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('landing.requestServiceNow', { defaultValue: 'Request a Service Now' })}
          </Button>
        </div>
      </section>
    </div>
  );
};
