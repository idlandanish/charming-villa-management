<?php
// api/config.php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

// 1. Try to load secured credentials from a file NOT in git
$credsFile = __DIR__ . "/../db_credentials.php";
if (file_exists($credsFile)) {
    require $credsFile; // Should set $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME
} else {
    // Fallback for local development (XAMPP default)
    $DB_HOST = "127.0.0.1";
    $DB_NAME = "charming_villa";
    $DB_USER = "root";
    $DB_PASS = ""; 
}

try {
  $pdo = new PDO(
    "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false, // Better security
    ]
  );
} catch (Throwable $e) {
  // Log error internally, don't show user details
  error_log("DB Connection Error: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "Internal Server Error"]);
  exit;
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

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