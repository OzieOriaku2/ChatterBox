const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { getChannelMessages, sendMessage } = require("../services/messageService");
const { auth } = require("../middleware/authenticationHandler");

// GET /api/channels/:id/messages 
router.get("/:id/messages", auth, asyncHandler(async (req, res) => {
  const messages = await getChannelMessages(req.params.id, req.user._id);
  res.json({
    success: true,
    data: messages
  });
}));

// POST /api/channels/:id/messages 
router.post("/:id/messages", auth, asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    res.status(400);
    throw new Error("Message content is required");
  }
  
  const message = await sendMessage(req.params.id, req.user._id, content);
  
  res.status(201).json({
    success: true,
    data: message
  });
}));

module.exports = router;