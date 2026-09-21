import React from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { X, CheckCheck, Bell, AlertTriangle, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking?: (bookingId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBooking,
}) => {
  const { notifications, markNotificationAsRead } = useCooperativeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#292824]/40 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-md bg-[#FCF9F3] h-full shadow-float flex flex-col border-l border-[#E8E2D5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#6E8B67]" />
            <h3 className="font-semibold text-[#292824] text-base">Notifications</h3>
            <span className="text-xs bg-[#F3EEE4] text-[#524E47] px-2 py-0.5 rounded-full font-medium">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3EEE4] hover:bg-[#EBE4D6] text-[#77736B] hover:text-[#292824] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#E8E2D5]/70">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#9A958B]">
              <Bell className="w-10 h-10 mx-auto stroke-1 text-[#D8D3C8] mb-2" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const icons = {
                emergency: <ShieldAlert className="w-4 h-4 text-[#B86B6B] shrink-0 mt-0.5" />,
                warning: <AlertTriangle className="w-4 h-4 text-[#B37055] shrink-0 mt-0.5" />,
                success: <CheckCircle2 className="w-4 h-4 text-[#6E8B67] shrink-0 mt-0.5" />,
                info: <Info className="w-4 h-4 text-[#537895] shrink-0 mt-0.5" />,
              };

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.relatedBookingId && onSelectBooking) {
                      onSelectBooking(n.relatedBookingId);
                      onClose();
                    }
                  }}
                  className={`pt-2.5 first:pt-0 p-2 rounded-xl transition-all cursor-pointer ${
                    !n.read ? 'bg-[#E6ECE4]/50 border border-[#CFDDD0]' : 'hover:bg-[#F3EEE4]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {icons[n.type] || icons.info}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#292824] truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#9A958B] shrink-0">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#524E47] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      {n.relatedBookingId && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#445D3E]">
                          <span>View Job Details</span>
                          <span>→</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E8E2D5] bg-[#F3EEE4] flex items-center justify-between text-xs text-[#77736B]">
          <span>Real-time platform activity</span>
          <button
            onClick={() => notifications.forEach((n) => markNotificationAsRead(n.id))}
            className="text-[#445D3E] hover:text-[#2A3927] font-medium flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>
    </div>
  );
};
