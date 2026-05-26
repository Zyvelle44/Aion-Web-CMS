const { webDB } = require("../config/database");
const crypto = require("crypto");

const getVoteSites = async (req, res) => {
    try {
        const user = req.user || null;

        const [sites] = await webDB.query(`
      SELECT
        id,
        name,
        slug,
        vote_url,
        description,
        icon,
        reward_coin,
        cooldown_hours
      FROM web_vote_sites
      WHERE status = 'active'
      ORDER BY sort_order ASC, id ASC
    `);

        if (!user) {
            return res.json({
                success: true,
                data: sites.map((site) => ({
                    ...site,
                    can_claim: false,
                    next_claim_at: null,
                    login_required: true
                }))
            });
        }

        const data = [];

        for (const site of sites) {
            const [logs] = await webDB.query(
                `
        SELECT created_at
        FROM web_vote_logs
        WHERE user_id = ?
        AND vote_site_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
                [user.id, site.id]
            );

            let canClaim = true;
            let nextClaimAt = null;

            if (logs.length) {
                const lastVote = new Date(logs[0].created_at);
                const nextVote = new Date(lastVote.getTime() + Number(site.cooldown_hours) * 60 * 60 * 1000);

                if (nextVote > new Date()) {
                    canClaim = false;
                    nextClaimAt = nextVote;
                }
            }

            data.push({
                ...site,
                can_claim: canClaim,
                next_claim_at: nextClaimAt
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load vote sites."
        });
    }
};

const claimVoteReward = async (req, res) => {
    const conn = await webDB.getConnection();

    try {
        const user = req.user;
        const { vote_site_id } = req.body;

        if (!vote_site_id) {
            return res.status(422).json({
                success: false,
                message: "Vote site is required."
            });
        }

        await conn.beginTransaction();

        const [sites] = await conn.query(
            `
            SELECT *
            FROM web_vote_sites
            WHERE id = ?
            AND status = 'active'
            LIMIT 1
            `,
            [vote_site_id]
        );

        if (!sites.length) {
            await conn.rollback();

            return res.status(404).json({
                success: false,
                message: "Vote site not found."
            });
        }

        const site = sites[0];

        const [lastLogs] = await conn.query(
            `
            SELECT created_at
            FROM web_vote_logs
            WHERE user_id = ?
            AND vote_site_id = ?
            ORDER BY id DESC
            LIMIT 1
            FOR UPDATE
            `,
            [user.id, site.id]
        );

        if (lastLogs.length) {
            const lastVote = new Date(lastLogs[0].created_at);

            const nextVote = new Date(
                lastVote.getTime() + Number(site.cooldown_hours) * 60 * 60 * 1000
            );

            if (nextVote > new Date()) {
                await conn.rollback();

                return res.status(400).json({
                    success: false,
                    message: "You already claimed this vote reward. Please wait for cooldown.",
                    next_claim_at: nextVote
                });
            }
        }

        const [attempts] = await conn.query(
            `
            SELECT *
            FROM web_vote_attempts
            WHERE user_id = ?
            AND vote_site_id = ?
            AND status = 'pending'
            ORDER BY id DESC
            LIMIT 1
            FOR UPDATE
            `,
            [user.id, site.id]
        );

        if (!attempts.length) {
            await conn.rollback();

            return res.status(400).json({
                success: false,
                message: "Please click Vote Now first and complete the vote before claiming reward."
            });
        }

        const attempt = attempts[0];

        const attemptTime = new Date(attempt.created_at);
        const minClaimTime = new Date(attemptTime.getTime() + 60 * 1000);

        if (minClaimTime > new Date()) {
            await conn.rollback();

            const secondsLeft = Math.ceil(
                (minClaimTime.getTime() - Date.now()) / 1000
            );

            return res.status(400).json({
                success: false,
                message: `Please wait ${secondsLeft} seconds before claiming reward.`,
                seconds_left: secondsLeft
            });
        }

        const [users] = await conn.query(
            `
            SELECT id, username, donate_coin
            FROM web_users
            WHERE id = ?
            FOR UPDATE
            `,
            [user.id]
        );

        if (!users.length) {
            await conn.rollback();

            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const currentUser = users[0];
        const before = Number(currentUser.donate_coin || 0);
        const reward = Number(site.reward_coin || 0);
        const after = before + reward;

        await conn.query(
            `
            UPDATE web_users
            SET donate_coin = ?
            WHERE id = ?
            `,
            [after, user.id]
        );

        await conn.query(
            `
            INSERT INTO web_vote_logs
            (
                user_id,
                username,
                vote_site_id,
                vote_site_name,
                reward_coin,
                ip_address,
                user_agent
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user.id,
                user.username,
                site.id,
                site.name,
                reward,
                req.ip || null,
                req.headers["user-agent"] || null
            ]
        );

        await conn.query(
            `
            INSERT INTO web_coin_logs
            (
                user_id,
                username,
                type,
                amount,
                balance_before,
                balance_after,
                note
            )
            VALUES (?, ?, 'add', ?, ?, ?, ?)
            `,
            [
                user.id,
                user.username,
                reward,
                before,
                after,
                `Vote reward from ${site.name}`
            ]
        );

        await conn.query(
            `
            UPDATE web_vote_attempts
            SET status = 'claimed',
                claimed_at = NOW()
            WHERE id = ?
            `,
            [attempt.id]
        );

        await conn.commit();

        return res.json({
            success: true,
            message: `Vote reward claimed successfully. You received ${reward} coins.`,
            data: {
                balance_before: before,
                balance_after: after,
                reward_coin: reward
            }
        });
    } catch (error) {
        await conn.rollback();

        return res.status(500).json({
            success: false,
            message: "Failed to claim vote reward.",
            error: error.message
        });
    } finally {
        conn.release();
    }
};

const getMyVoteLogs = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `
      SELECT *
      FROM web_vote_logs
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 50
      `,
            [req.user.id]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load vote history."
        });
    }
};

const startVoteAttempt = async (req, res) => {
    try {
        const user = req.user;
        const { vote_site_id } = req.body;

        if (!vote_site_id) {
            return res.status(422).json({
                success: false,
                message: "Vote site is required."
            });
        }

        const [sites] = await webDB.query(
            `
      SELECT *
      FROM web_vote_sites
      WHERE id = ?
      AND status = 'active'
      LIMIT 1
      `,
            [vote_site_id]
        );

        if (!sites.length) {
            return res.status(404).json({
                success: false,
                message: "Vote site not found."
            });
        }

        const site = sites[0];

        const [lastLogs] = await webDB.query(
            `
      SELECT created_at
      FROM web_vote_logs
      WHERE user_id = ?
      AND vote_site_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
            [user.id, site.id]
        );

        if (lastLogs.length) {
            const lastVote = new Date(lastLogs[0].created_at);
            const nextVote = new Date(
                lastVote.getTime() + Number(site.cooldown_hours) * 60 * 60 * 1000
            );

            if (nextVote > new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Vote cooldown is still active.",
                    next_claim_at: nextVote
                });
            }
        }

        await webDB.query(
            `
      UPDATE web_vote_attempts
      SET status = 'expired'
      WHERE user_id = ?
      AND vote_site_id = ?
      AND status = 'pending'
      `,
            [user.id, site.id]
        );

        await webDB.query(
            `
      INSERT INTO web_vote_attempts
      (
        user_id,
        username,
        vote_site_id,
        vote_site_name,
        status,
        ip_address,
        user_agent
      )
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
      `,
            [
                user.id,
                user.username,
                site.id,
                site.name,
                req.ip || null,
                req.headers["user-agent"] || null
            ]
        );

        res.json({
            success: true,
            message: "Vote attempt started. Complete your vote, then return to claim.",
            data: {
                vote_url: site.vote_url,
                min_claim_seconds: 60
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to start vote.",
            error: error.message
        });
    }
};

module.exports = {
    getVoteSites,
    startVoteAttempt,
    claimVoteReward,
    getMyVoteLogs
};