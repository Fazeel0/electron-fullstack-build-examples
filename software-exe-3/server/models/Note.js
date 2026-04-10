import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
    default: '',
    required: true,
  },
  tags: [String],
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
