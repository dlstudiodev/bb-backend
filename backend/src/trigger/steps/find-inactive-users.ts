import { task } from '@trigger.dev/sdk';
import { z } from 'zod';
import { userService } from '../../domain/users/user.service';

/**
 * Step 1: Find inactive users who received in-app notifications recently
 *
 * Atomic step that identifies users who are candidates for external notifications
 * (email/push) based on recent in-app inactivity notifications.
 */
export const findInactiveUsersStep = task({
  id: "find-inactive-users",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: { hoursAgo: number }) => {
    console.log(`🔍 Finding users with inactivity notifications from last ${payload.hoursAgo} hours`);

    try {
      const users = await userService.getRecentInactiveUsers(payload.hoursAgo);

      console.log(`✅ Found ${users.length} inactive users`);

      return {
        users,
        count: users.length,
        hoursAgo: payload.hoursAgo
      };
    } catch (error) {
      console.error('❌ Failed to find inactive users:', error);
      throw error;
    }
  }
});