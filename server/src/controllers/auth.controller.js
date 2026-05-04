const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["admin", "organizer", "attendee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role supplied." });
    }


    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const matched = await user.comparePassword(password);
    if (!matched) return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};
