import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import { seedAll } from "./seed.js";
import authRoutes from "./routes/auth.js";
import donorRoutes from "./routes/donors.js";
import hospitalRoutes from "./routes/hospitals.js";
import chatRoutes from "./routes/chats.js";
import magazineRoutes from "./routes/magazine.js";
import requestRoutes from "./routes/requests.js";
import registryRoutes from "./routes/registry.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/magazine", magazineRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/registry", registryRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await initDb();
  await seedAll();
  app.listen(PORT, () => {
    console.log(`ABO backend running on http://localhost:${PORT}`);
  });
}

start();
