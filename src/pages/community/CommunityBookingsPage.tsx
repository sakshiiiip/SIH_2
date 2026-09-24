import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Calendar,
  CheckCircle2,
  Plus,
  MessageSquare,
  Send,
  Hash,
} from 'lucide-react';

export const CommunityBookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentUser,
    communityBookings,
    communityChannels,
    communityMessages,
    joinCommunityBooking,
    createCommunityBooking,
    postCommunityMessage,
    showToast,
  } = useCooperativeStore();

  const isWorker = currentUser.role === 'worker';
  const isCustomer = currentUser.role === 'customer';
  const isManager = ['society_manager', 'federation_manager', 'federation_admin'].includes(currentUser.role);

  // Filter channels based on role
  const availableChannels = communityChannels.filter((ch) => {
    if (isManager) return true;
    if (isWorker) {
      return ch.targetRoles ? (ch.targetRoles.includes('worker') || ch.targetRoles.includes('all')) : true;
    }
    return ch.targetRoles ? (ch.targetRoles.includes('customer') || ch.targetRoles.includes('all')) : true;
  });

  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    availableChannels[0]?.id || (isWorker ? 'guild_plumbing' : 'soc_announcements')
  );
  const [activeMainTab, setActiveMainTab] = useState<'discussions' | 'group_bookings'>('discussions');

  const [messageInput, setMessageInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSociety, setNewSociety] = useState(currentUser.societyName || 'Green Residency');
  const [newService, setNewService] = useState('Plumbing');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('Upcoming Saturday, 10:00 AM');
  const [flatNumber, setFlatNumber] = useState(currentUser.address?.split(',')[0] || 'Flat 402');

  const selectedChannel = communityChannels.find((ch) => ch.id === selectedChannelId) || availableChannels[0];
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

  const handleJoin = (batchId: string) => {
    joinCommunityBooking(batchId, currentUser.name, flatNumber);
    showToast({
      title: t('groupBooking.joinedGroupSuccess', 'Joined Group Booking'),
      message: t('groupBooking.joinedGroupMsg', 'Added to community bulk request with 20% savings.'),
      type: 'success',
    });
  };

  const handleCreateBatch = () => {
    if (!newDescription.trim()) {
      alert(t('groupBooking.enterBriefDesc', 'Please enter a brief description of the group requirement.'));
      return;
    }
    createCommunityBooking({
      societyName: newSociety,
      serviceCategory: newService,
      description: newDescription,
      scheduledDate: newDate,
    });
    setShowCreateModal(false);
    setNewDescription('');
    showToast({
      title: t('groupBooking.groupCreatedTitle', 'Group Booking Created'),
      message: t('groupBooking.groupCreatedMsg', 'Neighbors in your society can now join this request.'),
      type: 'success',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#445D3E] bg-[#E6ECE4] px-2.5 py-0.5 rounded-md border border-[#CFDDD0]">
              {isWorker ? t('community.workerCommunityBadge', 'My Professional Community') : t('community.customerCommunityBadge', 'Your Community')}
            </span>
            <Badge variant="coop" size="sm">{currentUser.societyName || 'Green Residency'}</Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#292824] tracking-tight leading-tight">
            {isWorker ? t('community.workerHubTitle', 'Professional Trade Guilds') : t('community.hubTitle', 'Your Community Hub')}
          </h1>
          <p className="text-xs sm:text-sm text-[#77736B] mt-0.5 font-normal leading-relaxed">
            {isWorker
              ? t('community.workerHubSubtitle', 'Connect with certified trade peers, share tool tips, coordinate emergency aid, and discuss technical standards.')
              : t('community.hubSubtitle', 'Society maintenance updates, neighbor discussions, and collective group bookings with 20% savings.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCustomer && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {t('groupBooking.startGroupBooking', 'Start Group Booking')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs (Discussions vs Group Bookings) */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2">
        <button
          onClick={() => setActiveMainTab('discussions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'discussions'
              ? 'bg-[#292824] text-[#FAF7F2] shadow-xs'
              : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isWorker ? t('community.guildChannels', 'Trade Guild Channels') : t('community.discussions', 'Community Discussions')}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveMainTab('group_bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'group_bookings'
              ? 'bg-[#292824] text-[#FAF7F2] shadow-xs'
              : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{t('community.neighborsBooking', 'Your neighbors are booking')} ({communityBookings.length})</span>
            <span className="text-[10px] bg-[#FAEDE8] text-[#80432E] px-1.5 py-0.2 rounded font-black">20% OFF</span>
          </div>
        </button>
      </div>

      {/* VIEW 1: DISCUSSIONS & CHANNELS */}
      {activeMainTab === 'discussions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channel Sidebar */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77736B] block">
              {isWorker ? t('community.myGuilds', 'My Professional Guilds') : t('community.channels', 'Community Channels')}
            </span>
            <div className="space-y-1.5">
              {availableChannels.map((channel) => {
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

          {/* Chat / Message Stream */}
          <div className="md:col-span-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl p-5 shadow-card flex flex-col h-[560px]">
            {/* Channel header */}
            <div className="pb-3 border-b border-[#E8E2D5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#6E8B67]" />
                  <h3 className="font-extrabold text-[#292824] text-base">{selectedChannel?.name}</h3>
                </div>
                <p className="text-xs text-[#77736B] mt-0.5">{selectedChannel?.description}</p>
              </div>
              <Badge variant="verified" size="sm">{t('community.coopVerified', 'Cooperative Verified')}</Badge>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {channelMessages.length === 0 ? (
                <div className="text-center py-16 text-[#77736B]">
                  <MessageSquare className="w-8 h-8 text-[#9A958B] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">{t('community.noMessages', 'No messages yet in #{{name}}.', { name: selectedChannel?.name })}</p>
                  <p className="text-xs text-[#9A958B] mt-1">{t('community.startConversation', 'Start the conversation with your community below.')}</p>
                </div>
              ) : (
                channelMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      {msg.authorAvatar ? (
                        <img
                          src={msg.authorAvatar}
                          alt={msg.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-[#E8E2D5]"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#E6ECE4] text-[#445D3E] font-bold text-[10px] flex items-center justify-center">
                          {msg.authorName.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-bold text-[#292824]">{msg.authorName}</span>
                      {msg.authorProfession && (
                        <span className="text-[10px] font-semibold text-[#80432E] bg-[#FAEDE8] px-1.5 py-0.2 rounded">
                          {msg.authorProfession}
                        </span>
                      )}
                      {msg.isOfficial && (
                        <span className="text-[10px] font-bold text-[#6E8B67] bg-[#E6ECE4] px-1.5 py-0.2 rounded">
                          {t('community.officialNotice', 'Official Notice')}
                        </span>
                      )}
                      <span className="text-[10px] text-[#9A958B] ml-auto">{msg.timestamp}</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8E2D5] text-xs text-[#292824] leading-relaxed ml-8">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E8E2D5] flex items-center gap-2">
              <input
                type="text"
                placeholder={t('community.postUpdatePlaceholder', 'Post update to #{{name}}...', { name: selectedChannel?.name || 'channel' })}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 py-2.5 px-4 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white rounded-xl transition-colors cursor-pointer"
                aria-label={t('common.send', 'Send message')}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: GROUP BOOKINGS ("Your neighbors are booking") */}
      {activeMainTab === 'group_bookings' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#E6ECE4] rounded-2xl border border-[#CFDDD0] flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#445D3E] flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#2A3927]">{t('community.howGroupBookingsWork', 'How Cooperative Group Bookings Work')}</h4>
              <p className="text-[11px] text-[#364A32] mt-0.5 leading-relaxed">
                {t('community.howGroupBookingsWorkDesc', 'When multiple households in the same society book identical services together on the same scheduled day, cooperative workers optimize travel time. You unlock direct 20% discounts while specialists earn uninterrupted bulk wages.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityBookings.map((batch) => {
              const hasJoined = batch.participants.some((p) => p.customerName === currentUser.name);

              return (
                <div
                  key={batch.id}
                  className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#80432E] bg-[#FAEDE8] border border-[#F3C5B8] px-2 py-0.5 rounded-md">
                        {batch.serviceCategory}
                      </span>
                      <span className="text-xs text-[#77736B] font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{batch.scheduledDate}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#292824] leading-snug">
                      {batch.description}
                    </h3>
                    <p className="text-xs text-[#77736B]">{batch.societyName}</p>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D5] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#77736B]">{t('community.groupDiscountTarget', 'Group Discount Target:')}</span>
                        <strong className="text-[#445D3E] font-black">{batch.targetDiscountPercent}% OFF</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#77736B]">{t('community.participatingHouseholds', 'Participating Households:')}</span>
                        <strong className="text-[#292824] font-bold">{batch.participantCount} {t('community.homesJoined', 'Homes Joined')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between">
                    <span className="text-xs text-[#77736B] font-medium">
                      {t('common.status', 'Status:')} <strong className="text-[#6E8B67] capitalize">{batch.status}</strong>
                    </span>

                    {hasJoined ? (
                      <span className="px-3 py-1.5 bg-[#E6ECE4] text-[#364A32] text-xs font-bold rounded-xl border border-[#CFDDD0] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                        <span>{t('community.joinedBatch', 'Joined Batch')}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoin(batch.id)}
                        className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {t('groupBooking.joinGroup', 'Join Group Booking')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('groupBooking.startSocietyGroupBooking', 'Start Society Group Booking')}
        subtitle={t('groupBooking.inviteNeighborsDesc', 'Invite neighbors in your society to save together')}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#292824] block mb-1">{t('wizard.serviceCategory', 'Service Category')}</label>
            <select
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full p-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Deep Cleaning</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Appliance Repairs">Appliance Repairs</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#292824] block mb-1">{t('community.descGoal', 'Description / Goal')}</label>
            <input
              type="text"
              placeholder={t('community.descGoalPlaceholder', 'e.g. Society-wide AC deep cleaning & filter wash before summer')}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
            />
          </div>

          <div>
            <label className="font-bold text-[#292824] block mb-1">{t('groupBooking.targetDate', 'Target Date')}</label>
            <input
              type="text"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleCreateBatch}
              className="px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {t('community.createGroupRequest', 'Create Group Request')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
