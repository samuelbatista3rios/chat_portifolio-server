
import express from "express";
import User from "../models/User";                 
import { uploadAvatar } from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/avatar", protect, ...uploadAvatar);

// GET /api/users?search=jo
router.get("/", protect, async (req, res) => {
  try {
    const q = String(req.query.search || "").trim();
    const me = req.user!.id; // vem do middleware protect

    const filter: any = q ? { username: { $regex: q, $options: "i" } } : {};
    const users = await User.find(filter, "_id username avatar").limit(15).lean();
    const filtered = users.filter((u) => String(u._id) !== String(me));

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

export default router;
