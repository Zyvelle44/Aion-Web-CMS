const { webDB, gsDB } = require("../config/database");
const { getLevelFromExp } = require("../utils/aionLevel");

const syncPvpRanking = async () => {
    const webConn = await webDB.getConnection();

    try {
        const [rows] = await gsDB.query(`
      SELECT
        ar.player_id,
        ar.daily_kill,
        ar.weekly_kill,
        ar.all_kill,
        ar.ap,
        ar.rank,
        ar.rank_pos,

        p.name,
        p.race,
        p.player_class,
        p.exp,
        p.online,
        p.account_id,
        p.account_name
      FROM abyss_rank ar
      INNER JOIN players p ON p.id = ar.player_id
      WHERE (p.deletion_date IS NULL OR p.deletion_date = 0)
      ORDER BY ar.all_kill DESC, ar.ap DESC
      LIMIT 100
    `);

        await webConn.beginTransaction();

        await webConn.query(`SELECT GET_LOCK('sync_pvp_ranking', 10)`);

        await webConn.query(`
        DELETE FROM web_ranking_cache
        WHERE ranking_type = 'pvp'
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
                    "pvp",
                    row.player_id,
                    row.name,
                    row.race,
                    row.player_class,
                    getLevelFromExp(row.exp),
                    row.all_kill || 0,
                    i + 1,
                    JSON.stringify({
                        exp: row.exp,
                        online: row.online,
                        account_id: row.account_id,
                        account_name: row.account_name,
                        ap: row.ap,
                        rank: row.rank,
                        rank_pos: row.rank_pos,
                        daily_kill: row.daily_kill,
                        weekly_kill: row.weekly_kill,
                        all_kill: row.all_kill
                    })
                ]
            );
        }

        await webConn.query(`SELECT RELEASE_LOCK('sync_pvp_ranking')`);

        await webConn.commit();

        console.log(`[RANKING] PvP ranking synced: ${rows.length} players`);
    } catch (error) {
        try {
            await webConn.query(`SELECT RELEASE_LOCK('sync_pvp_ranking')`);
        } catch { }

        await webConn.rollback();
        console.error("[RANKING] Failed to sync PvP ranking:", error.message);
    } finally {
        webConn.release();
    }
};

const startPvpRankingSync = () => {
    syncPvpRanking();

    setInterval(() => {
        syncPvpRanking();
    }, 5 * 60 * 1000);
};

module.exports = {
    syncPvpRanking,
    startPvpRankingSync
};