<?php
// tools/hash.php
// SECURITY: Only allow running from Command Line Interface (CLI)
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die("Forbidden: This tool can only be run from the command line.");
}

// Check for argument or use default "clean"
$pass = $argv[1] ?? "clean"; 

echo "Generating hash for: '$pass'\n";
echo "Hash: " . password_hash($pass, PASSWORD_DEFAULT) . "\n";
?>