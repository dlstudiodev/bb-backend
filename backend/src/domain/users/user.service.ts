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
};