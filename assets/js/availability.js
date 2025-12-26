// assets/js/availability.js
(() => {
  function qs(id){ return document.getElementById(id); }

  // Security Helper: Prevents XSS in unit names/locations
  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function matchesLoc(u, loc){
    if(loc==="ALL") return true;
    return u.location === loc;
  }

  function parseISO(s){
    const [y,m,d] = s.split("-").map(Number);
    return new Date(y, m-1, d);
  }
  
  function overlap(aStart, aEnd, bStart, bEnd){
    // ranges [start, end)
    return (aStart < bEnd) && (aEnd > bStart);
  }

  function isUnitAvailable(bookings, unitName, checkIn, checkOut){
    const aStart = parseISO(checkIn);
    const aEnd = parseISO(checkOut);
    return !bookings.some(b=>{
      if(b.unit !== unitName) return false;
      const bStart = parseISO(b.check_in);
      const bEnd = parseISO(b.check_out);
      return overlap(aStart, aEnd, bStart, bEnd);
    });
  }

  function cardHTML(u, available, checkIn, checkOut){
    const btn = available
      ? `<a class="btn btn-primary" href="./book.html?unit=${encodeURIComponent(u.display_name)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}">Request Booking</a>`
      : `<a class="btn" href="./contact.html">Contact</a>`;

    const viewBtn = u.link
      ? `<a class="btn" href="${u.link}">View unit</a>` // links are usually safe, but check if user input allowed here
      : `<a class="btn" href="./properties.html">View unit</a>`;

    // SECURED: Using esc() for display name, location, type
    return `
    <div class="card">
      <div class="pcard-title">${esc(u.display_name)}</div>
      <div class="pcard-meta">${esc(u.location)} • ${esc(u.type)}</div>
      <div class="pcard-actions" style="margin-top:10px;">
        ${viewBtn}
        ${btn}
      </div>
    </div>`;
  }

  async function fetchJSON(url){
    const res = await fetch(url);
    return await res.json();
  }

  async function init(){
    const unitsRes = await fetchJSON("./api/units_list.php").catch(()=>({ok:false}));
    const units = unitsRes.ok ? unitsRes.units : [];

    const bookingsRes = await fetchJSON("./api/bookings_public_blocked.php").catch(()=>({ok:false}));
    const blocked = bookingsRes.ok ? bookingsRes.bookings : [];

    const unitSel = qs("unit");
    if(unitSel) {
      units.forEach(u=>{
        const opt = document.createElement("option");
        opt.value = u.display_name; // Value is safe in option
        opt.textContent = `${u.display_name} — ${u.location}`;
        unitSel.appendChild(opt);
      });
    }

    const today = new Date();
    const pad = n => String(n).padStart(2,"0");
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const t1 = new Date(today); t1.setDate(t1.getDate()+1);
    
    if(qs("checkIn")) qs("checkIn").value = fmt(today);
    if(qs("checkOut")) qs("checkOut").value = fmt(t1);

    function run(){
      if(!qs("loc")) return; // Guard clause if page elements missing

      const loc = qs("loc").value;
      const unit = unitSel ? unitSel.value : "ANY";
      const checkIn = qs("checkIn").value;
      const checkOut = qs("checkOut").value;

      const msg = qs("msg");
      if(!checkIn || !checkOut){
        msg.textContent = "Please select check-in and check-out dates.";
        return;
      }
      if(checkOut <= checkIn){
        msg.textContent = "Check-out must be after check-in.";
        return;
      }
      msg.textContent = "";

      const list = units
        .filter(u=>matchesLoc(u, loc))
        .filter(u=> unit==="ANY" ? true : u.display_name===unit);

      const available = [];
      const unavailable = [];

      list.forEach(u=>{
        const ok = isUnitAvailable(blocked, u.display_name, checkIn, checkOut);
        (ok ? available : unavailable).push(u);
      });

      if(qs("availableGrid")) {
        qs("availableGrid").innerHTML =
          available.map(u=>cardHTML(u, true, checkIn, checkOut)).join("")
          || `<div class="muted">No available units for these dates.</div>`;
      }

      if(qs("unavailableGrid")) {
        qs("unavailableGrid").innerHTML =
          unavailable.map(u=>cardHTML(u, false, checkIn, checkOut)).join("")
          || `<div class="muted">All units are available 🎉</div>`;
      }
    }

    const btn = qs("btnCheck");
    if(btn) btn.addEventListener("click", run);
    ["loc","unit","checkIn","checkOut"].forEach(id=>{
      const el = qs(id);
      if(el) el.addEventListener("change", run);
    });

    // Run once if elements exist
    if(qs("loc")) run();
  }

  document.addEventListener("DOMContentLoaded", init);
})();