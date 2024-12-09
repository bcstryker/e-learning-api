import { connectDB } from '../config/db';
import Question from '../models/Question';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { sectionId } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (sectionId) {
        const sectionCourseId = sectionId.split('-')[0].toUpperCase();
        if (!decoded.courses.includes(sectionCourseId)) {
          return res.status(403).json({ error: 'Access denied: You do not have access to this course' });
        }

        const questions = await Question.find({ sectionId });
        return res.status(200).json(questions);
      } else {
        const questions = await Question.find({
          sectionId: { $regex: new RegExp(`^(${decoded.courses.join('|')})`, 'i') },
        });
        return res.status(200).json(questions);
      }
    } catch (error) {
      console.error('Error verifying token or fetching questions:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}