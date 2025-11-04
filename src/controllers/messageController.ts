import { Request, Response } from "express";
import Message from "../models/Message";

export const getMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const messages = await Message.find({ room: roomId }).populate("sender", "username avatar");
  res.json(messages);
};
