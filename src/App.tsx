import React, { useState, useEffect } from 'react';
import {
  CooperativeStoreProvider,
  useCooperativeStore,
} from './store/cooperativeStore';
import { Booking, UserRole } from './types';
import { DemoControlBar } from './components/common/DemoControlBar';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GuidedScenarioModal } from './components/demo/GuidedScenarioModal';
import { ToastContainer } from './components/common/Toast';
import { CursorAura } from './components/common/CursorAura';

// Pages
import { RoleSelectionScreen } from './pages/auth/RoleSelectionScreen';
import { RoleLoginScreen } from './pages/auth/RoleLoginScreen';
import { LandingPage } from './pages/public/LandingPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerActivityPage } from './pages/customer/CustomerActivityPage';
import { RequestServiceWizard } from './pages/customer/RequestServiceWizard';
import { EmergencyRequestModal } from './pages/customer/EmergencyRequestModal';
import { LiveTrackingModal } from './pages/customer/LiveTrackingModal';
import { PaymentModal } from './pages/customer/PaymentModal';
import { RatingAndDisputeModal } from './pages/customer/RatingAndDisputeModal';
import { ActiveJobSOSModal } from './pages/customer/ActiveJobSOSModal';

import { CommunityBookingsPage } from './pages/community/CommunityBookingsPage';
import { CustomerPaymentContainer } from './features/payment/ui/customer';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerWorkPage } from './pages/worker/WorkerWorkPage';
import { WorkerOnboarding } from './pages/worker/WorkerOnboarding';
import { WorkerPaymentContainer } from './features/payment/ui/worker/WorkerPaymentContainer';
import { WorkerToolBank } from './pages/worker/WorkerToolBank';
import { WorkerEmergencyAid } from './pages/worker/WorkerEmergencyAid';

import { SocietyManagerDashboard } from './pages/admin/SocietyManagerDashboard';
import { FederationManagerDashboard } from './pages/admin/FederationManagerDashboard';
import { AdminWorkerVerification } from './pages/admin/AdminWorkerVerification';
import { AdminMatchingEngine } from './pages/admin/AdminMatchingEngine';
import { AdminQualityControl } from './pages/admin/AdminQualityControl';
import { AdminCooperativeFund } from './pages/admin/AdminCooperativeFund';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

function AppContent() {
  const { isAuthenticated, currentRole, setRole, bookings, currentUser } = useCooperativeStore();

  const [authStep, setAuthStep] = useState<'select_role' | 'login'>('select_role');
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole>('customer');

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | undefined>();
  const [selectedProblemType, setSelectedProblemType] = useState<string | undefined>();

  // Modals state
  const [isRequestWizardOpen, setIsRequestWizardOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isGuidedScenarioOpen, setIsGuidedScenarioOpen] = useState<boolean>(false);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [sosBooking, setSosBooking] = useState<Booking | null>(null);

  // Sync tab defaults when role changes
  useEffect(() => {
    switch (currentRole) {
      case 'worker':
        setCurrentTab('worker_dashboard');
        break;
      case 'society_manager':
        setCurrentTab('soc_dashboard');
        break;
      case 'federation_admin':
      case 'federation_manager':
        setCurrentTab('fed_dashboard');
        break;
      case 'customer':
      default:
        setCurrentTab('home');
        break;
    }
  }, [currentRole]);

  const handleOpenRequest = (category?: string, problem?: string) => {
    setSelectedServiceCategory(category);
    setSelectedProblemType(problem);
    setIsRequestWizardOpen(true);
  };

  const handleBookingCreated = (bookingId: string) => {
    const b = bookings.find((item) => item.id === bookingId);
    if (b) {
      setTrackingBooking(b);
    }
    setCurrentTab('home');
  };

  // 0. INITIAL ONBOARDING & ROLE AUTHENTICATION FLOW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] text-[#292824] flex flex-col antialiased selection:bg-[#CFDDD0] selection:text-[#2A3927] relative">
        <CursorAura />
        <ToastContainer />

        {authStep === 'select_role' ? (
          <RoleSelectionScreen
            onSelectRoleForAuth={(role) => {
              setSelectedRoleForAuth(role);
              setAuthStep('login');
            }}
            onOpenGuidedScenario={() => setIsGuidedScenarioOpen(true)}
          />
        ) : (
          <RoleLoginScreen
            role={selectedRoleForAuth}
            onBack={() => setAuthStep('select_role')}
            onSuccess={() => {
              // Auth completed - store updates isAuthenticated
            }}
          />
        )}

        {/* Guided Scenario Player */}
        <GuidedScenarioModal
          isOpen={isGuidedScenarioOpen}
          onClose={() => setIsGuidedScenarioOpen(false)}
          onNavigateTab={(tab) => {
            setCurrentTab(tab);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#292824] flex flex-col antialiased selection:bg-[#CFDDD0] selection:text-[#2A3927] pb-20 md:pb-8 relative">
      {/* GLOBAL CURSOR AMBIENT AURA */}
      <CursorAura />

      {/* GLOBAL ANIMATED TOAST NOTIFICATIONS */}
      <ToastContainer />

      {/* 1. PERSISTENT DEMO & LOCKED ROLE CONTROL BAR */}
      <DemoControlBar
        onOpenGuidedScenario={() => setIsGuidedScenarioOpen(true)}
      />

      {/* 2. REFINED ROLE-LOCKED NAVBAR */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onRequestService={() => handleOpenRequest()}
      />

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 w-full animate-fade-in">
        {/* ROLE 1: CUSTOMER VIEWS */}
        {currentRole === 'customer' && (
          <>
            {currentTab === 'home' && (
              <CustomerDashboard
                onRequestService={(cat, problem) => handleOpenRequest(cat, problem)}
                onOpenEmergency={() => setIsEmergencyModalOpen(true)}
                onOpenCommunity={() => setCurrentTab('community')}
                onOpenGroupBookings={() => setCurrentTab('customer_group_bookings')}
                onTrackBooking={(b) => setTrackingBooking(b)}
                onPayBooking={(b) => setPayingBooking(b)}
                onRateBooking={(b) => setRatingBooking(b)}
                onViewActivity={() => setCurrentTab('activity')}
              />
            )}

            {currentTab === 'activity' && (
              <CustomerActivityPage
                onTrackBooking={(b) => setTrackingBooking(b)}
                onPayBooking={(b) => setPayingBooking(b)}
                onRateBooking={(b) => setRatingBooking(b)}
                onRequestNew={() => handleOpenRequest()}
              />
            )}

            {currentTab === 'landing' && (
              <LandingPage
                onRequestService={(cat) => handleOpenRequest(cat)}
                onExploreServices={() => setCurrentTab('services')}
                onExploreCommunity={() => setCurrentTab('community')}
                onWorkerOnboarding={() => {
                  setRole('worker');
                  setCurrentTab('worker_verification');
                }}
              />
            )}

            {currentTab === 'services' && (
              <ServicesPage
                onSelectService={(serviceName, problem) =>
                  handleOpenRequest(serviceName, problem)
                }
              />
            )}

            {currentTab === 'community' && <CommunityBookingsPage />}

            {currentTab === 'customer_group_bookings' && (
              <CustomerPaymentContainer
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                currentUserPhone={currentUser.phone}
                currentUserFlat={currentUser.address?.split(',')[0]?.trim() ?? 'Flat 101'}
                societyId={currentUser.societyName?.toLowerCase().replace(/\s+/g, '_') ?? 'soc_default'}
                societyName={currentUser.societyName ?? 'Green Residency'}
                onClose={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'fund' && <AdminCooperativeFund />}
          </>
        )}

        {/* ROLE 2: WORKER VIEWS */}
        {currentRole === 'worker' && (
          <>
            {currentTab === 'worker_dashboard' && (
              <WorkerDashboard
                onOpenToolBank={() => setCurrentTab('worker_tools')}
                onOpenEmergencyAid={() => setCurrentTab('worker_emergency')}
                onOpenVerification={() => setCurrentTab('worker_verification')}
                onOpenCommunity={() => setCurrentTab('worker_community')}
                onOpenMyWork={() => setCurrentTab('worker_work')}
                onOpenPayments={() => setCurrentTab('worker_payments')}
              />
            )}

            {currentTab === 'worker_work' && (
              <WorkerWorkPage />
            )}

            {currentTab === 'worker_community' && (
              <CommunityBookingsPage />
            )}

            {currentTab === 'worker_tools' && <WorkerToolBank />}

            {currentTab === 'worker_emergency' && <WorkerEmergencyAid />}

            {currentTab === 'worker_verification' && <WorkerOnboarding />}

            {currentTab === 'worker_payments' && (
              <WorkerPaymentContainer
                workerId="w_rahul"
                onClose={() => setCurrentTab('worker_dashboard')}
              />
            )}
          </>
        )}

        {/* ROLE 3: SOCIETY MANAGER VIEWS */}
        {currentRole === 'society_manager' && (
          <>
            {currentTab === 'soc_dashboard' && (
              <SocietyManagerDashboard onSelectTab={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'soc_verification' && <AdminWorkerVerification />}
            {(currentTab === 'soc_disputes' || currentTab === 'soc_quality') && <AdminQualityControl />}
            {(currentTab === 'soc_ledger' || currentTab === 'soc_fund') && <AdminCooperativeFund />}
            {currentTab === 'soc_matching' && <AdminMatchingEngine />}
            {currentTab === 'community' && <CommunityBookingsPage />}
          </>
        )}

        {/* ROLE 4: FEDERATION ADMIN VIEWS */}
        {(currentRole === 'federation_manager' || currentRole === 'federation_admin') && (
          <>
            {currentTab === 'fed_dashboard' && (
              <FederationManagerDashboard onSelectTab={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'fed_societies' && (
              <FederationManagerDashboard onSelectTab={(tab) => setCurrentTab(tab)} />
            )}
            {(currentTab === 'fed_rebalancing' || currentTab === 'fed_allocator') && (
              <FederationManagerDashboard onSelectTab={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'fed_toolbank' && <WorkerToolBank />}
            {currentTab === 'fed_relief' && <AdminCooperativeFund />}
            {currentTab === 'fed_matching' && <AdminMatchingEngine />}
            {currentTab === 'fed_analytics' && <AdminAnalytics />}
            {currentTab === 'community' && <CommunityBookingsPage />}
          </>
        )}
      </main>

      {/* 4. ANDROID MOBILE-FIRST ROLE-TAILORED BOTTOM NAVIGATION */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onRequestService={() => handleOpenRequest()}
      />

      {/* 5. INTERACTIVE WORKFLOW MODALS */}
      {/* 3-Screen Request Wizard */}
      <RequestServiceWizard
        isOpen={isRequestWizardOpen}
        onClose={() => setIsRequestWizardOpen(false)}
        preselectedService={selectedServiceCategory}
        preselectedProblem={selectedProblemType}
        onBookingCreated={handleBookingCreated}
      />

      {/* 1-Click Priority Emergency Modal */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onEmergencyCreated={handleBookingCreated}
      />

      {/* Live Tracking & OTP Modal */}
      <LiveTrackingModal
        isOpen={trackingBooking !== null}
        onClose={() => setTrackingBooking(null)}
        booking={trackingBooking}
        onProceedToPayment={(b) => setPayingBooking(b)}
        onOpenSOS={(b) => setSosBooking(b)}
      />

      {/* Active Job SOS Modal */}
      {sosBooking && (
        <ActiveJobSOSModal
          job={sosBooking}
          isOpen={sosBooking !== null}
          onClose={() => setSosBooking(null)}
        />
      )}

      {/* Transparent Payment Modal */}
      <PaymentModal
        isOpen={payingBooking !== null}
        onClose={() => setPayingBooking(null)}
        booking={payingBooking}
        onPaymentSuccess={(b) => setRatingBooking(b)}
      />

      {/* Rating & Quality Dispute Modal */}
      <RatingAndDisputeModal
        isOpen={ratingBooking !== null}
        onClose={() => setRatingBooking(null)}
        booking={ratingBooking}
      />

      {/* Guided Scenario Player */}
      <GuidedScenarioModal
        isOpen={isGuidedScenarioOpen}
        onClose={() => setIsGuidedScenarioOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Slide-over Notification Center */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectBooking={(bId) => {
          const found = bookings.find((b) => b.id === bId);
          if (found) setTrackingBooking(found);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <CooperativeStoreProvider>
      <AppContent />
    </CooperativeStoreProvider>
  );
}
