import type { User } from './user.types';

/**
 * Repository interface for user operations
 */
export interface UserRepository {
  /**
   * Get users who have received in-app inactivity notifications recently
   * and are candidates for external notifications (email/push)
   */
  getUsersWithRecentInactivityNotifications(hoursAgo: number): Promise<User[]>;
}