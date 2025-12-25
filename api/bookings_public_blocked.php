<?php
require __DIR__ . "/config.php";

$sql = "
SELECT b.id, u.display_name AS unit, b.check_in, b.check_out, b.status
FROM bookings b
JOIN units u ON u.id = b.unit_id
WHERE b.status IN ('PENDING_DEPOSIT','CONFIRMED','CHECKED_IN')
";
$rows = $pdo->query($sql)->fetchAll();

json_ok(["bookings" => $rows]);
