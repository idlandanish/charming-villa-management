<?php
require __DIR__ . "/config.php";
require_login(["cleaner","admin","staff"]);

$d = body_json();
$booking_id = (int)($d["booking_id"] ?? 0);
if ($booking_id <= 0) json_err("Missing booking_id");

$me = $_SESSION["user"] ?? null;
$role = $me["role"] ?? "";
$username = $me["username"] ?? "";

// Cleaners can only mark their own tasks
if ($role === "cleaner") {
  $stmt = $pdo->prepare("SELECT assigned_to FROM cleaning_tasks WHERE booking_id=? LIMIT 1");
  $stmt->execute([$booking_id]);
  $row = $stmt->fetch();
  if (!$row) json_err("Task not found", 404);
  if (($row["assigned_to"] ?? "") !== $username) json_err("Not allowed", 403);
}

$upd = $pdo->prepare("UPDATE cleaning_tasks SET task_status='DONE' WHERE booking_id=?");
$upd->execute([$booking_id]);

json_ok();
