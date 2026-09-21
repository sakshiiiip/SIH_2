import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  HeartHandshake,
  Wrench,
  GraduationCap,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AdminCooperativeFund: React.FC = () => {
  const {
    cooperativeFund,
    emergencyAidRequests,
    approveEmergencyAidRequest,
    rejectEmergencyAidRequest,
    config,
    updateConfig,
  } = useCooperativeStore();

  const [workerShare, setWorkerShare] = useState(config.workerSharePercent);
  const [societyShare, setSocietyShare] = useState(config.societySharePercent);
  const [fundShare, setFundShare] = useState(config.cooperativeFundPercent);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (workerShare + societyShare + fundShare !== 100) {
      alert('The three allocation percentages must sum to exactly 100%.');
      return;
    }
    updateConfig({
      workerSharePercent: workerShare,
      societySharePercent: societyShare,
      cooperativeFundPercent: fundShare,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="coop" className="mb-2">
          Democratically Governed Treasury
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Cooperative Fund & Treasury Ledger
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          All surplus retains 100% community auditability. Platform contributions are strictly earmarked for worker health solidarity, shared tool acquisitions, and resident society dividends.
        </p>
      </div>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-[#CFDDD0] bg-gradient-to-br from-white to-[#E6ECE4]/40">
          <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider block">
            Treasury Balance
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824] mt-1">
            ₹{cooperativeFund.balance.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#445D3E] font-medium mt-1 block">
            Audited RBI cooperative account
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider block">
            Emergency Worker Aid
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824] mt-1">
            ₹{cooperativeFund.emergencyAidAllocated.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#80432E] font-medium mt-1 block">
            Liquid medical & crisis pool
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider block">
            Tool Bank Capital
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824] mt-1">
            ₹{cooperativeFund.toolBankAllocated.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#537895] font-medium mt-1 block">
            Diagnostics & power machinery
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider block">
            Vocational Training
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292824] mt-1">
            ₹{cooperativeFund.trainingAllocated.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#445D3E] font-medium mt-1 block">
            Safety & trade apprenticeships
          </span>
        </Card>
      </div>

      {/* CONFIGURABLE REVENUE SPLIT ENGINE */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Configurable Cooperative Payment Distribution Formula
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrators can adjust platform distribution parameters dynamically without changing frontend code.
            </p>
          </div>
          {savedSuccess && (
            <Badge variant="verified">Parameters Saved Successfully ✓</Badge>
          )}
        </div>

        <form onSubmit={handleSaveFormula} className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Worker Take-Home Share (%):
            </label>
            <input
              type="number"
              min={50}
              max={90}
              value={workerShare}
              onChange={(e) => setWorkerShare(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Housing Society Dividend (%):
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={societyShare}
              onChange={(e) => setSocietyShare(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Cooperative Reserve Fund (%):
            </label>
            <input
              type="number"
              min={10}
              max={40}
              value={fundShare}
              onChange={(e) => setFundShare(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="flex items-end">
            <Button variant="primary" size="md" type="submit" className="w-full">
              Update Formula
            </Button>
          </div>
        </form>
      </Card>

      {/* WORKER EMERGENCY AID APPLICATIONS FOR REVIEW */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Pending Worker Emergency Relief Requests
        </h2>

        <div className="space-y-3">
          {emergencyAidRequests.map((req) => (
            <Card key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {req.workerName}
                  </span>
                  <Badge variant={req.status === 'approved' ? 'verified' : req.status === 'pending' ? 'pending' : 'danger'}>
                    {req.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{req.reason}</p>
                <div className="text-[11px] text-[#77736B]">
                  Requested: <span className="font-mono font-bold">₹{req.requestedAmount}</span> · Date: <span className="font-mono">{req.requestedDate}</span>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => rejectEmergencyAidRequest(req.id)}
                    className="text-[#C93B2B]"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => approveEmergencyAidRequest(req.id)}
                  >
                    Approve Grant <span className="font-mono">₹{req.requestedAmount}</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* AUDITABLE TRANSACTION LEDGER */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#292824]">
          Auditable Financial Ledger
        </h2>

        <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden bg-white shadow-subtle">
          <table className="w-full text-left text-xs text-[#524E47]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E2D5] text-[#77736B] uppercase font-semibold">
              <tr>
                <th className="p-3.5">Txn ID & Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {cooperativeFund.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#FAF7F2]/60">
                  <td className="p-3.5 font-mono text-[#292824]">
                    <div>{tx.id}</div>
                    <div className="text-[10px] text-[#77736B]">{tx.date}</div>
                  </td>
                  <td className="p-3.5 capitalize">
                    <span className="bg-[#FAF7F2] text-[#292824] px-2 py-0.5 rounded-md font-medium border border-[#E8E2D5]">
                      {tx.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#292824]">{tx.description}</td>
                  <td className={`p-3.5 text-right font-bold font-mono ${tx.type === 'credit' ? 'text-[#445D3E]' : 'text-[#292824]'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
