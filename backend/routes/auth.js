/* backend/routes/auth.js */
import express from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email")
      .isEmail()
      .withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  register
);

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  [
    body("emailOrUsername")
      .notEmpty()
      .withMessage("Email or username required"),
    body("password")
      .notEmpty()
      .withMessage("Password required")
  ],
  login
);

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("channels");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("auth/me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
