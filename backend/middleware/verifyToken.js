import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Get token from header (standard practice)
  const authHeader = req.headers.token || req.headers.authorization;
  
  if (!authHeader) return res.status(401).json({ message: "You are not authenticated!" });

  // Handle "Bearer <token>" format if necessary
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid!" });
    
    // This 'user' object must contain the 'id' (or _id) used in your controller
    req.user = user; 
    next();
  });
};