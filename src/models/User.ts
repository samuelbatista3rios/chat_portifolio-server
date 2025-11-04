import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null }, 
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
