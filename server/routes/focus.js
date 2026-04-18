const express = require('express');
const FocusSession = require('../models/FocusSession');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get today's session
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let session = await FocusSession.findOne({ user: req.user._id, date: today });
    if (!session) session = await FocusSession.create({ user: req.user._id, date: today, focusMinutes: 0, tasks: [] });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add focus minutes
router.post('/log', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { minutes } = req.body;
    const session = await FocusSession.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $inc: { focusMinutes: minutes } },
      { new: true, upsert: true }
    );
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update tasks
router.put('/tasks', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { tasks } = req.body;
    const session = await FocusSession.findOneAndUpdate(
      { user: req.user._id, date: today },
      { tasks },
      { new: true, upsert: true }
    );
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Monthly analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || (new Date().getMonth() + 1).toString().padStart(2, '0');
    const y = year || new Date().getFullYear().toString();
    const prefix = `${y}-${m}`;
    const sessions = await FocusSession.find({ user: req.user._id, date: { $regex: `^${prefix}` } }).sort('date');
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
