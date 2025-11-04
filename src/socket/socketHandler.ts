// socket/socketHandler.ts
import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Room from "../models/Room";
import User from "../models/User";

interface IJoinData { roomId: string; userId: string; username: string; }

export const handleSocketConnection = (io: Server, socket: Socket) => {
  console.log("🟢 Novo cliente conectado:", socket.id);

  socket.data.userId = null as null | string;
  socket.data.roomsJoined = new Set<string>();

  // 👇 o cliente chama isso assim que loga: socket.emit("identify", userId)
  socket.on("identify", async (userId: string) => {
    socket.data.userId = userId;
    socket.join(String(userId));              // <-- sala pessoal
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("user_presence_changed", { userId, online: true });
  });

  socket.on("join_room", async (data: IJoinData) => {
    const { roomId, userId, username } = data;

    // ✅ garanta que o usuário é membro
    const room = await Room.findById(roomId).select("members isPrivate");
    if (!room) return;
    const isMember = room.members.some(m => String(m) === String(userId));
    if (!isMember) {
      // não autoriza a entrar na sala
      socket.emit("error_action", { message: "Você não é membro desta sala." });
      return;
    }

    socket.join(roomId);
    socket.data.roomsJoined.add(roomId);
    io.to(roomId).emit("user_joined", `${username} entrou na sala`);
  });

  socket.on("react_message", async ({ messageId, emoji, userId }) => {
    const msg = await Message.findByIdAndUpdate(
      messageId,
      { $push: { reactions: { emoji, user: userId } } },
      { new: true }
    ).populate("sender", "username avatar");
    if (msg) io.to(String(msg.room)).emit("message_reacted", msg);
  });

  socket.on("unreact_message", async ({ messageId, emoji, userId }) => {
    const msg = await Message.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { emoji, user: userId } } },
      { new: true }
    ).populate("sender", "username avatar");
    if (msg) io.to(String(msg.room)).emit("message_reacted", msg);
  });

  socket.on("typing", (data: { roomId: string; username: string }) => {
    socket.to(data.roomId).emit("user_typing", { roomId: data.roomId, username: data.username });
  });

  socket.on("send_message", async (data: { roomId: string; userId: string; content?: string; imageUrl?: string }) => {
    // segurança extra: só deixa enviar se for membro
    const room = await Room.findById(data.roomId).select("members");
    if (!room || !room.members.some(m => String(m) === String(data.userId))) return;

    const newMsg = await Message.create({
      room: data.roomId,
      sender: data.userId,
      content: data.content,
      imageUrl: data.imageUrl,
      kind: data.imageUrl ? "image" : "text",
    });
    const populated = await newMsg.populate("sender", "username avatar");
    io.to(data.roomId).emit("receive_message", populated);
    io.emit("room_updated", { roomId: data.roomId, lastMessage: populated });
  });

  socket.on("disconnect", async () => {
    const userId = socket.data.userId as string | null;
    if (userId) {
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
      io.emit("user_presence_changed", { userId, online: false });
    }
  });
};
