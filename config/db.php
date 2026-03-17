<?php
$config = require __DIR__.'/config.php';

try{
    $db = $config['db'];
    $dsn = "{$db['driver']}:host={$db['host']};port={$db['port']};dbname={$db['database']}";
    $conn = new PDO(
        $dsn,
        $db['username'],
        $db['password'],
        $db['options']
    );
}
catch(PDOException $e){
    echo "Connection failed: " . $e->getMessage();
    exit;
}

?>