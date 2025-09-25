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

  /**
   * Get email addresses for specific user IDs
   * @param userIds - Array of user IDs to fetch emails for
   * @returns Array of user ID to email mappings
   */
  getUserEmailsFromIds(userIds: string[]): Promise<{ userId: string; email: string }[]>;
}