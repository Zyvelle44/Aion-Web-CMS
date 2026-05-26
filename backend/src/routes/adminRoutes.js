const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAdminDashboard,

  getAdminNews,
  getAdminNewsDetail,
  createAdminNews,
  updateAdminNews,
  deleteAdminNews,

  getAdminDownloads,
  getAdminDownloadDetail,
  createAdminDownload,
  updateAdminDownload,
  deleteAdminDownload,

  getAdminServerStatus,
  updateAdminServerStatus,

  getAdminUsers,
  updateAdminUser,
  resetAdminUserPassword,

  getAdminLogs,

  updateUserCoin,
  getUserCoinLogs,
  getRecentCoinLogs

} = require("../controllers/adminController");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getAdminDashboard);

router.get("/news", getAdminNews);
router.get("/news/:id", getAdminNewsDetail);
router.post("/news", createAdminNews);
router.put("/news/:id", updateAdminNews);
router.delete("/news/:id", deleteAdminNews);

router.get("/downloads", getAdminDownloads);
router.get("/downloads/:id", getAdminDownloadDetail);
router.post("/downloads", createAdminDownload);
router.put("/downloads/:id", updateAdminDownload);
router.delete("/downloads/:id", deleteAdminDownload);

router.get("/status", getAdminServerStatus);
router.put("/status", updateAdminServerStatus);

router.get("/users", getAdminUsers);
router.put("/users/:id", updateAdminUser);
router.post("/users/:id/reset-password", resetAdminUserPassword);

router.get("/logs", getAdminLogs);

router.post("/users/:id/coins", updateUserCoin);
router.get("/users/:id/coin-logs", getUserCoinLogs);

router.get("/coin-logs", getRecentCoinLogs);

module.exports = router;