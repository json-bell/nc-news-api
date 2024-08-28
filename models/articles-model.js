const db = require("../db/connection");
const format = require("pg-format");
const { checkExists, getOrder } = require("./utils");

exports.selectArticles = (sort_by, order, topic) => {
  return getOrder(order)
    .then((queryOrder) => {
      const queryValidityCheckProms = [];
      const queryParams = [];
      if (topic !== undefined) {
        queryValidityCheckProms.push(checkExists("topics", "slug", topic));
        queryParams.push(topic);
      }
      const queryStr = format(
        `SELECT
          articles.author,
          articles.title,
          articles.article_id,
          articles.topic,
          articles.created_at,
          articles.votes,
          articles.article_img_url,
          COUNT(comments.comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        ${topic === undefined ? `` : `WHERE articles.topic = $1`}
        GROUP BY
          articles.article_id
        ORDER BY articles.%I ${queryOrder};`,
        sort_by
      );
      return Promise.all([queryStr, queryParams, ...queryValidityCheckProms]);
    })
    .then(([queryStr, queryParams]) => db.query(queryStr, queryParams))
    .then(({ rows }) => rows);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
      WHERE article_id = $1;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ msg: "Resource not found", code: 404 });
      return rows[0];
    });
};

exports.updateArticle = (article_id, updates) => {
  return checkExists("articles", "article_id", article_id)
    .then(() => {
      const queryUpdateStrings = [];
      const queryParams = [article_id];
      const queryValidityCheckProms = [];
      const { inc_votes } = updates;
      if (inc_votes !== undefined) {
        queryUpdateStrings.push(` votes = votes + $${queryParams.length + 1}`);
        queryParams.push(inc_votes);
      }
      const validKeys = ["body", "title", "topic"];
      for (key of validKeys) {
        if (updates[key] !== undefined) {
          if (key === "topic") {
            queryValidityCheckProms.push(
              checkExists("topics", "slug", updates.topic)
            );
          }
          queryUpdateStrings.push(` ${key} = $${queryParams.length + 1}`);
          queryParams.push(updates[key]);
        }
      }
      const queryStr =
        queryUpdateStrings.length === 0
          ? `SELECT * FROM articles WHERE article_id = $1`
          : `UPDATE articles SET ` +
            queryUpdateStrings.join(",") +
            ` WHERE article_id = $1 RETURNING *;`;
      return Promise.all([queryStr, queryParams, ...queryValidityCheckProms]);
    })
    .then(([queryStr, queryParams]) => db.query(queryStr, queryParams))
    .then(({ rows }) => rows[0]);
};
