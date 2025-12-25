function parseDate(s){
  const [y,m,d]=s.split("-").map(Number);
  return new Date(y,m-1,d);
}
function fmt(d){ return d.toISOString().slice(0,10); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

async function fetchJSON(url){
  const res = await fetch(url, { credentials: "same-origin" });
  return await res.json();
}

function buildTasks(bookings, daysAhead=21){
  const today = new Date(); today.setHours(0,0,0,0);
  const end = addDays(today, daysAhead);

  const tasks = [];
  bookings.forEach(b=>{
    // b.check_out is DATE string (YYYY-MM-DD)
    const co = parseDate(b.check_out); co.setHours(0,0,0,0);

    // only if in range AND booking not cancelled
    if(co >= today && co <= end && b.status !== "CANCELLED"){
      tasks.push({
        date: fmt(co),
        unit: b.unit_name,
        cleaner: b.assigned_to || "—",
        window: "12:00 PM – 3:00 PM",
        guest: b.customer_name || "—",
        notes: b.notes || ""
      });
    }
  });

  tasks.sort((a,b)=>a.date.localeCompare(b.date));
  return tasks;
}

function groupByDate(tasks){
  const map = {};
  tasks.forEach(t=>{
    map[t.date] = map[t.date] || [];
    map[t.date].push(t);
  });
  return map;
}

async function renderAdmin(){
  // Must be logged in (admin/staff). If not, redirect.
  const me = await fetchJSON("../api/auth_me.php").catch(()=>({ok:false}));
  if(!me.ok){
    window.location.href = "./login.html";
    return;
  }

  // Units
  const unitsRes = await fetchJSON("../api/units_list.php");
  const units = unitsRes.ok ? unitsRes.units : [];

  // Bookings (all)
  const bookingsRes = await fetchJSON("../api/bookings_list.php?status=ALL&unit_id=ALL&q=");
  const bookings = bookingsRes.ok ? bookingsRes.bookings : [];

  // Unit quick links
  const links = document.getElementById("unitLinks");
  if(links){
    links.innerHTML = units.map(u=>`
      <a class="btn" href="./availability-calendar.html?unit=${encodeURIComponent(u.display_name)}" target="_blank" rel="noreferrer">${u.display_name}</a>
    `).join("");
  }

  // Cleaning schedule
  const tasks = buildTasks(bookings, 21);
  const grouped = groupByDate(tasks);

  const wrap = document.getElementById("tasks");
  if(!wrap) return;

  if(tasks.length===0){
    wrap.innerHTML = `<div class="muted">No check-outs in the next 21 days.</div>`;
    return;
  }

  wrap.innerHTML = Object.keys(grouped).map(date=>{
    const items = grouped[date].map(t=>`
      <div class="card" style="margin-top:10px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div style="font-weight:650;">${t.unit}</div>
          <div class="muted small">Cleaning window: <b>${t.window}</b></div>
        </div>
        <div class="muted small" style="margin-top:6px;">
          Cleaner: <b>${t.cleaner}</b> • Previous guest: <b>${t.guest}</b>
        </div>
        <div class="muted small" style="margin-top:6px;">Notes: ${t.notes || "-"}</div>
        <div class="pcard-actions" style="margin-top:10px;">
          <a class="btn btn-primary" href="./checklist.html?unit=${encodeURIComponent(t.unit)}">Open Checklist</a>
          <a class="btn" href="./availability-calendar.html?unit=${encodeURIComponent(t.unit)}">View Calendar</a>
        </div>
      </div>
    `).join("");

    return `
      <div style="margin-top:16px;">
        <div class="muted small">Checkout date</div>
        <div style="font-weight:700; font-size:18px;">${date}</div>
        ${items}
      </div>
    `;
  }).join("");

  // Logout button (if exists)
  const btnLogout = document.getElementById("btnLogout");
  if(btnLogout){
    btnLogout.addEventListener("click", async ()=>{
      await fetch("../api/auth_logout.php").catch(()=>{});
      window.location.href = "./login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", renderAdmin);
