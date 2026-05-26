const { webDB } = require("../config/database");
const fs = require("fs");
const path = require("path");

const { logAdminAction } = require("../utils/adminLogger");

const getPublicSettings = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT setting_key, setting_value
      FROM web_settings
    `);

        const settings = {};
        rows.forEach((row) => {
            settings[row.setting_key] = row.setting_value;
        });

        res.json({ success: true, data: settings });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load website settings."
        });
    }
};

const getAdminSettings = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, setting_key, setting_value, setting_type, group_name, updated_at
      FROM web_settings
      ORDER BY group_name ASC, id ASC
    `);

        res.json({ success: true, data: rows });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load admin settings."
        });
    }
};

const updateAdminSettings = async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || typeof settings !== "object") {
            return res.status(422).json({
                success: false,
                message: "Invalid settings payload."
            });
        }

        const allowedKeys = Object.keys(settings);

        for (const key of allowedKeys) {
            await webDB.query(
                `
        UPDATE web_settings
        SET setting_value = ?
        WHERE setting_key = ?
        `,
                [settings[key], key]
            );
        }

        await logAdminAction(req, {
            action: "update_settings",
            target_type: "web_settings",
            description: "Updated website settings."
        });

        res.json({
            success: true,
            message: "Website settings updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update settings.",
            error: error.message
        });
    }
};

const uploadSettingImage = async (req, res) => {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(422).json({
                success: false,
                message: "Setting key is required."
            });
        }

        if (!req.file) {
            return res.status(422).json({
                success: false,
                message: "Image file is required."
            });
        }

        const allowedKeys = [
            "logo_image",
            "hero_background_image",
            "page_background_image",
            "seo_og_image",
            "favicon_image"
        ];

        if (!allowedKeys.includes(key)) {
            return res.status(422).json({
                success: false,
                message: "Invalid image setting key."
            });
        }

        const fileUrl = `/uploads/settings/${req.file.filename}`;

        await webDB.query(
            `
      INSERT INTO web_settings (setting_key, setting_value, setting_type, group_name)
      VALUES (?, ?, 'image', 'images')
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `,
            [key, fileUrl]
        );

        await logAdminAction(req, {
            action: "upload_setting_image",
            target_type: "web_settings",
            target_id: key,
            description: `Uploaded image for setting: ${key}`
        });

        res.json({
            success: true,
            message: "Image uploaded successfully.",
            url: fileUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to upload image.",
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

const themeKeys = [
    "primary_color",
    "secondary_color",
    "background_color",
    "background_soft",
    "text_color",
    "muted_color",
    "navbar_bg",
    "navbar_border",
    "nav_link_color",
    "card_bg",
    "glass_bg",
    "dark_glass_bg",
    "border_color",
    "border_soft",
    "shadow_color",
    "card_radius",
    "button_radius",
    "pill_radius",
    "navbar_height",
    "section_padding",
    "container_width",
    "hero_overlay_dark",
    "hero_overlay_soft",
    "hero_glow_opacity",
    "success_color",
    "danger_color",
    "warning_color",
    "success_bg",
    "danger_bg",
    "warning_bg",
    "logo_text",
    "logo_image",
    "hero_background_image",
    "page_background_image"
];

const exportTheme = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `
      SELECT setting_key, setting_value
      FROM web_settings
      WHERE setting_key IN (${themeKeys.map(() => "?").join(",")})
      `,
            themeKeys
        );

        const theme = {};

        rows.forEach((row) => {
            theme[row.setting_key] = row.setting_value;
        });

        await logAdminAction(req, {
            action: "export_theme",
            target_type: "theme",
            description: "Exported theme JSON."
        });

        res.json({
            success: true,
            data: {
                name: "Aion Theme Export",
                exported_at: new Date().toISOString(),
                theme
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to export theme."
        });
    }
};

const importTheme = async (req, res) => {
    try {
        const { theme } = req.body;

        if (!theme || typeof theme !== "object") {
            return res.status(422).json({
                success: false,
                message: "Invalid theme JSON."
            });
        }

        for (const key of Object.keys(theme)) {
            if (!themeKeys.includes(key)) continue;

            await webDB.query(
                `
        INSERT INTO web_settings (setting_key, setting_value, setting_type, group_name)
        VALUES (?, ?, 'text', 'theme')
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `,
                [key, theme[key]]
            );
        }

        await logAdminAction(req, {
            action: "import_theme",
            target_type: "theme",
            description: "Imported theme JSON."
        });

        res.json({
            success: true,
            message: "Theme imported successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to import theme.",
            error: error.message
        });
    }
};

const saveThemePreset = async (req, res) => {
    try {
        const { name, theme } = req.body;

        if (!name || !theme || typeof theme !== "object") {
            return res.status(422).json({
                success: false,
                message: "Preset name and theme data are required."
            });
        }

        let slug = slugify(name);

        const [exists] = await webDB.query(
            `SELECT id FROM web_theme_presets WHERE slug = ? LIMIT 1`,
            [slug]
        );

        if (exists.length) {
            slug = `${slug}-${Date.now()}`;
        }

        await webDB.query(
            `
      INSERT INTO web_theme_presets (name, slug, theme_data)
      VALUES (?, ?, ?)
      `,
            [name, slug, JSON.stringify(theme)]
        );

        await logAdminAction(req, {
            action: "save_theme",
            target_type: "theme",
            description: "Save theme."
        });

        res.status(201).json({
            success: true,
            message: "Theme preset saved successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to save theme preset.",
            error: error.message
        });
    }
};

const getThemePresets = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT id, name, slug, is_default, created_at, updated_at
      FROM web_theme_presets
      ORDER BY created_at DESC
    `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load theme presets."
        });
    }
};

const applyThemePreset = async (req, res) => {
    try {
        const [rows] = await webDB.query(
            `
      SELECT theme_data
      FROM web_theme_presets
      WHERE id = ?
      LIMIT 1
      `,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Theme preset not found."
            });
        }

        const theme = typeof rows[0].theme_data === "object"
            ? rows[0].theme_data
            : JSON.parse(rows[0].theme_data);

        for (const key of Object.keys(theme)) {
            if (!themeKeys.includes(key)) continue;

            await webDB.query(
                `
        INSERT INTO web_settings (setting_key, setting_value, setting_type, group_name)
        VALUES (?, ?, 'text', 'theme')
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `,
                [key, theme[key]]
            );
        }

        res.json({
            success: true,
            message: "Theme preset applied successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to apply theme preset.",
            error: error.message
        });
    }
};

const deleteThemePreset = async (req, res) => {
    try {
        await webDB.query(
            `DELETE FROM web_theme_presets WHERE id = ?`,
            [req.params.id]
        );

        res.json({
            success: true,
            message: "Theme preset deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete theme preset."
        });
    }
};

const deleteSettingImage = async (req, res) => {
    try {
        const { key } = req.body;

        const allowedKeys = [
            "logo_image",
            "hero_background_image",
            "page_background_image",
            "seo_og_image",
            "favicon_image"
        ];

        if (!allowedKeys.includes(key)) {
            return res.status(422).json({
                success: false,
                message: "Invalid image setting key."
            });
        }

        const [rows] = await webDB.query(
            `
      SELECT setting_value
      FROM web_settings
      WHERE setting_key = ?
      LIMIT 1
      `,
            [key]
        );

        const imageUrl = rows[0]?.setting_value || "";

        if (imageUrl.startsWith("/uploads/settings/")) {
            const filePath = path.join(
                __dirname,
                "../../../frontend",
                imageUrl
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await webDB.query(
            `
      UPDATE web_settings
      SET setting_value = ''
      WHERE setting_key = ?
      `,
            [key]
        );

        await logAdminAction(req, {
            action: "delete_setting_image",
            target_type: "web_settings",
            target_id: key,
            description: `Deleted image for setting: ${key}`
        });

        res.json({
            success: true,
            message: "Image deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete image.",
            error: error.message
        });
    }
};

const exportAllSettings = async (req, res) => {
    try {
        const [rows] = await webDB.query(`
      SELECT setting_key, setting_value, setting_type, group_name
      FROM web_settings
      ORDER BY group_name ASC, setting_key ASC
    `);

        const settings = {};

        rows.forEach((row) => {
            settings[row.setting_key] = {
                value: row.setting_value,
                type: row.setting_type,
                group: row.group_name
            };
        });

        res.json({
            success: true,
            data: {
                name: "Aion Website Settings Backup",
                exported_at: new Date().toISOString(),
                version: "1.0.0",
                settings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to export settings backup.",
            error: error.message
        });
    }
};

const importAllSettings = async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || typeof settings !== "object") {
            return res.status(422).json({
                success: false,
                message: "Invalid settings backup file."
            });
        }

        for (const key of Object.keys(settings)) {
            const item = settings[key];

            const value =
                typeof item === "object" && item !== null
                    ? item.value
                    : item;

            const type =
                typeof item === "object" && item !== null
                    ? item.type || "text"
                    : "text";

            const group =
                typeof item === "object" && item !== null
                    ? item.group || "general"
                    : "general";

            await webDB.query(
                `
        INSERT INTO web_settings
        (setting_key, setting_value, setting_type, group_name)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          setting_type = VALUES(setting_type),
          group_name = VALUES(group_name)
        `,
                [key, value, type, group]
            );
        }

        res.json({
            success: true,
            message: "Settings backup restored successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to restore settings backup.",
            error: error.message
        });
    }
};

module.exports = {
    getPublicSettings,
    getAdminSettings,
    updateAdminSettings,
    uploadSettingImage,
    deleteSettingImage,

    exportTheme,
    importTheme,
    saveThemePreset,
    getThemePresets,
    applyThemePreset,
    deleteThemePreset,

    exportAllSettings,
    importAllSettings
};