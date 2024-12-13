import { connectDB } from '../../../../../config/db.js';
import Section from '../../../../../models/Section.js';
import { authenticate } from '../../../../../middleware/auth.js';

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

  const user = authenticate(req, res);
  if (!user) return;

  const { courseCode, sectionId } = req.query;
  const allowedCourses = user.courses || [];

  if (!allowedCourses.includes(courseCode)) {
    return res.status(403).json({ error: 'Access denied: Not allowed to view this course' });
  }

  try {
    const section = await Section.findOne({ courseCode: courseCode, sectionId: sectionId }).lean();
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.status(200).json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
