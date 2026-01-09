<?php
$dsn = 'mysql:host=127.0.0.1;dbname=xinghuojihua;charset=utf8mb4';
$username = 'xinghuojihua';
$password = 'aa123456';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Columns in fa_wish table:\n";
    $stmt = $pdo->query("DESCRIBE fa_wish");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }

    echo "\nColumns in fa_task table:\n";
    $stmt = $pdo->query("DESCRIBE fa_task");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
