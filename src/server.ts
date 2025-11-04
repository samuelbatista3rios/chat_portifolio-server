import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { handleSocketConnection } from "./socket/socketHandler";
import { setIO } from "./io"; // 👈 novo

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "https://chat-portifolio-5itmlsbjh-samuelbatista3rios-projects.vercel.app" /\.vercel\.app$/,   "http://localhost:5173", credentials: true },
});

setIO(io); 

io.on("connection", (socket) => handleSocketConnection(io, socket));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));

