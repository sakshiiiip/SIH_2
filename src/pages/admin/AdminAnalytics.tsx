import React from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  Star,
  Activity,
  Award,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { bookings, workers, communityBookings } = useCooperativeStore();

  const totalBookings = bookings.length + 184; // base historical
  const completedBookings = bookings.filter((b) => ['COMPLETED', 'PAID', 'RATED'].includes(b.state)).length + 176;
  const avgRating = 4.88;
  const avgMatchTime = '42 sec';
  const avgCompletionTime = '54 min';
  const emergencyResponseTime = '11 min';
  const workerUtilization = '76%';
  const communityParticipation = '32%';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="coop" className="mb-2">
          Operational Intelligence
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Platform Performance & Worker Welfare Analytics
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Real-time metrics tracking algorithmic efficiency, cooperative fairness, dispatch latencies, and service satisfaction.
        </p>
      </div>

      {/* METRIC GRIDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-[#77736B] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Match Latency</span>
            <Clock className="w-4 h-4 text-[#6E8B67]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824]">
            {avgMatchTime}
          </div>
          <span className="text-[11px] text-[#445D3E] font-medium mt-1 block">
            AI Multi-factor scoring
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-[#77736B] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Emergency Response</span>
            <ShieldAlert className="w-4 h-4 text-[#C93B2B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#C93B2B]">
            {emergencyResponseTime}
          </div>
          <span className="text-[11px] text-[#77736B] mt-1 block">
            Priority dispatch median
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-[#77736B] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Worker Utilization</span>
            <Activity className="w-4 h-4 text-[#537895]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824]">
            {workerUtilization}
          </div>
          <span className="text-[11px] text-[#445D3E] font-medium mt-1 block">
            Optimal work-life balance
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-[#77736B] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Satisfaction Rating</span>
            <Star className="w-4 h-4 text-[#B37055] fill-[#B37055]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824]">
            {avgRating} ★
          </div>
          <span className="text-[11px] text-[#77736B] mt-1 block">
            Across 230+ customer ratings
          </span>
        </Card>
      </div>

      {/* VISUAL REPORT CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Distribution Fairness Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#292824] text-base">
                Worker Workload Distribution (Fairness Index)
              </h3>
              <p className="text-xs text-[#77736B]">
                Comparing active jobs allocated across workers to verify workload balancing
              </p>
            </div>
            <Badge variant="verified">Balanced <span className="font-mono">94%</span></Badge>
          </div>

          <div className="space-y-3 pt-2">
            {workers.slice(0, 5).map((w) => (
              <div key={w.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#292824]">{w.name} ({w.skills[0]})</span>
                  <span className="text-[#77736B] font-mono">{w.currentWorkload}% capacity</span>
                </div>
                <div className="w-full bg-[#E8E2D5] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6E8B67] h-full rounded-full transition-all"
                    style={{ width: `${w.currentWorkload}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Demand by Service Category */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-[#292824] text-base">
              Monthly Service Volume by Category
            </h3>
            <p className="text-xs text-[#77736B]">
              Community residential demand across the Baner / Aundh cluster
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { cat: 'Plumbing & Water Lines', percent: 38, count: '94 jobs' },
              { cat: 'Electrical Troubleshooting', percent: 28, count: '69 jobs' },
              { cat: 'Eco-Deep Cleaning & Sanitization', percent: 18, count: '44 jobs' },
              { cat: 'Carpentry & Lock Fixtures', percent: 10, count: '25 jobs' },
              { cat: 'Elderly Assistance & Errand Runs', percent: 6, count: '15 jobs' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#292824]">{item.cat}</span>
                  <span className="text-[#77736B] font-mono">{item.count} ({item.percent}%)</span>
                </div>
                <div className="w-full bg-[#E8E2D5] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#537895] h-full rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
