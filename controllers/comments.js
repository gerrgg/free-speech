const commentsRouter = require("express").Router();

const Comment = require("../models/comment");
const Blog = require("../models/blog");

commentsRouter.get("/", async (request, response) => {
  // populate with the blog the comment is on
  const comments = await Comment.find({}).populate("blog", {
    title: 1,
    url: 1,
    likes: 1,
  });

  response.status(200).json(comments);
});

module.exports = commentsRouter;
