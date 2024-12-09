import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);