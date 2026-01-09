<?php
// Try to read .env if it exists
$envPath = __DIR__ . '/czdy_admin/.env';
$env = [];
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && substr($line, 0, 1) != '#') {
            list($key, $value) = explode('=', $line, 2);
            $env[trim($key)] = trim($value);
        }
    }
}

function env($key, $default = null) {
    global $env;
    return isset($env[$key]) ? $env[$key] : $default;
}

$hostname = env('database.hostname', '127.0.0.1');
$database = env('database.database', 'fastadmin');
$username = env('database.username', 'root');
$password = env('database.password', '');
$hostport = env('database.hostport', '3306');

echo "Connecting to DB: $database at $hostname:$hostport as $username\n";

try {
    $dsn = "mysql:host=$hostname;port=$hostport;dbname=$database;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected successfully.\n";

    // Check fa_wish
    echo "\nChecking fa_wish columns:\n";
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM fa_wish");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $hasRequiredEnergy = false;
        foreach ($columns as $col) {
            echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
            if ($col['Field'] === 'required_energy') {
                $hasRequiredEnergy = true;
            }
        }

        if (!$hasRequiredEnergy) {
            echo "WARNING: required_energy column MISSING in fa_wish!\n";
            $pdo->exec("ALTER TABLE fa_wish ADD COLUMN required_energy INT(10) UNSIGNED DEFAULT '0' COMMENT '所需能量值' AFTER description");
            echo "Added required_energy column.\n";
        } else {
            echo "required_energy column exists.\n";
        }
    } catch (PDOException $e) {
        echo "Error checking fa_wish: " . $e->getMessage() . "\n";
    }

    // Check fa_task
    echo "\nChecking fa_task columns:\n";
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM fa_task");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo "- " . $col['Field'] . "\n";
        }
    } catch (PDOException $e) {
         echo "Error checking fa_task: " . $e->getMessage() . "\n";
    }

    // Check fa_badge
    echo "\nChecking fa_badge columns:\n";
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM fa_badge");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo "- " . $col['Field'] . "\n";
        }
    } catch (PDOException $e) {
         echo "Error checking fa_badge: " . $e->getMessage() . "\n";
    }

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    // Try without dbname to check if DB exists
    try {
        $dsn = "mysql:host=$hostname;port=$hostport;charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password);
        echo "Connected to server, listing databases:\n";
        $stmt = $pdo->query("SHOW DATABASES");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "- " . $row['Database'] . "\n";
        }
    } catch (Exception $ex) {
        echo "Could not connect to server: " . $ex->getMessage() . "\n";
    }
}
