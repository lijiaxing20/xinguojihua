<?php
echo "Script Version 2\n";
$host = '127.0.0.1';
$user = 'root';
$db   = 'xinghuojihua';

// Parse .env if exists to get credentials
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && substr($line, 0, 1) != '#') {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if ($key == 'database.hostname') $host = $value;
            if ($key == 'database.username') $user = $value;
            // if ($key == 'database.password') $pass = $value; // We try multiple
            if ($key == 'database.database') $db = $value;
        }
    }
}

$output = "Checking schema v2...\n";

$passwords = ['', 'root', '123456'];
$connected = false;
$pdo = null;

foreach ($passwords as $p) {
    try {
        $output .= "Trying password: '$p' ...\n";
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $p);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $connected = true;
        $output .= "Connected with password '$p'!\n";
        break;
    } catch (PDOException $e) {
        $output .= "Failed with '$p': " . $e->getMessage() . "\n";
    }
}

if ($connected) {
    try {
        // Check fa_wish columns
        $output .= "fa_wish columns:\n";
        $stmt = $pdo->query("SHOW COLUMNS FROM fa_wish");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $output .= $row['Field'] . " (" . $row['Type'] . ")\n";
        }

        // Check fa_task columns
        $output .= "\nfa_task columns:\n";
        $stmt = $pdo->query("SHOW COLUMNS FROM fa_task");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $output .= $row['Field'] . " (" . $row['Type'] . ")\n";
        }

    } catch (PDOException $e) {
        $output .= "Query Error: " . $e->getMessage() . "\n";
    }
} else {
    $output .= "Could not connect with any password.\n";
}

$file = 'e:/www/youzi_czdy/check_result_v2_' . time() . '.txt';
file_put_contents($file, $output);
echo "Wrote to $file";
?>
