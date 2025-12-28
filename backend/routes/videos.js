/* backend/routes/videos.js */
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  listVideos,
  createVideo,
  getVideo,
  updateVideo,
  deleteVideo,
  incrementView,
  likeVideo,
  dislikeVideo
} from "../controllers/videoController.js";

const router = express.Router();

// GET /api/videos - list (supports q and category)
router.get("/", listVideos);

// POST /api/videos - create (protected)
router.post("/", authMiddleware, createVideo);

// GET /api/videos/:id
router.get("/:id", getVideo);

// PUT /api/videos/:id (protected + owner)
router.put("/:id", authMiddleware, updateVideo);

// DELETE /api/videos/:id (protected + owner)
router.delete("/:id", authMiddleware, deleteVideo);

// POST /api/videos/:id/view - increment views
router.post("/:id/view", incrementView);

// POST /api/videos/:id/like
router.post("/:id/like", authMiddleware, likeVideo);

// POST /api/videos/:id/dislike
router.post("/:id/dislike", authMiddleware, dislikeVideo);

export default router;
