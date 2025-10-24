const Message = require('../../models/messageModel');

const create = async (messageData) => {
  return await Message.create(messageData);
};

const findByChannelId = async (channelId) => {
  return await Message.find({ channelId })
    .populate('sender', 'username email')
    .sort({ createdAt: 1 }) // ✅ Fixed: was 'timestamp'
    .lean();
};

const findById = async (id) => {
  return await Message.findById(id)
    .populate('sender', 'username email')
    .lean();
};

const deleteById = async (id) => {
  return await Message.findByIdAndDelete(id);
};

const deleteByChannelId = async (channelId) => {
  return await Message.deleteMany({ channelId });
};

module.exports = {
  create,
  findByChannelId,
  findById,
  deleteById,
  deleteByChannelId
};