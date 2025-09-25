import { task } from '@trigger.dev/sdk';
import { z } from 'zod';
import { userService } from '../../domain/users/user.service';

/**
 * Step 1: Find inactive users who received in-app notifications recently
 *
 * Atomic step that identifies users who are candidates for external notifications
 * (email) based on recent in-app inactivity notifications.
 *
 * @step find-inactive-users
 * @description Queries users with recent inactivity notifications for re-engagement
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
    console.log("[FIND-USERS] Starting user search", {
      hoursAgo: payload.hoursAgo,
      daysAgo: Math.round(payload.hoursAgo / 24)
    });

    try {
      const users = await userService.getRecentInactiveUsers(payload.hoursAgo);

      console.log("[FIND-USERS] Search completed", {
        usersFound: users.length,
        hoursAgo: payload.hoursAgo,
        status: "success"
      });

      return {
        users,
        count: users.length,
        hoursAgo: payload.hoursAgo
      };
    } catch (error) {
      console.error("[FIND-USERS] Search failed", {
        hoursAgo: payload.hoursAgo,
        error: String(error)
      });
      throw error;
    }
  }
});