<?php
require __DIR__ . "/config.php";
require_login(["admin"]);

$d = body_json();

$unit_id = (int)($d["unit_id"] ?? 0);
$check_in = (string)($d["check_in"] ?? "");
$check_out = (string)($d["check_out"] ?? "");
$channel = trim((string)($d["channel"] ?? ""));
$customer_name = trim((string)($d["customer_name"] ?? ""));
$customer_phone = trim((string)($d["customer_phone"] ?? ""));
$pax = $d["pax"] ?? null;
$status = (string)($d["status"] ?? "INQUIRY");
$notes = trim((string)($d["notes"] ?? ""));

if ($unit_id <= 0) json_err("Missing unit");
if ($check_in === "" || $check_out === "") json_err("Missing dates");
if ($customer_name === "") json_err("Missing customer name");

$allowed = ["INQUIRY","PENDING_DEPOSIT","CONFIRMED","CHECKED_IN","CHECKED_OUT","CANCELLED"];
if (!in_array($status, $allowed, true)) json_err("Invalid status");

$conflictSql = "
SELECT COUNT(*) AS cnt
FROM bookings
WHERE unit_id = ?
  AND status <> 'CANCELLED'
  AND NOT (check_out <= ? OR check_in >= ?)
";
$stmt = $pdo->prepare($conflictSql);
$stmt->execute([$unit_id, $check_in, $check_out]);
if ((int)$stmt->fetch()["cnt"] > 0) json_err("Date conflict for this unit");

$ins = $pdo->prepare("
INSERT INTO bookings (unit_id, check_in, check_out, channel, customer_name, customer_phone, pax, status, notes)
VALUES (?,?,?,?,?,?,?,?,?)
");
$ins->execute([
  $unit_id, $check_in, $check_out,
  $channel ?: null,
  $customer_name,
  $customer_phone ?: null,
  ($pax === null || $pax === "") ? null : (int)$pax,
  $status,
  $notes ?: null
]);

json_ok(["id" => (int)$pdo->lastInsertId()]);
