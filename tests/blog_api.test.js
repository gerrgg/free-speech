const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("salainen", 10);

  const user = new User({
    username: "mluukkai",
    name: "Matti Luukkainen",
    passwordHash: passwordHash,
  });

  const savedUser = await user.save();

  const blog = new Blog({
    title: "React patterns 2",
    url: "https://reactpatterns.com/",
    user: savedUser._id,
    likes: 7,
  });

  await blog.save();
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("blogs should have data on creator", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.user);
  });

  test("the _id is undefined", async () => {
    const undefinedId = await helper.nonExistingId();
    expect(undefinedId).not.toBeUndefined();
  });
});

describe("addition of a new note", () => {
  test("adding a blog should fail without authentication", async () => {
    const loggedInUser = await helper.getLoggedInUser();

    const newBlog = {
      title: "The Cat in the Hat 2",
      userId: loggedInUser.data.id,
      url:
        "https://www.storyjumper.com/book/read/44442296/The-Cat-in-the-Hat#page/1",
      likes: 500,
    };

    // Purposefully omitted auth
    await api
      .post("/api/blogs")
      .send(newBlog)
      // .set("Authorization", "Bearer " + loggedInUser.token)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  test("a valid blog can be added if a user is logged in", async () => {
    const loggedInUser = await helper.getLoggedInUser();
    const beforeCreate = await helper.blogsInDb();

    const newBlog = {
      title: "The Cat in the Hat 2",
      userId: loggedInUser.data.id,
      url:
        "https://www.storyjumper.com/book/read/44442296/The-Cat-in-the-Hat#page/1",
      likes: 500,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", "Bearer " + loggedInUser.token)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(beforeCreate.length + 1);
  });

  test("Blogs missing the likes property default to 0", async () => {
    const loggedInUser = await helper.getLoggedInUser();

    const blogObjectWithoutLikes = {
      title: "The Cat in the Hat",
      userId: loggedInUser.data.id,
      url:
        "https://www.storyjumper.com/book/read/44442296/The-Cat-in-the-Hat#page/1",
    };

    const response = await api
      .post("/api/blogs")
      .send(blogObjectWithoutLikes)
      .set("Authorization", "Bearer " + loggedInUser.token)
      .expect(201);

    expect(response.body.likes).toBe(0);
  });

  test("Blogs without the title or url are responded to with a 400 status", async () => {
    const loggedInUser = await helper.getLoggedInUser();

    // no title or url
    const badBlogObj = {
      userId: loggedInUser.data.id,
      likes: 9000,
    };

    await api
      .post("/api/blogs")
      .send(badBlogObj)
      .set("Authorization", "Bearer " + loggedInUser.token)
      .expect(400);
  });
});

describe("When deleting a blog post", () => {
  test("should return 401 when deleting a blog WITHOUT authorization", async () => {
    const blogsBeforeDelete = await helper.blogsInDb();

    const response = await api.delete(`/api/blogs/${blogsBeforeDelete[0].id}`);

    // exclude authorization header
    expect(response.status).toBe(401);

    const blogsAfterDelete = await helper.blogsInDb();

    expect(blogsAfterDelete).toHaveLength(blogsBeforeDelete.length);
  });

  test("should return 204 when deleting a blog WITH authorization", async () => {
    const loggedInUser = await helper.getLoggedInUser();
    const blogsBeforeDelete = await helper.blogsInDb();

    // set authorization header
    const response = await api
      .delete(`/api/blogs/${blogsBeforeDelete[0].id}`)
      .set("Authorization", "Bearer " + loggedInUser.token);

    expect(response.status).toBe(204);

    const blogsAfterDelete = await helper.blogsInDb();

    expect(blogsAfterDelete).toHaveLength(blogsBeforeDelete.length - 1);
  });
});

describe("when updating a blog", () => {
  test("responds with 204 with valid update", async () => {
    const blogBeforeUpdate = await helper.firstBlog();

    blogBeforeUpdate.likes = 123;

    const response = await api.put(
      `/api/blogs/${blogBeforeUpdate.id}`,
      blogBeforeUpdate
    );

    expect(response.status).toBe(200);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
