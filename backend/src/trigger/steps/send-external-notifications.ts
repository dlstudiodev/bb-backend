import { task } from "@trigger.dev/sdk";
import type { User } from "../../domain/users/user.types";
import { userService } from "../../domain/users/user.service";

interface NotificationPayload {
  users: User[];
  hoursAgo: number;
}

interface NotificationResult {
  totalUsers: number;
  usersWithEmails: number;
  usersWithoutEmails: number;
  emailsSent: number;
  errors: string[];
  emails: string[]; // Pour debug
}

/**
 * Step 3: Send external notifications
 *
 * Récupère les emails des users inactifs et simule l'envoi pour test.
 */
export const sendExternalNotificationsStep = task({
  id: "send-external-notifications",
  run: async (payload: NotificationPayload): Promise<NotificationResult> => {
    const { users, hoursAgo } = payload;

    console.log(`📧 Step 3: Processing ${users.length} inactive users for email notifications`);

    // Récupérer les emails des users inactifs (pour tester le service)
    const userIds = users.map(user => user.id);
    const userEmails = await userService.getUserEmailsFromIds(userIds);

    console.log(`📊 Retrieved emails for ${userEmails.length}/${users.length} users`);
    userEmails.forEach(({ userId, email }) => {
      console.log(`👤 ${userId}: ${email}`);
    });

    // Mock du return pour test
    return {
      totalUsers: users.length,
      usersWithEmails: userEmails.length,
      usersWithoutEmails: users.length - userEmails.length,
      emailsSent: Math.floor(userEmails.length * 0.9), // 90% envoyés avec succès
      errors: userEmails.length > 5 ? ["Failed to send to user_123: SMTP error"] : [],
      emails: userEmails.map(item => item.email) // Pour debug dans dashboard
    };

    // TODO: Version réelle
    /*
    const userIds = users.map(user => user.id);
    const userEmails = await userService.getUserEmailsFromIds(userIds);

    // Envoi via SendGrid
    // Return real stats
    */
  },
});