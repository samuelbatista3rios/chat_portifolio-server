import Room from "../models/Room";
import Invitation from "../models/Invitation";
import Message from "../models/Message";
import { Request, Response } from "express";

// criar sala (dono vira membro automaticamente)
export const createRoom = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, isPrivate = true } = req.body;
  const room = await Room.create({
    name,
    owner: userId,
    isPrivate,
    members: [userId],
  });
  res.status(201).json(room);
};

// listar salas visíveis ao usuário (com owner populado)
export const getRooms = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const rooms = await Room.find({ members: userId })
    .sort({ updatedAt: -1 })
    .select("_id name owner members updatedAt");

  res.json(rooms);
};

// listar salas com última mensagem
export const getRoomsWithLast = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { Types } = require("mongoose");

  const rooms = await Room.aggregate([
    {
      $match: { members: new Types.ObjectId(userId) } ,
    },
    {
      $lookup: {
        from: "messages",
        let: { roomId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$room", "$$roomId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender",
            },
          },
          { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              room: 1,
              content: 1,
              imageUrl: 1,
              kind: 1,
              reactions: 1,
              createdAt: 1,
              "sender._id": 1,
              "sender.username": 1,
              "sender.avatar": 1,
            },
          },
        ],
        as: "lastMessage",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
     {
      $project: {
        _id: 1,
        name: 1,
        owner: 1,
        members: 1,
        updatedAt: 1,
        lastMessage: 1,
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);

  res.json(rooms);
};

// apagar sala — somente o dono
export const deleteRoom = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });
  if (String(room.owner) !== userId)
    return res.status(403).json({ message: "Só o dono pode apagar" });

  await Message.deleteMany({ room: id });
  await Invitation.deleteMany({ room: id });
  await Room.findByIdAndDelete(id);
  res.json({ ok: true });
};

// convidar usuário para uma sala
export const inviteToRoom = async (req: Request, res: Response) => {
  const from = req.user!.id;
  const { id: roomId } = req.params;
  const { to } = req.body;

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Sala não encontrada" });
  if (!room.members.some((m) => String(m) === from))
    return res.status(403).json({ message: "Sem permissão" });

  const existing = await Invitation.findOne({
    room: roomId,
    to,
    status: "pending",
  });
  if (existing) return res.status(409).json({ message: "Convite já pendente" });

  const inv = await Invitation.create({ room: roomId, from, to });
  req.io
    .to(String(to))
    .emit("invite_received", await inv.populate("room", "name"));
  res.status(201).json(inv);
};

// meus convites
export const myInvites = async (req: Request, res: Response) => {
  const me = req.user!.id;
  const inv = await Invitation.find({ to: me, status: "pending" }).populate(
    "room",
    "name"
  );
  res.json(inv);
};

// aceitar/recusar convite — ao aceitar, adiciona aos membros e emite "room_added"
export const actOnInvite = async (req: Request, res: Response) => {
  const me = req.user!.id;
  const { inviteId } = req.params;
  const { action } = req.body as { action: "accept" | "decline" };

  const inv = await Invitation.findById(inviteId);
  if (!inv || String(inv.to) !== me || inv.status !== "pending")
    return res.status(404).json({ message: "Convite inválido" });

  if (action === "accept") {
    inv.status = "accepted";
    await inv.save();
    await Room.findByIdAndUpdate(inv.room, { $addToSet: { members: me } });

    // 🔔 notifica quem convidou
    req.io.to(String(inv.from)).emit("invite_accepted", {
      inviteId,
      roomId: inv.room,
      userId: me,
    });

    // ✅ notifica o convidado para atualizar a sidebar sem recarregar
    req.io.to(String(me)).emit("room_added");

    return res.json({ ok: true, joined: true });
  } else {
    inv.status = "declined";
    await inv.save();
    req.io.to(String(inv.from)).emit("invite_declined", {
      inviteId,
      roomId: inv.room,
      userId: me,
    });
    return res.json({ ok: true, joined: false });
  }
};
