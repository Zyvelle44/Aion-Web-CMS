const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { uploadImage } = require("../middleware/uploadMiddleware");

const {
    getAdminShopCategories,
    createAdminShopCategory,
    updateAdminShopCategory,
    deleteAdminShopCategory,

    getAdminShopItems,
    createAdminShopItem,
    updateAdminShopItem,
    deleteAdminShopItem,

    getAdminShopOrders,
    getAdminShopQueue,
    uploadShopIcon,

    retryShopQueue,
    refundShopOrder

} = require("../controllers/adminShopController");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/categories", getAdminShopCategories);
router.post("/categories", createAdminShopCategory);
router.put("/categories/:id", updateAdminShopCategory);
router.delete("/categories/:id", deleteAdminShopCategory);

router.get("/items", getAdminShopItems);
router.post("/items", createAdminShopItem);
router.put("/items/:id", updateAdminShopItem);
router.delete("/items/:id", deleteAdminShopItem);

router.get("/orders", getAdminShopOrders);
router.get("/queue", getAdminShopQueue);

router.post("/upload-icon", uploadImage.single("image"), uploadShopIcon);

router.post("/queue/:id/retry", retryShopQueue);
router.post("/orders/:id/refund", refundShopOrder);

module.exports = router;