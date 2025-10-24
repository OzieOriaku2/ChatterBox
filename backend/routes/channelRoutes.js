const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { createChannel, getAllChannels, getChannelById, joinChannel, leaveChannel, deleteChannel } = require("../services/channelService");
const { auth } = require("../middleware/authenticationHandler"); 

// GET /api/channels - Fetch all public channels (no auth needed for browsing)
router.get("/", asyncHandler(async (req, res) => {
  const channels = await getAllChannels();
  res.json({
    success: true,
    data: channels
  });
}));

// POST /api/channels - Create a new channel (protected)
router.post("/", auth, asyncHandler(async (req, res) => {
  const channel = await createChannel(req.body, req.user._id);
  res.status(201).json({
    success: true,
    data: channel
  });
}));

// GET /api/channels/:id - Get channel details (optional auth; public for now)
router.get("/:id", asyncHandler(async (req, res) => {
  const channel = await getChannelById(req.params.id);
  res.json({
    success: true,
    data: channel
  });
}));

// POST /api/channels/:id/join - Join a channel (protected)
router.post("/:id/join", auth, asyncHandler(async (req, res) => {
  const channel = await joinChannel(req.params.id, req.user._id);
  res.json({
    success: true,
    data: channel,
    message: "Successfully joined the channel"
  });
}));

// POST /api/channels/:id/leave - Leave a channel (protected)
router.post("/:id/leave", auth, asyncHandler(async (req, res) => {
  const channel = await leaveChannel(req.params.id, req.user._id);
  res.json({
    success: true,
    data: channel,
    message: "Successfully left the channel"
  });
}));

// DELETE /api/channels/:id - Delete a channel (protected, creator only)
router.delete("/:id", auth, asyncHandler(async (req, res) => {
  const result = await deleteChannel(req.params.id, req.user._id);
  res.json({
    success: true,
    data: result
  });
}));

module.exports = router;