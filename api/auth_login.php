<?php
require __DIR__ . "/config.php";

$data = body_json();
$username = trim((string)($data["username"] ?? ""));
$password = (string)($data["password"] ?? "");

if ($username === "" || $password === "") json_err("Missing username/password");

$stmt = $pdo->prepare("SELECT id, username, password_hash, role, is_active FROM users WHERE username = ? LIMIT 1");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || (int)$user["is_active"] !== 1) json_err("Invalid login", 401);
if (!password_verify($password, $user["password_hash"])) json_err("Invalid login", 401);

$_SESSION["user"] = [
  "id" => (int)$user["id"],
  "username" => $user["username"],
  "role" => $user["role"]
];

json_ok(["user" => $_SESSION["user"]]);
