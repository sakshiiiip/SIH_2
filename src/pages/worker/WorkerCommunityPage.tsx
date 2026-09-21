import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Vote,
  Bell,
  GraduationCap,
  Info,
  MessageSquare,
  Hash,
  Send,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface WorkerCommunityPageProps {
  onOpenEmergencyAid?: () => void;
}

export const WorkerCommunityPage: React.FC<WorkerCommunityPageProps> = ({ onOpenEmergencyAid }) => {
  const {
    currentUser,
    communityChannels,
    communityMessages,
    postCommunityMessage,
    showToast,
  } = useCooperativeStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'discussions'>('overview');
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedVoteOption, setSelectedVoteOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Guild channels filter
  const workerChannels = communityChannels.filter(
    (ch) => ch.targetRoles?.includes('worker') || ch.targetRoles?.includes('all') || ch.id.includes('guild')
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    workerChannels[0]?.id || 'guild_plumbing'
  );
  const [messageInput, setMessageInput] = useState('');

  const selectedChannel =
    communityChannels.find((ch) => ch.id === selectedChannelId) || workerChannels[0];
  const channelMessages = communityMessages.filter((m) => m.channelId === selectedChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    postCommunityMessage(
      selectedChannelId,
      currentUser.name,
      currentUser.role,
      messageInput.trim(),
      currentUser.tradeProfession
    );
    setMessageInput('');
  };

  const handleCastVote = () => {
    if (!selectedVoteOption) {
      showToast({ title: 'Please select an option', message: 'Choose your vote preference to proceed.', type: 'warning' });
      return;
    }
    setHasVoted(true);
    showToast({
      title: 'Vote Cast Successfully! 🗳️',
      message: 'Your democratic vote has been recorded on the cooperative ledger.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#364A32] bg-[#E6ECE4] px-2.5 py-0.5 rounded-md border border-[#CFDDD0]">
              Worker Cooperative
            </span>
            <Badge variant="coop" size="sm">{currentUser.societyName || 'Green Residency'}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292824] tracking-tight">
            Community & Cooperative
          </h1>
          <p className="text-xs sm:text-sm text-[#77736B] mt-1">
            Democratic voting, society announcements, guild trade upskilling, and peer discussions.
          </p>
        </div>

        {/* Tab switch between Governance Overview & Guild Discussions */}
        <div className="flex items-center gap-1 bg-[#F3EEE4] p-1 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#292824] shadow-xs border border-[#E8E2D5]'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            Cooperative & Voting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discussions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'discussions'
                ? 'bg-white text-[#292824] shadow-xs border border-[#E8E2D5]'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Trade Guilds</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* ============================================================ */}
          {/* 1. WORKER VOTING (Section 4 Requirement)                     */}
          {/* ============================================================ */}
          <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E6ECE4] text-[#364A32] flex items-center justify-center font-bold">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#292824] leading-tight">Worker Voting & Governance</h2>
                  <span className="text-xs text-[#77736B]">1 Member, 1 Vote Democratic Platform</span>
                </div>
              </div>
              <Badge variant="verified" size="sm">Active Ballots</Badge>
            </div>

            {/* Active Vote Card */}
            <div className="p-4 bg-[#F4F8FC] border border-[#B8CBDD] rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#324F66] bg-[#E4EDF4] px-2 py-0.5 rounded-md border border-[#B8CBDD]">
                    Active Vote #2026-09
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#292824] mt-1.5">
                    Monthly Work Schedule & Fair Rotation Policy
                  </h3>
                  <p className="text-xs text-[#524E47] mt-1">
                    Proposal to adopt an algorithmic peak-hour rotation guaranteeing equitable job distribution across all society zones.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#CDE0EC] text-xs text-[#524E47]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#80432E]" />
                  <span>Vote deadline: <strong>Ends in 3 days</strong> (Sep 21, 2026)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                  <span>Number of votes: <strong>14 members have voted</strong> (88% quota)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#77736B]">Status: {hasVoted ? '✓ You have voted' : 'Open for your ballot'}</span>
                <button
                  type="button"
                  onClick={() => setShowVotingModal(true)}
                  className="px-4 py-2 bg-[#292824] hover:bg-[#3d3a35] text-[#FAF7F2] text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open Voting Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Upcoming Vote Preview */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-[#77736B]">Upcoming Ballot</span>
                <p className="font-semibold text-[#292824]">Cooperative Tool Bank Budget Allocation (₹1.5 Lakh Equipment Grant)</p>
                <span className="text-[11px] text-[#77736B]">Opens Sep 25 · Co-sponsored by Green Residency Society</span>
              </div>
              <Badge variant="neutral" size="sm">Scheduled</Badge>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. COOPERATIVE ANNOUNCEMENTS                                  */}
          {/* ============================================================ */}
          <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAEDE8] text-[#80432E] flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#292824]">Cooperative Announcements</h2>
                  <span className="text-xs text-[#77736B]">Official updates from Federation Board & Society Managers</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'ann-1',
                  date: 'Sep 18, 2026',
                  title: 'Quarterly Cooperative Dividend & Direct Payout Schedule',
                  content: 'All certified specialists with over 95% attendance will receive their quarterly patronage dividend directly to their registered bank accounts by month-end.',
                  tag: 'Finance',
                  tagColor: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]',
                },
                {
                  id: 'ann-2',
                  date: 'Sep 15, 2026',
                  title: 'Annual General Assembly & Trade Safety Workshop',
                  content: 'The 2026 Annual Worker Assembly will take place at the Baner Hub Community Hall on Saturday, Sep 26 at 5:00 PM. High-visibility gear will be distributed.',
                  tag: 'Meeting',
                  tagColor: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]',
                },
                {
                  id: 'ann-3',
                  date: 'Sep 12, 2026',
                  title: 'Emergency Medical Safety Net Expansion',
                  content: 'Emergency relief grant limits increased from ₹15,000 to ₹25,000 for unexpected medical hospitalization or catastrophic tool loss.',
                  tag: 'Relief',
                  tagColor: 'bg-[#EFEBF4] text-[#3D314C] border-[#DFD8E8]',
                },
              ].map((item) => (
                <div key={item.id} className="p-4 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-[11px] text-[#77736B]">{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#292824]">{item.title}</h4>
                  <p className="text-xs text-[#524E47] leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. TRAINING & UPSKILLING UPDATES                             */}
          {/* ============================================================ */}
          <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EFEBF4] text-[#3D314C] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#292824]">Training & Upskilling Updates</h2>
                  <span className="text-xs text-[#77736B]">Skill enhancement programs funded by the Cooperative Fund</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: 'Advanced Heat Pump & HVAC Inverter Diagnostics',
                  level: 'Tier 2 Certified',
                  date: 'Oct 2, 2026',
                  slots: '4 slots remaining',
                  badge: 'Technical',
                },
                {
                  title: 'Solar Micro-Inverter Installation & Safety',
                  level: 'Green Energy Specialist',
                  date: 'Oct 10, 2026',
                  slots: '6 slots remaining',
                  badge: 'High Demand',
                },
                {
                  title: 'PEX Pipe & Modern Compression Fitting Mastery',
                  level: 'Plumbing Guild',
                  date: 'Oct 15, 2026',
                  slots: '2 slots remaining',
                  badge: 'Practical Lab',
                },
                {
                  title: 'Customer Conflict Resolution & Digital Billing',
                  level: 'Service Excellence',
                  date: 'Oct 22, 2026',
                  slots: 'Open Registration',
                  badge: 'Soft Skills',
                },
              ].map((training) => (
                <div
                  key={training.title}
                  className="p-4 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#324F66] bg-[#E4EDF4] px-2 py-0.5 rounded-md border border-[#B8CBDD]">
                        {training.badge}
                      </span>
                      <span className="text-[10px] text-[#80432E] font-bold">{training.slots}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#292824] pt-1">{training.title}</h4>
                    <p className="text-[11px] text-[#77736B]">{training.level} · Date: {training.date}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast({
                        title: 'Registration Submitted! 🎓',
                        message: `You are enrolled in "${training.title}". Confirmation sent to your phone.`,
                        type: 'success',
                      })
                    }
                    className="w-full py-1.5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Enroll (Free for Members)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. COMMUNITY INFORMATION & MUTUAL SOLIDARITY                 */}
          {/* ============================================================ */}
          <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E4EDF4] text-[#324F66] flex items-center justify-center font-bold">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#292824]">Community Information & Mutual Aid</h2>
                  <span className="text-xs text-[#77736B]">Society contacts and cooperative solidarity benefits</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#77736B]">Society Hub</span>
                <p className="font-bold text-[#292824]">{currentUser.societyName || 'Green Residency'}</p>
                <p className="text-[11px] text-[#77736B]">Manager: Rajesh Sharma</p>
                <p className="text-[11px] text-[#537895] font-mono">+91 98220 12345</p>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#77736B]">Cooperative Bank</span>
                <p className="font-bold text-[#292824]">Baner Trade Federation</p>
                <p className="text-[11px] text-[#77736B]">Direct 70% automated split</p>
                <p className="text-[11px] text-[#6E8B67] font-semibold">T+1 Settlement Guaranteed</p>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#77736B]">Solidarity Safety Net</span>
                <p className="font-bold text-[#292824]">Relief Aid Grant</p>
                <p className="text-[11px] text-[#77736B]">Accident & Tool Insurance</p>
                {onOpenEmergencyAid ? (
                  <button
                    type="button"
                    onClick={onOpenEmergencyAid}
                    className="text-[11px] font-bold text-[#80432E] hover:underline block cursor-pointer"
                  >
                    Apply for Relief Aid →
                  </button>
                ) : (
                  <span className="text-[11px] text-[#80432E] font-semibold">Active Member Covered</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TRADE GUILD DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channels list */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              Professional Trade Guilds
            </span>
            <div className="space-y-1.5">
              {workerChannels.map((channel) => {
                const isSelected = selectedChannelId === channel.id;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCF9F3] border-2 border-[#6E8B67] shadow-card ring-1 ring-[#6E8B67]'
                        : 'bg-[#FCF9F3]/60 border border-[#E8E2D5] hover:bg-[#FCF9F3] hover:border-[#CFDDD0]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Hash className={`w-3.5 h-3.5 ${isSelected ? 'text-[#6E8B67]' : 'text-[#9A958B]'}`} />
                        <strong className="text-xs font-bold text-[#292824]">{channel.name}</strong>
                      </div>
                      <p className="text-[11px] text-[#77736B] line-clamp-1 pl-5">
                        {channel.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Stream */}
          <div className="md:col-span-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl p-5 shadow-card flex flex-col h-[560px]">
            <div className="pb-3 border-b border-[#E8E2D5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#6E8B67]" />
                  <h3 className="font-extrabold text-[#292824] text-base">{selectedChannel?.name}</h3>
                </div>
                <p className="text-xs text-[#77736B] mt-0.5">{selectedChannel?.description}</p>
              </div>
              <Badge variant="verified" size="sm">Cooperative Verified</Badge>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {channelMessages.length === 0 ? (
                <div className="text-center py-16 text-[#77736B]">
                  <MessageSquare className="w-8 h-8 text-[#9A958B] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No messages yet in #{selectedChannel?.name}.</p>
                  <p className="text-xs text-[#9A958B] mt-1">Start the technical exchange with your fellow trade peers below.</p>
                </div>
              ) : (
                channelMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E6ECE4] text-[#364A32] font-bold text-[10px] flex items-center justify-center">
                        {msg.authorName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-[#292824]">{msg.authorName}</span>
                      {msg.authorProfession && (
                        <span className="text-[10px] bg-[#E4EDF4] text-[#324F66] px-1.5 py-0.2 rounded font-semibold border border-[#B8CBDD]">
                          {msg.authorProfession}
                        </span>
                      )}
                      <span className="text-[10px] text-[#9A958B] ml-auto">{msg.timestamp}</span>
                    </div>
                    <div className="pl-8">
                      <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E8E2D5] flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Share advice or questions in #${selectedChannel?.name}...`}
                className="flex-1 px-4 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VOTING DASHBOARD MODAL (Section 4 Requirement) */}
      <Modal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        title="Worker Voting Dashboard"
        subtitle="Ballot #2026-09: Monthly Work Schedule & Rotation Policy"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#E4EDF4] border border-[#B8CBDD] rounded-xl flex items-start gap-2.5 text-xs text-[#263D50]">
            <AlertCircle className="w-4 h-4 text-[#324F66] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cooperative Democratic Mandate (Person 5 Integration)</p>
              <p className="text-[11px] text-[#537895] mt-0.5">
                Every verified specialist receives one equal vote. Results are tallied transparently and enforced automatically by the allocation engine.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-[#292824]">Resolution Summary</h4>
            <p className="text-xs text-[#524E47] leading-relaxed">
              Shall the cooperative adopt Policy Directive 4.2 to implement rotation capping at a maximum of 4 consecutive emergency calls per technician per week, routing excess volume to junior certified apprentices?
            </p>
            <div className="flex items-center gap-4 text-xs text-[#77736B] pt-2 border-t border-[#E8E2D5]">
              <span>Deadline: <strong>Sep 21, 2026</strong></span>
              <span>Total eligible voters: <strong>16 members</strong></span>
              <span>Current turnout: <strong>88%</strong></span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              Cast Your Vote:
            </label>
            {[
              { id: 'approve', label: 'In Favor (Approve Directive 4.2)', desc: 'Supports rotation capping and fair load distribution' },
              { id: 'reject', label: 'Oppose (Keep Current Policy)', desc: 'Allow technicians to self-claim unlimited emergency assignments' },
              { id: 'abstain', label: 'Abstain', desc: 'Neutral on this policy amendment' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedVoteOption === opt.id
                    ? 'bg-[#E6ECE4] border-[#6E8B67] ring-1 ring-[#6E8B67]'
                    : 'bg-[#FCF9F3] border-[#E8E2D5] hover:bg-[#F3EEE4]'
                }`}
              >
                <input
                  type="radio"
                  name="vote_option"
                  value={opt.id}
                  checked={selectedVoteOption === opt.id}
                  onChange={() => setSelectedVoteOption(opt.id)}
                  className="mt-1 text-[#6E8B67] focus:ring-[#6E8B67]"
                />
                <div>
                  <span className="text-xs font-bold text-[#292824] block">{opt.label}</span>
                  <span className="text-[11px] text-[#77736B]">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
            <Button variant="subtle" size="sm" onClick={() => setShowVotingModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleCastVote();
                setShowVotingModal(false);
              }}
              disabled={!selectedVoteOption}
            >
              Submit Ballot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
