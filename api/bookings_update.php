<?php
require __DIR__ . "/config.php";
require_login(["admin"]);

$d = body_json();
$id = (int)($d["id"] ?? 0);
if ($id <= 0) json_err("Missing id");

$unit_id = (int)($d["unit_id"] ?? 0);
$check_in = (string)($d["check_in"] ?? "");
$check_out = (string)($d["check_out"] ?? "");
$channel = trim((string)($d["channel"] ?? ""));
$customer_name = trim((string)($d["customer_name"] ?? ""));
$customer_phone = trim((string)($d["customer_phone"] ?? ""));
$pax = $d["pax"] ?? null;
$status = (string)($d["status"] ?? "INQUIRY");
$total_price = $d["total_price"] ?? null;
$deposit_amount = $d["deposit_amount"] ?? null;
$deposit_paid = (int)($d["deposit_paid"] ?? 0);
$deposit_paid_at = $d["deposit_paid_at"] ?? null;
$notes = trim((string)($d["notes"] ?? ""));

if ($unit_id <= 0) json_err("Missing unit");
if ($check_in === "" || $check_out === "") json_err("Missing dates");
if ($customer_name === "") json_err("Missing customer name");

$allowed = ["INQUIRY","PENDING_DEPOSIT","CONFIRMED","CHECKED_IN","CHECKED_OUT","CANCELLED"];
if (!in_array($status, $allowed, true)) json_err("Invalid status");

if ($deposit_paid === 1 && ($deposit_paid_at === null || $deposit_paid_at === "")) {
  $deposit_paid_at = date("Y-m-d H:i:s");
} elseif ($deposit_paid === 0) {
  $deposit_paid_at = null;
}

function toDec($v){
  if ($v === null || $v === "") return null;
  if (!is_numeric($v)) return null;
  return (float)$v;
}

$total_price = toDec($total_price);
$deposit_amount = toDec($deposit_amount);

$paxVal = ($pax === null || $pax === "") ? null : (int)$pax;

# Check exists
$cur = $pdo->prepare("SELECT id FROM bookings WHERE id = ? LIMIT 1");
$cur->execute([$id]);
if (!$cur->fetch()) json_err("Not found", 404);

# Conflict check (ignore cancelled bookings, and if this booking is being set CANCELLED, skip)
if ($status !== "CANCELLED") {
  $conflictSql = "
  SELECT COUNT(*) AS cnt
  FROM bookings
  WHERE unit_id = ?
    AND id <> ?
    AND status <> 'CANCELLED'
    AND NOT (check_out <= ? OR check_in >= ?)
  ";
  $stmt = $pdo->prepare($conflictSql);
  $stmt->execute([$unit_id, $id, $check_in, $check_out]);
  if ((int)$stmt->fetch()["cnt"] > 0) json_err("Date conflict for this unit");
}

$upd = $pdo->prepare("
UPDATE bookings SET
  unit_id = ?,
  check_in = ?,
  check_out = ?,
  channel = ?,
  customer_name = ?,
  customer_phone = ?,
  pax = ?,
  status = ?,
  total_price = ?,
  deposit_amount = ?,
  deposit_paid = ?,
  deposit_paid_at = ?,
  notes = ?
WHERE id = ?
");
$upd->execute([
  $unit_id,
  $check_in,
  $check_out,
  $channel ?: null,
  $customer_name,
  $customer_phone ?: null,
  $paxVal,
  $status,
  $total_price,
  $deposit_amount,
  $deposit_paid,
  $deposit_paid_at,
  $notes ?: null,
  $id
]);

json_ok();
