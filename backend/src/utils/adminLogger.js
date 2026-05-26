const { webDB } = require("../config/database");

const logAdminAction = async (req, payload = {}) => {
    try {
        const admin = req.user || {};

        await webDB.query(
            `
      INSERT INTO web_admin_logs
      (
        admin_id,
        admin_username,
        action,
        target_type,
        target_id,
        description,
        ip_address,
        user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                admin.id || null,
                admin.username || null,
                payload.action || "unknown_action",
                payload.target_type || null,
                payload.target_id || null,
                payload.description || null,
                req.ip || null,
                req.headers["user-agent"] || null
            ]
        );
    } catch (error) {
        console.error("[ADMIN LOG ERROR]", error.message);
    }
};

module.exports = {
    logAdminAction
};