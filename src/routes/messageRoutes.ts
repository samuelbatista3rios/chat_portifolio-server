// Exemplo (ajuste ao seu arquivo real)
import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import Room from "../models/Room";
import Message from "../models/Message";

const r = Router();

r.get("/:roomId", protect, async (req, res) => {
  const userId = req.user!.id;
  const { roomId } = req.params;

  const room = await Room.findById(roomId).select("members");
  const isMember = room && room.members.some(m => String(m) === String(userId));
  if (!isMember) return res.status(403).json({ message: "Não autorizado" });

  const msgs = await Message.find({ room: roomId })
    .sort({ createdAt: 1 })
    .populate("sender", "username avatar");
  res.json(msgs);
});

export default r;
