Charming Villa Melaka — MySQL Admin System (XAMPP)

Security choice:
- Public site stays in root
- Admin system lives under /admin and is protected by PHP session login.
- Root /admin.html redirects to /admin/login.html

1) Put folder into XAMPP:
   C:\xampp\htdocs\charming-villa\   (or /Applications/XAMPP/htdocs/charming-villa/)

2) Create database + tables:
   - Open phpMyAdmin
   - Create DB: charming_villa
   - Run the SQL below (or reuse your existing tables)

SQL (tables):
- users
- units
- bookings
- cleaning_tasks

(If you already created them, you can skip.)

3) Create admin user:
   - In phpMyAdmin, insert into users:
     username: admin
     password_hash: (use PHP password_hash)
     role: admin

Easiest:
- Create a temporary file:
  tools/hash.php
  <?php echo password_hash("charming123", PASSWORD_DEFAULT);
- Open:
  http://localhost/charming-villa/tools/hash.php
- Copy hash into users.password_hash
- DELETE tools/hash.php after.

4) Admin login:
   http://localhost/charming-villa/admin/login.html

Admin pages:
- Dashboard: /admin/dashboard.html
- Bookings: /admin/bookings.html
- Calendar: /admin/calendar.html
- Cleaning: /admin/cleaning.html
- Settings: /admin/settings.html

Public availability reads from DB:
- /check-availability.html  (uses api/bookings_public_blocked.php)

Note:
- Protected API endpoints require login:
  bookings_list, bookings_create, bookings_update, bookings_cancel, cleaning_assign
- Public endpoints:
  units_list, bookings_public_blocked
