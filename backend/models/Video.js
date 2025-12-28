/* backend/models/Video.js */
import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  thumbnailUrl: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  description: { type: String, default: "" },
  category: { type: String, default: "General" },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Video", VideoSchema);
