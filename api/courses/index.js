import { connectDB } from '../../config/db';
import Course from '../../models/Course';
import { authenticate } from '../../middleware/auth';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = authenticate(req, res);
  if (!user) return; // authenticate already handled response if null

  const allowedCourses = user.courses || [];
  if (allowedCourses.length === 0) {
    return res.status(200).json([]);
  }

  try {
    const courses = await Course.find({ code: { $in: allowedCourses } }).lean();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
