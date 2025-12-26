<?php
require __DIR__ . "/config.php";
require_login(["admin","staff"]);

$q = trim($_GET["q"] ?? "");
$status = $_GET["status"] ?? "ALL";
$unit_id = $_GET["unit_id"] ?? "ALL";

$where = [];
$params = [];

if ($q !== "") {
  $where[] = "(b.customer_name LIKE ? OR b.customer_phone LIKE ? OR u.display_name LIKE ? OR b.channel LIKE ?)";
  $like = "%{$q}%";
  array_push($params, $like, $like, $like, $like);
}
if ($status !== "ALL") {
  $where[] = "b.status = ?";
  $params[] = $status;
}
if ($unit_id !== "ALL") {
  $where[] = "b.unit_id = ?";
  $params[] = (int)$unit_id;
}

$sql = "
SELECT 
  b.*,
  u.display_name AS unit_name,
  u.location,
  -- Get the most recent cleaning task info if multiple exist
  (SELECT assigned_to FROM cleaning_tasks WHERE booking_id = b.id ORDER BY id DESC LIMIT 1) as assigned_to,
  (SELECT task_status FROM cleaning_tasks WHERE booking_id = b.id ORDER BY id DESC LIMIT 1) as task_status
FROM bookings b
JOIN units u ON u.id = b.unit_id
" . (count($where) ? (" WHERE " . implode(" AND ", $where)) : "") . "
ORDER BY b.check_in DESC
LIMIT 500
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

json_ok(["bookings" => $rows]);