import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { UserRole } from '../../types';
import { User, HardHat, ShieldCheck, Building2, Network, PlayCircle, RotateCcw, LogOut, Lock } from 'lucide-react';

interface DemoControlBarProps {
  onOpenGuidedScenario: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({ onOpenGuidedScenario }) => {
  const { currentRole, currentUser, bookings, resetToDemoData, logout } = useCooperativeStore();
  const { t } = useTranslation();

  const activeBookingsCount = bookings.filter(
    (b) => !['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  ).length;

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'platform_admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />;
      case 'worker':
        return <HardHat className="w-3.5 h-3.5 text-[#B8CBDD]" />;
      case 'society_manager':
        return <Building2 className="w-3.5 h-3.5 text-[#E9C5B5]" />;
      case 'federation_admin':
      case 'federation_manager':
        return <Network className="w-3.5 h-3.5 text-[#C9BDD8]" />;
      default:
        return <User className="w-3.5 h-3.5 text-[#A8B9A3]" />;
    }
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'platform_admin':
        return t('roles.platform_admin', 'Platform Admin');
      case 'worker':
        return t('roles.worker', 'Worker');
      case 'society_manager':
        return t('roles.society_manager', 'Society Manager');
      case 'federation_admin':
        return t('roles.federation_admin', 'Federation Admin');
      case 'federation_manager':
        return t('roles.federation_manager', 'Federation Manager');
      default:
        return t('roles.customer', 'Customer');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 sm:px-6 lg:px-8 relative z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Role Info Badge (Role Locked - No in-session switcher) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold hidden sm:inline">
            {t('demoBar.activeRole', 'Active Role:')}
          </span>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-slate-100 font-medium">
            {getRoleIcon()}
            <span className="text-xs font-semibold">{getRoleLabel()}</span>
            <span className="text-[11px] text-slate-400 font-normal">
              ({currentUser.name.split(' ')[0]})
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              {t('demoBar.locked', 'Locked')}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Active indicator */}
          {activeBookingsCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 rounded-lg text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('demoBar.activeJobs', { count: activeBookingsCount, defaultValue: `${activeBookingsCount} active jobs` })}</span>
            </div>
          )}

          {/* Guided Scenario Demo Runner Button */}
          <button
            onClick={onOpenGuidedScenario}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded-xl font-medium transition-all shadow-xs cursor-pointer text-xs active:scale-[0.98]"
            title="Launch step-by-step interactive demonstration of Section 44 flow"
          >
            <PlayCircle className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="font-semibold">{t('demoBar.interactiveDemoWalkthrough', 'Interactive Demo Walkthrough')}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo bookings, fund ledger, and workers to default state?')) {
                resetToDemoData();
              }
            }}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset to clean demo data"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Sign Out / Change Role */}
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            title={t('nav.signOut', 'Sign out / Change role')}
            aria-label={t('nav.signOut', 'Sign out')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">{t('nav.signOut', 'Sign Out')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
