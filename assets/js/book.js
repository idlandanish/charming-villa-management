function qs(id){ return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", ()=>{
  const params = new URLSearchParams(location.search);
  const unit = params.get("unit") || "";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";

  qs("unit").value = unit;
  qs("dates").value = (checkIn && checkOut) ? `${checkIn} to ${checkOut}` : "";

  qs("btnSend").addEventListener("click", ()=>{
    const name = qs("name").value.trim() || "-";
    const pax = qs("pax").value.trim() || "-";
    const notes = qs("notes").value.trim();

    const lines = [
      "Hi Charming Villa Melaka, I want to request a booking:",
      `• Unit: ${unit || "-"}`,
      `• Dates: ${checkIn || "-"} to ${checkOut || "-"}`,
      `• Name: ${name}`,
      `• Pax: ${pax}`,
    ];
    if(notes) lines.push(`• Notes: ${notes}`);
    lines.push("", "Check-in 3:00 PM, check-out 12:00 PM.");

    const WA_NUMBER = "60XXXXXXXXXX";
    const msg = encodeURIComponent(lines.join("\n"));
    const wa = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    window.open(wa, "_blank");
  });
});
