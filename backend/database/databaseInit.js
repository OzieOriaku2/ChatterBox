const mongoose = require("mongoose");
const { DATABASE_URI } = require('../constants');

const connectDatabase = async () => {
  try {
    // Note: useNewUrlParser and useUnifiedTopology are now default in Mongoose 6+
    // and have been removed to avoid deprecation warnings
    const connection = await mongoose.connect(DATABASE_URI);
    
    console.log(`✅ Database connected successfully!`);
    console.log(`   Host: ${connection.connection.host}`);
    console.log(`   Database: ${connection.connection.name}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;