import bcrypt from 'bcryptjs';
import connectDB from '../../config/db'; // Adjusted for your project structure
import User from '../../models/User';

// Ensure the database connection is established
connectDB();

export default async function handler(req, res) {
  switch (req.method) {
    case 'PUT':
      return updateUser(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Function to update a user
async function updateUser(req, res) {
  const { email, name, newEmail, role, courses, password } = req.body;

  // Validate input
  if (!email) {
    return res.status(400).json({ error: 'Email of the user to update is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (newEmail) user.email = newEmail;
    if (role) user.role = role;
    if (Array.isArray(courses)) user.courses = courses;

    // Hash and update the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        courses: user.courses,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}