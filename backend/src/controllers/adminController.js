const { webDB, lsDB, gsDB } = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { logAdminAction } = require("../utils/adminLogger");

const aionPasswordHash = (password) => {
    return crypto.createHash("sha1").update(password).digest("base64");
};

const getAdminDashboard = async (req, res) => {
    try {
        const [[webUsers]] = await webDB.query(`
      SELECT COUNT(*) AS total FROM web_users
    `);

        const [[news]] = await webDB.query(`
      SELECT COUNT(*) AS total FROM web_news
    `);

        const [[downloads]] = await webDB.query(`
      SELECT COUNT(*) AS total FROM web_downloads
    `);

        const [[gameAccounts]] = await lsDB.query(`
      SELECT COUNT(*) AS total FROM account_data
    `);

        const [[characters]] = await gsDB.query(`
      SELECT COUNT(*) AS total FROM players
    `);

        const [[serverStatus]] = await webDB.query(`
      SELECT *
      FROM web_server_status
      ORDER BY id DESC
      LIMIT 1
    `);

        return res.json({
            success: true,
            data: {
                web_users: webUsers.total,
                news: news.total,
                downloads: downloads.total,
                game_accounts: gameAccounts.total,
                characters: characters.total,
                server_status: serverStatus || null
            }
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard.",
            error: error.message
        });
    }
};

const slugify = (text) => {
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const getAdminNews = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, title, slug, category, excerpt, image, status, views, published_at, created_at
      FROM web_news
      ORDER BY created_at DESC
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load news." });
    }
};

const getAdminNewsDetail = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `SELECT * FROM web_news WHERE id = ? LIMIT 1`,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "News not found." });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load news detail." });
    }
};

const createAdminNews = async (req, res) => {
    try {
        const { title, category, excerpt, content, image, status } = req.body;

        if (!title || !content) {
            return res.status(422).json({
                success: false,
                message: "Title and content are required."
            });
        }

        let slug = slugify(title);
        const [exists] = await webDB.query(
            `SELECT id FROM web_news WHERE slug = ? LIMIT 1`,
            [slug]
        );

        if (exists.length) {
            slug = `${slug}-${Date.now()}`;
        }

        await webDB.query(
            `
      INSERT INTO web_news
      (title, slug, category, excerpt, content, image, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
            [
                title,
                slug,
                category || "news",
                excerpt || null,
                content,
                image || null,
                status || "published"
            ]
        );

        res.status(201).json({
            success: true,
            message: "News created successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create news.",
            error: error.message
        });
    }
};

const updateAdminNews = async (req, res) => {
    try {
        const { title, category, excerpt, content, image, status } = req.body;

        if (!title || !content) {
            return res.status(422).json({
                success: false,
                message: "Title and content are required."
            });
        }

        await webDB.query(
            `
      UPDATE web_news
      SET title = ?, category = ?, excerpt = ?, content = ?, image = ?, status = ?
      WHERE id = ?
      `,
            [
                title,
                category || "news",
                excerpt || null,
                content,
                image || null,
                status || "published",
                req.params.id
            ]
        );

        res.json({
            success: true,
            message: "News updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update news.",
            error: error.message
        });
    }
};

const deleteAdminNews = async (req, res) => {
    try {
        await webDB.query(`DELETE FROM web_news WHERE id = ?`, [req.params.id]);

        res.json({
            success: true,
            message: "News deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete news."
        });
    }
};

const getAdminDownloads = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_downloads
      ORDER BY sort_order ASC, id DESC
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load downloads." });
    }
};

const getAdminDownloadDetail = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `SELECT * FROM web_downloads WHERE id = ? LIMIT 1`,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "Download not found." });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load download detail." });
    }
};

const createAdminDownload = async (req, res) => {
    try {
        const { title, type, file_url, file_size, version, description, sort_order, status } = req.body;

        if (!title || !file_url) {
            return res.status(422).json({
                success: false,
                message: "Title and file URL are required."
            });
        }

        await webDB.query(
            `
      INSERT INTO web_downloads
      (title, type, file_url, file_size, version, description, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                title,
                type || "client",
                file_url,
                file_size || null,
                version || null,
                description || null,
                Number(sort_order || 0),
                status || "active"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Download created successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create download.",
            error: error.message
        });
    }
};

const updateAdminDownload = async (req, res) => {
    try {
        const { title, type, file_url, file_size, version, description, sort_order, status } = req.body;

        if (!title || !file_url) {
            return res.status(422).json({
                success: false,
                message: "Title and file URL are required."
            });
        }

        await webDB.query(
            `
      UPDATE web_downloads
      SET title = ?, type = ?, file_url = ?, file_size = ?, version = ?, description = ?, sort_order = ?, status = ?
      WHERE id = ?
      `,
            [
                title,
                type || "client",
                file_url,
                file_size || null,
                version || null,
                description || null,
                Number(sort_order || 0),
                status || "active",
                req.params.id
            ]
        );

        res.json({
            success: true,
            message: "Download updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update download.",
            error: error.message
        });
    }
};

const deleteAdminDownload = async (req, res) => {
    try {
        await webDB.query(`DELETE FROM web_downloads WHERE id = ?`, [req.params.id]);

        res.json({
            success: true,
            message: "Download deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete download."
        });
    }
};

const getAdminServerStatus = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_server_status
      ORDER BY id DESC
      LIMIT 1
    `);

        res.json({ success: true, data: rows[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load server status." });
    }
};

const updateAdminServerStatus = async (req, res) => {
    try {
        const {
            server_name,
            login_status,
            game_status,
            online_players,
            max_players,
            server_version,
            rates_exp,
            rates_drop,
            rates_kinah
        } = req.body;

        const [rows] = await webDB.query(`
      SELECT id FROM web_server_status ORDER BY id DESC LIMIT 1
    `);

        if (!rows.length) {
            await webDB.query(
                `
        INSERT INTO web_server_status
        (server_name, login_status, game_status, online_players, max_players, server_version, rates_exp, rates_drop, rates_kinah)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    server_name || "Aion Online",
                    login_status || "offline",
                    game_status || "offline",
                    Number(online_players || 0),
                    Number(max_players || 5000),
                    server_version || "4.6",
                    rates_exp || "1x",
                    rates_drop || "1x",
                    rates_kinah || "1x"
                ]
            );
        } else {
            await webDB.query(
                `
        UPDATE web_server_status
        SET server_name = ?,
            login_status = ?,
            game_status = ?,
            online_players = ?,
            max_players = ?,
            server_version = ?,
            rates_exp = ?,
            rates_drop = ?,
            rates_kinah = ?
        WHERE id = ?
        `,
                [
                    server_name || "Aion Online",
                    login_status || "offline",
                    game_status || "offline",
                    Number(online_players || 0),
                    Number(max_players || 5000),
                    server_version || "4.6",
                    rates_exp || "1x",
                    rates_drop || "1x",
                    rates_kinah || "1x",
                    rows[0].id
                ]
            );
        }

        res.json({
            success: true,
            message: "Server status updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update server status.",
            error: error.message
        });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, username, email, role, status, last_login, donate_coin, created_at
      FROM web_users
      ORDER BY created_at DESC
    `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load users."
        });
    }
};

const updateAdminUser = async (req, res) => {
    try {
        const { role, status } = req.body;
        const userId = req.params.id;

        if (!["user", "admin"].includes(role)) {
            return res.status(422).json({
                success: false,
                message: "Invalid role."
            });
        }

        if (!["active", "banned", "pending"].includes(status)) {
            return res.status(422).json({
                success: false,
                message: "Invalid status."
            });
        }

        await webDB.query(
            `
      UPDATE web_users
      SET role = ?, status = ?
      WHERE id = ?
      `,
            [role, status, userId]
        );

        res.json({
            success: true,
            message: "User updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user."
        });
    }
};

const resetAdminUserPassword = async (req, res) => {
    const webConn = await webDB.getConnection();
    const lsConn = await lsDB.getConnection();

    try {
        const { password } = req.body;
        const userId = req.params.id;

        if (!password || password.length < 6) {
            return res.status(422).json({
                success: false,
                message: "Password minimal 6 karakter."
            });
        }

        const [users] = await webConn.query(
            `
      SELECT id, username
      FROM web_users
      WHERE id = ?
      LIMIT 1
      `,
            [userId]
        );

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = users[0];

        const webPasswordHash = await bcrypt.hash(password, 12);
        const gamePasswordHash = aionPasswordHash(password);

        await webConn.beginTransaction();
        await lsConn.beginTransaction();

        await webConn.query(
            `
      UPDATE web_users
      SET password = ?
      WHERE id = ?
      `,
            [webPasswordHash, userId]
        );

        await lsConn.query(
            `
      UPDATE account_data
      SET password = ?
      WHERE name = ?
      `,
            [gamePasswordHash, user.username]
        );

        await webConn.commit();
        await lsConn.commit();

        res.json({
            success: true,
            message: "Password reset successfully."
        });
    } catch (error) {
        await webConn.rollback();
        await lsConn.rollback();

        res.status(500).json({
            success: false,
            message: "Failed to reset password.",
            error: error.message
        });
    } finally {
        webConn.release();
        lsConn.release();
    }
};

const getAdminLogs = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT
        id,
        admin_id,
        admin_username,
        action,
        target_type,
        target_id,
        description,
        ip_address,
        created_at
      FROM web_admin_logs
      ORDER BY created_at DESC
      LIMIT 200
    `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load admin logs."
        });
    }
};

const updateUserCoin = async (req, res) => {
    const conn = await webDB.getConnection();

    try {
        const { type, amount, note } = req.body;
        const userId = req.params.id;

        if (!["add", "subtract"].includes(type)) {
            return res.status(422).json({
                success: false,
                message: "Invalid coin action."
            });
        }

        const coinAmount = Number(amount || 0);

        if (coinAmount <= 0) {
            return res.status(422).json({
                success: false,
                message: "Coin amount must be greater than 0."
            });
        }

        await conn.beginTransaction();

        const [users] = await conn.query(
            `
      SELECT id, username, donate_coin
      FROM web_users
      WHERE id = ?
      FOR UPDATE
      `,
            [userId]
        );

        if (!users.length) {
            await conn.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = users[0];
        const before = Number(user.donate_coin || 0);

        if (type === "subtract" && before < coinAmount) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: "User does not have enough coins."
            });
        }

        const after = type === "add"
            ? before + coinAmount
            : before - coinAmount;

        await conn.query(
            `
      UPDATE web_users
      SET donate_coin = ?
      WHERE id = ?
      `,
            [after, userId]
        );

        await conn.query(
            `
      INSERT INTO web_coin_logs
      (
        user_id,
        username,
        admin_id,
        admin_username,
        type,
        amount,
        balance_before,
        balance_after,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                user.id,
                user.username,
                req.user?.id || null,
                req.user?.username || null,
                type,
                coinAmount,
                before,
                after,
                note || null
            ]
        );

        await logAdminAction(req, {
            action: "update_user_coin",
            target_type: "web_user",
            target_id: user.id,
            description: `${type} ${coinAmount} coins for ${user.username}`
        });

        await conn.commit();

        res.json({
            success: true,
            message: "User coin balance updated successfully.",
            data: {
                balance_before: before,
                balance_after: after
            }
        });
    } catch (error) {
        await conn.rollback();

        res.status(500).json({
            success: false,
            message: "Failed to update user coins.",
            error: error.message
        });
    } finally {
        conn.release();
    }
};

const getUserCoinLogs = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `
      SELECT *
      FROM web_coin_logs
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 100
      `,
            [req.params.id]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load coin logs."
        });
    }
};

const getRecentCoinLogs = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT *
      FROM web_coin_logs
      ORDER BY id DESC
      LIMIT 100
    `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load coin logs."
        });
    }
};

module.exports = {
    getAdminDashboard,

    getAdminNews,
    getAdminNewsDetail,
    createAdminNews,
    updateAdminNews,
    deleteAdminNews,

    getAdminDownloads,
    getAdminDownloadDetail,
    createAdminDownload,
    updateAdminDownload,
    deleteAdminDownload,

    getAdminServerStatus,
    updateAdminServerStatus,

    getAdminUsers,
    updateAdminUser,
    resetAdminUserPassword,

    getAdminLogs,

    updateUserCoin,
    getUserCoinLogs,
    getRecentCoinLogs
};