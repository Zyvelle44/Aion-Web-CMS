const express = require("express");
const router = express.Router();

const { checkDatabase } = require("../controllers/databaseController");

router.get("/check", checkDatabase);

module.exports = router;