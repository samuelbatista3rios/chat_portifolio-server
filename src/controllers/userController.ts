import { Request, Response } from "express";
import User from "../models/User";
import cloudinary from "../config/cloudinary";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: import("multer").File;
    }
  }
}

const upload = multer({ dest: "uploads/" });

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const uploadAvatar = [
  upload.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado" });
      const result = await cloudinary.uploader.upload(req.file.path);
      await User.findByIdAndUpdate(req.body.userId, { avatar: result.secure_url });
      res.json({ avatar: result.secure_url });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
];
