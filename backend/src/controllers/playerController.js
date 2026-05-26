const { gsDB } = require("../config/database");
const { getLevelFromExp } = require("../utils/aionLevel");

const KINAH_ITEM_ID = 182400001;

const getPlayerDetail = async (req, res) => {
    try {
        const playerId = req.params.id;

        const [players] = await gsDB.query(
            `
      SELECT
        id, name, account_name, exp, gender, race, player_class,
        creation_date, last_online, online, title_id
      FROM players
      WHERE id = ?
      LIMIT 1
      `,
            [playerId]
        );

        if (!players.length) {
            return res.status(404).json({
                success: false,
                message: "Player not found."
            });
        }

        const player = players[0];

        const [abyssRows] = await gsDB.query(
            `
      SELECT ap, rank, rank_pos, daily_kill, weekly_kill, all_kill, max_rank, last_update
      FROM abyss_rank
      WHERE player_id = ?
      LIMIT 1
      `,
            [playerId]
        );

        const [legionRows] = await gsDB.query(
            `
      SELECT
        l.id,
        l.name,
        l.level,
        l.contribution_points,
        lm.rank AS member_rank,
        lm.nickname
      FROM legion_members lm
      INNER JOIN legions l ON l.id = lm.legion_id
      WHERE lm.player_id = ?
      LIMIT 1
      `,
            [playerId]
        );

        const [[kinahRow]] = await gsDB.query(
            `
      SELECT COALESCE(SUM(item_count), 0) AS kinah
      FROM inventory
      WHERE item_owner = ?
      AND item_id = ?
      `,
            [playerId, KINAH_ITEM_ID]
        );

        return res.json({
            success: true,
            data: {
                player: {
                    ...player,
                    level: getLevelFromExp(player.exp)
                },
                abyss: abyssRows[0] || null,
                legion: legionRows[0] || null,
                kinah: kinahRow.kinah || 0
            }
        });
    } catch (error) {
        console.error("Player detail error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load player profile.",
            error: error.message
        });
    }
};

module.exports = {
    getPlayerDetail
};