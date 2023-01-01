const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  const { id: postId } = req.params;
  res.send(commentsByPostId[postId]);
});

app.post("/posts/:id/comments", async (req, res) => {
  const id = randomUUID();
  const { id: postId } = req.params;
  const { content } = req.body;
  const comments = commentsByPostId[postId] || [];
  comments.push({ id, postId, content, status: "pending" });
  commentsByPostId[postId] = comments;

  axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: { id, postId, content, status: "pending" },
  });
  res.status(201).send(commentsByPostId[postId]);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { id, postId, status } = data;

    const comment = commentsByPostId[postId].find((comment) => {
      return comment.id === id;
    });

    comment.status = status;
    axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: { ...comment },
    });
  }
  res.send({});
});

app.listen(4001, () => console.log(" Listening on 4001"));
