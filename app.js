const express = require("express");
const {
  handleErrorDefault,
  throwEndpointNotFound,
  handleSqlError,
  handleCustomError,
} = require("./controllers/error-handling-middleware");
const { getTopics } = require("./controllers/topics-controller");
const { getApiInfo } = require("./controllers/api-controller");
const {
  getArticleById,
  getArticle,
  getCommentsByArticle,
} = require("./controllers/articles-controller");

const app = express();
module.exports = app;

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticle);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.use(throwEndpointNotFound);

app.use(handleSqlError);

app.use(handleCustomError);

app.use(handleErrorDefault);
