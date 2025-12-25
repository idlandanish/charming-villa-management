function parseDate(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y, m-1, d); }
function fmt(d){ return d.toISOString().slice(0,10); }

function datesBetween(startStr, endStr){
  // start inclusive, end exclusive
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const out = [];
  for(let d=new Date(start); d<end; d.setDate(d.getDate()+1)){
    out.push(fmt(d));
  }
  return out;
}

function buildBookedSet(bookings, unitName){
  const set = new Set();
  const turnovers = new Set(); // checkout dates
  bookings.filter(b=>b.unit===unitName).forEach(b=>{
    datesBetween(b.check_in, b.check_out).forEach(x=>set.add(x));
    turnovers.add(b.check_out);
  });
  return { booked:set, turnovers };
}

function monthLabel(y,m){
  const dt = new Date(y,m,1);
  return dt.toLocaleString(undefined, {month:"long", year:"numeric"});
}

function qs(id){ return document.getElementById(id); }
function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}
function setParam(name, value){
  const u = new URL(location.href);
  if(value===null) u.searchParams.delete(name);
  else u.searchParams.set(name, value);
  history.replaceState({}, "", u.toString());
}

async function fetchJSON(url){
  const res = await fetch(url);
  return await res.json();
}

function renderCalendar(container, year, month, unitName, bookings){
  const {booked, turnovers} = buildBookedSet(bookings, unitName);

  container.innerHTML = "";
  const head = document.createElement("div");
  head.className = "calendar-head";
  head.innerHTML = `
    <div>
      <div class="muted small">Unit</div>
      <div style="font-weight:650">${unitName}</div>
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
      <button class="btn" id="prevM" type="button">‹ Prev</button>
      <div style="font-weight:650">${monthLabel(year,month)}</div>
      <button class="btn" id="nextM" type="button">Next ›</button>
    </div>
  `;
  container.appendChild(head);

  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  grid.innerHTML = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="cal-dow">${d}</div>`).join("");

  const first = new Date(year, month, 1);
  const startIdx = (first.getDay()+6)%7; // monday 0
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // empty cells
  for(let i=0;i<startIdx;i++){
    const cell = document.createElement("div");
    cell.className = "cal-cell cal-empty";
    grid.appendChild(cell);
  }

  for(let day=1; day<=daysInMonth; day++){
    const date = new Date(year, month, day);
    const iso = fmt(date);

    const cell = document.createElement("div");
    const isBooked = booked.has(iso);
    const isTurnover = turnovers.has(iso);

    cell.className = "cal-cell" + (isBooked?" cal-booked":"") + (isTurnover?" cal-turnover":"");
    cell.innerHTML = `
      <div class="cal-num">${day}</div>
      <div class="cal-tag muted small">${isBooked?"Booked":"Available"}</div>
      ${isTurnover?`<div class="pill warn" style="margin-top:6px; display:inline-flex;">Turnover</div>`:""}
    `;
    grid.appendChild(cell);
  }

  container.appendChild(grid);

  qs("prevM").onclick = ()=> {
    const d = new Date(year, month-1, 1);
    setParam("y", String(d.getFullYear()));
    setParam("m", String(d.getMonth()+1));
    init();
  };
  qs("nextM").onclick = ()=> {
    const d = new Date(year, month+1, 1);
    setParam("y", String(d.getFullYear()));
    setParam("m", String(d.getMonth()+1));
    init();
  };
}

async function init(){
  const unitsRes = await fetchJSON("./api/units_list.php");
  const units = unitsRes.ok ? unitsRes.units : [];
  const bRes = await fetchJSON("./api/bookings_public_blocked.php");
  const bookings = bRes.ok ? bRes.bookings : [];

  const unitSel = qs("unitSel");
  if(unitSel && unitSel.options.length<=1){
    units.forEach(u=>{
      const opt=document.createElement("option");
      opt.value=u.display_name;
      opt.textContent=`${u.display_name} — ${u.location}`;
      unitSel.appendChild(opt);
    });
  }

  const unitFromQ = getParam("unit");
  const unitName = unitFromQ || (units[0]?.display_name || "");
  if(unitSel) unitSel.value = unitName;

  const y = Number(getParam("y") || new Date().getFullYear());
  const m = Number(getParam("m") || (new Date().getMonth()+1));
  const year = y;
  const month = m-1;

  const container = qs("calendar");
  if(container && unitName){
    renderCalendar(container, year, month, unitName, bookings);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  const unitSel = document.getElementById("unitSel");
  if(unitSel){
    unitSel.addEventListener("change", ()=>{
      setParam("unit", unitSel.value);
      init();
    });
  }
  init().catch(e=>console.error(e));
});
