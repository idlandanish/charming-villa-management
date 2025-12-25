/**
 * Bookings data (static).
 * - Dates are YYYY-MM-DD
 * - checkOut date is the day guests leave (12 PM)
 * - checkIn date is the day guests arrive (3 PM)
 *
 * IMPORTANT: This is demo data. Replace with your real bookings.
 */
window.CV_BOOKINGS = [
  // Shah Alam
  { unit: "Tulips T1", checkIn: "2026-01-03", checkOut: "2026-01-05", guest: "Demo Guest", notes: "2 pax", cleaner: "Sibling" },
  { unit: "Habitus H1", checkIn: "2026-01-10", checkOut: "2026-01-12", guest: "Demo Guest", notes: "Family", cleaner: "Caretaker" },

  // Melaka
  { unit: "Villa 909", checkIn: "2026-01-18", checkOut: "2026-01-20", guest: "Demo Guest", notes: "Group trip", cleaner: "Caretaker" },
  { unit: "Villa 802", checkIn: "2026-02-01", checkOut: "2026-02-03", guest: "Demo Guest", notes: "Weekend", cleaner: "Sibling" }
];

window.CV_UNITS = [
  { id: "Tulips T1", location: "Shah Alam", type: "Apartment", link: "./property/tulips-t1.html" },
  { id: "Tulips T2", location: "Shah Alam", type: "Apartment", link: "./property/tulips-t2.html" },
  { id: "Habitus H1", location: "Shah Alam", type: "Apartment", link: "./property/habitus-h1.html" },
  { id: "Habitus H2", location: "Shah Alam", type: "Apartment", link: "./property/habitus-h2.html" },
  { id: "Habitus H3", location: "Shah Alam", type: "Apartment", link: "./property/habitus-h3.html" },
  { id: "Villa 909", location: "Melaka (A'Famosa)", type: "Villa", link: "./property/villa-909.html" },
  { id: "Villa 802", location: "Melaka (A'Famosa)", type: "Villa", link: "./property/villa-802.html" },
  { id: "Villa 143", location: "Melaka (A'Famosa)", type: "Villa", link: "./property/villa-143.html" }
];
