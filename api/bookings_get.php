<?php
require __DIR__ . "/config.php";
require_login(["admin","staff"]);

$id = (int)($_GET["id"] ?? 0);
if ($id <= 0) json_err("Missing id");

$stmt = $pdo->prepare("
SELECT 
  b.*,
  u.display_name AS unit_name,
  u.location,
  ct.assigned_to,
  ct.task_status
FROM bookings b
JOIN units u ON u.id = b.unit_id
LEFT JOIN cleaning_tasks ct ON ct.booking_id = b.id
WHERE b.id = ?
LIMIT 1
");
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) json_err("Not found", 404);

json_ok(["booking" => $row]);
