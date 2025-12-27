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

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const navMenu = document.getElementById("navMenu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      // Toggle the .active class on the menu
      navMenu.classList.toggle("active");
      
      // Optional: Change icon from ☰ to X
      if (navMenu.classList.contains("active")) {
        menuBtn.textContent = "✕"; // Close icon
      } else {
        menuBtn.textContent = "☰"; // Hamburger icon
      }
    });
  }
});
