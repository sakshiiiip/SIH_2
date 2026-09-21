import React, { useState } from 'react';
import { UserRole } from '../../types';
import {
  User,
  HardHat,
  Building2,
  Network,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Wrench,
  Layers,
  PlayCircle,
} from 'lucide-react';
import { useBackgroundParallax } from '../../hooks/useCursorReactive';

interface RoleSelectionScreenProps {
  onSelectRoleForAuth: (role: UserRole) => void;
  onOpenGuidedScenario: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRoleForAuth,
  onOpenGuidedScenario,
}) => {
  const [viewLevel, setViewLevel] = useState<'main' | 'services'>('main');

  const { bgRef } = useBackgroundParallax(0.02);

  return (
    <div
      ref={bgRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#F8F4EC] text-[#292824]"
    >
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E6ECE4]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FAEDE8]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EFEBF4]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto relative z-10 space-y-7 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6ECE4] border border-[#CFDDD0] text-xs font-semibold text-[#364A32] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#6E8B67] animate-pulse" />
            <span>Cooperative Services Platform</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#292824] tracking-tight leading-[1.05]">
            {viewLevel === 'main' ? 'Welcome to Cooperative' : 'Services & Operations'}
          </h1>
          <p className="text-sm sm:text-base text-[#77736B] max-w-md mx-auto font-normal leading-relaxed">
            {viewLevel === 'main'
              ? 'How would you like to continue?'
              : 'Choose your operational role to access your dedicated workspace.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* LEVEL 1: TWO MAIN CARDS (CUSTOMER & SERVICES) */}
        {/* ========================================================================= */}
        {viewLevel === 'main' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
            {/* 1. CUSTOMER CARD */}
            <div
              onClick={() => onSelectRoleForAuth('customer')}
              className="group relative p-6 sm:p-8 bg-[#FCF9F3] hover:bg-[#F3EEE4] border-2 border-[#E8E2D5] hover:border-[#6E8B67] rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden active:scale-[0.98]"
            >
              {/* Card Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6ECE4] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6ECE4] text-[#445D3E] border border-[#CFDDD0] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                    <User className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]">
                    Resident
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#292824] group-hover:text-[#2A3927] transition-colors tracking-tight">
                    Customer
                  </h2>
                  <p className="text-xs sm:text-sm text-[#77736B] mt-1.5 leading-relaxed font-normal">
                    Book trusted household & community services with fair, transparent pricing and live tracking.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between relative z-10">
                <span className="text-xs font-bold text-[#445D3E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fair Gig & Verified Help</span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#E6ECE4] text-[#445D3E] flex items-center justify-center group-hover:bg-[#6E8B67] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* 2. SERVICES CARD */}
            <div
              onClick={() => setViewLevel('services')}
              className="group relative p-6 sm:p-8 bg-[#FCF9F3] hover:bg-[#F3EEE4] border-2 border-[#E8E2D5] hover:border-[#537895] rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden active:scale-[0.98]"
            >
              {/* Card Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E4EDF4] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#E4EDF4] text-[#324F66] border border-[#CDE0EC] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                    <Wrench className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#E4EDF4] text-[#263D50] border border-[#CDE0EC]">
                    Operations
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#292824] group-hover:text-[#1C2C3A] transition-colors tracking-tight">
                    Services
                  </h2>
                  <p className="text-xs sm:text-sm text-[#77736B] mt-1.5 leading-relaxed font-normal">
                    Access professional services, trade specialist portals, and cooperative management operations.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-[#324F66] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Workers & Managers</span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#E4EDF4] text-[#324F66] flex items-center justify-center group-hover:bg-[#537895] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 2: SERVICES ROLE SELECTION (WORKER, SOCIETY MANAGER, FEDERATION MANAGER) */}
        {/* ========================================================================= */}
        {viewLevel === 'services' && (
          <div className="space-y-4 animate-fade-in">
            {/* Back to Level 1 button */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewLevel('main')}
                className="px-3 py-1.5 rounded-xl bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-xs font-semibold text-[#524E47] hover:text-[#292824] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back</span>
              </button>

              <span className="text-xs font-semibold uppercase tracking-wider text-[#77736B]">
                Choose Service Persona
              </span>
            </div>

            {/* 3 Services Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* WORKER CARD */}
              <div
                onClick={() => onSelectRoleForAuth('worker')}
                className="group p-5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border-2 border-[#E8E2D5] hover:border-[#537895] rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#E4EDF4] text-[#324F66] border border-[#CDE0EC] flex items-center justify-center shadow-xs">
                      <HardHat className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E4EDF4] text-[#263D50] border border-[#CDE0EC]">
                      70% Share
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#292824] group-hover:text-[#324F66] tracking-tight">
                      Worker
                    </h3>
                    <p className="text-xs text-[#77736B] mt-1 leading-relaxed font-normal">
                      Provide services, receive fairly dispatched nearby jobs, borrow zero-cost tools, and manage earnings.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#324F66]">Login as Worker</span>
                  <ArrowRight className="w-4 h-4 text-[#324F66] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* SOCIETY MANAGER CARD */}
              <div
                onClick={() => onSelectRoleForAuth('society_manager')}
                className="group p-5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border-2 border-[#E8E2D5] hover:border-[#B37055] rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] flex items-center justify-center shadow-xs">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAEDE8] text-[#643222] border border-[#F3C5B8]">
                      Society Desk
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#292824] group-hover:text-[#80432E] tracking-tight">
                      Society Manager
                    </h3>
                    <p className="text-xs text-[#77736B] mt-1 leading-relaxed font-normal">
                      Manage stationed workers, inspect worker locations on the map, verify KYC documents, and resolve resident issues.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#80432E]">Login as Manager</span>
                  <ArrowRight className="w-4 h-4 text-[#80432E] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* FEDERATION MANAGER CARD */}
              <div
                onClick={() => onSelectRoleForAuth('federation_manager')}
                className="group p-5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border-2 border-[#E8E2D5] hover:border-[#7A6A8E] rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#EFEBF4] text-[#504161] border border-[#DFD8E8] flex items-center justify-center shadow-xs">
                      <Network className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFEBF4] text-[#3D314C] border border-[#DFD8E8]">
                      Federation Apex
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#292824] group-hover:text-[#504161] tracking-tight">
                      Federation Manager
                    </h3>
                    <p className="text-xs text-[#77736B] mt-1 leading-relaxed font-normal">
                      Coordinate 8 member societies, govern multi-society managers, calibrate matching preferences, and oversee the 25% fund.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#504161]">Login as Federation</span>
                  <ArrowRight className="w-4 h-4 text-[#504161] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guided Demo Scenario Trigger (Discrete at the bottom) */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenGuidedScenario}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] hover:text-[#292824] border border-[#E8E2D5] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-[#6E8B67]" />
            <span>Interactive Demo: Test Full Household to Worker Lifecycle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
