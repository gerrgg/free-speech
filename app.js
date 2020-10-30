// Config contains DB & prot configuration
const config = require("./utils/config");

// Express streamlines our web application
const express = require("express");

// Adds a layer around async operations to catch errors and pass to error handler
require("express-async-errors");

// Build an app from express
const app = express();

// Allows cross-origin requests
const cors = require("cors");

const jwt = require("jsonwebtoken");

// Logs requests and handles errors gracefully
const middleware = require("./utils/middleware");

// Logs info and requests of the backend
const logger = require("./utils/logger");

// Routers handle url endpoints of the API
const usersRouter = require("./controllers/users");
const blogsRouter = require("./controllers/blogs");
const loginRouter = require("./controllers/login");
const commentsRouter = require("./controllers/comments");

// Connect to the database and log status
const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    logger.info("connecting to " + config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("connected to MongoDB");
  } catch (e) {
    logger.error("error connecting to MongoDB:", e.message);
  }
};

connectToDb();

// Load middleware - the order we load matters
app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/comments", commentsRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
