<?php
// 简单的数据库安装脚本
define('APP_PATH', __DIR__ . '/../application/');
// 手动加载 .env
$envFile = __DIR__ . '/../.env';
$dbConfig = [];
if (is_file($envFile)) {
    $env = parse_ini_file($envFile, true);
    if (isset($env['database'])) {
        $dbConfig = $env['database'];
    }
}

// 修正配置键名以匹配 ThinkPHP
$thinkDbConfig = [
    'type'            => 'mysql',
    'hostname'        => $dbConfig['hostname'] ?? '127.0.0.1',
    'database'        => $dbConfig['database'] ?? 'test',
    'username'        => $dbConfig['username'] ?? 'root',
    'password'        => $dbConfig['password'] ?? '',
    'hostport'        => $dbConfig['hostport'] ?? '3306',
    'prefix'          => $dbConfig['prefix'] ?? 'fa_',
    'charset'         => 'utf8mb4',
    'debug'           => true,
];

require __DIR__ . '/../thinkphp/base.php';

use think\Db;
use think\Config;

// 覆盖数据库配置
Config::set('database', $thinkDbConfig);

echo "Connecting to database " . $thinkDbConfig['database'] . " at " . $thinkDbConfig['hostname'] . "...\n";

try {
    $sqlContent = file_get_contents(__DIR__ . '/../database_full_fix.sql');
    if (!$sqlContent) {
        die("Error: database_full_fix.sql not found.\n");
    }

    // 分割SQL语句 (更健壮的分割)
    $sqlLines = explode(';', $sqlContent);
    
    foreach ($sqlLines as $sql) {
        $sql = trim($sql);
        if (empty($sql)) continue;
        
        try {
            Db::execute($sql);
            echo "Executed: " . substr(str_replace("\n", " ", $sql), 0, 50) . "...\n";
        } catch (\Exception $e) {
            echo "Warning: " . $e->getMessage() . "\n";
        }
    }
    
    echo "Database setup completed successfully.\n";
    
} catch (\Exception $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
