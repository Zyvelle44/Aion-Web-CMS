# Aion Web CMS

<p align="center">
  <img src="https://i.imgur.com/8jBvQAc.png" width="120" alt="Aion Web CMS Logo" />
</p>

<p align="center">
  <img src="https://i.postimg.cc/R0HbgYZH/127-0-0-1-3000.png" width="25%" alt="Aion Website Preview">
</p>

<p align="center">
  <strong>Modern MMORPG Web CMS for Aion Private Servers</strong><br>
  Built with Node.js, Vanilla JavaScript, Tailwind CSS, and MySQL.
</p>

<p align="center">
  Dynamic Website • Admin CMS • Donate Shop • Vote Reward • Theme System • Production Ready
</p>

---

# ✨ Aion Web CMS Features

## 🎨 Modern MMORPG Website
- Dynamic homepage sections
- Premium responsive UI
- Dynamic navbar & footer
- Dynamic hero background
- Fully customizable design system
- Live theme customization
- Theme presets system
- Dynamic color system
- Upload logo/background/favicon directly from admin panel
- Open Graph & SEO management

---

## 🔐 Authentication & Security
- Login system
- Register system
- Retype password validation
- Protected dashboard routes
- Admin route protection
- JWT authentication
- Secure middleware structure
- Upload validation system
- Activity logs system
- Basic production security stack

---

## 👤 User Dashboard
- User account dashboard
- Coin balance system
- Character selector
- Vote reward history
- Shop order history
- Dynamic profile area

---

## 🛒 Donate Shop System
- Item categories
- Dynamic item cards
- Buy item system
- Delivery queue system
- Retry & refund delivery
- Coin logs
- Admin CRUD categories
- Admin CRUD items
- Upload item icons
- Queue delivery to Aion GameServer
- Search & filter admin system

---

## 🗳️ Vote Reward System
- Vote sites management
- Vote cooldown protection
- Secure vote attempts
- Vote history logs
- Reward coin system
- Vote icon uploads
- Admin vote site CRUD

---

## ⚙️ Admin Panel
- Dynamic settings manager
- Dynamic homepage manager
- Theme editor system
- Export/import theme JSON
- Backup & restore settings
- Footer & social manager
- SEO settings manager
- Shop management
- Vote management
- User management
- Activity logs system

---

## 🎭 Dynamic Theme System
- Gold preset
- Blue preset
- Purple preset
- Red preset
- Green preset
- Custom colors
- Live preview support

---

# 📋 Requirements

## Server Requirements
- Node.js 18+
- MySQL 5.6+
- Nginx / Apache
- PM2 (recommended)

---

## Recommended Stack
- Ubuntu 22.04 LTS
- Cloudflare
- HTTPS SSL
- Redis (optional)

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/Zyvelle44/Aion-Web-CMS.git
cd aion-web-cms
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Configure Environment

Create `.env`

```env
APP_NAME=Aion Online Website
APP_PORT=3000
APP_ENV=development
APP_URL=https://yourdomain.com

# WEBSITE DATABASE
WEB_DB_HOST=localhost
WEB_DB_PORT=3306
WEB_DB_USER=root
WEB_DB_PASSWORD=
WEB_DB_NAME=aionweb

# LOGIN SERVER DATABASE
LS_DB_HOST=localhost
LS_DB_PORT=3306
LS_DB_USER=root
LS_DB_PASSWORD=
LS_DB_NAME=al_server_ls

# GAME SERVER DATABASE
GS_DB_HOST=localhost
GS_DB_PORT=3306
GS_DB_USER=root
GS_DB_PASSWORD=
GS_DB_NAME=al_server_gs

LOGIN_SERVER_HOST=127.0.0.1
LOGIN_SERVER_PORT=2106

GAME_SERVER_HOST=127.0.0.1
GAME_SERVER_PORT=7777

JWT_SECRET=change_this_to_very_long_random_secret_min_64_chars
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://yourdomain.com
TRUST_PROXY=true
```

---

## 4. Import Database

Import all SQL tables into:

```txt
aionweb
```

---

## 5. Start Backend

Development:

```bash
npm run dev
```

Production:

```bash
pm2 start src/server.js --name aion-web
```

---

## 6. Open Website

```txt
http://localhost:3000
```

---

# 🌍 Join Our Community

## Discord
Coming Soon

## Development Updates
Coming Soon

---

# ❤️ Credits By

## Zyvelle44

Designed & Developed with passion for the Aion Private Server community.

---

# ⚠️ Disclaimer

This project is intended for educational purposes and private server development only.

Please ensure compliance with your local laws and game publisher policies before public deployment.
