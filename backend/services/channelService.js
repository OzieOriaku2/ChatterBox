const mongoose = require("mongoose");
const channelRepository = require("../database/repositories/channelRepository");
const userRepository = require("../database/repositories/userRepository");

const createChannel = async (channelData, createdById) => {
  const { name, description } = channelData;

  if (!name) {
    throw new Error("Channel name is required");
  }

  try {
    const channel = await channelRepository.create({
      name,
      description: description || '',
      members: [createdById],
      createdBy: createdById
    });

    await userRepository.addJoinedChannel(createdById, channel._id);

    const populatedChannel = await channelRepository.findById(channel._id);
    return populatedChannel;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("A channel with this name already exists");
    }
    throw error;
  }
};

const getAllChannels = async () => {
  return await channelRepository.findAll();
};

const getChannelById = async (channelId) => {
  if (!mongoose.isValidObjectId(channelId)) {
    throw new Error("Invalid channel ID");
  }

  const channel = await channelRepository.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }
  return channel;
};

const joinChannel = async (channelId, userId) => {
  if (!mongoose.isValidObjectId(channelId)) {
    throw new Error("Invalid channel ID");
  }

  const channel = await channelRepository.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  // Handle populated members
  const userIdStr = userId.toString();
  const memberIdsStr = channel.members.map(member => 
    (member._id || member).toString()
  );
  
  if (memberIdsStr.includes(userIdStr)) {
    throw new Error("You are already a member of this channel");
  }

  const updatedChannel = await channelRepository.addMember(channelId, userId);
  await userRepository.addJoinedChannel(userId, channelId);

  return updatedChannel;
};

const leaveChannel = async (channelId, userId) => {
  if (!mongoose.isValidObjectId(channelId)) {
    throw new Error("Invalid channel ID");
  }

  const channel = await channelRepository.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  // Handle populated members
  const userIdStr = userId.toString();
  const memberIdsStr = channel.members.map(member => 
    (member._id || member).toString()
  );
  
  if (!memberIdsStr.includes(userIdStr)) {
    throw new Error("You are not a member of this channel");
  }

  const updatedChannel = await channelRepository.removeMember(channelId, userId);
  await userRepository.removeJoinedChannel(userId, channelId);

  return updatedChannel;
};

const deleteChannel = async (channelId, userId) => {
  if (!mongoose.isValidObjectId(channelId)) {
    throw new Error("Invalid channel ID");
  }

  const channel = await channelRepository.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  // Fix: Handle populated createdBy
  const createdById = (channel.createdBy._id || channel.createdBy).toString();
  
  if (createdById !== userId.toString()) {
    throw new Error("Only the creator can delete this channel");
  }

  // Remove channel from all members' joinedChannels
  if (channel.members && channel.members.length > 0) {
    await Promise.all(
      channel.members.map(member => {
        // Handle populated members
        const memberId = member._id || member;
        return userRepository.removeJoinedChannel(memberId, channelId);
      })
    );
  }

  await channelRepository.deleteById(channelId);

  return { message: "Channel deleted successfully" };
};

module.exports = {
  createChannel,
  getAllChannels,
  getChannelById,
  joinChannel,
  leaveChannel,
  deleteChannel
};