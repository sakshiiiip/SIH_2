import React, { useState, useMemo } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { UserRole, User, Worker, SocietyManagerInfo } from '../../types';
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
} from 'lucide-react';
import {
  useCardMotion,
  useMagneticButton,
  useBackgroundParallax,
} from '../../hooks/useCursorReactive';

import { WorkerLoginScreen } from './WorkerLoginScreen';

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
  const { login, workers, societyManagers, societies } = useCooperativeStore();

  const defaultDemoUser = DEMO_USERS[role] || DEMO_USERS.customer;
  const isEmailRole = ['society_manager', 'federation_manager', 'federation_admin'].includes(role);

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
      case 'worker':
        return {
          title: 'Worker Portal',
          personaTitle: selectedUser.name,
          subtitle: 'Access your active jobs, tool bank, and 70% cooperative earnings',
          badge: 'Worker Portal',
          badgeVariant: 'urgent' as const,
          icon: <HardHat className="w-6 h-6 text-[#324F66]" />,
          accentRgb: '184, 203, 221',
          btnClass: 'bg-[#537895] hover:bg-[#41637E] text-white shadow-sm',
          focusRing: 'focus:ring-[#537895] focus:border-[#537895]',
          ambientBg: 'from-[#E4EDF4]/40 via-transparent to-transparent',
          buttonLabel: `Enter as ${selectedUser.name.split(' ')[0]}`,
        };
      case 'society_manager':
        return {
          title: 'Society Manager Desk',
          personaTitle: `${selectedUser.name} (${selectedUser.societyName})`,
          subtitle: 'Sign in to cooperative administration, worker roster & 5% maintenance pool',
          badge: 'Society Manager',
          badgeVariant: 'pending' as const,
          icon: <Building2 className="w-6 h-6 text-[#80432E]" />,
          accentRgb: '233, 197, 181',
          btnClass: 'bg-[#B37055] hover:bg-[#9C583E] text-white shadow-sm',
          focusRing: 'focus:ring-[#B37055] focus:border-[#B37055]',
          ambientBg: 'from-[#FAEDE8]/40 via-transparent to-transparent',
          buttonLabel: `Enter ${selectedUser.societyName || 'Society'} Desk`,
        };
      case 'federation_admin':
      case 'federation_manager':
        return {
          title: 'Federation Admin Workspace',
          personaTitle: `${selectedUser.name} (Maharashtra Federation)`,
          subtitle: 'Sign in to Maharashtra Federation 8-society governance & relief fund',
          badge: 'Federation Admin',
          badgeVariant: 'coop' as const,
          icon: <Network className="w-6 h-6 text-[#504161]" />,
          accentRgb: '201, 189, 216',
          btnClass: 'bg-[#7A6A8E] hover:bg-[#655577] text-white shadow-sm',
          focusRing: 'focus:ring-[#7A6A8E] focus:border-[#7A6A8E]',
          ambientBg: 'from-[#EFEBF4]/40 via-transparent to-transparent',
          buttonLabel: 'Enter Federation Workspace',
        };
      case 'customer':
      default:
        return {
          title: 'Customer Sign In',
          personaTitle: `${selectedUser.name} (${selectedUser.societyName || 'Green Residency'})`,
          subtitle: 'Sign in to request trusted household & community services',
          badge: 'Resident Account',
          badgeVariant: 'verified' as const,
          icon: <UserIcon className="w-6 h-6 text-[#445D3E]" />,
          accentRgb: '168, 185, 163',
          btnClass: 'bg-[#6E8B67] hover:bg-[#587352] text-white shadow-sm',
          focusRing: 'focus:ring-[#6E8B67] focus:border-[#6E8B67]',
          ambientBg: 'from-[#E6ECE4]/40 via-transparent to-transparent',
          buttonLabel: 'Continue to Services',
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
    handleDirectLogin();
  };

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
        {/* Back navigation button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77736B] hover:text-[#292824] transition-colors p-1.5 -ml-1.5 rounded-xl hover:bg-[#F3EEE4] cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Role Selection</span>
        </button>

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
                      <span>Choose Society Manager ({filteredManagerAccounts.length} Societies)</span>
                    </span>
                  </div>

                  {/* Search Bar for Managers */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search society (Green Residency, Lakeview...) or manager name..."
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
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#E8E2D5] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <strong className="text-xs font-bold text-[#292824] truncate block">
                                  {m.name}
                                </strong>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B37055] shrink-0" />}
                              </div>
                              <div className="text-[11px] text-[#80432E] font-semibold truncate">
                                {m.societyName}
                              </div>
                              <div className="text-[10px] text-[#77736B] truncate">
                                {m.workersCount} Assigned Workers
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
                            Sign In →
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
                    <span>Demo Resident Accounts</span>
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

              {/* 4. FEDERATION ADMIN ACCOUNT */}
              {(role === 'federation_admin' || role === 'federation_manager') && (
                <div className="p-3.5 bg-[#EFEBF4] rounded-2xl border border-[#DFD8E8] flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#DFD8E8]"
                    />
                    <div>
                      <span className="text-[10px] text-[#504161] font-bold uppercase block leading-none">Federation Admin</span>
                      <strong className="text-sm font-bold text-[#292824] block mt-0.5">{selectedUser.name}</strong>
                      <span className="text-[11px] text-[#77736B]">{selectedUser.federationName || 'Maharashtra Community Federation'}</span>
                    </div>
                  </div>
                  <Badge variant="coop" size="sm">Level 3 Admin</Badge>
                </div>
              )}

              {/* Selected Account Active Preview & Form */}
              <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-2 border-t border-[#E8E2D5]">
                <div className="p-3.5 bg-[#F3EEE4] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {selectedUser.avatar && (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#E8E2D5]"
                      />
                    )}
                    <div>
                      <span className="text-[10px] text-[#77736B] block font-medium uppercase tracking-wider">Active Selected Persona:</span>
                      <strong className="text-sm text-[#292824] font-bold block">{selectedUser.name}</strong>
                      <span className="text-[11px] text-[#80432E] font-medium block">
                        {selectedUser.tradeProfession ? `${selectedUser.tradeProfession} · ` : ''}
                        {selectedUser.societyName || selectedUser.federationName || 'Cooperative'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#364A32] bg-[#E6ECE4] border border-[#CFDDD0] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
                    <span>Selected</span>
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                    {isEmailRole ? 'Official Cooperative Email' : 'Phone Number or Email'}
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
                      Password
                    </label>
                    <span className="text-[11px] text-[#9A958B]">
                      Pre-filled in demo
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
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#9A958B] leading-normal">
          Protected by Cooperative Community Protocol · Role locked upon sign in
        </p>
      </div>
    </div>
  );
};
