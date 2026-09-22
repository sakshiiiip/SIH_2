import React from 'react';
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

  const activeBookingsCount = bookings.filter(
    (b) => !['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  ).length;

  // 1. CUSTOMER MOBILE NAVIGATION: Home, Activity, Community
  if (currentRole === 'customer') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FCF9F3]/95 backdrop-blur-md border-t border-[#E8E2D5] shadow-float safe-bottom">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'home' ? 'text-[#445D3E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('activity')}
            className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'activity' ? 'text-[#445D3E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            {activeBookingsCount > 0 && (
              <span className="absolute top-2 right-6 w-2 h-2 rounded-full bg-[#C93B2B]" />
            )}
            <span className="text-[10px]">Activity</span>
          </button>

          <button
            onClick={() => onSelectTab('community')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'community' ? 'text-[#445D3E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Community</span>
          </button>
        </div>
      </nav>
    );
  }

  // 2. WORKER MOBILE NAVIGATION: Home, My Work, Community, Tool Bank, Profile
  if (currentRole === 'worker') {
    const isMyWorkActive =
      currentTab === 'worker_work' ||
      currentTab === 'worker_jobs' ||
      currentTab === 'worker_earnings' ||
      currentTab.startsWith('worker_job_details_');

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FCF9F3]/95 backdrop-blur-md border-t border-[#E8E2D5] shadow-float safe-bottom">
        <div className="flex items-center justify-around px-1 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('worker_dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_dashboard' ? 'text-[#324F66] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_work')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              isMyWorkActive ? 'text-[#324F66] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">My Work</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_community')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_community' ? 'text-[#364A32] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Community</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_tools')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_tools' ? 'text-[#80432E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Tool Bank</span>
          </button>

          <button
            onClick={() => onSelectTab('worker_profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'worker_profile' ? 'text-[#3D314C] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>
    );
  }

  // 3. SOCIETY MANAGER MOBILE NAVIGATION: Home, Workers, Bookings, Issues
  if (currentRole === 'society_manager') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FCF9F3]/95 backdrop-blur-md border-t border-[#E8E2D5] shadow-float safe-bottom">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('soc_dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_dashboard' ? 'text-[#80432E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('soc_verification')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_verification' ? 'text-[#80432E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <HardHat className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Workers</span>
          </button>

          <button
            onClick={() => onSelectTab('soc_disputes')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_disputes' ? 'text-[#80432E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <AlertTriangle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Issues</span>
          </button>

          <button
            onClick={() => onSelectTab('soc_fund')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'soc_fund' ? 'text-[#80432E] font-bold' : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Fund</span>
          </button>
        </div>
      </nav>
    );
  }

  // 4. PLATFORM ADMIN MOBILE NAVIGATION: Authority Portal
  if (currentRole === 'platform_admin') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#141413]/95 backdrop-blur-md border-t border-[#2A2926] shadow-float safe-bottom text-white">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('plat_dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
              currentTab === 'plat_dashboard' ? 'text-purple-300 font-bold' : 'text-[#77736B] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Central Authority</span>
          </button>
        </div>
      </nav>
    );
  }

  // 5. FEDERATION ADMIN MOBILE NAVIGATION: Home, Societies, Registration, Fund
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FCF9F3]/95 backdrop-blur-md border-t border-[#E8E2D5] shadow-float safe-bottom">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        <button
          onClick={() => onSelectTab('fed_dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_dashboard' ? 'text-[#504161] font-bold' : 'text-[#77736B] hover:text-[#292824]'
          }`}
        >
          <Network className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('fed_societies')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_societies' ? 'text-[#504161] font-bold' : 'text-[#77736B] hover:text-[#292824]'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Societies</span>
        </button>

        <button
          onClick={() => onSelectTab('fed_analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_analytics' ? 'text-[#504161] font-bold' : 'text-[#77736B] hover:text-[#292824]'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Analytics</span>
        </button>

        <button
          onClick={() => onSelectTab('fed_relief')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'fed_relief' ? 'text-[#504161] font-bold' : 'text-[#77736B] hover:text-[#292824]'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Fund</span>
        </button>
      </div>
    </nav>
  );
};
