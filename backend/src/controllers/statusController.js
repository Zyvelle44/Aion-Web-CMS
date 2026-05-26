const { webDB } = require("../config/database");

const getServerStatus = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_server_status
      ORDER BY id DESC
      LIMIT 1
    `);

        res.json({
            success: true,
            data: rows[0] || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getServerStatus
};