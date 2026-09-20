import React, { useState, useRef, useEffect } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking, Worker } from '../../types';
import { Badge } from '../../components/common/Badge';
import { WorkerProfileModal } from './WorkerProfileModal';
import { ActiveJobSOSModal } from './ActiveJobSOSModal';
import { mapBookingStatus } from '../../utils/statusMapper';
import { INITIAL_SERVICES } from '../../store/initialData';
import {
  Search,
  Sparkles,
  Users,
  CheckCircle2,
  ChevronRight,
  Star,
  Wrench,
  Zap,
  Hammer,
  ShieldCheck,
  Paintbrush,
  Tv,
  Bug,
  Trees,
  Cctv,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  HeadphonesIcon,
} from 'lucide-react';

interface CustomerDashboardProps {
  onRequestService: (serviceCategory?: string, problemType?: string) => void;
  onOpenEmergency?: () => void;
  onOpenCommunity: () => void;
  onTrackBooking: (booking: Booking) => void;
  onPayBooking: (booking: Booking) => void;
  onRateBooking: (booking: Booking) => void;
  onViewActivity?: () => void;
  onOpenSupport?: () => void;
}

const CATEGORY_ITEMS = [
  { name: 'Plumbing', icon: Wrench, color: 'bg-[#E6ECE4]', text: 'text-[#445D3E]', desc: 'Leaks, taps, drains & pipes', price: '₹400' },
  { name: 'Electrical', icon: Zap, color: 'bg-[#FAEDE8]', text: 'text-[#80432E]', desc: 'Wiring, MCBs, fans & switches', price: '₹450' },
  { name: 'Cleaning', icon: Sparkles, color: 'bg-[#E4EDF4]', text: 'text-[#324F66]', desc: 'Deep cleaning & bathroom descaling', price: '₹650' },
  { name: 'Carpentry', icon: Hammer, color: 'bg-[#FAEDE8]', text: 'text-[#80432E]', desc: 'Doors, locks, hinges & furniture', price: '₹500' },
  { name: 'Painting', icon: Paintbrush, color: 'bg-[#EFEBF4]', text: 'text-[#504161]', desc: 'Touch-ups, waterproofing & walls', price: '₹750' },
  { name: 'Appliance Repairs', icon: Tv, color: 'bg-[#E4EDF4]', text: 'text-[#324F66]', desc: 'AC, fridge, geyser & washing machine', price: '₹550' },
  { name: 'Pest Control', icon: Bug, color: 'bg-[#FAEDE8]', text: 'text-[#80432E]', desc: 'Cockroach, termite & mosquito misting', price: '₹800' },
  { name: 'Gardening & Greenery', icon: Trees, color: 'bg-[#E6ECE4]', text: 'text-[#445D3E]', desc: 'Balcony garden, trimming & pots', price: '₹350' },
  { name: 'Security & CCTV', icon: Cctv, color: 'bg-[#EFEBF4]', text: 'text-[#504161]', desc: 'Video doorbell, camera setup & sensors', price: '₹600' },
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onRequestService,
  onOpenEmergency,
  onOpenCommunity,
  onTrackBooking,
  onPayBooking,
  onRateBooking,
  onViewActivity,
  onOpenSupport,
}) => {
  const { currentUser, bookings, communityBookings, communityMessages, joinCommunityBooking, showToast } = useCooperativeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const prevActiveStateRef = useRef<string | null>(null);

  // Find active booking for current customer
  const myBookings = bookings.filter((b) => b.customerId === currentUser.id);
  const activeBooking = myBookings.find(
    (b) => !['PAID', 'RATED', 'CANCELLED'].includes(b.state)
  );
  const pastBookings = myBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  // Detect WORKER_ASSIGNED transition and notify customer
  useEffect(() => {
    const currentState = activeBooking?.state ?? null;
    const prevState = prevActiveStateRef.current;
    if (currentState === 'WORKER_ASSIGNED' && prevState !== 'WORKER_ASSIGNED' && prevState !== null) {
      showToast({
        title: '🎉 Worker Assigned!',
        message: `${activeBooking?.matchedWorker?.name || 'A verified specialist'} has been assigned to your request. Track your service now.`,
        type: 'success',
      });
    }
    prevActiveStateRef.current = currentState;
  }, [activeBooking?.state]);

  // Is SOS relevant for current active booking state?
  const isSOSActiveState = activeBooking && ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(activeBooking.state);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Click outside to dismiss search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute search suggestions
  const searchSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: { category: string; problem: string; icon: string }[] = [];

    INITIAL_SERVICES.forEach((srv) => {
      if (srv.name.toLowerCase().includes(q)) {
        results.push({ category: srv.name, problem: `${srv.name} (General service)`, icon: srv.iconName });
      }
      srv.problems.forEach((p) => {
        if (p.toLowerCase().includes(q)) {
          results.push({ category: srv.name, problem: p, icon: srv.iconName });
        }
      });
    });

    return results.slice(0, 6);
  }, [searchQuery]);

  const handleSelectSuggestion = (category: string, problem: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    onRequestService(category, problem);
  };

  const currentSocietyGroupBookings = communityBookings.filter(
    (gb) => gb.societyName === currentUser.societyName || gb.societyName === 'Green Residency'
  );

  const customerDiscussions = communityMessages
    .filter((m) => m.channelId === 'soc_announcements' || m.channelId === 'soc_maintenance')
    .slice(0, 2);

  const activeStatusInfo = activeBooking ? mapBookingStatus(activeBooking.state) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. GREETING & 2. "WHAT DO YOU NEED HELP WITH?" WITH SEARCH (DOMINANT TOP) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#292824] leading-tight flex items-center gap-2">
              <span>{getGreeting()}, {currentUser.name.split(' ')[0]}</span>
              <span className="text-2xl inline-block select-none">👋</span>
            </h1>
            <p className="text-sm sm:text-base font-medium text-[#524E47] mt-0.5">
              What do you need help with?
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#364A32] bg-[#E6ECE4] border border-[#CFDDD0] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6E8B67]" />
              <span>{currentUser.societyName || 'Green Residency'}</span>
            </span>
          </div>
        </div>

        {/* SEARCH BAR WITH LIVE AUTOCOMPLETE */}
        <div className="relative pt-1" ref={searchContainerRef}>
          <Search className="w-5 h-5 text-[#9A958B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search services (e.g. tap leak, AC cooling, deep cleaning, wiring)..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            className="w-full pl-12 pr-4 py-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-sm font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#6E8B67] focus:border-[#6E8B67] shadow-subtle transition-all"
          />

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#FCF9F3] rounded-2xl shadow-dropdown border border-[#E8E2D5] overflow-hidden z-30 animate-fade-in divide-y divide-[#E8E2D5]">
              <div className="p-2.5 bg-[#F3EEE4] text-[11px] font-bold text-[#77736B] uppercase tracking-wider flex items-center justify-between">
                <span>Matching Verified Services</span>
                <span>Click to Request</span>
              </div>
              {searchSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item.category, item.problem)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#E6ECE4]/70 transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="text-sm font-bold text-[#292824] group-hover:text-[#2A3927]">
                      {item.problem}
                    </div>
                    <div className="text-xs text-[#77736B] mt-0.5">
                      Category: <span className="font-semibold text-[#524E47]">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#77736B] group-hover:text-[#2A3927] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 9 SERVICE CATEGORIES (DIRECT 1-CLICK ACTION TO START REQUEST) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#524E47]">
            Cooperative Services
          </h2>
          <span className="text-xs text-[#77736B]">Tap any service to request</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORY_ITEMS.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => onRequestService(cat.name)}
                className="group p-4 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-card hover:shadow-card-hover relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className={`w-5 h-5 ${cat.text}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9A958B] group-hover:text-[#292824] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-bold text-[#292824] text-sm group-hover:text-[#2A3927] leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#77736B] mt-0.5 leading-normal line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#E8E2D5]/70 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#6E8B67] bg-[#E6ECE4] px-2 py-0.5 rounded-md font-mono">
                    From {cat.price}
                  </span>
                  <span className="text-[10px] text-[#77736B] font-medium"><span className="font-mono">70%</span> to worker</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. COMPACT ACTIVE SERVICE (ONLY DISPLAYED WHEN AN ACTIVE BOOKING EXISTS) */}
      {/* ========================================================================= */}
      {activeBooking && activeStatusInfo && (
        <div className="space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#537895] animate-pulse" />
              <span>Your Active Service</span>
            </span>
            <span className="text-xs text-[#77736B] font-mono">Booking #{activeBooking.id}</span>
          </div>

          <div className={`p-4 sm:p-5 bg-[#FCF9F3] rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative border-2 transition-all ${
            activeBooking.state === 'WORKER_ASSIGNED'
              ? 'border-[#6E8B67] ring-2 ring-[#CFDDD0] ring-offset-1'
              : 'border-[#B8CBDD]'
          }`}>
            {/* Contextual SOS button in top-right of active card */}
            {isSOSActiveState && (
              <button
                type="button"
                onClick={() => setSosJob(activeBooking)}
                className="absolute top-3 right-3 px-2.5 py-1 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Emergency Support during active service"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
                <span>SOS</span>
              </button>
            )}

            {/* WORKER_ASSIGNED banner */}
            {activeBooking.state === 'WORKER_ASSIGNED' && (
              <div className="absolute top-0 left-0 right-0 bg-[#E6ECE4] border-b border-[#CFDDD0] rounded-t-2xl px-4 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6E8B67] animate-pulse" />
                <span className="text-[11px] font-bold text-[#364A32]">
                  ✓ Specialist assigned — ready to track your service
                </span>
              </div>
            )}

            <div className={`space-y-2 min-w-0 pr-12 sm:pr-0 ${activeBooking.state === 'WORKER_ASSIGNED' ? 'pt-6' : ''}`}>
              <div className="flex items-center gap-2">
                <Badge variant={activeStatusInfo.badgeVariant} dot size="sm">
                  {activeStatusInfo.headline}
                </Badge>
                <span className="text-xs text-[#77736B]">· {activeStatusInfo.description}</span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#292824]">
                  {activeBooking.serviceCategory} — {activeBooking.problemType}
                </h3>
              </div>

              {/* Worker snippet */}
              {activeBooking.matchedWorker ? (
                <div className="flex items-center gap-2.5 pt-0.5">
                  <img
                    src={activeBooking.matchedWorker.avatar}
                    alt={activeBooking.matchedWorker.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E8E2D5]"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    <strong className="text-[#292824]">{activeBooking.matchedWorker.name}</strong>
                    <span className="text-[10px] text-[#445D3E] bg-[#E6ECE4] px-1.5 py-0.5 rounded font-bold">
                      ✓ Verified
                    </span>
                    <span className="text-[#77736B] flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                      <span>{activeBooking.matchedWorker.rating}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-[#77736B]">
                  Cooperative matching engine is confirming your specialist...
                </span>
              )}
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onTrackBooking(activeBooking)}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeBooking.state === 'WORKER_ASSIGNED'
                    ? 'bg-[#445D3E] hover:bg-[#33462F] animate-pulse'
                    : 'bg-[#537895] hover:bg-[#41637E]'
                }`}
              >
                <span>Track Service</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {activeBooking.state === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => onPayBooking(activeBooking)}
                  className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{activeBooking.pricing.total}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RECOMMENDED SERVICES ("Popular in Green Residency") */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#524E47]">
            Popular in {currentUser.societyName || 'Green Residency'}
          </h2>
          <span className="text-xs text-[#6E8B67] font-semibold">Seasonal care packages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: 'Monsoon Waterproofing & Leak Check',
              cat: 'Plumbing',
              prob: 'Pipe leak inspection & drainage clearing',
              desc: 'Comprehensive drain flushing & roof seal check for heavy rain.',
              price: '₹550',
              badge: 'Seasonal Essential',
            },
            {
              title: 'Pre-Summer AC Master Servicing',
              cat: 'Appliance Repairs',
              prob: 'AC deep coil cleaning & gas inspection',
              desc: 'High-pressure filter wash & cooling check by certified technician.',
              price: '₹650',
              badge: 'Popular',
            },
            {
              title: 'Apartment Electrical Safety Audit',
              cat: 'Electrical',
              prob: 'MCB load testing & socket earthing audit',
              desc: 'Detailed distribution board check to avoid sudden power tripping.',
              price: '₹450',
              badge: 'Preventative',
            },
          ].map((pkg, idx) => (
            <div
              key={idx}
              onClick={() => onRequestService(pkg.cat, pkg.prob)}
              className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl transition-all cursor-pointer flex flex-col justify-between shadow-card hover:shadow-card-hover group"
            >
              <div>
                <span className="text-[10px] font-bold text-[#445D3E] bg-[#E6ECE4] px-2 py-0.5 rounded-md inline-block mb-2">
                  {pkg.badge}
                </span>
                <h3 className="font-bold text-[#292824] text-xs group-hover:text-[#2A3927] leading-snug">
                  {pkg.title}
                </h3>
                <p className="text-[11px] text-[#77736B] mt-1 leading-normal line-clamp-2">
                  {pkg.desc}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#E8E2D5]/70 flex items-center justify-between">
                <span className="text-xs font-black text-[#292824]">{pkg.price}</span>
                <span className="text-xs font-bold text-[#6E8B67] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Book</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. COMMUNITY GROUP BOOKINGS ("Your neighbors are booking") */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#524E47] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#6E8B67]" />
              <span>Your neighbors are booking</span>
            </h2>
            <p className="text-xs text-[#77736B] mt-0.5">
              Join bulk requests in {currentUser.societyName || 'Green Residency'} for group discounts
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCommunity}
            className="text-xs font-bold text-[#6E8B67] hover:underline cursor-pointer"
          >
            View all ({currentSocietyGroupBookings.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentSocietyGroupBookings.slice(0, 2).map((gb) => {
            const hasJoined = gb.participants.some((p) => p.customerName === currentUser.name);

            return (
              <div
                key={gb.id}
                className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#80432E] bg-[#FAEDE8] border border-[#F3C5B8] px-2 py-0.5 rounded-md">
                      {gb.serviceCategory} · {gb.targetDiscountPercent}% Community Discount
                    </span>
                    <span className="text-xs text-[#77736B] font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{gb.scheduledDate}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-[#292824] text-xs leading-snug">
                    {gb.description}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#77736B] mt-1.5">
                    <Users className="w-3.5 h-3.5 text-[#6E8B67]" />
                    <span><strong className="text-[#292824]">{gb.participantCount} homes</strong> joined in your society</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-[11px] text-[#77736B]">
                    Cooperative batch service
                  </span>
                  {hasJoined ? (
                    <span className="px-3 py-1 bg-[#E6ECE4] text-[#364A32] text-xs font-bold rounded-xl border border-[#CFDDD0] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                      <span>Joined</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        joinCommunityBooking(gb.id, currentUser.name, currentUser.address.split(',')[0] || 'Flat 402');
                        showToast({
                          title: 'Joined Group Booking',
                          message: `Added to ${gb.serviceCategory} batch request.`,
                          type: 'success',
                        });
                      }}
                      className="px-3.5 py-1.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Join Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. COMMUNITY UPDATES ("Your Community") */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#524E47]">
            Your Community
          </h2>
          <button
            type="button"
            onClick={onOpenCommunity}
            className="text-xs font-bold text-[#6E8B67] hover:underline cursor-pointer"
          >
            Open Community Hub →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customerDiscussions.map((msg) => (
            <div
              key={msg.id}
              onClick={onOpenCommunity}
              className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl transition-all cursor-pointer shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#504161] bg-[#EFEBF4] px-2 py-0.5 rounded-md">
                  Society Update
                </span>
                <span className="text-[10px] text-[#9A958B]">{msg.timestamp}</span>
              </div>
              <p className="text-xs font-medium text-[#292824] line-clamp-2">
                "{msg.content}"
              </p>
              <div className="text-[11px] text-[#77736B] pt-1 flex items-center gap-1.5">
                <span className="font-semibold text-[#524E47]">{msg.authorName}</span>
                {msg.isOfficial && (
                  <span className="text-[10px] font-bold text-[#80432E]">· Society Manager</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. RECENT ACTIVITY (COMPACT PAST BOOKINGS) */}
      {/* ========================================================================= */}
      {pastBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#524E47]">
              Recent Activity
            </h2>
            {onViewActivity && (
              <button
                type="button"
                onClick={onViewActivity}
                className="text-xs font-bold text-[#6E8B67] hover:underline cursor-pointer"
              >
                View Full Activity →
              </button>
            )}
          </div>

          <div className="space-y-2">
            {pastBookings.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E6ECE4] text-[#445D3E] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-[#292824] block">{b.serviceCategory} — {b.problemType}</strong>
                    <span className="text-[11px] text-[#77736B]">
                      Completed on {b.updatedAt || 'Recent'} · ₹{b.pricing.total}
                    </span>
                  </div>
                </div>

                {b.state === 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => onRateBooking(b)}
                    className="px-3 py-1 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Rate Service
                  </button>
                ) : (
                  <span className="text-[11px] text-[#445D3E] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                    <span>Settled</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. DIRECT HUMAN CUSTOMER SUPPORT CARD */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF7F2] to-[#FCF9F3] border border-[#E8E2D5] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6ECE4] border border-[#CFDDD0] flex items-center justify-center text-[#445D3E] shrink-0 shadow-xs">
            <HeadphonesIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#292824]">
                Need Help? Talk to a Human Support Specialist
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6ECE4] text-[#364A32] hidden sm:inline">
                No Chatbots
              </span>
            </div>
            <p className="text-xs text-[#77736B] mt-0.5">
              Live in-app chat, one-tap callback request, and WhatsApp support with auto-attached booking IDs.
            </p>
          </div>
        </div>

        {onOpenSupport && (
          <button
            type="button"
            onClick={onOpenSupport}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#445D3E] hover:bg-[#364A32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <HeadphonesIcon className="w-3.5 h-3.5" />
            <span>Connect with Human Agent</span>
          </button>
        )}
      </div>

      {/* WORKER PROFILE MODAL */}
      <WorkerProfileModal
        worker={selectedWorkerForProfile}
        isOpen={selectedWorkerForProfile !== null}
        onClose={() => setSelectedWorkerForProfile(null)}
      />

      {/* ACTIVE JOB SOS MODAL */}
      {sosJob && (
        <ActiveJobSOSModal
          job={sosJob}
          isOpen={sosJob !== null}
          onClose={() => setSosJob(null)}
        />
      )}
    </div>
  );
};
