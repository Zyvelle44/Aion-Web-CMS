const { webDB } = require("../config/database");

const allowedTypes = ["players", "legions", "abyss", "kinah", "pvp"];

const getRanking = async (req, res) => {
    try {
        const type = req.query.type || "players";

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ranking type"
            });
        }

        const [rows] = await webDB.query(
        `
        SELECT 
            position,
            source_id,
            name,
            race,
            player_class,
            legion_name,
            level,
            points,
            extra_data,
            updated_at
        FROM web_ranking_cache
        WHERE ranking_type = ?
        ORDER BY position ASC
        LIMIT 100
        `,
        [type]
        );

        res.json({
            success: true,
            type,
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRanking
};