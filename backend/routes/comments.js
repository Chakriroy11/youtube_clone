/* backend/routes/comments.js */
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  listComments,
  createComment,
  updateComment,
  deleteComment
} from "../controllers/commentController.js";

const router = express.Router();

// GET /api/comments/:videoId
router.get("/:videoId", listComments);

// POST /api/comments/:videoId (protected)
router.post("/:videoId", authMiddleware, createComment);

// PUT /api/comments/:id (protected + owner)
router.put("/:id", authMiddleware, updateComment);

// DELETE /api/comments/:id (protected + owner)
router.delete("/:id", authMiddleware, deleteComment);

export default router;
