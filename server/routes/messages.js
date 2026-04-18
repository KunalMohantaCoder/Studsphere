const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).sort('-createdAt').populate('sender receiver', 'username avatar');

    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const other = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      if (!seen.has(other._id.toString())) {
        seen.add(other._id.toString());
        const unread = await Message.countDocuments({ sender: other._id, receiver: req.user._id, read: false });
        conversations.push({ user: other, lastMessage: msg, unread });
      }
    }
    res.json(conversations);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ]
    }).sort('createdAt').populate('sender receiver', 'username avatar');
    await Message.updateMany({ sender: req.params.userId, receiver: req.user._id }, { read: true });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const msg = await Message.create({ sender: req.user._id, receiver: receiverId, content });
    await msg.populate('sender receiver', 'username avatar');
    const io = req.app.get('io');
    io.emit('message:send', { ...msg.toObject(), receiverId });
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
