const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  date: { type: String, required: true }, // YYYY-MM-DD
});

const focusSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  focusMinutes: { type: Number, default: 0 },
  tasks: [taskSchema],
}, { timestamps: true });

focusSessionSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
