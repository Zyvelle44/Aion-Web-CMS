const { webDB } = require("../config/database");

const getNews = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, title, slug, category, excerpt, image, views, published_at
      FROM web_news
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 10
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNewsDetail = async (req, res) => {
    try {
        const { slug } = req.params;

        const [rows] = await webDB.query(
            `
      SELECT *
      FROM web_news
      WHERE slug = ? AND status = 'published'
      LIMIT 1
      `,
            [slug]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        await webDB.query(
            `UPDATE web_news SET views = views + 1 WHERE id = ?`,
            [rows[0].id]
        );

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNews,
    getNewsDetail
};