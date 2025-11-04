// src/models/Room.ts
import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 👈
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Room", roomSchema);
