<?php
/**
 * 星火计划 - 数据库自动修复脚本
 * 直接在浏览器中访问此文件即可完成修复
 */

// 数据库配置
$config = [
    'hostname' => '127.0.0.1',
    'database' => 'xinghuojihua',
    'username' => 'xinghuojihua',
    'password' => 'aa123456',
    'hostport' => '3306',
    'prefix' => 'fa_',
];

try {
    // 连接数据库
    $dsn = "mysql:host={$config['hostname']};port={$config['hostport']};dbname={$config['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>✅ 数据库连接成功</h2>";
    echo "<style>body{font-family:Arial;padding:20px;} h2{color:#4CAF50;} pre{background:#f5f5f5;padding:10px;border-radius:5px;} .success{color:#4CAF50;} .error{color:#f44336;}</style>";

    // ========================================
    // 创建/修复表结构
    // ========================================

    $errors = [];
    $success = [];

    // 1. 创建家庭表
    try {
        $sql = "CREATE TABLE IF NOT EXISTS `{$config['prefix']}family` (
            `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
            `family_name` varchar(100) NOT NULL DEFAULT '' COMMENT '家庭名称',
            `creator_user_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建者用户ID',
            `settings` text COMMENT '家庭设置（JSON格式）',
            `createtime` int(11) DEFAULT NULL,
            `updatetime` int(11) DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `creator_user_id` (`creator_user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭表'";
        $pdo->exec($sql);
        $success[] = "家庭表 (fa_family) - 创建成功";
    } catch (Exception $e) {
        $errors[] = "家庭表创建失败: " . $e->getMessage();
    }

    // 2. 创建家庭成员表
    try {
        $sql = "CREATE TABLE IF NOT EXISTS `{$config['prefix']}family_member` (
            `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
            `family_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '家庭ID',
            `user_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
            `role_in_family` enum('parent','child') NOT NULL DEFAULT 'child' COMMENT '家庭中的角色',
            `joined_at` int(11) DEFAULT NULL COMMENT '加入时间',
            PRIMARY KEY (`id`),
            UNIQUE KEY `family_user` (`family_id`,`user_id`),
            KEY `user_id` (`user_id`),
            KEY `family_id` (`family_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家庭成员表'";
        $pdo->exec($sql);
        $success[] = "家庭成员表 (fa_family_member) - 创建成功";
    } catch (Exception $e) {
        $errors[] = "家庭成员表创建失败: " . $e->getMessage();
    }

    // 3. 创建通知表
    try {
        $sql = "CREATE TABLE IF NOT EXISTS `{$config['prefix']}notification` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表'";
        $pdo->exec($sql);
        $success[] = "通知表 (fa_notification) - 创建成功";
    } catch (Exception $e) {
        $errors[] = "通知表创建失败: " . $e->getMessage();
    }

    // 4. 添加用户表字段
    $userFields = [
        "energy" => "ALTER TABLE `{$config['prefix']}user` ADD COLUMN IF NOT EXISTS `energy` int(11) DEFAULT 0 COMMENT '能量值' AFTER `score`",
        "avatar" => "ALTER TABLE `{$config['prefix']}user` ADD COLUMN IF NOT EXISTS `avatar` varchar(255) DEFAULT '' COMMENT '头像' AFTER `email`",
        "gender" => "ALTER TABLE `{$config['prefix']}user` ADD COLUMN IF NOT EXISTS `gender` enum('0','1','2') DEFAULT '0' COMMENT '性别:0=未知,1=男,2=女' AFTER `birthday`",
        "birthday" => "ALTER TABLE `{$config['prefix']}user` ADD COLUMN IF NOT EXISTS `birthday` date DEFAULT NULL COMMENT '生日' AFTER `mobile`",
    ];

    foreach ($userFields as $name => $sql) {
        try {
            $pdo->exec($sql);
            $success[] = "用户表字段 ($name) - 添加成功";
        } catch (Exception $e) {
            // 忽略"字段已存在"错误
            if (strpos($e->getMessage(), 'duplicate') === false) {
                $errors[] = "用户表字段 ($name) - " . $e->getMessage();
            }
        }
    }

    // 5. 添加 family 表 settings 字段
    try {
        $sql = "ALTER TABLE `{$config['prefix']}family` ADD COLUMN IF NOT EXISTS `settings` text COMMENT '家庭设置' AFTER `family_name`";
        $pdo->exec($sql);
        $success[] = "家庭表字段 (settings) - 添加成功";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'duplicate') === false) {
            $errors[] = "家庭表字段 (settings) - " . $e->getMessage();
        }
    }

    // 6. 添加 family_member 表 joined_at 字段
    try {
        $sql = "ALTER TABLE `{$config['prefix']}family_member` ADD COLUMN IF NOT EXISTS `joined_at` int(11) DEFAULT NULL COMMENT '加入时间'";
        $pdo->exec($sql);
        $success[] = "家庭成员表字段 (joined_at) - 添加成功";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'duplicate') === false) {
            $errors[] = "家庭成员表字段 (joined_at) - " . $e->getMessage();
        }
    }

    // ========================================
    // 输出结果
    // ========================================

    echo "<h3>修复结果：</h3>";

    if (!empty($success)) {
        echo "<h4 class='success'>✅ 成功 (" . count($success) . " 项)</h4>";
        echo "<ul>";
        foreach ($success as $item) {
            echo "<li class='success'>✓ $item</li>";
        }
        echo "</ul>";
    }

    if (!empty($errors)) {
        echo "<h4 class='error'>⚠️ 错误 (" . count($errors) . " 项)</h4>";
        echo "<ul>";
        foreach ($errors as $item) {
            echo "<li class='error'>✗ $item</li>";
        }
        echo "</ul>";
    }

    // ========================================
    // 验证表结构
    // ========================================

    echo "<h3>表结构验证：</h3>";

    $tables = ['family', 'family_member', 'notification', 'user', 'badge', 'energy_log'];
    echo "<table border='1' cellpadding='10' cellspacing='0' style='border-collapse:collapse;'>";
    echo "<tr style='background:#f0f0f0;'><th>表名</th><th>状态</th><th>记录数</th></tr>";

    foreach ($tables as $table) {
        $tableName = $config['prefix'] . $table;
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM `$tableName`");
            $count = $stmt->fetchColumn();
            echo "<tr><td>$tableName</td><td class='success'>✅ 存在</td><td>$count</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>$tableName</td><td class='error'>❌ 不存在</td><td>-</td></tr>";
        }
    }

    echo "</table>";

    // ========================================
    // 后续步骤
    // ========================================

    echo "<h3>📋 后续步骤：</h3>";
    echo "<ol>";
    echo "<li>清除后端缓存：</li>";
    echo "<pre>cd E:\\www\\youzi_czdy\\czdy_admin\nrm -rf runtime/cache/*\nrm -rf runtime/temp/*\nrm -rf runtime/log/*</pre>";
    echo "<li>重启后端服务器：</li>";
    echo "<pre>php think run -p 80</pre>";
    echo "<li>刷新前端页面并测试功能</li>";
    echo "</ol>";

    echo "<hr>";
    echo "<p><strong>✅ 数据库修复完成！</strong></p>";
    echo "<p>请按照上述步骤清除缓存并重启服务器。</p>";

} catch (PDOException $e) {
    echo "<h2>❌ 数据库连接失败</h2>";
    echo "<p>错误信息：" . $e->getMessage() . "</p>";
    echo "<p>请检查：</p>";
    echo "<ul>";
    echo "<li>MySQL 服务是否正在运行</li>";
    echo "<li>数据库配置是否正确</li>";
    echo "<li>数据库用户名密码是否正确</li>";
    echo "</ul>";
}
