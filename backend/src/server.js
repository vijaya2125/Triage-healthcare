import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { CLIENT_ORIGIN, MONGO_URI, PORT } from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message:
      "Health triage API is running. This service does not diagnose diseases or replace a doctor."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/alerts", alertRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

