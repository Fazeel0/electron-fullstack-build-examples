import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  coded: {
    type: Boolean,
    default: true,
  },
  commitCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('Streak', streakSchema);
