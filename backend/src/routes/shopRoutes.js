const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getShopCategories,
    getShopItems,
    buyShopItem,
    getMyShopOrders
} = require("../controllers/shopController");

router.get("/categories", getShopCategories);
router.get("/items", getShopItems);

router.post("/buy", authMiddleware, buyShopItem);

router.get("/my-orders", authMiddleware, getMyShopOrders);

module.exports = router;