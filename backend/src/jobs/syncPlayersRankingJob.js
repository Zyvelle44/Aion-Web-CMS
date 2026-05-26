const { webDB, gsDB } = require("../config/database");
const { getLevelFromExp } = require("../utils/aionLevel");

const syncPlayersRanking = async () => {
    const webConn = await webDB.getConnection();

    try {
        const [rows] = await gsDB.query(`
      SELECT
        id,
        name,
        race,
        player_class,
        exp,
        online,
        account_id,
        account_name,
        creation_date,
        last_online
      FROM players
      WHERE deletion_date IS NULL OR deletion_date = 0
      ORDER BY exp DESC
      LIMIT 100
    `);

        await webConn.beginTransaction();

        await webConn.query(`
      DELETE FROM web_ranking_cache
      WHERE ranking_type = 'players'
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
                    "players",
                    row.id,
                    row.name,
                    row.race,
                    row.player_class,
                    getLevelFromExp(row.exp),
                    row.exp || 0,
                    i + 1,
                    JSON.stringify({
                        exp: row.exp,
                        online: row.online,
                        account_id: row.account_id,
                        account_name: row.account_name,
                        creation_date: row.creation_date,
                        last_online: row.last_online
                    })
                ]
            );
        }

        await webConn.commit();

        console.log(`[RANKING] Players ranking synced: ${rows.length} players`);
    } catch (error) {
        await webConn.rollback();
        console.error("[RANKING] Failed to sync players ranking:", error.message);
    } finally {
        webConn.release();
    }
};

const startPlayersRankingSync = () => {
    syncPlayersRanking();

    setInterval(() => {
        syncPlayersRanking();
    }, 5 * 60 * 1000);
};

module.exports = {
    syncPlayersRanking,
    startPlayersRankingSync
};