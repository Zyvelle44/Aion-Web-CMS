const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/accountController");

router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;