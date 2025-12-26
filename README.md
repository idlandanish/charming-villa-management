# 🏡 Charming Villa Management System

A robust, secure, and responsive web application designed to manage bookings, staff operations, and property availability for **Charming Villa Melaka**.

This system streamlines the entire homestay workflow, replacing manual spreadsheet tracking with a centralized digital dashboard for admins and mobile-friendly tools for cleaners.

---

## ✨ Key Features

### 👨‍💼 Admin Panel
* **Real-time Dashboard:** View daily arrivals, turnovers, and pending deposits at a glance.
* **Smart Booking System:**
    * **Conflict Detection:** Automatically prevents double-bookings.
    * **WhatsApp Integration:** One-click generation of WhatsApp messages for deposits, check-ins, and check-outs.
    * **Channel Management:** Track bookings from Airbnb, Agoda, Booking.com, and direct walk-ins.
* **Interactive Calendar:** Monthly view to spot availability gaps and overlapping dates.
* **Financial Tracking:** Monitor deposit status (Paid/Unpaid) and total revenue per booking.

### 🧹 Cleaner Portal
* **Mobile-First Design:** Cleaners can view their daily tasks on their phones.
* **Task Management:** Admins assign cleaning windows; cleaners mark units as "Ready" in real-time.

### 🔒 Security & Architecture
* **Secure Authentication:** Anti-brute force login protection and password hashing.
* **Input Sanitization:** Full protection against XSS (Cross-Site Scripting) and SQL Injection attacks.
* **Database Transaction Safety:** Prevents race conditions during simultaneous booking attempts.
* **Role-Based Access:** Distinct permissions for Admins vs. Staff.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Responsive Design), Vanilla JavaScript (ES6+).
* **Backend:** PHP 8+ (PDO for Database Abstraction).
* **Database:** MySQL / MariaDB.
* **Architecture:** RESTful API-driven architecture.

---

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/idlandanish/charming-villa-management.git](https://github.com/idlandanish/charming-villa-management.git)
    cd charming-villa-management
    ```

2.  **Set up the Database**
    * Import the SQL schema into your MySQL server (ensure database name matches config).
    * Default DB Name: `charming_villa`

3.  **Configure Credentials**
    * Create a file named `db_credentials.php` in the parent directory (outside the web root) for security.
    * Add your database details:
        ```php
        <?php
        $DB_HOST = "localhost";
        $DB_NAME = "charming_villa";
        $DB_USER = "root";
        $DB_PASS = "";
        ?>
        ```

4.  **Run the Server**
    * Host the files using Apache (XAMPP/WAMP) or Nginx.
    * Visit `/admin/login.html` to access the admin panel.

---

## 📂 Project Structure

```text
├── admin/            # Admin SPA (Single Page Application) files
├── api/              # PHP Backend Endpoints (JSON)
├── assets/           # CSS, Shared JS, and Images
├── cleaner/          # Cleaner Portal
├── tools/            # Utilities (Password hashing)
└── index.html        # Public Booking Website
```

## Owner
Charming Villa Melaka

## Status: 
🚧 Active Development
