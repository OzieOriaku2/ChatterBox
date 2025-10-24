const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    unique: true,        
    trim: true,
    minlength: [2, 'Channel name must be at least 2 characters'],
    maxlength: [50, 'Channel name must be less than 50 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Channel creator is required']
  }
}, {
  timestamps: true
});



const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;