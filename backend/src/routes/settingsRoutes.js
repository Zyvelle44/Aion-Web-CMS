const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { uploadImage } = require("../middleware/uploadMiddleware");

const {
    getPublicSettings,
    getAdminSettings,
    updateAdminSettings,
    uploadSettingImage,
    deleteSettingImage,
    exportTheme,
    importTheme,
    saveThemePreset,
    getThemePresets,
    applyThemePreset,
    deleteThemePreset,
    exportAllSettings,
    importAllSettings
} = require("../controllers/settingsController");

router.get("/", getPublicSettings);

router.get("/admin/all", authMiddleware, adminMiddleware, getAdminSettings);
router.put("/admin/all", authMiddleware, adminMiddleware, updateAdminSettings);

router.post(
    "/admin/upload-image",
    authMiddleware,
    adminMiddleware,
    uploadImage.single("image"),
    uploadSettingImage
);

router.delete(
    "/admin/delete-image",
    authMiddleware,
    adminMiddleware,
    deleteSettingImage
);

router.get("/admin/theme/export", authMiddleware, adminMiddleware, exportTheme);
router.post("/admin/theme/import", authMiddleware, adminMiddleware, importTheme);

router.get("/admin/theme/presets", authMiddleware, adminMiddleware, getThemePresets);
router.post("/admin/theme/presets", authMiddleware, adminMiddleware, saveThemePreset);
router.post("/admin/theme/presets/:id/apply", authMiddleware, adminMiddleware, applyThemePreset);
router.delete("/admin/theme/presets/:id", authMiddleware, adminMiddleware, deleteThemePreset);

router.get(
    "/admin/backup/export",
    authMiddleware,
    adminMiddleware,
    exportAllSettings
);

router.post(
    "/admin/backup/import",
    authMiddleware,
    adminMiddleware,
    importAllSettings
);

module.exports = router;