function parseDate(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function fmt(d){ return d.toISOString().slice(0,10); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

function waLink(phoneDigits, message){
  const p = String(phoneDigits || "").replace(/\D+/g,"");
  if(!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

function cleanerMsg(t){
  // t: {unit, date, guest, cleaner}
  const base = `${location.origin}${location.pathname.replace(/\/admin\/.*$/, "")}`;
  const checklistUrl = `${base}/checklist.html?unit=${encodeURIComponent(t.unit)}`;

  return (
`Hi ${t.cleaner || "Cleaner"} 😊
Reminder: cleaning needed for *${t.unit}*
Checkout date: *${t.date}*
Cleaning window: *12:00 PM – 3:00 PM*

Previous guest: ${t.guest || "—"}

Checklist:
${checklistUrl}

Thank you 🙏`
  );
}

function buildTasks(bookings, daysAhead=21){
  const today = new Date(); today.setHours(0,0,0,0);
  const end = addDays(today, daysAhead);

  const tasks=[];
  bookings.forEach(b=>{
    const co=parseDate(b.check_out); co.setHours(0,0,0,0);
    if(co>=today && co<=end && b.status!=="CANCELLED"){
      tasks.push({
        booking_id: Number(b.id),
        date: fmt(co),
        unit: b.unit_name,
        guest: b.customer_name || "—",
        cleaner: b.assigned_to || "",
        phone: b.assigned_phone || "",
        task_status: b.task_status || "NOT_ASSIGNED",
        notes: b.notes || ""
      });
    }
  });

  tasks.sort((a,b)=>a.date.localeCompare(b.date));
  return tasks;
}

function groupByDate(tasks){
  const map={};
  tasks.forEach(t=>{
    map[t.date]=map[t.date]||[];
    map[t.date].push(t);
  });
  return map;
}

let LAST_TASKS = [];

async function refresh(){
  const daysAhead = Number(document.getElementById("days").value || 21);
  const r = await fetchJSON(`../api/bookings_list.php?status=ALL&unit_id=ALL&q=`);
  if(!r.ok){ alert(r.error||"Failed"); return; }

  const tasks = buildTasks(r.bookings||[], daysAhead);
  LAST_TASKS = tasks;
  const grouped = groupByDate(tasks);

  const wrap=document.getElementById("tasks");
  if(!tasks.length){
    wrap.innerHTML = `<div class="muted">No check-outs in the next ${daysAhead} days.</div>`;
    return;
  }

  wrap.innerHTML = Object.keys(grouped).map(date=>{
    const items = grouped[date].map(t=>`
      <div class="card" style="margin-top:10px; padding:14px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div style="font-weight:800;">${t.unit}</div>
          <div class="muted small">Window: <b>12:00 PM – 3:00 PM</b></div>
        </div>

        <div class="muted small" style="margin-top:6px;">
          Guest: <b>${t.guest}</b>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; align-items:center;">
          <input class="input" data-cleaner="${t.booking_id}" placeholder="Cleaner username/name" value="${t.cleaner||""}" style="min-width:180px;">
          <input class="input" data-phone="${t.booking_id}" placeholder="Cleaner phone (60173949376)" value="${t.phone||""}" style="min-width:220px;">

          <select class="input" data-status="${t.booking_id}">
            ${["NOT_ASSIGNED","ASSIGNED","DONE"].map(s=>`<option value="${s}" ${t.task_status===s?"selected":""}>${s.replaceAll("_"," ")}</option>`).join("")}
          </select>

          <button class="btn btn-primary" data-save="${t.booking_id}" type="button">Save</button>
          <button class="btn btn-wa" data-wa="${t.booking_id}" type="button">WhatsApp Cleaner</button>

          <a class="btn" href="./checklist.html?unit=${encodeURIComponent(t.unit)}">Checklist</a>
        </div>

        <div class="muted small" style="margin-top:8px;">Notes: ${t.notes||"-"}</div>
      </div>
    `).join("");

    return `
      <div style="margin-top:16px;">
        <div class="muted small">Checkout date</div>
        <div style="font-weight:900; font-size:18px;">${date}</div>
        ${items}
      </div>
    `;
  }).join("");

  // Save button
  wrap.querySelectorAll("[data-save]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = Number(btn.getAttribute("data-save"));
      const cleaner = wrap.querySelector(`[data-cleaner="${id}"]`).value.trim();
      const phone = wrap.querySelector(`[data-phone="${id}"]`).value.trim();
      const status = wrap.querySelector(`[data-status="${id}"]`).value;

      const rr = await fetchJSON("../api/cleaning_assign.php", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ booking_id: id, assigned_to: cleaner, assigned_phone: phone, task_status: status })
      });

      if(!rr.ok){
        alert(rr.error||"Save failed");
        return;
      }
      btn.textContent = "Saved ✅";
      setTimeout(()=>btn.textContent="Save", 900);
    });
  });

  // WhatsApp button
  wrap.querySelectorAll("[data-wa]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = Number(btn.getAttribute("data-wa"));
      const cleaner = wrap.querySelector(`[data-cleaner="${id}"]`).value.trim();
      const phone = wrap.querySelector(`[data-phone="${id}"]`).value.trim();

      const t = LAST_TASKS.find(x=>x.booking_id===id);
      const msg = cleanerMsg({ ...t, cleaner });
      const link = waLink(phone, msg);

      if(!link){
        alert("Please enter cleaner phone number first (example: 60173949376).");
        return;
      }
      window.open(link, "_blank");
    });
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("btnRefresh").addEventListener("click", refresh);
  refresh();
});
