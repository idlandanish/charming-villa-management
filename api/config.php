<?php
// api/config.php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

$DB_HOST = "127.0.0.1";
$DB_NAME = "charming_villa";
$DB_USER = "root";
$DB_PASS = ""; // XAMPP default

try {
  $pdo = new PDO(
    "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "DB connection failed"]);
  exit;
}

session_start();

function json_ok($data = []) {
  echo json_encode(["ok" => true] + $data);
  exit;
}
function json_err(string $msg, int $code = 400) {
  http_response_code($code);
  echo json_encode(["ok" => false, "error" => $msg]);
  exit;
}
function require_login(array $roles = ["admin","staff"]) {
  if (!isset($_SESSION["user"])) json_err("Unauthorized", 401);
  if (!in_array($_SESSION["user"]["role"], $roles, true)) json_err("Forbidden", 403);
}
function body_json(): array {
  $raw = file_get_contents("php://input");
  $data = json_decode($raw ?: "{}", true);
  return is_array($data) ? $data : [];
}
