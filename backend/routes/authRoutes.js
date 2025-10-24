const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { register, login, getProfile } = require("../services/userService");
const { auth } = require("../middleware/authenticationHandler"); 

// POST /api/auth/register
router.post("/register", asyncHandler(async (req, res) => {
  const user = await register(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await login({ email, password });
  res.json({
    success: true,
    data: user
  });
}));

// GET /api/auth/profile - Protected example
router.get("/profile", auth, asyncHandler(async (req, res) => {
  const user = await getProfile(req.user._id);
  res.json({
    success: true,
    data: user
  });
}));

module.exports = router;