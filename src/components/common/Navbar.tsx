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
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { SahaAILogo } from './SahaAILogo';

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
  const { t, i18n } = useTranslation();
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
        return t('demoUsers.platformAdmin', 'Platform Admin');
      case 'worker':
        return t('demoUsers.cooperativeWorker', 'Cooperative Worker');
      case 'society_manager':
        return t('demoUsers.societyManager', 'Society Manager');
      case 'federation_admin':
      case 'federation_manager':
        return t('demoUsers.federationManager', 'Federation Manager');
      default:
        return t('demoUsers.customer', 'Customer');
    }
  };

  const displayName = currentUser.name.includes('Priya')
    ? t('demoUsers.priyaPatel', currentUser.name)
    : currentUser.name;

  const getRoleBadgeVariant = () => {
    switch (currentRole) {
      case 'platform_admin':
        return 'bg-[#EFEBF4] text-[#504161] border-[#D5CBE5]';
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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleHomeClick}
            className="flex items-center text-left group focus:outline-none cursor-pointer py-1"
            aria-label="सहाAI Home"
          >
            <SahaAILogo variant="navbar" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            {/* 1. CUSTOMER TABS */}
            {currentRole === 'customer' && (
              <>
                <button
                  onClick={() => onSelectTab('home')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'home'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.home', 'Home')}
                </button>
                <button
                  onClick={() => onSelectTab('activity')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'activity'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.activity', 'Activity')}
                </button>
                <button
                  onClick={() => onSelectTab('community')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'community'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.community', 'Community')}
                </button>
                <button
                  onClick={() => onSelectTab('support')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentTab === 'support'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <HeadphonesIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('nav.support', 'Support')}</span>
                </button>
              </>
            )}

            {/* 2. WORKER TABS */}
            {currentRole === 'worker' && (
              <>
                <button
                  onClick={() => onSelectTab('worker_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_dashboard'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.home', 'Home')}
                </button>
                <button
                  onClick={() => onSelectTab('worker_work')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_work' || currentTab === 'worker_jobs' || currentTab === 'worker_earnings' || currentTab.startsWith('worker_job_details_')
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.myWork', 'My Work')}
                </button>
                <button
                  onClick={() => onSelectTab('worker_community')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_community'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.community', 'Community')}
                </button>
                <button
                  onClick={() => onSelectTab('worker_tools')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_tools'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.toolBank', 'Tool Bank')}
                </button>
                <button
                  onClick={() => onSelectTab('worker_profile')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'worker_profile'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.profile', 'Profile')}
                </button>
              </>
            )}

            {/* 3. SOCIETY MANAGER TABS */}
            {currentRole === 'society_manager' && (
              <>
                <button
                  onClick={() => onSelectTab('soc_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'soc_dashboard'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.home', 'Home')}
                </button>
                <button
                  onClick={() => onSelectTab('soc_verification')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'soc_verification'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.workers', 'Workers')}
                </button>
                <button
                  onClick={() => onSelectTab('soc_disputes')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'soc_disputes'
                      ? 'text-emerald-800 bg-emerald-50 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.issues', 'Issues')}
                </button>

                {/* More Dropdown */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('nav.more', 'More')}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-md py-1 z-40 animate-fade-in">
                      <button
                        onClick={() => {
                          onSelectTab('soc_fund');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('nav.coopFund', 'Cooperative Fund')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('community');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('nav.communityHub', 'Community Hub')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('soc_matching');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('nav.matchingEngine', 'Matching Engine')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 4. FEDERATION ADMIN TABS */}
            {(currentRole === 'federation_admin' || currentRole === 'federation_manager') && (
              <>
                <button
                  onClick={() => onSelectTab('fed_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'fed_dashboard'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.home', 'Home')}
                </button>
                <button
                  onClick={() => onSelectTab('fed_societies')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'fed_societies'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.societies', 'Societies')}
                </button>
                <button
                  onClick={() => onSelectTab('fed_analytics')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'fed_analytics'
                      ? 'text-slate-900 bg-slate-100 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.analytics', 'Analytics')}
                </button>

                {/* More Dropdown */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('nav.more', 'More')}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-md py-1 z-40 animate-fade-in">
                      <button
                        onClick={() => {
                          onSelectTab('fed_relief');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                        <span>{t('nav.reliefFund', 'Central Relief Fund')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('fed_toolbank');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Wrench className="w-3.5 h-3.5 text-purple-600" />
                        <span>{t('nav.sharedTools', 'Shared Tool Bank')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('fed_matching');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-600" />
                        <span>{t('nav.matchingPreferences', 'Matching Preferences')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 5. PLATFORM ADMIN TABS */}
            {currentRole === 'platform_admin' && (
              <>
                <button
                  onClick={() => onSelectTab('plat_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'plat_dashboard'
                      ? 'text-[#504161] bg-[#EFEBF4] font-bold border border-[#D5CBE5]'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav.centralAuthority', 'Central Authority')}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <LanguageToggle variant="pill" />

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
            aria-label={t('nav.notifications', 'Notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                {displayName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-none truncate max-w-[120px]">
                  {displayName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 leading-none block mt-0.5 font-medium">
                  {getRoleLabel()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-md border border-slate-200 py-2 z-40 animate-fade-in divide-y divide-slate-100">
                <div className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block mb-1.5 ${getRoleBadgeVariant()}`}>
                    {getRoleLabel()}
                  </span>
                  <div className="font-bold text-sm text-slate-900">{displayName}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    {currentUser.societyName || currentUser.federationName || 'सहाAI Cooperative'}
                  </div>
                </div>

                <div className="py-1 text-xs text-slate-600">
                  <button
                    onClick={() => {
                      onSelectTab('support');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-semibold text-slate-900"
                  >
                    <HeadphonesIcon className="w-4 h-4 text-emerald-600" />
                    <span>{t('nav.humanSupport', 'Direct Human Support')}</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = i18n.language?.startsWith('hi') ? 'en' : 'hi';
                      i18n.changeLanguage(next);
                      localStorage.setItem('coop_language', next);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium text-slate-700"
                  >
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>{t('language.switchLang', 'Change Language')}: {i18n.language?.startsWith('hi') ? 'English' : 'हिन्दी'}</span>
                  </button>

                  <button
                    onClick={() => {
                      resetToDemoData();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    <span>{t('nav.resetDemo', 'Reset Demo Data')}</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.signOut', 'Sign Out / Switch Persona')}</span>
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
