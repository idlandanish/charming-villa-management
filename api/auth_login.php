<?php
require __DIR__ . "/config.php";

$data = body_json();
$username = trim((string)($data["username"] ?? ""));
$password = (string)($data["password"] ?? "");

if ($username === "" || $password === "") {
    sleep(1); // Slow down empty requests
    json_err("Missing username/password");
}

$stmt = $pdo->prepare("SELECT id, username, password_hash, role, is_active FROM users WHERE username = ? LIMIT 1");
$stmt->execute([$username]);
$user = $stmt->fetch();

// Verification
$valid = true;
if (!$user) $valid = false;
if ($valid && (int)$user["is_active"] !== 1) $valid = false;
if ($valid && !password_verify($password, $user["password_hash"])) $valid = false;

if (!$valid) {
    // SECURITY: Slow down brute force attacks
    sleep(2); 
    json_err("Invalid login", 401);
}

$_SESSION["user"] = [
  "id" => (int)$user["id"],
  "username" => $user["username"],
  "role" => $user["role"]
];

json_ok(["user" => $_SESSION["user"]]);