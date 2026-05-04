const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name email role");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found." });
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token." });
  }
};
