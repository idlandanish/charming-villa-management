async function fetchJSON(url, opts){
  const res = await fetch(url, Object.assign({credentials:"same-origin"}, opts||{}));
  return await res.json();
}

async function requireCleaner(){
  const me = await fetchJSON("../api/auth_me.php").catch(()=>({ok:false}));
  if(!me.ok){
    location.href = "./login.html";
    return null;
  }
  if(me.user?.role !== "cleaner"){
    alert("This account is not a cleaner account.");
    location.href = "../index.html";
    return null;
  }
  return me.user;
}

async function logout(){
  await fetch("../api/auth_logout.php", {credentials:"same-origin"}).catch(()=>{});
  location.href = "./login.html";
}

document.addEventListener("DOMContentLoaded", ()=>{
  const btn = document.getElementById("btnLogout");
  if(btn) btn.addEventListener("click", (e)=>{ e.preventDefault(); logout(); });
});
