import { Router } from "express";
import { auth } from "../middlewares/authMiddleware";
import {
  createRoom, getRooms, deleteRoom,
  inviteToRoom, myInvites, actOnInvite
} from "../controllers/roomController";

const r = Router();

r.post("/", auth, createRoom);
r.get("/", auth, getRooms);
r.delete("/:id", auth, deleteRoom);

// convites
r.post("/:id/invite", auth, inviteToRoom);
r.get("/me/invites", auth, myInvites);
r.post("/invites/:inviteId", auth, actOnInvite);

export default r;
