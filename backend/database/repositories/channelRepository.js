const Channel = require('../../models/channelModel');

const create = async (channelData) => {
  return await Channel.create(channelData);
};

const findAll = async () => {
  return await Channel.find({})
    .populate('createdBy', 'username email')
    .lean();
};

const findById = async (id) => {
  return await Channel.findById(id)
    .populate('createdBy', 'username email')
    .populate('members', 'username email')
    .lean();
};

const addMember = async (channelId, userId) => {
  return await Channel.findByIdAndUpdate(
    channelId,
    { $addToSet: { members: userId } },
    { new: true }
  ).populate('members', 'username email').lean();
};

const removeMember = async (channelId, userId) => {
  return await Channel.findByIdAndUpdate(
    channelId,
    { $pull: { members: userId } },
    { new: true }
  ).populate('members', 'username email').lean();
};

const deleteById = async (id) => {
  return await Channel.findByIdAndDelete(id);
};

module.exports = {
  create,
  findAll,
  findById,
  addMember,
  removeMember,
  deleteById
};