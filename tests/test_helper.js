const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

const nonExistingId = async () => {
  const blog = new Blog({
    title: "The Cat in the Hat",
    userID: "5f611794f427ff74350da53d",
    url:
      "https://www.storyjumper.com/book/read/44442296/The-Cat-in-the-Hat#page/1",
    likes: 500,
  });

  await blog.save();
  await blog.remove();
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const firstBlog = async () => {
  const blogs = await Blog.find({});
  return blogs[0].toJSON();
};

const getLoggedInUser = async () => {
  const users = await usersInDb();

  const validCreds = {
    username: users[0].username,
    password: "salainen",
  };

  // // log user in
  const loginResponse = await api
    .post("/api/login")
    .send(validCreds)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  return { token: loginResponse.body.token, data: users[0] };
};

module.exports = {
  firstBlog,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getLoggedInUser,
};
