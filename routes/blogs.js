const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');

// @route   GET api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', blogController.getAllBlogs);

// @route   GET api/blogs/:id
// @desc    Get blog by ID
// @access  Public
router.get('/:id', blogController.getBlogById);

// @route   POST api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', auth, blogController.createBlog);

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, blogController.updateBlog);

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, blogController.deleteBlog);

// @route   PUT api/blogs/like/:id
// @desc    Like/unlike a blog
// @access  Private
router.put('/like/:id', auth, blogController.likeBlog);

// @route   POST api/blogs/comment/:id
// @desc    Comment on a blog
// @access  Private
router.post('/comment/:id', auth, blogController.addComment);

// @route   DELETE api/blogs/comment/:id/:comment_id
// @desc    Delete comment from blog
// @access  Private
router.delete('/comment/:id/:comment_id', auth, blogController.deleteComment);

module.exports = router;