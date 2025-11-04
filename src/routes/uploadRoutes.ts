import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhum arquivo" });
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chatapp/messages",
      resource_type: "image",
      transformation: [{ width: 1200, quality: "auto", fetch_format: "auto" }],
    });
    res.json({ url: result.secure_url });
  } catch (e: any) {
    console.error("Upload error:", e?.message || e);
    res.status(500).json({ message: "Falha no upload" });
  }
});

export default router;
