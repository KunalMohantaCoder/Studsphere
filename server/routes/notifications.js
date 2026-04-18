const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt').limit(50)
      .populate('sender', 'username avatar')
      .populate('post', 'title content');
    res.json(notifs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { read: true });
    res.json({ message: 'All read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
