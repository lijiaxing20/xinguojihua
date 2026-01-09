-- 星火计划数据库表结构
-- 数据库：xinghuojihua
-- 表前缀：fa_

-- 1. 通知表
CREATE TABLE IF NOT EXISTS `fa_notification` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL COMMENT '接收用户ID',
  `type` varchar(20) NOT NULL DEFAULT '' COMMENT '通知类型：task/wish/feedback/system',
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '通知标题',
  `content` text COMMENT '通知内容',
  `related_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '关联ID（任务ID、心愿ID等）',
  `status` varchar(20) NOT NULL DEFAULT 'unread' COMMENT '状态：unread/read',
  `readtime` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '阅读时间',
  `createtime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- 2. 能量值日志表
CREATE TABLE IF NOT EXISTS `fa_energy_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL COMMENT '用户ID',
  `change_amount` int(11) NOT NULL DEFAULT '0' COMMENT '变更数量（正数为增加，负数为减少）',
  `before` int(11) NOT NULL DEFAULT '0' COMMENT '变更前能量值',
  `after` int(11) NOT NULL DEFAULT '0' COMMENT '变更后能量值',
  `reason` varchar(50) NOT NULL DEFAULT '' COMMENT '变更原因：task_complete/wish_fulfill/system_adjust',
  `related_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '关联ID（任务ID、心愿ID等）',
  `createtime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_reason` (`reason`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='能量值日志表';

-- 3. 徽章表
CREATE TABLE IF NOT EXISTS `fa_badge` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `badge_type` varchar(50) NOT NULL DEFAULT '' COMMENT '徽章类型：persistence/explorer/creative等',
  `badge_name` varchar(255) NOT NULL DEFAULT '' COMMENT '徽章名称',
  `description` text COMMENT '徽章描述',
  `icon_url` varchar(512) NOT NULL DEFAULT '' COMMENT '图标URL',
  `criteria` text COMMENT '获得条件（JSON格式）',
  `createtime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_badge_type` (`badge_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='徽章表';

-- 4. 用户徽章表
CREATE TABLE IF NOT EXISTS `fa_user_badge` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL COMMENT '用户ID',
  `badge_id` int(10) unsigned NOT NULL COMMENT '徽章ID',
  `awarded_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '获得时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_badge` (`user_id`,`badge_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_badge_id` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户徽章表';

-- 5. 家庭表（如果需要）
CREATE TABLE IF NOT EXISTS `fa_family` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `family_name` varchar(255) NOT NULL DEFAULT '' COMMENT '家庭名称',
  `creator_user_id` int(10) unsigned NOT NULL COMMENT '创建者用户ID',
  `createtime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭表';

-- 6. 家庭成员表（如果需要）
CREATE TABLE IF NOT EXISTS `fa_family_member` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `family_id` int(10) unsigned NOT NULL COMMENT '家庭ID',
  `user_id` int(10) unsigned NOT NULL COMMENT '用户ID',
  `role_in_family` varchar(20) NOT NULL DEFAULT 'child' COMMENT '角色：parent/child',
  `joined_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_family_user` (`family_id`,`user_id`),
  KEY `idx_family_id` (`family_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭成员表';

-- 7. 在用户表中添加能量值字段（如果还没有）
ALTER TABLE `fa_user` ADD COLUMN IF NOT EXISTS `energy` int(11) NOT NULL DEFAULT '0' COMMENT '能量值' AFTER `score`;

-- 8. 在任务打卡表中添加字段（如果还没有）
ALTER TABLE `fa_task_checkin` ADD COLUMN IF NOT EXISTS `readtime` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '阅读时间' AFTER `updatetime`;

-- 9. 插入默认徽章数据
INSERT INTO `fa_badge` (`badge_type`, `badge_name`, `description`, `icon_url`, `criteria`, `createtime`, `updatetime`) VALUES
('persistence', '坚持不懈奖', '连续7天完成任务', '', '{"type":"consecutive_days","value":7}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('explorer', '探索家奖', '首次尝试新领域的任务', '', '{"type":"first_category","value":1}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('creative', '创意大师奖', '用有趣方式完成任务', '', '{"type":"creative_checkin","value":1}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('perfect_week', '完美一周', '一周内完成所有任务', '', '{"type":"perfect_week","value":1}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('energy_collector', '能量收集者', '累计获得1000能量值', '', '{"type":"total_energy","value":1000}', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE `updatetime`=UNIX_TIMESTAMP();

-- 10. 知识库表
CREATE TABLE IF NOT EXISTS `fa_knowledge` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '标题',
  `content` text COMMENT '内容',
  `category` varchar(50) NOT NULL DEFAULT '' COMMENT '分类：parenting/education/psychology/health/activity',
  `author_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '作者ID',
  `view_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '浏览次数',
  `status` varchar(20) NOT NULL DEFAULT 'normal' COMMENT '状态：normal/hidden',
  `createtime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库表';

