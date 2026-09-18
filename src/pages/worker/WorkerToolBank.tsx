import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { ToolBankItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Wrench,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  Search,
} from 'lucide-react';

export const WorkerToolBank: React.FC = () => {
  const { toolBank, borrowTool, returnTool, currentUser, showToast } = useCooperativeStore();

  const [selectedTool, setSelectedTool] = useState<ToolBankItem | null>(null);
  const [borrowDays, setBorrowDays] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Issued tools borrowed by this worker
  const myIssuedTools = toolBank.filter(
    (tool) => tool.status === 'borrowed' && tool.borrowedByWorkerId === currentUser.id
  );

  // Available catalog
  const availableTools = toolBank.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tool.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleBorrow = () => {
    if (!selectedTool) return;
    borrowTool(selectedTool.id, currentUser.id, currentUser.name, borrowDays);
    setSelectedTool(null);
    showToast({
      title: 'Tool Checkout Confirmed! 🔧',
      message: `${selectedTool.name} reserved for ${borrowDays} days. Free zero-interest member loan.`,
      type: 'success',
    });
  };

  const handleReturn = (tool: ToolBankItem) => {
    returnTool(tool.id);
    showToast({
      title: 'Tool Returned to Hub ✅',
      message: `${tool.name} checked back into depot. Society manager will inspect condition.`,
      type: 'info',
    });
  };

  const categories = ['all', 'Plumbing', 'Electrical', 'Carpentry', 'General'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#80432E] bg-[#FAEDE8] px-2.5 py-0.5 rounded-md border border-[#F4DCD3]">
              Collective Asset Depot
            </span>
            <Badge variant="coop" size="sm">Zero-Cost Loan</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292824] tracking-tight">
            Tool Bank
          </h1>
          <p className="text-xs sm:text-sm text-[#77736B] mt-1">
            Borrow industrial-grade machinery, rotary hammers, and diagnostic cameras with zero interest or deposit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const firstAvailable = toolBank.find((t) => t.status === 'available');
            if (firstAvailable) setSelectedTool(firstAvailable);
          }}
          className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Tool →</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. MY TOOLS / ISSUED TOOLS SECTION                           */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E4EDF4] text-[#324F66] flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#292824]">
                My Tools (Issued to You)
              </h2>
              <span className="text-xs text-[#77736B]">Currently active tool checkouts under your account</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#324F66] bg-[#E4EDF4] px-2.5 py-1 rounded-lg border border-[#B8CBDD]">
            {myIssuedTools.length} Active {myIssuedTools.length === 1 ? 'Loan' : 'Loans'}
          </span>
        </div>

        {myIssuedTools.length === 0 ? (
          <div className="p-6 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl text-center space-y-1.5">
            <CheckCircle2 className="w-7 h-7 text-[#6E8B67] mx-auto opacity-70" />
            <p className="text-xs font-bold text-[#292824]">No tools currently issued to you</p>
            <p className="text-[11px] text-[#77736B]">
              Browse the catalog below to request industrial machinery for upcoming assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {myIssuedTools.map((tool) => (
              <div
                key={tool.id}
                className="p-4 bg-[#FAF7F2] border-2 border-[#B8CBDD] rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#324F66] bg-[#E4EDF4] px-2 py-0.5 rounded-md border border-[#B8CBDD]">
                      {tool.category} · #{tool.serialNumber}
                    </span>
                    <Badge variant="pending" size="sm">Checked Out</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#292824] mt-1.5">{tool.name}</h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Condition: <strong className="text-[#292824] capitalize">{tool.condition}</strong>
                  </p>

                  <div className="mt-2.5 p-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#77736B] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#80432E]" /> Due Date:
                      </span>
                      <strong className="text-[#80432E] font-mono">{tool.returnDate || 'Tomorrow'}</strong>
                    </div>
                    <div className="text-[10px] text-[#77736B]">
                      Society Depot: Green Residency Hub B
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E2D5]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleReturn(tool)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Return Tool to Hub
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. TOOL AVAILABILITY CATALOG                                 */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#292824]">Tool Availability Catalog</h2>
            <p className="text-xs text-[#77736B]">Equipment ready for free member reservation at society depot</p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#77736B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="pl-8 pr-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#F3EEE4] p-0.5 rounded-xl text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                    categoryFilter === cat ? 'bg-white text-[#292824] shadow-xs' : 'text-[#77736B] hover:text-[#292824]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableTools.map((tool) => {
            const isAvailable = tool.status === 'available';
            const isBorrowedByMe =
              tool.status === 'borrowed' && tool.borrowedByWorkerId === currentUser.id;

            return (
              <Card
                key={tool.id}
                className="p-4 sm:p-5 bg-[#FCF9F3] border-[#E8E2D5] flex flex-col justify-between space-y-3 shadow-card hover:border-[#CFDDD0] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#77736B]">
                      {tool.category} · #{tool.serialNumber}
                    </span>
                    <Badge
                      variant={
                        isAvailable ? 'verified' : isBorrowedByMe ? 'pending' : 'neutral'
                      }
                      size="sm"
                    >
                      {isAvailable
                        ? 'Available'
                        : isBorrowedByMe
                        ? 'Issued to You'
                        : 'Checked Out'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#292824] mt-1">{tool.name}</h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Condition: <strong className="text-[#292824] capitalize">{tool.condition}</strong>
                  </p>

                  {!isAvailable && !isBorrowedByMe && (
                    <div className="mt-2 text-[11px] text-[#77736B] p-2 bg-[#FAF7F2] rounded-lg border border-[#E8E2D5]">
                      Expected return: <span className="font-mono font-bold text-[#80432E]">{tool.returnDate}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E8E2D5]">
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => setSelectedTool(tool)}
                      className="w-full py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Request Tool →
                    </button>
                  ) : isBorrowedByMe ? (
                    <button
                      type="button"
                      onClick={() => handleReturn(tool)}
                      className="w-full py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#B8CBDD] text-[#324F66] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Return Tool to Hub
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 bg-[#F3EEE4] text-[#9A958B] text-xs font-bold rounded-xl cursor-not-allowed opacity-75"
                    >
                      Unavailable ({tool.returnDate})
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CHECKOUT / REQUEST TOOL MODAL */}
      <Modal
        isOpen={selectedTool !== null}
        onClose={() => setSelectedTool(null)}
        title="Request Cooperative Tool Checkout"
        subtitle={selectedTool?.name}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#E6ECE4] border border-[#CFDDD0] rounded-xl text-xs text-[#364A32]">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />
              Zero-Cost Member Benefit
            </p>
            <p className="text-[11px] text-[#527048] mt-0.5">
              As a verified cooperative specialist, no deposit or rental charges apply. Please return on or before due date.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              Borrow Duration:
            </label>
            <select
              value={borrowDays}
              onChange={(e) => setBorrowDays(Number(e.target.value))}
              className="w-full p-2.5 border border-[#E8E2D5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6E8B67] bg-white"
            >
              <option value={1}>1 Day (Return tomorrow by 6 PM)</option>
              <option value={2}>2 Days</option>
              <option value={3}>3 Days (Recommended standard)</option>
              <option value={7}>7 Days (Multi-day contract)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
            <Button variant="subtle" size="sm" onClick={() => setSelectedTool(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleBorrow}>
              Confirm Checkout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
