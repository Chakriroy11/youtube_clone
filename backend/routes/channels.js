/* backend/routes/channels.js */
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createChannel, getChannel, listChannels } from "../controllers/channelController.js";

const router = express.Router();

// POST /api/channels - create channel (protected)
router.post("/", authMiddleware, createChannel);

// GET /api/channels/:id
router.get("/:id", getChannel);

// GET /api/channels
router.get("/", listChannels);

export default router;
