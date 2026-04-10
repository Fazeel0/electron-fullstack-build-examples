import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: () => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    },
  },
}, { timestamps: true });

export default mongoose.model('Todo', todoSchema);
