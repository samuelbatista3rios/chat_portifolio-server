import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { handleSocketConnection } from "./socket/socketHandler";
import { setIO } from "./io";

dotenv.config();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowed(origin?: string | null): boolean {
  if (!origin) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isAllowed(origin)) return cb(null, true);
      return cb(new Error("CORS socket blocked"));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

setIO(io);
io.on("connection", (socket) => handleSocketConnection(io, socket));

const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0"; // importante no Render

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server rodando em http://${HOST}:${PORT}`);
});
