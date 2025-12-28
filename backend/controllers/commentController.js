
// backend/controllers/commentController.js
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

/**
 * List comments for a video
 * GET /api/comments/:videoId
 */
export const listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId })
      .sort({ createdAt: -1 })
      .populate("userId", "username avatar");
    return res.json(comments);
  } catch (err) {
    console.error("listComments error:", err);
    return res.status(500).json({ message: "Server error while listing comments" });
  }
};

/**
 * Create a new comment on a video
 * POST /api/comments/:videoId (protected)
 */
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Text required" });

    // ensure req.user exists (auth middleware should set it)
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.id || req.user._id;

    const comment = new Comment({
      text: text.trim(),
      userId,
      videoId: req.params.videoId
    });

    await comment.save();

    // push comment id into video.comments (avoid duplicate push if not necessary)
    await Video.findByIdAndUpdate(req.params.videoId, { $push: { comments: comment._id } }).catch((e) => {
      // don't fail the request entirely if video update fails, but log it
      console.error("Failed to append comment id to video:", e);
    });

    // populate user fields for client convenience
    await comment.populate("userId", "username avatar");

    return res.status(201).json(comment);
  } catch (err) {
    console.error("createComment error:", err);
    return res.status(500).json({ message: "Server error while creating comment" });
  }
};

/**
 * Update a comment (owner only)
 * PUT /api/comments/:id (protected)
 */
export const updateComment = async (req, res) => {
  try {
    // find comment
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ensure req.user exists
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = String(req.user.id || req.user._id);

    // ownership check
    if (String(comment.userId) !== userId) return res.status(403).json({ message: "Not allowed" });

    // update
    if (typeof req.body.text === "string" && req.body.text.trim().length > 0) {
      comment.text = req.body.text.trim();
    }
    await comment.save();
    await comment.populate("userId", "username avatar");
    return res.json(comment);
  } catch (err) {
    console.error("updateComment error:", err);
    return res.status(500).json({ message: "Server error while updating comment" });
  }
};

/**
 * Delete a comment (owner only)
 * DELETE /api/comments/:id (protected)
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ensure req.user exists
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = String(req.user.id || req.user._id);

    // ownership check
    if (String(comment.userId) !== userId) return res.status(403).json({ message: "Not allowed" });

    // remove the comment document
    await Comment.findByIdAndDelete(req.params.id);

    // remove reference from Video.comments (best-effort)
    await Video.findByIdAndUpdate(comment.videoId, { $pull: { comments: comment._id } }).catch((e) => {
      console.error("Failed to remove comment id from video.comments:", e);
    });

    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteComment error:", err);
    return res.status(500).json({ message: "Server error while deleting comment" });
  }
};
