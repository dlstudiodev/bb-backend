import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { configure } from "@trigger.dev/sdk/v3";
import health from "./routes/health";
import workflows from "./routes/workflows";

// Configure Trigger.dev
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY,
});

const app = new Hono();

// Routes
app.route("/", health);
app.route("/", workflows);

// server
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
