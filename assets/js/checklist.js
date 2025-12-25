const CHECKLISTS = {
  "Tulips T1": { title: "Tulips Denai Alam — Unit T1", items: [
    "Collect keys / access card",
    "Open windows 5–10 mins (air out)",
    "Trash: clear all bins, replace liners",
    "Beds: change bedsheets, pillowcases",
    "Bathroom: scrub toilet, sink, shower; replace tissue",
    "Mop floor (living + rooms)",
    "Kitchen: wipe counters, wash/put back dishes",
    "Check AC remote & TV remote batteries",
    "Restock: water / basic supplies (if any)",
    "Final: take 3 photos (living, bedroom, bathroom)"
  ]},
  "Tulips T2": { title:"Tulips Denai Alam — Unit T2", items: [] },
  "Habitus H1": { title:"Habitus Denai Alam — Unit H1", items: [] },
  "Habitus H2": { title:"Habitus Denai Alam — Unit H2", items: [] },
  "Habitus H3": { title:"Habitus Denai Alam — Unit H3", items: [] },
  "Villa 909": { title:"Charming Villa A’Famosa — Villa 909", items: [] },
  "Villa 802": { title:"Charming Villa A’Famosa — Villa 802", items: [] },
  "Villa 143": { title:"Charming Villa A’Famosa — Villa 143", items: [] }
};

const DEFAULT_ITEMS = [
  "Collect keys / access method",
  "Trash: clear all bins, replace liners",
  "Beds: change sheets, pillowcases",
  "Bathrooms: scrub toilet/sink/shower; replace tissue",
  "Mop floors",
  "Wipe touchpoints (handles, switches, remote)",
  "Restock basics (if any)",
  "Final: take photos & lock up"
];

Object.keys(CHECKLISTS).forEach(k=>{
  if(!CHECKLISTS[k].items || CHECKLISTS[k].items.length===0){
    CHECKLISTS[k].items = DEFAULT_ITEMS.slice();
  }
});

function renderChecklist(unit){
  const data = CHECKLISTS[unit] || {title: unit, items: DEFAULT_ITEMS};
  document.getElementById("unitTitle").textContent = data.title;

  const list = document.getElementById("checkItems");
  list.innerHTML = data.items.map((it, idx)=>`
    <label class="card" style="display:flex; gap:10px; align-items:flex-start; margin-top:10px;">
      <input type="checkbox" style="margin-top:4px;">
      <div>
        <div style="font-weight:650;">${idx+1}. ${it}</div>
        <div class="muted small">Notes: __________</div>
      </div>
    </label>
  `).join("");
}

document.addEventListener("DOMContentLoaded", ()=>{
  const params = new URLSearchParams(location.search);
  const unit = params.get("unit") || "Tulips T1";

  const sel = document.getElementById("unitSelect");
  (window.CV_UNITS||[]).forEach(u=>{
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = `${u.id} — ${u.location}`;
    sel.appendChild(opt);
  });
  sel.value = unit;

  sel.addEventListener("change", ()=>{
    const u = sel.value;
    const url = new URL(location.href);
    url.searchParams.set("unit", u);
    history.replaceState({}, "", url.toString());
    renderChecklist(u);
  });

  renderChecklist(unit);
  document.getElementById("printBtn").addEventListener("click", ()=> window.print());
});
