async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

function waLink(phoneDigits, message){
  const p = String(phoneDigits || "").replace(/\D+/g,"");
  if(!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

function doneMsg(unit, date){
  return `Hi admin 😊\nCleaning DONE for *${unit}* (checkout: ${date}).`;
}

async function refreshTasks(){
  const days = document.getElementById("days").value;
  const r = await fetchJSON(`../api/cleaner_tasks.php?days=${encodeURIComponent(days)}`);
  if(!r.ok){
    document.getElementById("tasks").innerHTML = `<div class="muted">Failed to load tasks.</div>`;
    return;
  }

  document.getElementById("me").textContent = `Logged in as: ${r.username}`;

  const tasks = r.tasks || [];
  const wrap = document.getElementById("tasks");

  if(!tasks.length){
    wrap.innerHTML = `<div class="muted">No cleaning tasks coming up 🎉</div>`;
    return;
  }

  wrap.innerHTML = tasks.map(t=>`
    <div class="card" style="padding:14px; margin-top:10px;">
      <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
        <div style="font-weight:900;">${t.unit_name}</div>
        <div class="muted small">Checkout: <b>${t.check_out}</b> • Window: <b>12:00 PM – 3:00 PM</b></div>
      </div>

      <div class="muted small" style="margin-top:6px;">
        Location: <b>${t.location}</b>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px; align-items:center;">
        <a class="btn" href="../checklist.html?unit=${encodeURIComponent(t.unit_name)}">Open Checklist</a>
        <button class="btn btn-primary" data-done="${t.booking_id}" type="button">
          ${t.task_status === "DONE" ? "Done ✅" : "Mark Done"}
        </button>
      </div>

      ${t.cleaning_notes ? `<div class="muted small" style="margin-top:10px;">Notes: ${t.cleaning_notes}</div>` : ""}
    </div>
  `).join("");

  wrap.querySelectorAll("[data-done]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = Number(btn.getAttribute("data-done"));
      const rr = await fetchJSON("../api/cleaning_mark_done.php", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ booking_id: id })
      });

      if(!rr.ok){
        alert(rr.error || "Failed to mark done");
        return;
      }

      btn.textContent = "Done ✅";
      btn.disabled = true;
    });
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const user = await requireCleaner();
  if(!user) return;

  document.getElementById("btnRefresh").addEventListener("click", refreshTasks);
  document.getElementById("days").addEventListener("change", refreshTasks);

  refreshTasks();
});
