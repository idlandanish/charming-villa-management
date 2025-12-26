// assets/js/book.js
(() => {
  // CONFIG: Your Real WhatsApp Number
  const WA_NUMBER = "60173949376"; 

  // Security Helper
  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function qs(id){ return document.getElementById(id); }

  function init(){
    // 1. Get params from URL
    const params = new URLSearchParams(location.search);
    const unit = params.get("unit");
    const cin = params.get("checkIn");
    const cout = params.get("checkOut");

    // 2. SAFETY CHECK: If no unit selected, warn the user
    if(!unit){
      if(qs("summaryUnit")) qs("summaryUnit").textContent = "No Unit Selected";
      if(qs("summaryDates")) qs("summaryDates").innerHTML = `<a href="./availability.html">Click here to search for a unit</a>`;
      return; // Stop here, don't pre-fill form
    }

    // 3. Fill the visual summary
    if(qs("summaryUnit")) qs("summaryUnit").textContent = unit;
    if(qs("summaryDates")) qs("summaryDates").textContent = `${esc(cin)}  ➔  ${esc(cout)}`;

    // 4. Fill hidden inputs
    if(qs("unit")) qs("unit").value = unit;
    if(qs("checkIn")) qs("checkIn").value = cin;
    if(qs("checkOut")) qs("checkOut").value = cout;

    // 5. Handle Form Submit
    const form = qs("bookForm");
    if(form){
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const data = new FormData(form);

        const text = 
`*New Booking Request* 🏡
---------------------------
*Unit:* ${data.get("unit")}
*Dates:* ${data.get("checkIn")} to ${data.get("checkOut")}

*Guest Details:*
👤 Name: ${data.get("name")}
📞 Phone: ${data.get("phone")}
👨‍👩‍👧 Pax: ${data.get("adults")} Adults, ${data.get("kids")} Kids

*Notes:*
${data.get("notes") || "None"}
---------------------------
_Please confirm availability._`;

        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        window.location.href = url;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();