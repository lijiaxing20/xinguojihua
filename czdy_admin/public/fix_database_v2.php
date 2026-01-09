<?php
/**
 * 星火计划 - 数据库自动修复脚本 v2
 * 修复 MySQL 语法错误
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
    echo "<style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h2 { color: #4CAF50; }
        h3 { color: #2196F3; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        pre { background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
        table { border-collapse: collapse; width: 100%%; background: #fff; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background: #4CAF50; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        ul { margin: 0; padding-left: 20px; }
        li { margin: 5px 0; }
        .step { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50; }
    </style>";

    $errors = [];
    $success = [];
    $skipped = [];

    // ========================================
    // 辅助函数：检查字段是否存在
    // ========================================
    function columnExists($pdo, $table, $column) {
        try {
            $result = $pdo->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
            return $result->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    // ========================================
    // 1. 创建家庭表
    // ========================================
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
        $success[] = "✓ 家庭表 (fa_family) - 创建成功";
    } catch (Exception $e) {
        $errors[] = "✗ 家庭表创建失败: " . $e->getMessage();
    }

    // ========================================
    // 2. 创建家庭成员表
    // ========================================
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
        $success[] = "✓ 家庭成员表 (fa_family_member) - 创建成功";
    } catch (Exception $e) {
        $errors[] = "✗ 家庭成员表创建失败: " . $e->getMessage();
    }

    // ========================================
    // 3. 创建通知表
    // ========================================
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
        $success[] = "✓ 通知表 (fa_notification) - 创建成功";
    } catch (Exception $e) {
        $errors[] = "✗ 通知表创建失败: " . $e->getMessage();
    }

    // ========================================
    // 4. 添加用户表字段（检查字段是否存在）
    // ========================================
    $userTable = $config['prefix'] . 'user';
    $userFields = [
        'energy' => "ALTER TABLE `$userTable` ADD COLUMN `energy` int(11) DEFAULT 0 COMMENT '能量值' AFTER `score`",
        'avatar' => "ALTER TABLE `$userTable` ADD COLUMN `avatar` varchar(255) DEFAULT '' COMMENT '头像' AFTER `email`",
        'gender' => "ALTER TABLE `$userTable` ADD COLUMN `gender` enum('0','1','2') DEFAULT '0' COMMENT '性别:0=未知,1=男,2=女' AFTER `birthday`",
        'birthday' => "ALTER TABLE `$userTable` ADD COLUMN `birthday` date DEFAULT NULL COMMENT '生日' AFTER `mobile`",
    ];

    foreach ($userFields as $fieldName => $sql) {
        try {
            if (!columnExists($pdo, $userTable, $fieldName)) {
                $pdo->exec($sql);
                $success[] = "✓ 用户表字段 ($fieldName) - 添加成功";
            } else {
                $skipped[] = "⊙ 用户表字段 ($fieldName) - 已存在，跳过";
            }
        } catch (Exception $e) {
            $errors[] = "✗ 用户表字段 ($fieldName) - " . $e->getMessage();
        }
    }

    // ========================================
    // 5. 添加 family 表 settings 字段
    // ========================================
    try {
        if (!columnExists($pdo, $config['prefix'] . 'family', 'settings')) {
            $sql = "ALTER TABLE `{$config['prefix']}family` ADD COLUMN `settings` text COMMENT '家庭设置'";
            $pdo->exec($sql);
            $success[] = "✓ 家庭表字段 (settings) - 添加成功";
        } else {
            $skipped[] = "⊙ 家庭表字段 (settings) - 已存在，跳过";
        }
    } catch (Exception $e) {
        $errors[] = "✗ 家庭表字段 (settings) - " . $e->getMessage();
    }

    // ========================================
    // 输出结果
    // ========================================

    echo "<h3>修复结果：</h3>";

    if (!empty($success)) {
        echo "<h4 class='success'>✅ 成功 (" . count($success) . " 项)</h4>";
        echo "<ul>";
        foreach ($success as $item) {
            echo "<li class='success'>$item</li>";
        }
        echo "</ul>";
    }

    if (!empty($skipped)) {
        echo "<h4 style='color:#FF9800'>⊙ 跳过 (" . count($skipped) . " 项)</h4>";
        echo "<ul>";
        foreach ($skipped as $item) {
            echo "<li style='color:#FF9800'>$item</li>";
        }
        echo "</ul>";
    }

    if (!empty($errors)) {
        echo "<h4 class='error'>⚠️ 错误 (" . count($errors) . " 项)</h4>";
        echo "<ul>";
        foreach ($errors as $item) {
            echo "<li class='error'>$item</li>";
        }
        echo "</ul>";
    }

    // ========================================
    // 验证表结构
    // ========================================

    echo "<h3>表结构验证：</h3>";

    $tables = ['family', 'family_member', 'notification', 'user', 'badge', 'energy_log'];
    echo "<table>";
    echo "<tr><th>表名</th><th>状态</th><th>记录数</th></tr>";

    foreach ($tables as $table) {
        $tableName = $config['prefix'] . $table;
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM `$tableName`");
            $count = $stmt->fetchColumn();
            echo "<tr><td><code>$tableName</code></td><td class='success'>✅ 存在</td><td>$count</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td><code>$tableName</code></td><td class='error'>❌ 不存在</td><td>-</td></tr>";
        }
    }

    echo "</table>";

    // ========================================
    // 显示表字段详情
    // ========================================

    echo "<h3>用户表字段检查：</h3>";
    echo "<pre>";
    $stmt = $pdo->query("SHOW COLUMNS FROM `{$config['prefix']}user` LIKE 'energy'");
    echo "energy 字段: " . ($stmt->rowCount() > 0 ? "✅ 存在" : "❌ 不存在") . "\n";

    $stmt = $pdo->query("SHOW COLUMNS FROM `{$config['prefix']}user` LIKE 'avatar'");
    echo "avatar 字段: " . ($stmt->rowCount() > 0 ? "✅ 存在" : "❌ 不存在") . "\n";

    $stmt = $pdo->query("SHOW COLUMNS FROM `{$config['prefix']}user` LIKE 'gender'");
    echo "gender 字段: " . ($stmt->rowCount() > 0 ? "✅ 存在" : "❌ 不存在") . "\n";

    $stmt = $pdo->query("SHOW COLUMNS FROM `{$config['prefix']}user` LIKE 'birthday'");
    echo "birthday 字段: " . ($stmt->rowCount() > 0 ? "✅ 存在" : "❌ 不存在") . "\n";
    echo "</pre>";

    // ========================================
    // 后续步骤
    // ========================================

    echo "<h3>📋 后续步骤：</h3>";

    echo "<div class='step'>";
    echo "<strong>步骤 1：清除后端缓存</strong><br>";
    echo "<pre>cd E:\\www\\youzi_czdy\\czdy_admin
rm -rf runtime/cache/*
rm -rf runtime/temp/*</pre>";
    echo "</div>";

    echo "<div class='step'>";
    echo "<strong>步骤 2：重启后端服务器</strong><br>";
    echo "如果是 Apache：sudo systemctl restart apache2<br>";
    echo "如果是 Nginx：sudo systemctl restart nginx<br>";
    echo "</div>";

    echo "<div class='step'>";
    echo "<strong>步骤 3：刷新前端页面</strong><br>";
    echo "按 <strong>Ctrl+F5</strong> 强制刷新浏览器<br>";
    echo "然后重新登录测试功能<br>";
    echo "</div>";

    echo "<hr>";
    echo "<p><strong>✅ 数据库修复完成！</strong></p>";
    echo "<p>如果仍有错误，请查看上述错误信息。</p>";

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
