import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import roomRoutes from "./routes/roomRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { getIO } from "./io";

dotenv.config();

const app = express();

/**
 * CORS — aceita:
 *  - qualquer domínio *.vercel.app
 *  - domínios em ALLOWED_ORIGINS (vírgula separada)
 *  - compat com CLIENT_URL (legado)
 */
const RAW = [
  process.env.ALLOWED_ORIGINS || "",
  process.env.CLIENT_URL || "",
]
  .join(",")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true;                 // health-checks/curl/SSR
  if (/\.vercel\.app$/.test(origin)) return true; // qualquer *.vercel.app
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

// CORS global + preflight (sem usar '*')
app.use(cors(corsOptions));
app.options("(.*)", cors(corsOptions));

app.use(express.json());

// injeta io no req
app.use((req, _res, next) => {
  try {
    (req as any).io = getIO();
  } catch {}
  next();
});

// rotas
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// healthcheck para o Render
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// handler de erros (sempre por último)
app.use(errorHandler);

export default app;
