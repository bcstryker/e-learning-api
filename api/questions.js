import connectDB from '../config/db';
import Question from '../models/Question';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { sectionId } = req.query; // Extract sectionId from the query parameters

    if (sectionId) {
      try {
        // Fetch questions for the specific section
        const questions = await Question.find({ sectionId });
        res.status(200).json(questions);
      } catch (err) {
        console.error('Error fetching questions for section:', err);
        res.status(500).json({ error: 'Failed to fetch questions for section' });
      }
    } else {
      try {
        // Fetch all questions if no sectionId is provided
        const questions = await Question.find();
        res.status(200).json(questions);
      } catch (err) {
        console.error('Error fetching all questions:', err);
        res.status(500).json({ error: 'Failed to fetch questions' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}