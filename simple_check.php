<?php
// Simple database check script
$host = '127.0.0.1';
$user = 'xinghuojihua';
$pass = 'aa123456';
$db   = 'xinghuojihua';
$tables = ['fa_user', 'fa_wish', 'fa_family', 'fa_family_member', 'fa_task', 'fa_task_checkin', 'fa_badge', 'fa_user_badge'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $output = "Connected successfully to database '$db'\n\n";
    
    foreach ($tables as $table) {
        $output .= "Table: $table\n";
        try {
            $stmt = $pdo->query("SHOW FULL COLUMNS FROM $table");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($columns as $col) {
                $output .= "  - " . $col['Field'] . " (" . $col['Type'] . ")";
                if ($col['Key']) $output .= " [" . $col['Key'] . "]";
                if ($col['Comment']) $output .= " // " . $col['Comment'];
                $output .= "\n";
            }
        } catch (PDOException $e) {
            $output .= "  Error: " . $e->getMessage() . "\n";
        }
        $output .= "\n";
    }

    file_put_contents('check_result_php.txt', $output);
    echo "Check completed. See check_result_php.txt\n";

} catch (PDOException $e) {
    $msg = "Connection failed: " . $e->getMessage() . "\n";
    file_put_contents('check_result_php.txt', $msg);
    echo "Check failed. See check_result_php.txt\n";
}
?>
