import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldAlert, HeartHandshake, CheckCircle2, Clock, Plus } from 'lucide-react';

export const WorkerEmergencyAid: React.FC = () => {
  const { currentUser, emergencyAidRequests, requestEmergencyAid } = useCooperativeStore();

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('10000');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const myAidRequests = emergencyAidRequests.filter(
    (r) => r.workerId === currentUser.id || r.workerName === currentUser.name
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please state the emergency reason.');
      return;
    }
    requestEmergencyAid(currentUser.id, currentUser.name, reason, Number(amount));
    setReason('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="emergency" className="mb-2">
          Cooperative Solidarity Safety Net
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Worker Emergency Relief Aid
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          25% of all booking platform fees accumulate in the member relief fund.
          When accidents, hospitalization, or tool loss strikes, you can apply for non-recourse grants or zero-interest bridge support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card className="p-6 border-slate-200 shadow-card space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-700" />
            <span>Apply for Emergency Assistance</span>
          </h2>

          {isSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Request submitted. The Cooperative Board reviews grants within 24 hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Emergency Situation / Reason:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Sudden medical emergency deposit or vital trade equipment repair..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Requested Assistance Amount (₹):
              </label>
              <select
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
              >
                <option value="5000">₹5,000 (Immediate Micro Relief)</option>
                <option value="10000">₹10,000 (Medical / Equipment Grant)</option>
                <option value="15000">₹15,000 (Hospitalization Bridge)</option>
                <option value="25000">₹25,000 (Severe Hardship Grant)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Submit Aid Application
            </Button>
          </form>
        </Card>

        {/* Previous Applications */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Emergency Aid Application History
          </h2>

          <div className="space-y-3">
            {emergencyAidRequests.map((req) => (
              <Card key={req.id} className="p-4 space-y-2 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {req.workerName}
                  </span>
                  <Badge
                    variant={
                      req.status === 'approved'
                        ? 'verified'
                        : req.status === 'pending'
                        ? 'pending'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {req.status.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600">{req.reason}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8E2D5] text-[#77736B]">
                  <span>Requested: <strong className="font-mono text-[#292824]">₹{req.requestedAmount}</strong></span>
                  <span className="font-mono">{req.requestedDate}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
