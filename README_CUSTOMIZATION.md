# Aion Website CMS — Customization Guide

## Overview

This website includes a fully dynamic CMS system powered by:

- Node.js
- Vanilla JavaScript
- MySQL
- Dynamic Theme Engine
- Admin Settings Panel

All major website elements can be edited directly from:

```txt
/admin/settings
```

without touching source code.

---

# Admin Settings Tabs

## Branding

Manage:

- Website Name
- Logo Text
- Main Branding

---

## Theme

Customize:

- Primary Colors
- Background Colors
- Navbar Colors
- Text Colors
- Card Styles
- Border Radius
- Shadows

Features:

- Theme Presets
- Save Theme Presets
- Export Theme JSON
- Import Theme JSON
- Reset Theme
- Reload Settings

---

## Homepage

Control homepage sections:

- Show/Hide News
- Show/Hide Ranking
- Show/Hide Download
- Show/Hide Server Status

Edit:

- Hero Title
- Hero Subtitle
- Hero Description
- Homepage Section Titles

---

## Images

Upload:

- Logo Image
- Hero Background
- Page Background
- Open Graph Image
- Favicon

Supported formats:

- PNG
- JPG
- WEBP

Recommended:

- Hero Background: 1920x1080
- Logo: Transparent PNG/WEBP
- Favicon: 64x64 PNG

---

## SEO

Manage:

- SEO Title
- Meta Description
- Keywords
- Open Graph
- Robots
- Favicon

SEO is server-side rendered for better indexing.

---

## Footer

Edit:

- Footer Description
- Footer Copyright
- Social Media Links
- Quick Links

Supported social links:

- Discord
- Facebook
- YouTube
- Instagram
- TikTok

---

## Advanced

Advanced design settings:

- Glass Background
- Card Radius
- Shadow Colors
- Container Width
- Hero Overlay
- Section Spacing

Also includes:

- Full Settings Backup
- Restore Backup

---

# Theme Presets

Preset themes included:

- Gold
- Blue
- Purple
- Red
- Green

You can create unlimited custom presets.

---

# Backup System

Two backup systems are available:

## Theme Export

Exports only design/theme settings.

File example:

```txt
my-theme.json
```

---

## Full Website Backup

Exports all settings:

- Theme
- SEO
- Footer
- Homepage
- Social Links
- Images
- Advanced Design

File example:

```txt
aion-settings-backup.json
```

---

# File Upload Location

Uploaded files are stored in:

```txt
/frontend/uploads/settings/
```

---

# Important Notes

## After Uploading Images

Use:

```txt
Reload Settings
```

inside Admin Settings.

---

## Recommended Production Setup

Recommended stack:

- Ubuntu 22+
- NGINX
- PM2
- Node.js LTS
- MySQL 5.7+

---

# Security Features

Included:

- Helmet
- Rate Limiting
- Input Sanitization
- JWT Authentication
- Admin Middleware
- CSP Protection

---

# Ranking Sync System

Automatic sync jobs included:

- Player Ranking
- Abyss Ranking
- PvP Ranking
- Kinah Ranking
- Legion Ranking
- Online Players
- Server Status

---

# Developer Notes

Main folders:

```txt
frontend/
backend/
```

Frontend:

```txt
frontend/assets/js/
frontend/assets/css/
```

Backend:

```txt
backend/src/
```

---

# Admin URL

```txt
/admin
```

---

# Default Theme Engine

Main CSS variables:

```css
--primary-color
--background-color
--text-color
--navbar-bg
--card-bg
```

All controlled dynamically from database settings.

---

# Credits

Aion Website CMS
Production-ready MMORPG website system.