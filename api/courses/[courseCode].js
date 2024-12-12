import { connectDB } from '../../../../../config/db';
import Course from '../../../../../models/Course';
import { authenticate } from '../../../../../middleware/auth';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = authenticate(req, res);
  if (!user) return;

  const { courseCode } = req.query;
  const allowedCourses = user.courses || [];

  if (!allowedCourses.includes(courseCode)) {
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
