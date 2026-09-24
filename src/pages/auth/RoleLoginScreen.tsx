import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { UserRole, User, Worker, SocietyManagerInfo, FederationApplication } from '../../types';
import { DEMO_USERS } from '../../store/initialData';
import { Badge } from '../../components/common/Badge';
import {
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  HardHat,
  Building2,
  Network,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Search,
  Star,
  Sparkles,
  Filter,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  useCardMotion,
  useMagneticButton,
  useBackgroundParallax,
} from '../../hooks/useCursorReactive';
import { LanguageToggle } from '../../components/common/LanguageToggle';

import { WorkerLoginScreen } from './WorkerLoginScreen';
import { FederationRegistrationPage } from '../admin/FederationRegistrationPage';

interface RoleLoginScreenProps {
  role: UserRole;
  onBack: () => void;
  onSuccess: () => void;
}

export const RoleLoginScreen: React.FC<RoleLoginScreenProps> = ({
  role,
  onBack,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { login, workers, societyManagers, societies, federations, federationApplications } = useCooperativeStore();

  const defaultDemoUser = DEMO_USERS[role] || DEMO_USERS.customer;
  const isEmailRole = ['society_manager', 'federation_manager', 'federation_admin', 'platform_admin'].includes(role);

  // Selected account state
  const [selectedUser, setSelectedUser] = useState<User>(defaultDemoUser);
  const [identifier, setIdentifier] = useState(
    isEmailRole ? defaultDemoUser.email : defaultDemoUser.phone || defaultDemoUser.email
  );
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [workerTradeFilter, setWorkerTradeFilter] = useState('All');
  const [activeLoginMode, setActiveLoginMode] = useState<'quick_select' | 'manual_form'>('quick_select');

  // Federation Auth & Registration state
  const [federationAuthMode, setFederationAuthMode] = useState<'login' | 'register'>('login');
  const [federationStatusView, setFederationStatusView] = useState<{
    app: FederationApplication;
    type: 'PENDING' | 'CHANGES_REQUIRED' | 'REJECTED';
  } | null>(null);
  const [editApplicationId, setEditApplicationId] = useState<string | null>(null);

  const { bgRef } = useBackgroundParallax(0.02);
  const {
    cardRef,
    glowRef,
    onPointerMove: onCardMove,
    onPointerEnter: onCardEnter,
    onPointerLeave: onCardLeave,
  } = useCardMotion({ maxTilt: 1.5, perspective: 1200 });

  const {
    btnRef,
    onPointerMove: onBtnMove,
    onPointerLeave: onBtnLeave,
  } = useMagneticButton({ maxDistance: 3, pullStrength: 0.15 });

  // Filtered workers for worker role
  const filteredWorkerAccounts = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
        w.skills.some((s) => s.toLowerCase().includes(accountSearch.toLowerCase())) ||
        (w.societyName && w.societyName.toLowerCase().includes(accountSearch.toLowerCase())) ||
        (w.phone && w.phone.includes(accountSearch));
      const matchesTrade = workerTradeFilter === 'All' || w.skills.includes(workerTradeFilter) || w.profession === workerTradeFilter;
      return matchesSearch && matchesTrade;
    });
  }, [workers, accountSearch, workerTradeFilter]);

  // Filtered managers for society_manager role
  const filteredManagerAccounts = useMemo(() => {
    return societyManagers.filter((m) => {
      return (
        m.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
        m.societyName.toLowerCase().includes(accountSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(accountSearch.toLowerCase())
      );
    });
  }, [societyManagers, accountSearch]);

  const getRoleConfig = () => {
    switch (role) {
      case 'platform_admin':
        return {
          title: t('roleLogin.platformAdminTitle', { defaultValue: 'Platform Central Authority' }),
          personaTitle: `${selectedUser.name} (${t('roleLogin.chiefRegistrar', { defaultValue: 'Chief Registrar' })})`,
          subtitle: t('roleLogin.platformAdminSubtitle', { defaultValue: 'Apex Federation Accreditation, Statutory Verification & Central Regulatory Governance' }),
          badge: t('roleLogin.platformAdminBadge', { defaultValue: 'Platform Central Authority' }),
          badgeVariant: 'coop' as const,
          icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
          accentRgb: '147, 51, 234',
          btnClass: 'bg-[#141413] hover:bg-black text-white shadow-md border border-purple-500/30',
          focusRing: 'focus:ring-purple-600 focus:border-purple-600',
          ambientBg: 'from-purple-900/20 via-transparent to-transparent',
          buttonLabel: t('roleLogin.enterCentralAuthority', { defaultValue: 'Enter Central Authority Desk' }),
        };
      case 'worker':
        return {
          title: t('roleLogin.workerTitle', { defaultValue: 'Worker Portal' }),
          personaTitle: selectedUser.name,
          subtitle: t('roleLogin.workerSubtitle', { defaultValue: 'Access your active jobs, tool bank, and 70% cooperative earnings' }),
          badge: t('roleLogin.workerBadge', { defaultValue: 'Worker Portal' }),
          badgeVariant: 'urgent' as const,
          icon: <HardHat className="w-6 h-6 text-[#324F66]" />,
          accentRgb: '184, 203, 221',
          btnClass: 'bg-[#537895] hover:bg-[#41637E] text-white shadow-sm',
          focusRing: 'focus:ring-[#537895] focus:border-[#537895]',
          ambientBg: 'from-[#E4EDF4]/40 via-transparent to-transparent',
          buttonLabel: t('roleLogin.enterAs', { defaultValue: 'Enter as {{name}}', name: selectedUser.name.split(' ')[0] }),
        };
      case 'society_manager':
        return {
          title: t('roleLogin.societyManagerTitle', { defaultValue: 'Society Manager Desk' }),
          personaTitle: `${selectedUser.name} (${selectedUser.societyName})`,
          subtitle: t('roleLogin.societyManagerSubtitle', { defaultValue: 'Sign in to cooperative administration, worker roster & 5% maintenance pool' }),
          badge: t('roleLogin.societyManagerBadge', { defaultValue: 'Society Manager' }),
          badgeVariant: 'pending' as const,
          icon: <Building2 className="w-6 h-6 text-[#80432E]" />,
          accentRgb: '233, 197, 181',
          btnClass: 'bg-[#B37055] hover:bg-[#9C583E] text-white shadow-sm',
          focusRing: 'focus:ring-[#B37055] focus:border-[#B37055]',
          ambientBg: 'from-[#FAEDE8]/40 via-transparent to-transparent',
          buttonLabel: t('roleLogin.enterSocietyDesk', { defaultValue: 'Enter {{society}} Desk', society: selectedUser.societyName || 'Society' }),
        };
      case 'federation_admin':
      case 'federation_manager':
        return {
          title: t('roleLogin.federationAdminTitle', { defaultValue: 'Federation Admin Workspace' }),
          personaTitle: `${selectedUser.name} (Maharashtra Federation)`,
          subtitle: t('roleLogin.federationAdminSubtitle', { defaultValue: 'Sign in to Maharashtra Federation 8-society governance & relief fund' }),
          badge: t('roleLogin.federationAdminBadge', { defaultValue: 'Federation Admin' }),
          badgeVariant: 'coop' as const,
          icon: <Network className="w-6 h-6 text-[#504161]" />,
          accentRgb: '201, 189, 216',
          btnClass: 'bg-[#7A6A8E] hover:bg-[#655577] text-white shadow-sm',
          focusRing: 'focus:ring-[#7A6A8E] focus:border-[#7A6A8E]',
          ambientBg: 'from-[#EFEBF4]/40 via-transparent to-transparent',
          buttonLabel: t('roleLogin.enterFederationWorkspace', { defaultValue: 'Enter Federation Workspace' }),
        };
      case 'customer':
      default:
        return {
          title: t('roleLogin.customerTitle', { defaultValue: 'Customer Sign In' }),
          personaTitle: `${selectedUser.name} (${selectedUser.societyName || 'Green Residency'})`,
          subtitle: t('roleLogin.customerSubtitle', { defaultValue: 'Sign in to request trusted household & community services' }),
          badge: t('roleLogin.customerBadge', { defaultValue: 'Resident Account' }),
          badgeVariant: 'verified' as const,
          icon: <UserIcon className="w-6 h-6 text-[#445D3E]" />,
          accentRgb: '168, 185, 163',
          btnClass: 'bg-[#6E8B67] hover:bg-[#587352] text-white shadow-sm',
          focusRing: 'focus:ring-[#6E8B67] focus:border-[#6E8B67]',
          ambientBg: 'from-[#E6ECE4]/40 via-transparent to-transparent',
          buttonLabel: t('roleLogin.continueToServices', { defaultValue: 'Continue to Services' }),
        };
    }
  };

  const config = getRoleConfig();

  const handleSelectWorker = (worker: Worker) => {
    const userObj: User = {
      id: worker.id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      role: 'worker',
      avatar: worker.avatar,
      address: `Flat 101, Worker Staff Block, ${worker.societyName || 'Green Residency'}`,
      societyId: worker.societyId,
      societyName: worker.societyName || 'Green Residency',
      tradeProfession: worker.profession || worker.skills[0],
    };
    setSelectedUser(userObj);
    setIdentifier(worker.phone || worker.email);
  };

  const handleSelectManager = (manager: SocietyManagerInfo) => {
    const soc = societies.find((s) => s.id === manager.societyId);
    const userObj: User = {
      id: manager.id,
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      role: 'society_manager',
      avatar: manager.avatar,
      address: `Manager Office, ${manager.societyName}`,
      societyId: manager.societyId,
      societyName: manager.societyName,
      designation: `Society Manager (${manager.societyName})`,
    };
    setSelectedUser(userObj);
    setIdentifier(manager.email);
  };

  const handleSelectCustomer = (name: string, societyName: string, phone: string, email: string) => {
    const userObj: User = {
      id: 'cust_' + name.toLowerCase().replace(/\s+/g, '_'),
      name,
      email,
      phone,
      role: 'customer',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      address: `Flat 402, Block B, ${societyName}`,
      societyName,
    };
    setSelectedUser(userObj);
    setIdentifier(phone);
  };

  const handleDirectLogin = (userToLogin?: User) => {
    const targetUser = userToLogin || selectedUser;
    setIsLoading(true);
    setTimeout(() => {
      login(role, targetUser);
      setIsLoading(false);
      onSuccess();
    }, 280);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'federation_admin' || role === 'federation_manager') {
      // Find matching application by official email or representative email
      const emailQuery = identifier.trim().toLowerCase();
      const matchingApp = federationApplications.find(
        (a) =>
          a.officialEmail.toLowerCase() === emailQuery ||
          a.authorizedPersonEmail.toLowerCase() === emailQuery ||
          (selectedUser.federationId && a.federationId === selectedUser.federationId)
      );

      if (matchingApp) {
        if (matchingApp.status === 'PENDING_VERIFICATION') {
          setFederationStatusView({ app: matchingApp, type: 'PENDING' });
          return;
        }
        if (matchingApp.status === 'CHANGES_REQUIRED') {
          setFederationStatusView({ app: matchingApp, type: 'CHANGES_REQUIRED' });
          return;
        }
        if (matchingApp.status === 'REJECTED') {
          setFederationStatusView({ app: matchingApp, type: 'REJECTED' });
          return;
        }
      }
    }

    handleDirectLogin();
  };

  // If in Federation Registration Mode, render statutory registration page directly
  if ((role === 'federation_admin' || role === 'federation_manager') && federationAuthMode === 'register') {
    return (
      <FederationRegistrationPage
        existingApplicationId={editApplicationId || undefined}
        onNavigateBack={() => {
          setFederationAuthMode('login');
          setEditApplicationId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center px-4 py-8 bg-[#F8F4EC] relative selection:bg-[#CFDDD0] selection:text-[#2A3927] overflow-y-auto animate-fade-in">
      {/* Dynamic Role-specific Ambient Glow with Parallax Drift */}
      <div
        ref={bgRef}
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[360px] rounded-full blur-3xl opacity-60 will-change-transform"
        style={{
          background: `radial-gradient(circle, rgba(${config.accentRgb}, 0.28) 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl space-y-4 my-auto">
        {/* Back navigation button and language toggle */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77736B] hover:text-[#292824] transition-colors p-1.5 -ml-1.5 rounded-xl hover:bg-[#F3EEE4] cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>{t('roleLogin.backToRoleSelection', { defaultValue: 'Back to Role Selection' })}</span>
          </button>
          <LanguageToggle variant="pill" />
        </div>

        {/* Premium Centered Login Card with Subtle 3D Depth & Pointer Light */}
        <div
          ref={cardRef}
          onPointerMove={onCardMove}
          onPointerEnter={onCardEnter}
          onPointerLeave={onCardLeave}
          className="relative overflow-hidden bg-[#FCF9F3]/95 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-[#E8E2D5] p-6 sm:p-8 shadow-card space-y-6 will-change-transform"
        >
          {/* Internal Cursor Glow */}
          <div
            ref={glowRef}
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 opacity-0 will-change-transform"
            style={{
              background: `radial-gradient(300px circle at var(--glow-x, 150px) var(--glow-y, 100px), rgba(${config.accentRgb}, 0.08), transparent 70%)`,
            }}
          />

          {/* Header (Only for non-worker roles, since WorkerLoginScreen renders its own header) */}
          {role !== 'worker' && (
            <div className="relative z-10 space-y-2 pb-4 border-b border-[#E8E2D5]">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F3EEE4] border border-[#E8E2D5] flex items-center justify-center shadow-xs">
                  {config.icon}
                </div>
                <Badge variant={config.badgeVariant} size="sm">
                  {config.badge}
                </Badge>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl text-[#292824] tracking-tight leading-tight">
                  {config.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#77736B] mt-0.5 leading-relaxed font-normal">
                  {config.subtitle}
                </p>
              </div>
            </div>
          )}
          {/* ========================================================================= */}
          {/* MULTI-ACCOUNT SELECTOR SECTION */}
          {/* ========================================================================= */}

          {role === 'worker' ? (
            <WorkerLoginScreen 
              onSuccess={(userObj) => {
                login('worker', userObj);
                onSuccess();
              }} 
            />
          ) : (
            <>
              {/* 2. SOCIETY MANAGER MULTIPLE ACCOUNTS LIST */}
              {role === 'society_manager' && (
                <div className="space-y-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#80432E]" />
                      <span>{t('roleLogin.chooseSocietyManager', { defaultValue: 'Choose Society Manager ({{count}} Societies)', count: filteredManagerAccounts.length })}</span>
                    </span>
                  </div>

                  {/* Search Bar for Managers */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('roleLogin.searchSocietyPlaceholder', { defaultValue: 'Search society (Green Residency, Lakeview...) or manager name...' })}
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
                    />
                  </div>

                  {/* Managers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {filteredManagerAccounts.map((m) => {
                      const isSelected = selectedUser.id === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectManager(m)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-[#FAEDE8] border-2 border-[#B37055] shadow-xs'
                              : 'bg-[#FCF9F3] border-[#E8E2D5] hover:border-[#F3C5B8] hover:bg-[#F3EEE4]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#FAEDE8] border border-[#E8E2D5] flex items-center justify-center text-[#80432E] font-bold text-sm shrink-0">
                              {(m.name.includes('Priya') ? t('demoUsers.priyaPatel', m.name) : m.name).charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <strong className="text-xs font-bold text-[#292824] truncate block">
                                  {m.name.includes('Priya') ? t('demoUsers.priyaPatel', m.name) : m.name}
                                </strong>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B37055] shrink-0" />}
                              </div>
                              <div className="text-[11px] text-[#80432E] font-semibold truncate">
                                {m.societyName}
                              </div>
                              <div className="text-[10px] text-[#77736B] truncate">
                                {t('roleLogin.assignedWorkers', { defaultValue: '{{count}} Assigned Workers', count: m.workersCount })}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const userObj: User = {
                                id: m.id,
                                name: m.name,
                                email: m.email,
                                phone: m.phone,
                                role: 'society_manager',
                                avatar: m.avatar,
                                address: `Manager Office, ${m.societyName}`,
                                societyId: m.societyId,
                                societyName: m.societyName,
                                designation: `Society Manager (${m.societyName})`,
                              };
                              handleDirectLogin(userObj);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#B37055] hover:bg-[#9C583E] text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                          >
                            {t('roleLogin.signInArrow', { defaultValue: 'Sign In →' })}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. CUSTOMER ACCOUNTS LIST */}
              {role === 'customer' && (
                <div className="space-y-3 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-[#445D3E]" />
                    <span>{t('roleLogin.demoResidentAccounts', { defaultValue: 'Demo Resident Accounts' })}</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Ananya Deshmukh', society: 'Green Residency', flat: 'Flat 402', phone: '+91 98201 55432', email: 'ananya@greenresidency.coop' },
                      { name: 'Priya Nair', society: 'Lakeview Society', flat: 'Flat 204', phone: '+91 98203 77812', email: 'priya.nair@lakeview.coop' },
                      { name: 'Rahul Gupta', society: 'Sunrise Apartments', flat: 'Flat 108', phone: '+91 98205 99341', email: 'rahul.gupta@sunrise.coop' },
                    ].map((cust) => {
                      const isSelected = selectedUser.name === cust.name;
                      return (
                        <div
                          key={cust.name}
                          onClick={() => handleSelectCustomer(cust.name, cust.society, cust.phone, cust.email)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#E6ECE4] border-2 border-[#6E8B67]'
                              : 'bg-[#FCF9F3] border-[#E8E2D5] hover:border-[#CFDDD0]'
                          }`}
                        >
                          <strong className="text-xs font-bold text-[#292824] block">{cust.name}</strong>
                          <span className="text-[10px] text-[#445D3E] font-medium block">{cust.society}</span>
                          <span className="text-[10px] text-[#77736B] block">{cust.flat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. FEDERATION ADMIN ACCOUNT & ENTRY WORKFLOW */}
              {(role === 'federation_admin' || role === 'federation_manager') && (
                <div className="space-y-4 relative z-10">
                  {/* Status Block if user tried to sign into an application that is not APPROVED */}
                  {federationStatusView ? (
                    <div className="p-5 rounded-2xl border space-y-4 animate-fade-in bg-white shadow-sm border-[#DFD8E8]">
                      {federationStatusView.type === 'PENDING' && (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <Clock className="w-6 h-6" />
                            </div>
                            <div>
                              <Badge variant="warning" size="sm">{t('federationAuth.pendingBadge', { defaultValue: 'PENDING VERIFICATION' })}</Badge>
                              <h3 className="text-base font-serif font-bold text-[#141413] mt-0.5">
                                {t('federationAuth.pendingHeading', { defaultValue: 'Registration Pending Platform Verification' })}
                              </h3>
                              <p className="text-xs text-[#77736B]">
                                {t('federationAuth.applicationRef', { defaultValue: 'Application Ref: ' })}<strong className="font-mono text-[#141413]">#{federationStatusView.app.id}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-700" />
                              <span>{t('federationAuth.workspaceLocked', { defaultValue: 'Workspace Access Locked' })}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-amber-900">
                              {t('federationAuth.pendingMessage', {
                                defaultValue: 'Your statutory application for {{name}} has been transmitted and is currently undergoing audit by the Platform Central Authority (Dr. Rajeshwar Sengupta, Chief Registrar). Workspace access will be unlocked once approved.',
                                name: federationStatusView.app.federationName,
                              })}
                            </p>
                          </div>

                          <div className="p-3 bg-[#FCF9F3] rounded-xl border border-[#E8E2D5] text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-[#77736B]">{t('federationAuth.regNo', { defaultValue: 'Registration No:' })}</span>
                              <span className="font-mono font-bold text-[#141413]">{federationStatusView.app.registrationNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#77736B]">{t('federationAuth.representative', { defaultValue: 'Representative:' })}</span>
                              <span className="font-semibold text-[#141413]">{federationStatusView.app.authorizedPersonName} ({federationStatusView.app.authorizedPersonDesignation})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#77736B]">{t('federationAuth.declaredScope', { defaultValue: 'Declared Scope:' })}</span>
                              <span className="font-semibold text-[#141413]">{federationStatusView.app.societiesCount || federationStatusView.app.declaredSocieties?.length || 1} {t('common.societies', { defaultValue: 'Societies' })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#77736B]">{t('federationAuth.submittedDate', { defaultValue: 'Submitted Date:' })}</span>
                              <span className="text-[#141413]">{federationStatusView.app.submittedAt || 'Recent'}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setFederationStatusView(null)}
                              className="px-4 py-2 rounded-xl bg-white border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5] cursor-pointer"
                            >
                              {t('roleLogin.backToSignIn', { defaultValue: 'Back to Sign In' })}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditApplicationId(federationStatusView.app.id);
                                setFederationAuthMode('register');
                                setFederationStatusView(null);
                              }}
                              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t('federationAuth.viewApplicationDetails', { defaultValue: 'View Application Details' })}</span>
                            </button>
                          </div>
                        </>
                      )}

                      {federationStatusView.type === 'CHANGES_REQUIRED' && (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                              <Badge variant="warning" size="sm">{t('federationAuth.changesRequiredBadge', { defaultValue: 'CHANGES REQUIRED' })}</Badge>
                              <h3 className="text-base font-serif font-bold text-[#141413] mt-0.5">
                                {t('federationAuth.changesRequiredHeading', { defaultValue: 'Platform Admin Requested Corrections' })}
                              </h3>
                              <p className="text-xs text-[#77736B]">
                                {t('federationAuth.applicationRef', { defaultValue: 'Application Ref: ' })}<strong className="font-mono text-[#141413]">#{federationStatusView.app.id}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                            <strong className="block">{t('federationAuth.reviewerDirectives', { defaultValue: 'Reviewer Reason & Directives:' })}</strong>
                            <p className="text-xs font-medium text-amber-900 leading-relaxed italic">
                              "{federationStatusView.app.changeRequestReason || 'Please review statutory documents and update accordingly.'}"
                            </p>
                            {federationStatusView.app.reviewedBy && (
                              <span className="text-[11px] text-amber-700 block mt-1">
                                {t('federationAuth.reviewedByOn', { defaultValue: 'Reviewed by {{reviewer}} on {{date}}', reviewer: federationStatusView.app.reviewedBy, date: federationStatusView.app.reviewedAt })}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setFederationStatusView(null)}
                              className="px-4 py-2 rounded-xl bg-white border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5] cursor-pointer"
                            >
                              {t('roleLogin.backToSignIn', { defaultValue: 'Back to Sign In' })}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditApplicationId(federationStatusView.app.id);
                                setFederationAuthMode('register');
                                setFederationStatusView(null);
                              }}
                              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t('federationAuth.updateAndResubmit', { defaultValue: 'Update Documents & Resubmit' })}</span>
                            </button>
                          </div>
                        </>
                      )}

                      {federationStatusView.type === 'REJECTED' && (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                              <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <Badge variant="danger" size="sm">{t('federationAuth.rejectedBadge', { defaultValue: 'REGISTRATION REJECTED' })}</Badge>
                              <h3 className="text-base font-serif font-bold text-rose-950 mt-0.5">
                                {t('federationAuth.rejectedHeading', { defaultValue: 'Statutory Accreditation Denied' })}
                              </h3>
                              <p className="text-xs text-[#77736B]">
                                {t('federationAuth.applicationRef', { defaultValue: 'Application Ref: ' })}<strong className="font-mono text-[#141413]">#{federationStatusView.app.id}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
                            <strong className="block">{t('federationAuth.centralDecision', { defaultValue: 'Central Authority Decision:' })}</strong>
                            <p className="text-xs font-medium text-rose-900 leading-relaxed italic">
                              "{federationStatusView.app.rejectionReason || 'Application does not meet platform accreditation standards under the Multi-State Cooperative Societies Act.'}"
                            </p>
                            {federationStatusView.app.reviewedBy && (
                              <span className="text-[11px] text-rose-700 block mt-1">
                                {t('federationAuth.reviewedByOn', { defaultValue: 'Reviewed by {{reviewer}} on {{date}}', reviewer: federationStatusView.app.reviewedBy, date: federationStatusView.app.reviewedAt })}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setFederationStatusView(null)}
                              className="px-4 py-2 rounded-xl bg-white border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5] cursor-pointer"
                            >
                              {t('roleLogin.backToSignIn', { defaultValue: 'Back to Sign In' })}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditApplicationId(null);
                                setFederationAuthMode('register');
                                setFederationStatusView(null);
                              }}
                              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t('federationAuth.submitNewRegistration', { defaultValue: 'Submit New Registration' })}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Entry Flow Switcher: Existing Approved Federation vs New Federation */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3EEE4] rounded-2xl border border-[#E8E2D5] text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setFederationAuthMode('login')}
                          className="py-2.5 px-3 rounded-xl transition-all cursor-pointer bg-white text-[#504161] shadow-2xs font-extrabold border border-[#DFD8E8] flex items-center justify-center gap-1.5"
                        >
                          <Network className="w-3.5 h-3.5" />
                          <span>{t('roleLogin.existingFederation', { defaultValue: 'Existing Federation' })}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFederationAuthMode('register')}
                          className="py-2.5 px-3 rounded-xl transition-all cursor-pointer text-[#504161] hover:bg-[#EFEBF4] flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t('roleLogin.newRegistration', { defaultValue: '+ New Registration' })}</span>
                        </button>
                      </div>

                      {/* Approved Federation Card Preview */}
                      <div className="p-3.5 bg-[#EFEBF4] rounded-2xl border border-[#DFD8E8] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#DFD8E8] border border-[#DFD8E8] flex items-center justify-center text-[#504161] font-bold text-sm shrink-0">
                            {(selectedUser.name.includes('Priya') ? t('demoUsers.priyaPatel', selectedUser.name) : selectedUser.name).charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#504161] font-bold uppercase block leading-none">{t('roleLogin.approvedFederation', { defaultValue: 'Approved Federation' })}</span>
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">{t('roleLogin.certifiedBadge', { defaultValue: '✓ Certified' })}</span>
                            </div>
                            <strong className="text-sm font-bold text-[#292824] block mt-0.5">{selectedUser.name.includes('Priya') ? t('demoUsers.priyaPatel', selectedUser.name) : selectedUser.name}</strong>
                            <span className="text-[11px] text-[#77736B]">{selectedUser.federationName || 'Maharashtra Community Federation'}</span>
                          </div>
                        </div>
                        <Badge variant="coop" size="sm">{t('roleLogin.level3Apex', { defaultValue: 'Level 3 Apex' })}</Badge>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Selected Account Active Preview & Form (Only rendered when not viewing status card) */}
              {!federationStatusView && (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-2 border-t border-[#E8E2D5]">
                  <div className="p-3.5 bg-[#F3EEE4] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FCF9F3] border border-[#E8E2D5] flex items-center justify-center text-[#80432E] font-bold text-xs shrink-0">
                        {(selectedUser.name.includes('Priya') ? t('demoUsers.priyaPatel', selectedUser.name) : selectedUser.name).charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] text-[#77736B] block font-medium uppercase tracking-wider">{t('roleLogin.activePersona', { defaultValue: 'Active Selected Persona:' })}</span>
                        <strong className="text-sm text-[#292824] font-bold block">{selectedUser.name.includes('Priya') ? t('demoUsers.priyaPatel', selectedUser.name) : selectedUser.name}</strong>
                        <span className="text-[11px] text-[#80432E] font-medium block">
                          {selectedUser.tradeProfession ? `${selectedUser.tradeProfession} · ` : ''}
                          {selectedUser.societyName || selectedUser.federationName || 'Cooperative'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#364A32] bg-[#E6ECE4] border border-[#CFDDD0] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
                      <span>{t('roleLogin.selected', { defaultValue: 'Selected' })}</span>
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                      {isEmailRole ? t('roleLogin.officialEmail', { defaultValue: 'Official Cooperative Email' }) : t('roleLogin.phoneOrEmail', { defaultValue: 'Phone Number or Email' })}
                    </label>
                    <div className="relative">
                      {isEmailRole ? (
                        <Mail className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      ) : (
                        <Phone className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                      <input
                        type={isEmailRole ? 'email' : 'text'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm font-medium text-[#292824] focus:outline-none focus:ring-2 shadow-subtle transition-all ${config.focusRing}`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#524E47] uppercase tracking-wider">
                        {t('roleLogin.password', { defaultValue: 'Password' })}
                      </label>
                      <span className="text-[11px] text-[#9A958B]">
                        {t('roleLogin.prefilledDemo', { defaultValue: 'Pre-filled in demo' })}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 shadow-subtle transition-all ${config.focusRing}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A958B] hover:text-[#524E47] transition-colors p-0.5 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Magnetic Submit Button */}
                  <button
                    ref={btnRef}
                    onPointerMove={onBtnMove}
                    onPointerLeave={onBtnLeave}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98] will-change-transform ${config.btnClass}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{config.buttonLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#9A958B] leading-normal">
          {t('roleLogin.footerProtocols', { defaultValue: 'Protected by Cooperative Community Protocol · Role locked upon sign in' })}
        </p>
      </div>
    </div>
  );
};
