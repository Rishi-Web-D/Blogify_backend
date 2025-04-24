const Blog = require('../models/Blog');
const User = require('../models/User');

// Get all blogs (public)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get single blog by ID (public)
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.status !== 'published') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();
    
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, summary, coverImage, tags, status } = req.body;
    
    const newBlog = new Blog({
      title,
      content,
      summary,
      coverImage,
      tags,
      status,
      author: req.user.id
    });
    
    const blog = await newBlog.save();
    
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the blog author
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { title, content, summary, coverImage, tags, status } = req.body;
    
    // Update blog fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (summary) blog.summary = summary;
    if (coverImage) blog.coverImage = coverImage;
    if (tags) blog.tags = tags;
    if (status) blog.status = status;
    
    await blog.save();
    
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the blog author
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await blog.remove();
    
    res.json({ message: 'Blog removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server error');
  }
};

// Like a blog
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if the blog has already been liked by this user
    if (blog.likes.some(like => like.toString() === req.user.id)) {
      // Remove the like
      blog.likes = blog.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Add the like
      blog.likes.unshift(req.user.id);
    }
    
    await blog.save();
    
    res.json(blog.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server error');
  }
};

// Add comment to blog
exports.addComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const newComment = {
      text: req.body.text,
      user: req.user.id
    };
    
    blog.comments.unshift(newComment);
    
    await blog.save();
    
    // Populate user info for the new comment
    await blog.populate('comments.user', 'username profilePicture');
    
    res.json(blog.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Find the comment
    const comment = blog.comments.find(comment => comment.id === req.params.comment_id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Remove the comment
    blog.comments = blog.comments.filter(comment => comment.id !== req.params.comment_id);
    
    await blog.save();
    
    res.json(blog.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
};