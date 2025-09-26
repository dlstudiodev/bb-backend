import { schedules } from "@trigger.dev/sdk";
import { remindInactiveUsersTask } from "../workflows/remind-inactive-users";

/**
 * Daily email reminder scheduler
 *
 * Triggers the inactive users reminder workflow to send email notifications
 * for users who received in-app notifications recently.
 *
 * Test mode: every 3 minutes for testing
 * Production: daily at 8:00 AM UTC (8 hours after Supabase CRON at midnight)
 */
export const dailyEmailReminderScheduler = schedules.task({
  id: "daily-email-reminder",
  // PRODUCTION: Daily at 8:00 AM UTC
  cron: "0 8 * * *",
  run: async (payload) => {
    console.log("Starting scheduled email reminder workflow", {
      timestamp: payload.timestamp,
      lastRun: payload.lastTimestamp,
      nextRuns: payload.upcoming?.slice(0, 3)
    });

    // Trigger the remind inactive users workflow
    // windowDays: 1 = notifications from last 24 hours (default)
    const result = await remindInactiveUsersTask.triggerAndWait({
      windowDays: 1
    });

    if (result.ok) {
      console.log("Email reminder workflow completed successfully", {
        usersFound: result.output.usersFound,
        usersProcessed: result.output.usersProcessed,
        emailsSent: result.output.emailsSent,
        timestamp: result.output.timestamp
      });
    } else {
      console.error("Email reminder workflow failed", {
        error: result.error
      });
      throw new Error(`Scheduled workflow failed: ${result.error}`);
    }

    return {
      success: result.ok,
      executedAt: payload.timestamp,
      workflowResult: result.ok ? result.output : null
    };
  },
});