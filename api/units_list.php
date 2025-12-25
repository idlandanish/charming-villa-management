<?php
require __DIR__ . "/config.php";

$stmt = $pdo->query("SELECT id, code, display_name, location, type FROM units WHERE is_active = 1 ORDER BY location, display_name");
$units = $stmt->fetchAll();

json_ok(["units" => $units]);
