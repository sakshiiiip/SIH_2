import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { ToolBankItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Wrench, CheckCircle2, Clock, Sparkles, Compass, AlertCircle, RotateCcw } from 'lucide-react';

export const WorkerToolBank: React.FC = () => {
  const { toolBank, borrowTool, returnTool, currentUser } = useCooperativeStore();

  const [selectedTool, setSelectedTool] = useState<ToolBankItem | null>(null);
  const [borrowDays, setBorrowDays] = useState<number>(3);

  const handleBorrow = () => {
    if (!selectedTool) return;
    borrowTool(selectedTool.id, currentUser.id, currentUser.name, borrowDays);
    setSelectedTool(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <Badge variant="coop" className="mb-2">
          Shared Collective Assets
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Cooperative Tool Bank
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Workers don’t need to take predatory micro-loans to buy expensive machinery.
          Our community fund purchases industrial-grade drills, thermal diagnostic cameras, and threaders available on zero-cost loan.
        </p>
      </div>

      {/* Tool Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolBank.map((tool) => {
          const isBorrowedByMe =
            tool.status === 'borrowed' && tool.borrowedByWorkerId === currentUser.id;

          return (
            <Card key={tool.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <Badge
                    variant={
                      tool.status === 'available'
                        ? 'verified'
                        : tool.status === 'borrowed'
                        ? 'pending'
                        : 'danger'
                    }
                  >
                    {tool.status === 'available'
                      ? 'Available'
                      : tool.status === 'borrowed'
                      ? 'Checked Out'
                      : 'Maintenance'}
                  </Badge>
                </div>

                <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">
                  {tool.category} · <span className="font-mono">#{tool.serialNumber}</span>
                </span>
                <h3 className="font-bold text-[#292824] text-base mt-0.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-[#77736B] mt-1">
                  Condition: <strong className="text-[#292824] capitalize">{tool.condition}</strong>
                </p>

                {tool.status === 'borrowed' && (
                  <div className="mt-3 p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl text-xs text-[#80432E] space-y-0.5">
                    <div>
                      Borrowed by: <strong>{tool.borrowedByWorkerName}</strong>
                    </div>
                    <div className="text-[#77736B]">Due Date: <span className="font-mono">{tool.returnDate}</span></div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                {tool.status === 'available' ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => setSelectedTool(tool)}
                  >
                    Request Checkout (Free)
                  </Button>
                ) : isBorrowedByMe ? (
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-teal-800"
                    onClick={() => returnTool(tool.id)}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Return Tool to Hub
                  </Button>
                ) : (
                  <Button
                    variant="subtle"
                    size="md"
                    className="w-full opacity-60 cursor-not-allowed"
                    disabled
                  >
                    Unavailable until {tool.returnDate}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* CHECKOUT MODAL */}
      <Modal
        isOpen={selectedTool !== null}
        onClose={() => setSelectedTool(null)}
        title="Check Out Cooperative Tool"
        subtitle={selectedTool?.name}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
            You are borrowing this item as a verified member of the Baner Cooperative Hub. Zero rental fee applies.
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Borrow Duration (Days):
            </label>
            <select
              value={borrowDays}
              onChange={(e) => setBorrowDays(Number(e.target.value))}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            >
              <option value={1}>1 Day (Return tomorrow)</option>
              <option value={2}>2 Days</option>
              <option value={3}>3 Days (Recommended)</option>
              <option value={7}>7 Days (Major contract)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button
              variant="subtle"
              size="md"
              onClick={() => setSelectedTool(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleBorrow}
            >
              Confirm Tool Checkout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
