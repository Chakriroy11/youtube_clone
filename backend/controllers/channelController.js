import Channel from "../models/Channel.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

/**
 * Create a channel (protected)
 * POST /api/channels
 */
export const createChannel = async (req, res) => {
  try {
    const { channelName, description = "", channelBanner = "" } = req.body;

    if (!channelName || !channelName.trim()) {
      return res.status(400).json({ message: "Channel name required" });
    }

    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ownerId = req.user.id || req.user._id;

    // FIX: prevent more than one channel per user
    const existingChannel = await Channel.findOne({ owner: ownerId });
    if (existingChannel) {
      return res.status(409).json({
        message: "You already have a channel"
      });
    }

    const channel = new Channel({
      channelName: channelName.trim(),
      owner: ownerId,
      description: description.trim(),
      channelBanner: channelBanner || ""
    });

    await channel.save();

    // add channel id to user's channels array and return the updated user
    const updatedUser = await User.findByIdAndUpdate(
      ownerId,
      { $push: { channels: channel._id } },
      { new: true, select: "-password" }
    ).populate("channels", "channelName channelBanner");

    // populate owner + videos (videos empty initially)
    const populated = await Channel.findById(channel._id)
      .populate("owner", "username avatar")
      .populate({
        path: "videos",
        populate: { path: "uploader", select: "username avatar" }
      });

    return res.status(201).json({
      channel: populated,
      user: updatedUser
    });
  } catch (err) {
    console.error("createChannel error:", err);
    return res.status(500).json({
      message: "Server error while creating channel"
    });
  }
};

/**
 * Get channel by id and populate videos + owner
 * GET /api/channels/:id
 */
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate({
        path: "videos",
        populate: { path: "uploader", select: "username avatar" }
      })
      .populate("owner", "username avatar");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    return res.json(channel);
  } catch (err) {
    console.error("getChannel error:", err);
    return res.status(500).json({
      message: "Server error while fetching channel"
    });
  }
};

/**
 * List all channels
 * GET /api/channels
 */
export const listChannels = async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 });

    return res.json(channels);
  } catch (err) {
    console.error("listChannels error:", err);
    return res.status(500).json({
      message: "Server error while listing channels"
    });
  }
};
