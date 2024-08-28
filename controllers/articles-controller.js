const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticle,
  updateArticle,
} = require("../models/articles-model");

exports.getArticles = (req, res, next) => {
  const { sort_by = "created_at", order = "desc", topic } = req.query;
  selectArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(Number(article_id))
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  updateArticle(article_id, req.body)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => next(err));
};
