const { webDB, gsDB } = require("../config/database");

const processShopDeliveryQueue = async () => {
    const webConn = await webDB.getConnection();
    const gsConn = await gsDB.getConnection();

    try {
        await webConn.beginTransaction();
        await gsConn.beginTransaction();

        const [rows] = await webConn.query(`
      SELECT
        id,
        order_id,
        user_id,
        username,
        player_id,
        player_name,
        item_id,
        item_name,
        item_count
      FROM web_shop_delivery_queue
      WHERE status = 'pending'
      ORDER BY id ASC
      LIMIT 20
      FOR UPDATE
    `);

        if (!rows.length) {
            await webConn.commit();
            await gsConn.commit();
            return;
        }

        for (const row of rows) {
            try {
                await gsConn.query(
                    `
          INSERT INTO web_reward
          (
            item_owner,
            item_id,
            item_count
          )
          VALUES (?, ?, ?)
          `,
                    [
                        row.player_id,
                        row.item_id,
                        row.item_count
                    ]
                );

                await webConn.query(
                    `
          UPDATE web_shop_delivery_queue
          SET status = 'sent',
              sent_at = NOW(),
              note = ?
          WHERE id = ?
          `,
                    [
                        "Reward inserted into aion_gs.web_reward.",
                        row.id
                    ]
                );

                await webConn.query(
                    `
          UPDATE web_shop_orders
          SET status = 'completed',
              note = ?
          WHERE id = ?
          `,
                    [
                        "Item delivered to game web_reward table.",
                        row.order_id
                    ]
                );
            } catch (itemError) {
                await webConn.query(
                    `
          UPDATE web_shop_delivery_queue
          SET status = 'failed',
              note = ?
          WHERE id = ?
          `,
                    [
                        itemError.message,
                        row.id
                    ]
                );

                await webConn.query(
                    `
          UPDATE web_shop_orders
          SET status = 'failed',
              note = ?
          WHERE id = ?
          `,
                    [
                        itemError.message,
                        row.order_id
                    ]
                );
            }
        }

        await gsConn.commit();
        await webConn.commit();

        console.log(`[SHOP] Delivered ${rows.length} reward queue item(s).`);
    } catch (error) {
        await gsConn.rollback();
        await webConn.rollback();

        console.error("[SHOP] Delivery queue failed:", error.message);
    } finally {
        gsConn.release();
        webConn.release();
    }
};

const startShopDeliveryWorker = () => {
    processShopDeliveryQueue();

    setInterval(() => {
        processShopDeliveryQueue();
    }, 30 * 1000);
};

module.exports = {
    processShopDeliveryQueue,
    startShopDeliveryWorker
};