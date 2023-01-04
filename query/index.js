const express = require("express");
const app = express();
const cors = require("cors");
const { default: axios } = require("axios");

app.use(express.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, postId, content, status } = data;

    posts[postId].comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, postId, content, status } = data;

    const comment = posts[postId].comments.find((comment) => comment.id === id);

    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  console.log("Recived Event", req.body.type);
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({ status: "OK" });
});

app.listen(4002, async () => {
  console.log("Query Service listening on 4002");

  try {
    const res = await axios.get("http://event-bus-srv:4005/events");

    for (let event of res.data) {
      console.log("Porcessing event:", event.type);
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
