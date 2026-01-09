<?php
require __DIR__ . '/think';
// 检查 fa_wish 表结构
echo "Checking fa_wish table structure...\n";
$columns = \think\Db::query("SHOW COLUMNS FROM fa_wish");
foreach ($columns as $col) {
    echo $col['Field'] . " - " . $col['Type'] . "\n";
}

echo "\nChecking fa_family_member model...\n";
// 检查 FamilyMember 模型关联
try {
    $member = new \app\common\model\FamilyMember();
    if (method_exists($member, 'user')) {
        echo "FamilyMember has 'user' relation.\n";
    } else {
        echo "FamilyMember MISSING 'user' relation.\n";
    }
} catch (\Exception $e) {
    echo "Error checking model: " . $e->getMessage() . "\n";
}
