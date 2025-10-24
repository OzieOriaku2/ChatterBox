const User = require("../../models/userModel");

const create = async (userData) => {
  return await User.create(userData);
};

const findByEmail = async (email) => {
  return await User.findOne({ email }).select('+password');
};

const findByUsername = async (username) => {
  return await User.findOne({ username }).lean();
};

const findById = async (id) => {
  return await User.findById(id).select('-password').lean();
};

const addJoinedChannel = async (userId, channelId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { joinedChannels: channelId } }, // ✅ Fixed: prevents duplicates
    { new: true }
  ).select('-password').lean();
};

const removeJoinedChannel = async (userId, channelId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { joinedChannels: channelId } },
    { new: true }
  ).select('-password').lean();
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  findById,
  addJoinedChannel,
  removeJoinedChannel
};