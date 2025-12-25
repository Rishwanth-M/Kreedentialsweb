const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_ASSESS_KEY);
};

const authorization = (req, res, next) => {
  try {
    console.log("🔐 Authorization header:", req.headers.authorization);

    const bearerToken = req.headers.authorization;

    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      console.log("❌ No Bearer token found");
      return res.status(401).json({
        message: "Authorization token missing",
        status: "Failed",
      });
    }

    const token = bearerToken.split(" ")[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        status: "Failed",
      });
    }

    console.log("✅ Token verified. User:", decoded.user);

    req.user = decoded.user;
    next();

  } catch (error) {
    console.log("❌ Authorization error:", error.message);
    return res.status(500).json({
      message: error.message,
      status: "Failed",
    });
  }
};

module.exports = authorization;
