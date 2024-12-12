// pages/api/sections/[courseCode].js
import jwt from 'jsonwebtoken';
import { connectDB } from '../../config/db';
import Section from '../../models/Section';

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

  const { courseCode } = req.query;
  const allowedCourses = Array.isArray(decoded.courses) ? decoded.courses : [];

  // Check if user can access the requested course
  if (!allowedCourses.includes(courseCode)) {
    return res.status(403).json({ error: 'Access denied: You do not have access to this course' });
  }

  try {
    const sections = await Section.find({ courseCode }).lean();
    return res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
