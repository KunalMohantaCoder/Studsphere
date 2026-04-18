const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { tag, search, type } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (type) filter.type = type;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
    const posts = await Post.find(filter).sort('-createdAt')
      .populate('author', 'username avatar isFounder buildInPublic');
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, content, tags, type } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });
    const post = await Post.create({ author: req.user._id, title, content, tags: tags || [], type: type || 'thought' });
    await post.populate('author', 'username avatar isFounder');
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not allowed' });
    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id, message: `${req.user.username} liked your post` });
        const io = req.app.get('io');
        io.emit('notification:send', { receiverId: post.author.toString() });
      }
    }
    await post.save();
    res.json({ liked: !liked, likesCount: post.likes.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/save', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const saved = post.savedBy.includes(req.user._id);
    if (saved) { post.savedBy.pull(req.user._id); req.user.savedPosts.pull(post._id); }
    else { post.savedBy.push(req.user._id); req.user.savedPosts.push(post._id); }
    await post.save();
    await req.user.save();
    res.json({ saved: !saved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'username avatar');
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id, message: `${req.user.username} commented on your post` });
      const io = req.app.get('io');
      io.emit('notification:send', { receiverId: post.author.toString() });
    }
    res.json(post.comments[post.comments.length - 1]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/saved', protect, async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.user._id }).sort('-createdAt')
      .populate('author', 'username avatar isFounder');
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
