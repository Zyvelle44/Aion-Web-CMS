const fs = require("fs");
const path = require("path");
const { webDB } = require("../config/database");

const indexPath = path.join(__dirname, "../../../frontend/index.html");

const escapeAttr = (value) => {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
};

const getSettingsMap = async () => {
    const [rows] = await webDB.query(`
    SELECT setting_key, setting_value
    FROM web_settings
  `);

    const settings = {};

    rows.forEach((row) => {
        settings[row.setting_key] = row.setting_value || "";
    });

    return settings;
};

const renderIndexHtml = async () => {
    const settings = await getSettingsMap();
    let html = fs.readFileSync(indexPath, "utf8");

    const seoTitle =
        settings.seo_title ||
        settings.site_name ||
        "Aion Online - Private Server";

    const seoDescription =
        settings.seo_description ||
        "Play Aion Online private server with epic PvP, rankings, legions, events, and premium MMORPG experience.";

    const seoKeywords =
        settings.seo_keywords ||
        "Aion Online, Aion Private Server, MMORPG, PvP";

    const seoAuthor =
        settings.seo_author ||
        settings.site_name ||
        "Aion Online";

    const seoRobots =
        settings.seo_robots ||
        "index,follow";

    const seoOgTitle =
        settings.seo_og_title ||
        seoTitle;

    const seoOgDescription =
        settings.seo_og_description ||
        seoDescription;

    const seoOgImage =
        settings.seo_og_image ||
        settings.hero_background_image ||
        "";

    const faviconImage =
        settings.favicon_image ||
        "";

    const replacements = {
        "{{SEO_TITLE}}": seoTitle,
        "{{SEO_DESCRIPTION}}": seoDescription,
        "{{SEO_KEYWORDS}}": seoKeywords,
        "{{SEO_AUTHOR}}": seoAuthor,
        "{{SEO_ROBOTS}}": seoRobots,
        "{{SEO_OG_TITLE}}": seoOgTitle,
        "{{SEO_OG_DESCRIPTION}}": seoOgDescription,
        "{{SEO_OG_IMAGE}}": seoOgImage,
        "{{FAVICON_IMAGE}}": faviconImage
    };

    Object.keys(replacements).forEach((key) => {
        html = html.replaceAll(key, escapeAttr(replacements[key]));
    });

    return html;
};

module.exports = {
    renderIndexHtml
};