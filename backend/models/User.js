/* backend/models/User.js */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }]
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
