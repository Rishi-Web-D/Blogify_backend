const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id/blogs
// @desc    Get all blogs by user
// @access  Public
router.get('/:id/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      author: req.params.id,
      status: 'published'
    }).sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, profilePicture } = req.body;
    
    // Build user profile object
    const userFields = {};
    if (username) userFields.username = username;
    if (bio) userFields.bio = bio;
    if (profilePicture) userFields.profilePicture = profilePicture;
    
    // Update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;