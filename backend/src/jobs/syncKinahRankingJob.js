const { webDB, gsDB } = require("../config/database");
const { getLevelFromExp } = require("../utils/aionLevel");

const KINAH_ITEM_ID = 182400001;

const syncKinahRanking = async () => {
    const webConn = await webDB.getConnection();

    try {
        const [rows] = await gsDB.query(
            `
      SELECT
        p.id,
        p.name,
        p.race,
        p.player_class,
        p.exp,
        p.online,
        p.account_id,
        p.account_name,
        SUM(i.item_count) AS kinah
      FROM inventory i
      INNER JOIN players p ON p.id = i.item_owner
      WHERE i.item_id = ?
        AND (p.deletion_date IS NULL OR p.deletion_date = 0)
      GROUP BY p.id, p.name, p.race, p.player_class, p.exp, p.online, p.account_id, p.account_name
      ORDER BY kinah DESC
      LIMIT 100
      `,
            [KINAH_ITEM_ID]
        );

        await webConn.beginTransaction();

        await webConn.query(`SELECT GET_LOCK('sync_kinah_ranking', 10)`);

        await webConn.query(`
      DELETE FROM web_ranking_cache
      WHERE ranking_type = 'kinah'
    `);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            await webConn.query(
                `
        INSERT INTO web_ranking_cache
        (
          ranking_type,
          source_id,
          name,
          race,
          player_class,
          level,
          points,
          position,
          extra_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    "kinah",
                    row.id,
                    row.name,
                    row.race,
                    row.player_class,
                    getLevelFromExp(row.exp),
                    row.kinah || 0,
                    i + 1,
                    JSON.stringify({
                        kinah: row.kinah,
                        exp: row.exp,
                        online: row.online,
                        account_id: row.account_id,
                        account_name: row.account_name
                    })
                ]
            );
        }

        await webConn.query(`SELECT RELEASE_LOCK('sync_kinah_ranking')`);
        await webConn.commit();

        console.log(`[RANKING] Kinah ranking synced: ${rows.length} players`);
    } catch (error) {
        try {
            await webConn.query(`SELECT RELEASE_LOCK('sync_kinah_ranking')`);
        } catch { }

        await webConn.rollback();

        console.error("[RANKING] Failed to sync Kinah ranking:", error.message);
    } finally {
        webConn.release();
    }
};

const startKinahRankingSync = () => {
    syncKinahRanking();

    setInterval(() => {
        syncKinahRanking();
    }, 5 * 60 * 1000);
};

module.exports = {
    syncKinahRanking,
    startKinahRankingSync
};