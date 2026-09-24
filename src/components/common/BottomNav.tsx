import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import {
  Home,
  Activity,
  Users,
  Building2,
  Network,
  HardHat,
  Wrench,
  DollarSign,
  AlertTriangle,
  Briefcase,
  Sliders,
  ShieldAlert,
  User,
  HeadphonesIcon,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRequestService: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onRequestService,
}) => {
  const { currentRole, bookings } = useCooperativeStore();
  const { t } = useTranslation();

  const activeBookingsCount = bookings.filter(
    (b) => !['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  ).length;

  // 1. CUSTOMER MOBILE NAVIGATION
  if (currentRole === 'customer') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md safe-bottom">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.home', 'Home')}</span>
          </button>

          <button
            onClick={() => onSelectTab('activity')}
            className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'activity' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            {activeBookingsCount > 0 && (
              <span className="absolute top-2 right-6 w-2 h-2 rounded-full bg-rose-600" />
            )}
            <span className="text-[10px]">{t('nav.activity', 'Activity')}</span>
          </button>

          <button
            onClick={() => onSelectTab('community')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'community' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.community', 'Community')}</span>
          </button>

          <button
            onClick={() => onSelectTab('support')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'support' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeadphonesIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.support', 'Support')}</span>
          </button>
        </div>
      </nav>
    );
  }

  // 2. WORKER MOBILE NAVIGATION
  if (currentRole === 'worker') {
    const isMyWorkActive =
      currentTab === 'worker_work' ||
      currentTab === 'worker_jobs' ||
      currentTab === 'worker_earnings' ||
      currentTab.startsWith('worker_job_details_');

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md safe-bottom">
        <div className="flex items-center justify-around px-1 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('worker_dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_dashboard' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.home', 'Home')}</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_work')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              isMyWorkActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.myWork', 'My Work')}</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_community')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_community' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.community', 'Community')}</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_tools')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_tools' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.toolBank', 'Tool Bank')}</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_profile' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.profile', 'Profile')}</span>
          </button>
        </div>
      </nav>
    );
  }

  // 3. SOCIETY MANAGER MOBILE NAVIGATION
  if (currentRole === 'society_manager') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md safe-bottom">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('soc_dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.home', 'Home')}</span>
          </button>

          <button
            onClick={() => onSelectTab('soc_verification')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_verification' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardHat className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.workers', 'Workers')}</span>
          </button>

          <button
            onClick={() => onSelectTab('soc_disputes')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_disputes' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.issues', 'Issues')}</span>
          </button>

          <button
            onClick={() => onSelectTab('soc_fund')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_fund' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.coopFund', 'Fund')}</span>
          </button>
        </div>
      </nav>
    );
  }

  // 4. PLATFORM ADMIN MOBILE NAVIGATION
  if (currentRole === 'platform_admin') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-md safe-bottom text-white">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('plat_dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'plat_dashboard' ? 'text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.centralAuthority', 'Central Authority')}</span>
          </button>
        </div>
      </nav>
    );
  }

  // 5. FEDERATION ADMIN MOBILE NAVIGATION
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md safe-bottom">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        <button
          onClick={() => onSelectTab('fed_dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_dashboard' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Network className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.home', 'Home')}</span>
        </button>

        <button
          onClick={() => onSelectTab('fed_societies')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_societies' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.societies', 'Societies')}</span>
        </button>

        <button
          onClick={() => onSelectTab('fed_analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_analytics' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.analytics', 'Analytics')}</span>
        </button>

        <button
          onClick={() => onSelectTab('fed_relief')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_relief' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.reliefFund', 'Fund')}</span>
        </button>
      </div>
    </nav>
  );
};
