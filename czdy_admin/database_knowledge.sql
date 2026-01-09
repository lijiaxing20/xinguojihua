CREATE TABLE `fa_knowledge` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `category` varchar(50) NOT NULL COMMENT '分类:parenting,education,psychology,health,activity',
  `author_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '作者ID',
  `view_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '阅读量',
  `status` enum('published','hidden') NOT NULL DEFAULT 'published' COMMENT '状态',
  `createtime` int(10) DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) DEFAULT NULL COMMENT '更新时间',
  `deletetime` int(10) DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='知识库文章表';
