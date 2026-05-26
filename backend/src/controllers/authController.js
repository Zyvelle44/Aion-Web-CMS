const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { webDB, lsDB } = require("../config/database");
const crypto = require("crypto");

const registerSchema = z.object({
    username: z
        .string()
        .min(4)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/, "Username only allows letters, numbers, and underscore"),

    email: z
        .string()
        .email()
        .max(120),

    password: z
        .string()
        .min(8, "Password minimum 8 characters")
        .max(100)
});

const loginSchema = z.object({
    username: z.string().min(4).max(120),
    password: z.string().min(6).max(100)
});

const aionPasswordHash = (password) => {
    return crypto
        .createHash("sha1")
        .update(password)
        .digest("base64");
};

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

const register = async (req, res) => {
    const webConn = await webDB.getConnection();
    const lsConn = await lsDB.getConnection();

    try {
        const body = registerSchema.parse(req.body);

        const username = body.username.trim();
        const email = body.email.trim().toLowerCase();
        const password = body.password;

        await webConn.beginTransaction();
        await lsConn.beginTransaction();

        const [existingWeb] = await webConn.query(
            `
      SELECT id 
      FROM web_users 
      WHERE username = ? OR email = ?
      LIMIT 1
      `,
            [username, email]
        );

        if (existingWeb.length) {
            await webConn.rollback();
            await lsConn.rollback();

            return res.status(409).json({
                success: false,
                message: "Username or email already registered"
            });
        }

        const [existingLS] = await lsConn.query(
            `
      SELECT id 
      FROM account_data 
      WHERE name = ?
      LIMIT 1
      `,
            [username]
        );

        if (existingLS.length) {
            await webConn.rollback();
            await lsConn.rollback();

            return res.status(409).json({
                success: false,
                message: "Game account already exists"
            });
        }

        const webPasswordHash = await bcrypt.hash(password, 12);
        const gamePasswordHash = aionPasswordHash(password);

        const [webResult] = await webConn.query(
            `
      INSERT INTO web_users 
      (username, email, password, role, status)
      VALUES (?, ?, ?, 'user', 'active')
      `,
            [username, email, webPasswordHash]
        );

        /*
          Default Aion login server biasanya memakai table account_data.
          Kalau struktur table kamu berbeda, bagian INSERT account_data ini nanti kita sesuaikan.
        */
        await lsConn.query(
            `
      INSERT INTO account_data
      (name, password, activated, access_level, membership, old_membership)
      VALUES (?, ?, 1, 0, 0, 0)
      `,
            [username, gamePasswordHash]
        );

        await webConn.commit();
        await lsConn.commit();

        return res.status(201).json({
            success: true,
            message: "Account registered successfully",
            user: {
                id: webResult.insertId,
                username,
                email,
                role: "user"
            }
        });
    } catch (error) {
        await webConn.rollback();
        await lsConn.rollback();

        if (error.name === "ZodError") {
            return res.status(422).json({
                success: false,
                message: "Validation failed",
                errors: error.errors
            });
        }

        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Register failed",
            error: error.message
        });
    } finally {
        webConn.release();
        lsConn.release();
    }
};

const login = async (req, res) => {
    try {
        const body = loginSchema.parse(req.body);

        const [rows] = await webDB.query(
            `
      SELECT id, username, email, password, role, status
      FROM web_users
      WHERE username = ? OR email = ?
      LIMIT 1
      `,
            [body.username, body.username]
        );

        if (!rows.length) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const user = rows[0];

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Account is not active"
            });
        }

        const isPasswordValid = await bcrypt.compare(body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        await webDB.query(
            `UPDATE web_users SET last_login = NOW() WHERE id = ?`,
            [user.id]
        );

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(422).json({
                success: false,
                message: "Validation failed",
                errors: error.errors
            });
        }

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

const changePassword = async (req, res) => {
    const webConn = await webDB.getConnection();
    const lsConn = await lsDB.getConnection();

    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return res.status(422).json({
                success: false,
                message: "Password baru minimal 6 karakter."
            });
        }

        const [rows] = await webConn.query(
            `
      SELECT id, username, password
      FROM web_users
      WHERE id = ?
      LIMIT 1
      `,
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan."
            });
        }

        const user = rows[0];

        const validPassword = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Password lama salah."
            });
        }

        const webPasswordHash = await bcrypt.hash(newPassword, 12);
        const gamePasswordHash = aionPasswordHash(newPassword);

        await webConn.beginTransaction();
        await lsConn.beginTransaction();

        await webConn.query(
            `
      UPDATE web_users
      SET password = ?
      WHERE id = ?
      `,
            [webPasswordHash, req.user.id]
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

        return res.json({
            success: true,
            message: "Password berhasil diganti."
        });
    } catch (error) {
        await webConn.rollback();
        await lsConn.rollback();

        return res.status(500).json({
            success: false,
            message: "Gagal mengganti password.",
            error: error.message
        });
    } finally {
        webConn.release();
        lsConn.release();
    }
};

const me = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `
      SELECT id, username, email, role, avatar, status, last_login, created_at
      FROM web_users
      WHERE id = ?
      LIMIT 1
      `,
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get profile"
        });
    }
};

module.exports = {
    register,
    login,
    changePassword,
    me
};