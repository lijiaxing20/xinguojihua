<?php
define('APP_PATH', __DIR__ . '/application/');
define('BIND_MODULE','api');
// 加载框架引导文件
require __DIR__ . '/thinkphp/start.php';

use think\Db;

try {
    echo "--- fa_wish ---\n";
    $wish_columns = Db::query("DESCRIBE fa_wish");
    foreach ($wish_columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }

    echo "\n--- fa_task ---\n";
    $task_columns = Db::query("DESCRIBE fa_task");
    foreach ($task_columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }
    
    echo "\n--- fa_badge ---\n";
    $badge_columns = Db::query("DESCRIBE fa_badge");
    foreach ($badge_columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
