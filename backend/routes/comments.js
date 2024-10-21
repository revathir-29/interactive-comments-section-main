const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();

// Get all comments
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// POST: Add a new comment
router.post('/comments', async (req, res) => {
    console.log('Received comment:', req.body);  // Log the incoming request body

    const { content, user, score, replies } = req.body;

    // Validation: Ensure content and user data are present
    if (!content || !user || !user.username) {
        return res.status(400).json({ message: 'Invalid comment data' });
    }

    // Create a new comment document
    const comment = new Comment({
        content,
        user,
        score,
        replies
    });

    try {
        const newComment = await comment.save();  // Save the new comment to the database
        res.status(201).json(newComment);  // Send the new comment back as a response
    } catch (err) {
        res.status(400).json({ message: err.message });  // Handle any error during save
    }
});



// Edit a comment
router.put('/comments/:id', async (req, res) => {
    const { id } = req.params;  // Make sure id is coming from URL
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(updatedComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.put('/comments/:id/reply', async (req, res) => {
    const { content, user } = req.body;
    const reply = {
      content,
      user,
      createdAt: new Date(),
      score: 0,
      replies: [],
    };
  
    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        { $push: { replies: reply } }, // Add the new reply to the replies array
        { new: true } // Return the updated comment
      );
  
      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      res.status(200).json(reply); // Return the newly added reply
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
     

// Delete a comment
router.delete('/comments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT: Edit a reply
router.put('/comments/:commentId/replies/:replyId', async (req, res) => {
    const { commentId, replyId } = req.params;
    const { content } = req.body;
  
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
  
    try {
      const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, 'replies._id': replyId },  // Find the specific reply within the comment
        { $set: { 'replies.$.content': content } },  // Use `$` to update the correct reply
        { new: true }  // Return the updated document
      );
  
      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment or reply not found' });
      }
  
      res.status(200).json(updatedComment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // DELETE: Delete a reply
router.delete('/comments/:commentId/replies/:replyId', async (req, res) => {
  const { commentId, replyId } = req.params;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { replies: { _id: replyId } } },  // Use `$pull` to remove the reply
      { new: true }  // Return the updated document
    );

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment or reply not found' });
    }

    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
