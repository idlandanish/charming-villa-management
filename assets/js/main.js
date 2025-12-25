// Set active nav item based on current path
(function(){
  const path = (location.pathname || "").toLowerCase();
  document.querySelectorAll(".navlinks a").forEach(a=>{
    const href = (a.getAttribute("href")||"").toLowerCase();
    if(href !== "#" && path.endsWith(href.replace("./","/"))){
      a.classList.add("active");
    }
    // also handle index
    if((path.endsWith("/charming-villa/") || path.endsWith("/charming-villa/index.html")) && href.includes("index.html")){
      a.classList.add("active");
    }
  });
})();
