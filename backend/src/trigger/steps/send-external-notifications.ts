import { task } from "@trigger.dev/sdk";
import type { User } from "../../domain/users/user.types";
import { emailService } from "../../infrastructure/email/resend-email.service";

export enum NotificationChannel {
  EMAIL = "email",
}

interface NotificationPayload {
  users: User[]; // Users enriched with email
  hoursAgo: number;
  channels: NotificationChannel[];
  mockMode?: boolean; // For testing without spam
}

interface NotificationResult {
  totalUsers: number;
  usersWithEmails: number;
  usersWithoutEmails: number;
  emailsSent: number;
  errors: string[];
  channels: NotificationChannel[];
}

/**
 * Step 3: Send external notifications
 *
 * Sends external email notifications to all inactive users
 * in a single efficient run. Supports mock mode for testing.
 *
 * @step send-external-notifications
 * @description Processes users and sends personalized re-engagement emails
 */
export const sendExternalNotificationsStep = task({
  id: "send-external-notifications",
  run: async (payload: NotificationPayload): Promise<NotificationResult> => {
    const {
      users,
      hoursAgo,
      channels = [NotificationChannel.EMAIL],
      mockMode = false,
    } = payload;

    console.log("[NOTIFICATIONS] Starting notification processing", {
      totalUsers: users.length,
      channels: channels,
      mockMode: mockMode,
    });

    // Initialize result
    const result: NotificationResult = {
      totalUsers: users.length,
      usersWithEmails: 0,
      usersWithoutEmails: 0,
      emailsSent: 0,
      errors: [],
      channels,
    };

    // Filter to test email only in mock mode
    const filteredUsers = mockMode
      ? users.filter((user) => user.email === "hello@d-l.studio")
      : users;

    console.log("[NOTIFICATIONS] Users filtered", {
      filteredCount: filteredUsers.length,
      originalCount: users.length,
      mockMode: mockMode,
      testEmail: mockMode ? "hello@d-l.studio" : null,
    });

    // Process filtered users
    for (const user of filteredUsers) {
      try {
        // Check if email is available for email notifications
        if (!user.email && channels.includes(NotificationChannel.EMAIL)) {
          console.log("[NOTIFICATIONS] No email found", { userId: user.id });
          result.usersWithoutEmails++;
          continue;
        }

        if (user.email) {
          result.usersWithEmails++;
        }

        // Send email if requested and email available
        if (channels.includes(NotificationChannel.EMAIL) && user.email) {
          await emailService.sendInactivityEmail(
            user.email,
            "", // TODO: get real user name if available
            user.daysSinceLastActivity || 0,
            user.hasWorkoutHistory || false
          );
          result.emailsSent++;
          console.log("[NOTIFICATIONS] Email sent", {
            email: user.email,
            userId: user.id,
            daysSinceActivity: user.daysSinceLastActivity,
            hasWorkoutHistory: user.hasWorkoutHistory,
          });
        }
      } catch (error) {
        const errorMsg = `Failed to send notification to user ${user.id}: ${error}`;
        console.error("[NOTIFICATIONS] Send failed", {
          userId: user.id,
          email: user.email,
          error: String(error),
        });
        result.errors.push(errorMsg);
      }
    }

    console.log("[NOTIFICATIONS] Processing completed", {
      totalUsers: result.totalUsers,
      usersWithEmails: result.usersWithEmails,
      usersWithoutEmails: result.usersWithoutEmails,
      emailsSent: result.emailsSent,
      errors: result.errors.length,
      successRate: `${Math.round(
        (result.emailsSent / Math.max(result.usersWithEmails, 1)) * 100
      )}%`,
    });
    return result;
  },
});
