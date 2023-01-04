const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

app.post("/events", (req, res) => {
  console.log("Recived Event", req.body.type);
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const { id, postId, content } = data;

    if (content.includes("orange")) {
      data.status = "rejected";
    } else {
      data.status = "approved";
    }

    setTimeout(() => {
      axios.post("http://event-bus-srv:4005/events", {
        type: "CommentModerated",
        data: {
          id,
          postId,
          content,
          status: data.status,
        },
      });
    }, 10000);
  }
});

app.listen(4003, console.log("Moderation listening on 4003"));
