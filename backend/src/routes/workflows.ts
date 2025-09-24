import { Hono } from "hono";
import { tasks } from "@trigger.dev/sdk/v3";
import type { remindInactiveUsersTask } from "../trigger/workflows/remind-inactive-users.ts";

/**
 * Successful workflow response
 */
interface WorkflowSuccessResponse {
  status: "workflow_started";
  workflow: string;
  taskId: string;
  timestamp: string;
}

/**
 * Error workflow response
 */
interface WorkflowErrorResponse {
  status: "error";
  message: string;
  debug?: string;
}

const workflows = new Hono();

/**
 * Triggers the inactive users reminder workflow
 */
workflows.post("/workflows/remind-inactive-users", async (c) => {
  console.log("🚀 Route appelée - remind-inactive-users");
  try {
    console.log("📞 Tentative de trigger du workflow...");

    const handle = await tasks.trigger<typeof remindInactiveUsersTask>(
      "remind-inactive-users",
      { daysInactive: 15 }
    );

    console.log("✅ Workflow déclenché avec succès, ID:", handle.id);

    return c.json<WorkflowSuccessResponse>({
      status: "workflow_started",
      workflow: "remind-inactive-users",
      taskId: handle.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Erreur détaillée:", error);
    console.error("❌ Message:", errorMessage);

    if (error instanceof Error) {
      console.error("❌ Stack:", error.stack);
    }

    return c.json<WorkflowErrorResponse>(
      {
        status: "error",
        message: "Failed to start workflow",
        debug: errorMessage
      },
      500
    );
  }
});

export default workflows;
