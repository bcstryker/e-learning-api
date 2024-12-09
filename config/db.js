const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected with user access...");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const connectAdminDB = async () => {
  try {
    await mongoose.connect(process.env.ADMIN_MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected with admin privileges...");
  } catch (err) {
    console.error("MongoDB admin connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, connectAdminDB };