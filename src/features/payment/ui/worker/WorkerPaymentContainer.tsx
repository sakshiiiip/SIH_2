import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  BarChart2,
  History,
  IndianRupee,
  ChevronLeft,
} from 'lucide-react';
import { WorkerEarningsDashboard } from './WorkerEarningsDashboard';
import { EarningsBreakdown } from './EarningsBreakdown';
import { PaymentHistory } from './PaymentHistory';

// ─── types ────────────────────────────────────────────────────────────────────

type PaymentView = 'dashboard' | 'breakdown' | 'history';

interface WorkerPaymentContainerProps {
  /** Worker ID to load data for. Defaults to the demo worker. */
  workerId?: string;
  /** Optional callback to navigate back / close the payment section. */
  onClose?: () => void;
}

// ─── nav item ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  id: PaymentView;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ id, label, sublabel, icon, isActive, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      id={`payment-nav-${id}`}
      onClick={onClick}
      className={`flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5 p-3 sm:p-4 rounded-2xl text-left transition-all cursor-pointer border ${
        isActive
          ? 'bg-[#FCF9F3] border-[#B8CBDD] shadow-card'
          : 'bg-transparent border-transparent hover:bg-[#FCF9F3]/70 hover:border-[#E8E2D5]'
      }`}
    >
      <span
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isActive ? 'bg-[#E4EDF4] text-[#324F66]' : 'bg-[#F3EEE4] text-[#77736B]'
        }`}
      >
        {icon}
      </span>
      <div className="hidden sm:block min-w-0">
        <p className={`text-sm font-bold leading-tight truncate ${isActive ? 'text-[#292824]' : 'text-[#524E47]'}`}>
          {label}
        </p>
        <p className="text-[11px] text-[#9A958B] mt-0.5 truncate">{sublabel}</p>
      </div>
      <p className={`sm:hidden text-[11px] font-semibold text-center ${isActive ? 'text-[#324F66]' : 'text-[#9A958B]'}`}>
        {label}
      </p>
      {isActive && (
        <span className="hidden sm:block ml-auto w-1.5 h-1.5 rounded-full bg-[#537895] shrink-0 mt-1" />
      )}
    </button>
  );
}

// ─── main container ───────────────────────────────────────────────────────────

export const WorkerPaymentContainer: React.FC<WorkerPaymentContainerProps> = ({
  workerId = 'w_rahul',
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<PaymentView>('dashboard');

  const views: { id: PaymentView; label: string; sublabel: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: t('worker.paymentUi.dashboardNav', 'Dashboard'),
      sublabel: t('worker.paymentUi.dashboardSub', "Today's overview"),
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'breakdown',
      label: t('worker.paymentUi.analyticsNav', 'Analytics'),
      sublabel: t('worker.paymentUi.analyticsSub', 'Weekly & monthly'),
      icon: <BarChart2 className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: t('worker.paymentUi.paymentsNav', 'Payments'),
      sublabel: t('worker.paymentUi.paymentsSub', 'History & filters'),
      icon: <History className="w-4 h-4" />,
    },
  ];

  const currentView = views.find((v) => v.id === activeView)!;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-1">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer shrink-0"
            aria-label={t('common.back', 'Back')}
          >
            <ChevronLeft className="w-4 h-4 text-[#77736B]" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#364A32] to-[#6E8B67] flex items-center justify-center shadow-card shrink-0">
            <IndianRupee className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292824] leading-tight">
              {t('worker.earnings.myEarnings', 'My Earnings')}
            </h1>
            <p className="text-xs text-[#77736B] mt-0.5">
              {t('worker.earnings.earningsSubtitle', 'Cooperative Worker · 70% Revenue Share')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ───────────────────────────────────────────── */}
      <nav
        className="flex items-stretch gap-1.5 p-1.5 bg-[#F3EEE4] rounded-2xl border border-[#E8E2D5]"
        role="tablist"
        aria-label="Earnings sections"
      >
        {views.map((v) => (
          <NavItem
            key={v.id}
            id={v.id}
            label={v.label}
            sublabel={v.sublabel}
            icon={v.icon}
            isActive={activeView === v.id}
            onClick={() => setActiveView(v.id)}
          />
        ))}
      </nav>

      {/* ── Breadcrumb pill (mobile only) ────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:hidden">
        <span className="text-[11px] text-[#9A958B]">{t('nav.earnings', 'Earnings')}</span>
        <span className="text-[11px] text-[#BCB7AD]">/</span>
        <span className="text-[11px] font-semibold text-[#292824]">{currentView.label}</span>
      </div>

      {/* ── View content ─────────────────────────────────────────────── */}
      <div
        key={activeView}
        className="animate-fade-in"
        role="tabpanel"
        aria-labelledby={`payment-nav-${activeView}`}
      >
        {activeView === 'dashboard' && (
          <WorkerEarningsDashboard
            workerId={workerId}
            onViewHistory={() => setActiveView('history')}
            onViewBreakdown={() => setActiveView('breakdown')}
          />
        )}

        {activeView === 'breakdown' && (
          <EarningsBreakdown workerId={workerId} />
        )}

        {activeView === 'history' && (
          <PaymentHistory workerId={workerId} defaultTab="pending" />
        )}
      </div>

      {/* ── Bottom quick-nav (secondary, mobile-friendly) ────────────── */}
      <div className="sm:hidden fixed bottom-20 left-0 right-0 px-4 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-center pointer-events-auto">
          <div className="flex items-center gap-1 bg-[#292824]/90 backdrop-blur-sm rounded-2xl p-1 shadow-float">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(v.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === v.id
                    ? 'bg-[#6E8B67] text-white shadow-xs'
                    : 'text-[#A8B9A3] hover:text-white'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
