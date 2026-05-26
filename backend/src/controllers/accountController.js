const { webDB, lsDB, gsDB } = require("../config/database");

const getDashboard = async (req, res) => {
    try {
        const username = req.user.username;

        const [webUser] = await webDB.query(
            `
      SELECT id, username, email, role, avatar, status, last_login, created_at, donate_coin
      FROM web_users
      WHERE id = ?
      LIMIT 1
      `,
            [req.user.id]
        );

        const [gameAccount] = await lsDB.query(
            `
      SELECT id, name, activated, access_level, membership, old_membership
      FROM account_data
      WHERE name = ?
      LIMIT 1
      `,
            [username]
        );

        const accountId = gameAccount.length ? gameAccount[0].id : null;

        let characters = [];

        if (accountId) {
            const [chars] = await gsDB.query(
                `
        SELECT 
          id,
          name,
          race,
          player_class,
          gender,
          exp,
          title_id,
          creation_date,
          last_online
        FROM players
        WHERE account_id = ?
        ORDER BY id DESC, name ASC
        `,
                [accountId]
            );

            characters = chars;
        }

        return res.json({
            success: true,
            data: {
                profile: webUser[0],
                game_account: gameAccount[0] || null,
                characters
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load account dashboard",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};