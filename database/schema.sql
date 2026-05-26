SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for web_admin_logs
-- ----------------------------
DROP TABLE IF EXISTS `web_admin_logs`;
CREATE TABLE `web_admin_logs`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` int(10) UNSIGNED NULL DEFAULT NULL,
  `admin_username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_type` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `target_id` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `ip_address` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_admin_id`(`admin_id`) USING BTREE,
  INDEX `idx_action`(`action`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_admin_logs
-- ----------------------------

-- ----------------------------
-- Table structure for web_coin_logs
-- ----------------------------
DROP TABLE IF EXISTS `web_coin_logs`;
CREATE TABLE `web_coin_logs`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `admin_id` int(10) UNSIGNED NULL DEFAULT NULL,
  `admin_username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `type` enum('add','subtract','purchase','refund') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount` int(10) UNSIGNED NOT NULL,
  `balance_before` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `balance_after` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `note` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_type`(`type`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_coin_logs
-- ----------------------------

-- ----------------------------
-- Table structure for web_downloads
-- ----------------------------
DROP TABLE IF EXISTS `web_downloads`;
CREATE TABLE `web_downloads`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('client','launcher','patch','guide') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'client',
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_downloads
-- ----------------------------
INSERT INTO `web_downloads` VALUES (1, 'Aion Full Client', 'client', 'https://example.com/aion-client.zip', '25 GB', '4.6', 'Download the full Aion client to start playing.', 1, 'active', '2026-05-25 12:33:31', NULL);
INSERT INTO `web_downloads` VALUES (2, 'Aion Launcher', 'launcher', 'https://example.com/aion-launcher.zip', '120 MB', '1.0.0', 'Official launcher for automatic updates.', 2, 'active', '2026-05-25 12:33:31', NULL);

-- ----------------------------
-- Table structure for web_news
-- ----------------------------
DROP TABLE IF EXISTS `web_news`;
CREATE TABLE `web_news`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category` enum('news','update','event','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'news',
  `excerpt` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `status` enum('draft','published') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'published',
  `views` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `published_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_news
-- ----------------------------
INSERT INTO `web_news` VALUES (1, 'Welcome to Aion Online', 'welcome-to-aion-online', 'news', 'The eternal war between Elyos and Asmodians begins now.', 'Welcome to our Aion Online private server. Prepare your wings, build your legion, and dominate the battlefield.', '/assets/img/news/default.jpg', 'published', 1, '2026-05-25 12:33:21', '2026-05-25 12:33:21', '2026-05-25 12:40:10');

-- ----------------------------
-- Table structure for web_ranking_cache
-- ----------------------------
DROP TABLE IF EXISTS `web_ranking_cache`;
CREATE TABLE `web_ranking_cache`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ranking_type` enum('players','legions','abyss','kinah','pvp') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `source_id` int(10) UNSIGNED NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `race` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `player_class` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `legion_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `level` int(10) UNSIGNED NULL DEFAULT 1,
  `points` bigint(20) UNSIGNED NULL DEFAULT 0,
  `position` int(10) UNSIGNED NULL DEFAULT 0,
  `extra_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ranking_type`(`ranking_type`) USING BTREE,
  INDEX `idx_position`(`position`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_ranking_cache
-- ----------------------------

-- ----------------------------
-- Table structure for web_server_status
-- ----------------------------
DROP TABLE IF EXISTS `web_server_status`;
CREATE TABLE `web_server_status`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `server_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Aion Server',
  `login_status` enum('online','offline','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'offline',
  `game_status` enum('online','offline','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'offline',
  `online_players` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `max_players` int(10) UNSIGNED NOT NULL DEFAULT 5000,
  `server_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '4.6',
  `rates_exp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '1x',
  `rates_drop` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '1x',
  `rates_kinah` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '1x',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_server_status
-- ----------------------------
INSERT INTO `web_server_status` VALUES (1, 'Aion Online', 'offline', 'offline', 2, 5000, '4.6', '5x', '3x', '2x', '2026-05-25 15:41:26');

-- ----------------------------
-- Table structure for web_settings
-- ----------------------------
DROP TABLE IF EXISTS `web_settings`;
CREATE TABLE `web_settings`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `setting_type` enum('text','image','color','url','textarea') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'text',
  `group_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'general',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `setting_key`(`setting_key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 162 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_settings
-- ----------------------------
INSERT INTO `web_settings` VALUES (1, 'site_name', 'Aion Private Server', 'text', 'general', '2026-05-25 17:11:54');
INSERT INTO `web_settings` VALUES (2, 'logo_text', 'AION ONLINE', 'text', 'branding', '2026-05-26 07:39:14');
INSERT INTO `web_settings` VALUES (3, 'primary_color', '#d4af37', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (4, 'secondary_color', '#f4d56f', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (5, 'background_color', '#05070d', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (6, 'hero_title', 'Enter The World of Aion Online', 'text', 'homepage', '2026-05-26 09:01:45');
INSERT INTO `web_settings` VALUES (7, 'hero_subtitle', 'The Eternal War Begins', 'text', 'homepage', '2026-05-25 16:53:09');
INSERT INTO `web_settings` VALUES (8, 'hero_description', 'Experience a premium MMORPG server with balanced gameplay, competitive rankings, epic PvP, powerful characters, and a modern community system.', 'textarea', 'homepage', '2026-05-25 16:53:09');
INSERT INTO `web_settings` VALUES (9, 'play_button_text', 'Play Now', 'text', 'homepage', '2026-05-25 16:53:09');
INSERT INTO `web_settings` VALUES (10, 'download_button_text', 'Download Client', 'text', 'homepage', '2026-05-25 16:53:09');
INSERT INTO `web_settings` VALUES (11, 'discord_url', 'https://discord.gg/example', 'url', 'social', '2026-05-25 16:53:09');
INSERT INTO `web_settings` VALUES (12, 'facebook_url', 'https://facebook.com/example', 'url', 'social', '2026-05-25 16:53:09');
INSERT INTO `web_settings` VALUES (13, 'background_soft', '#080b13', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (14, 'text_color', '#ffffff', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (15, 'muted_color', '#b8bdc9', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (16, 'border_color', 'rgba(255,255,255,0.10)', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (17, 'card_bg_color', '#ffffff', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (18, 'glass_bg_color', '#ffffff', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (19, 'dark_glass_bg_color', '#000000', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (20, 'success_color', '#86efac', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (21, 'danger_color', '#fca5a5', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (22, 'warning_color', '#facc15', 'color', 'theme', '2026-05-25 17:16:34');
INSERT INTO `web_settings` VALUES (26, 'navbar_bg', 'rgba(5,7,13,0.88)', 'text', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (27, 'navbar_border', 'rgba(255,255,255,0.08)', 'text', 'theme', '2026-05-25 17:41:44');
INSERT INTO `web_settings` VALUES (28, 'nav_link_color', '#d7dce6', 'color', 'theme', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (29, 'card_bg', 'rgba(255,255,255,0.055)', 'text', 'design', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (30, 'glass_bg', 'rgba(255,255,255,0.07)', 'text', 'design', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (31, 'dark_glass_bg', 'rgba(0,0,0,0.25)', 'text', 'design', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (32, 'border_soft', 'rgba(255,255,255,0.08)', 'text', 'design', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (33, 'shadow_color', 'rgba(0,0,0,0.35)', 'text', 'design', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (34, 'card_radius', '24px', 'text', 'design', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (35, 'button_radius', '14px', 'text', 'design', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (36, 'pill_radius', '999px', 'text', 'design', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (37, 'navbar_height', '78px', 'text', 'layout', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (38, 'section_padding', '90px 60px', 'text', 'layout', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (39, 'container_width', '1200px', 'text', 'layout', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (40, 'hero_overlay_dark', 'rgba(5,7,13,0.82)', 'text', 'hero', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (41, 'hero_overlay_soft', 'rgba(5,7,13,0.45)', 'text', 'hero', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (42, 'hero_glow_opacity', '0.22', 'text', 'hero', '2026-05-26 12:59:14');
INSERT INTO `web_settings` VALUES (43, 'success_bg', 'rgba(74,222,128,0.12)', 'text', 'status', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (44, 'danger_bg', 'rgba(248,113,113,0.12)', 'text', 'status', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (45, 'warning_bg', 'rgba(250,204,21,0.12)', 'text', 'status', '2026-05-25 17:49:11');
INSERT INTO `web_settings` VALUES (47, 'logo_image', '', 'image', 'images', '2026-05-26 10:28:08');
INSERT INTO `web_settings` VALUES (48, 'hero_background_image', '', 'image', 'images', '2026-05-26 08:54:45');
INSERT INTO `web_settings` VALUES (49, 'page_background_image', '', 'image', 'images', '2026-05-26 08:54:42');
INSERT INTO `web_settings` VALUES (121, 'show_server_status', '1', 'text', 'homepage_sections', '2026-05-26 06:53:56');
INSERT INTO `web_settings` VALUES (122, 'show_home_news', '1', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (123, 'show_home_ranking', '1', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (124, 'show_home_download', '1', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (125, 'home_news_subtitle', 'Latest Updates', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (126, 'home_news_title', 'News & Events', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (127, 'home_ranking_subtitle', 'Hall of Fame', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (128, 'home_ranking_title', 'Top Players', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (129, 'home_download_subtitle', 'Start Your Journey', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (130, 'home_download_title', 'Download Game Client', 'text', 'homepage_sections', '2026-05-25 19:22:09');
INSERT INTO `web_settings` VALUES (131, 'seo_title', 'Aion Online - Private Server', 'text', 'seo', '2026-05-26 09:55:52');
INSERT INTO `web_settings` VALUES (132, 'seo_description', 'Play Aion Online private server with epic PvP, rankings, legions, events, and premium MMORPG experience.', 'textarea', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (133, 'seo_keywords', 'Aion Online, Aion Private Server, MMORPG, PvP, Legion, Abyss Ranking', 'textarea', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (134, 'seo_author', 'Aion Online', 'text', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (135, 'seo_robots', 'index,follow', 'text', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (136, 'seo_og_title', 'Aion Online - Private Server', 'text', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (137, 'seo_og_description', 'Join the eternal war between Elyos and Asmodians.', 'textarea', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (138, 'seo_og_image', '', 'image', 'seo', '2026-05-26 07:06:11');
INSERT INTO `web_settings` VALUES (139, 'favicon_image', '', 'image', 'seo', '2026-05-26 08:54:04');
INSERT INTO `web_settings` VALUES (140, 'footer_text', '© 2026 Aion Online. All rights reserved.', 'text', 'footer', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (141, 'footer_description', 'A premium Aion MMORPG private server with epic PvP, rankings, legions, and community events.', 'textarea', 'footer', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (142, 'footer_show_socials', '1', 'text', 'footer', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (143, 'footer_show_quick_links', '1', 'text', 'footer', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (144, 'youtube_url', 'https://youtube.com/@example', 'url', 'social', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (145, 'instagram_url', 'https://instagram.com/example', 'url', 'social', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (146, 'tiktok_url', 'https://tiktok.com/@example', 'url', 'social', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (147, 'footer_link_1_label', 'Home', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (148, 'footer_link_1_url', '/', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (149, 'footer_link_2_label', 'News', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (150, 'footer_link_2_url', '/news', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (151, 'footer_link_3_label', 'Ranking', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (152, 'footer_link_3_url', '/ranking', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (153, 'footer_link_4_label', 'Download', 'text', 'footer_links', '2026-05-26 07:28:19');
INSERT INTO `web_settings` VALUES (154, 'footer_link_4_url', '/download', 'text', 'footer_links', '2026-05-26 07:28:19');

-- ----------------------------
-- Table structure for web_shop_categories
-- ----------------------------
DROP TABLE IF EXISTS `web_shop_categories`;
CREATE TABLE `web_shop_categories`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `slug` varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `icon` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_shop_categories
-- ----------------------------

-- ----------------------------
-- Table structure for web_shop_delivery_queue
-- ----------------------------
DROP TABLE IF EXISTS `web_shop_delivery_queue`;
CREATE TABLE `web_shop_delivery_queue`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `player_id` int(10) UNSIGNED NOT NULL,
  `player_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item_count` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `status` enum('pending','sent','failed') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'pending',
  `note` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_player_id`(`player_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_shop_delivery_queue
-- ----------------------------

-- ----------------------------
-- Table structure for web_shop_items
-- ----------------------------
DROP TABLE IF EXISTS `web_shop_items`;
CREATE TABLE `web_shop_items`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int(10) UNSIGNED NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item_description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `item_icon` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `item_count` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price_coin` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `buy_limit` int(10) UNSIGNED NULL DEFAULT 0,
  `status` enum('active','inactive') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category_id`(`category_id`) USING BTREE,
  INDEX `idx_item_id`(`item_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_shop_items
-- ----------------------------

-- ----------------------------
-- Table structure for web_shop_orders
-- ----------------------------
DROP TABLE IF EXISTS `web_shop_orders`;
CREATE TABLE `web_shop_orders`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `player_id` int(10) UNSIGNED NOT NULL,
  `player_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `shop_item_id` int(10) UNSIGNED NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item_count` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price_coin` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('pending','completed','failed','refunded') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'pending',
  `note` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_player_id`(`player_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_shop_orders
-- ----------------------------

-- ----------------------------
-- Table structure for web_theme_presets
-- ----------------------------
DROP TABLE IF EXISTS `web_theme_presets`;
CREATE TABLE `web_theme_presets`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `slug` varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `theme_data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_theme_presets
-- ----------------------------

-- ----------------------------
-- Table structure for web_users
-- ----------------------------
DROP TABLE IF EXISTS `web_users`;
CREATE TABLE `web_users`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `status` enum('active','banned','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `last_login` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `last_ip` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `donate_coin` int(10) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_users
-- ----------------------------

-- ----------------------------
-- Table structure for web_vote_attempts
-- ----------------------------
DROP TABLE IF EXISTS `web_vote_attempts`;
CREATE TABLE `web_vote_attempts`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `vote_site_id` int(10) UNSIGNED NOT NULL,
  `vote_site_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `status` enum('pending','claimed','expired') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'pending',
  `ip_address` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `claimed_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_site_status`(`user_id`, `vote_site_id`, `status`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_vote_attempts
-- ----------------------------

-- ----------------------------
-- Table structure for web_vote_logs
-- ----------------------------
DROP TABLE IF EXISTS `web_vote_logs`;
CREATE TABLE `web_vote_logs`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `vote_site_id` int(10) UNSIGNED NOT NULL,
  `vote_site_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `reward_coin` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `ip_address` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_vote_site_id`(`vote_site_id`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_vote_logs
-- ----------------------------

-- ----------------------------
-- Table structure for web_vote_sites
-- ----------------------------
DROP TABLE IF EXISTS `web_vote_sites`;
CREATE TABLE `web_vote_sites`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `slug` varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `vote_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `icon` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `reward_coin` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `cooldown_hours` int(10) UNSIGNED NOT NULL DEFAULT 12,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of web_vote_sites
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
