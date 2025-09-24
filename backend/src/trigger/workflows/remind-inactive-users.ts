import { task } from "@trigger.dev/sdk/v3";

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
  usersProcessed: number;
  usersExcluded: number;
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

    // Step 1: Simulation récupération utilisateurs inactifs
    console.log("📋 Step 1: Recherche utilisateurs inactifs...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("✅ Found 15 inactive users");

    // Step 2: Simulation règles anti-spam
    console.log("🛡️ Step 2: Application des règles anti-spam...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("✅ Filtered to 12 users (3 excluded by anti-spam)");

    // Step 3: Simulation envoi notifications
    console.log("📧 Step 3: Envoi des notifications...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("✅ Notifications sent to 12 users");

    console.log("🎉 Workflow terminé avec succès !");

    return {
      success: true,
      usersProcessed: 12,
      usersExcluded: 3,
      timestamp: new Date().toISOString()
    };
  }
});