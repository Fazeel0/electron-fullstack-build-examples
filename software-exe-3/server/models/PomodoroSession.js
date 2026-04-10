import mongoose from 'mongoose';

const pomodoroSessionSchema = new mongoose.Schema({
  duration: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['focus', 'break'],
    default: 'focus',
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  label: String,
});

export default mongoose.model('PomodoroSession', pomodoroSessionSchema);
