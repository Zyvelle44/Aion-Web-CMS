const { webDB, gsDB } = require("../config/database");

const syncOnlinePlayers = async () => {
    try {
        /*
          Umumnya Aion server menyimpan status online di table players:
          online = 1
    
          Kalau kolom kamu beda, nanti sesuaikan query ini.
        */
        const [[result]] = await gsDB.query(`
        SELECT COUNT(*) AS total
        FROM players
        WHERE online = 1
        `);

        const onlinePlayers = Number(result.total || 0);

        await webDB.query(
            `
      UPDATE web_server_status
      SET online_players = ?
      ORDER BY id DESC
      LIMIT 1
      `,
            [onlinePlayers]
        );

        console.log(`[SYNC] Online players updated: ${onlinePlayers}`);
    } catch (error) {
        console.error("[SYNC] Failed to sync online players:", error.message);
    }
};

const startOnlinePlayersSync = () => {
    syncOnlinePlayers();

    setInterval(() => {
        syncOnlinePlayers();
    }, 30 * 1000);
};

module.exports = {
    syncOnlinePlayers,
    startOnlinePlayersSync
};