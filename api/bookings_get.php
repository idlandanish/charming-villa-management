<?php
require __DIR__ . "/config.php";
require_login(["admin","staff"]);

$id = (int)($_GET["id"] ?? 0);
if ($id <= 0) json_err("Missing id");

// We fetch the booking and the LATEST cleaning task status
$stmt = $pdo->prepare("
SELECT 
  b.*,
  u.display_name AS unit_name,
  u.location,
  (SELECT assigned_to FROM cleaning_tasks WHERE booking_id = b.id ORDER BY id DESC LIMIT 1) as assigned_to,
  (SELECT task_status FROM cleaning_tasks WHERE booking_id = b.id ORDER BY id DESC LIMIT 1) as task_status
FROM bookings b
JOIN units u ON u.id = b.unit_id
WHERE b.id = ?
LIMIT 1
");
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) json_err("Not found", 404);

json_ok(["booking" => $row]);