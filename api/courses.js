// pages/api/courses.js
import jwt from 'jsonwebtoken';
import { connectDB } from '../../config/db';
import Course from '../../models/Course';

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const allowedCourses = Array.isArray(decoded.courses) ? decoded.courses : [];
  if (allowedCourses.length === 0) {
    // User has no courses they can access
    return res.status(200).json([]);
  }

  try {
    const courses = await Course.find({ code: { $in: allowedCourses } }).lean();
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
