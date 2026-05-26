const { webDB } = require("../config/database");

const getDownloads = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, title, type, file_url, file_size, version, description
      FROM web_downloads
      WHERE status = 'active'
      ORDER BY sort_order ASC, id DESC
    `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDownloads
};