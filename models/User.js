import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  courses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
      code: { type: String, required: true },
      _id: false,
    },
  ],
});

export default mongoose.models.User || mongoose.model('User', UserSchema);