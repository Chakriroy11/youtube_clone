/* backend/routes/users.js */
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getUser } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/:id - Fetch user data (Protected by authMiddleware)
router.get("/:id", authMiddleware, getUser);

export default router;