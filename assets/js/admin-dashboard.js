async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

function todayISO(){
  const d = new Date();
  const pad=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

async function loadUnits(){
  const r = await fetchJSON("../api/units_list.php");
  if(!r.ok) throw new Error(r.error||"Failed to load units");
  const sel = document.getElementById("unit_id");
  sel.innerHTML = "";
  r.units.forEach(u=>{
    const opt=document.createElement("option");
    opt.value = u.id;
    opt.textContent = `${u.display_name} — ${u.location}`;
    sel.appendChild(opt);
  });
}

async function refreshToday(){
  const t = todayISO();
  const r = await fetchJSON(`../api/bookings_list.php?status=ALL&unit_id=ALL&q=`);
  if(!r.ok) return;

  const rows = r.bookings || [];
  const arrivals = rows.filter(b=>b.check_in===t && b.status!=="CANCELLED");
  const turnovers = rows.filter(b=>b.check_out===t && b.status!=="CANCELLED");
  const pending = rows.filter(b=>b.status==="PENDING_DEPOSIT");

  document.getElementById("kpiArrivals").textContent = String(arrivals.length);
  document.getElementById("kpiTurnovers").textContent = String(turnovers.length);
  document.getElementById("kpiPending").textContent = String(pending.length);

  const list = document.getElementById("todayList");
  const card = (title, items)=>`
    <div class="card" style="margin-top:10px; padding:14px;">
      <div style="font-weight:800;">${title}</div>
      ${items.length? items.map(b=>`
        <div class="muted small" style="margin-top:8px;">
          <b>${b.unit_name}</b> • ${b.customer_name} • <span>${b.status}</span>
        </div>
      `).join("") : `<div class="muted small" style="margin-top:8px;">None</div>`}
    </div>
  `;
  list.innerHTML = card("Arrivals (Today)", arrivals) + card("Turnovers (Today)", turnovers) + card("Pending deposit", pending.slice(0,8));
}

async function init(){
  await loadUnits();

  // default date values
  const t = todayISO();
  const d = new Date();
  const d2 = new Date(d); d2.setDate(d2.getDate()+1);
  const pad=n=>String(n).padStart(2,"0");
  const fmt = x => `${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`;
  document.getElementById("check_in").value = t;
  document.getElementById("check_out").value = fmt(d2);

  document.getElementById("btnCreate").addEventListener("click", async ()=>{
    const msg = document.getElementById("createMsg");
    msg.textContent = "";
    const payload = {
      unit_id: Number(document.getElementById("unit_id").value),
      status: document.getElementById("status").value,
      check_in: document.getElementById("check_in").value,
      check_out: document.getElementById("check_out").value,
      channel: document.getElementById("channel").value,
      customer_name: document.getElementById("customer_name").value,
      customer_phone: document.getElementById("customer_phone").value,
      notes: document.getElementById("notes").value
    };

    if(!payload.customer_name.trim()){
      msg.textContent = "Customer name required.";
      return;
    }
    if(payload.check_out <= payload.check_in){
      msg.textContent = "Check-out must be after check-in.";
      return;
    }

    const r = await fetchJSON("../api/bookings_create.php", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    if(!r.ok){
      msg.textContent = r.error || "Failed to create.";
      return;
    }

    msg.textContent = "Created ✅";
    document.getElementById("customer_name").value="";
    document.getElementById("customer_phone").value="";
    document.getElementById("notes").value="";
    await refreshToday();
  });

  await refreshToday();
}
document.addEventListener("DOMContentLoaded", ()=>{ init().catch(e=>alert(e.message)); });
