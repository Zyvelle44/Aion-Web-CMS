const express = require("express");
const router = express.Router();

const {
  getNews,
  getNewsDetail
} = require("../controllers/newsController");

router.get("/", getNews);
router.get("/:slug", getNewsDetail);

module.exports = router;