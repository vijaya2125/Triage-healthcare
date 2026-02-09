import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { JWT_SECRET } from "../config.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, ageGroup } = req.body;

    if (!email || !password || !ageGroup) {
      return res
        .status(400)
        .json({ message: "Email, password, and age group are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      ageGroup
    });

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ageGroup: user.ageGroup
      }
    });
  } catch (err) {
    console.error("Signup error", err);
    res.status(500).json({ message: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ageGroup: user.ageGroup
      }
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Failed to log in" });
  }
});

export default router;

