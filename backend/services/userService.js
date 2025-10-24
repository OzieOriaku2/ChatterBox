const userRepository = require("../database/repositories/userRepository");

const register = async (userData) => {
  const { username, email, password } = userData;

  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required");
  }

  try {
    const user = await userRepository.create({
      username,
      email,
      password
    });

    const token = user.generateToken();

    return {
      ...user.toJSON(), 
      token
    };
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      throw new Error(`User with this ${field || 'credential'} already exists`);
    }
    throw error;
  }
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = user.generateToken();

  return {
    ...user.toJSON(), 
    token
  };
};

const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user; 
};

const updateJoinedChannels = async (userId, channelId, action = 'add') => {
  if (action === 'add') {
    return await userRepository.addJoinedChannel(userId, channelId);
  } else if (action === 'remove') {
    return await userRepository.removeJoinedChannel(userId, channelId);
  } else {
    throw new Error("Invalid action: must be 'add' or 'remove'");
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateJoinedChannels 
};