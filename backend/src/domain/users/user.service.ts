import type { User } from './user.types';
import { supabaseUserRepository } from '../../infrastructure/database/supabase-user.adapter';

/**
 * User service - Orchestrates user-related business logic
 *
 * Provides high-level operations for user management,
 * abstracting away repository implementation details.
 */
export const userService = {
  /**
   * Get users who received inactivity notifications recently.
   * These users are candidates for external notifications (email/push).
   *
   * @param hoursAgo - Number of hours to look back for recent notifications
   * @returns Array of users with inactivity details
   * @throws Error if operation fails
   *
   * @example
   * ```typescript
   * // Get users who received notifications in last 12 hours
   * const users = await userService.getRecentInactiveUsers(12);
   * ```
   */
  async getRecentInactiveUsers(hoursAgo: number): Promise<User[]> {
    return supabaseUserRepository.getUsersWithRecentInactivityNotifications(hoursAgo);
  },

  /**
   * Get email addresses for specific user IDs.
   *
   * @param userIds - Array of user IDs to fetch emails for
   * @returns Array of user ID to email mappings
   * @throws Error if operation fails
   *
   * @example
   * ```typescript
   * const emails = await userService.getUserEmailsFromIds(["user_1", "user_2"]);
   * ```
   */
  async getUserEmailsFromIds(userIds: string[]): Promise<{ userId: string; email: string }[]> {
    return supabaseUserRepository.getUserEmailsFromIds(userIds);
  },
};