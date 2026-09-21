import React from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { UserRole } from '../../types';
import { User, HardHat, ShieldCheck, Building2, Network, PlayCircle, RotateCcw, LogOut, Lock } from 'lucide-react';

interface DemoControlBarProps {
  onOpenGuidedScenario: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({ onOpenGuidedScenario }) => {
  const { currentRole, currentUser, bookings, resetToDemoData, logout } = useCooperativeStore();

  const activeBookingsCount = bookings.filter(
    (b) => !['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  ).length;

  const getRoleIcon = () => {
    switch (currentRole) {
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

  return (
    <div className="bg-[#292824] text-[#FAF7F2] border-b border-[#383530] text-xs py-2 px-4 sm:px-6 relative z-40 shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Role Info Badge (Role Locked - No in-session switcher) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#9A958B] font-semibold hidden sm:inline">
            Active Role:
          </span>
          <div className="flex items-center gap-2 bg-[#383530] px-3 py-1 rounded-xl border border-[#524E47]/70 text-[#FAF7F2] font-medium">
            {getRoleIcon()}
            <span className="text-xs font-semibold">{getRoleLabel()}</span>
            <span className="text-[11px] text-[#9A958B] font-normal">
              ({currentUser.name.split(' ')[0]})
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-[#292824] text-[#A8B9A3] px-1.5 py-0.2 rounded font-mono">
              <Lock className="w-2.5 h-2.5 text-[#A8B9A3]" />
              Locked
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Active indicator */}
          {activeBookingsCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#364A32]/60 border border-[#587352]/70 text-[#CFDDD0] rounded-lg text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8B9A3] animate-pulse" />
              <span>{activeBookingsCount} active job{activeBookingsCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Guided Scenario Demo Runner Button */}
          <button
            onClick={onOpenGuidedScenario}
            className="flex items-center gap-1.5 bg-[#B37055]/20 hover:bg-[#B37055]/30 text-[#E9C5B5] border border-[#B37055]/50 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs"
            title="Launch step-by-step interactive demonstration of Section 44 flow"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#E9C5B5] shrink-0" />
            <span className="font-semibold text-[#FAEDE8]">Interactive Demo Walkthrough</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo bookings, fund ledger, and workers to default state?')) {
                resetToDemoData();
              }
            }}
            className="text-[#BCB7AD] hover:text-[#FAF7F2] p-1.5 rounded-lg hover:bg-[#383530] transition-colors cursor-pointer"
            title="Reset to clean demo data"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Sign Out / Change Role */}
          <button
            onClick={logout}
            className="text-[#BCB7AD] hover:text-[#D9A7A7] p-1.5 rounded-lg hover:bg-[#383530] transition-colors cursor-pointer flex items-center gap-1"
            title="Sign out / Change role"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
