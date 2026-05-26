const { webDB } = require("../config/database");
const { logAdminAction } = require("../utils/adminLogger");

const slugify = (text) => {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const getAdminVoteSites = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
            SELECT *
            FROM web_vote_sites
            ORDER BY sort_order ASC, id DESC
        `);

        res.json({
            success: true,
            data: rows
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load vote sites."
        });
    }
};

const createAdminVoteSite = async (req, res) => {
    try {
        const {
            name,
            slug,
            vote_url,
            description,
            icon,
            reward_coin,
            cooldown_hours,
            sort_order,
            status
        } = req.body;

        if (!name || !vote_url) {
            return res.status(422).json({
                success: false,
                message: "Name and vote URL are required."
            });
        }

        const finalSlug = slugify(slug || name);

        await webDB.query(
            `
            INSERT INTO web_vote_sites
            (
                name,
                slug,
                vote_url,
                description,
                icon,
                reward_coin,
                cooldown_hours,
                sort_order,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                finalSlug,
                vote_url,
                description || null,
                icon || null,
                Number(reward_coin || 0),
                Number(cooldown_hours || 12),
                Number(sort_order || 0),
                status || "active"
            ]
        );

        await logAdminAction(req, {
            action: "create_vote_site",
            target_type: "vote_site",
            target_id: finalSlug,
            description: `Created vote site: ${name}`
        });

        res.status(201).json({
            success: true,
            message: "Vote site created successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create vote site.",
            error: error.message
        });
    }
};

const updateAdminVoteSite = async (req, res) => {
    try {
        const {
            name,
            slug,
            vote_url,
            description,
            icon,
            reward_coin,
            cooldown_hours,
            sort_order,
            status
        } = req.body;

        if (!name || !vote_url) {
            return res.status(422).json({
                success: false,
                message: "Name and vote URL are required."
            });
        }

        const finalSlug = slugify(slug || name);

        await webDB.query(
            `
            UPDATE web_vote_sites
            SET name = ?,
                slug = ?,
                vote_url = ?,
                description = ?,
                icon = ?,
                reward_coin = ?,
                cooldown_hours = ?,
                sort_order = ?,
                status = ?
            WHERE id = ?
            `,
            [
                name,
                finalSlug,
                vote_url,
                description || null,
                icon || null,
                Number(reward_coin || 0),
                Number(cooldown_hours || 12),
                Number(sort_order || 0),
                status || "active",
                req.params.id
            ]
        );

        await logAdminAction(req, {
            action: "update_vote_site",
            target_type: "vote_site",
            target_id: req.params.id,
            description: `Updated vote site: ${name}`
        });

        res.json({
            success: true,
            message: "Vote site updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update vote site.",
            error: error.message
        });
    }
};

const deleteAdminVoteSite = async (req, res) => {
    try {
        await webDB.query(
            `DELETE FROM web_vote_sites WHERE id = ?`,
            [req.params.id]
        );

        await logAdminAction(req, {
            action: "delete_vote_site",
            target_type: "vote_site",
            target_id: req.params.id,
            description: "Deleted vote site."
        });

        res.json({
            success: true,
            message: "Vote site deleted successfully."
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete vote site."
        });
    }
};

const getAdminVoteLogs = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
            SELECT *
            FROM web_vote_logs
            ORDER BY id DESC
            LIMIT 150
        `);

        res.json({
            success: true,
            data: rows
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load vote logs."
        });
    }
};

module.exports = {
    getAdminVoteSites,
    createAdminVoteSite,
    updateAdminVoteSite,
    deleteAdminVoteSite,
    getAdminVoteLogs
};