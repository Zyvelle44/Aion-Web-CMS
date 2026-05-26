const express = require("express");
const router = express.Router();

const { getPlayerDetail } = require("../controllers/playerController");

router.get("/:id", getPlayerDetail);

module.exports = router;