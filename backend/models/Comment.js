const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  user: {
    username: { type: String, required: true },
    image: {
      png: { type: String, required: true },
      webp: { type: String }
    }
  },
  replies: [{
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    user: {
      username: { type: String, required: true },
      image: {
        png: { type: String, required: true },
        webp: { type: String }
      }
    }
  }]
});

module.exports = mongoose.model('Comment', CommentSchema);
