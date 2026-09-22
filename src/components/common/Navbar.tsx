import React, { useState, useRef, useEffect } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import {
  Bell,
  Sparkles,
  LogOut,
  ChevronDown,
  User,
  HardHat,
  ShieldCheck,
  Building2,
  Network,
  HelpCircle,
  FileText,
  Briefcase,
  Activity,
  MessageSquare,
  Wrench,
  DollarSign,
  Users,
  Sliders,
  RotateCcw,
  HeadphonesIcon,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onRequestService: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNotifications,
  onRequestService,
}) => {
  const { currentRole, currentUser, notifications, logout, resetToDemoData } = useCooperativeStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'platform_admin':
        return 'Platform Admin';
      case 'worker':
        return 'Worker';
      case 'society_manager':
        return 'Society Manager';
      case 'federation_admin':
      case 'federation_manager':
        return 'Federation Admin';
      default:
        return 'Customer';
    }
  };

  const getRoleBadgeVariant = () => {
    switch (currentRole) {
      case 'platform_admin':
        return 'bg-[#141413] text-purple-200 border-[#2A2926]';
      case 'worker':
        return 'bg-[#E4EDF4] text-[#263D50] border-[#CDE0EC]';
      case 'society_manager':
        return 'bg-[#FAEDE8] text-[#643222] border-[#F4DCD3]';
      case 'federation_admin':
      case 'federation_manager':
        return 'bg-[#EFEBF4] text-[#3D314C] border-[#DFD8E8]';
      default:
        return 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]';
    }
  };

  const handleHomeClick = () => {
    if (currentRole === 'platform_admin') onSelectTab('plat_dashboard');
    else if (currentRole === 'worker') onSelectTab('worker_dashboard');
    else if (currentRole === 'society_manager') onSelectTab('soc_dashboard');
    else if (currentRole === 'federation_admin' || currentRole === 'federation_manager') onSelectTab('fed_dashboard');
    else onSelectTab('home');
  };

  return (
    <header className="bg-[#FCF9F3]/95 backdrop-blur-md border-b border-[#E8E2D5] sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#6E8B67] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-[#587352] transition-colors">
              <span className="tracking-tighter font-extrabold">C</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl text-[#292824] tracking-tight leading-none">
                  Cooperative
                </span>
                <span className="bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] text-[10px] font-semibold px-1.5 py-0.2 rounded-full font-mono">
                  FAIR GIG
                </span>
              </div>
              <span className="text-[11px] text-[#9A958B] font-medium leading-none block mt-0.5">
                Community-backed platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links — SIMPLIFIED ACCORDING TO SPECIFICATION */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#524E47]">
            {/* 1. CUSTOMER TABS: Home, Activity, Community */}
            {currentRole === 'customer' && (
              <>
                <button
                  onClick={() => onSelectTab('home')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'home'
                      ? 'text-[#2A3927] bg-[#E6ECE4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onSelectTab('activity')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'activity'
                      ? 'text-[#2A3927] bg-[#E6ECE4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => onSelectTab('community')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'community'
                      ? 'text-[#2A3927] bg-[#E6ECE4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Community
                </button>
                <button
                  onClick={() => onSelectTab('support')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentTab === 'support'
                      ? 'text-[#2A3927] bg-[#E6ECE4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  <HeadphonesIcon className="w-3.5 h-3.5 text-[#537895]" />
                  <span>Support</span>
                </button>
              </>
            )}

            {/* 2. WORKER TABS: Home, My Work, Community, Earnings */}
            {currentRole === 'worker' && (
              <>
                <button
                  onClick={() => onSelectTab('worker_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_dashboard'
                      ? 'text-[#1C2C3A] bg-[#E4EDF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onSelectTab('worker_work')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_work' || currentTab === 'worker_jobs' || currentTab === 'worker_earnings' || currentTab.startsWith('worker_job_details_')
                      ? 'text-[#1C2C3A] bg-[#E4EDF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  My Work
                </button>
                <button
                  onClick={() => onSelectTab('worker_community')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_community'
                      ? 'text-[#1C2C3A] bg-[#E4EDF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Community
                </button>
                <button
                  onClick={() => onSelectTab('worker_tools')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_tools'
                      ? 'text-[#1C2C3A] bg-[#E4EDF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Tool Bank
                </button>
                <button
                  onClick={() => onSelectTab('worker_profile')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_profile'
                      ? 'text-[#1C2C3A] bg-[#E4EDF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Profile
                </button>
              </>
            )}

            {/* 3. SOCIETY MANAGER TABS: Home, Workers, Bookings, Issues, More */}
            {currentRole === 'society_manager' && (
              <>
                <button
                  onClick={() => onSelectTab('soc_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'soc_dashboard'
                      ? 'text-[#492316] bg-[#FAEDE8] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onSelectTab('soc_verification')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'soc_verification'
                      ? 'text-[#492316] bg-[#FAEDE8] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Workers
                </button>
                <button
                  onClick={() => onSelectTab('soc_disputes')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'soc_disputes'
                      ? 'text-[#492316] bg-[#FAEDE8] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Issues
                </button>

                {/* More Dropdown for Secondary Tools */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="px-3 py-1.5 rounded-xl text-[#524E47] hover:text-[#292824] hover:bg-[#F3EEE4] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-dropdown py-1 z-40 animate-fade-in">
                      <button
                        onClick={() => {
                          onSelectTab('soc_fund');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAEDE8] flex items-center gap-2 text-[#524E47]"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-[#80432E]" />
                        <span>Cooperative Fund</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('community');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAEDE8] flex items-center gap-2 text-[#524E47]"
                      >
                        <Users className="w-3.5 h-3.5 text-[#80432E]" />
                        <span>Community Hub</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('soc_matching');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAEDE8] flex items-center gap-2 text-[#524E47]"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#80432E]" />
                        <span>Matching Engine</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 4. FEDERATION ADMIN TABS: Home, Societies, Analytics, Resources, More */}
            {(currentRole === 'federation_admin' || currentRole === 'federation_manager') && (
              <>
                <button
                  onClick={() => onSelectTab('fed_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'fed_dashboard'
                      ? 'text-[#3D314C] bg-[#EFEBF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onSelectTab('fed_societies')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'fed_societies'
                      ? 'text-[#3D314C] bg-[#EFEBF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Societies
                </button>
                <button
                  onClick={() => onSelectTab('fed_analytics')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'fed_analytics'
                      ? 'text-[#3D314C] bg-[#EFEBF4] font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Analytics
                </button>

                {/* More Dropdown for Federation Secondary Tools */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="px-3 py-1.5 rounded-xl text-[#524E47] hover:text-[#292824] hover:bg-[#F3EEE4] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-dropdown py-1 z-40 animate-fade-in">
                      <button
                        onClick={() => {
                          onSelectTab('fed_relief');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#EFEBF4] flex items-center gap-2 text-[#524E47]"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-[#504161]" />
                        <span>Central Relief Fund</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('fed_toolbank');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#EFEBF4] flex items-center gap-2 text-[#524E47]"
                      >
                        <Wrench className="w-3.5 h-3.5 text-[#504161]" />
                        <span>Shared Tool Bank</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('fed_matching');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#EFEBF4] flex items-center gap-2 text-[#524E47]"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#504161]" />
                        <span>Matching Preferences</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 5. PLATFORM ADMIN TABS: Portal only (Reviews submitted applications) */}
            {currentRole === 'platform_admin' && (
              <>
                <button
                  onClick={() => onSelectTab('plat_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'plat_dashboard'
                      ? 'text-purple-900 bg-purple-100 font-bold'
                      : 'hover:text-[#292824] hover:bg-[#F3EEE4]'
                  }`}
                >
                  Central Authority
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Action Icons: Notification Center + User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2.5 rounded-xl text-[#524E47] hover:text-[#292824] hover:bg-[#F3EEE4] relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C93B2B] ring-2 ring-[#FCF9F3]" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-2xl border border-[#E8E2D5] bg-[#FAF7F2] hover:bg-[#F3EEE4] transition-colors focus:outline-none cursor-pointer"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-[#E8E2D5]"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-[#292824] block leading-none truncate max-w-[120px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#77736B] leading-none block mt-0.5 font-medium">
                  {getRoleLabel()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9A958B]" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#FCF9F3] rounded-2xl shadow-dropdown border border-[#E8E2D5] py-2 z-40 animate-fade-in divide-y divide-[#E8E2D5]">
                <div className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block mb-1.5 ${getRoleBadgeVariant()}`}>
                    {getRoleLabel()}
                  </span>
                  <div className="font-bold text-sm text-[#292824]">{currentUser.name}</div>
                  <div className="text-xs text-[#77736B] truncate mt-0.5">{currentUser.email}</div>
                  <div className="text-[11px] text-[#80432E] font-medium mt-1">
                    {currentUser.societyName || currentUser.federationName || 'Cooperative'}
                  </div>
                </div>

                <div className="py-1 text-xs text-[#524E47]">
                  <button
                    onClick={() => {
                      onSelectTab('support');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#F3EEE4] flex items-center gap-2 cursor-pointer font-semibold text-[#292824]"
                  >
                    <HeadphonesIcon className="w-4 h-4 text-[#537895]" />
                    <span>Direct Human Support</span>
                  </button>

                  <button
                    onClick={() => {
                      resetToDemoData();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#F3EEE4] flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#77736B]" />
                    <span>Reset Demo Data</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-[#C93B2B] hover:bg-[#FAEDE8] flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Switch Persona</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
