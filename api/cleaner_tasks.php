<?php
require __DIR__ . "/config.php";
require_login(["cleaner"]);

$me = $_SESSION["user"] ?? null;
$username = $me["username"] ?? "";
if ($username === "") json_err("Session invalid", 401);

// days ahead filter (optional)
$days = (int)($_GET["days"] ?? 7);
if ($days < 1) $days = 1;
if ($days > 60) $days = 60;

$stmt = $pdo->prepare("
SELECT
  b.id AS booking_id,
  b.check_out,
  b.customer_name,
  u.display_name AS unit_name,
  u.location,
  ct.assigned_to,
  ct.assigned_phone,
  ct.task_status,
  ct.cleaning_notes
FROM cleaning_tasks ct
JOIN bookings b ON b.id = ct.booking_id
JOIN units u ON u.id = b.unit_id
WHERE ct.assigned_to = ?
  AND b.status <> 'CANCELLED'
  AND b.check_out >= CURDATE()
  AND b.check_out <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
ORDER BY b.check_out ASC
");
$stmt->execute([$username, $days]);
$rows = $stmt->fetchAll();

json_ok(["tasks" => $rows, "username" => $username]);
