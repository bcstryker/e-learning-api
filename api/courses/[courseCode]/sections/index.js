import { connectDB } from '../../../../config/db.js';
import { authenticateUser } from '../../../../middleware/auth.js';
import Section from '../../../../models/Section.js';

export default async function handler(req, res) {
  await connectDB();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
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
    const sections = await Section.find({ courseCode: courseCode }).lean();
    res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
