const { webDB, lsDB, gsDB } = require("../config/database");

const checkDatabase = async (req, res) => {
    try {
        const [webResult] = await webDB.query("SELECT DATABASE() AS database_name");
        const [lsResult] = await lsDB.query("SELECT DATABASE() AS database_name");
        const [gsResult] = await gsDB.query("SELECT DATABASE() AS database_name");

        return res.json({
            success: true,
            message: "All databases connected successfully.",
            databases: {
                web: webResult[0].database_name,
                login_server: lsResult[0].database_name,
                game_server: gsResult[0].database_name
            }
        });
    } catch (error) {
        console.error("Database connection error:", error);

        return res.status(500).json({
            success: false,
            message: "Database connection failed.",
            error: error.message
        });
    }
};

module.exports = {
    checkDatabase
};