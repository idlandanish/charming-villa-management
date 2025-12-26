# 🚀 Deployment Guide

## 1. Server Requirements
* **Web Server:** Apache or Nginx.
* **PHP:** Version 8.0 or higher.
* **Database:** MySQL or MariaDB.
* **Extensions:** `pdo_mysql` must be enabled in PHP.

## 2. File Setup
1. Upload all files from the `charming-villa` folder to `public_html`.
2. **Security Critical:**
   * Delete `tools/hash.php` or password-protect the `/tools` directory.
   * Ensure `.gitignore` is NOT uploaded (it's for development).

## 3. Database Setup
1. Create a new MySQL Database (e.g., `charming_live`).
2. Import the `database.sql` file (schema) into this database.

## 4. Configuration
1. Create a file named `db_credentials.php` **one level above** your `public_html` folder if possible (for security), or inside the root folder if your host forces it.
2. Paste the following content and fill in your LIVE database details:

```php
<?php
$DB_HOST = "localhost";
$DB_NAME = "charming_live";     // Your live DB name
$DB_USER = "charming_user";     // Your live DB user
$DB_PASS = "StrongPassword123"; // Your live DB password
?>