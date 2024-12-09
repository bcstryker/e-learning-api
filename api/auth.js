import connectDB from '../config/db';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate a JWT
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          courses: user.courses,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Return the token to the client
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during authentication:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'GET') {
    // Middleware-like behavior for token validation
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Return the decoded token data (user info) for testing purposes
      return res.status(200).json({ user: decoded });
    } catch (error) {
      console.error('JWT validation error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}