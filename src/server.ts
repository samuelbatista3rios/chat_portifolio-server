import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { handleSocketConnection } from "./socket/socketHandler";
import { setIO } from "./io";

dotenv.config();

// Lista de origens permitidas vinda do ambiente
// Ex.: "https://chat-portifolio.vercel.app,http://localhost:5173"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// helper para decidir se um origin pode passar
function isAllowed(origin?: string | null): boolean {
  if (!origin) return true;                 // requests sem Origin (ex: curl)
  if (/\.vercel\.app$/.test(origin)) return true; // qualquer *.vercel.app
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
server.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
