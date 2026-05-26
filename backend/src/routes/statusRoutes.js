const express = require("express");
const router = express.Router();

const { getServerStatus } = require("../controllers/statusController");

router.get("/", getServerStatus);

module.exports = router;