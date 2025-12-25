const CV_KEYS = {
  BOOKINGS: "cv_bookings_v3",
  ADMIN: "cv_admin_settings_v3",
  SESSION: "cv_admin_session_v3"
};

const CV_STATUSES = {
  INQUIRY: "INQUIRY",
  PENDING_DEPOSIT: "PENDING_DEPOSIT",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  CANCELLED: "CANCELLED"
};

function cv_nowISO(){ return new Date().toISOString(); }
function cv_uid(){ return "b_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16); }

function cv_defaultBookingsFromStatic(){
  const legacy = (window.CV_BOOKINGS || []).map(b=>({
    id: cv_uid(),
    unit: b.unit,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    channel: b.notes && b.notes.toLowerCase().includes("airbnb") ? "Airbnb" : "",
    agent: b.cleaner || "",
    customerName: b.guest || "",
    phone: "",
    pax: "",
    status: CV_STATUSES.CONFIRMED,
    notes: b.notes || "",
    createdAt: cv_nowISO(),
    updatedAt: cv_nowISO()
  }));
  return legacy;
}

function cv_loadBookings(){
  try{
    const raw = localStorage.getItem(CV_KEYS.BOOKINGS);
    if(raw){
      const arr = JSON.parse(raw);
      if(Array.isArray(arr)) return arr;
    }
  }catch(e){}
  const init = cv_defaultBookingsFromStatic();
  cv_saveBookings(init);
  return init;
}

function cv_saveBookings(bookings){
  localStorage.setItem(CV_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function cv_exportJSON(){
  const bookings = cv_loadBookings();
  return JSON.stringify({ version: 3, exportedAt: cv_nowISO(), bookings }, null, 2);
}

function cv_importJSON(text){
  const obj = JSON.parse(text);
  if(!obj || !Array.isArray(obj.bookings)) throw new Error("Invalid file format.");
  cv_saveBookings(obj.bookings);
  return obj.bookings.length;
}

function cv_overlap(aStart,aEnd,bStart,bEnd){
  return aStart < bEnd && aEnd > bStart;
}

function cv_blockingStatus(status){
  return [CV_STATUSES.PENDING_DEPOSIT, CV_STATUSES.CONFIRMED, CV_STATUSES.CHECKED_IN].includes(status);
}

function cv_isConflict(bookings, candidate, ignoreId=null){
  const aS = candidate.checkIn;
  const aE = candidate.checkOut;
  return bookings.some(b=>{
    if(ignoreId && b.id===ignoreId) return false;
    if(b.unit !== candidate.unit) return false;
    if(b.status === CV_STATUSES.CANCELLED) return false;
    if(b.status === CV_STATUSES.CHECKED_OUT) return false;
    return cv_overlap(aS,aE,b.checkIn,b.checkOut);
  });
}

function cv_adminGetSettings(){
  const raw = localStorage.getItem(CV_KEYS.ADMIN);
  if(raw){
    try{ return JSON.parse(raw); }catch(e){}
  }
  const def = { username: "admin", password: "admin123", updatedAt: cv_nowISO() };
  localStorage.setItem(CV_KEYS.ADMIN, JSON.stringify(def));
  return def;
}

function cv_adminSetSettings(next){
  localStorage.setItem(CV_KEYS.ADMIN, JSON.stringify(next));
}

function cv_adminLogin(username, password){
  const s = cv_adminGetSettings();
  if(username === s.username && password === s.password){
    const session = { ok: true, at: Date.now(), exp: Date.now() + 6*60*60*1000 };
    sessionStorage.setItem(CV_KEYS.SESSION, JSON.stringify(session));
    return true;
  }
  return false;
}

function cv_adminLogout(){
  sessionStorage.removeItem(CV_KEYS.SESSION);
}

function cv_adminRequire(){
  const raw = sessionStorage.getItem(CV_KEYS.SESSION);
  if(!raw) return false;
  try{
    const s = JSON.parse(raw);
    return s.ok && Date.now() < s.exp;
  }catch(e){ return false; }
}
