-- ========================================
-- 星火计划 - 数据库初始化脚本
-- ========================================
-- 执行方式：在数据库中执行此 SQL 文件
-- ========================================

-- 1. 勋章表初始化数据
-- ========================================

INSERT INTO `fa_badge` (`badge_name`, `badge_type`, `icon_url`, `description`, `energy_threshold`, `task_count_threshold`, `createtime`, `updatetime`) VALUES
-- 坚持勋章
('初出茅庐', 'persistence', '/assets/badges/persistence_1.png', '完成第1个任务', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('坚持不懈', 'persistence', '/assets/badges/persistence_2.png', '连续7天完成任务', 0, 7, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('月度之星', 'persistence', '/assets/badges/persistence_3.png', '一个月内完成20个任务', 0, 20, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('百日坚持', 'persistence', '/assets/badges/persistence_4.png', '连续100天打卡', 100, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- 探索勋章
('多面手', 'exploration', '/assets/badges/exploration_1.png', '完成过所有4个分类的任务', 0, 4, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('学习达人', 'exploration', '/assets/badges/exploration_2.png', '完成10个学习探索类任务', 0, 10, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('生活能手', 'exploration', '/assets/badges/exploration_3.png', '完成10个习惯养成类任务', 0, 10, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('才艺之星', 'exploration', '/assets/badges/exploration_4.png', '完成10个兴趣技能类任务', 0, 10, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- 创意勋章
('图文并茂', 'creativity', '/assets/badges/creativity_1.png', '首次上传图片打卡', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('视频达人', 'creativity', '/assets/badges/creativity_2.png', '首次上传视频打卡', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('日记之星', 'creativity', '/assets/badges/creativity_3.png', '写10篇日记', 0, 10, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('创意无限', 'creativity', '/assets/badges/creativity_4.png', '获得20次家长好评', 0, 20, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- 能量勋章
('能量启蒙', 'energy', '/assets/badges/energy_1.png', '累计获得100能量值', 100, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('能量达人', 'energy', '/assets/badges/energy_2.png', '累计获得500能量值', 500, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('能量大师', 'energy', '/assets/badges/energy_3.png', '累计获得1000能量值', 1000, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('能量传奇', 'energy', '/assets/badges/energy_4.png', '累计获得5000能量值', 5000, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 2. 知识库初始化数据（示例文章）
-- ========================================

INSERT INTO `fa_knowledge` (`title`, `category`, `summary`, `content`, `cover_image`, `tags`, `author_id`, `status`, `view_count`, `createtime`, `updatetime`) VALUES
('如何培养孩子的内在动机？', 'parenting', '探索自我决定理论在育儿中的应用', '<h2>什么是内在动机？</h2><p>内在动机是指个体出于兴趣、享受或挑战本身而从事某项活动的动力。与外在动机（如奖励、惩罚）不同，内在动机更能带来持久的投入和成长。</p><h2>自我决定理论</h2><p>根据自我决定理论，培养内在动机需要满足三个基本心理需求：</p><ul><li><strong>自主性</strong>：让孩子感到自己有选择权</li><li><strong>胜任感</strong>：让孩子感到自己有能力完成任务</li><li><strong>归属感</strong>：让孩子感到与他人有连接</li></ul>', '/assets/knowledge/cover1.jpg', '育儿,动机,心理学', 1, 'published', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

('奖励的陷阱：为什么外在奖励可能适得其反', 'parenting', '过度承诺奖励的负面影响分析', '<h2>过度合理化效应</h2><p>当外部奖励过于突出时，孩子可能会认为自己是为了奖励而行动，从而削弱原本的内在兴趣。</p><h2>如何正确使用奖励？</h2><ul><li>奖励应该是意外的，而非事先承诺的</li><li>奖励应该是具体的反馈，而非物质诱惑</li><li>关注过程而非结果</li></ul>', '/assets/knowledge/cover2.jpg', '奖励,育儿,教育', 1, 'published', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

('如何给予有效的正面反馈？', 'parenting', '掌握表扬的艺术', '<h2>有效的反馈原则</h2><ol><li>具体化：表扬具体的行为而非笼统的评价</li><li>过程导向：关注努力和策略而非天赋</li><li>真诚性：避免过度夸张的表扬</li></ol><h2>示例</h2><p>❌ "你真聪明！"<br>✅ "你通过反复练习解决了这个问题，真棒！"</p>', '/assets/knowledge/cover3.jpg', '反馈,表扬,沟通', 1, 'published', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 3. 确保数据库表结构完整（如果某些表不存在）
-- ========================================

-- 勋章表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS `fa_badge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `badge_name` varchar(100) NOT NULL COMMENT '勋章名称',
  `badge_type` varchar(50) NOT NULL COMMENT '勋章类型：persistence坚持,exploration探索,creativity创意,energy能量',
  `icon_url` varchar(255) DEFAULT '' COMMENT '图标URL',
  `description` varchar(500) DEFAULT '' COMMENT '描述',
  `energy_threshold` int(11) DEFAULT 0 COMMENT '能量值门槛',
  `task_count_threshold` int(11) DEFAULT 0 COMMENT '任务数量门槛',
  `createtime` int(11) DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='勋章表';

-- 用户勋章关联表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS `fa_user_badge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `badge_id` int(11) NOT NULL COMMENT '勋章ID',
  `awarded_at` int(11) DEFAULT NULL COMMENT '获得时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_badge` (`user_id`,`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户勋章关联表';

-- 能量值日志表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS `fa_energy_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `change_amount` int(11) NOT NULL COMMENT '变化数量（正数为增加，负数为减少）',
  `before` int(11) DEFAULT 0 COMMENT '变化前能量值',
  `after` int(11) DEFAULT 0 COMMENT '变化后能量值',
  `reason` varchar(50) DEFAULT '' COMMENT '变更原因：task_complete,wish_fulfill,system_adjust等',
  `related_id` int(11) DEFAULT NULL COMMENT '关联ID（任务ID或心愿ID）',
  `createtime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `createtime` (`createtime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='能量值日志表';

-- 知识库表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS `fa_knowledge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `category` varchar(50) DEFAULT 'parenting' COMMENT '分类：parenting育儿,education教育,psychology心理,health健康,activity活动',
  `summary` varchar(500) DEFAULT '' COMMENT '摘要',
  `content` text COMMENT '内容',
  `cover_image` varchar(255) DEFAULT '' COMMENT '封面图',
  `tags` varchar(255) DEFAULT '' COMMENT '标签',
  `author_id` int(11) NOT NULL COMMENT '作者ID',
  `status` enum('draft','published') DEFAULT 'draft' COMMENT '状态：draft草稿,published已发布',
  `view_count` int(11) DEFAULT 0 COMMENT '阅读量',
  `createtime` int(11) DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库表';

-- 为用户表添加 energy 字段（如果不存在）
ALTER TABLE `fa_user` ADD COLUMN IF NOT EXISTS `energy` int(11) DEFAULT 0 COMMENT '能量值' AFTER `mobile`;

-- ========================================
-- 初始化完成
-- ========================================
