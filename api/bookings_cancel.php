<?php
require __DIR__ . "/config.php";
require_login(["admin"]);

$d = body_json();
$id = (int)($d["id"] ?? 0);
if ($id <= 0) json_err("Missing id");

$upd = $pdo->prepare("UPDATE bookings SET status='CANCELLED' WHERE id = ?");
$upd->execute([$id]);

json_ok();
