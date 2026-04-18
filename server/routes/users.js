const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/suggestions', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $nin: [...req.user.following, req.user._id] } })
      .select('username avatar bio isFounder followers')
      .limit(8);
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('followers following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const posts = await Post.find({ author: user._id }).sort('-createdAt').populate('author', 'username avatar isFounder');
    res.json({ user, posts });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id)
      return res.status(403).json({ message: 'Not allowed' });
    const { bio, skills, interests, buildInPublic, isFounder } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { bio, skills, interests, buildInPublic, isFounder }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/follow', protect, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const isFollowing = target.followers.includes(req.user._id);
    if (isFollowing) {
      target.followers.pull(req.user._id);
      req.user.following.pull(target._id);
    } else {
      target.followers.push(req.user._id);
      req.user.following.push(target._id);
      await Notification.create({ recipient: target._id, sender: req.user._id, type: 'follow', message: `${req.user.username} followed you` });
      const io = req.app.get('io');
      io.emit('notification:send', { receiverId: target._id.toString() });
    }
    await target.save();
    await req.user.save();
    res.json({ following: !isFollowing, followersCount: target.followers.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username avatar bio');
    res.json(user.followers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
