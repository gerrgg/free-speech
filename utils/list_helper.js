const _ = require("lodash");
const e = require("express");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  // if empty return 0
  if (blogs.length === 0) return 0;

  // if 1 then return the only blogs likes - anymore and add them all up
  return blogs.length === 1
    ? blogs[0].likes
    : blogs.reduce((p, n) => p.likes + n.likes);
};

const favoriteBlog = (blogs) =>
  !blogs.length ? null : _.maxBy(blogs, "likes");

const mostBlogs = (blogs) => {
  // return null if empty
  if (!blogs.length) return null;

  // get the user with the most blogs
  let user = _.maxBy(blogs, "user").user;
  let blogCount = 0;

  // count each blog with user name
  blogs.forEach((blog) => (blog.user !== user ? 0 : blogCount++));

  return { user, blogs: blogCount };
};

const mostLikes = (blogs) => {
  // return null if empty
  if (!blogs.length) return null;

  // get user with most likes
  let user = _.maxBy(blogs, "likes").user;

  // sum up user like count
  let likes = _.sumBy(blogs, (o) => (o.user !== user ? 0 : o.likes));

  return { user, likes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
