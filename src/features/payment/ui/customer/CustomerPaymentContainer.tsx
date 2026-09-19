import React, { useState } from 'react';
import { Users, ChevronLeft, IndianRupee, LayoutList, Plus } from 'lucide-react';
import { CommunityGroupBooking } from './CommunityGroupBooking';
import { GroupBookingDetails } from './GroupBookingDetails';
import { InvoicePaymentFlow } from './InvoicePaymentFlow';

// ─── types ────────────────────────────────────────────────────────────────────

type CustomerView =
  | { type: 'list' }
  | { type: 'details'; groupBookingId: string }
  | { type: 'payment'; invoiceId: string; participantId: string; groupBookingId: string };

interface CustomerPaymentContainerProps {
  /** Current authenticated customer user ID */
  currentUserId?: string;
  /** Customer's display name */
  currentUserName?: string;
  /** Customer's phone number */
  currentUserPhone?: string;
  /** Customer's flat / unit identifier */
  currentUserFlat?: string;
  /** Society identifier */
  societyId?: string;
  /** Society display name */
  societyName?: string;
  /** Optional callback to go back to the main app */
  onClose?: () => void;
}

// ─── Section titles per view ──────────────────────────────────────────────────

function viewTitle(view: CustomerView): string {
  if (view.type === 'list') return 'Community Group Bookings';
  if (view.type === 'details') return 'Booking Details';
  return 'Pay My Share';
}

// ─── main container ───────────────────────────────────────────────────────────

export const CustomerPaymentContainer: React.FC<CustomerPaymentContainerProps> = ({
  currentUserId = 'user_cust_01',
  currentUserName = 'Ananya Deshmukh',
  currentUserPhone = '+91 98201 44521',
  currentUserFlat = 'B-402',
  societyId = 'soc_green',
  societyName = 'Green Residency',
  onClose,
}) => {
  const [view, setView] = useState<CustomerView>({ type: 'list' });

  const goToList = () => setView({ type: 'list' });
  const goToDetails = (id: string) => setView({ type: 'details', groupBookingId: id });
  const goToPayment = (invoiceId: string, participantId: string, groupBookingId: string) =>
    setView({ type: 'payment', invoiceId, participantId, groupBookingId });

  const handleBack = () => {
    if (view.type === 'details') goToList();
    else if (view.type === 'payment') {
      // Go back to the same booking details
      const pv = view as { type: 'payment'; groupBookingId: string };
      setView({ type: 'details', groupBookingId: pv.groupBookingId });
    } else {
      onClose?.();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-5 animate-fade-in">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-1 border-b border-[#E8E2D5]">
        {(view.type !== 'list' || onClose) && (
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-[#77736B]" />
          </button>
        )}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#324F66] to-[#537895] flex items-center justify-center shrink-0 shadow-card">
            {view.type === 'payment'
              ? <IndianRupee className="w-5 h-5 text-white" />
              : view.type === 'details'
              ? <LayoutList className="w-5 h-5 text-white" />
              : <Users className="w-5 h-5 text-white" />}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#292824] leading-tight truncate">
              {viewTitle(view)}
            </h1>
            <p className="text-xs text-[#77736B] mt-0.5 truncate">{societyName}</p>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb nav (list → details → payment) ─────────────── */}
      {view.type !== 'list' && (
        <nav className="flex items-center gap-1.5 text-[11px]" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={goToList}
            className="text-[#537895] font-semibold hover:underline cursor-pointer"
          >
            All Bookings
          </button>
          {view.type === 'details' && (
            <>
              <span className="text-[#BCB7AD]">/</span>
              <span className="text-[#292824] font-semibold">Details</span>
            </>
          )}
          {view.type === 'payment' && (
            <>
              <span className="text-[#BCB7AD]">/</span>
              <button
                type="button"
                onClick={() => {
                  const pv = view as { type: 'payment'; groupBookingId: string };
                  goToDetails(pv.groupBookingId);
                }}
                className="text-[#537895] font-semibold hover:underline cursor-pointer"
              >
                Details
              </button>
              <span className="text-[#BCB7AD]">/</span>
              <span className="text-[#292824] font-semibold">Pay</span>
            </>
          )}
        </nav>
      )}

      {/* ── View content ───────────────────────────────────────────── */}
      <div key={JSON.stringify(view)} className="animate-fade-in">
        {view.type === 'list' && (
          <CommunityGroupBooking
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserPhone={currentUserPhone}
            currentUserFlat={currentUserFlat}
            societyId={societyId}
            societyName={societyName}
            onViewDetails={goToDetails}
          />
        )}

        {view.type === 'details' && (
          <GroupBookingDetails
            groupBookingId={view.groupBookingId}
            currentUserId={currentUserId}
            onBack={goToList}
            onPayMyShare={(invoiceId, participantId) =>
              goToPayment(invoiceId, participantId, view.groupBookingId)
            }
          />
        )}

        {view.type === 'payment' && (
          <InvoicePaymentFlow
            invoiceId={view.invoiceId}
            participantId={view.participantId}
            groupBookingId={view.groupBookingId}
            currentUserId={currentUserId}
            onBack={() => goToDetails(view.groupBookingId)}
            onSuccess={() => goToDetails(view.groupBookingId)}
          />
        )}
      </div>

      {/* ── Floating shortcut: create booking (list view only) ─────── */}
      {view.type === 'list' && (
        <div className="sm:hidden fixed bottom-20 right-4 pointer-events-auto">
          <button
            type="button"
            id="fab-create-group-booking"
            onClick={() => {
              // Scroll to the top of the page and trigger create modal via the header button
              const btn = document.getElementById('create-group-booking-btn');
              btn?.click();
            }}
            className="w-14 h-14 rounded-2xl bg-[#6E8B67] hover:bg-[#587352] text-white flex items-center justify-center shadow-float transition-all cursor-pointer active:scale-[0.96]"
            aria-label="Start Group Booking"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
