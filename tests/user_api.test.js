const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const User = require("../models/user");

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);

  const user = new User({ username: "root", passwordHash });

  await user.save();
});

describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with 400 status and message if username is taken", async () => {
    const initUsers = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superdaddy",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` to be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(initUsers.length);
  });

  test("creation fails with 400 status and username is omitted", async () => {
    const initUsers = await helper.usersInDb();

    const newUser = {
      name: "Superdaddy",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` is required");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(initUsers.length);
  });

  test("creation fails with 400 if password is omitted", async () => {
    const initUsers = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superdaddy",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Password required");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(initUsers.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
