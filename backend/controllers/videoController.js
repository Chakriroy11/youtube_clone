/* backend/controllers/videoController.js */
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import Comment from "../models/Comment.js";
import { nanoid } from "nanoid";

export const listVideos = async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (category && category !== "All") filter.category = category;
    const videos = await Video.find(filter)
      .populate("uploader", "username avatar")
      .populate("channel", "channelName");
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createVideo = async (req, res) => {
  try {
    const { title, thumbnailUrl, videoUrl, description, category, channelId } = req.body;
    if (!title || !videoUrl) return res.status(400).json({ message: "Title and videoUrl required" });
    const videoId = nanoid(10);
    const video = new Video({ videoId, title, thumbnailUrl, videoUrl, description, category, uploader: req.user.id, channel: channelId });
    await video.save();
    if (channelId) await Channel.findByIdAndUpdate(channelId, { $push: { videos: video._id } });
    res.status(201).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("uploader", "username avatar").populate("channel", "channelName");
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (String(video.uploader) !== req.user.id) return res.status(403).json({ message: "Not allowed" });
    Object.assign(video, req.body);
    await video.save();
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Security check to ensure the uploader is the one deleting the video
    if (String(video.uploader) !== req.user.id) return res.status(403).json({ message: "Not allowed" });
    await video.deleteOne();

    // Remove video reference from the associated channel
    if (video.channel) await Channel.findByIdAndUpdate(video.channel, { $pull: { videos: video._id } });

    // Delete all associated comments
    await Comment.deleteMany({ videoId: video._id });

    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error("deleteVideo error:", err); // Added error logging for clarity
    res.status(500).json({ message: "Server error while deleting video" });
  }
};

export const incrementView = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { dislikes: 1 } }, { new: true });
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
