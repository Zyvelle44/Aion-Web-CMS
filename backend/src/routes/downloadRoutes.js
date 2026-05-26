const express = require("express");
const router = express.Router();

const { getDownloads } = require("../controllers/downloadController");

router.get("/", getDownloads);

module.exports = router;