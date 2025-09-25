import { createClient } from '@supabase/supabase-js';
import type { User } from '../../domain/users/user.types';
import type { UserRepository } from '../../domain/users/user.repository';

/**
 * Creates a configured Supabase client instance.
 * Uses service role key for admin-level database access.
 *
 * @returns Configured Supabase client
 * @throws Error if environment variables are missing
 */
const createSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(url, key);
};

/**
 * Retrieves users who have received in-app inactivity notifications recently.
 * These users are candidates for external notifications (email/push).
 *
 * Performs a query joining:
 * - user_notifications (main table)
 * - notification_templates (to filter by 'inactivity' type)
 *
 * @param hoursAgo - Number of hours to look back for recent notifications
 * @returns Array of users with inactivity details
 * @throws Error if database query fails
 *
 * @example
 * ```typescript
 * // Get users who received inactivity notifications in last 12 hours
 * const users = await getUsersWithRecentInactivityNotifications(12);
 * ```
 */
async function getUsersWithRecentInactivityNotifications(hoursAgo: number): Promise<User[]> {
  const supabase = createSupabaseClient();

  // Calculate the timestamp threshold for "recent" notifications
  const thresholdDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  // Query users who received inactivity notifications after threshold
  const { data, error } = await supabase
    .from('user_notifications')
    .select(`
      user_id,
      data,
      notification_templates!inner(type)
    `)
    .eq('notification_templates.type', 'inactivity')
    .gte('created_at', thresholdDate.toISOString());

  if (error) {
    throw new Error(`Failed to fetch users with recent inactivity notifications: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform database rows to User objects with inactivity details
  const usersMap = new Map<string, User>();

  data.forEach(row => {
    if (!usersMap.has(row.user_id)) {
      usersMap.set(row.user_id, {
        id: row.user_id,
        daysSinceLastActivity: row.data?.days ?? 0,
        hasWorkoutHistory: row.data?.has_workout ?? false
      });
    }
  });

  return Array.from(usersMap.values());
}

/**
 * Supabase implementation of the UserRepository interface.
 * Provides data access methods for user-related operations using Supabase as the backend.
 *
 * Uses modern functional approach instead of classes for better tree-shaking
 * and simplified testing.
 */
export const supabaseUserRepository: UserRepository = {
  getUsersWithRecentInactivityNotifications,
};