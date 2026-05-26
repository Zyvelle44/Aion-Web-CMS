const { webDB, gsDB } = require("../config/database");

const syncLegionRanking = async () => {
    const webConn = await webDB.getConnection();

    try {
        const [rows] = await gsDB.query(`
      SELECT
        l.id,
        l.name,
        l.level,
        l.contribution_points,
        l.rank_cp,
        l.rank_pos,
        l.old_rank_pos,
        COUNT(lm.player_id) AS total_members
      FROM legions l
      LEFT JOIN legion_members lm ON lm.legion_id = l.id
      WHERE l.disband_time IS NULL OR l.disband_time = 0
      GROUP BY
        l.id,
        l.name,
        l.level,
        l.contribution_points,
        l.rank_cp,
        l.rank_pos,
        l.old_rank_pos
      ORDER BY l.contribution_points DESC, l.rank_cp DESC
      LIMIT 100
    `);

        await webConn.beginTransaction();
        await webConn.query(`SELECT GET_LOCK('sync_legion_ranking', 10)`);

        await webConn.query(`
      DELETE FROM web_ranking_cache
      WHERE ranking_type = 'legions'
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
          legion_name,
          level,
          points,
          position,
          extra_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    "legions",
                    row.id,
                    row.name,
                    null,
                    null,
                    row.name,
                    row.level || 1,
                    row.contribution_points || row.rank_cp || 0,
                    row.rank_pos || i + 1,
                    JSON.stringify({
                        contribution_points: row.contribution_points,
                        rank_cp: row.rank_cp,
                        rank_pos: row.rank_pos,
                        old_rank_pos: row.old_rank_pos,
                        total_members: row.total_members
                    })
                ]
            );
        }

        await webConn.query(`SELECT RELEASE_LOCK('sync_legion_ranking')`);
        await webConn.commit();

        console.log(`[RANKING] Legion ranking synced: ${rows.length} legions`);
    } catch (error) {
        try {
            await webConn.query(`SELECT RELEASE_LOCK('sync_legion_ranking')`);
        } catch { }

        await webConn.rollback();
        console.error("[RANKING] Failed to sync Legion ranking:", error.message);
    } finally {
        webConn.release();
    }
};

const startLegionRankingSync = () => {
    syncLegionRanking();

    setInterval(() => {
        syncLegionRanking();
    }, 5 * 60 * 1000);
};

module.exports = {
    syncLegionRanking,
    startLegionRankingSync
};