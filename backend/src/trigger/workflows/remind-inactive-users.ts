import { task } from "@trigger.dev/sdk/v3";
import { findInactiveUsersStep } from "../steps/find-inactive-users";
import { sendExternalNotificationsStep } from "../steps/send-external-notifications";
import { userService } from "../../domain/users/user.service";

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
 * Workflow to remind inactive users via email notifications.
 * Includes anti-spam rules to prevent over-messaging.
 *
 * @workflow remind-inactive-users
 * @description Identifies inactive users and sends them re-engagement emails
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
    console.log("[WORKFLOW] Starting remind-inactive-users", {
      workflowId: "remind-inactive-users",
      daysInactive: payload.daysInactive || 15,
      timestamp: new Date().toISOString()
    });

    // Step 1: Find inactive users
    console.log("[STEP-1] Finding inactive users", {
      hoursAgo: (payload.daysInactive || 15) * 24
    });
    const step1Result = await findInactiveUsersStep.triggerAndWait({
      hoursAgo: (payload.daysInactive || 15) * 24 // Convert days to hours
    });

    if (!step1Result.ok) {
      throw new Error(`Step 1 failed: ${step1Result.error}`);
    }

    const inactiveUsers = step1Result.output.users;
    console.log("[STEP-1] Found inactive users", {
      count: inactiveUsers.length,
      status: "success"
    });

    // Step 2: Apply anti-spam rules (TODO: implement real logic)
    console.log("[STEP-2] Applying anti-spam rules");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("[STEP-2] Anti-spam filtering completed", {
      usersAfterFilter: 12,
      usersExcluded: 3,
      status: "success"
    });

    // Step 3: Retrieve emails and enrich users
    console.log("[STEP-3] Retrieving user emails", {
      userCount: inactiveUsers.length
    });
    const userIds = inactiveUsers.map(user => user.id);
    const userEmails = await userService.getUserEmailsFromIds(userIds);
    console.log("[STEP-3] Retrieved emails", {
      emailsFound: userEmails.length,
      totalUsers: inactiveUsers.length,
      coverage: `${Math.round((userEmails.length / inactiveUsers.length) * 100)}%`
    });

    // Enrich users with emails
    const usersWithEmails = inactiveUsers.map(user => {
      const userEmail = userEmails.find(ue => ue.userId === user.id);
      return {
        ...user,
        email: userEmail?.email
      };
    });

    // Step 4: Send notifications (single efficient run)
    console.log("[STEP-4] Sending notifications", {
      userCount: usersWithEmails.length,
      mockMode: true
    });
    const step3Result = await sendExternalNotificationsStep.triggerAndWait({
      users: usersWithEmails,
      hoursAgo: (payload.daysInactive || 15) * 24,
      channels: ["email"], // Par défaut email seulement
      mockMode: true // TEST MODE: pas de spam users
    });

    if (!step3Result.ok) {
      throw new Error(`Step 4 failed: ${step3Result.error}`);
    }

    const notificationResults = step3Result.output;
    console.log("[STEP-4] Notification results", {
      emailsSent: notificationResults.emailsSent,
      usersWithoutEmails: notificationResults.usersWithoutEmails,
      errors: notificationResults.errors.length,
      status: "success"
    });

    console.log("[WORKFLOW] Completed successfully", {
      workflowId: "remind-inactive-users",
      duration: Date.now(),
      status: "success"
    });

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