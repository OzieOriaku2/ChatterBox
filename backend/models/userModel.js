const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../constants'); 

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false 
  },
  joinedChannels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }]
}, {
  timestamps: true 
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token (instance method)
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id },
    JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );
};

// Optional: Instance method to get public user data (exclude password)
userSchema.methods.toJSON = function() {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;