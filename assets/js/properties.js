const cards = () => Array.from(document.querySelectorAll("[data-prop]"));

function applyFilters(){
  const q = (document.getElementById("q")?.value || "").toLowerCase().trim();
  const locationVal = document.getElementById("location")?.value || "all";
  const buildingVal = document.getElementById("building")?.value || "all";
  const typeVal = document.getElementById("type")?.value || "all";

  cards().forEach(el=>{
    const name = (el.getAttribute("data-name")||"").toLowerCase();
    const loc = el.getAttribute("data-location")||"";
    const bld = el.getAttribute("data-building")||"";
    const typ = el.getAttribute("data-type")||"";

    const matchQ = !q || name.includes(q);
    const matchLoc = (locationVal==="all") || (loc===locationVal);
    const matchBld = (buildingVal==="all") || (bld===buildingVal);
    const matchType = (typeVal==="all") || (typ===typeVal);

    el.style.display = (matchQ && matchLoc && matchBld && matchType) ? "" : "none";
  });
}

["q","location","building","type"].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener("input", applyFilters);
  if(el) el.addEventListener("change", applyFilters);
});

applyFilters();
