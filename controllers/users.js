const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", { title: 1, likes: 1 });
  response.status(200).json(users);
});

usersRouter.post("/", async (request, response) => {
  const body = request.body;

  if (!body.password)
    return response.status(400).json({ error: "Password required" });

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
