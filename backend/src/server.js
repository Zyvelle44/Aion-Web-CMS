require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const { helmetConfig, corsConfig } = require("./config/security");
const sanitizeMiddleware = require("./middleware/sanitizeMiddleware");
const {
    globalLimiter,
    authLimiter,
    adminLimiter
} = require("./middleware/rateLimitMiddleware");
const {
    notFoundHandler,
    errorHandler
} = require("./middleware/errorMiddleware");

const databaseRoutes = require("./routes/databaseRoutes");
const newsRoutes = require("./routes/newsRoutes");
const statusRoutes = require("./routes/statusRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const adminRoutes = require("./routes/adminRoutes");
const playerRoutes = require("./routes/playerRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const shopRoutes = require("./routes/shopRoutes");
const adminShopRoutes = require("./routes/adminShopRoutes");
const voteRoutes = require("./routes/voteRoutes");
const adminVoteRoutes = require("./routes/adminVoteRoutes");

const { startOnlinePlayersSync } = require("./jobs/syncOnlinePlayersJob");
const { startServerHealthCheck } = require("./jobs/serverHealthJob");
const { startAbyssRankingSync } = require("./jobs/syncAbyssRankingJob");
const { startPlayersRankingSync } = require("./jobs/syncPlayersRankingJob");
const { startPvpRankingSync } = require("./jobs/syncPvpRankingJob");
const { startKinahRankingSync } = require("./jobs/syncKinahRankingJob");
const { startLegionRankingSync } = require("./jobs/syncLegionRankingJob");
const { startShopDeliveryWorker } = require("./jobs/shopDeliveryJob");

const { renderIndexHtml } = require("./utils/renderIndex");

const app = express();
const PORT = process.env.APP_PORT || 3000;

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(sanitizeMiddleware);
app.use(globalLimiter);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        app: process.env.APP_NAME,
        status: "running"
    });
});

app.use("/api/database", databaseRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/status/server", statusRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/rankings", rankingRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin/shop", adminLimiter, adminShopRoutes);
app.use("/api/admin/vote", adminLimiter, adminVoteRoutes);

app.use(notFoundHandler);

app.use(async (req, res, next) => {
    try {
        const html = await renderIndexHtml();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

startOnlinePlayersSync();
startServerHealthCheck();

setTimeout(() => startAbyssRankingSync(), 1000);
setTimeout(() => startPlayersRankingSync(), 3000);
setTimeout(() => startPvpRankingSync(), 6000);
setTimeout(() => startKinahRankingSync(), 9000);
setTimeout(() => startLegionRankingSync(), 12000);
setTimeout(() => startShopDeliveryWorker(), 15000);

app.listen(PORT, () => {
    console.log(`Aion website server running on http://localhost:${PORT}`);
});