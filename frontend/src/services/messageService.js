import api from './api';

const messageService = {
  // Get all messages in a channel
  getChannelMessages: async (channelId) => {
    const response = await api.get(`/channels/${channelId}/messages`);
    return response.data;
  },

  // Send a message
  sendMessage: async (channelId, content) => {
    const response = await api.post(`/channels/${channelId}/messages`, { content });
    return response.data;
  },
};

export default messageService;