# 📡 API Documentation

The backend consists of PHP scripts returning JSON. All responses follow a standard format.

## Base URL
`/api/` relative to the project root.

## Authentication
* **Method:** PHP Sessions (`$_SESSION`).
* **Requirement:** Most endpoints require the user to be logged in via `auth_login.php`.

---

## 🔐 Auth Endpoints

### `POST /api/auth_login.php`
Logs a user (Admin or Staff) into the system.
* **Payload:** `{ "username": "admin", "password": "..." }`
* **Response:** `{ "ok": true, "user": { ... } }`

### `POST /api/auth_logout.php`
Destroys the session.

### `GET /api/auth_me.php`
Returns the currently logged-in user. Used to check if the session is still active.

---

## 📅 Booking Endpoints

### `GET /api/bookings_list.php`
Fetches a list of bookings with optional filters.
* **Params:**
    * `status`: (Optional) e.g., 'CONFIRMED', 'PENDING_DEPOSIT', 'ALL'.
    * `unit_id`: (Optional) ID of the unit or 'ALL'.
    * `q`: (Optional) Search term (Customer Name, Phone, or Unit Name).
* **Response:** `{ "ok": true, "bookings": [ ... ] }`

### `POST /api/bookings_create.php`
Creates a new booking. **Includes conflict checking.**
* **Payload:**
    ```json
    {
      "unit_id": 1,
      "check_in": "2023-12-25",
      "check_out": "2023-12-27",
      "customer_name": "John Doe",
      "customer_phone": "60173949376",
      "channel": "Airbnb",
      "status": "CONFIRMED",
      "notes": "Late check-in"
    }
    ```

### `POST /api/bookings_update.php`
Updates an existing booking.
* **Payload:** Same as create, plus `"id": 123` and `"deposit_paid": 1` (if applicable).

### `POST /api/bookings_cancel.php`
Sets a booking status to `CANCELLED`.
* **Payload:** `{ "id": 123 }`

---

## 🧹 Cleaning Endpoints

### `GET /api/cleaner_tasks.php`
Fetches tasks assigned to the currently logged-in cleaner.

### `POST /api/cleaning_mark_done.php`
Updates the cleaning status of a unit.
* **Payload:** `{ "booking_id": 123, "status": "DONE" }`