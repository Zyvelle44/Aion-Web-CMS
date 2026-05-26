const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");

const {
    getAdminVoteSites,
    createAdminVoteSite,
    updateAdminVoteSite,
    deleteAdminVoteSite,
    getAdminVoteLogs
} = require("../controllers/adminVoteController");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/sites", getAdminVoteSites);
router.post("/sites", createAdminVoteSite);
router.put("/sites/:id", updateAdminVoteSite);
router.delete("/sites/:id", deleteAdminVoteSite);

router.get("/logs", getAdminVoteLogs);

router.post("/upload-icon", uploadImage.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(422).json({
            success: false,
            message: "Icon file is required."
        });
    }

    res.json({
        success: true,
        message: "Vote icon uploaded successfully.",
        url: `/uploads/settings/${req.file.filename}`
    });
});

module.exports = router;