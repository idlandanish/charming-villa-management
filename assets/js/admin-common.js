(async function () {
  const me = await fetch("../api/auth_me.php").then(r => r.json()).catch(()=>({ok:false}));
  if (!me.ok) { window.location.href = "./login.html"; return; }

  const btn = document.getElementById("btnLogout");
  if (btn) {
    btn.addEventListener("click", async () => {
      await fetch("../api/auth_logout.php").catch(()=>{});
      window.location.href = "./login.html";
    });
  }
})();
