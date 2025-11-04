// src/app.ts
import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import roomRoutes from "./routes/roomRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import uploadRoutes from "./routes/uploadRoutes";
import { getIO } from "./io";

dotenv.config();
connectDB();

const app = express();

/**
 * CORS — aceita:
 *  - qualquer domínio *.vercel.app
 *  - tudo que estiver listado em ALLOWED_ORIGINS (separado por vírgula)
 *  - mantém compatibilidade com CLIENT_URL (origem única, se existir)
 */
const RAW = [
  process.env.ALLOWED_ORIGINS || "",     // ex: "https://chat-portifolio.vercel.app,http://localhost:5173"
  process.env.CLIENT_URL || "",          // compat: uma única origem antiga
]
  .join(",")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true; // health-checks/curl/SSR
  if (/\.vercel\.app$/.test(origin)) return true; // wildcard p/ subdomínios Vercel
  return RAW.includes(origin);
}

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 204,
};

// CORS **antes** de tudo e com resposta a preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// injeta io no req para controllers que emitem eventos
app.use((req, _res, next) => {
  try {
    (req as any).io = getIO();
  } catch {
    /* io ainda não setado no bootstrap (primeiras requisições) */
  }
  next();
});

// rotas
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// handler de erros
app.use(errorHandler);

export default app;
