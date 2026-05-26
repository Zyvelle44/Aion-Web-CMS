const { webDB, gsDB } = require("../config/database");

const getShopCategories = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, name, slug, description, icon
      FROM web_shop_categories
      WHERE status = 'active'
      ORDER BY sort_order ASC, id ASC
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load shop categories."
        });
    }
};

const getShopItems = async (req, res) => {
    try {
        const { category } = req.query;

        let sql = `
      SELECT
        i.id,
        i.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        i.item_id,
        i.item_name,
        i.item_description,
        i.item_icon,
        i.item_count,
        i.price_coin,
        i.buy_limit
      FROM web_shop_items i
      INNER JOIN web_shop_categories c ON c.id = i.category_id
      WHERE i.status = 'active'
      AND c.status = 'active'
    `;

        const params = [];

        if (category) {
            sql += ` AND c.slug = ?`;
            params.push(category);
        }

        sql += ` ORDER BY c.sort_order ASC, i.sort_order ASC, i.id ASC`;

        const [rows] = await webDB.query(sql, params);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load shop items."
        });
    }
};

const buyShopItem = async (req, res) => {
    const webConn = await webDB.getConnection();

    try {
        const user = req.user;
        const { shop_item_id, player_id } = req.body;

        if (!shop_item_id || !player_id) {
            return res.status(422).json({
                success: false,
                message: "Item and character are required."
            });
        }

        const [players] = await gsDB.query(
            `
      SELECT id, name, account_name
      FROM players
      WHERE id = ?
      AND account_name = ?
      LIMIT 1
      `,
            [player_id, user.username]
        );

        if (!players.length) {
            return res.status(403).json({
                success: false,
                message: "Invalid character selected."
            });
        }

        const player = players[0];

        const [items] = await webDB.query(
            `
      SELECT id, item_id, item_name, item_count, price_coin, buy_limit
      FROM web_shop_items
      WHERE id = ?
      AND status = 'active'
      LIMIT 1
      `,
            [shop_item_id]
        );

        if (!items.length) {
            return res.status(404).json({
                success: false,
                message: "Shop item not found."
            });
        }

        const item = items[0];

        await webConn.beginTransaction();

        const [users] = await webConn.query(
            `
      SELECT id, username, donate_coin
      FROM web_users
      WHERE id = ?
      FOR UPDATE
      `,
            [user.id]
        );

        if (!users.length) {
            await webConn.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const currentUser = users[0];

        if (Number(currentUser.donate_coin) < Number(item.price_coin)) {
            await webConn.rollback();
            return res.status(400).json({
                success: false,
                message: "Not enough donate coins."
            });
        }

        if (Number(item.buy_limit) > 0) {
            const [[limitRow]] = await webConn.query(
                `
        SELECT COUNT(*) AS total
        FROM web_shop_orders
        WHERE user_id = ?
        AND shop_item_id = ?
        AND status IN ('pending','completed')
        `,
                [user.id, item.id]
            );

            if (Number(limitRow.total) >= Number(item.buy_limit)) {
                await webConn.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Purchase limit reached for this item."
                });
            }
        }

        await webConn.query(
            `
      UPDATE web_users
      SET donate_coin = donate_coin - ?
      WHERE id = ?
      `,
            [item.price_coin, user.id]
        );

        await webConn.query(
            `
            INSERT INTO web_coin_logs
            (
                user_id,
                username,
                type,
                amount,
                balance_before,
                balance_after,
                note
            )
            VALUES (?, ?, 'purchase', ?, ?, ?, ?)
            `,
            [
                user.id,
                user.username,
                item.price_coin,
                currentUser.donate_coin,
                Number(currentUser.donate_coin) - Number(item.price_coin),
                `Purchased ${item.item_name}`
            ]
        );

        const [orderResult] = await webConn.query(
            `
      INSERT INTO web_shop_orders
      (
        user_id,
        username,
        player_id,
        player_name,
        shop_item_id,
        item_id,
        item_name,
        item_count,
        price_coin,
        status,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
      `,
            [
                user.id,
                user.username,
                player.id,
                player.name,
                item.id,
                item.item_id,
                item.item_name,
                item.item_count,
                item.price_coin,
                "Order completed. Item added to delivery queue."
            ]
        );

        const orderId = orderResult.insertId;

        await webConn.query(
            `
      INSERT INTO web_shop_delivery_queue
      (
        order_id,
        user_id,
        username,
        player_id,
        player_name,
        item_id,
        item_name,
        item_count,
        status,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `,
            [
                orderId,
                user.id,
                user.username,
                player.id,
                player.name,
                item.item_id,
                item.item_name,
                item.item_count,
                "Waiting for game delivery worker / mail integration."
            ]
        );

        await webConn.commit();

        return res.json({
            success: true,
            message: "Purchase successful. Item has been added to delivery queue.",
            data: {
                order_id: orderId
            }
        });
    } catch (error) {
        await webConn.rollback();

        console.error("Buy shop item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to buy item.",
            error: error.message
        });
    } finally {
        webConn.release();
    }
};

const getMyShopOrders = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `
      SELECT
        o.id,
        o.player_name,
        o.item_id,
        o.item_name,
        o.item_count,
        o.price_coin,
        o.status,
        o.note,
        o.created_at,
        q.status AS delivery_status,
        q.sent_at
      FROM web_shop_orders o
      LEFT JOIN web_shop_delivery_queue q ON q.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY o.id DESC
      LIMIT 100
      `,
            [req.user.id]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load order history."
        });
    }
};

module.exports = {
    getShopCategories,
    getShopItems,
    buyShopItem,
    getMyShopOrders
};