import api from './api';

const channelService = {
  // Get all channels
  getAllChannels: async () => {
    const response = await api.get('/channels');
    return response.data;
  },

  // Get channel by ID
  getChannelById: async (channelId) => {
    const response = await api.get(`/channels/${channelId}`);
    return response.data;
  },

  // Create new channel
  createChannel: async (channelData) => {
    const response = await api.post('/channels', channelData);
    return response.data;
  },

  // Join a channel
  joinChannel: async (channelId) => {
    const response = await api.post(`/channels/${channelId}/join`);
    return response.data;
  },

  // Leave a channel
  leaveChannel: async (channelId) => {
    const response = await api.post(`/channels/${channelId}/leave`);
    return response.data;
  },

  // Delete a channel
  deleteChannel: async (channelId) => {
    const response = await api.delete(`/channels/${channelId}`);
    return response.data;
  },
};

export default channelService;