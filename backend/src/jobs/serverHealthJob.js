const net = require("net");
const { webDB } = require("../config/database");

const checkPort = (host, port, timeout = 3000) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.setTimeout(timeout);

        socket.once("connect", () => {
            socket.destroy();
            resolve(true);
        });

        socket.once("timeout", () => {
            socket.destroy();
            resolve(false);
        });

        socket.once("error", () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
};

const syncServerHealth = async () => {
    try {
        const loginOnline = await checkPort(
            process.env.LOGIN_SERVER_HOST,
            Number(process.env.LOGIN_SERVER_PORT)
        );

        const gameOnline = await checkPort(
            process.env.GAME_SERVER_HOST,
            Number(process.env.GAME_SERVER_PORT)
        );

        const loginStatus = loginOnline ? "online" : "offline";
        const gameStatus = gameOnline ? "online" : "offline";

        await webDB.query(
            `
      UPDATE web_server_status
      SET login_status = ?, game_status = ?
      ORDER BY id DESC
      LIMIT 1
      `,
            [loginStatus, gameStatus]
        );

        console.log(`[HEALTH] Login: ${loginStatus} | Game: ${gameStatus}`);
    } catch (error) {
        console.error("[HEALTH] Server check failed:", error.message);
    }
};

const startServerHealthCheck = () => {
    syncServerHealth();

    setInterval(() => {
        syncServerHealth();
    }, 30 * 1000);
};

module.exports = {
    syncServerHealth,
    startServerHealthCheck
};