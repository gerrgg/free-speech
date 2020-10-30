const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password", 10);

  const user = new User({ username: "root", passwordHash });

  await user.save();
});

describe("when not logged in", () => {
  test("should return 200 with valid credentials", async () => {
    const validCreds = {
      username: "root",
      password: "password",
    };

    await api
      .post("/api/login")
      .send(validCreds)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("should return 400 with invalid user credentials", async () => {
    const invalidCreds = {
      username: "root",
      password: "someotherpassword",
    };

    const result = await api
      .post("/api/login")
      .send(invalidCreds)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("invalid username or password");
  });
});

afterAll(() => {
  mongoose.connection.close();
});
