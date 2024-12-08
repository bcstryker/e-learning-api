require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/questions", require("./routes/questions"));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));