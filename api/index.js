// /api/index.js
import express from 'express';
import {connectDB} from '../config/db'; // Adjust the path
import questionsRoutes from './questions'; // Adjust the path

const app = express();

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/questions', questionsRoutes);

// Export for Vercel to handle as a serverless function
export default app;