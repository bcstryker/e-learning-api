import { connectDB } from '../../../../../../config/db';
import Section from '../../../../../../models/Section';
import { authenticate } from '../../../../../../middleware/auth';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = authenticate(req, res);
  if (!user) return;

  const { course_code } = req.query;
  const allowedCourses = user.courses || [];

  if (!allowedCourses.includes(course_code)) {
    return res.status(403).json({ error: 'Access denied: Not allowed to view this course' });
  }

  try {
    const sections = await Section.find({ courseCode: course_code }).lean();
    res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
