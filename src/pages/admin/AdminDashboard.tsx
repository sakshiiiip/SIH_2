import React from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  HardHat,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Activity,
  Cpu,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTab }) => {
  const {
    workers,
    bookings,
    cooperativeFund,
    emergencyAidRequests,
  } = useCooperativeStore();

  const activeBookings = bookings.filter(
    (b) => !['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );
  const emergencyBookings = bookings.filter((b) => b.urgencyTier === 'EMERGENCY');
  const pendingVerifications = workers.filter(
    (w) => w.verificationStatus === 'UNDER_REVIEW' || w.verificationStatus === 'PENDING'
  );
  const qualityDisputes = bookings.filter((b) => b.state === 'QUALITY_ISSUE' || b.state === 'REVISIT');
  const completedBookings = bookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const totalPaymentVolume = bookings.reduce((sum, b) => sum + b.pricing.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Cooperative Governance Center
            </h1>
            <Badge variant="coop">Apex Council</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time monitoring of fair allocation, verification queues, and cooperative reserves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelectTab('admin_matching')}
            leftIcon={<Cpu className="w-3.5 h-3.5" />}
          >
            Matching Engine
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectTab('admin_verification')}
          >
            Verification Queue ({pendingVerifications.length})
          </Button>
        </div>
      </div>

      {/* EMERGENCY & QUALITY PRIORITY ALERTS */}
      {(emergencyBookings.length > 0 || qualityDisputes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyBookings.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-950">
                    {emergencyBookings.length} Emergency Request Active
                  </h4>
                  <p className="text-xs text-rose-700">
                    Dispatched in priority queue. Monitor worker response.
                  </p>
                </div>
              </div>
              <Button
                variant="emergency"
                size="sm"
                onClick={() => onSelectTab('admin_matching')}
              >
                Inspect
              </Button>
            </div>
          )}

          {qualityDisputes.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    {qualityDisputes.length} Quality Dispute Pending
                  </h4>
                  <p className="text-xs text-amber-700">
                    Customer reported service dissatisfaction. Revisit required.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectTab('admin_quality')}
                className="border-amber-300 text-amber-900 bg-white"
              >
                Resolve
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 7 OVERVIEW METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Active Requests
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {activeBookings.length}
          </div>
          <span className="text-[11px] text-teal-700 font-medium mt-1 block">
            Across 4 residential wards
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Verified Workers
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {workers.filter((w) => w.verificationStatus === 'VERIFIED').length}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            100% background cleared
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Pending Verification
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {pendingVerifications.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            KYC & practical test queue
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Cooperative Fund Balance
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-800 mt-1">
            ₹{(cooperativeFund.balance / 1000).toFixed(1)}k
          </div>
          <span className="text-[11px] text-teal-700 font-medium mt-1 block">
            +₹{cooperativeFund.monthlyContributions} this month
          </span>
        </Card>
      </div>

      {/* QUICK WORKFLOW PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">AI Fair Matching Engine</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Inspect candidate compatibility scores, multi-factor breakdowns, and override automated dispatches.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => onSelectTab('admin_matching')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Matching Visualizer
          </Button>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Worker Verification Queue</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review applicant KYC identity docs, ITI trade credentials, and practical assessment results.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => onSelectTab('admin_verification')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review Applicants ({pendingVerifications.length})
          </Button>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cooperative Treasury</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              View transparent fund allocations, approve worker emergency aid, and review tool bank inventory.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => onSelectTab('admin_fund')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Manage Cooperative Fund
          </Button>
        </Card>
      </div>
    </div>
  );
};
