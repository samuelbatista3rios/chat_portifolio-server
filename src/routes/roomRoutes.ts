import express from "express";
import { auth } from "../middlewares/authMiddleware"; // ou protect, mas tem que existir
import {
  createRoom,
  getRooms,
  getRoomsWithLast,   // <== precisa estar aqui
  deleteRoom,
  inviteToRoom,
  myInvites,
  actOnInvite,
} from "../controllers/roomController";

const router = express.Router();

router.post("/", auth, createRoom);
router.get("/", auth, getRooms);
router.get("/with-last", auth, getRoomsWithLast); // <== esta linha

router.delete("/:id", auth, deleteRoom);

router.post("/:id/invite", auth, inviteToRoom);
router.get("/me/invites", auth, myInvites);
router.post("/invites/:inviteId", auth, actOnInvite);

export default router;
