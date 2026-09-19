/**
 * @file index.ts
 * @description Root barrel export for the payment feature.
 *
 * Consumers import from this single entry point:
 *   import { workerEarningsService, GroupBookingService, GroupBooking } from '@/features/payment';
 */

// Types
export * from './types';

// Data (mock seed data — useful for tests and Storybook)
export * from './data';

// Repository interfaces
export type { IWorkerEarningsRepository } from './repositories/IWorkerEarningsRepository';
export type { IGroupBookingRepository } from './repositories/IGroupBookingRepository';
export type {
  CreateGroupBookingInput,
  JoinGroupBookingInput,
  InitiateParticipantPaymentInput,
} from './repositories/IGroupBookingRepository';

// Mock repositories
export { MockWorkerEarningsRepository } from './repositories/MockWorkerEarningsRepository';
export { MockGroupBookingRepository } from './repositories/MockGroupBookingRepository';

// Services
export { WorkerEarningsService } from './services/WorkerEarningsService';
export { GroupBookingService } from './services/GroupBookingService';
export type {
  EarningsDashboardData,
  EarningsInsights,
} from './services/WorkerEarningsService';
export type {
  GroupBookingDetailView,
  ParticipantBookingView,
  OrganiserDashboard,
} from './services/GroupBookingService';

// Pre-wired service singletons (recommended for app usage)
export { workerEarningsService, groupBookingService } from './container';
