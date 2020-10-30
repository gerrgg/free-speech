const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");

const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");

const logger = require("../utils/logger");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
    .populate("user", { username: 1, name: 1 })
    .populate("comments", { content: 1, date: 1, id: 1 });

  response.status(200).json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;

  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id).exec();

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    date: new Date(),
    user: user._id,
  });

  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);

  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.post("/:id/comments", async (request, response) => {
  const body = request.body;
  // get the blog object
  const blog = await Blog.findById(request.params.id).exec();

  console.log(blog);

  // create the new comment
  const comment = new Comment({
    content: body.content,
    blog: blog._id,
    date: new Date(),
  });

  const savedComment = await comment.save();

  blog.comments = blog.comments.concat(comment._id);

  await blog.save();

  response.status(201).json(savedComment);
});

blogsRouter.delete("/:id", async (request, response, next) => {
  const blogToDelete = await Blog.findById(request.params.id);

  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (
    blogToDelete &&
    decodedToken.id &&
    blogToDelete.user.toString() !== decodedToken.id.toString()
  ) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response, next) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    user: body.user,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });

  response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
