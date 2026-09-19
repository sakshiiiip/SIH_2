/**
 * @file container.ts
 * @description Dependency injection container for the payment feature.
 *
 * Wires mock repositories to services.
 * Swap `Mock*` implementations for real API implementations by replacing
 * the single instantiation line — all consumers remain untouched.
 *
 * Usage:
 *   import { workerEarningsService, groupBookingService } from '@/features/payment/container';
 *
 *   const summary = await workerEarningsService.getDashboardData('w_rahul');
 */

import { MockWorkerEarningsRepository } from './repositories/MockWorkerEarningsRepository';
import { MockGroupBookingRepository } from './repositories/MockGroupBookingRepository';
import { WorkerEarningsService } from './services/WorkerEarningsService';
import { GroupBookingService } from './services/GroupBookingService';

// ─── Repositories (swap these for real implementations in production) ─────────

const workerEarningsRepo = new MockWorkerEarningsRepository();
const groupBookingRepo = new MockGroupBookingRepository();

// ─── Services (exported singletons) ──────────────────────────────────────────

export const workerEarningsService = new WorkerEarningsService(workerEarningsRepo);
export const groupBookingService = new GroupBookingService(groupBookingRepo);

// Re-export services and static helpers for convenience.
export { WorkerEarningsService } from './services/WorkerEarningsService';
export { GroupBookingService } from './services/GroupBookingService';
