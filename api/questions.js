import connectDB from '../config/db';
import Question from '../models/Question';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const questions = await Question.find();
      res.status(200).json(questions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}