import express from "express";
import { 
  listComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/comments/:videoId - Public: Anyone can see comments
router.get("/:videoId", listComments);

// POST /api/comments/:videoId - Protected: Must be logged in to comment
router.post("/:videoId", verifyToken, createComment);

// PUT /api/comments/:id - Protected: Must be owner to edit
router.put("/:id", verifyToken, updateComment);

// DELETE /api/comments/:id - Protected: Must be owner to delete
router.delete("/:id", verifyToken, deleteComment);

export default router;