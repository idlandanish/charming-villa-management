<?php
require __DIR__ . "/config.php";
if (!isset($_SESSION["user"])) json_err("Unauthorized", 401);
json_ok(["user" => $_SESSION["user"]]);
