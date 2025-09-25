import { task } from "@trigger.dev/sdk";
import type { User } from "../../domain/users/user.types";
import { userService } from "../../domain/users/user.service";
import { emailService } from "../../infrastructure/email/resend-email.service";

enum NotificationChannel {
  EMAIL = "email",
  PUSH = "push"
}

interface NotificationPayload {
  users: User[];
  hoursAgo: number;
  channels: NotificationChannel[];
}

interface NotificationResult {
  totalUsers: number;
  usersWithEmails: number;
  usersWithoutEmails: number;
  emailsSent: number;
  pushSent: number;
  errors: string[];
  emails: string[]; // Pour debug
  channels: NotificationChannel[];
}

/**
 * Step 3: Send external notifications
 *
 * Sends external notifications (email/push) to inactive users
 * based on specified channels.
 */
export const sendExternalNotificationsStep = task({
  id: "send-external-notifications",
  run: async (payload: NotificationPayload): Promise<NotificationResult> => {
    const { users, hoursAgo, channels = [NotificationChannel.EMAIL] } = payload;

    console.log(`📧 Step 3: Processing ${users.length} inactive users for external notifications`);
    console.log(`📢 Channels enabled: ${channels.join(', ')}`);

    // Retrieve user emails for notification channels that need them
    const userIds = users.map(user => user.id);
    const userEmails = await userService.getUserEmailsFromIds(userIds);

    console.log(`📊 Retrieved emails for ${userEmails.length}/${users.length} users`);
    userEmails.forEach(({ userId, email }) => {
      console.log(`👤 ${userId}: ${email}`);
    });

    // Préparer le résultat
    const result: NotificationResult = {
      totalUsers: users.length,
      usersWithEmails: userEmails.length,
      usersWithoutEmails: users.length - userEmails.length,
      emailsSent: 0,
      pushSent: 0,
      errors: [],
      emails: userEmails.map(item => item.email), // For debug
      channels
    };

    // Send notifications according to enabled channels
    for (const { userId, email } of userEmails) {
      try {
        // Find user details for personalized notifications
        const user = users.find(u => u.id === userId);

        // Send email if requested
        if (channels.includes(NotificationChannel.EMAIL)) {
          await emailService.sendInactivityEmail(
            email,
            "Champion", // TODO: get real user name if available
            user?.daysSinceLastActivity || 0,
            user?.hasWorkoutHistory || false
          );
          result.emailsSent++;
          console.log(`✅ Email sent to ${email}`);
        }

        // Send push if requested (TODO: implement with Capacitor)
        if (channels.includes(NotificationChannel.PUSH)) {
          console.log(`🔔 Push notification would be sent to user ${userId} (TODO: implement with Capacitor)`);
          result.pushSent++;
        }

      } catch (error) {
        const errorMsg = `Failed to send notification to ${email}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    console.log(`📊 Results: ${result.emailsSent} emails sent, ${result.pushSent} push notifications sent`);
    return result;
  },
});