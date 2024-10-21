const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const commentRoutes = require('./routes/comments');  // Make sure this is imported after initializing app
const Comment = require('./models/Comment'); 
const data = require('./data.json');
const { subMonths, subWeeks, subDays } = require('date-fns'); // Import date-fns functions

const app = express();  // Initialize the app here
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

  // MongoDB Connection
  mongoose.connect('mongodb://localhost:27017/commentsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() =>{ 
  console.log('MongoDB connected');
  seedDatabase();
  }).catch(err => console.log(err));

  // Seeder function to load default comments
const seedDatabase = async () => {
    try {
      const existingComments = await Comment.find();  // Check if there are comments in the DB
      if (existingComments.length === 0) {
        const commentsToInsert = transformComments(data.comments);  // Corrected reference
        // Insert default comments from data.json if none exist
        await Comment.insertMany(commentsToInsert);
        console.log('Default comments seeded');
      } else {
        console.log('Comments already exist in the database');
      }
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  };

  // Function to transform human-readable date strings into actual Date objects
const transformComments = (comments) => {
  return comments.map(comment => {
      // Adjust the createdAt field
      if (comment.createdAt.includes('month')) {
        const monthsAgo = parseInt(comment.createdAt.split(' ')[0]);
        comment.createdAt = subMonths(new Date(), monthsAgo);
      } else if (comment.createdAt.includes('week')) {
        const weeksAgo = parseInt(comment.createdAt.split(' ')[0]);
        comment.createdAt = subWeeks(new Date(), weeksAgo);
      } else if (comment.createdAt.includes('day')) {
        const daysAgo = parseInt(comment.createdAt.split(' ')[0]);
        comment.createdAt = subDays(new Date(), daysAgo);
      } else {
        comment.createdAt = new Date();
      }
      

      // Recursively transform replies
      if (comment.replies && comment.replies.length > 0) {
          comment.replies = transformComments(comment.replies);
      }

      return comment;
  });
};

// Routes
app.use('/api', commentRoutes);  // Now this should work correctly because app is already initialized

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the comments API');
});

// Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// Default comments data
const defaultComments = [
    {
      content: "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
      createdAt: "1 month ago",
      score: 12,
      user: {
        username: "amyrobson",
        image: {
          png: "/images/image-amyrobson.png",
          webp: "/images/image-amyrobson.webp"
        }
      },
      replies: []
    },
    {
      content: "Woah, your project looks awesome! How long have you been coding for? I'm still new, but I think I want to dive into React as well soon.",
      createdAt: "2 weeks ago",
      score: 5,
      user: {
        username: "maxblagun",
        image: {
          png: "/images/image-maxblagun.png",
          webp: "/images/image-maxblagun.webp"
        }
      },
      replies: [
        {
          content: "@maxblagun If you're still new, I'd recommend focusing on the fundamentals of HTML, CSS, and JS before considering React. It's tempting to jump ahead but lay a solid foundation first.",
          createdAt: "1 week ago",
          score: 4,
          user: {
            username: "ramsesmiron",
            image: {
              png: "/images/image-ramsesmiron.png",
              webp: "/images/image-ramsesmiron.webp"
            }
          }
        },
        {
          content: "@maxblagun I couldn't agree more. Everything moves so fast and it seems like everyone knows the newest framework. But the fundamentals are what stay constant.",
          createdAt: "2 days ago",
          score: 2,
          user: {
            username: "juliusomo",
            image: {
              png: "/images/image-juliusomo.png",
              webp: "/images/image-juliusomo.webp"
            }
          }
        }
      ]
    }
  ];
  
  // Function to seed the default comments into the database if none exist
  const seedComments = async () => {
    try {
      const existingComments = await Comment.find(); // Check if comments already exist
      if (existingComments.length === 0) {
        await Comment.insertMany(defaultComments);   // Insert default comments
        console.log('Default comments have been added');
      } else {
        console.log('Comments already exist in the database');
      }
    } catch (error) {
      console.error('Error seeding comments:', error);
    }
  };
