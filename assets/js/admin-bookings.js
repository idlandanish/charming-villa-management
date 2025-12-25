async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

let UNITS = [];

async function loadUnits(){
  const r = await fetchJSON("../api/units_list.php");
  if(!r.ok) throw new Error(r.error||"Failed to load units");
  UNITS = r.units || [];

  const sel = document.getElementById("unit_id");
  UNITS.forEach(u=>{
    const opt=document.createElement("option");
    opt.value=String(u.id);
    opt.textContent=u.display_name;
    sel.appendChild(opt);
  });

  const msel = document.getElementById("m_unit_id");
  msel.innerHTML="";
  UNITS.forEach(u=>{
    const opt=document.createElement("option");
    opt.value=String(u.id);
    opt.textContent=`${u.display_name} — ${u.location}`;
    msel.appendChild(opt);
  });
}

function badge(status){
  const map = {
    INQUIRY: "muted",
    PENDING_DEPOSIT: "warn",
    CONFIRMED: "ok",
    CHECKED_IN: "ok",
    CHECKED_OUT: "muted",
    CANCELLED: "muted"
  };
  return `<span class="pill ${map[status]||"muted"}">${status.replaceAll("_"," ")}</span>`;
}

function money(v){
  if(v===null || v===undefined || v==="") return "—";
  return "RM " + Number(v).toFixed(2);
}

async function refresh(){
  const q = document.getElementById("q").value.trim();
  const status = document.getElementById("status").value;
  const unit_id = document.getElementById("unit_id").value;

  const r = await fetchJSON(`../api/bookings_list.php?status=${encodeURIComponent(status)}&unit_id=${encodeURIComponent(unit_id)}&q=${encodeURIComponent(q)}`);
  if(!r.ok){
    document.getElementById("hint").textContent = r.error || "Failed to load bookings";
    return;
  }

  const rows = r.bookings || [];
  document.getElementById("hint").textContent = `${rows.length} booking(s) loaded.`;

  const tbody = document.getElementById("rows");
  tbody.innerHTML = rows.map(b=>`
    <tr>
      <td>#${b.id}</td>
      <td><b>${b.unit_name}</b><div class="muted small">${b.location}</div></td>
      <td>${b.check_in} → ${b.check_out}</td>
      <td>${b.customer_name}<div class="muted small">${b.customer_phone||""}</div></td>
      <td>${b.channel||"—"}</td>
      <td>${badge(b.status)}</td>
      <td>${money(b.deposit_amount)}<div class="muted small">${b.deposit_paid==1?"Paid":"Not paid"}</div></td>
      <td><button class="btn" data-edit="${b.id}" type="button">Edit</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>openModal(Number(btn.getAttribute("data-edit"))));
  });
}

function openModal(id){
  document.getElementById("m_msg").textContent="";
  document.getElementById("modal").style.display="block";
  loadBooking(id).catch(e=>alert(e.message));
}

function closeModal(){
  document.getElementById("modal").style.display="none";
}

async function loadBooking(id){
  const r = await fetchJSON(`../api/bookings_get.php?id=${encodeURIComponent(id)}`);
  if(!r.ok) throw new Error(r.error||"Failed to load booking");
  const b = r.booking;

  document.getElementById("id").value = b.id;
  document.getElementById("m_unit_id").value = String(b.unit_id);
  document.getElementById("m_status").value = b.status;
  document.getElementById("m_check_in").value = b.check_in;
  document.getElementById("m_check_out").value = b.check_out;
  document.getElementById("m_customer_name").value = b.customer_name || "";
  document.getElementById("m_customer_phone").value = b.customer_phone || "";
  document.getElementById("m_channel").value = b.channel || "";
  document.getElementById("m_pax").value = b.pax ?? "";
  document.getElementById("m_total_price").value = b.total_price ?? "";
  document.getElementById("m_deposit_amount").value = b.deposit_amount ?? "";
  document.getElementById("m_deposit_paid").checked = (Number(b.deposit_paid) === 1);
  document.getElementById("m_notes").value = b.notes || "";
}

async function saveBooking(){
  const msg = document.getElementById("m_msg");
  msg.textContent = "";

  const payload = {
    id: Number(document.getElementById("id").value),
    unit_id: Number(document.getElementById("m_unit_id").value),
    status: document.getElementById("m_status").value,
    check_in: document.getElementById("m_check_in").value,
    check_out: document.getElementById("m_check_out").value,
    customer_name: document.getElementById("m_customer_name").value,
    customer_phone: document.getElementById("m_customer_phone").value,
    channel: document.getElementById("m_channel").value,
    pax: document.getElementById("m_pax").value,
    total_price: document.getElementById("m_total_price").value,
    deposit_amount: document.getElementById("m_deposit_amount").value,
    deposit_paid: document.getElementById("m_deposit_paid").checked ? 1 : 0,
    notes: document.getElementById("m_notes").value
  };

  if(payload.check_out <= payload.check_in){
    msg.textContent = "Check-out must be after check-in.";
    return;
  }
  if(!payload.customer_name.trim()){
    msg.textContent = "Customer name required.";
    return;
  }

  const r = await fetchJSON("../api/bookings_update.php", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });

  if(!r.ok){
    msg.textContent = r.error || "Save failed";
    return;
  }

  msg.textContent = "Saved ✅";
  await refresh();
}

async function cancelBooking(){
  const id = Number(document.getElementById("id").value);
  if(!confirm("Cancel this booking?")) return;

  const r = await fetchJSON("../api/bookings_cancel.php", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({id})
  });

  if(!r.ok){
    document.getElementById("m_msg").textContent = r.error || "Cancel failed";
    return;
  }
  document.getElementById("m_msg").textContent = "Cancelled ✅";
  await refresh();
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("btnRefresh").addEventListener("click", refresh);
  ["q","status","unit_id"].forEach(id=>document.getElementById(id).addEventListener("change", refresh));
  document.getElementById("btnClose").addEventListener("click", closeModal);
  document.getElementById("btnSave").addEventListener("click", saveBooking);
  document.getElementById("btnCancelBooking").addEventListener("click", cancelBooking);

  // close modal on outside click
  document.getElementById("modal").addEventListener("click", (e)=>{
    if(e.target.id==="modal") closeModal();
  });

  loadUnits().then(refresh).catch(e=>alert(e.message));
});
