import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import User from "./models/User";
import Room from "./models/Room";
import Message from "./models/Message";
import bcrypt from "bcryptjs";

(async () => {
  try {
    await connectDB();

    const email = "demo@chatapp.dev";
    const pass = "123123";
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: "Demo",
        email,
        password: await bcrypt.hash(pass, 10),
      });
    }

    let general = await Room.findOne({ name: "general" });
    if (!general) {
      general = await Room.create({ name: "general", members: [user._id] });
    }

    const existsMsg = await Message.findOne({ room: general._id });
    if (!existsMsg) {
      await Message.create({
        room: general._id,
        sender: user._id,
        content: "Bem-vindo ao ChatApp 👋",
      });
    }

    console.log("✅ Seed finalizado. Login demo:", email, "/", pass);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
