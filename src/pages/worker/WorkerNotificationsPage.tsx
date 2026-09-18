import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { MOCK_WORKER_NOTIFICATIONS, WorkerNotification } from '../../data/workerMockData';
import {
  Bell,
  BellRing,
  Zap,
  CheckCircle2,
  XCircle,
  DollarSign,
  Megaphone,
  AlertTriangle,
  HeadphonesIcon,
  CalendarClock,
  CheckCheck,
  Inbox,
} from 'lucide-react';

const NOTIF_ICONS: Record<WorkerNotification['type'], React.ReactNode> = {
  new_job:        <Zap className="w-4 h-4 text-[#80432E]" />,
  job_accepted:   <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />,
  job_cancelled:  <XCircle className="w-4 h-4 text-[#9A958B]" />,
  payment:        <DollarSign className="w-4 h-4 text-[#445D3E]" />,
  announcement:   <Megaphone className="w-4 h-4 text-[#537895]" />,
  emergency:      <AlertTriangle className="w-4 h-4 text-[#C93B2B]" />,
  support:        <HeadphonesIcon className="w-4 h-4 text-[#537895]" />,
  schedule_change:<CalendarClock className="w-4 h-4 text-[#7A6A8E]" />,
};

const NOTIF_BG: Record<WorkerNotification['type'], string> = {
  new_job:        'bg-[#FFF5F0] border-[#F4DCD3]',
  job_accepted:   'bg-[#F2F7F2] border-[#CFDDD0]',
  job_cancelled:  'bg-[#FCF9F3] border-[#E8E2D5]',
  payment:        'bg-[#EEF5EE] border-[#CFDDD0]',
  announcement:   'bg-[#EEF4FA] border-[#B8CBDD]',
  emergency:      'bg-[#FFF0F0] border-[#F4D7D7]',
  support:        'bg-[#EEF4FA] border-[#B8CBDD]',
  schedule_change:'bg-[#F5F2FA] border-[#DFD8E8]',
};

export const WorkerNotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useCooperativeStore();

  // Merge store notifications (for worker) with mock notifications
  const storeWorkerNotifs = notifications.filter(
    (n) => n.recipientRole === 'worker' || n.recipientRole === 'all'
  );

  const [mockNotifs, setMockNotifs] = useState<WorkerNotification[]>(MOCK_WORKER_NOTIFICATIONS);

  const unreadCount = storeWorkerNotifs.filter((n) => !n.read).length
    + mockNotifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    storeWorkerNotifs.forEach((n) => {
      if (!n.read) markNotificationAsRead(n.id);
    });
    setMockNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkMockRead = (id: string) => {
    setMockNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#537895]" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#C93B2B] text-white text-xs font-bold rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-[#77736B] mt-1">Stay updated on jobs, payments, and announcements</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#537895] text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Empty state */}
      {storeWorkerNotifs.length === 0 && mockNotifs.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Inbox className="w-12 h-12 text-[#9A958B] mx-auto" />
          <h3 className="text-base font-bold text-[#292824]">No notifications yet</h3>
          <p className="text-xs text-[#77736B]">Job updates, payments, and announcements will appear here.</p>
        </div>
      )}

      {/* Store notifications (real) */}
      {storeWorkerNotifs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">System Notifications</h2>
          {storeWorkerNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                n.read ? 'bg-[#FCF9F3] border-[#E8E2D5] opacity-70' : 'bg-[#FFF8F3] border-[#F4DCD3] shadow-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white border border-[#E8E2D5] rounded-xl shrink-0">
                  <BellRing className="w-4 h-4 text-[#537895]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#292824] line-clamp-1">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#C93B2B] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#77736B] mt-0.5 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-[#9A958B] mt-1 block">{n.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mock notifications */}
      {mockNotifs.length > 0 && (
        <div className="space-y-2">
          {storeWorkerNotifs.length > 0 && (
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">Recent Activity</h2>
          )}
          {mockNotifs.map((n) => {
            const bgClasses = NOTIF_BG[n.type];
            return (
              <div
                key={n.id}
                onClick={() => handleMarkMockRead(n.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-card ${
                  n.read ? `${bgClasses} opacity-60` : `${bgClasses} shadow-card`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-white/70 border border-white rounded-xl shrink-0`}>
                    {NOTIF_ICONS[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold text-[#292824] line-clamp-1 ${!n.read ? 'font-extrabold' : ''}`}>
                        {n.title}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#C93B2B] shrink-0 animate-pulse" />}
                    </div>
                    <p className="text-xs text-[#524E47] mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-[#9A958B] mt-1 block">{n.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
