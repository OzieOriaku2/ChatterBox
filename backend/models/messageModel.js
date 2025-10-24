const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    minlength: [1, 'Message cannot be empty'],
    maxlength: [2000, 'Message must be less than 2000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message sender is required']
  },
  channelId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: [true, 'Channel is required']
  }
}, {
  timestamps: true  
});

// Indexes for faster message queries
messageSchema.index({ channelId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;