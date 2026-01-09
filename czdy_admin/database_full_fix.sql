
-- 任务表
CREATE TABLE IF NOT EXISTS `fa_task` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `family_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '家庭ID',
  `creator_user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建者ID',
  `assignee_user_id` int(10) unsigned DEFAULT NULL COMMENT '执行者ID',
  `task_name` varchar(255) NOT NULL COMMENT '任务名称',
  `description` text COMMENT '任务描述',
  `category` varchar(50) NOT NULL DEFAULT 'other' COMMENT '任务分类',
  `status` varchar(30) NOT NULL DEFAULT 'pending' COMMENT '状态:pending,in_progress,completed,archived',
  `priority` tinyint(1) NOT NULL DEFAULT '1' COMMENT '优先级',
  `energy_value` int(10) NOT NULL DEFAULT '0' COMMENT '能量值奖励',
  `target_date` datetime DEFAULT NULL COMMENT '目标完成时间',
  `createtime` int(10) DEFAULT NULL,
  `updatetime` int(10) DEFAULT NULL,
  `deletetime` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_family_id` (`family_id`),
  KEY `idx_assignee` (`assignee_user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 心愿表
CREATE TABLE IF NOT EXISTS `fa_wish` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '所属用户ID',
  `family_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '家庭ID',
  `wish_name` varchar(255) NOT NULL COMMENT '心愿名称',
  `description` text COMMENT '心愿描述',
  `required_energy` int(10) NOT NULL DEFAULT '0' COMMENT '所需能量值',
  `status` varchar(30) NOT NULL DEFAULT 'pending' COMMENT '状态:pending,fulfilled,cancelled',
  `fulfilled_at` int(10) DEFAULT NULL COMMENT '实现时间',
  `image` varchar(255) DEFAULT '' COMMENT '心愿图片',
  `createtime` int(10) DEFAULT NULL,
  `updatetime` int(10) DEFAULT NULL,
  `deletetime` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_family_id` (`family_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='心愿表';

-- 任务打卡表 (确保存在)
CREATE TABLE IF NOT EXISTS `fa_task_checkin` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `checkin_time` int(11) NOT NULL,
  `content_type` varchar(20) NOT NULL DEFAULT 'text',
  `content_url` varchar(512) DEFAULT '',
  `text_content` text,
  `energy_awarded` int(11) NOT NULL DEFAULT '0',
  `badge_awarded_id` int(10) unsigned NOT NULL DEFAULT '0',
  `readtime` int(10) unsigned NOT NULL DEFAULT '0',
  `createtime` int(11) DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务打卡记录';

-- 家庭表 (确保存在)
CREATE TABLE IF NOT EXISTS `fa_family` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `family_name` varchar(255) NOT NULL DEFAULT '' COMMENT '家庭名称',
  `creator_user_id` int(10) unsigned NOT NULL COMMENT '创建者用户ID',
  `createtime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭表';

-- 家庭成员表 (确保存在)
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
