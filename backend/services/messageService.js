const mongoose = require("mongoose");
const messageRepository = require("../database/repositories/messageRepository");
const channelRepository = require("../database/repositories/channelRepository");


const getChannelMessages = async (channelId, userId) => {
  if (!mongoose.isValidObjectId(channelId)) {
    throw new Error("Invalid channel ID");
  }

  const channel = await channelRepository.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  const userIdStr = userId.toString();
  const memberIdsStr = channel.members.map(member => 
    (member._id || member).toString()
  );
  
  if (!memberIdsStr.includes(userIdStr)) {
    throw new Error("You must be a member of this channel to view messages");
  }

  // Fetch all messages in the channel, sorted by time (oldest first)
  const messages = await messageRepository.findByChannelId(channelId);
  return messages;
};


const sendMessage = async (channelId, userId, content) => {
  if (!mongoose.isValidObjectId(channelId)) {
    throw new Error("Invalid channel ID");
  }

  if (!content || !content.trim()) {
    throw new Error("Message content is required");
  }

  const channel = await channelRepository.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  const userIdStr = userId.toString();
  const memberIdsStr = channel.members.map(member => 
    (member._id || member).toString()
  );
  
  if (!memberIdsStr.includes(userIdStr)) {
    throw new Error("You must be a member of this channel to send messages");
  }

  const message = await messageRepository.create({
    content: content.trim(),
    sender: userId,
    channelId: channelId
  });

  const populatedMessage = await messageRepository.findById(message._id);
  return populatedMessage;
};

module.exports = {
  getChannelMessages,
  sendMessage
};