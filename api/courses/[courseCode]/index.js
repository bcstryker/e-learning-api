import { connectDB } from '../../../config/db.js';
import Course from '../../../models/Course.js';
import { authenticateUser } from "../../../middleware/auth.js";

export default async function handler(req, res) {
  await connectDB();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user;
  try {
    user = await authenticateUser(req);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
  const { courseCode } = req.query;
  const allowedCourses = user.courses || [];
  const allowedCourseCodes = allowedCourses.map((course) => course.code);

  if (!allowedCourseCodes.includes(courseCode)) {
    return res.status(403).json({ error: 'Access denied: Not allowed to view this course' });
  }

  try {
    const course = await Course.findOne({ code: courseCode }).lean();
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
