require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./api/auth"));
app.use("/api/questions", require("./api/questions"));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));