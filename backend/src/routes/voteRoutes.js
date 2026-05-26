const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getVoteSites,
    claimVoteReward,
    getMyVoteLogs,
    startVoteAttempt
} = require("../controllers/voteController");

const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return next();

    return authMiddleware(req, res, next);
};

router.get("/sites", optionalAuth, getVoteSites);
router.post("/claim", authMiddleware, claimVoteReward);
router.get("/my-logs", authMiddleware, getMyVoteLogs);
router.post("/start", authMiddleware, startVoteAttempt);

module.exports = router;