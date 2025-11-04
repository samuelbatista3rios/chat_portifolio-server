import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  room: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  imageUrl?: string;
  kind: "text" | "image";
  createdAt: Date;
  reactions: { emoji: string; user: Types.ObjectId; createdAt: Date }[];
}

const messageSchema = new Schema<IMessage>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    imageUrl: { type: String },
    kind: { type: String, enum: ["text", "image"], default: "text" },
    reactions: [
      {
        emoji: String,
        user: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);
