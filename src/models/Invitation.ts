import { Schema, model, Types } from "mongoose";

const invitationSchema = new Schema(
  {
    room: { type: Types.ObjectId, ref: "Room", required: true, index: true },
    from: { type: Types.ObjectId, ref: "User", required: true },
    to:   { type: Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending","accepted","declined","expired"], default: "pending" },
  },
  { timestamps: true }
);

export default model("Invitation", invitationSchema);
