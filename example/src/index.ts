import express from "express";
import { connect, disconnect } from "fairydm";
import { authRoutes } from "./routes/auth.routes";
import { invitationRoutes } from "./routes/invitation.routes";
import { userRoutes } from "./routes/user.routes";
import { UserModel } from "./models/User.model";

var serviceAccount = require("./config/serviceAccountKey.json");

const app = express();
const port = process.env.PORT || 8080;

async function startServer() {
  // Connect to Firestore
  await connect({
    projectId: "testing-fairydm",
    credential: serviceAccount,
  });
  console.log("Connected to Firestore.");

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/invitations", invitationRoutes);

  app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Welcome to the Social Media API!");
  });

  app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await disconnect();
    console.log("\nDisconnected from Firestore.");
    process.exit(0);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
