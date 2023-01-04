const express = require("express");
const { randomUUID } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", async (req, res) => {
  const id = randomUUID();
  const { title } = req.body;
  posts[id] = { id, title };

  axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: { id, title },
  });

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Recived Event", req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log("more one change");
  console.log(" Listening on 4000");
});
