const router = require("express").Router();
const Post = require("../models/Post.js");

const verifyUser = require("../verifyUser");

router.post("/create", async (req, res) => {
  const post = new Post({ ...req.body });
  try {
    const newPost = await post.save();
    res.status(202).send(newPost);
  } catch (error) {
    res.send(400).send({ msg: "post not saved", error });
  }
});

router.get("/", verifyUser, async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
});

module.exports = router;
