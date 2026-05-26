const { webDB } = require("../config/database");
const { logAdminAction } = require("../utils/adminLogger");

const slugify = (text) => {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const getAdminShopCategories = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_shop_categories
      ORDER BY sort_order ASC, id DESC
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load shop categories."
        });
    }
};

const createAdminShopCategory = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            icon,
            sort_order,
            status
        } = req.body;

        if (!name) {
            return res.status(422).json({
                success: false,
                message: "Category name is required."
            });
        }

        const finalSlug = slugify(slug || name);

        await webDB.query(
            `
      INSERT INTO web_shop_categories
      (name, slug, description, icon, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            [
                name,
                finalSlug,
                description || null,
                icon || null,
                Number(sort_order || 0),
                status || "active"
            ]
        );

        await logAdminAction(req, {
            action: "create_shop_category",
            target_type: "shop_category",
            target_id: finalSlug,
            description: `Created shop category: ${name}`
        });

        res.status(201).json({
            success: true,
            message: "Shop category created successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create shop category.",
            error: error.message
        });
    }
};

const updateAdminShopCategory = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            icon,
            sort_order,
            status
        } = req.body;

        const finalSlug = slugify(slug || name);

        await webDB.query(
            `
      UPDATE web_shop_categories
      SET name = ?,
          slug = ?,
          description = ?,
          icon = ?,
          sort_order = ?,
          status = ?
      WHERE id = ?
      `,
            [
                name,
                finalSlug,
                description || null,
                icon || null,
                Number(sort_order || 0),
                status || "active",
                req.params.id
            ]
        );

        await logAdminAction(req, {
            action: "update_shop_category",
            target_type: "shop_category",
            target_id: req.params.id,
            description: `Updated shop category: ${name}`
        });

        res.json({
            success: true,
            message: "Shop category updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update shop category.",
            error: error.message
        });
    }
};

const deleteAdminShopCategory = async (req, res) => {
    try {
        const [[countRow]] = await webDB.query(
            `
      SELECT COUNT(*) AS total
      FROM web_shop_items
      WHERE category_id = ?
      `,
            [req.params.id]
        );

        if (Number(countRow.total) > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with existing items."
            });
        }

        await webDB.query(
            `DELETE FROM web_shop_categories WHERE id = ?`,
            [req.params.id]
        );

        await logAdminAction(req, {
            action: "delete_shop_category",
            target_type: "shop_category",
            target_id: req.params.id,
            description: "Deleted shop category."
        });

        res.json({
            success: true,
            message: "Shop category deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete shop category."
        });
    }
};

const getAdminShopItems = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT
        i.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM web_shop_items i
      LEFT JOIN web_shop_categories c ON c.id = i.category_id
      ORDER BY c.sort_order ASC, i.sort_order ASC, i.id DESC
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load shop items."
        });
    }
};

const createAdminShopItem = async (req, res) => {
    try {
        const {
            category_id,
            item_id,
            item_name,
            item_description,
            item_icon,
            item_count,
            price_coin,
            buy_limit,
            status,
            sort_order
        } = req.body;

        if (!category_id || !item_id || !item_name) {
            return res.status(422).json({
                success: false,
                message: "Category, item ID, and item name are required."
            });
        }

        await webDB.query(
            `
      INSERT INTO web_shop_items
      (
        category_id,
        item_id,
        item_name,
        item_description,
        item_icon,
        item_count,
        price_coin,
        buy_limit,
        status,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                category_id,
                item_id,
                item_name,
                item_description || null,
                item_icon || null,
                Number(item_count || 1),
                Number(price_coin || 0),
                Number(buy_limit || 0),
                status || "active",
                Number(sort_order || 0)
            ]
        );

        await logAdminAction(req, {
            action: "create_shop_item",
            target_type: "shop_item",
            target_id: item_id,
            description: `Created shop item: ${item_name}`
        });

        res.status(201).json({
            success: true,
            message: "Shop item created successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create shop item.",
            error: error.message
        });
    }
};

const updateAdminShopItem = async (req, res) => {
    try {
        const {
            category_id,
            item_id,
            item_name,
            item_description,
            item_icon,
            item_count,
            price_coin,
            buy_limit,
            status,
            sort_order
        } = req.body;

        await webDB.query(
            `
      UPDATE web_shop_items
      SET category_id = ?,
          item_id = ?,
          item_name = ?,
          item_description = ?,
          item_icon = ?,
          item_count = ?,
          price_coin = ?,
          buy_limit = ?,
          status = ?,
          sort_order = ?
      WHERE id = ?
      `,
            [
                category_id,
                item_id,
                item_name,
                item_description || null,
                item_icon || null,
                Number(item_count || 1),
                Number(price_coin || 0),
                Number(buy_limit || 0),
                status || "active",
                Number(sort_order || 0),
                req.params.id
            ]
        );

        await logAdminAction(req, {
            action: "update_shop_item",
            target_type: "shop_item",
            target_id: req.params.id,
            description: `Updated shop item: ${item_name}`
        });

        res.json({
            success: true,
            message: "Shop item updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update shop item.",
            error: error.message
        });
    }
};

const deleteAdminShopItem = async (req, res) => {
    try {
        await webDB.query(
            `DELETE FROM web_shop_items WHERE id = ?`,
            [req.params.id]
        );

        await logAdminAction(req, {
            action: "delete_shop_item",
            target_type: "shop_item",
            target_id: req.params.id,
            description: "Deleted shop item."
        });

        res.json({
            success: true,
            message: "Shop item deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete shop item."
        });
    }
};

const getAdminShopOrders = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_shop_orders
      ORDER BY id DESC
      LIMIT 100
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load shop orders."
        });
    }
};

const getAdminShopQueue = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_shop_delivery_queue
      ORDER BY id DESC
      LIMIT 100
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load delivery queue."
        });
    }
};

const uploadShopIcon = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(422).json({
                success: false,
                message: "Icon file is required."
            });
        }

        const fileUrl = `/uploads/settings/${req.file.filename}`;

        res.json({
            success: true,
            message: "Shop icon uploaded successfully.",
            url: fileUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to upload shop icon.",
            error: error.message
        });
    }
};

const retryShopQueue = async (req, res) => {
    try {
        const queueId = req.params.id;

        await webDB.query(
            `
      UPDATE web_shop_delivery_queue
      SET status = 'pending',
          note = 'Retry requested by admin.',
          sent_at = NULL
      WHERE id = ?
      AND status IN ('failed', 'pending')
      `,
            [queueId]
        );

        await logAdminAction(req, {
            action: "retry_shop_queue",
            target_type: "shop_delivery_queue",
            target_id: queueId,
            description: "Admin retried shop delivery queue."
        });

        res.json({
            success: true,
            message: "Delivery queue retry requested."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retry delivery queue.",
            error: error.message
        });
    }
};

const refundShopOrder = async (req, res) => {
    const conn = await webDB.getConnection();

    try {
        const orderId = req.params.id;

        await conn.beginTransaction();

        const [orders] = await conn.query(
            `
      SELECT *
      FROM web_shop_orders
      WHERE id = ?
      FOR UPDATE
      `,
            [orderId]
        );

        if (!orders.length) {
            await conn.rollback();
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const order = orders[0];

        if (order.status === "refunded") {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: "Order already refunded."
            });
        }

        const [users] = await conn.query(
            `
      SELECT id, username, donate_coin
      FROM web_users
      WHERE id = ?
      FOR UPDATE
      `,
            [order.user_id]
        );

        if (!users.length) {
            await conn.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = users[0];
        const before = Number(user.donate_coin || 0);
        const refundAmount = Number(order.price_coin || 0);
        const after = before + refundAmount;

        await conn.query(
            `
      UPDATE web_users
      SET donate_coin = ?
      WHERE id = ?
      `,
            [after, user.id]
        );

        await conn.query(
            `
      UPDATE web_shop_orders
      SET status = 'refunded',
          note = ?
      WHERE id = ?
      `,
            ["Order refunded by admin.", orderId]
        );

        await conn.query(
            `
      UPDATE web_shop_delivery_queue
      SET status = 'failed',
          note = ?
      WHERE order_id = ?
      `,
            ["Order refunded by admin.", orderId]
        );

        await conn.query(
            `
      INSERT INTO web_coin_logs
      (
        user_id,
        username,
        admin_id,
        admin_username,
        type,
        amount,
        balance_before,
        balance_after,
        note
      )
      VALUES (?, ?, ?, ?, 'refund', ?, ?, ?, ?)
      `,
            [
                user.id,
                user.username,
                req.user?.id || null,
                req.user?.username || null,
                refundAmount,
                before,
                after,
                `Refund for order #${orderId}`
            ]
        );

        await logAdminAction(req, {
            action: "refund_shop_order",
            target_type: "shop_order",
            target_id: orderId,
            description: `Refunded ${refundAmount} coins to ${user.username}`
        });

        await conn.commit();

        res.json({
            success: true,
            message: "Order refunded successfully."
        });
    } catch (error) {
        await conn.rollback();

        res.status(500).json({
            success: false,
            message: "Failed to refund order.",
            error: error.message
        });
    } finally {
        conn.release();
    }
};

module.exports = {
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
};