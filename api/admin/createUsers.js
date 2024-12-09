import bcrypt from 'bcryptjs';
import connectDB from '../../config/db'; // Adjusted to match your structure
import User from '../../models/User';
import crypto from 'crypto';

// Ensure the database connection is established
connectDB();

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return createUsers(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Function to create multiple users
async function createUsers(req, res) {
  const { emails, courses } = req.body;

  // Validate input
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Invalid or missing email addresses' });
  }
  if (!courses || !Array.isArray(courses)) {
    return res.status(400).json({ error: 'Invalid or missing courses' });
  }

  try {
    const newUsers = [];

    for (const email of emails) {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User with email ${email} already exists, skipping.`);
        continue; // Skip creating user if already exists
      }

      // Generate a random password
      const plainPassword = generateRandomPassword();

      // Hash the password using bcryptjs
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Create new user
      const newUser = new User({
        name: email.split('@')[0], // Default name from email before the @
        email,
        password: hashedPassword,
        role: 'student', // Default role for new users
        courses,
      });

      await newUser.save();
      newUsers.push({ email, plainPassword }); // Store user info with plain password for email purposes
    }

    return res.status(201).json({
      message: 'Users created successfully',
      users: newUsers, // Return the newly created users with their plain passwords
    });
  } catch (error) {
    console.error('Error creating users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to generate a random password
function generateRandomPassword() {
  return crypto.randomBytes(8).toString('hex'); // 16-character hex string
}