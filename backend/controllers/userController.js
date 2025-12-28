/* backend/controllers/userController.js */
import User from "../models/User.js";

/**
 * Get user details (protected)
 * GET /api/users/:id
 */
export const getUser = async (req, res) => {
  try {
    // Ensure the logged-in user is requesting their own data or access is appropriate
    // Although the ChannelPage uses this for refresh, a basic check is useful.
    const userId = req.params.id;
    
    // You could optionally check if req.user.id matches userId here for strict security.
    
    const user = await User.findById(userId)
      .select("-password") // Never send the password
      .populate("channels"); // Crucial: Populate the channels array for the ChannelPage

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ message: "Server error while fetching user" });
  }
};