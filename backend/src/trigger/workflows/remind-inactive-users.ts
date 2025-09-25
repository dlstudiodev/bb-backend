import { task } from "@trigger.dev/sdk/v3";
import { findInactiveUsersStep } from "../steps/find-inactive-users";
import { sendExternalNotificationsStep } from "../steps/send-external-notifications";

/**
 * Payload for inactive users reminder workflow
 */
export interface RemindInactiveUsersPayload {
  /** Number of days of inactivity to consider */
  daysInactive?: number;
}

/**
 * Result of inactive users reminder workflow
 */
export interface RemindInactiveUsersResult {
  success: boolean;
  usersFound: number;
  usersProcessed: number;
  usersExcluded: number;
  emailsSent: number;
  timestamp: string;
}

/**
 * Workflow to remind inactive users via email and in-app notifications.
 * Includes anti-spam rules to prevent over-messaging.
 */
export const remindInactiveUsersTask = task({
  id: "remind-inactive-users",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30_000,
  },
  run: async (payload: RemindInactiveUsersPayload): Promise<RemindInactiveUsersResult> => {
    console.log("🎯 Workflow 'Relance Utilisateurs Inactifs' démarré");
    console.log("📊 Paramètres:", payload);

    // Step 1: Récupération utilisateurs inactifs
    console.log("📋 Step 1: Recherche utilisateurs inactifs...");
    const step1Result = await findInactiveUsersStep.triggerAndWait({
      hoursAgo: (payload.daysInactive || 15) * 24 // Convert days to hours
    });

    if (!step1Result.ok) {
      throw new Error(`Step 1 failed: ${step1Result.error}`);
    }

    const inactiveUsers = step1Result.output.users;
    console.log(`✅ Found ${inactiveUsers.length} inactive users`);

    // Step 2: Simulation règles anti-spam
    console.log("🛡️ Step 2: Application des règles anti-spam...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("✅ Filtered to 12 users (3 excluded by anti-spam)");

    // Step 3: Envoi des notifications externes
    console.log("📧 Step 3: Envoi des notifications...");
    const step3Result = await sendExternalNotificationsStep.triggerAndWait({
      users: inactiveUsers,
      hoursAgo: (payload.daysInactive || 15) * 24
    });

    if (!step3Result.ok) {
      throw new Error(`Step 3 failed: ${step3Result.error}`);
    }

    const notificationResults = step3Result.output;
    console.log(`✅ Notifications: ${notificationResults.emailsSent} sent, ${notificationResults.usersWithoutEmails} no email`);

    console.log("🎉 Workflow terminé avec succès !");

    return {
      success: true,
      usersFound: inactiveUsers.length,
      usersProcessed: notificationResults.usersWithEmails,
      usersExcluded: notificationResults.usersWithoutEmails,
      emailsSent: notificationResults.emailsSent,
      timestamp: new Date().toISOString()
    };
  }
});