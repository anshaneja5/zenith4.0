import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { authenticateToken }  from '../middleware/auth.js';

const router = express.Router();

// Create a new post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user._id
    });
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all posts with pagination
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name')
      .populate('comments');

    const total = await Post.countDocuments({ status: 'active' });
    
    res.send({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name'
        }
      });
    
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a post
router.patch('/posts/:id', authenticateToken, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'content', 'tags', 'isAnonymous'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    
    if (!post) {
      return res.status(404).send();
    }

    updates.forEach(update => post[update] = req.body[update]);
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a post
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Vote on a post
router.post('/posts/:id/vote', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send();
    }

    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    // Remove user from both arrays first
    post.upvotes = post.upvotes.filter(id => !id.equals(req.user._id));
    post.downvotes = post.downvotes.filter(id => !id.equals(req.user._id));
    
    // Add to appropriate array
    if (voteType === 'upvote') {
      post.upvotes.push(req.user._id);
    } else if (voteType === 'downvote') {
      post.downvotes.push(req.user._id);
    }
    
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Create a comment
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send();
    }

    const comment = new Comment({
      ...req.body,
      author: req.user._id,
      post: req.params.postId
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Vote on a comment
router.post('/comments/:id/vote', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).send();
    }

    const { voteType } = req.body;
    
    comment.upvotes = comment.upvotes.filter(id => !id.equals(req.user._id));
    comment.downvotes = comment.downvotes.filter(id => !id.equals(req.user._id));
    
    if (voteType === 'upvote') {
      comment.upvotes.push(req.user._id);
    } else if (voteType === 'downvote') {
      comment.downvotes.push(req.user._id);
    }
    
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Report a post or comment
router.post('/report/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = type === 'post' ? Post : Comment;
    
    const item = await model.findById(id);
    if (!item) {
      return res.status(404).send();
    }

    item.status = 'reported';
    await item.save();
    
    res.send(item);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;