const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const dashboard = document.getElementById('dashboard');

const loginEmail = document.getElementById('loginEmail');
const loginPass = document.getElementById('loginPass');
const loginMsg = document.getElementById('loginMsg');

const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPass = document.getElementById('signupPass');
const signupMsg = document.getElementById('signupMsg');

const ownerName = document.getElementById('ownerName');
const fillBar = document.getElementById('fillBar');
const contactBtn = document.getElementById('contactBtn');
const statusMessage = document.getElementById('statusMessage');
const activityList = document.getElementById('activityList');

const ratingSelect = document.getElementById('rating');
const comment = document.getElementById('comment');

const settingsOverlay = document.getElementById('settingsOverlay');
const settingsPanel = document.getElementById('settingsPanel');

let currentFill = 0;
let activityLog = [];
let map = null; // make map global
let currentMarker = null;

// --- BIN LOCATIONS ---
const bins = [
  { name: 'Bin A - NBSC - Business Administration Bldg.', coords: [8.360865194707069, 124.86961242820853] },
  { name: 'Bin B - Main Gate', coords: [8.3601, 124.868] },
  { name: 'Bin C - Cafeteria', coords: [8.360172657385535, 124.8693608141211] },
  { name: 'Bin D - NBSC - Commerce Bldg.', coords: [8.36034473550673, 124.86737231897952] },
  { name: 'Bin E - LRC', coords: [8.359238679974695, 124.86795733104815] },
  { name: 'Bin F - NBSC Registrar Office', coords: [8.359603781389854, 124.86929754937304] },
  { name: 'Bin G - NBSC - Business Administration Bldg.', coords: [8.359123545559953, 124.86856268633152] },
  { name: 'Bin H - NBSC School Administration', coords: [8.3593, 124.8691] },
  { name: 'Bin I - Northern Bukidnon State College Gym', coords: [8.3601, 124.8691] },
  { name: 'Bin J - NBSC Registrar Office', coords: [8.3596, 124.8695] }
];

// Create a lookup for search
const binLocations = {};
bins.forEach(b => { binLocations[b.name] = { lat: b.coords[0], lng: b.coords[1] }; });

// --- AUTH FUNCTIONS ---
function showSignup(){
  loginCard?.classList.add('d-none');
  signupCard?.classList.remove('d-none');
  loginMsg && (loginMsg.innerText = '');
  signupMsg && (signupMsg.innerText = '');
}

function showLogin(){
  signupCard?.classList.add('d-none');
  loginCard?.classList.remove('d-none');
  signupMsg && (signupMsg.innerText = '');
  loginMsg && (loginMsg.innerText = '');
}

function signup(){
  const name = signupName?.value.trim() || '';
  const email = signupEmail?.value.trim() || '';
  const pass = signupPass?.value || '';

  if(!name || !email || !pass){
    if (signupMsg) { signupMsg.style.color='crimson'; signupMsg.innerText='Please fill all fields.'; }
    return;
  }

  const user = { name, email, pass };
  localStorage.setItem('smartbin_user', JSON.stringify(user));

  if (signupMsg) { signupMsg.style.color='green'; signupMsg.innerText='Account created. Returning to login...'; }

  setTimeout(() => {
    showLogin();
    if (signupName) signupName.value = '';
    if (signupEmail) signupEmail.value = '';
    if (signupPass) signupPass.value = '';
  }, 900);
}

function login(){
  const email = loginEmail?.value.trim() || '';
  const pass = loginPass?.value || '';

  const raw = localStorage.getItem('smartbin_user');
  if(!raw){
    if (loginMsg) { loginMsg.style.color='crimson'; loginMsg.innerText = 'No account found. Please sign up first.'; }
    return;
  }
  const user = JSON.parse(raw);

  if(email === user.email && pass === user.pass){
    document.getElementById('authWrap').style.display='none';
    dashboard?.classList.remove('d-none');

    ownerName && (ownerName.innerText = user.name || 'User');
    document.getElementById('profileViewName').value = user.name || '';
    document.getElementById('profileViewEmail').value = user.email || '';

    document.getElementById('profileFullname').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePassword').value = user.pass || '';

    startCounters();
    loadActivity();
  } else {
    loginMsg && (loginMsg.style.color='crimson', loginMsg.innerText = 'Incorrect email or password.');
  }
}

function logout(){
  settingsOverlay?.classList.add('d-none');
  document.getElementById('authWrap').style.display='flex';
  dashboard?.classList.add('d-none');
  loginEmail && (loginEmail.value=''); 
  loginPass && (loginPass.value='');
}

function deleteAccount(){
  if(confirm('Delete your account permanently?')){
    localStorage.removeItem('smartbin_user');
    alert('Account deleted.');
    logout();
  }
}

// --- SECTIONS ---
function hideAllSections() {
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('d-none'));
}

function showSection(sectionId) {
  const backBtn = document.getElementById('backBtn');
  if(sectionId === 'dashboard' || sectionId === 'home'){
    dashboard?.classList.remove('d-none');
    hideAllSections();
    backBtn?.classList.add('d-none');
    return;
  }

  dashboard?.classList.add('d-none');
  hideAllSections();

  const el = document.getElementById(sectionId + 'Section');
  if(el){
    el.classList.remove('d-none');
    backBtn?.classList.remove('d-none');
    if(sectionId === 'map') setTimeout(() => initMapIfNeeded(), 120);
    return;
  }

  ['about','contact','profile'].forEach(k => {
    const s = document.getElementById(k + 'Section');
    if (s && sectionId === k) s.classList.remove('d-none');
    backBtn?.classList.remove('d-none');
  });
}

// --- SETTINGS ---
function toggleSettings(){ settingsOverlay?.classList.toggle('d-none'); }

settingsOverlay?.addEventListener('click', (e)=>{
  if(!settingsPanel.contains(e.target)) settingsOverlay.classList.add('d-none');
});

document.querySelectorAll('.settings-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    const target = item.dataset.open;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const el = document.getElementById(target);
    el?.classList.add('active-page');
  });
});

document.querySelectorAll('.sub-back').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = btn.dataset.target;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const el = document.getElementById(target);
    el?.classList.add('active-page');
  });
});

// --- BIN FILL & ACTIVITY ---
function setFill(percent){
  currentFill = Math.max(0, Math.min(100, percent));
  fillBar && (fillBar.style.width = currentFill + '%', fillBar.innerText = Math.round(currentFill)+'%');
  if(currentFill >= 100){
    statusMessage && (statusMessage.innerText = 'Bin is full!');
    contactBtn && (contactBtn.disabled = false);
  } else {
    statusMessage && (statusMessage.innerText = '');
    contactBtn && (contactBtn.disabled = true);
  }
}

function addWaste(){
  const amountInput = document.getElementById('amount');
  const amount = amountInput ? Number(amountInput.value) : 0;
  const type = document.getElementById('wasteType')?.value || 'Unknown';

  if(!amount || amount <= 0){
    statusMessage && (statusMessage.style.color='crimson', statusMessage.innerText='Enter a valid amount.');
    return;
  }

  setFill(currentFill + amount);
  addActivity(`${amount}L of ${type} added`, true);

  if(amountInput) amountInput.value = '';
  statusMessage && (statusMessage.style.color='#333', statusMessage.innerText=`Added ${amount}L of ${type}.`);
}

function simulateAdd(n){ setFill(currentFill + n); addActivity(`${n}L quick add`, true); }
function contactCollector(){ addActivity('Collector contacted', true); alert('Garbage collector notified!'); contactBtn.disabled = true; }

function addActivity(text, toTop=true){
  const t = new Date();
  const item = { text, time: t.toLocaleString() };
  if(toTop) activityLog.unshift(item); else activityLog.push(item);
  activityLog = activityLog.slice(0,20);
  localStorage.setItem('smartbin_activity', JSON.stringify(activityLog));
  renderActivity();
}

function loadActivity(){
  const raw = localStorage.getItem('smartbin_activity');
  activityLog = raw ? JSON.parse(raw) : [{ text: 'Welcome to Smart Bin — your dashboard is ready!', time: new Date().toLocaleString() }];
  renderActivity();
}

function renderActivity(){
  if(!activityList) return;
  activityList.innerHTML = '';
  activityLog.forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `<div>${a.text}</div><div class="activity-time">${a.time}</div>`;
    activityList.appendChild(li);
  });
}

// --- REVIEWS ---
function addReview(){
  const rating = Number(ratingSelect?.value || 5);
  const text = (comment?.value || '').trim();
  const raw = localStorage.getItem('smartbin_reviews');
  const arr = raw ? JSON.parse(raw) : [];
  arr.unshift({ rating, text, time: new Date().toLocaleString() });
  localStorage.setItem('smartbin_reviews', JSON.stringify(arr));
  updateRatings();
  addActivity(`New review: ${'★'.repeat(rating)} ${text ? '- ' + text : ''}`, true);
  if(comment) comment.value='';
  alert('Thanks for your review!');
}

function updateRatings(){
  const raw = localStorage.getItem('smartbin_reviews');
  const arr = raw ? JSON.parse(raw) : [];
  const count = arr.length;
  document.getElementById('ratingCount').innerText = count;
  const avgEl = document.getElementById('avgRating');
  if(!avgEl) return;
  avgEl.innerText = count ? (arr.reduce((s,r)=>s+r.rating,0)/count).toFixed(1) : '0.0';
}

// --- STAT ANIMATION ---
function animateCount(el, target, duration=900){
  if(!el) return;
  let startTime=null, start=0, range=target-start;
  function step(ts){
    if(!startTime) startTime=ts;
    const progress = Math.min((ts-startTime)/duration,1);
    el.innerText = Math.round(start + range*progress);
    if(progress<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startCounters(){
  animateCount(document.getElementById('stat1'), Number(document.getElementById('stat1')?.dataset.target||128));
  animateCount(document.getElementById('stat2'), Number(document.getElementById('stat2')?.dataset.target||42));
  animateCount(document.getElementById('stat3'), Number(document.getElementById('stat3')?.dataset.target||87));
  updateRatings();
}

// --- AUTOLOGIN ---
function autoLoginIfUserExists(){
  const raw = localStorage.getItem('smartbin_user');
  if(raw){
    const u = JSON.parse(raw);
    if(loginEmail) loginEmail.value = u.email || '';
  }
}

// --- MAP ---
function initMapIfNeeded(){
  if(map) return;
  map = L.map('map', { scrollWheelZoom:false }).setView([8.360467731106894,124.86893044182926],15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  bins.forEach(b => L.marker(b.coords).addTo(map).bindPopup(`<strong>${b.name}</strong>`));
}

function searchMap(){
  const query = document.getElementById("globalSearch").value.trim();
  if(binLocations[query]){
    const coords = binLocations[query];
    showSection('map');
    map.setView([coords.lat, coords.lng], 18);
    if(currentMarker) map.removeLayer(currentMarker);
    currentMarker = L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(query).openPopup();
  } else {
    alert("Bin not found.");
  }
}

// --- INIT ---
autoLoginIfUserExists();
loadActivity();
updateRatings();
setFill(0);
