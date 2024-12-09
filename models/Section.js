import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  courseId: { type: String, required: true, ref: 'Course' },
  number: { type: Number, required: true },
  title: { type: String, required: true },
});

export default mongoose.models.Section || mongoose.model('Section', SectionSchema);