-- ========================================
-- 星火计划 - 数据库表修复脚本
-- 解决 500 错误和 404 错误
-- ========================================

-- 1. 检查并创建家庭表（如果不存在）
CREATE TABLE IF NOT EXISTS `fa_family` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family_name` varchar(100) NOT NULL DEFAULT '' COMMENT '家庭名称',
  `creator_user_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建者用户ID',
  `settings` text COMMENT '家庭设置（JSON格式）',
  `createtime` int(11) DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creator_user_id` (`creator_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭表';

-- 2. 检查并创建家庭成员表（如果不存在）
CREATE TABLE IF NOT EXISTS `fa_family_member` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '家庭ID',
  `user_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `role_in_family` enum('parent','child') NOT NULL DEFAULT 'child' COMMENT '家庭中的角色',
  `joined_at` int(11) DEFAULT NULL COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `family_user` (`family_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `family_id` (`family_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭成员表';

-- 3. 检查并添加 fa_user 表可能缺失的字段
ALTER TABLE `fa_user`
  ADD COLUMN IF NOT EXISTS `energy` int(11) DEFAULT 0 COMMENT '能量值' AFTER `score`,
  ADD COLUMN IF NOT EXISTS `gender` enum('0','1','2') DEFAULT '0' COMMENT '性别:0=未知,1=男,2=女' AFTER `birthday`,
  ADD COLUMN IF NOT EXISTS `birthday` date DEFAULT NULL COMMENT '生日' AFTER `mobile`;

-- 4. 检查用户表中是否有一些必要字段
-- 如果 avatar 字段不存在，添加它
ALTER TABLE `fa_user`
  ADD COLUMN IF NOT EXISTS `avatar` varchar(255) DEFAULT '' COMMENT '头像' AFTER `email`;

-- 5. 检查 fa_notification 表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS `fa_notification` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '接收者用户ID',
  `type` varchar(50) DEFAULT 'system' COMMENT '通知类型',
  `title` varchar(200) DEFAULT '' COMMENT '通知标题',
  `content` text COMMENT '通知内容',
  `related_id` int(11) DEFAULT 0 COMMENT '关联ID',
  `is_read` tinyint(1) DEFAULT 0 COMMENT '是否已读:0=未读,1=已读',
  `createtime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- 6. 确保 fa_user 表有 token 字段（用于认证）
ALTER TABLE `fa_user`
  ADD COLUMN IF NOT EXISTS `token` varchar(255) DEFAULT '' COMMENT '登录令牌' AFTER `password`;

-- 7. 添加索引以优化查询性能
ALTER TABLE `fa_family_member` ADD INDEX IF NOT EXISTS `idx_family_user` (`family_id`, `user_id`);
ALTER TABLE `fa_user` ADD INDEX IF NOT EXISTS `idx_token` (`token`);

-- ========================================
-- 执行完成
-- ========================================

-- 验证表是否创建成功
SELECT '家庭表' as table_name, COUNT(*) as row_count FROM fa_family
UNION ALL
SELECT '家庭成员表', COUNT(*) FROM fa_family_member
UNION ALL
SELECT '通知表', COUNT(*) FROM fa_notification;

-- 如果以上查询都返回结果，说明表结构正常
