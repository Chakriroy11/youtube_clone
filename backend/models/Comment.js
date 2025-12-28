/* backend/models/Comment.js */
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Comment", CommentSchema);
