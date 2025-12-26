async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

function onlyDigits(s){ return String(s||"").replace(/\D+/g,""); }
function waLink(phone, message){
  const p = onlyDigits(phone);
  if(!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

function msgDeposit(b){
  return `Hi ${b.customer_name || ""} 😊
Your booking for *${b.unit_name}*
📅 ${b.check_in} – ${b.check_out}

Deposit is still pending.
Please send deposit to confirm your slot.

Thank you 🌿`;
}

function msgCheckIn(b){
  return `Hi ${b.customer_name || ""} 😊
Check-in info for *${b.unit_name}*
📅 ${b.check_in} – ${b.check_out}

✅ Check-in: 3:00 PM
✅ Check-out: 12:00 PM

If you need anything, just message us.
Thank you 🌿`;
}

function msgCheckOut(b){
  return `Hi ${b.customer_name || ""} 😊
Reminder: Check-out for *${b.unit_name}* is today.

✅ Check-out time: 12:00 PM
Thank you 🌿`;
}

function sameDay(d1, d2){
  return d1 === d2;
}

function todayISO(){
  const d = new Date();
  const pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

async function loadUnits(){
  const r = await fetchJSON("../api/units_list.php");
  if(!r.ok){ alert(r.error||"Failed to load units"); return; }
  const sel = document.getElementById("unit_id");
  sel.innerHTML = "";
  (r.units||[]).forEach(u=>{
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = `${u.display_name} — ${u.location}`;
    sel.appendChild(opt);
  });
}

async function checkConflicts(){
  const unit_id = document.getElementById("unit_id").value;
  const check_in = document.getElementById("check_in").value;
  const check_out = document.getElementById("check_out").value;
  const msg = document.getElementById("createMsg");

  if(!unit_id || !check_in || !check_out) return { ok:true, conflicts:[] };
  if(check_out <= check_in) return { ok:false, error:"Check-out must be after check-in." };

  const r = await fetchJSON(`../api/bookings_conflict_check.php?unit_id=${encodeURIComponent(unit_id)}&check_in=${encodeURIComponent(check_in)}&check_out=${encodeURIComponent(check_out)}`);
  if(!r.ok) return r;

  if((r.conflicts||[]).length){
    const c = r.conflicts[0];
    msg.innerHTML = `⚠️ Conflict with booking #${c.id}: ${c.check_in}–${c.check_out} (${c.customer_name || "—"})`;
    msg.style.color = "#ff7b7b";
  } else {
    msg.textContent = "";
    msg.style.color = "";
  }
  return r;
}

function channelValue(){
  const sel = document.getElementById("channel");
  const other = document.getElementById("channel_other");
  if(!sel) return "";
  if(sel.value === "Other") return (other?.value || "").trim();
  return sel.value;
}

async function createBooking(){
  const msg = document.getElementById("createMsg");
  msg.style.color = "";

  const unit_id = document.getElementById("unit_id").value;
  const status = document.getElementById("status").value;
  const check_in = document.getElementById("check_in").value;
  const check_out = document.getElementById("check_out").value;
  const channel = channelValue();
  const customer_name = document.getElementById("customer_name").value.trim();
  const customer_phone = document.getElementById("customer_phone").value.trim();
  const notes = document.getElementById("notes").value.trim();

  // Basic required fields
  if(!unit_id || !check_in || !check_out || !customer_name){
    msg.textContent = "Please fill Unit, Check-in/out, and Customer name.";
    msg.style.color = "#ff7b7b";
    return;
  }
  if(check_out <= check_in){
    msg.textContent = "Check-out must be after check-in.";
    msg.style.color = "#ff7b7b";
    return;
  }

  // Conflict check (A)
  const conflicts = await checkConflicts();
  if(conflicts.ok && (conflicts.conflicts||[]).length){
    // block create unless admin decides to override later
    msg.textContent = "Cannot create: date conflict. Change dates/unit.";
    msg.style.color = "#ff7b7b";
    return;
  }

  const payload = { unit_id, status, check_in, check_out, channel, customer_name, customer_phone, notes };

  const r = await fetchJSON("../api/bookings_create.php", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });

  if(!r.ok){
    msg.textContent = r.error || "Create failed";
    msg.style.color = "#ff7b7b";
    return;
  }

  msg.textContent = "Created ✅";
  setTimeout(()=>msg.textContent="", 1200);
  await refreshToday();
}

function renderToday(groups){
  const wrap = document.getElementById("todayList");
  const kpiArrivals = document.getElementById("kpiArrivals");
  const kpiTurnovers = document.getElementById("kpiTurnovers");
  const kpiPending = document.getElementById("kpiPending");

  kpiArrivals.textContent = groups.arrivals.length;
  kpiTurnovers.textContent = groups.turnovers.length;
  kpiPending.textContent = groups.pendingDeposit.length;

  function card(b, type){
    const phone = b.customer_phone || "";
    const depositBtn = `<a class="btn" target="_blank" rel="noreferrer" href="${waLink(phone, msgDeposit(b)) || "#"}">WA Deposit</a>`;
    const checkInBtn = `<a class="btn" target="_blank" rel="noreferrer" href="${waLink(phone, msgCheckIn(b)) || "#"}">WA Check-in</a>`;
    const checkOutBtn = `<a class="btn" target="_blank" rel="noreferrer" href="${waLink(phone, msgCheckOut(b)) || "#"}">WA Check-out</a>`;

    const actions = type === "pending"
      ? depositBtn
      : type === "arrival"
        ? checkInBtn
        : checkOutBtn;

    return `
      <div class="card" style="padding:14px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div style="font-weight:900;">${b.unit_name}</div>
          <div class="muted small">#${b.id} • ${b.check_in}–${b.check_out}</div>
        </div>
        <div class="muted small" style="margin-top:6px;">
          Guest: <b>${b.customer_name || "—"}</b> • Phone: <b>${b.customer_phone || "—"}</b> • Status: <b>${b.status}</b>
        </div>
        <div class="pcard-actions" style="margin-top:10px; flex-wrap:wrap;">
          ${actions}
          <a class="btn" href="./bookings.html">Open Bookings</a>
        </div>
      </div>
    `;
  }

  const sec = (title, arr, type) => `
    <div style="margin-top:14px;">
      <div class="muted small">${title}</div>
      ${arr.length ? arr.map(b=>card(b,type)).join("") : `<div class="muted">None ✅</div>`}
    </div>
  `;

  wrap.innerHTML =
    sec("🔴 Pending deposit (urgent)", groups.pendingDeposit, "pending") +
    sec("🟣 Arrivals today (check-in)", groups.arrivals, "arrival") +
    sec("🟠 Turnovers today (check-out)", groups.turnovers, "turnover");
}

async function refreshToday(){
  // Use existing list endpoint (must return unit_name, etc.)
  const r = await fetchJSON(`../api/bookings_list.php?status=ALL&unit_id=ALL&q=`);
  if(!r.ok){ return; }

  const t = todayISO();
  const all = (r.bookings || []).filter(b => b.status !== "CANCELLED");

  const groups = {
    arrivals: all.filter(b => sameDay(b.check_in, t)),
    turnovers: all.filter(b => sameDay(b.check_out, t)),
    pendingDeposit: all.filter(b => b.status === "PENDING_DEPOSIT" || (b.status === "CONFIRMED" && Number(b.deposit_paid||0) === 0))
  };

  renderToday(groups);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  // Channel dropdown "Other" toggle (C)
  const ch = document.getElementById("channel");
  const other = document.getElementById("channel_other");
  if(ch && other){
    const toggle = ()=>{
      other.style.display = (ch.value === "Other") ? "block" : "none";
    };
    ch.addEventListener("change", toggle);
    toggle();
  }

  // Date defaults
  const t = todayISO();
  const d = new Date(); d.setDate(d.getDate()+1);
  const pad = n => String(n).padStart(2,"0");
  const t1 = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  document.getElementById("check_in").value = t;
  document.getElementById("check_out").value = t1;

  await loadUnits();

  // Live conflict checking (A)
  ["unit_id","check_in","check_out"].forEach(id=>{
    document.getElementById(id).addEventListener("change", checkConflicts);
  });

  document.getElementById("btnCreate").addEventListener("click", createBooking);

  await refreshToday();
});
