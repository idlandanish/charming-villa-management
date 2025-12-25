<?php
require __DIR__ . "/config.php";
require_login(["admin","staff"]);

$d = body_json();
$booking_id = (int)($d["booking_id"] ?? 0);
$assigned_to = trim((string)($d["assigned_to"] ?? ""));
$assigned_phone = trim((string)($d["assigned_phone"] ?? ""));
$task_status = (string)($d["task_status"] ?? "ASSIGNED");
$cleaning_notes = trim((string)($d["cleaning_notes"] ?? ""));

if ($booking_id <= 0) json_err("Missing booking_id");

$allowed = ["NOT_ASSIGNED","ASSIGNED","DONE"];
if (!in_array($task_status, $allowed, true)) json_err("Invalid task_status");

// normalize phone: keep digits only (optional but useful)
$assigned_phone = preg_replace('/\\D+/', '', $assigned_phone);

$stmt = $pdo->prepare("SELECT id FROM cleaning_tasks WHERE booking_id = ? LIMIT 1");
$stmt->execute([$booking_id]);
$row = $stmt->fetch();

if ($row) {
  $u = $pdo->prepare("UPDATE cleaning_tasks 
    SET assigned_to=?, assigned_phone=?, task_status=?, cleaning_notes=? 
    WHERE booking_id=?");
  $u->execute([
    $assigned_to ?: null,
    $assigned_phone ?: null,
    $task_status,
    $cleaning_notes ?: null,
    $booking_id
  ]);
} else {
  $i = $pdo->prepare("INSERT INTO cleaning_tasks 
    (booking_id, assigned_to, assigned_phone, task_status, cleaning_notes) 
    VALUES (?,?,?,?,?)");
  $i->execute([
    $booking_id,
    $assigned_to ?: null,
    $assigned_phone ?: null,
    $task_status,
    $cleaning_notes ?: null
  ]);
}

json_ok();
