// create web server
const express = require('express');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const port = 4001;

// use cors
app.use(cors());

// use json
app.use(express.json());

// create comments
const commentsByPostId = {};

// get comments
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// create comment
app.post('/posts/:id/comments', (req, res) => {
  const commentId = uuidv4();
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  const comment = {
    id: commentId,
    content,
    status: 'pending',
  };
  comments.push(comment);
  commentsByPostId[req.params.id] = comments;
  res.status(201).send(comments);
});

// receive event from event bus
app.post('/events', (req, res) => {
  console.log('Event Received:', req.body.type);
  const { type, data } = req.body;
  if (type === 'CommentModerated') {
    const { postId, id, status } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;
    axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: { ...comment, postId },
    });
  }
  res.send({});
});

// listen port
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});