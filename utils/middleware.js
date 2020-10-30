const logger = require("./logger");

// if there is authorization on a request, extract and push along pipeline else null
const tokenExtractor = (request, response, next) => {
  const authorizationRequest = request.get("authorization");

  request.token =
    authorizationRequest &&
    authorizationRequest.toLowerCase().startsWith("bearer ")
      ? (request.token = authorizationRequest.substring(7))
      : null;

  next();
};

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).send({ error: "Invalid token" });
  }

  next(error);
};

module.exports = {
  tokenExtractor,
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
