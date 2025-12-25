async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

let CUR = new Date();

function pad(n){ return String(n).padStart(2,"0"); }
function monthTitle(d){
  return d.toLocaleString(undefined, {month:"long", year:"numeric"});
}
function iso(y,m,d){ return `${y}-${pad(m)}-${pad(d)}`; }

function overlapsDay(b, dayISO){
  // booking covers nights [check_in, check_out)
  return (b.check_in <= dayISO) && (b.check_out > dayISO) && b.status !== "CANCELLED";
}

async function loadUnits(){
  const r = await fetchJSON("../api/units_list.php");
  if(!r.ok) throw new Error(r.error||"Failed to load units");
  const sel=document.getElementById("unit_id");
  r.units.forEach(u=>{
    const opt=document.createElement("option");
    opt.value=String(u.id);
    opt.textContent=u.display_name;
    sel.appendChild(opt);
  });
}

async function loadBookings(){
  const unit_id = document.getElementById("unit_id").value;
  const r = await fetchJSON(`../api/bookings_list.php?status=ALL&unit_id=${encodeURIComponent(unit_id)}&q=`);
  if(!r.ok) return [];
  return r.bookings || [];
}

function renderGrid(bookings){
  const y=CUR.getFullYear(), m=CUR.getMonth(); // 0-based
  document.getElementById("title").textContent = monthTitle(CUR);

  const first=new Date(y,m,1);
  const startDay=(first.getDay()+6)%7; // monday=0
  const daysInMonth=new Date(y,m+1,0).getDate();

  const cells=[];
  for(let i=0;i<startDay;i++) cells.push({empty:true});
  for(let d=1; d<=daysInMonth; d++){
    const dayISO=iso(y,m+1,d);
    const count = bookings.filter(b=>overlapsDay(b, dayISO)).length;
    cells.push({d, dayISO, count});
  }

  const grid=document.getElementById("grid");
  const head = `<div class="grid" style="grid-template-columns:repeat(7,1fr); gap:8px;">
    ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<div class="muted small">${x}</div>`).join("")}
  </div>`;
  const body = `<div class="grid" style="grid-template-columns:repeat(7,1fr); gap:8px; margin-top:8px;">
    ${cells.map(c=>{
      if(c.empty) return `<div class="card" style="padding:10px; opacity:.3;"></div>`;
      const badge = c.count ? `<div class="pill warn" style="display:inline-flex; margin-top:6px;">${c.count} booking</div>` : `<div class="muted small" style="margin-top:6px;">No booking</div>`;
      return `<button class="card" data-day="${c.dayISO}" type="button" style="text-align:left; padding:10px; cursor:pointer;">
        <div style="font-weight:900;">${c.d}</div>
        ${badge}
      </button>`;
    }).join("")}
  </div>`;
  grid.innerHTML = head + body;

  grid.querySelectorAll("[data-day]").forEach(btn=>{
    btn.addEventListener("click", ()=>renderDayList(bookings, btn.getAttribute("data-day")));
  });

  // default: today
  const t=new Date(); const tIso=iso(t.getFullYear(), t.getMonth()+1, t.getDate());
  renderDayList(bookings, tIso);
}

function renderDayList(bookings, dayISO){
  const list=document.getElementById("dayList");
  const items = bookings.filter(b=>overlapsDay(b, dayISO));
  list.innerHTML = `
    <div class="card" style="padding:14px;">
      <div style="font-weight:900;">${dayISO}</div>
      ${items.length ? items.map(b=>`
        <div class="muted small" style="margin-top:8px;">
          <b>${b.unit_name}</b> • ${b.customer_name} • ${b.status}
          <a class="btn" style="margin-left:8px;" href="./bookings.html">Open bookings</a>
        </div>
      `).join("") : `<div class="muted small" style="margin-top:8px;">No bookings on this day.</div>`}
    </div>
  `;
}

async function refresh(){
  const bookings = await loadBookings();
  renderGrid(bookings);
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("prev").addEventListener("click", ()=>{ CUR=new Date(CUR.getFullYear(), CUR.getMonth()-1, 1); refresh(); });
  document.getElementById("next").addEventListener("click", ()=>{ CUR=new Date(CUR.getFullYear(), CUR.getMonth()+1, 1); refresh(); });
  document.getElementById("unit_id").addEventListener("change", refresh);

  loadUnits().then(refresh).catch(e=>alert(e.message));
});
