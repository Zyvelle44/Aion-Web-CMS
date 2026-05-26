const routes = {
  "/": "home",
  "/news": "news",
  "/ranking": "ranking",
  "/download": "download",
  "/login": "login",
  "/register": "register",
  "/account": "account",
  "/shop": "shop",
  "/vote": "vote",
  "/admin": "admin",
  "/admin/news": "adminNews",
  "/admin/downloads": "adminDownloads",
  "/admin/status": "adminStatus",
  "/admin/users": "adminUsers",
  "/admin/settings": "adminSettings",
  "/admin/logs": "adminLogs",
  "/admin/shop": "adminShop",
  "/admin/vote": "adminVote",
};

window.navigateTo = (path) => {
  window.history.pushState({}, "", path);
  renderRoute();
};

const layout = (content) => `
  <header class="navbar">
    <div class="logo" data-logo data-route="/">
      AIONONLINE
    </div>

    <nav>
      <a data-route="/">Home</a>
      <a data-route="/news">News</a>
      <a data-route="/ranking">Ranking</a>
      <a data-route="/download">Download</a>
      <a data-route="/shop">Shop</a>
      <a data-route="/vote">Vote</a>
    </nav>

    <div id="authArea">
      <button class="login-btn" data-route="/login">Login</button>
    </div>
  </header>

  ${content}

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo" data-setting="logo_text" data-fallback="AIONONLINE">
          AIONONLINE
        </div>

        <p data-setting="footer_description" data-fallback="A premium Aion MMORPG private server.">
          A premium Aion MMORPG private server.
        </p>
      </div>

      <div class="footer-links" data-section-toggle="footer_show_quick_links">
        <h4>Quick Links</h4>

        <a data-footer-link="1">Home</a>
        <a data-footer-link="2">News</a>
        <a data-footer-link="3">Ranking</a>
        <a data-footer-link="4">Download</a>
      </div>

      <div class="footer-socials" data-section-toggle="footer_show_socials">
        <h4>Community</h4>

        <a data-social-link="discord_url" target="_blank">Discord</a>
        <a data-social-link="facebook_url" target="_blank">Facebook</a>
        <a data-social-link="youtube_url" target="_blank">YouTube</a>
        <a data-social-link="instagram_url" target="_blank">Instagram</a>
        <a data-social-link="tiktok_url" target="_blank">TikTok</a>
      </div>
    </div>

    <div class="footer-bottom">
      <p data-setting="footer_text" data-fallback="© 2026 Aion Online. All rights reserved.">
        © 2026 Aion Online. All rights reserved.
      </p>
    </div>
  </footer>
`;

const homePage = () => layout(`
  <main class="hero">
    <div class="hero-content">
      <p class="subtitle" data-setting="hero_subtitle" data-fallback="The Eternal War Begins">
        The Eternal War Begins
      </p>

      <h1 data-setting="hero_title" data-fallback="Enter The World of Aion Online">
        Enter The World of Aion Online
      </h1>

      <p class="description" data-setting="hero_description" data-fallback="Experience a premium MMORPG server with balanced gameplay, competitive rankings, epic PvP, powerful characters, and a modern community system.">
        Experience a premium MMORPG server with balanced gameplay,
        competitive rankings, epic PvP, powerful characters, and a modern community system.
      </p>

      <div class="hero-actions">
        <button class="primary-btn" data-setting="play_button_text" data-fallback="Play Now">
          Play Now
        </button>

        <button class="secondary-btn" data-route="/download" data-setting="download_button_text" data-fallback="Download Client">
          Download Client
        </button>
      </div>
    </div>

    <div class="server-card" data-section-toggle="show_server_status">
      <h3>Server Status</h3>
      <p id="serverName">Loading...</p>

      <div class="status-row">
        <span>Login Server</span>
        <strong id="loginStatus">-</strong>
      </div>

      <div class="status-row">
        <span>Game Server</span>
        <strong id="gameStatus">-</strong>
      </div>

      <div class="status-row">
        <span>Online Players</span>
        <strong id="onlinePlayers">0</strong>
      </div>

      <div class="rates">
        <span id="expRate">EXP -</span>
        <span id="dropRate">DROP -</span>
        <span id="kinahRate">KINAH -</span>
      </div>
    </div>
  </main>

  <section class="section" data-section-toggle="show_home_news">
    <div class="section-header">
      <p data-setting="home_news_subtitle" data-fallback="Latest Updates">
        Latest Updates
      </p>

      <h2 data-setting="home_news_title" data-fallback="News & Events">
        News & Events
      </h2>
    </div>

    <div id="newsGrid" class="news-grid"></div>
  </section>

  <section class="section dark-section" data-section-toggle="show_home_ranking">
    <div class="section-header">
      <p data-setting="home_ranking_subtitle" data-fallback="Hall of Fame">
        Hall of Fame
      </p>

      <h2 data-setting="home_ranking_title" data-fallback="Top Players">
        Top Players
      </h2>
    </div>

    <div class="ranking-card">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Race</th>
            <th>Class</th>
            <th>Level</th>
            <th>Points</th>
          </tr>
        </thead>

        <tbody id="rankingBody"></tbody>
      </table>
    </div>
  </section>

  <section class="section download-section" data-section-toggle="show_home_download">
    <div class="section-header">
      <p data-setting="home_download_subtitle" data-fallback="Start Your Journey">
        Start Your Journey
      </p>

      <h2 data-setting="home_download_title" data-fallback="Download Game Client">
        Download Game Client
      </h2>
    </div>

    <div id="downloadGrid" class="download-grid"></div>
  </section>
`);

const newsPage = () => layout(`
  <section class="page-hero">
    <p>Official Updates</p>
    <h1>News & Events</h1>
    <span>Stay updated with server announcements, events, maintenance, and patch notes.</span>
  </section>

  <section class="section">
    <div id="newsGrid" class="news-grid"></div>
  </section>
`);

const rankingPage = () => layout(`
  <section class="page-hero">
    <p>Hall of Fame</p>
    <h1>Player Ranking</h1>
    <span>Track the strongest players, PvP heroes, abyss warriors, and richest Daevas.</span>
  </section>

  <section class="section dark-section">
    <div class="ranking-tabs">
      <button data-ranking="players">Players</button>
      <button data-ranking="abyss">Abyss AP</button>
      <button data-ranking="pvp">PvP Kills</button>
      <button data-ranking="kinah">Kinah</button>
      <button data-ranking="legions">Legions</button>
    </div>

    <div class="ranking-card">
      <div id="rankingTitle" class="ranking-title">Players Ranking</div>

      <table>
        <thead id="rankingHead"></thead>
        <tbody id="rankingBody"></tbody>
      </table>
    </div>
  </section>
`);

const downloadPage = () => layout(`
  <section class="page-hero">
    <p>Start Playing</p>
    <h1>Download Center</h1>
    <span>Download the full client, launcher, patches, and installation guides.</span>
  </section>

  <section class="section download-section">
    <div id="downloadGrid" class="download-grid"></div>
  </section>
`);

const loginPage = () => layout(`
  <section class="auth-page">
    <div class="auth-card">
      <p class="auth-subtitle">Welcome Back</p>
      <h1>Login Account</h1>

      <form id="loginForm" class="auth-form">
        <input type="text" id="loginUsername" placeholder="Username or Email" required />
        <input type="password" id="loginPassword" placeholder="Password" required />

        <button type="submit" class="auth-btn">Login</button>
      </form>

      <p class="auth-link">
        Don't have an account?
        <span data-route="/register">Register here</span>
      </p>

      <div id="authMessage"></div>
    </div>
  </section>
`);

const registerPage = () => layout(`
  <section class="auth-page">
    <div class="auth-card">
      <p class="auth-subtitle">Create Account</p>
      <h1>Register</h1>

      <form id="registerForm" class="auth-form">
        <input type="text" id="registerUsername" placeholder="Username" required />
        <input type="email" id="registerEmail" placeholder="Email Address" required />
        <input type="password" id="registerPassword" placeholder="Password" required />
        <input type="password" id="registerPasswordConfirm" placeholder="Retype Password" required />

        <button type="submit" class="auth-btn">Create Account</button>
      </form>

      <p class="auth-link">
        Already have an account?
        <span data-route="/login">Login here</span>
      </p>

      <div id="authMessage"></div>
    </div>
  </section>
`);

const notFoundPage = () => layout(`
  <section class="page-hero">
    <p>404</p>
    <h1>Page Not Found</h1>
    <span>The page you are looking for does not exist.</span>
  </section>
`);

const getPlayerIdFromPath = () => {
  const match = window.location.pathname.match(/^\/player\/(\d+)$/);
  return match ? match[1] : null;
};

const isLoggedIn = () => {
  return !!localStorage.getItem("aion_auth_token");
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("aion_auth_user"));
  } catch {
    return null;
  }
};

const isAdminUser = () => {
  const user = getStoredUser();
  return user && user.role === "admin";
};

const protectedRoutes = [
  "/account"
];

const guestOnlyRoutes = [
  "/login",
  "/register"
];

const adminRoutesOnly = [
  "/admin",
  "/admin/news",
  "/admin/downloads",
  "/admin/status",
  "/admin/users",
  "/admin/settings",
  "/admin/logs",
  "/admin/shop",
  "/admin/vote"
];

const applyRouteGuard = (path) => {
  if (protectedRoutes.includes(path) && !isLoggedIn()) {
    window.history.replaceState({}, "", "/login");
    return "/login";
  }

  if (guestOnlyRoutes.includes(path) && isLoggedIn()) {
    window.history.replaceState({}, "", "/account");
    return "/account";
  }

  if (adminRoutesOnly.includes(path)) {
    if (!isLoggedIn()) {
      window.history.replaceState({}, "", "/login");
      return "/login";
    }

    if (!isAdminUser()) {
      window.history.replaceState({}, "", "/account");
      return "/account";
    }
  }

  return path;
};

const renderRoute = () => {
  const app = document.getElementById("app");
  let path = window.location.pathname;
  path = applyRouteGuard(path);

  const playerMatch = path.match(/^\/player\/(\d+)$/);

  if (playerMatch) {
    app.innerHTML = playerDetailPage();
    loadPlayerProfile(playerMatch[1]);
    updateAuthArea();
    window.scrollTo(0, 0);
    return;
  }

  const playerId = getPlayerIdFromPath();

  if (playerId) {
    app.innerHTML = playerDetailPage();
    loadPlayerProfile(playerId);
    updateAuthArea();
    window.scrollTo(0, 0);
    return;
  }

  const page = routes[path];

  if (page === "home") app.innerHTML = homePage();
  else if (page === "news") app.innerHTML = newsPage();
  else if (page === "ranking") app.innerHTML = rankingPage();
  else if (page === "download") app.innerHTML = downloadPage();
  else if (page === "login") app.innerHTML = loginPage();
  else if (page === "register") app.innerHTML = registerPage();
  else if (page === "account") app.innerHTML = accountPage();
  else if (page === "shop") app.innerHTML = shopPage();
  else if (page === "vote") app.innerHTML = votePage();
  else if (page === "admin") app.innerHTML = adminPage();
  else if (page === "adminNews") app.innerHTML = adminNewsPage();
  else if (page === "adminDownloads") app.innerHTML = adminDownloadsPage();
  else if (page === "adminStatus") app.innerHTML = adminStatusPage();
  else if (page === "adminUsers") app.innerHTML = adminUsersPage();
  else if (page === "adminSettings") app.innerHTML = adminSettingsPage();
  else if (page === "adminLogs") app.innerHTML = adminLogsPage();
  else if (page === "adminShop") app.innerHTML = adminShopPage();
  else if (page === "adminVote") app.innerHTML = adminVotePage();
  else app.innerHTML = notFoundPage();

  if (page === "home") {
    if (setting("show_server_status", "1") === "1") loadServerStatus();
    if (setting("show_home_news", "1") === "1") loadNews(3);
    if (setting("show_home_download", "1") === "1") loadDownloads();
    if (setting("show_home_ranking", "1") === "1") loadRanking("players", 10);
  }

  if (page === "news") loadNews();
  if (page === "ranking") loadRanking("players", 100);
  if (page === "download") loadDownloads();

  if (page === "login") initLoginForm();
  if (page === "register") initRegisterForm();
  if (page === "account") loadAccountDashboard();

  if (page === "shop") initShopPage();
  if (page === "vote") initVotePage();
  if (page === "admin") loadAdminDashboard();
  if (page === "adminNews") initAdminNewsPage();
  if (page === "adminDownloads") initAdminDownloadsPage();
  if (page === "adminStatus") initAdminStatusPage();
  if (page === "adminUsers") loadAdminUsers();
  if (page === "adminSettings") initAdminSettingsPage();
  if (page === "adminLogs") loadAdminLogs();
  if (page === "adminShop") initAdminShopPage();
  if (page === "adminVote") initAdminVotePage();

  updateAuthArea();
  applyWebsiteSettings();

  window.scrollTo(0, 0);
};

window.addEventListener("popstate", renderRoute);
//document.addEventListener("DOMContentLoaded", renderRoute);

document.addEventListener("click", (event) => {
  const routeTarget = event.target.closest("[data-route]");

  if (routeTarget) {
    event.preventDefault();
    window.navigateTo(routeTarget.dataset.route);
    return;
  }

  const rankingTarget = event.target.closest("[data-ranking]");

  if (rankingTarget) {
    event.preventDefault();
    loadRanking(rankingTarget.dataset.ranking, 100);
  }
});

const accountPage = () => layout(`
  <section class="page-hero">
    <p>Account Center</p>
    <h1>My Dashboard</h1>
    <span>Manage your profile, game account, and Aion characters.</span>
  </section>

  <section class="section dark-section">
    <div id="accountDashboard" class="account-dashboard">
      <div class="empty-state">Loading account dashboard...</div>
    </div>
  </section>
`);

const adminPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Dashboard</h1>
    <span>Manage your Aion website, server information, news, downloads, and player data.</span>
  </section>

  <section class="section dark-section">
    <div id="adminDashboard" class="admin-dashboard">
      <div class="empty-state">Loading admin dashboard...</div>
    </div>
  </section>
`);

const adminNewsPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Manage News</h1>
    <span>Create, edit, publish, draft, and delete website news.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-news-layout">
      <div class="account-card">
        <h3 id="newsFormTitle">Create News</h3>

        <form id="adminNewsForm" class="admin-form">
          <input type="hidden" id="newsId" />

          <input type="text" id="newsTitle" placeholder="Title" required />

          <select id="newsCategory">
            <option value="news">News</option>
            <option value="update">Update</option>
            <option value="event">Event</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select id="newsStatus">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <input type="text" id="newsImage" placeholder="Image URL /assets/img/news/example.jpg" />

          <textarea id="newsExcerpt" rows="3" placeholder="Short excerpt"></textarea>

          <textarea id="newsContent" rows="10" placeholder="Full content" required></textarea>

          <button type="submit" class="auth-btn">Save News</button>
          <button type="button" id="resetNewsForm" class="secondary-admin-btn">Reset Form</button>
        </form>

        <div id="adminNewsMessage"></div>
      </div>

      <div class="account-card">
        <h3>News List</h3>
        <div id="adminNewsList" class="admin-list">
          <div class="empty-state">Loading news...</div>
        </div>
      </div>
    </div>
  </section>
`);

const adminDownloadsPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Manage Downloads</h1>
    <span>Create, edit, activate, deactivate, and delete download links.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-news-layout">
      <div class="account-card">
        <h3 id="downloadFormTitle">Create Download</h3>

        <form id="adminDownloadForm" class="admin-form">
          <input type="hidden" id="downloadId" />

          <input type="text" id="downloadTitle" placeholder="Title" required />

          <select id="downloadType">
            <option value="client">Client</option>
            <option value="launcher">Launcher</option>
            <option value="patch">Patch</option>
            <option value="guide">Guide</option>
          </select>

          <select id="downloadStatus">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <input type="text" id="downloadUrl" placeholder="File URL" required />
          <input type="text" id="downloadSize" placeholder="File Size, example: 25 GB" />
          <input type="text" id="downloadVersion" placeholder="Version, example: 1.0.0" />
          <input type="number" id="downloadSort" placeholder="Sort Order" value="0" />

          <textarea id="downloadDescription" rows="5" placeholder="Description"></textarea>

          <button type="submit" class="auth-btn">Save Download</button>
          <button type="button" id="resetDownloadForm" class="secondary-admin-btn">Reset Form</button>
        </form>

        <div id="adminDownloadMessage"></div>
      </div>

      <div class="account-card">
        <h3>Download List</h3>
        <div id="adminDownloadList" class="admin-list">
          <div class="empty-state">Loading downloads...</div>
        </div>
      </div>
    </div>
  </section>
`);

const adminStatusPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Server Status</h1>
    <span>Manage login server, game server, online players, rates, and version.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-status-layout">
      <div class="account-card">
        <h3>Manage Server Status</h3>

        <form id="adminStatusForm" class="admin-form">
          <input type="text" id="statusServerName" placeholder="Server Name" />

          <select id="statusLoginServer">
            <option value="online">Login Online</option>
            <option value="offline">Login Offline</option>
            <option value="maintenance">Login Maintenance</option>
          </select>

          <select id="statusGameServer">
            <option value="online">Game Online</option>
            <option value="offline">Game Offline</option>
            <option value="maintenance">Game Maintenance</option>
          </select>

          <input type="number" id="statusOnlinePlayers" placeholder="Online Players" />
          <input type="number" id="statusMaxPlayers" placeholder="Max Players" />

          <input type="text" id="statusVersion" placeholder="Server Version, example: 4.6" />
          <input type="text" id="statusExp" placeholder="EXP Rate, example: 5x" />
          <input type="text" id="statusDrop" placeholder="Drop Rate, example: 3x" />
          <input type="text" id="statusKinah" placeholder="Kinah Rate, example: 2x" />

          <button type="submit" class="auth-btn">Update Status</button>
        </form>

        <div id="adminStatusMessage"></div>
      </div>

      <div class="account-card">
        <h3>Preview</h3>

        <div class="server-card admin-status-preview">
          <h3 id="previewServerName">Aion Online</h3>

          <div class="status-row">
            <span>Login Server</span>
            <strong id="previewLoginStatus">offline</strong>
          </div>

          <div class="status-row">
            <span>Game Server</span>
            <strong id="previewGameStatus">offline</strong>
          </div>

          <div class="status-row">
            <span>Online Players</span>
            <strong id="previewOnlinePlayers">0 / 5000</strong>
          </div>

          <div class="rates">
            <span id="previewExp">EXP 1x</span>
            <span id="previewDrop">DROP 1x</span>
            <span id="previewKinah">KINAH 1x</span>
          </div>
        </div>
      </div>
    </div>
  </section>
`);

const playerDetailPage = () => layout(`
  <section class="page-hero">
    <p>Player Profile</p>
    <h1>Character Detail</h1>
    <span>View character information, Abyss points, PvP kills, legion, and Kinah.</span>
  </section>

  <section class="section dark-section">
    <div id="playerProfile" class="player-profile">
      <div class="empty-state">Loading player profile...</div>
    </div>
  </section>
`);

const adminUsersPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Manage Users</h1>
    <span>Manage website accounts, roles, status, and reset passwords.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-users-layout">
      <div id="adminUsersList" class="account-card">
        <h3>Users List</h3>
        <div class="empty-state">Loading users...</div>
      </div>
    </div>
  </section>
`);

const adminSettingsPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Website Settings</h1>
    <span>Edit branding, theme, homepage, images, SEO, footer, and advanced design settings.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-settings-layout">
      <div class="account-card">
        <h3>Theme & Content Settings</h3>

        <div class="settings-tabs">
          <button type="button" class="active" data-open-settings-tab="branding">Branding</button>
          <button type="button" data-open-settings-tab="theme">Theme</button>
          <button type="button" data-open-settings-tab="homepage">Homepage</button>
          <button type="button" data-open-settings-tab="images">Images</button>
          <button type="button" data-open-settings-tab="seo">SEO</button>
          <button type="button" data-open-settings-tab="footer">Footer</button>
          <button type="button" data-open-settings-tab="advanced">Advanced</button>
        </div>

        <form id="adminSettingsForm" class="admin-form">
          <div class="settings-tab-panel active" data-settings-panel="branding">
            <div id="settingsPanelBranding"></div>
          </div>

          <div class="settings-tab-panel" data-settings-panel="theme">
            <div class="theme-presets">
              <button type="button" data-theme-preset="gold">Gold</button>
              <button type="button" data-theme-preset="blue">Blue</button>
              <button type="button" data-theme-preset="purple">Purple</button>
              <button type="button" data-theme-preset="red">Red</button>
              <button type="button" data-theme-preset="green">Green</button>
            </div>

            <div class="theme-tools">
              <button type="button" class="secondary-admin-btn" id="exportThemeBtn">Export Theme JSON</button>

              <label class="secondary-admin-btn theme-import-label">
                Import Theme JSON
                <input type="file" id="importThemeInput" accept="application/json" hidden />
              </label>

              <button type="button" class="secondary-admin-btn" id="saveThemePresetBtn">Save Current as Preset</button>
              <button type="button" id="resetThemeBtn" class="secondary-admin-btn">Reset Default Theme</button>
              <button type="button" class="secondary-admin-btn" id="reloadSettingsBtn">Reload Settings</button>
            </div>

            <div class="account-card theme-preset-card">
              <h3>Saved Theme Presets</h3>
              <div id="savedThemePresets">
                <div class="empty-state">Loading presets...</div>
              </div>
            </div>

            <div id="settingsPanelTheme"></div>
          </div>

          <div class="settings-tab-panel" data-settings-panel="homepage">
            <div id="settingsPanelHomepage"></div>
          </div>

          <div class="settings-tab-panel" data-settings-panel="images">
            <div class="settings-image-list">
              <div class="settings-image-card">
                <div class="settings-image-preview" id="preview_logo_image">
                  <span>No image</span>
                </div>

                <div class="settings-image-info">
                  <h4>Logo Image</h4>
                  <p>Displayed in the website navbar. Recommended: transparent PNG/WebP.</p>
                  <input type="file" id="logoImageUpload" accept="image/*" />
                </div>

                <div class="settings-image-actions">
                  <button type="button" class="secondary-admin-btn" data-upload-setting="logo_image" data-upload-input="logoImageUpload">
                    Upload
                  </button>
                  <button type="button" class="secondary-admin-btn danger-btn" data-delete-setting-image="logo_image">
                    Delete
                  </button>
                </div>
              </div>

              <div class="settings-image-card">
                <div class="settings-image-preview wide" id="preview_hero_background_image">
                  <span>No image</span>
                </div>

                <div class="settings-image-info">
                  <h4>Hero Background</h4>
                  <p>Main homepage background image. Recommended: 1920x1080 WebP/JPG.</p>
                  <input type="file" id="heroBgUpload" accept="image/*" />
                </div>

                <div class="settings-image-actions">
                  <button type="button" class="secondary-admin-btn" data-upload-setting="hero_background_image" data-upload-input="heroBgUpload">
                    Upload
                  </button>
                  <button type="button" class="secondary-admin-btn danger-btn" data-delete-setting-image="hero_background_image">
                    Delete
                  </button>
                </div>
              </div>

              <div class="settings-image-card">
                <div class="settings-image-preview wide" id="preview_page_background_image">
                  <span>No image</span>
                </div>

                <div class="settings-image-info">
                  <h4>Page Background</h4>
                  <p>Used on page header sections like News, Ranking, Download, and Admin pages.</p>
                  <input type="file" id="pageBgUpload" accept="image/*" />
                </div>

                <div class="settings-image-actions">
                  <button type="button" class="secondary-admin-btn" data-upload-setting="page_background_image" data-upload-input="pageBgUpload">
                    Upload
                  </button>
                  <button type="button" class="secondary-admin-btn danger-btn" data-delete-setting-image="page_background_image">
                    Delete
                  </button>
                </div>
              </div>

              <div class="settings-image-card">
                <div class="settings-image-preview wide" id="preview_seo_og_image">
                  <span>No image</span>
                </div>

                <div class="settings-image-info">
                  <h4>Open Graph Image</h4>
                  <p>Preview image when your website is shared on Discord, Facebook, or social media.</p>
                  <input type="file" id="ogImageUpload" accept="image/*" />
                </div>

                <div class="settings-image-actions">
                  <button type="button" class="secondary-admin-btn" data-upload-setting="seo_og_image" data-upload-input="ogImageUpload">
                    Upload
                  </button>
                  <button type="button" class="secondary-admin-btn danger-btn" data-delete-setting-image="seo_og_image">
                    Delete
                  </button>
                </div>
              </div>

              <div class="settings-image-card">
                <div class="settings-image-preview small" id="preview_favicon_image">
                  <span>No image</span>
                </div>

                <div class="settings-image-info">
                  <h4>Favicon</h4>
                  <p>Small browser tab icon. Recommended: 64x64 or 128x128 PNG.</p>
                  <input type="file" id="faviconUpload" accept="image/*" />
                </div>

                <div class="settings-image-actions">
                  <button type="button" class="secondary-admin-btn" data-upload-setting="favicon_image" data-upload-input="faviconUpload">
                    Upload
                  </button>
                  <button type="button" class="secondary-admin-btn danger-btn" data-delete-setting-image="favicon_image">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div id="settingsPanelImages"></div>
          </div>

          <div class="settings-tab-panel" data-settings-panel="seo">
            <div id="settingsPanelSeo"></div>
          </div>

          <div class="settings-tab-panel" data-settings-panel="footer">
            <div id="settingsPanelFooter"></div>
          </div>

          <div class="settings-tab-panel" data-settings-panel="advanced">
            <div class="settings-backup-tools">
              <h4>Backup & Restore All Settings</h4>

              <p>
                Export or restore the entire website settings configuration including SEO,
                footer, homepage, theme, images, and design options.
              </p>

              <div class="theme-tools">
                <button
                  type="button"
                  class="secondary-admin-btn"
                  id="exportAllSettingsBtn"
                >
                  Export All Settings
                </button>

                <label class="secondary-admin-btn theme-import-label">
                  Import All Settings
                  <input
                    type="file"
                    id="importAllSettingsInput"
                    accept="application/json"
                    hidden
                  />
                </label>
              </div>
            </div>
            <div id="settingsPanelAdvanced"></div>
          </div>

          <button type="submit" class="auth-btn">Save Settings</button>
        </form>

        <div id="adminSettingsMessage"></div>
      </div>

      <div class="account-card">
        <h3>Live Preview</h3>

        <div class="settings-preview-card">
          <div class="settings-preview-logo" id="previewLogo">AIONONLINE</div>
          <p id="previewSubtitle">The Eternal War Begins</p>
          <h2 id="previewTitle">Enter The World of Aion Online</h2>
          <span id="previewDescription">
            Experience a premium MMORPG server with balanced gameplay.
          </span>

          <div class="hero-actions settings-preview-actions">
            <button class="primary-btn" id="previewPlayBtn">Play Now</button>
            <button class="secondary-btn" id="previewDownloadBtn">Download Client</button>
          </div>
        </div>
      </div>
    </div>
  </section>
`);

const uploadSettingImage = async (key, inputId, button = null) => {
  const input = document.getElementById(inputId);

  if (!input || !input.files.length) {
    showAdminMessage("adminSettingsMessage", "Please select an image first.", "error");
    return;
  }

  setButtonLoading(button, true, "Uploading...");

  const formData = new FormData();
  formData.append("key", key);
  formData.append("image", input.files[0]);

  try {
    const response = await fetch("/api/settings/admin/upload-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    const result = await response.json();

    showAdminMessage(
      "adminSettingsMessage",
      result.message,
      result.success ? "success" : "error"
    );

    if (result.success) {
      input.value = "";
      await reloadWebsiteSettings();
    }
  } catch {
    showAdminMessage("adminSettingsMessage", "Upload failed.", "error");
  } finally {
    setButtonLoading(button, false);
  }
};

const adminLogsPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Activity Logs</h1>
    <span>Track admin actions, security events, and content changes.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-users-layout">
      <div class="account-card">
        <h3>Recent Admin Activity</h3>

        <div id="adminLogsList">
          <div class="empty-state">Loading logs...</div>
        </div>
      </div>
    </div>
  </section>
`);

const shopPage = () => layout(`
  <section class="page-hero">
    <p>Premium Store</p>
    <h1>Item Shop</h1>
    <span>Use your donate coins to purchase premium items, costumes, wings, and consumables.</span>
  </section>

  <section class="section dark-section">
    <div class="shop-layout">
      <aside class="shop-sidebar">
        <div class="shop-balance-card">
          <span>Your Balance</span>
          <strong id="shopCoinBalance">0 Coins</strong>
          <p>Select your character before buying items.</p>
        </div>

        <div class="shop-character-card">
          <label>Send item to character</label>
          <select id="shopCharacterSelect">
            <option value="">Loading characters...</option>
          </select>
        </div>

        <div class="shop-category-card">
          <h3>Categories</h3>
          <div id="shopCategories" class="shop-category-list">
            <button class="active" data-shop-category="">All Items</button>
          </div>
        </div>
      </aside>

      <main class="shop-main">
        <div class="shop-toolbar">
          <div>
            <p>Premium Items</p>
            <h2 id="shopTitle">All Items</h2>
          </div>

          <div class="shop-search">
            <input type="text" id="shopSearchInput" placeholder="Search item..." />
          </div>
        </div>

        <div id="shopItemsGrid" class="shop-items-grid">
          <div class="empty-state">Loading shop items...</div>
        </div>

        <div class="shop-history-card">
          <div class="shop-history-header">
            <div>
              <p>Purchase History</p>
              <h2>My Orders</h2>
            </div>

            <button type="button" class="secondary-admin-btn" id="refreshShopOrdersBtn">
              Refresh
            </button>
          </div>

          <div id="shopOrderHistory">
            <div class="empty-state">Loading order history...</div>
          </div>
        </div>
      </main>
    </div>
  </section>
`);

const adminShopPage = () => layout(`
  <section class="page-hero">
    <p>Admin Panel</p>
    <h1>Manage Item Shop</h1>
    <span>Create categories, manage items, prices, orders, delivery queue, and coins.</span>
  </section>

  <section class="section dark-section">
    <div class="admin-shop-layout admin-shop-tabs-layout">

      <div class="account-card admin-shop-wide">
        <div class="settings-tabs">
          <button type="button" class="active" data-open-shop-tab="categories">Categories</button>
          <button type="button" data-open-shop-tab="items">Items</button>
          <button type="button" data-open-shop-tab="orders">Orders</button>
          <button type="button" data-open-shop-tab="queue">Queue</button>
          <button type="button" data-open-shop-tab="coins">Coins</button>
        </div>

        <div class="admin-shop-tab-panel active" data-shop-panel="categories">
          <div class="admin-shop-two-col">
            <div class="account-card">
              <h3 id="shopCategoryFormTitle">Create Category</h3>

              <form id="adminShopCategoryForm" class="admin-form">
                <input type="hidden" id="shopCategoryId" />

                <input type="text" id="shopCategoryName" placeholder="Category Name" required />
                <input type="text" id="shopCategorySlug" placeholder="category-slug" required />
                <input type="text" id="shopCategoryIcon" placeholder="Icon URL optional" />

                <div class="admin-shop-icon-tools">
                  <input type="file" id="shopCategoryIconUpload" accept="image/*" />
                  <button type="button" class="secondary-admin-btn" id="uploadShopCategoryIconBtn">
                    Upload Category Icon
                  </button>
                </div>

                <input type="number" id="shopCategorySort" placeholder="Sort Order" value="0" />

                <select id="shopCategoryStatus">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <textarea id="shopCategoryDescription" rows="3" placeholder="Description"></textarea>

                <button type="submit" class="auth-btn">Save Category</button>
                <button type="button" id="resetShopCategoryForm" class="secondary-admin-btn">Reset</button>
              </form>

              <div id="adminShopCategoryMessage"></div>
            </div>

            <div class="account-card">
              <h3>Categories</h3>

              <div id="adminShopCategoriesList" class="admin-list">
                <div class="empty-state">Loading categories...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-shop-tab-panel" data-shop-panel="items">
          <div class="admin-shop-two-col">
            <div class="account-card">
              <h3 id="shopItemFormTitle">Create Shop Item</h3>

              <form id="adminShopItemForm" class="admin-form">
                <input type="hidden" id="shopItemId" />

                <select id="shopItemCategory" required>
                  <option value="">Loading categories...</option>
                </select>

                <input type="number" id="shopItemGameId" placeholder="Game Item ID" required />
                <input type="text" id="shopItemName" placeholder="Item Name" required />
                <input type="text" id="shopItemIcon" placeholder="Item Icon URL optional" />

                <div class="admin-shop-icon-tools">
                  <input type="file" id="shopItemIconUpload" accept="image/*" />
                  <button type="button" class="secondary-admin-btn" id="uploadShopItemIconBtn">
                    Upload Item Icon
                  </button>
                </div>

                <input type="number" id="shopItemCount" placeholder="Item Count" value="1" required />
                <input type="number" id="shopItemPrice" placeholder="Price Coin" value="0" required />
                <input type="number" id="shopItemLimit" placeholder="Buy Limit, 0 = unlimited" value="0" />
                <input type="number" id="shopItemSort" placeholder="Sort Order" value="0" />

                <select id="shopItemStatus">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <textarea id="shopItemDescription" rows="4" placeholder="Item Description"></textarea>

                <div class="admin-shop-item-preview">
                  <div class="shop-item-card">
                    <div class="shop-item-top">
                      <div class="shop-item-icon" id="previewShopItemIcon">
                        <span>?</span>
                      </div>

                      <div class="shop-item-badge" id="previewShopItemCategory">
                        Category
                      </div>
                    </div>

                    <div class="shop-item-content">
                      <h3 id="previewShopItemName">Item Name</h3>
                      <p id="previewShopItemDescription">Item description preview.</p>
                    </div>

                    <div class="shop-item-meta">
                      <span>Item ID</span>
                      <strong id="previewShopItemGameId">0</strong>
                    </div>

                    <div class="shop-item-meta">
                      <span>Amount</span>
                      <strong id="previewShopItemCount">x1</strong>
                    </div>

                    <div class="shop-item-footer">
                      <div>
                        <span>Price</span>
                        <strong id="previewShopItemPrice">0 Coins</strong>
                      </div>

                      <button type="button">Preview</button>
                    </div>
                  </div>
                </div>

                <button type="submit" class="auth-btn">Save Item</button>
                <button type="button" id="resetShopItemForm" class="secondary-admin-btn">Reset</button>
              </form>

              <div id="adminShopItemMessage"></div>
            </div>

            <div class="account-card">
              <h3>Shop Items</h3>

              <div class="admin-shop-filters">
                <input type="text" id="adminShopSearchInput" placeholder="Search item name or item ID..." />

                <select id="adminShopCategoryFilter">
                  <option value="">All Categories</option>
                </select>

                <select id="adminShopStatusFilter">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div id="adminShopItemsList" class="admin-list">
                <div class="empty-state">Loading items...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-shop-tab-panel" data-shop-panel="orders">
          <div class="account-card">
            <h3>Recent Orders</h3>

            <div id="adminShopOrdersList">
              <div class="empty-state">Loading orders...</div>
            </div>
          </div>
        </div>

        <div class="admin-shop-tab-panel" data-shop-panel="queue">
          <div class="account-card">
            <h3>Delivery Queue</h3>

            <div id="adminShopQueueList">
              <div class="empty-state">Loading queue...</div>
            </div>
          </div>
        </div>

        <div class="admin-shop-tab-panel" data-shop-panel="coins">
          <div class="account-card">
            <h3>Manual Coin Top-up</h3>

            <p class="muted-text">
              Use Manage Users to add/subtract coins for a selected user. This panel shows recent coin logs.
            </p>

            <div id="adminCoinLogsList">
              <div class="empty-state">Loading coin logs...</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>
`);

const votePage = () => layout(`
  <section class="page-hero">
    <p>Support Server</p>
    <h1>Vote Reward</h1>
    <span>Vote for the server, claim coins, and help the community grow.</span>
  </section>

  <section class="section dark-section">
    <div class="vote-layout">
      <div class="vote-header-card">
        <div>
          <p>Vote Center</p>
          <h2>Earn Donate Coins</h2>
          <span>Open the vote site first, complete your vote, then return here to claim your reward.</span>
        </div>

        <div class="vote-balance">
          <span>Your Balance</span>
          <strong id="voteCoinBalance">0 Coins</strong>
        </div>
      </div>

      <div id="voteSitesGrid" class="vote-sites-grid">
        <div class="empty-state">Loading vote sites...</div>
      </div>

      <div class="vote-history-card">
        <div class="vote-history-header">
          <div>
            <p>History</p>
            <h2>My Vote Logs</h2>
          </div>

          <button type="button" class="secondary-admin-btn" id="refreshVoteLogsBtn">
            Refresh
          </button>
        </div>

        <div id="voteLogsList">
          <div class="empty-state">Loading vote history...</div>
        </div>
      </div>
    </div>
  </section>
`);

document.addEventListener("click", (event) => {
  const uploadSettingBtn = event.target.closest("[data-upload-setting]");

  if (uploadSettingBtn) {
    uploadSettingImage(
      uploadSettingBtn.dataset.uploadSetting,
      uploadSettingBtn.dataset.uploadInput,
      uploadSettingBtn
    );

    return;
  }
});

const openSettingsTab = (tab) => {
  document.querySelectorAll("[data-open-settings-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.openSettingsTab === tab);
  });

  document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.settingsPanel === tab);
  });
};

document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-open-settings-tab]");
  if (!btn) return;

  openSettingsTab(btn.dataset.openSettingsTab);
});