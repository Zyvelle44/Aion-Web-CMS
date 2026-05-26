const API = {
    status: "/api/status/server",
    news: "/api/news",
    downloads: "/api/downloads",
    ranking: "/api/rankings",
    shopCategories: "/api/shop/categories",
    shopItems: "/api/shop/items",
    shopMyOrders: "/api/shop/my-orders",
    voteSites: "/api/vote/sites",
    voteClaim: "/api/vote/claim",
    voteStart: "/api/vote/start",
    voteLogs: "/api/vote/my-logs",
    settings: "/api/settings",
};

const openAdminShopTab = (tab) => {
    document.querySelectorAll("[data-open-shop-tab]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.openShopTab === tab);
    });

    document.querySelectorAll("[data-shop-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.shopPanel === tab);
    });
};

const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
};

const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(Number(number || 0));
};

const escapeHTML = (value) => {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

const setStatusClass = (element, status) => {
    if (!element) return;

    element.classList.remove(
        "status-online",
        "status-offline",
        "status-maintenance"
    );

    element.classList.add(`status-${status}`);
};

const loadServerStatus = async () => {
    try {
        const response = await fetch(API.status);
        const result = await response.json();

        if (!result.success || !result.data) return;

        const data = result.data;

        setText("serverName", data.server_name);
        setText("loginStatus", data.login_status);
        setText("gameStatus", data.game_status);
        setText(
            "onlinePlayers",
            `${formatNumber(data.online_players)} / ${formatNumber(data.max_players)}`
        );

        setText("expRate", `EXP ${data.rates_exp}`);
        setText("dropRate", `DROP ${data.rates_drop}`);
        setText("kinahRate", `KINAH ${data.rates_kinah}`);

        setStatusClass(document.getElementById("loginStatus"), data.login_status);
        setStatusClass(document.getElementById("gameStatus"), data.game_status);
    } catch (error) {
        console.error("Failed to load server status:", error);
    }
};

const loadNews = async (limit = null) => {
    const newsGrid = document.getElementById("newsGrid");
    if (!newsGrid) return;

    newsGrid.innerHTML = `<div class="empty-state">Loading news...</div>`;

    try {
        const response = await fetch(API.news);
        const result = await response.json();

        if (!result.success || !result.data.length) {
            newsGrid.innerHTML = `<div class="empty-state">No news available.</div>`;
            return;
        }

        const data = limit ? result.data.slice(0, limit) : result.data;

        newsGrid.innerHTML = data.map((item) => {
            return `
        <article class="news-card">
          <span class="news-category">${escapeHTML(item.category)}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.excerpt || "No description available.")}</p>
        </article>
      `;
        }).join("");
    } catch (error) {
        console.error("Failed to load news:", error);
        newsGrid.innerHTML = `<div class="empty-state">Failed to load news.</div>`;
    }
};

const loadDownloads = async () => {
    const downloadGrid = document.getElementById("downloadGrid");
    if (!downloadGrid) return;

    downloadGrid.innerHTML = `<div class="empty-state">Loading downloads...</div>`;

    try {
        const response = await fetch(API.downloads);
        const result = await response.json();

        if (!result.success || !result.data.length) {
            downloadGrid.innerHTML = `<div class="empty-state">No downloads available.</div>`;
            return;
        }

        downloadGrid.innerHTML = result.data.map((item) => {
            return `
        <div class="download-card">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description || "Download file for Aion Online.")}</p>

          <div class="download-meta">
            <span>${escapeHTML(item.type)}</span>
            <span>${escapeHTML(item.file_size || "Unknown size")}</span>
            <span>v${escapeHTML(item.version || "1.0")}</span>
          </div>

          <a class="download-btn" href="${escapeHTML(item.file_url)}" target="_blank">
            Download
          </a>
        </div>
      `;
        }).join("");
    } catch (error) {
        console.error("Failed to load downloads:", error);
        downloadGrid.innerHTML = `<div class="empty-state">Failed to load downloads.</div>`;
    }
};

const rankingConfigs = {
    players: {
        title: "Players Ranking",
        headers: ["#", "Player", "Race", "Class", "Level", "EXP"]
    },
    abyss: {
        title: "Abyss Ranking",
        headers: ["#", "Player", "Race", "Class", "Level", "AP"]
    },
    pvp: {
        title: "PvP Ranking",
        headers: ["#", "Player", "Race", "Class", "Level", "Kills"]
    },
    kinah: {
        title: "Kinah Ranking",
        headers: ["#", "Player", "Race", "Class", "Level", "Kinah"]
    },
    legions: {
        title: "Legion Ranking",
        headers: ["#", "Legion", "Level", "Members", "Contribution", "Rank CP"]
    }
};

const parseExtraData = (extraData) => {
    try {
        if (!extraData) return {};
        if (typeof extraData === "object") return extraData;
        return JSON.parse(extraData);
    } catch {
        return {};
    }
};

const renderRankingHeader = (type) => {
    const config = rankingConfigs[type] || rankingConfigs.players;
    const rankingHead = document.getElementById("rankingHead");
    const rankingTitle = document.getElementById("rankingTitle");

    if (rankingTitle) {
        rankingTitle.textContent = config.title;
    }

    if (rankingHead) {
        rankingHead.innerHTML = `
      <tr>
        ${config.headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}
      </tr>
    `;
    }
};

const renderRankingRow = (item, index, type) => {
    const extra = parseExtraData(item.extra_data);
    const position = item.position || index + 1;

    if (type === "legions") {
        return `
      <tr>
        <td>${position}</td>
        <td>${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.level || "-")}</td>
        <td>${formatNumber(extra.total_members || 0)}</td>
        <td>${formatNumber(extra.contribution_points || item.points || 0)}</td>
        <td>${formatNumber(extra.rank_cp || 0)}</td>
      </tr>
    `;
    }

    return `
    <tr>
      <td>${position}</td>
      <td>
        <div class="rank-player">
          <strong>
            <a href="/player/${item.source_id}" class="player-link" data-route="/player/${item.source_id}">
                ${escapeHTML(item.name)}
            </a>
          </strong>
          ${Number(extra.online) === 1
            ? `<span class="online-dot">Online</span>`
            : `<span class="offline-dot">Offline</span>`
        }
        </div>
      </td>
      <td>${escapeHTML(item.race || "-")}</td>
      <td>${escapeHTML(item.player_class || "-")}</td>
      <td>${escapeHTML(item.level || "-")}</td>
      <td>${formatNumber(item.points)}</td>
    </tr>
  `;
};

const loadRanking = async (type = "players", limit = 100) => {
    const rankingBody = document.getElementById("rankingBody");
    if (!rankingBody) return;

    renderRankingHeader(type);

    rankingBody.innerHTML = `
    <tr>
      <td colspan="6">Loading ranking...</td>
    </tr>
  `;

    try {
        const response = await fetch(`${API.ranking}?type=${type}`);
        const result = await response.json();

        if (!result.success || !result.data.length) {
            rankingBody.innerHTML = `
        <tr>
          <td colspan="6">No ranking data available.</td>
        </tr>
      `;
            return;
        }

        rankingBody.innerHTML = result.data
            .slice(0, limit)
            .map((item, index) => renderRankingRow(item, index, type))
            .join("");
    } catch (error) {
        console.error("Failed to load ranking:", error);

        rankingBody.innerHTML = `
      <tr>
        <td colspan="6">Failed to load ranking.</td>
      </tr>
    `;
    }
};

const AUTH_TOKEN_KEY = "aion_auth_token";
const AUTH_USER_KEY = "aion_auth_user";

const saveAuth = (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const getAuthUser = () => {
    try {
        return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
    } catch {
        return null;
    }
};

const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    navigateTo("/login");
};

const updateAuthArea = () => {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;

    const user = getAuthUser();

    if (!user) {
        authArea.innerHTML = `
            <div class="guest-auth">
                <button class="login-btn" data-route="/login">Login</button>
                <button class="register-btn" data-route="/register">Register</button>
            </div>
        `;
        return;
    }

    authArea.innerHTML = `
        <div class="user-menu">
            <button class="user-dashboard-btn" data-route="/account">
                ${escapeHTML(user.username)}
            </button>

            ${user.role === "admin"
            ? `<button class="admin-navbar-btn" data-route="/admin">Admin</button>`
            : ``
        }

            <button id="logoutBtn">Logout</button>
        </div>
    `;
};

document.addEventListener("click", (event) => {
    if (event.target.id === "logoutBtn") {
        logout();
    }
});

const showAuthMessage = (message, type = "error") => {
    const box = document.getElementById("authMessage");
    if (!box) return;

    box.className = `auth-message ${type}`;
    box.textContent = message;
};

const initLoginForm = () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (!result.success) {
                showAuthMessage(result.message || "Login failed");
                return;
            }

            saveAuth(result.token, result.user);
            showAuthMessage("Login successful. Redirecting...", "success");

            setTimeout(() => {
                navigateTo("/");
            }, 700);
        } catch (error) {
            showAuthMessage("Connection error. Please try again.");
        }
    });
};

const initRegisterForm = () => {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const messageBox = document.getElementById("authMessage");
        const submitBtn = event.submitter;

        const username = document.getElementById("registerUsername").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerPasswordConfirm").value;

        if (!username || !email || !password || !confirmPassword) {
            messageBox.className = "auth-message error";
            messageBox.textContent = "Please fill all required fields.";
            return;
        }

        if (password.length < 6) {
            messageBox.className = "auth-message error";
            messageBox.textContent = "Password must be at least 6 characters.";
            return;
        }

        if (password !== confirmPassword) {
            messageBox.className = "auth-message error";
            messageBox.textContent = "Password confirmation does not match.";
            return;
        }

        try {
            setButtonLoading(submitBtn, true, "Creating...");

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const result = await response.json();

            if (!result.success) {
                messageBox.className = "auth-message error";
                messageBox.textContent = result.message || "Register failed.";
                return;
            }

            messageBox.className = "auth-message success";
            messageBox.textContent = "Account created successfully. Please login.";

            setTimeout(() => {
                navigateTo("/login");
            }, 900);
        } catch (error) {
            messageBox.className = "auth-message error";
            messageBox.textContent = "Connection error. Please try again.";
        } finally {
            setButtonLoading(submitBtn, false);
        }
    });
};

const getAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

const loadAccountDashboard = async () => {
    const dashboard = document.getElementById("accountDashboard");
    if (!dashboard) return;

    const token = getAuthToken();

    if (!token) {
        dashboard.innerHTML = `
      <div class="empty-state">
        You must login first.
        <br><br>
        <button class="auth-btn" data-route="/login">Login</button>
      </div>
    `;
        return;
    }

    try {
        const response = await fetch("/api/account/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            dashboard.innerHTML = `<div class="empty-state">${escapeHTML(result.message)}</div>`;
            return;
        }

        const { profile, game_account, characters } = result.data;

        dashboard.innerHTML = `
      <div class="account-grid">
        <div class="account-card">
          <h3>Website Profile</h3>
          <div class="account-row"><span>Username</span><strong>${escapeHTML(profile.username)}</strong></div>
          <div class="account-row"><span>Email</span><strong>${escapeHTML(profile.email)}</strong></div>
          <div class="account-row"><span>Role</span><strong>${escapeHTML(profile.role)}</strong></div>
          <div class="account-row"><span>Status</span><strong>${escapeHTML(profile.status)}</strong></div>
          <div class="account-row"><span>Joined</span><strong>${escapeHTML(profile.created_at || "-")}</strong></div>
        </div>

        <div class="account-card">
          <h3>Game Account</h3>
          ${game_account
                ? `
                <div class="account-row"><span>Account ID</span><strong>${escapeHTML(game_account.id)}</strong></div>
                <div class="account-row"><span>Name</span><strong>${escapeHTML(game_account.name)}</strong></div>
                <div class="account-row"><span>Activated</span><strong>${game_account.activated ? "Yes" : "No"}</strong></div>
                <div class="account-row"><span>Access Level</span><strong>${escapeHTML(game_account.access_level)}</strong></div>
                <div class="account-row"><span>Membership</span><strong>${escapeHTML(game_account.membership)}</strong></div>
              `
                : `<p class="muted-text">No game account found.</p>`
            }
        </div>
      </div>

      <div class="account-card change-password-card">
        <h3>Change Password</h3>

        <form id="changePasswordForm" class="auth-form">
            <input type="password" id="currentPassword" placeholder="Current Password" required />
            <input type="password" id="newPassword" placeholder="New Password" required />
            <input type="password" id="confirmPassword" placeholder="Confirm New Password" required />

            <button type="submit" class="auth-btn">Update Password</button>
        </form>

        <div id="passwordMessage"></div>
      </div>

      <div class="account-card character-section">
        <h3>My Characters</h3>

        ${characters.length
                ? `
              <div class="character-grid">
                ${characters.map((char) => `
                  <div class="character-card">
                    <div class="character-level">Lv. ${escapeHTML(char.level)}</div>
                    <h4>${escapeHTML(char.name)}</h4>
                    <p>${escapeHTML(char.race || "-")} · ${escapeHTML(char.player_class || "-")}</p>
                    <span>${escapeHTML(char.gender || "-")}</span>
                  </div>
                `).join("")}
              </div>
            `
                : `<p class="muted-text">No characters found.</p>`
            }
      </div>
    `
        initChangePasswordForm();
        ;

    } catch (error) {
        dashboard.innerHTML = `<div class="empty-state">Failed to load dashboard.</div>`;
    }
};

const initChangePasswordForm = () => {
    const form = document.getElementById("changePasswordForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const messageBox = document.getElementById("passwordMessage");

        if (newPassword !== confirmPassword) {
            messageBox.className = "auth-message error";
            messageBox.textContent = "Konfirmasi password tidak sama.";
            return;
        }

        try {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const result = await response.json();

            messageBox.className = result.success
                ? "auth-message success"
                : "auth-message error";

            messageBox.textContent = result.message;

            if (result.success) {
                form.reset();
            }
        } catch (error) {
            messageBox.className = "auth-message error";
            messageBox.textContent = "Connection error.";
        }
    });
};

const loadAdminDashboard = async () => {
    const dashboard = document.getElementById("adminDashboard");
    if (!dashboard) return;

    const token = getAuthToken();

    if (!token) {
        dashboard.innerHTML = `
      <div class="empty-state">
        You must login as admin first.
        <br><br>
        <button class="auth-btn" data-route="/login">Login</button>
      </div>
    `;
        return;
    }

    try {
        const response = await fetch("/api/admin/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            dashboard.innerHTML = `
        <div class="empty-state">
          ${escapeHTML(result.message)}
        </div>
      `;
            return;
        }

        const data = result.data;

        dashboard.innerHTML = `
      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <span>Website Users</span>
          <strong>${formatNumber(data.web_users)}</strong>
        </div>

        <div class="admin-stat-card">
          <span>Game Accounts</span>
          <strong>${formatNumber(data.game_accounts)}</strong>
        </div>

        <div class="admin-stat-card">
          <span>Characters</span>
          <strong>${formatNumber(data.characters)}</strong>
        </div>

        <div class="admin-stat-card">
          <span>News Posts</span>
          <strong>${formatNumber(data.news)}</strong>
        </div>

        <div class="admin-stat-card">
          <span>Downloads</span>
          <strong>${formatNumber(data.downloads)}</strong>
        </div>
      </div>

      <div class="account-card admin-server-card">
        <h3>Server Status</h3>

        ${data.server_status
                ? `
              <div class="account-row">
                <span>Server Name</span>
                <strong>${escapeHTML(data.server_status.server_name)}</strong>
              </div>

              <div class="account-row">
                <span>Login Server</span>
                <strong>${escapeHTML(data.server_status.login_status)}</strong>
              </div>

              <div class="account-row">
                <span>Game Server</span>
                <strong>${escapeHTML(data.server_status.game_status)}</strong>
              </div>

              <div class="account-row">
                <span>Online Players</span>
                <strong>
                  ${formatNumber(data.server_status.online_players)}
                  /
                  ${formatNumber(data.server_status.max_players)}
                </strong>
              </div>

              <div class="account-row">
                <span>Version</span>
                <strong>${escapeHTML(data.server_status.server_version)}</strong>
              </div>
            `
                : `<p class="muted-text">No server status found.</p>`
            }
      </div>

      <div class="admin-actions">
        <button data-route="/admin/news">Manage News</button>
        <button data-route="/admin/downloads">Manage Downloads</button>
        <button data-route="/admin/status">Manage Server Status</button>
        <button data-route="/admin/users">Manage Users</button>
        <button data-route="/admin/settings">Website Settings</button>
        <button data-route="/admin/logs">Activity Logs</button>
        <button data-route="/admin/shop">Manage Item Shop</button>
        <button data-route="/admin/vote">Manage Vote</button>
      </div>
    `;
    } catch (error) {
        dashboard.innerHTML = `
      <div class="empty-state">
        Failed to load admin dashboard.
      </div>
    `;
    }
};

const adminRequest = async (url, options = {}) => {
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
            ...(options.headers || {})
        }
    });
};

const initAdminNewsPage = () => {
    initAdminNewsForm();
    loadAdminNewsList();
};

const showAdminNewsMessage = (message, type = "error") => {
    const box = document.getElementById("adminNewsMessage");
    if (!box) return;

    box.className = `auth-message ${type}`;
    box.textContent = message;
};

const resetAdminNewsForm = () => {
    document.getElementById("newsId").value = "";
    document.getElementById("newsTitle").value = "";
    document.getElementById("newsCategory").value = "news";
    document.getElementById("newsStatus").value = "published";
    document.getElementById("newsImage").value = "";
    document.getElementById("newsExcerpt").value = "";
    document.getElementById("newsContent").value = "";
    document.getElementById("newsFormTitle").textContent = "Create News";
};

const initAdminNewsForm = () => {
    const form = document.getElementById("adminNewsForm");
    if (!form) return;

    document.getElementById("resetNewsForm").addEventListener("click", () => {
        resetAdminNewsForm();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = document.getElementById("newsId").value;

        const payload = {
            title: document.getElementById("newsTitle").value.trim(),
            category: document.getElementById("newsCategory").value,
            status: document.getElementById("newsStatus").value,
            image: document.getElementById("newsImage").value.trim(),
            excerpt: document.getElementById("newsExcerpt").value.trim(),
            content: document.getElementById("newsContent").value.trim()
        };

        const url = id ? `/api/admin/news/${id}` : "/api/admin/news";
        const method = id ? "PUT" : "POST";

        try {
            const response = await adminRequest(url, {
                method,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                showAdminNewsMessage(result.message || "Failed to save news.");
                return;
            }

            showAdminNewsMessage(result.message, "success");
            resetAdminNewsForm();
            loadAdminNewsList();
        } catch (error) {
            showAdminNewsMessage("Connection error.");
        }
    });
};

const loadAdminNewsList = async () => {
    const list = document.getElementById("adminNewsList");
    if (!list) return;

    list.innerHTML = `<div class="empty-state">Loading news...</div>`;

    try {
        const response = await adminRequest("/api/admin/news");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            list.innerHTML = `<div class="empty-state">No news found.</div>`;
            return;
        }

        list.innerHTML = result.data.map((item) => `
      <div class="admin-list-item">
        <div>
          <strong>${escapeHTML(item.title)}</strong>
          <span>${escapeHTML(item.category)} · ${escapeHTML(item.status)} · ${formatNumber(item.views)} views</span>
        </div>

        <div class="admin-list-actions">
          <button data-edit-news="${item.id}">Edit</button>
          <button data-delete-news="${item.id}">Delete</button>
        </div>
      </div>
    `).join("");
    } catch (error) {
        list.innerHTML = `<div class="empty-state">Failed to load news.</div>`;
    }
};

const editAdminNews = async (id) => {
    try {
        const response = await adminRequest(`/api/admin/news/${id}`);
        const result = await response.json();

        if (!result.success) {
            showAdminNewsMessage(result.message || "Failed to load news.");
            return;
        }

        const item = result.data;

        document.getElementById("newsId").value = item.id;
        document.getElementById("newsTitle").value = item.title || "";
        document.getElementById("newsCategory").value = item.category || "news";
        document.getElementById("newsStatus").value = item.status || "published";
        document.getElementById("newsImage").value = item.image || "";
        document.getElementById("newsExcerpt").value = item.excerpt || "";
        document.getElementById("newsContent").value = item.content || "";
        document.getElementById("newsFormTitle").textContent = "Edit News";

        window.scrollTo(0, 250);
    } catch (error) {
        showAdminNewsMessage("Connection error.");
    }
};

const deleteAdminNews = async (id) => {
    const confirmed = confirm("Delete this news?");
    if (!confirmed) return;

    try {
        const response = await adminRequest(`/api/admin/news/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!result.success) {
            showAdminNewsMessage(result.message || "Failed to delete news.");
            return;
        }

        showAdminNewsMessage(result.message, "success");
        loadAdminNewsList();
    } catch (error) {
        showAdminNewsMessage("Connection error.");
    }
};

document.addEventListener("click", (event) => {
    const editBtn = event.target.closest("[data-edit-news]");
    if (editBtn) {
        editAdminNews(editBtn.dataset.editNews);
        return;
    }

    const deleteBtn = event.target.closest("[data-delete-news]");
    if (deleteBtn) {
        deleteAdminNews(deleteBtn.dataset.deleteNews);
    }
});

const initAdminDownloadsPage = () => {
    initAdminDownloadForm();
    loadAdminDownloadList();
};

const showAdminDownloadMessage = (message, type = "error") => {
    const box = document.getElementById("adminDownloadMessage");
    if (!box) return;

    box.className = `auth-message ${type}`;
    box.textContent = message;
};

const resetAdminDownloadForm = () => {
    document.getElementById("downloadId").value = "";
    document.getElementById("downloadTitle").value = "";
    document.getElementById("downloadType").value = "client";
    document.getElementById("downloadStatus").value = "active";
    document.getElementById("downloadUrl").value = "";
    document.getElementById("downloadSize").value = "";
    document.getElementById("downloadVersion").value = "";
    document.getElementById("downloadSort").value = 0;
    document.getElementById("downloadDescription").value = "";
    document.getElementById("downloadFormTitle").textContent = "Create Download";
};

const initAdminDownloadForm = () => {
    const form = document.getElementById("adminDownloadForm");
    if (!form) return;

    document.getElementById("resetDownloadForm").addEventListener("click", () => {
        resetAdminDownloadForm();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = document.getElementById("downloadId").value;

        const payload = {
            title: document.getElementById("downloadTitle").value.trim(),
            type: document.getElementById("downloadType").value,
            status: document.getElementById("downloadStatus").value,
            file_url: document.getElementById("downloadUrl").value.trim(),
            file_size: document.getElementById("downloadSize").value.trim(),
            version: document.getElementById("downloadVersion").value.trim(),
            sort_order: document.getElementById("downloadSort").value,
            description: document.getElementById("downloadDescription").value.trim()
        };

        const url = id ? `/api/admin/downloads/${id}` : "/api/admin/downloads";
        const method = id ? "PUT" : "POST";

        try {
            const response = await adminRequest(url, {
                method,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                showAdminDownloadMessage(result.message || "Failed to save download.");
                return;
            }

            showAdminDownloadMessage(result.message, "success");
            resetAdminDownloadForm();
            loadAdminDownloadList();
        } catch (error) {
            showAdminDownloadMessage("Connection error.");
        }
    });
};

const loadAdminDownloadList = async () => {
    const list = document.getElementById("adminDownloadList");
    if (!list) return;

    list.innerHTML = `<div class="empty-state">Loading downloads...</div>`;

    try {
        const response = await adminRequest("/api/admin/downloads");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            list.innerHTML = `<div class="empty-state">No downloads found.</div>`;
            return;
        }

        list.innerHTML = result.data.map((item) => `
      <div class="admin-list-item">
        <div>
          <strong>${escapeHTML(item.title)}</strong>
          <span>
            ${escapeHTML(item.type)}
            · ${escapeHTML(item.status)}
            · ${escapeHTML(item.file_size || "Unknown size")}
            · v${escapeHTML(item.version || "-")}
          </span>
        </div>

        <div class="admin-list-actions">
          <button data-edit-download="${item.id}">Edit</button>
          <button data-delete-download="${item.id}">Delete</button>
        </div>
      </div>
    `).join("");
    } catch (error) {
        list.innerHTML = `<div class="empty-state">Failed to load downloads.</div>`;
    }
};

const editAdminDownload = async (id) => {
    try {
        const response = await adminRequest(`/api/admin/downloads/${id}`);
        const result = await response.json();

        if (!result.success) {
            showAdminDownloadMessage(result.message || "Failed to load download.");
            return;
        }

        const item = result.data;

        document.getElementById("downloadId").value = item.id;
        document.getElementById("downloadTitle").value = item.title || "";
        document.getElementById("downloadType").value = item.type || "client";
        document.getElementById("downloadStatus").value = item.status || "active";
        document.getElementById("downloadUrl").value = item.file_url || "";
        document.getElementById("downloadSize").value = item.file_size || "";
        document.getElementById("downloadVersion").value = item.version || "";
        document.getElementById("downloadSort").value = item.sort_order || 0;
        document.getElementById("downloadDescription").value = item.description || "";
        document.getElementById("downloadFormTitle").textContent = "Edit Download";

        window.scrollTo(0, 250);
    } catch (error) {
        showAdminDownloadMessage("Connection error.");
    }
};

const deleteAdminDownload = async (id) => {
    const confirmed = confirm("Delete this download?");
    if (!confirmed) return;

    try {
        const response = await adminRequest(`/api/admin/downloads/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!result.success) {
            showAdminDownloadMessage(result.message || "Failed to delete download.");
            return;
        }

        showAdminDownloadMessage(result.message, "success");
        loadAdminDownloadList();
    } catch (error) {
        showAdminDownloadMessage("Connection error.");
    }
};

document.addEventListener("click", (event) => {
    const editDownloadBtn = event.target.closest("[data-edit-download]");
    if (editDownloadBtn) {
        editAdminDownload(editDownloadBtn.dataset.editDownload);
        return;
    }

    const deleteDownloadBtn = event.target.closest("[data-delete-download]");
    if (deleteDownloadBtn) {
        deleteAdminDownload(deleteDownloadBtn.dataset.deleteDownload);
    }
});

const initAdminStatusPage = () => {
    loadAdminServerStatus();

    const form = document.getElementById("adminStatusForm");
    if (!form) return;

    const fields = form.querySelectorAll("input, select");

    fields.forEach((field) => {
        field.addEventListener("input", updateStatusPreview);
        field.addEventListener("change", updateStatusPreview);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            server_name: document.getElementById("statusServerName").value.trim(),
            login_status: document.getElementById("statusLoginServer").value,
            game_status: document.getElementById("statusGameServer").value,
            online_players: document.getElementById("statusOnlinePlayers").value,
            max_players: document.getElementById("statusMaxPlayers").value,
            server_version: document.getElementById("statusVersion").value.trim(),
            rates_exp: document.getElementById("statusExp").value.trim(),
            rates_drop: document.getElementById("statusDrop").value.trim(),
            rates_kinah: document.getElementById("statusKinah").value.trim()
        };

        try {
            const response = await adminRequest("/api/admin/status", {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            const box = document.getElementById("adminStatusMessage");

            box.className = result.success ? "auth-message success" : "auth-message error";
            box.textContent = result.message || "Failed to update status.";

            if (result.success) {
                loadAdminServerStatus();
            }
        } catch (error) {
            const box = document.getElementById("adminStatusMessage");
            box.className = "auth-message error";
            box.textContent = "Connection error.";
        }
    });
};

const loadAdminServerStatus = async () => {
    try {
        const response = await adminRequest("/api/admin/status");
        const result = await response.json();

        if (!result.success || !result.data) return;

        const data = result.data;

        document.getElementById("statusServerName").value = data.server_name || "";
        document.getElementById("statusLoginServer").value = data.login_status || "offline";
        document.getElementById("statusGameServer").value = data.game_status || "offline";
        document.getElementById("statusOnlinePlayers").value = data.online_players || 0;
        document.getElementById("statusMaxPlayers").value = data.max_players || 5000;
        document.getElementById("statusVersion").value = data.server_version || "4.6";
        document.getElementById("statusExp").value = data.rates_exp || "1x";
        document.getElementById("statusDrop").value = data.rates_drop || "1x";
        document.getElementById("statusKinah").value = data.rates_kinah || "1x";

        updateStatusPreview();
    } catch (error) {
        const box = document.getElementById("adminStatusMessage");
        if (box) {
            box.className = "auth-message error";
            box.textContent = "Failed to load server status.";
        }
    }
};

const updateStatusPreview = () => {
    const serverName = document.getElementById("statusServerName")?.value || "Aion Online";
    const loginStatus = document.getElementById("statusLoginServer")?.value || "offline";
    const gameStatus = document.getElementById("statusGameServer")?.value || "offline";
    const onlinePlayers = document.getElementById("statusOnlinePlayers")?.value || 0;
    const maxPlayers = document.getElementById("statusMaxPlayers")?.value || 5000;
    const exp = document.getElementById("statusExp")?.value || "1x";
    const drop = document.getElementById("statusDrop")?.value || "1x";
    const kinah = document.getElementById("statusKinah")?.value || "1x";

    setText("previewServerName", serverName);
    setText("previewLoginStatus", loginStatus);
    setText("previewGameStatus", gameStatus);
    setText("previewOnlinePlayers", `${formatNumber(onlinePlayers)} / ${formatNumber(maxPlayers)}`);
    setText("previewExp", `EXP ${exp}`);
    setText("previewDrop", `DROP ${drop}`);
    setText("previewKinah", `KINAH ${kinah}`);

    setStatusClass(document.getElementById("previewLoginStatus"), loginStatus);
    setStatusClass(document.getElementById("previewGameStatus"), gameStatus);
};

const loadPlayerProfile = async (playerId) => {
    const box = document.getElementById("playerProfile");
    if (!box) return;

    try {
        const response = await fetch(`/api/players/${playerId}`);
        const result = await response.json();

        if (!result.success) {
            box.innerHTML = `<div class="empty-state">${escapeHTML(result.message)}</div>`;
            return;
        }

        const { player, abyss, legion, kinah } = result.data;

        box.innerHTML = `
      <div class="player-profile-header">
        <div>
          <span class="${Number(player.online) === 1 ? "online-dot" : "offline-dot"}">
            ${Number(player.online) === 1 ? "Online" : "Offline"}
          </span>

          <h2>${escapeHTML(player.name)}</h2>
          <p>
            ${escapeHTML(player.race || "-")}
            ·
            ${escapeHTML(player.player_class || "-")}
            ·
            Level ${escapeHTML(player.level)}
          </p>
        </div>

        <button class="secondary-admin-btn" data-route="/ranking">
          Back to Ranking
        </button>
      </div>

      <div class="account-grid">
        <div class="account-card">
          <h3>Character Info</h3>
          <div class="account-row"><span>Name</span><strong>${escapeHTML(player.name)}</strong></div>
          <div class="account-row"><span>Race</span><strong>${escapeHTML(player.race || "-")}</strong></div>
          <div class="account-row"><span>Class</span><strong>${escapeHTML(player.player_class || "-")}</strong></div>
          <div class="account-row"><span>Gender</span><strong>${escapeHTML(player.gender || "-")}</strong></div>
          <div class="account-row"><span>EXP</span><strong>${formatNumber(player.exp)}</strong></div>
          <div class="account-row"><span>Last Online</span><strong>${escapeHTML(player.last_online || "-")}</strong></div>
        </div>

        <div class="account-card">
          <h3>Abyss / PvP</h3>
          ${abyss
                ? `
                <div class="account-row"><span>AP</span><strong>${formatNumber(abyss.ap)}</strong></div>
                <div class="account-row"><span>Abyss Rank</span><strong>${escapeHTML(abyss.rank || "-")}</strong></div>
                <div class="account-row"><span>Rank Position</span><strong>${escapeHTML(abyss.rank_pos || "-")}</strong></div>
                <div class="account-row"><span>Daily Kill</span><strong>${formatNumber(abyss.daily_kill)}</strong></div>
                <div class="account-row"><span>Weekly Kill</span><strong>${formatNumber(abyss.weekly_kill)}</strong></div>
                <div class="account-row"><span>Total Kill</span><strong>${formatNumber(abyss.all_kill)}</strong></div>
              `
                : `<p class="muted-text">No abyss data found.</p>`
            }
        </div>

        <div class="account-card">
          <h3>Legion</h3>
          ${legion
                ? `
                <div class="account-row"><span>Legion</span><strong>${escapeHTML(legion.name)}</strong></div>
                <div class="account-row"><span>Level</span><strong>${escapeHTML(legion.level)}</strong></div>
                <div class="account-row"><span>Contribution</span><strong>${formatNumber(legion.contribution_points)}</strong></div>
                <div class="account-row"><span>Member Rank</span><strong>${escapeHTML(legion.member_rank || "-")}</strong></div>
              `
                : `<p class="muted-text">No legion joined.</p>`
            }
        </div>

        <div class="account-card">
          <h3>Wealth</h3>
          <div class="account-row"><span>Kinah</span><strong>${formatNumber(kinah)}</strong></div>
        </div>
      </div>
    `;
    } catch (error) {
        box.innerHTML = `<div class="empty-state">Failed to load player profile.</div>`;
    }
};

const loadAdminUsers = async () => {
    const box = document.getElementById("adminUsersList");
    if (!box) return;

    box.innerHTML = `
    <h3>Users List</h3>
    <div class="empty-state">Loading users...</div>
  `;

    try {
        const response = await adminRequest("/api/admin/users");
        const result = await response.json();

        if (!result.success) {
            box.innerHTML = `
        <h3>Users List</h3>
        <div class="empty-state">${escapeHTML(result.message || "Failed to load users.")}</div>
      `;
            return;
        }

        if (!result.data.length) {
            box.innerHTML = `
        <h3>Users List</h3>
        <div class="empty-state">No users found.</div>
      `;
            return;
        }

        box.innerHTML = `
      <h3>Users List</h3>

      <div class="admin-users-table">
        ${result.data.map((user) => `
          <div class="admin-user-row">
            <div class="admin-user-info">
              <strong>${escapeHTML(user.username)}</strong>
              <span>${escapeHTML(user.email)}</span>
              <small>
                Role: ${escapeHTML(user.role)}
                · Status: ${escapeHTML(user.status)}
                · Coins: ${formatNumber(user.donate_coin || 0)}
                · Joined: ${escapeHTML(user.created_at || "-")}
              </small>
            </div>

            <div class="admin-user-controls">
              <select data-user-role="${user.id}">
                <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
              </select>

              <select data-user-status="${user.id}">
                <option value="active" ${user.status === "active" ? "selected" : ""}>Active</option>
                <option value="banned" ${user.status === "banned" ? "selected" : ""}>Banned</option>
                <option value="pending" ${user.status === "pending" ? "selected" : ""}>Pending</option>
              </select>

              <button data-coin-user="${user.id}">Coins</button>

              <button data-save-user="${user.id}">Save</button>
              <button data-reset-user="${user.id}">Reset Password</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div id="adminUsersMessage"></div>
    `;
    } catch (error) {
        console.error("Load users error:", error);

        box.innerHTML = `
      <h3>Users List</h3>
      <div class="empty-state">Failed to load users. Check console/API.</div>
    `;
    }
};

const showAdminUsersMessage = (message, type = "error") => {
    const box = document.getElementById("adminUsersMessage");
    if (!box) return;

    box.className = `auth-message ${type}`;
    box.textContent = message;
};

const saveAdminUser = async (id) => {
    const role = document.querySelector(`[data-user-role="${id}"]`)?.value;
    const status = document.querySelector(`[data-user-status="${id}"]`)?.value;

    try {
        const response = await adminRequest(`/api/admin/users/${id}`, {
            method: "PUT",
            body: JSON.stringify({ role, status })
        });

        const result = await response.json();

        if (!result.success) {
            showAdminUsersMessage(result.message || "Failed to update user.");
            return;
        }

        showAdminUsersMessage(result.message, "success");
        loadAdminUsers();
    } catch (error) {
        showAdminUsersMessage("Connection error.");
    }
};

const resetAdminUserPassword = async (id) => {
    const password = prompt("Enter new password for this user:");

    if (!password) return;

    if (password.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
    }

    try {
        const response = await adminRequest(`/api/admin/users/${id}/reset-password`, {
            method: "POST",
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (!result.success) {
            showAdminUsersMessage(result.message || "Failed to reset password.");
            return;
        }

        showAdminUsersMessage(result.message, "success");
    } catch (error) {
        showAdminUsersMessage("Connection error.");
    }
};

document.addEventListener("click", (event) => {
    const saveBtn = event.target.closest("[data-save-user]");
    if (saveBtn) {
        saveAdminUser(saveBtn.dataset.saveUser);
        return;
    }

    const resetBtn = event.target.closest("[data-reset-user]");
    if (resetBtn) {
        resetAdminUserPassword(resetBtn.dataset.resetUser);
    }
});

let websiteSettings = {};

const loadWebsiteSettings = async () => {
    try {
        const response = await fetch(API.settings);
        const result = await response.json();

        if (!result.success) return;

        websiteSettings = result.data || {};

        applyWebsiteSettings();
    } catch (error) {
        console.error("Failed to load website settings:", error);
    }
};

const setting = (key, fallback = "") => {
    return websiteSettings[key] || fallback;
};

const hexToRgb = (hex) => {
    const clean = String(hex || "").replace("#", "");

    if (clean.length !== 6) return "212, 175, 55";

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
};

const setCssVar = (name, value) => {
    document.documentElement.style.setProperty(name, value);
};

const setMeta = (selector, attr, value) => {
    let meta = document.querySelector(selector);

    if (!meta) {
        meta = document.createElement("meta");

        if (selector.includes("property=")) {
            meta.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
        } else {
            meta.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
        }

        document.head.appendChild(meta);
    }

    meta.setAttribute(attr, value);
};

const setFavicon = (url) => {
    if (!url) return;

    let icon = document.querySelector('link[rel="icon"]');

    if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
    }

    icon.href = url;
};

const applyWebsiteSettings = () => {
    document.title = setting("site_name", "Aion Online");

    const primary = setting("primary_color", "#d4af37");
    const secondary = setting("secondary_color", "#f4d56f");

    setCssVar("--primary-color", primary);
    setCssVar("--primary-rgb", hexToRgb(primary));

    setCssVar("--secondary-color", secondary);
    setCssVar("--secondary-rgb", hexToRgb(secondary));

    setCssVar("--background-color", setting("background_color", "#05070d"));
    setCssVar("--background-soft", setting("background_soft", "#080b13"));
    setCssVar("--text-color", setting("text_color", "#ffffff"));
    setCssVar("--muted-color", setting("muted_color", "#b8bdc9"));

    setCssVar("--success-color", setting("success_color", "#86efac"));
    setCssVar("--danger-color", setting("danger_color", "#fca5a5"));
    setCssVar("--warning-color", setting("warning_color", "#facc15"));

    setCssVar("--navbar-bg", setting("navbar_bg", "rgba(5, 7, 13, 0.85)"));
    setCssVar("--navbar-border", setting("navbar_border", "rgba(255, 255, 255, 0.08)"));
    setCssVar("--nav-link-color", setting("nav_link_color", "#cfd3dc"));

    setCssVar("--card-bg", setting("card_bg", "rgba(255,255,255,0.055)"));
    setCssVar("--glass-bg", setting("glass_bg", "rgba(255,255,255,0.07)"));
    setCssVar("--dark-glass-bg", setting("dark_glass_bg", "rgba(0,0,0,0.25)"));
    setCssVar("--border-color", setting("border_color", "rgba(255,255,255,0.10)"));
    setCssVar("--border-soft", setting("border_soft", "rgba(255,255,255,0.08)"));
    setCssVar("--shadow-color", setting("shadow_color", "rgba(0,0,0,0.35)"));

    setCssVar("--card-radius", setting("card_radius", "24px"));
    setCssVar("--button-radius", setting("button_radius", "14px"));
    setCssVar("--pill-radius", setting("pill_radius", "999px"));

    setCssVar("--navbar-height", setting("navbar_height", "78px"));
    setCssVar("--section-padding", setting("section_padding", "90px 60px"));
    setCssVar("--container-width", setting("container_width", "1200px"));

    setCssVar("--hero-overlay-dark", setting("hero_overlay_dark", "rgba(5,7,13,0.98)"));
    setCssVar("--hero-overlay-soft", setting("hero_overlay_soft", "rgba(5,7,13,0.65)"));
    setCssVar("--hero-glow-opacity", setting("hero_glow_opacity", "0.22"));

    setCssVar("--success-bg", setting("success_bg", "rgba(74,222,128,0.12)"));
    setCssVar("--danger-bg", setting("danger_bg", "rgba(248,113,113,0.12)"));
    setCssVar("--warning-bg", setting("warning_bg", "rgba(250,204,21,0.12)"));

    const heroBg = setting("hero_background_image", "");
    const pageBg = setting("page_background_image", "");

    setCssVar("--hero-bg-image", heroBg ? `url("${heroBg}")` : "none");
    setCssVar("--page-bg-image", pageBg ? `url("${pageBg}")` : "none");

    const logoImage = setting("logo_image", "");

    document.title = setting("seo_title", setting("site_name", "Aion Online"));

    setMeta('meta[name="description"]', "content", setting("seo_description", ""));
    setMeta('meta[name="keywords"]', "content", setting("seo_keywords", ""));
    setMeta('meta[name="author"]', "content", setting("seo_author", ""));
    setMeta('meta[name="robots"]', "content", setting("seo_robots", "index,follow"));

    setMeta('meta[property="og:title"]', "content", setting("seo_og_title", setting("seo_title", "")));
    setMeta('meta[property="og:description"]', "content", setting("seo_og_description", setting("seo_description", "")));
    setMeta('meta[property="og:type"]', "content", "website");
    setMeta('meta[property="og:image"]', "content", setting("seo_og_image", ""));

    setFavicon(setting("favicon_image", ""));

    document.querySelectorAll("[data-logo]").forEach((logo) => {
        if (logoImage) {
            logo.innerHTML = `<img src="${escapeHTML(logoImage)}" alt="Logo" class="site-logo-img">`;
        } else {
            logo.textContent = setting("logo_text", "AIONONLINE");
        }
    });

    document.querySelectorAll("[data-setting]").forEach((element) => {
        const key = element.dataset.setting;
        const fallback = element.dataset.fallback || "";
        element.textContent = setting(key, fallback);
    });

    document.querySelectorAll("[data-section-toggle]").forEach((element) => {
        const key = element.dataset.sectionToggle;
        const value = setting(key, "1");

        element.style.display = String(value) === "0" ? "none" : "";
    });

    document.querySelectorAll("[data-social-link]").forEach((link) => {
        const key = link.dataset.socialLink;
        const url = setting(key, "");

        if (!url) {
            link.style.display = "none";
            return;
        }

        link.style.display = "";
        link.href = url;
    });

    document.querySelectorAll("[data-footer-link]").forEach((link) => {
        const index = link.dataset.footerLink;

        const label = setting(`footer_link_${index}_label`, link.textContent.trim());
        const url = setting(`footer_link_${index}_url`, link.getAttribute("href") || "");

        if (!label || !url) {
            link.style.display = "";
            return;
        }

        link.textContent = label;
        link.href = url;

        if (url.startsWith("/")) {
            link.setAttribute("data-route", url);
        } else {
            link.removeAttribute("data-route");
            link.target = "_blank";
        }

        link.style.display = "";
    });

    updateImagePreviews();
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadWebsiteSettings();
    renderRoute();
});

const initAdminSettingsPage = () => {
    loadAdminSettings();
    loadSavedThemePresets();

    const exportAllBtn = document.getElementById("exportAllSettingsBtn");
    const importAllInput = document.getElementById("importAllSettingsInput");

    if (exportAllBtn) {
        exportAllBtn.onclick = exportAllSettingsJson;
    }

    if (importAllInput) {
        importAllInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) importAllSettingsJson(file);
        };
    }

    setTimeout(() => {
        const exportBtn = document.getElementById("exportThemeBtn");
        const importInput = document.getElementById("importThemeInput");
        const savePresetBtn = document.getElementById("saveThemePresetBtn");
        const reloadBtn = document.getElementById("reloadSettingsBtn");

        if (reloadBtn) {
            reloadBtn.onclick = reloadWebsiteSettings;
        }

        if (exportBtn) {
            exportBtn.onclick = exportThemeJson;
        }

        if (importInput) {
            importInput.onchange = (event) => {
                const file = event.target.files[0];
                if (file) importThemeJson(file);
            };
        }

        if (savePresetBtn) {
            savePresetBtn.onclick = saveCurrentThemePreset;
        }

        if (exportBtn) exportBtn.onclick = () => exportThemeJson(exportBtn);
        if (savePresetBtn) savePresetBtn.onclick = () => saveCurrentThemePreset(savePresetBtn);
        if (reloadBtn) reloadBtn.onclick = () => reloadWebsiteSettings(reloadBtn);

    }, 300);
};

const settingLabels = {
    site_name: "Site Name",
    logo_text: "Logo Text",
    primary_color: "Primary Color",
    secondary_color: "Secondary Color",
    background_color: "Background Color",
    background_soft: "Soft Background Color",
    navbar_bg: "Navbar Background",
    navbar_border: "Navbar Border",
    nav_link_color: "Navbar Link Color",
    text_color: "Text Color",
    muted_color: "Muted Text Color",
    border_color: "Border Color",
    card_bg_color: "Card Background Color",
    glass_bg_color: "Glass Background Color",
    dark_glass_bg_color: "Dark Glass Background Color",
    success_color: "Success / Online Color",
    danger_color: "Danger / Offline Color",
    warning_color: "Warning / Maintenance Color",
    hero_title: "Hero Title",
    hero_subtitle: "Hero Subtitle",
    hero_description: "Hero Description",
    play_button_text: "Play Button Text",
    download_button_text: "Download Button Text",
    discord_url: "Discord URL",
    facebook_url: "Facebook URL",
    card_bg: "Card Background",
    glass_bg: "Glass Background",
    dark_glass_bg: "Dark Glass Background",
    border_color: "Border Color",
    border_soft: "Soft Border Color",
    shadow_color: "Shadow Color",

    card_radius: "Card Radius",
    button_radius: "Button Radius",
    pill_radius: "Pill Radius",

    navbar_height: "Navbar Height",
    section_padding: "Section Padding",
    container_width: "Container Width",

    hero_overlay_dark: "Hero Overlay Dark",
    hero_overlay_soft: "Hero Overlay Soft",
    hero_glow_opacity: "Hero Glow Opacity",

    success_bg: "Success Background",
    danger_bg: "Danger Background",
    warning_bg: "Warning Background",

    show_server_status: "Show Server Status",
    show_home_news: "Show Home News",
    show_home_ranking: "Show Home Ranking",
    show_home_download: "Show Home Download",

    home_news_subtitle: "Home News Subtitle",
    home_news_title: "Home News Title",

    home_ranking_subtitle: "Home Ranking Subtitle",
    home_ranking_title: "Home Ranking Title",

    home_download_subtitle: "Home Download Subtitle",
    home_download_title: "Home Download Title",

    seo_title: "SEO Title",
    seo_description: "SEO Description",
    seo_keywords: "SEO Keywords",
    seo_author: "SEO Author",
    seo_robots: "SEO Robots",
    seo_og_title: "Open Graph Title",
    seo_og_description: "Open Graph Description",
    seo_og_image: "Open Graph Image",
    favicon_image: "Favicon Image",

    footer_text: "Footer Copyright Text",
    footer_description: "Footer Description",
    footer_show_socials: "Show Footer Social Links",
    footer_show_quick_links: "Show Footer Quick Links",

    youtube_url: "YouTube URL",
    instagram_url: "Instagram URL",
    tiktok_url: "TikTok URL",

    footer_link_1_label: "Footer Link 1 Label",
    footer_link_1_url: "Footer Link 1 URL",
    footer_link_2_label: "Footer Link 2 Label",
    footer_link_2_url: "Footer Link 2 URL",
    footer_link_3_label: "Footer Link 3 Label",
    footer_link_3_url: "Footer Link 3 URL",
    footer_link_4_label: "Footer Link 4 Label",
    footer_link_4_url: "Footer Link 4 URL",
};

const defaultThemeSettings = {
    primary_color: "#d4af37",
    secondary_color: "#f4d56f",
    background_color: "#05070d",
    background_soft: "#080b13",
    text_color: "#ffffff",
    muted_color: "#b8bdc9",

    navbar_bg: "rgba(5, 7, 13, 0.85)",
    navbar_border: "rgba(255,255,255,0.08)",
    nav_link_color: "#cfd3dc",

    success_color: "#86efac",
    danger_color: "#fca5a5",
    warning_color: "#facc15",

    logo_text: "AIONONLINE",
    hero_title: "Enter The World of Aion Online",
    hero_subtitle: "The Eternal War Begins",
    hero_description:
        "Experience a premium MMORPG server with balanced gameplay, competitive rankings, epic PvP, powerful characters, and a modern community system.",

    play_button_text: "Play Now",
    download_button_text: "Download Client"
};

const themePresets = {
    gold: {
        primary_color: "#d4af37",
        secondary_color: "#f4d56f",
        background_color: "#05070d",
        background_soft: "#080b13",

        text_color: "#ffffff",
        muted_color: "#b8bdc9",

        navbar_bg: "rgba(5,7,13,0.88)",
        navbar_border: "rgba(255,255,255,0.08)",
        nav_link_color: "#d7dce6",

        card_bg: "rgba(255,255,255,0.055)",
        glass_bg: "rgba(255,255,255,0.07)",
        dark_glass_bg: "rgba(0,0,0,0.25)",

        border_color: "rgba(255,255,255,0.10)",
        border_soft: "rgba(255,255,255,0.08)",

        shadow_color: "rgba(0,0,0,0.35)",

        card_radius: "24px",
        button_radius: "14px",
        pill_radius: "999px",

        navbar_height: "78px",
        section_padding: "90px 60px",
        container_width: "1200px",

        hero_overlay_dark: "rgba(5,7,13,0.82)",
        hero_overlay_soft: "rgba(5,7,13,0.45)",
        hero_glow_opacity: "0.22",

        success_color: "#86efac",
        danger_color: "#fca5a5",
        warning_color: "#facc15",

        success_bg: "rgba(74,222,128,0.12)",
        danger_bg: "rgba(248,113,113,0.12)",
        warning_bg: "rgba(250,204,21,0.12)"
    },

    blue: {
        primary_color: "#3b82f6",
        secondary_color: "#60a5fa",
        background_color: "#050816",
        background_soft: "#0b1022",

        text_color: "#ffffff",
        muted_color: "#b8c6e4",

        navbar_bg: "rgba(5,8,22,0.88)",
        navbar_border: "rgba(255,255,255,0.08)",
        nav_link_color: "#d6e4ff",

        card_bg: "rgba(59,130,246,0.08)",
        glass_bg: "rgba(96,165,250,0.08)",
        dark_glass_bg: "rgba(5,8,22,0.45)",

        border_color: "rgba(96,165,250,0.18)",
        border_soft: "rgba(96,165,250,0.10)",

        shadow_color: "rgba(37,99,235,0.28)",

        card_radius: "24px",
        button_radius: "14px",
        pill_radius: "999px",

        navbar_height: "78px",
        section_padding: "90px 60px",
        container_width: "1200px",

        hero_overlay_dark: "rgba(5,8,22,0.78)",
        hero_overlay_soft: "rgba(5,8,22,0.42)",
        hero_glow_opacity: "0.25",

        success_color: "#86efac",
        danger_color: "#fca5a5",
        warning_color: "#facc15",

        success_bg: "rgba(74,222,128,0.12)",
        danger_bg: "rgba(248,113,113,0.12)",
        warning_bg: "rgba(250,204,21,0.12)"
    },

    purple: {
        primary_color: "#a855f7",
        secondary_color: "#c084fc",
        background_color: "#0c0618",
        background_soft: "#140b24",

        text_color: "#ffffff",
        muted_color: "#d5c2ef",

        navbar_bg: "rgba(12,6,24,0.88)",
        navbar_border: "rgba(255,255,255,0.08)",
        nav_link_color: "#f1e5ff",

        card_bg: "rgba(168,85,247,0.08)",
        glass_bg: "rgba(192,132,252,0.08)",
        dark_glass_bg: "rgba(12,6,24,0.45)",

        border_color: "rgba(192,132,252,0.18)",
        border_soft: "rgba(192,132,252,0.10)",

        shadow_color: "rgba(168,85,247,0.30)",

        card_radius: "24px",
        button_radius: "14px",
        pill_radius: "999px",

        navbar_height: "78px",
        section_padding: "90px 60px",
        container_width: "1200px",

        hero_overlay_dark: "rgba(12,6,24,0.80)",
        hero_overlay_soft: "rgba(12,6,24,0.42)",
        hero_glow_opacity: "0.24",

        success_color: "#86efac",
        danger_color: "#fca5a5",
        warning_color: "#facc15",

        success_bg: "rgba(74,222,128,0.12)",
        danger_bg: "rgba(248,113,113,0.12)",
        warning_bg: "rgba(250,204,21,0.12)"
    },

    red: {
        primary_color: "#ef4444",
        secondary_color: "#f87171",
        background_color: "#120607",
        background_soft: "#1b090b",

        text_color: "#ffffff",
        muted_color: "#e7c1c1",

        navbar_bg: "rgba(18,6,7,0.88)",
        navbar_border: "rgba(255,255,255,0.08)",
        nav_link_color: "#ffe4e4",

        card_bg: "rgba(239,68,68,0.08)",
        glass_bg: "rgba(248,113,113,0.08)",
        dark_glass_bg: "rgba(18,6,7,0.45)",

        border_color: "rgba(248,113,113,0.18)",
        border_soft: "rgba(248,113,113,0.10)",

        shadow_color: "rgba(220,38,38,0.28)",

        card_radius: "24px",
        button_radius: "14px",
        pill_radius: "999px",

        navbar_height: "78px",
        section_padding: "90px 60px",
        container_width: "1200px",

        hero_overlay_dark: "rgba(18,6,7,0.80)",
        hero_overlay_soft: "rgba(18,6,7,0.42)",
        hero_glow_opacity: "0.23",

        success_color: "#86efac",
        danger_color: "#fca5a5",
        warning_color: "#facc15",

        success_bg: "rgba(74,222,128,0.12)",
        danger_bg: "rgba(248,113,113,0.12)",
        warning_bg: "rgba(250,204,21,0.12)"
    },

    green: {
        primary_color: "#22c55e",
        secondary_color: "#4ade80",
        background_color: "#06120c",
        background_soft: "#0a1b12",

        text_color: "#ffffff",
        muted_color: "#bddcc7",

        navbar_bg: "rgba(6,18,12,0.88)",
        navbar_border: "rgba(255,255,255,0.08)",
        nav_link_color: "#e2ffe9",

        card_bg: "rgba(34,197,94,0.08)",
        glass_bg: "rgba(74,222,128,0.08)",
        dark_glass_bg: "rgba(6,18,12,0.45)",

        border_color: "rgba(74,222,128,0.18)",
        border_soft: "rgba(74,222,128,0.10)",

        shadow_color: "rgba(22,163,74,0.30)",

        card_radius: "24px",
        button_radius: "14px",
        pill_radius: "999px",

        navbar_height: "78px",
        section_padding: "90px 60px",
        container_width: "1200px",

        hero_overlay_dark: "rgba(6,18,12,0.80)",
        hero_overlay_soft: "rgba(6,18,12,0.42)",
        hero_glow_opacity: "0.22",

        success_color: "#86efac",
        danger_color: "#fca5a5",
        warning_color: "#facc15",

        success_bg: "rgba(74,222,128,0.12)",
        danger_bg: "rgba(248,113,113,0.12)",
        warning_bg: "rgba(250,204,21,0.12)"
    }
};

const settingPanelMap = {
    branding: [
        "site_name",
        "logo_text"
    ],

    theme: [
        "primary_color",
        "secondary_color",
        "background_color",
        "background_soft",
        "text_color",
        "muted_color",
        "navbar_bg",
        "navbar_border",
        "nav_link_color",
        "success_color",
        "danger_color",
        "warning_color"
    ],

    homepage: [
        "hero_title",
        "hero_subtitle",
        "hero_description",
        "play_button_text",
        "download_button_text",
        "show_server_status",
        "show_home_news",
        "show_home_ranking",
        "show_home_download",
        "home_news_subtitle",
        "home_news_title",
        "home_ranking_subtitle",
        "home_ranking_title",
        "home_download_subtitle",
        "home_download_title"
    ],

    images: [
        "logo_image",
        "hero_background_image",
        "page_background_image"
    ],

    seo: [
        "seo_title",
        "seo_description",
        "seo_keywords",
        "seo_author",
        "seo_robots",
        "seo_og_title",
        "seo_og_description",
        "seo_og_image",
        "favicon_image"
    ],

    footer: [
        "footer_text",
        "footer_description",
        "footer_show_socials",
        "footer_show_quick_links",
        "discord_url",
        "facebook_url",
        "youtube_url",
        "instagram_url",
        "tiktok_url",
        "footer_link_1_label",
        "footer_link_1_url",
        "footer_link_2_label",
        "footer_link_2_url",
        "footer_link_3_label",
        "footer_link_3_url",
        "footer_link_4_label",
        "footer_link_4_url"
    ],

    advanced: [
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
        "success_bg",
        "danger_bg",
        "warning_bg"
    ]
};

const getSettingPanelName = (settingKey) => {
    for (const panel of Object.keys(settingPanelMap)) {
        if (settingPanelMap[panel].includes(settingKey)) {
            return panel;
        }
    }

    return "advanced";
};

const getPanelElement = (panel) => {
    const idMap = {
        branding: "settingsPanelBranding",
        theme: "settingsPanelTheme",
        homepage: "settingsPanelHomepage",
        images: "settingsPanelImages",
        seo: "settingsPanelSeo",
        footer: "settingsPanelFooter",
        advanced: "settingsPanelAdvanced"
    };

    return document.getElementById(idMap[panel]);
};

const loadAdminSettings = async () => {
    const panels = [
        "settingsPanelBranding",
        "settingsPanelTheme",
        "settingsPanelHomepage",
        "settingsPanelImages",
        "settingsPanelSeo",
        "settingsPanelFooter",
        "settingsPanelAdvanced"
    ];

    panels.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<div class="empty-state">Loading settings...</div>`;
    });

    try {
        const response = await adminRequest("/api/settings/admin/all");
        const result = await response.json();

        if (!result.success) {
            panels.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = `<div class="empty-state">${escapeHTML(result.message)}</div>`;
            });
            return;
        }

        const grouped = {
            branding: [],
            theme: [],
            homepage: [],
            images: [],
            seo: [],
            footer: [],
            advanced: []
        };

        result.data.forEach((item) => {
            const panel = getSettingPanelName(item.setting_key);
            grouped[panel].push(item);
        });

        Object.keys(grouped).forEach((panel) => {
            const panelElement = getPanelElement(panel);
            if (!panelElement) return;

            if (!grouped[panel].length) {
                panelElement.innerHTML = `<div class="empty-state">No settings in this section.</div>`;
                return;
            }

            panelElement.innerHTML = grouped[panel]
                .map((item) => renderSettingInput(item))
                .join("");
        });

        initSettingsPreviewEvents();
        updateSettingsPreview();

        const form = document.getElementById("adminSettingsForm");
        if (form) form.onsubmit = saveAdminSettings;
    } catch (error) {
        console.error("Load settings error:", error);

        panels.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<div class="empty-state">Failed to load settings.</div>`;
        });
    }
};

const renderSettingInput = (item) => {
    const label = settingLabels[item.setting_key] || item.setting_key;
    const value = item.setting_value || "";

    if (
        item.setting_key.startsWith("show_") ||
        item.setting_key.startsWith("footer_show_")
    ) {
        return `
            <label class="settings-field">
                <span>${escapeHTML(label)}</span>

                <select data-setting-input="${escapeHTML(item.setting_key)}">
                    <option value="1" ${String(value) === "1" ? "selected" : ""}>Show</option>
                    <option value="0" ${String(value) === "0" ? "selected" : ""}>Hide</option>
                </select>
            </label>
        `;
    }

    if (item.setting_key.includes("color")) {
        const colorValue = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value)
            ? value
            : "#ffffff";

        return `
            <label class="settings-field">
                <span>${escapeHTML(label)}</span>

                <div class="color-input-group">
                    <input
                        type="color"
                        value="${escapeHTML(colorValue)}"
                        data-color-sync="${escapeHTML(item.setting_key)}"
                    />

                    <input
                        type="text"
                        value="${escapeHTML(value)}"
                        data-setting-input="${escapeHTML(item.setting_key)}"
                        placeholder="#ffffff"
                    />
                </div>
            </label>
        `;
    }

    if (item.setting_type === "textarea") {
        return `
            <label class="settings-field">
                <span>${escapeHTML(label)}</span>

                <textarea
                    rows="4"
                    data-setting-input="${escapeHTML(item.setting_key)}"
                >${escapeHTML(value)}</textarea>
            </label>
        `;
    }

    const inputType = item.setting_type === "url" ? "url" : "text";

    return `
        <label class="settings-field">
            <span>${escapeHTML(label)}</span>

            <input
                type="${inputType}"
                value="${escapeHTML(value)}"
                data-setting-input="${escapeHTML(item.setting_key)}"
            />
        </label>
    `;
};

const initSettingsPreviewEvents = () => {
    document.querySelectorAll("[data-setting-input]").forEach((input) => {
        input.addEventListener("input", updateSettingsPreview);
    });
};

const getSettingInputValue = (key, fallback = "") => {
    const input = document.querySelector(`[data-setting-input="${key}"]`);
    return input ? input.value : fallback;
};

const updateSettingsPreview = () => {
    const primary = getSettingInputValue("primary_color", "#d4af37");
    const secondary = getSettingInputValue("secondary_color", "#f4d56f");
    const background = getSettingInputValue("background_color", "#05070d");
    const backgroundSoft = getSettingInputValue("background_soft", "#080b13");
    const textColor = getSettingInputValue("text_color", "#ffffff");
    const mutedColor = getSettingInputValue("muted_color", "#b8bdc9");

    document.documentElement.style.setProperty("--primary-color", primary);
    document.documentElement.style.setProperty("--secondary-color", secondary);
    document.documentElement.style.setProperty("--background-color", background);
    document.documentElement.style.setProperty("--background-soft", backgroundSoft);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--muted-color", mutedColor);
    document.documentElement.style.setProperty("--primary-rgb", hexToRgb(primary));
    document.documentElement.style.setProperty("--secondary-rgb", hexToRgb(secondary));

    setText("previewLogo", getSettingInputValue("logo_text", "AIONONLINE"));
    setText("previewSubtitle", getSettingInputValue("hero_subtitle", "The Eternal War Begins"));
    setText("previewTitle", getSettingInputValue("hero_title", "Enter The World of Aion Online"));
    setText("previewDescription", getSettingInputValue("hero_description", "Experience a premium MMORPG server."));
    setText("previewPlayBtn", getSettingInputValue("play_button_text", "Play Now"));
    setText("previewDownloadBtn", getSettingInputValue("download_button_text", "Download Client"));

    setCssVar("--card-bg", getSettingInputValue("card_bg", "rgba(255,255,255,0.055)"));
    setCssVar("--glass-bg", getSettingInputValue("glass_bg", "rgba(255,255,255,0.07)"));
    setCssVar("--dark-glass-bg", getSettingInputValue("dark_glass_bg", "rgba(0,0,0,0.25)"));
    setCssVar("--border-color", getSettingInputValue("border_color", "rgba(255,255,255,0.10)"));
    setCssVar("--border-soft", getSettingInputValue("border_soft", "rgba(255,255,255,0.08)"));
    setCssVar("--shadow-color", getSettingInputValue("shadow_color", "rgba(0,0,0,0.35)"));

    setCssVar("--card-radius", getSettingInputValue("card_radius", "24px"));
    setCssVar("--button-radius", getSettingInputValue("button_radius", "14px"));
    setCssVar("--pill-radius", getSettingInputValue("pill_radius", "999px"));

    setCssVar("--navbar-height", getSettingInputValue("navbar_height", "78px"));
    setCssVar("--section-padding", getSettingInputValue("section_padding", "90px 60px"));
    setCssVar("--container-width", getSettingInputValue("container_width", "1200px"));

    setCssVar("--hero-overlay-dark", getSettingInputValue("hero_overlay_dark", "rgba(5,7,13,0.98)"));
    setCssVar("--hero-overlay-soft", getSettingInputValue("hero_overlay_soft", "rgba(5,7,13,0.65)"));
    setCssVar("--hero-glow-opacity", getSettingInputValue("hero_glow_opacity", "0.22"));

    setCssVar("--success-bg", getSettingInputValue("success_bg", "rgba(74,222,128,0.12)"));
    setCssVar("--danger-bg", getSettingInputValue("danger_bg", "rgba(248,113,113,0.12)"));
    setCssVar("--warning-bg", getSettingInputValue("warning_bg", "rgba(250,204,21,0.12)"));
};

const saveAdminSettings = async (event) => {
    event.preventDefault();

    const submitBtn = event.submitter || document.querySelector("#adminSettingsForm .auth-btn");

    if (!validateSettingsForm()) {
        showAdminMessage(
            "adminSettingsMessage",
            "Please fix validation errors before saving.",
            "error"
        );
        return;
    }

    setButtonLoading(submitBtn, true, "Saving...");

    const payload = { settings: {} };

    document.querySelectorAll("[data-setting-input]").forEach((input) => {
        payload.settings[input.dataset.settingInput] = input.value;
    });

    try {
        const response = await adminRequest("/api/settings/admin/all", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        showAdminMessage(
            "adminSettingsMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            await loadWebsiteSettings();
            applyWebsiteSettings();
            updateSettingsPreview();
            updateImagePreviews();
        }
    } catch {
        showAdminMessage("adminSettingsMessage", "Connection error.", "error");
    } finally {
        setButtonLoading(submitBtn, false);
    }
};

const resetDefaultTheme = () => {
    Object.keys(defaultThemeSettings).forEach((key) => {
        const input = document.querySelector(
            `[data-setting-input="${key}"]`
        );

        if (input) {
            input.value = defaultThemeSettings[key];
        }
    });

    updateSettingsPreview();

    const box = document.getElementById("adminSettingsMessage");

    if (box) {
        box.className = "auth-message success";
        box.textContent =
            "Default theme loaded. Click Save Settings to apply.";
    }
};

const applyThemePreset = (presetName, button = null) => {
    const preset = themePresets[presetName];

    if (!preset) return;

    setButtonLoading(button, true, "Applying...");

    Object.keys(preset).forEach((key) => {
        const input = document.querySelector(`[data-setting-input="${key}"]`);

        if (input) input.value = preset[key];
    });

    updateSettingsPreview();

    showAdminMessage(
        "adminSettingsMessage",
        `${presetName.toUpperCase()} preset loaded. Click Save Settings to apply.`,
        "success"
    );

    setButtonLoading(button, false);
};

document.addEventListener("click", (event) => {
    const presetBtn = event.target.closest("[data-theme-preset]");

    if (!presetBtn) return;

    applyThemePreset(presetBtn.dataset.themePreset, presetBtn);
});

const getCurrentThemeFromInputs = () => {
    const theme = {};

    document.querySelectorAll("[data-setting-input]").forEach((input) => {
        theme[input.dataset.settingInput] = input.value;
    });

    return theme;
};

const downloadJson = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
};

const exportThemeJson = async (button = null) => {
    setButtonLoading(button, true, "Exporting...");

    try {
        const response = await adminRequest("/api/settings/admin/theme/export");
        const result = await response.json();

        if (!result.success) {
            showAdminMessage("adminSettingsMessage", result.message || "Failed to export theme.", "error");
            return;
        }

        downloadJson("aion-theme.json", result.data);
        showAdminMessage("adminSettingsMessage", "Theme exported successfully.", "success");
    } catch {
        showAdminMessage("adminSettingsMessage", "Export failed.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const importThemeJson = async (file) => {
    try {
        const text = await file.text();
        const json = JSON.parse(text);

        const theme = json.theme || json;

        const response = await adminRequest("/api/settings/admin/theme/import", {
            method: "POST",
            body: JSON.stringify({ theme })
        });

        const result = await response.json();

        const box = document.getElementById("adminSettingsMessage");
        box.className = result.success ? "auth-message success" : "auth-message error";
        box.textContent = result.message;

        if (result.success) {
            await loadWebsiteSettings();
            await loadAdminSettings();
            await reloadWebsiteSettings();
        }
    } catch {
        alert("Invalid JSON theme file.");
    }
};

const saveCurrentThemePreset = async (button = null) => {
    const name = prompt("Theme preset name:");
    if (!name) return;

    setButtonLoading(button, true, "Saving...");

    const theme = getCurrentThemeFromInputs();

    try {
        const response = await adminRequest("/api/settings/admin/theme/presets", {
            method: "POST",
            body: JSON.stringify({ name, theme })
        });

        const result = await response.json();

        showAdminMessage(
            "adminSettingsMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) loadSavedThemePresets();
    } catch {
        showAdminMessage("adminSettingsMessage", "Failed to save preset.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const loadSavedThemePresets = async () => {
    const box = document.getElementById("savedThemePresets");
    if (!box) return;

    try {
        const response = await adminRequest("/api/settings/admin/theme/presets");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No saved presets.</div>`;
            return;
        }

        box.innerHTML = result.data.map((preset) => `
      <div class="admin-list-item">
        <div>
          <strong>${escapeHTML(preset.name)}</strong>
          <span>${escapeHTML(preset.created_at || "-")}</span>
        </div>

        <div class="admin-list-actions">
          <button data-apply-saved-theme="${preset.id}">Apply</button>
          <button data-delete-saved-theme="${preset.id}">Delete</button>
        </div>
      </div>
    `).join("");
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load presets.</div>`;
    }
};

const applySavedThemePreset = async (id, button = null) => {
    setButtonLoading(button, true, "Applying...");

    try {
        const response = await adminRequest(`/api/settings/admin/theme/presets/${id}/apply`, {
            method: "POST"
        });

        const result = await response.json();

        showAdminMessage(
            "adminSettingsMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            await reloadWebsiteSettings();
        }
    } catch {
        showAdminMessage("adminSettingsMessage", "Failed to apply preset.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const deleteSavedThemePreset = async (id, button = null) => {
    if (!confirm("Delete this saved theme preset?")) return;

    setButtonLoading(button, true, "Deleting...");

    try {
        const response = await adminRequest(`/api/settings/admin/theme/presets/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        showAdminMessage(
            "adminSettingsMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            loadSavedThemePresets();
        }
    } catch {
        showAdminMessage("adminSettingsMessage", "Failed to delete preset.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

document.addEventListener("click", (event) => {
    const applyBtn = event.target.closest("[data-apply-saved-theme]");
    if (applyBtn) {
        applySavedThemePreset(
            applySavedThemeBtn.dataset.applySavedTheme,
            applySavedThemeBtn
        );
        return;
    }

    const deleteBtn = event.target.closest("[data-delete-saved-theme]");
    if (deleteBtn) {
        deleteSavedThemePreset(
            deleteSavedThemeBtn.dataset.deleteSavedTheme,
            deleteSavedThemeBtn
        );
    }
});

const deleteSettingImage = async (key, button = null) => {
    if (!confirm("Delete this image?")) return;

    setButtonLoading(button, true, "Deleting...");

    try {
        const response = await fetch("/api/settings/admin/delete-image", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ key })
        });

        const result = await response.json();

        showAdminMessage(
            "adminSettingsMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            await reloadWebsiteSettings();
        }
    } catch {
        showAdminMessage("adminSettingsMessage", "Failed to delete image.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const updateImagePreviews = () => {
    const imageKeys = [
        "logo_image",
        "hero_background_image",
        "page_background_image",
        "seo_og_image",
        "favicon_image"
    ];

    imageKeys.forEach((key) => {
        const box = document.getElementById(`preview_${key}`);
        if (!box) return;

        const imageUrl = setting(key, "");

        if (!imageUrl) {
            box.innerHTML = `<span>No image</span>`;
            return;
        }

        box.innerHTML = `
            <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(key)}" />
            <small>${escapeHTML(imageUrl)}</small>
        `;
    });
};

const reloadWebsiteSettings = async (button = null) => {
    setButtonLoading(button, true, "Reloading...");

    try {
        await loadWebsiteSettings();
        await loadAdminSettings();

        applyWebsiteSettings();
        updateSettingsPreview();
        updateImagePreviews();

        showAdminMessage(
            "adminSettingsMessage",
            "Website settings reloaded successfully.",
            "success"
        );
    } catch (error) {
        console.error(error);
        showAdminMessage("adminSettingsMessage", "Failed to reload settings.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const exportAllSettingsJson = async () => {
    try {
        const response = await adminRequest("/api/settings/admin/backup/export");
        const result = await response.json();

        if (!result.success) {
            alert(result.message || "Failed to export settings backup.");
            return;
        }

        downloadJson("aion-settings-backup.json", result.data);
    } catch {
        alert("Export settings failed.");
    }
};

const importAllSettingsJson = async (file) => {
    if (!confirm("Restore all settings from this backup? Current settings may be overwritten.")) {
        return;
    }

    try {
        const text = await file.text();
        const json = JSON.parse(text);

        const settings = json.settings || json;

        const response = await adminRequest("/api/settings/admin/backup/import", {
            method: "POST",
            body: JSON.stringify({ settings })
        });

        const result = await response.json();

        const box = document.getElementById("adminSettingsMessage");
        box.className = result.success ? "auth-message success" : "auth-message error";
        box.textContent = result.message;

        if (result.success) {
            await reloadWebsiteSettings();
        }
    } catch {
        alert("Invalid settings backup file.");
    }
};

const isValidHexColor = (value) => {
    return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value);
};

const isValidUrl = (value) => {
    const url = String(value || "").trim();

    if (!url) return true;

    // Allow internal route
    if (url.startsWith("/")) return true;

    // Allow anchor
    if (url.startsWith("#")) return true;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const showFieldError = (input, message) => {
    input.classList.add("settings-error");

    let error = input.parentElement.querySelector(".settings-error-text");

    if (!error) {
        error = document.createElement("small");
        error.className = "settings-error-text";
        input.parentElement.appendChild(error);
    }

    error.textContent = message;
};

const clearFieldError = (input) => {
    input.classList.remove("settings-error");

    const error = input.parentElement.querySelector(".settings-error-text");

    if (error) {
        error.remove();
    }
};

const validateSettingsForm = () => {
    let valid = true;

    document
        .querySelectorAll(".settings-tab-panel.active [data-setting-input]")
        .forEach((input) => {
            clearFieldError(input);

            const key = input.dataset.settingInput;
            const value = String(input.value || "").trim();

            // REQUIRED
            if (
                [
                    "site_name",
                    "hero_title",
                    "seo_title"
                ].includes(key)
            ) {
                if (!value) {
                    valid = false;
                    showFieldError(input, "This field is required.");
                    return;
                }
            }

            // COLOR VALIDATION
            if (
                key.includes("color") &&
                value &&
                !value.startsWith("rgba") &&
                !isValidHexColor(value)
            ) {
                valid = false;
                showFieldError(
                    input,
                    "Invalid color format. Example: #ffffff"
                );
                return;
            }

            // URL VALIDATION
            if (
                (
                    key.includes("_url") ||
                    key.includes("discord") ||
                    key.includes("facebook") ||
                    key.includes("youtube") ||
                    key.includes("instagram") ||
                    key.includes("tiktok")
                ) &&
                value &&
                !isValidUrl(value)
            ) {
                valid = false;

                showFieldError(
                    input,
                    "Invalid URL format."
                );

                return;
            }

            // SEO DESCRIPTION
            if (
                key === "seo_description" &&
                value.length > 160
            ) {
                valid = false;

                showFieldError(
                    input,
                    "SEO description should be below 160 characters."
                );

                return;
            }

            // HERO TITLE
            if (
                key === "hero_title" &&
                value.length > 80
            ) {
                valid = false;

                showFieldError(
                    input,
                    "Hero title is too long."
                );

                return;
            }
        });

    return valid;
};

document.addEventListener("input", (event) => {
    const input = event.target.closest("[data-setting-input]");
    if (!input) return;

    clearFieldError(input);

    validateSettingsForm();
});

let shopItemsCache = [];
let activeShopCategory = "";

const initShopPage = async () => {
    await loadShopAccountInfo();
    await loadShopCategories();
    await loadShopItems();
    await loadMyShopOrders();

    const refreshOrdersBtn = document.getElementById("refreshShopOrdersBtn");
    if (refreshOrdersBtn) {
        refreshOrdersBtn.onclick = () => loadMyShopOrders(refreshOrdersBtn);
    }

    const searchInput = document.getElementById("shopSearchInput");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderShopItems();
        });
    }
};

const loadShopAccountInfo = async () => {
    const balanceBox = document.getElementById("shopCoinBalance");
    const characterSelect = document.getElementById("shopCharacterSelect");

    if (!balanceBox || !characterSelect) return;

    const token = getAuthToken();

    if (!token) {
        balanceBox.textContent = "Login Required";
        characterSelect.innerHTML = `<option value="">Please login first</option>`;
        return;
    }

    try {
        const response = await fetch("/api/account/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            balanceBox.textContent = "0 Coins";
            characterSelect.innerHTML = `<option value="">Failed to load characters</option>`;
            return;
        }

        const profile = result.data.profile;
        const characters = result.data.characters || [];

        balanceBox.textContent = `${formatNumber(profile.donate_coin || 0)} Coins`;

        if (!characters.length) {
            characterSelect.innerHTML = `<option value="">No character found</option>`;
            return;
        }

        characterSelect.innerHTML = `
            <option value="">Choose character</option>
            ${characters.map((char) => `
                <option value="${escapeHTML(char.id)}">
                    ${escapeHTML(char.name)} · Lv.${escapeHTML(char.level)} · ${escapeHTML(char.player_class || "-")}
                </option>
            `).join("")}
        `;
    } catch (error) {
        balanceBox.textContent = "0 Coins";
        characterSelect.innerHTML = `<option value="">Failed to load characters</option>`;
    }
};

const loadShopCategories = async () => {
    const box = document.getElementById("shopCategories");
    if (!box) return;

    try {
        const response = await fetch(API.shopCategories);
        const result = await response.json();

        if (!result.success) return;

        box.innerHTML = `
            <button class="active" data-shop-category="">
                <span class="shop-category-icon">🛒</span>
                <span>All Items</span>
            </button>

            ${result.data.map((category) => `
                <button data-shop-category="${escapeHTML(category.slug)}">

                    ${category.icon
                ? `
                                <div class="shop-category-image">
                                    <img src="${escapeHTML(category.icon)}" alt="${escapeHTML(category.name)}" />
                                </div>
                            `
                : `
                                <div class="shop-category-image">
                                    <span>${escapeHTML(String(category.name || "?").slice(0, 1))}</span>
                                </div>
                            `
            }

                    <span>${escapeHTML(category.name)}</span>
                </button>
            `).join("")}
        `;
    } catch (error) {
        box.innerHTML = `<button class="active" data-shop-category="">All Items</button>`;
    }
};

const loadShopItems = async () => {
    const grid = document.getElementById("shopItemsGrid");
    if (!grid) return;

    grid.innerHTML = `<div class="empty-state">Loading shop items...</div>`;

    try {
        const response = await fetch(API.shopItems);
        const result = await response.json();

        if (!result.success || !result.data.length) {
            grid.innerHTML = `<div class="empty-state">No shop items available.</div>`;
            return;
        }

        shopItemsCache = result.data;
        renderShopItems();
    } catch (error) {
        grid.innerHTML = `<div class="empty-state">Failed to load shop items.</div>`;
    }
};

const renderShopItems = () => {
    const grid = document.getElementById("shopItemsGrid");
    const searchInput = document.getElementById("shopSearchInput");
    if (!grid) return;

    const keyword = (searchInput?.value || "").toLowerCase().trim();

    let items = shopItemsCache;

    if (activeShopCategory) {
        items = items.filter((item) => item.category_slug === activeShopCategory);
    }

    if (keyword) {
        items = items.filter((item) =>
            String(item.item_name || "").toLowerCase().includes(keyword) ||
            String(item.item_description || "").toLowerCase().includes(keyword) ||
            String(item.category_name || "").toLowerCase().includes(keyword)
        );
    }

    const title = document.getElementById("shopTitle");
    if (title) {
        title.textContent = activeShopCategory
            ? activeShopCategory.replaceAll("-", " ").toUpperCase()
            : "All Items";
    }

    if (!items.length) {
        grid.innerHTML = `<div class="empty-state">No items found.</div>`;
        return;
    }

    grid.innerHTML = items.map((item) => `
        <article class="shop-item-card">
          <div class="shop-item-top">
            <div class="shop-item-icon">
              ${item.item_icon
            ? `<img src="${escapeHTML(item.item_icon)}" alt="${escapeHTML(item.item_name)}">`
            : `<span>${escapeHTML(String(item.item_name || "?").slice(0, 1))}</span>`
        }
            </div>

            <div class="shop-item-badge">
              ${escapeHTML(item.category_name || "Item")}
            </div>
          </div>

          <div class="shop-item-content">
            <h3>${escapeHTML(item.item_name)}</h3>
            <p>${escapeHTML(item.item_description || "Premium shop item.")}</p>
          </div>

          <div class="shop-item-meta">
            <span>Item ID</span>
            <strong>${escapeHTML(item.item_id)}</strong>
          </div>

          <div class="shop-item-meta">
            <span>Amount</span>
            <strong>x${formatNumber(item.item_count)}</strong>
          </div>

          <div class="shop-item-footer">
            <div>
              <span>Price</span>
              <strong>${formatNumber(item.price_coin)} Coins</strong>
            </div>

            <button type="button" data-buy-shop-item="${item.id}">
              Buy Item
            </button>
          </div>
        </article>
    `).join("");
};

document.addEventListener("click", (event) => {
    const deleteSettingImageBtn = event.target.closest("[data-delete-setting-image]");

    if (deleteSettingImageBtn) {
        deleteSettingImage(
            deleteSettingImageBtn.dataset.deleteSettingImage,
            deleteSettingImageBtn
        );

        return;
    }
});

document.addEventListener("input", (event) => {
    const picker = event.target.closest("[data-color-sync]");
    if (!picker) return;

    const key = picker.dataset.colorSync;

    const textInput = document.querySelector(
        `[data-setting-input="${key}"]`
    );

    if (textInput) {
        textInput.value = picker.value;
        updateSettingsPreview();
    }
});

const loadAdminLogs = async () => {
    const box = document.getElementById("adminLogsList");
    if (!box) return;

    try {
        const response = await adminRequest("/api/admin/logs");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No activity logs found.</div>`;
            return;
        }

        box.innerHTML = `
      <div class="admin-logs-list">
        ${result.data.map((log) => `
          <div class="admin-log-item">
            <div>
              <strong>${escapeHTML(log.action)}</strong>
              <p>${escapeHTML(log.description || "-")}</p>
              <span>
                ${escapeHTML(log.admin_username || "Unknown Admin")}
                · ${escapeHTML(log.ip_address || "-")}
                · ${escapeHTML(log.created_at || "-")}
              </span>
            </div>

            <small>
              ${escapeHTML(log.target_type || "-")}
              ${log.target_id ? `#${escapeHTML(log.target_id)}` : ""}
            </small>
          </div>
        `).join("")}
      </div>
    `;
    } catch (error) {
        box.innerHTML = `<div class="empty-state">Failed to load logs.</div>`;
    }
};

const setButtonLoading = (button, isLoading, loadingText = "Loading...") => {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.classList.add("is-loading");
        button.textContent = loadingText;
        return;
    }

    button.disabled = false;
    button.classList.remove("is-loading");

    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
    }
};

const showAdminMessage = (boxId, message, type = "error") => {
    const box = document.getElementById(boxId);
    if (!box) return;

    box.className = `auth-message ${type}`;
    box.textContent = message;
};

document.addEventListener("click", (event) => {
    const shopCategoryBtn = event.target.closest("[data-shop-category]");
    if (shopCategoryBtn) {
        activeShopCategory = shopCategoryBtn.dataset.shopCategory || "";

        document.querySelectorAll("[data-shop-category]").forEach((btn) => {
            btn.classList.toggle("active", btn === shopCategoryBtn);
        });

        renderShopItems();
        return;
    }

    const buyShopItemBtn = event.target.closest("[data-buy-shop-item]");
    if (buyShopItemBtn) {
        buyShopItem(
            buyShopItemBtn.dataset.buyShopItem,
            buyShopItemBtn
        );
        return;
    }

    const editShopCategoryBtn = event.target.closest("[data-edit-shop-category]");
    if (editShopCategoryBtn) {
        editAdminShopCategory(editShopCategoryBtn.dataset.editShopCategory);
        return;
    }

    const deleteShopCategoryBtn = event.target.closest("[data-delete-shop-category]");
    if (deleteShopCategoryBtn) {
        deleteAdminShopCategory(
            deleteShopCategoryBtn.dataset.deleteShopCategory,
            deleteShopCategoryBtn
        );
        return;
    }

    const editShopItemBtn = event.target.closest("[data-edit-shop-item]");
    if (editShopItemBtn) {
        editAdminShopItem(editShopItemBtn.dataset.editShopItem);
        return;
    }

    const deleteShopItemBtn = event.target.closest("[data-delete-shop-item]");
    if (deleteShopItemBtn) {
        deleteAdminShopItem(
            deleteShopItemBtn.dataset.deleteShopItem,
            deleteShopItemBtn
        );
        return;
    }

    const coinUserBtn = event.target.closest("[data-coin-user]");
    if (coinUserBtn) {
        updateAdminUserCoin(coinUserBtn.dataset.coinUser, coinUserBtn);
        return;
    }

    const retryShopQueueBtn = event.target.closest("[data-retry-shop-queue]");
    if (retryShopQueueBtn) {
        retryShopQueue(
            retryShopQueueBtn.dataset.retryShopQueue,
            retryShopQueueBtn
        );
        return;
    }

    const refundShopOrderBtn = event.target.closest("[data-refund-shop-order]");
    if (refundShopOrderBtn) {
        refundShopOrder(
            refundShopOrderBtn.dataset.refundShopOrder,
            refundShopOrderBtn
        );
        return;
    }

    const shopTabBtn = event.target.closest("[data-open-shop-tab]");
    if (shopTabBtn) {
        openAdminShopTab(shopTabBtn.dataset.openShopTab);
        return;
    }

    const claimVoteBtn = event.target.closest("[data-claim-vote]");
    if (claimVoteBtn) {
        claimVoteReward(claimVoteBtn.dataset.claimVote, claimVoteBtn);
        return;
    }

    const startVoteBtn = event.target.closest("[data-start-vote]");
    if (startVoteBtn) {
        startVote(startVoteBtn.dataset.startVote, startVoteBtn);
        return;
    }

    const editVoteSiteBtn = event.target.closest("[data-edit-vote-site]");
    if (editVoteSiteBtn) {
        editAdminVoteSite(editVoteSiteBtn.dataset.editVoteSite);
        return;
    }

    const deleteVoteSiteBtn = event.target.closest("[data-delete-vote-site]");
    if (deleteVoteSiteBtn) {
        deleteAdminVoteSite(
            deleteVoteSiteBtn.dataset.deleteVoteSite,
            deleteVoteSiteBtn
        );
        return;
    }
});

const buyShopItem = async (shopItemId, button = null) => {
    const characterId = document.getElementById("shopCharacterSelect")?.value;

    if (!getAuthToken()) {
        alert("Please login first.");
        navigateTo("/login");
        return;
    }

    if (!characterId) {
        alert("Please select a character first.");
        return;
    }

    if (!confirm("Buy this item using your donate coins?")) {
        return;
    }

    setButtonLoading(button, true, "Buying...");

    try {
        const response = await fetch("/api/shop/buy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                shop_item_id: shopItemId,
                player_id: characterId
            })
        });

        const result = await response.json();

        alert(result.message || "Purchase completed.");

        if (result.success) {
            await loadShopAccountInfo();
            await loadMyShopOrders();
        }
    } catch (error) {
        alert("Failed to buy item.");
    } finally {
        setButtonLoading(button, false);
    }
};

let adminShopCategoriesCache = [];
let adminShopItemsCache = [];

const initAdminShopPage = () => {
    initAdminShopCategoryForm();
    initAdminShopItemForm();

    loadAdminShopCategories();
    loadAdminShopItems();
    loadAdminShopOrders();
    loadAdminShopQueue();

    initAdminShopPolish();
    loadRecentCoinLogs();
};

const showAdminShopMessage = (boxId, message, type = "error") => {
    showAdminMessage(boxId, message, type);
};

/* =========================
   CATEGORY
========================= */

const resetAdminShopCategoryForm = () => {
    document.getElementById("shopCategoryId").value = "";
    document.getElementById("shopCategoryName").value = "";
    document.getElementById("shopCategorySlug").value = "";
    document.getElementById("shopCategoryIcon").value = "";
    document.getElementById("shopCategorySort").value = 0;
    document.getElementById("shopCategoryStatus").value = "active";
    document.getElementById("shopCategoryDescription").value = "";
    document.getElementById("shopCategoryFormTitle").textContent = "Create Category";
};

const initAdminShopCategoryForm = () => {
    const form = document.getElementById("adminShopCategoryForm");
    if (!form) return;

    const resetBtn = document.getElementById("resetShopCategoryForm");
    if (resetBtn) resetBtn.onclick = resetAdminShopCategoryForm;

    form.onsubmit = async (event) => {
        event.preventDefault();

        const submitBtn = event.submitter;
        setButtonLoading(submitBtn, true, "Saving...");

        const id = document.getElementById("shopCategoryId").value;

        const payload = {
            name: document.getElementById("shopCategoryName").value.trim(),
            slug: document.getElementById("shopCategorySlug").value.trim(),
            icon: document.getElementById("shopCategoryIcon").value.trim(),
            sort_order: document.getElementById("shopCategorySort").value || 0,
            status: document.getElementById("shopCategoryStatus").value,
            description: document.getElementById("shopCategoryDescription").value.trim()
        };

        const url = id
            ? `/api/admin/shop/categories/${id}`
            : "/api/admin/shop/categories";

        const method = id ? "PUT" : "POST";

        try {
            const response = await adminRequest(url, {
                method,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            showAdminShopMessage(
                "adminShopCategoryMessage",
                result.message,
                result.success ? "success" : "error"
            );

            if (result.success) {
                resetAdminShopCategoryForm();
                await loadAdminShopCategories();
                await loadAdminShopItems();
            }
        } catch {
            showAdminShopMessage("adminShopCategoryMessage", "Connection error.");
        } finally {
            setButtonLoading(submitBtn, false);
        }
    };
};

const loadAdminShopCategories = async () => {
    const list = document.getElementById("adminShopCategoriesList");
    const itemCategorySelect = document.getElementById("shopItemCategory");

    if (list) list.innerHTML = `<div class="empty-state">Loading categories...</div>`;

    try {
        const response = await adminRequest("/api/admin/shop/categories");
        const result = await response.json();

        if (!result.success) {
            if (list) list.innerHTML = `<div class="empty-state">${escapeHTML(result.message)}</div>`;
            return;
        }

        adminShopCategoriesCache = result.data || [];

        if (itemCategorySelect) {
            itemCategorySelect.innerHTML = adminShopCategoriesCache.length
                ? `
                    <option value="">Choose Category</option>
                    ${adminShopCategoriesCache.map((cat) => `
                        <option value="${cat.id}">
                            ${escapeHTML(cat.name)} (${escapeHTML(cat.status)})
                        </option>
                    `).join("")}
                `
                : `<option value="">No categories available</option>`;
        }

        const categoryFilter = document.getElementById("adminShopCategoryFilter");

        if (categoryFilter) {
            categoryFilter.innerHTML = `
        <option value="">All Categories</option>
        ${adminShopCategoriesCache.map((cat) => `
            <option value="${cat.id}">${escapeHTML(cat.name)}</option>
        `).join("")}
    `;
        }

        if (!list) return;

        if (!adminShopCategoriesCache.length) {
            list.innerHTML = `<div class="empty-state">No categories found.</div>`;
            return;
        }

        list.innerHTML = adminShopCategoriesCache.map((cat) => `
            <div class="admin-list-item">
                <div>
                    <strong>${escapeHTML(cat.name)}</strong>
                    <span>
                        ${escapeHTML(cat.slug)}
                        · ${escapeHTML(cat.status)}
                        · Sort ${escapeHTML(cat.sort_order)}
                    </span>
                </div>

                <div class="admin-list-actions">
                    <button data-edit-shop-category="${cat.id}">Edit</button>
                    <button data-delete-shop-category="${cat.id}">Delete</button>
                </div>
            </div>
        `).join("");
    } catch {
        if (list) list.innerHTML = `<div class="empty-state">Failed to load categories.</div>`;
    }
};

const editAdminShopCategory = (id) => {
    const cat = adminShopCategoriesCache.find((item) => Number(item.id) === Number(id));
    if (!cat) return;

    document.getElementById("shopCategoryId").value = cat.id;
    document.getElementById("shopCategoryName").value = cat.name || "";
    document.getElementById("shopCategorySlug").value = cat.slug || "";
    document.getElementById("shopCategoryIcon").value = cat.icon || "";
    document.getElementById("shopCategorySort").value = cat.sort_order || 0;
    document.getElementById("shopCategoryStatus").value = cat.status || "active";
    document.getElementById("shopCategoryDescription").value = cat.description || "";
    document.getElementById("shopCategoryFormTitle").textContent = "Edit Category";

    window.scrollTo(0, 250);
};

const deleteAdminShopCategory = async (id, button = null) => {
    if (!confirm("Delete this shop category?")) return;

    setButtonLoading(button, true, "Deleting...");

    try {
        const response = await adminRequest(`/api/admin/shop/categories/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        showAdminShopMessage(
            "adminShopCategoryMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            await loadAdminShopCategories();
        }
    } catch {
        showAdminShopMessage("adminShopCategoryMessage", "Connection error.");
    } finally {
        setButtonLoading(button, false);
    }
};

/* =========================
   ITEMS
========================= */

const resetAdminShopItemForm = () => {
    document.getElementById("shopItemId").value = "";
    document.getElementById("shopItemCategory").value = "";
    document.getElementById("shopItemGameId").value = "";
    document.getElementById("shopItemName").value = "";
    document.getElementById("shopItemIcon").value = "";
    document.getElementById("shopItemCount").value = 1;
    document.getElementById("shopItemPrice").value = 0;
    document.getElementById("shopItemLimit").value = 0;
    document.getElementById("shopItemSort").value = 0;
    document.getElementById("shopItemStatus").value = "active";
    document.getElementById("shopItemDescription").value = "";
    document.getElementById("shopItemFormTitle").textContent = "Create Shop Item";
};

const initAdminShopItemForm = () => {
    const form = document.getElementById("adminShopItemForm");
    if (!form) return;

    const resetBtn = document.getElementById("resetShopItemForm");
    if (resetBtn) resetBtn.onclick = resetAdminShopItemForm;

    form.onsubmit = async (event) => {
        event.preventDefault();

        const submitBtn = event.submitter;
        setButtonLoading(submitBtn, true, "Saving...");

        const id = document.getElementById("shopItemId").value;

        const payload = {
            category_id: document.getElementById("shopItemCategory").value,
            item_id: document.getElementById("shopItemGameId").value,
            item_name: document.getElementById("shopItemName").value.trim(),
            item_icon: document.getElementById("shopItemIcon").value.trim(),
            item_count: document.getElementById("shopItemCount").value || 1,
            price_coin: document.getElementById("shopItemPrice").value || 0,
            buy_limit: document.getElementById("shopItemLimit").value || 0,
            sort_order: document.getElementById("shopItemSort").value || 0,
            status: document.getElementById("shopItemStatus").value,
            item_description: document.getElementById("shopItemDescription").value.trim()
        };

        const url = id
            ? `/api/admin/shop/items/${id}`
            : "/api/admin/shop/items";

        const method = id ? "PUT" : "POST";

        try {
            const response = await adminRequest(url, {
                method,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            showAdminShopMessage(
                "adminShopItemMessage",
                result.message,
                result.success ? "success" : "error"
            );

            if (result.success) {
                resetAdminShopItemForm();
                await loadAdminShopItems();
            }
        } catch {
            showAdminShopMessage("adminShopItemMessage", "Connection error.");
        } finally {
            setButtonLoading(submitBtn, false);
        }
    };
};

const loadAdminShopItems = async () => {
    const list = document.getElementById("adminShopItemsList");
    if (!list) return;

    list.innerHTML = `<div class="empty-state">Loading items...</div>`;

    try {
        const response = await adminRequest("/api/admin/shop/items");
        const result = await response.json();

        if (!result.success) {
            list.innerHTML = `<div class="empty-state">${escapeHTML(result.message)}</div>`;
            return;
        }

        adminShopItemsCache = result.data || [];

        renderAdminShopItemsList();
    } catch {
        list.innerHTML = `<div class="empty-state">Failed to load shop items.</div>`;
    }
};

const editAdminShopItem = (id) => {
    const item = adminShopItemsCache.find((row) => Number(row.id) === Number(id));
    if (!item) return;

    document.getElementById("shopItemId").value = item.id;
    document.getElementById("shopItemCategory").value = item.category_id || "";
    document.getElementById("shopItemGameId").value = item.item_id || "";
    document.getElementById("shopItemName").value = item.item_name || "";
    document.getElementById("shopItemIcon").value = item.item_icon || "";
    document.getElementById("shopItemCount").value = item.item_count || 1;
    document.getElementById("shopItemPrice").value = item.price_coin || 0;
    document.getElementById("shopItemLimit").value = item.buy_limit || 0;
    document.getElementById("shopItemSort").value = item.sort_order || 0;
    document.getElementById("shopItemStatus").value = item.status || "active";
    document.getElementById("shopItemDescription").value = item.item_description || "";
    document.getElementById("shopItemFormTitle").textContent = "Edit Shop Item";

    window.scrollTo(0, 700);
};

const deleteAdminShopItem = async (id, button = null) => {
    if (!confirm("Delete this shop item?")) return;

    setButtonLoading(button, true, "Deleting...");

    try {
        const response = await adminRequest(`/api/admin/shop/items/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        showAdminShopMessage(
            "adminShopItemMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            await loadAdminShopItems();
        }
    } catch {
        showAdminShopMessage("adminShopItemMessage", "Connection error.");
    } finally {
        setButtonLoading(button, false);
    }
};

/* =========================
   ORDERS & QUEUE
========================= */

const loadAdminShopOrders = async () => {
    const box = document.getElementById("adminShopOrdersList");
    if (!box) return;

    try {
        const response = await adminRequest("/api/admin/shop/orders");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No shop orders found.</div>`;
            return;
        }

        box.innerHTML = `
            <div class="admin-shop-table">
                ${result.data.map((order) => `
                <div class="admin-shop-table-row">
                    <strong>#${order.id} · ${escapeHTML(order.item_name)}</strong>

                    <span>
                    ${escapeHTML(order.username)}
                    → ${escapeHTML(order.player_name)}
                    · x${formatNumber(order.item_count)}
                    · ${formatNumber(order.price_coin)} Coins
                    · ${escapeHTML(order.status)}
                    </span>

                    <small>${escapeHTML(order.created_at || "-")}</small>

                    <div class="admin-list-actions">
                    ${order.status !== "refunded"
                ? `<button data-refund-shop-order="${order.id}">Refund</button>`
                : `<button disabled>Refunded</button>`
            }
                    </div>
                </div>
                `).join("")}
            </div>
            `;
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load shop orders.</div>`;
    }
};

const loadAdminShopQueue = async () => {
    const box = document.getElementById("adminShopQueueList");
    if (!box) return;

    try {
        const response = await adminRequest("/api/admin/shop/queue");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No delivery queue found.</div>`;
            return;
        }

        box.innerHTML = `
        <div class="admin-shop-table">
            ${result.data.map((queue) => `
            <div class="admin-shop-table-row">
                <strong>#${queue.id} · ${escapeHTML(queue.item_name)}</strong>

                <span>
                ${escapeHTML(queue.player_name)}
                · Item ${escapeHTML(queue.item_id)}
                · x${formatNumber(queue.item_count)}
                · ${escapeHTML(queue.status)}
                </span>

                <small>${escapeHTML(queue.created_at || "-")}</small>

                <div class="admin-list-actions">
                ${queue.status !== "sent"
                ? `<button data-retry-shop-queue="${queue.id}">Retry</button>`
                : `<button disabled>Sent</button>`
            }
                </div>
            </div>
            `).join("")}
        </div>
        `;
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load delivery queue.</div>`;
    }
};

const loadMyShopOrders = async (button = null) => {
    const box = document.getElementById("shopOrderHistory");
    if (!box) return;

    if (!getAuthToken()) {
        box.innerHTML = `
            <div class="empty-state">
                Login to view your purchase history.
            </div>
        `;
        return;
    }

    setButtonLoading(button, true, "Refreshing...");

    try {
        const response = await fetch(API.shopMyOrders, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No purchase history found.</div>`;
            return;
        }

        box.innerHTML = `
            <div class="shop-history-list">
                ${result.data.map((order) => `
                    <div class="shop-history-item">
                        <div>
                            <strong>#${order.id} · ${escapeHTML(order.item_name)}</strong>
                            <p>
                                Sent to ${escapeHTML(order.player_name)}
                                · Item ${escapeHTML(order.item_id)}
                                · x${formatNumber(order.item_count)}
                            </p>
                            <span>${escapeHTML(order.created_at || "-")}</span>
                        </div>

                        <div class="shop-history-status">
                            <b>${formatNumber(order.price_coin)} Coins</b>
                            <em class="shop-status-${escapeHTML(order.delivery_status || order.status)}">
                                ${escapeHTML(order.delivery_status || order.status)}
                            </em>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load order history.</div>`;
    } finally {
        setButtonLoading(button, false);
    }
};

const updateAdminUserCoin = async (id, button = null) => {
    const type = prompt("Type: add or subtract", "add");
    if (!type || !["add", "subtract"].includes(type)) {
        alert("Invalid type.");
        return;
    }

    const amount = Number(prompt("Coin amount:", "1000"));
    if (!amount || amount <= 0) {
        alert("Invalid amount.");
        return;
    }

    const note = prompt("Note:", "Manual coin adjustment by admin") || "";

    setButtonLoading(button, true, "Updating...");

    try {
        const response = await adminRequest(`/api/admin/users/${id}/coins`, {
            method: "POST",
            body: JSON.stringify({ type, amount, note })
        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {
            loadAdminUsers();
        }
    } catch {
        alert("Failed to update coins.");
    } finally {
        setButtonLoading(button, false);
    }
};

const uploadShopIconFile = async (inputId, targetInputId, button = null) => {
    const input = document.getElementById(inputId);

    if (!input || !input.files.length) {
        alert("Please select an icon image first.");
        return;
    }

    const formData = new FormData();
    formData.append("image", input.files[0]);

    setButtonLoading(button, true, "Uploading...");

    try {
        const response = await fetch("/api/admin/shop/upload-icon", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message || "Upload failed.");
            return;
        }

        const target = document.getElementById(targetInputId);
        if (target) {
            target.value = result.url;
            target.dispatchEvent(new Event("input"));
        }

        input.value = "";
        alert("Icon uploaded successfully.");
    } catch {
        alert("Failed to upload icon.");
    } finally {
        setButtonLoading(button, false);
    }
};

const updateShopItemPreview = () => {
    const icon = document.getElementById("shopItemIcon")?.value || "";
    const name = document.getElementById("shopItemName")?.value || "Item Name";
    const gameId = document.getElementById("shopItemGameId")?.value || "0";
    const count = document.getElementById("shopItemCount")?.value || "1";
    const price = document.getElementById("shopItemPrice")?.value || "0";
    const desc = document.getElementById("shopItemDescription")?.value || "Item description preview.";

    const categorySelect = document.getElementById("shopItemCategory");
    const categoryText =
        categorySelect?.selectedOptions?.[0]?.textContent?.trim() || "Category";

    const iconBox = document.getElementById("previewShopItemIcon");

    if (iconBox) {
        iconBox.innerHTML = icon
            ? `<img src="${escapeHTML(icon)}" alt="${escapeHTML(name)}" />`
            : `<span>${escapeHTML(name.slice(0, 1) || "?")}</span>`;
    }

    setText("previewShopItemName", name);
    setText("previewShopItemGameId", gameId);
    setText("previewShopItemCount", `x${formatNumber(count)}`);
    setText("previewShopItemPrice", `${formatNumber(price)} Coins`);
    setText("previewShopItemDescription", desc);
    setText("previewShopItemCategory", categoryText.replace(/\(.+\)/, "").trim());
};

const initAdminShopPolish = () => {
    const itemIconBtn = document.getElementById("uploadShopItemIconBtn");
    const categoryIconBtn = document.getElementById("uploadShopCategoryIconBtn");

    if (itemIconBtn) {
        itemIconBtn.onclick = () => uploadShopIconFile(
            "shopItemIconUpload",
            "shopItemIcon",
            itemIconBtn
        );
    }

    if (categoryIconBtn) {
        categoryIconBtn.onclick = () => uploadShopIconFile(
            "shopCategoryIconUpload",
            "shopCategoryIcon",
            categoryIconBtn
        );
    }

    [
        "shopItemIcon",
        "shopItemName",
        "shopItemGameId",
        "shopItemCount",
        "shopItemPrice",
        "shopItemDescription",
        "shopItemCategory"
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", updateShopItemPreview);
            el.addEventListener("change", updateShopItemPreview);
        }
    });

    const search = document.getElementById("adminShopSearchInput");
    const category = document.getElementById("adminShopCategoryFilter");
    const status = document.getElementById("adminShopStatusFilter");

    [search, category, status].forEach((el) => {
        if (el) el.addEventListener("input", renderAdminShopItemsList);
        if (el) el.addEventListener("change", renderAdminShopItemsList);
    });

    updateShopItemPreview();
};

const renderAdminShopItemsList = () => {
    const list = document.getElementById("adminShopItemsList");
    if (!list) return;

    const keyword = document.getElementById("adminShopSearchInput")?.value?.toLowerCase().trim() || "";
    const categoryId = document.getElementById("adminShopCategoryFilter")?.value || "";
    const status = document.getElementById("adminShopStatusFilter")?.value || "";

    let items = [...adminShopItemsCache];

    if (keyword) {
        items = items.filter((item) =>
            String(item.item_name || "").toLowerCase().includes(keyword) ||
            String(item.item_id || "").includes(keyword)
        );
    }

    if (categoryId) {
        items = items.filter((item) => String(item.category_id) === String(categoryId));
    }

    if (status) {
        items = items.filter((item) => item.status === status);
    }

    if (!items.length) {
        list.innerHTML = `<div class="empty-state">No shop items found.</div>`;
        return;
    }

    list.innerHTML = items.map((item) => `
        <div class="admin-list-item admin-shop-item-row">
            <div class="admin-shop-item-mini">
                <div class="admin-shop-mini-icon">
                    ${item.item_icon
            ? `<img src="${escapeHTML(item.item_icon)}" alt="${escapeHTML(item.item_name)}">`
            : `<span>${escapeHTML(String(item.item_name || "?").slice(0, 1))}</span>`
        }
                </div>

                <div>
                    <strong>${escapeHTML(item.item_name)}</strong>
                    <span>
                        ${escapeHTML(item.category_name || "No Category")}
                        · Item ID ${escapeHTML(item.item_id)}
                        · x${formatNumber(item.item_count)}
                        · ${formatNumber(item.price_coin)} Coins
                        · ${escapeHTML(item.status)}
                    </span>
                </div>
            </div>

            <div class="admin-list-actions">
                <button data-edit-shop-item="${item.id}">Edit</button>
                <button data-delete-shop-item="${item.id}">Delete</button>
            </div>
        </div>
    `).join("");
};

const retryShopQueue = async (id, button = null) => {
    if (!confirm("Retry this delivery queue?")) return;

    setButtonLoading(button, true, "Retrying...");

    try {
        const response = await adminRequest(`/api/admin/shop/queue/${id}/retry`, {
            method: "POST"
        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {
            await loadAdminShopQueue();
        }
    } catch {
        alert("Failed to retry queue.");
    } finally {
        setButtonLoading(button, false);
    }
};

const refundShopOrder = async (id, button = null) => {
    if (!confirm("Refund this order? Coins will be returned to user.")) return;

    setButtonLoading(button, true, "Refunding...");

    try {
        const response = await adminRequest(`/api/admin/shop/orders/${id}/refund`, {
            method: "POST"
        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {
            await loadAdminShopOrders();
            await loadAdminShopQueue();
        }
    } catch {
        alert("Failed to refund order.");
    } finally {
        setButtonLoading(button, false);
    }
};

const loadRecentCoinLogs = async () => {
    const box = document.getElementById("adminCoinLogsList");
    if (!box) return;

    try {
        const response = await adminRequest("/api/admin/coin-logs");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No coin logs found.</div>`;
            return;
        }

        box.innerHTML = `
            <div class="admin-shop-table">
                ${result.data.map((log) => `
                    <div class="admin-shop-table-row">
                        <strong>${escapeHTML(log.type)} · ${formatNumber(log.amount)} Coins</strong>
                        <span>
                            ${escapeHTML(log.username)}
                            · ${formatNumber(log.balance_before)} → ${formatNumber(log.balance_after)}
                            · Admin: ${escapeHTML(log.admin_username || "-")}
                        </span>
                        <small>${escapeHTML(log.note || "-")} · ${escapeHTML(log.created_at || "-")}</small>
                    </div>
                `).join("")}
            </div>
        `;
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load coin logs.</div>`;
    }
};

let voteSitesCache = [];

const initVotePage = async () => {
    await loadVoteAccountInfo();
    await loadVoteSites();
    await loadVoteLogs();

    const refreshBtn = document.getElementById("refreshVoteLogsBtn");
    if (refreshBtn) {
        refreshBtn.onclick = () => loadVoteLogs(refreshBtn);
    }
};

const loadVoteAccountInfo = async () => {
    const balanceBox = document.getElementById("voteCoinBalance");
    if (!balanceBox) return;

    if (!getAuthToken()) {
        balanceBox.textContent = "Login Required";
        return;
    }

    try {
        const response = await fetch("/api/account/dashboard", {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            balanceBox.textContent = "0 Coins";
            return;
        }

        balanceBox.textContent = `${formatNumber(result.data.profile.donate_coin || 0)} Coins`;
    } catch {
        balanceBox.textContent = "0 Coins";
    }
};

const loadVoteSites = async () => {
    const grid = document.getElementById("voteSitesGrid");
    if (!grid) return;

    grid.innerHTML = `<div class="empty-state">Loading vote sites...</div>`;

    try {
        const response = await fetch(API.voteSites, {
            headers: getAuthToken()
                ? { Authorization: `Bearer ${getAuthToken()}` }
                : {}
        });

        const result = await response.json();

        if (!result.success || !result.data.length) {
            grid.innerHTML = `<div class="empty-state">No vote sites available.</div>`;
            return;
        }

        voteSitesCache = result.data;
        renderVoteSites();
    } catch {
        grid.innerHTML = `<div class="empty-state">Failed to load vote sites.</div>`;
    }
};

const formatCooldown = (dateValue) => {
    if (!dateValue) return "";

    const target = new Date(dateValue);
    const diff = target.getTime() - Date.now();

    if (diff <= 0) return "Ready";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.ceil((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours <= 0) return `${minutes}m left`;

    return `${hours}h ${minutes}m left`;
};

const renderVoteSites = () => {
    const grid = document.getElementById("voteSitesGrid");
    if (!grid) return;

    grid.innerHTML = voteSitesCache.map((site) => {
        const canClaim = Boolean(site.can_claim);
        const loginRequired = Boolean(site.login_required);
        const cooldownText = site.next_claim_at
            ? formatCooldown(site.next_claim_at)
            : "Ready";

        return `
            <article class="vote-site-card">
              <div class="vote-site-top">
                <div class="vote-site-icon">
                  ${site.icon
                ? `<img src="${escapeHTML(site.icon)}" alt="${escapeHTML(site.name)}">`
                : `<span>${escapeHTML(String(site.name || "?").slice(0, 1))}</span>`
            }
                </div>

                <div class="vote-site-status ${canClaim ? "ready" : "cooldown"}">
                  ${loginRequired ? "Login Required" : canClaim ? "Ready" : cooldownText}
                </div>
              </div>

              <div class="vote-site-content">
                <h3>${escapeHTML(site.name)}</h3>
                <p>${escapeHTML(site.description || "Vote and claim your reward.")}</p>
              </div>

              <div class="vote-site-meta">
                <span>Reward</span>
                <strong>${formatNumber(site.reward_coin)} Coins</strong>
              </div>

              <div class="vote-site-meta">
                <span>Cooldown</span>
                <strong>${formatNumber(site.cooldown_hours)} Hours</strong>
              </div>

              <div class="vote-site-actions">
                <button
                    type="button"
                    data-start-vote="${site.id}"
                    ${loginRequired || !canClaim ? "disabled" : ""}
                >
                    ${loginRequired ? "Login First" : canClaim ? "Vote Now" : "Cooldown"}
                </button>

                <button
                    type="button"
                    data-claim-vote="${site.id}"
                    disabled
                >
                    Claim Reward
                </button>
                </div>
            </article>
        `;
    }).join("");
};

const claimVoteReward = async (siteId, button = null) => {
    if (!getAuthToken()) {
        alert("Please login first.");
        navigateTo("/login");
        return;
    }

    if (!confirm("Make sure you already voted. Claim reward now?")) {
        return;
    }

    setButtonLoading(button, true, "Claiming...");

    try {
        const response = await fetch(API.voteClaim, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                vote_site_id: siteId
            })
        });

        const result = await response.json();

        alert(result.message || "Vote reward processed.");

        if (result.success) {
            await loadVoteAccountInfo();
            await loadVoteSites();
            await loadVoteLogs();
        }
    } catch {
        alert("Failed to claim vote reward.");
    } finally {
        setButtonLoading(button, false);
    }
};

const loadVoteLogs = async (button = null) => {
    const box = document.getElementById("voteLogsList");
    if (!box) return;

    if (!getAuthToken()) {
        box.innerHTML = `<div class="empty-state">Login to view your vote history.</div>`;
        return;
    }

    setButtonLoading(button, true, "Refreshing...");

    try {
        const response = await fetch(API.voteLogs, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No vote history found.</div>`;
            return;
        }

        box.innerHTML = `
            <div class="vote-log-list">
                ${result.data.map((log) => `
                    <div class="vote-log-item">
                        <div>
                            <strong>${escapeHTML(log.vote_site_name)}</strong>
                            <p>Reward: ${formatNumber(log.reward_coin)} Coins</p>
                        </div>

                        <span>${escapeHTML(log.created_at || "-")}</span>
                    </div>
                `).join("")}
            </div>
        `;
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load vote history.</div>`;
    } finally {
        setButtonLoading(button, false);
    }
};

const voteAttemptTimers = {};

const startVote = async (siteId, button = null) => {
    if (!getAuthToken()) {
        alert("Please login first.");
        navigateTo("/login");
        return;
    }

    setButtonLoading(button, true, "Opening...");

    try {
        const response = await fetch(API.voteStart, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                vote_site_id: siteId
            })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message || "Failed to start vote.");
            return;
        }

        window.open(result.data.vote_url, "_blank", "noopener");

        const claimBtn = document.querySelector(`[data-claim-vote="${siteId}"]`);

        if (claimBtn) {
            claimBtn.disabled = true;
            claimBtn.textContent = "Wait 60s...";

            let seconds = Number(result.data.min_claim_seconds || 60);

            clearInterval(voteAttemptTimers[siteId]);

            voteAttemptTimers[siteId] = setInterval(() => {
                seconds -= 1;

                if (seconds <= 0) {
                    clearInterval(voteAttemptTimers[siteId]);
                    claimBtn.disabled = false;
                    claimBtn.textContent = "Claim Reward";
                    return;
                }

                claimBtn.textContent = `Wait ${seconds}s...`;
            }, 1000);
        }

        alert("Vote page opened. Complete your vote, then return here to claim reward.");
    } catch {
        alert("Failed to start vote.");
    } finally {
        setButtonLoading(button, false);
    }
};

const adminVotePage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Manage Vote Sites</h1>
    <span>Create vote sites, set rewards, cooldowns, icons, and view vote logs.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-shop-layout">
      <div class="account-card">
        <h3 id="voteSiteFormTitle">Create Vote Site</h3>

        <form id="adminVoteSiteForm" class="admin-form">
          <input type="hidden" id="voteSiteId" />

          <input type="text" id="voteSiteName" placeholder="Vote Site Name" required />
          <input type="text" id="voteSiteSlug" placeholder="vote-site-slug" />
          <input type="url" id="voteSiteUrl" placeholder="https://vote-site.com/server" required />
          <input type="text" id="voteSiteIcon" placeholder="Icon URL optional" />

          <div class="admin-shop-icon-tools">
            <input type="file" id="voteSiteIconUpload" accept="image/*" />
            <button type="button" class="secondary-admin-btn" id="uploadVoteSiteIconBtn">
              Upload Icon
            </button>
          </div>

          <input type="number" id="voteSiteReward" placeholder="Reward Coin" value="100" />
          <input type="number" id="voteSiteCooldown" placeholder="Cooldown Hours" value="12" />
          <input type="number" id="voteSiteSort" placeholder="Sort Order" value="0" />

          <select id="voteSiteStatus">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <textarea id="voteSiteDescription" rows="4" placeholder="Description"></textarea>

          <button type="submit" class="auth-btn">Save Vote Site</button>
          <button type="button" id="resetVoteSiteForm" class="secondary-admin-btn">Reset</button>
        </form>

        <div id="adminVoteSiteMessage"></div>
      </div>

      <div class="account-card">
        <h3>Vote Sites</h3>

        <div id="adminVoteSitesList" class="admin-list">
          <div class="empty-state">Loading vote sites...</div>
        </div>
      </div>

      <div class="account-card admin-shop-wide">
        <h3>Recent Vote Logs</h3>

        <div id="adminVoteLogsList">
          <div class="empty-state">Loading vote logs...</div>
        </div>
      </div>
    </div>
  </section>
`);

let adminVoteSitesCache = [];

const initAdminVotePage = () => {
    initAdminVoteSiteForm();
    loadAdminVoteSites();
    loadAdminVoteLogs();

    const uploadBtn = document.getElementById("uploadVoteSiteIconBtn");
    if (uploadBtn) {
        uploadBtn.onclick = () => uploadVoteSiteIcon(uploadBtn);
    }
};

const resetAdminVoteSiteForm = () => {
    document.getElementById("voteSiteId").value = "";
    document.getElementById("voteSiteName").value = "";
    document.getElementById("voteSiteSlug").value = "";
    document.getElementById("voteSiteUrl").value = "";
    document.getElementById("voteSiteIcon").value = "";
    document.getElementById("voteSiteReward").value = 100;
    document.getElementById("voteSiteCooldown").value = 12;
    document.getElementById("voteSiteSort").value = 0;
    document.getElementById("voteSiteStatus").value = "active";
    document.getElementById("voteSiteDescription").value = "";
    document.getElementById("voteSiteFormTitle").textContent = "Create Vote Site";
};

const initAdminVoteSiteForm = () => {
    const form = document.getElementById("adminVoteSiteForm");
    if (!form) return;

    const resetBtn = document.getElementById("resetVoteSiteForm");
    if (resetBtn) resetBtn.onclick = resetAdminVoteSiteForm;

    form.onsubmit = async (event) => {
        event.preventDefault();

        const submitBtn = event.submitter;
        setButtonLoading(submitBtn, true, "Saving...");

        const id = document.getElementById("voteSiteId").value;

        const payload = {
            name: document.getElementById("voteSiteName").value.trim(),
            slug: document.getElementById("voteSiteSlug").value.trim(),
            vote_url: document.getElementById("voteSiteUrl").value.trim(),
            icon: document.getElementById("voteSiteIcon").value.trim(),
            reward_coin: document.getElementById("voteSiteReward").value || 0,
            cooldown_hours: document.getElementById("voteSiteCooldown").value || 12,
            sort_order: document.getElementById("voteSiteSort").value || 0,
            status: document.getElementById("voteSiteStatus").value,
            description: document.getElementById("voteSiteDescription").value.trim()
        };

        const url = id
            ? `/api/admin/vote/sites/${id}`
            : "/api/admin/vote/sites";

        const method = id ? "PUT" : "POST";

        try {
            const response = await adminRequest(url, {
                method,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            showAdminMessage(
                "adminVoteSiteMessage",
                result.message,
                result.success ? "success" : "error"
            );

            if (result.success) {
                resetAdminVoteSiteForm();
                await loadAdminVoteSites();
            }
        } catch {
            showAdminMessage("adminVoteSiteMessage", "Connection error.", "error");
        } finally {
            setButtonLoading(submitBtn, false);
        }
    };
};

const uploadVoteSiteIcon = async (button = null) => {
    const input = document.getElementById("voteSiteIconUpload");

    if (!input || !input.files.length) {
        showAdminMessage("adminVoteSiteMessage", "Please select an icon first.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("image", input.files[0]);

    setButtonLoading(button, true, "Uploading...");

    try {
        const response = await fetch("/api/admin/vote/upload-icon", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            showAdminMessage("adminVoteSiteMessage", result.message, "error");
            return;
        }

        document.getElementById("voteSiteIcon").value = result.url;
        input.value = "";

        showAdminMessage("adminVoteSiteMessage", "Icon uploaded successfully.", "success");
    } catch {
        showAdminMessage("adminVoteSiteMessage", "Failed to upload icon.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const loadAdminVoteSites = async () => {
    const list = document.getElementById("adminVoteSitesList");
    if (!list) return;

    list.innerHTML = `<div class="empty-state">Loading vote sites...</div>`;

    try {
        const response = await adminRequest("/api/admin/vote/sites");
        const result = await response.json();

        if (!result.success) {
            list.innerHTML = `<div class="empty-state">${escapeHTML(result.message)}</div>`;
            return;
        }

        adminVoteSitesCache = result.data || [];

        if (!adminVoteSitesCache.length) {
            list.innerHTML = `<div class="empty-state">No vote sites found.</div>`;
            return;
        }

        list.innerHTML = adminVoteSitesCache.map((site) => `
            <div class="admin-list-item">
                <div class="admin-shop-item-mini">
                    <div class="admin-shop-mini-icon">
                        ${site.icon
                ? `<img src="${escapeHTML(site.icon)}" alt="${escapeHTML(site.name)}">`
                : `<span>${escapeHTML(String(site.name || "?").slice(0, 1))}</span>`
            }
                    </div>

                    <div>
                        <strong>${escapeHTML(site.name)}</strong>
                        <span>
                            ${formatNumber(site.reward_coin)} Coins
                            · ${formatNumber(site.cooldown_hours)}h cooldown
                            · ${escapeHTML(site.status)}
                        </span>
                    </div>
                </div>

                <div class="admin-list-actions">
                    <button data-edit-vote-site="${site.id}">Edit</button>
                    <button data-delete-vote-site="${site.id}">Delete</button>
                </div>
            </div>
        `).join("");
    } catch {
        list.innerHTML = `<div class="empty-state">Failed to load vote sites.</div>`;
    }
};

const editAdminVoteSite = (id) => {
    const site = adminVoteSitesCache.find((item) => Number(item.id) === Number(id));
    if (!site) return;

    document.getElementById("voteSiteId").value = site.id;
    document.getElementById("voteSiteName").value = site.name || "";
    document.getElementById("voteSiteSlug").value = site.slug || "";
    document.getElementById("voteSiteUrl").value = site.vote_url || "";
    document.getElementById("voteSiteIcon").value = site.icon || "";
    document.getElementById("voteSiteReward").value = site.reward_coin || 0;
    document.getElementById("voteSiteCooldown").value = site.cooldown_hours || 12;
    document.getElementById("voteSiteSort").value = site.sort_order || 0;
    document.getElementById("voteSiteStatus").value = site.status || "active";
    document.getElementById("voteSiteDescription").value = site.description || "";
    document.getElementById("voteSiteFormTitle").textContent = "Edit Vote Site";

    window.scrollTo(0, 250);
};

const deleteAdminVoteSite = async (id, button = null) => {
    if (!confirm("Delete this vote site?")) return;

    setButtonLoading(button, true, "Deleting...");

    try {
        const response = await adminRequest(`/api/admin/vote/sites/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        showAdminMessage(
            "adminVoteSiteMessage",
            result.message,
            result.success ? "success" : "error"
        );

        if (result.success) {
            await loadAdminVoteSites();
        }
    } catch {
        showAdminMessage("adminVoteSiteMessage", "Connection error.", "error");
    } finally {
        setButtonLoading(button, false);
    }
};

const loadAdminVoteLogs = async () => {
    const box = document.getElementById("adminVoteLogsList");
    if (!box) return;

    try {
        const response = await adminRequest("/api/admin/vote/logs");
        const result = await response.json();

        if (!result.success || !result.data.length) {
            box.innerHTML = `<div class="empty-state">No vote logs found.</div>`;
            return;
        }

        box.innerHTML = `
            <div class="admin-shop-table">
                ${result.data.map((log) => `
                    <div class="admin-shop-table-row">
                        <strong>${escapeHTML(log.vote_site_name)}</strong>
                        <span>
                            ${escapeHTML(log.username)}
                            · ${formatNumber(log.reward_coin)} Coins
                        </span>
                        <small>${escapeHTML(log.created_at || "-")}</small>
                    </div>
                `).join("")}
            </div>
        `;
    } catch {
        box.innerHTML = `<div class="empty-state">Failed to load vote logs.</div>`;
    }
};