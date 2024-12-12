import bcrypt from 'bcryptjs';
import { connectDB } from '../../config/db';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Now we know who the user is (decoded.email)
  // This route lets them update only their own profile
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        courses: user.courses
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
