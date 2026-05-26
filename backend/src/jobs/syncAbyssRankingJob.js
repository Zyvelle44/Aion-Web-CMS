const { webDB, gsDB } = require("../config/database");
const { getLevelFromExp } = require("../utils/aionLevel");

const syncAbyssRanking = async () => {
    const webConn = await webDB.getConnection();

    try {
        const [rows] = await gsDB.query(`
        SELECT
            ar.player_id,
            ar.ap,
            ar.rank,
            ar.top_ranking,
            ar.daily_kill,
            ar.weekly_kill,
            ar.all_kill,
            ar.max_rank,
            ar.rank_pos,
            ar.old_rank_pos,
            ar.rank_ap,
            ar.last_kill,
            ar.last_ap,
            ar.last_update,

            p.name,
            p.race,
            p.player_class,
            p.exp,
            p.online,
            p.account_id,
            p.account_name
        FROM abyss_rank ar
        INNER JOIN players p ON p.id = ar.player_id
        WHERE p.deletion_date IS NULL OR p.deletion_date = 0
        ORDER BY ar.ap DESC, ar.all_kill DESC
        LIMIT 100
        `);

        await webConn.beginTransaction();

        await webConn.query(`
      DELETE FROM web_ranking_cache
      WHERE ranking_type = 'abyss'
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
                    "abyss",
                    row.player_id,
                    row.name,
                    row.race,
                    row.player_class,
                    getLevelFromExp(row.exp),
                    row.ap || 0,
                    row.rank_pos || i + 1,
                    JSON.stringify({
                        exp: row.exp,
                        online: row.online,
                        account_id: row.account_id,
                        account_name: row.account_name,
                        rank: row.rank,
                        top_ranking: row.top_ranking,
                        daily_kill: row.daily_kill,
                        weekly_kill: row.weekly_kill,
                        all_kill: row.all_kill,
                        max_rank: row.max_rank,
                        old_rank_pos: row.old_rank_pos,
                        rank_ap: row.rank_ap,
                        last_kill: row.last_kill,
                        last_ap: row.last_ap,
                        last_update: row.last_update
                    })
                ]
            );
        }

        await webConn.commit();

        console.log(`[RANKING] Abyss ranking synced: ${rows.length} players`);
    } catch (error) {
        await webConn.rollback();
        console.error("[RANKING] Failed to sync abyss ranking:", error.message);
    } finally {
        webConn.release();
    }
};

const startAbyssRankingSync = () => {
    syncAbyssRanking();

    setInterval(() => {
        syncAbyssRanking();
    }, 5 * 60 * 1000);
};

module.exports = {
    syncAbyssRanking,
    startAbyssRankingSync
};