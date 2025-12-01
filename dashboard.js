// dashboard.js
let map, markers = {};
let currentUser = null;
let currentRating = 0;

function initMap() {
  map = L.map('map', { zoomControl:true }).setView([14.6500,121.0735], 15); // change center to your campus
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OSM'
  }).addTo(map);
}

function bindUI(){
  document.getElementById('logoutBtn').addEventListener('click', () => { logout(); });
  document.getElementById('toAdmin').addEventListener('click', ()=> window.location.href='admin.html');

  // stars click
  const starBox = document.getElementById('starBox');
  starBox.addEventListener('click', (e) => {
    // simple toggle rating by character position
    const rect = starBox.getBoundingClientRect();
    const relative = e.clientX - rect.left;
    const per = relative / rect.width;
    currentRating = Math.min(5, Math.max(1, Math.ceil(per * 5)));
    renderStars();
  });

  document.getElementById('sendFeedback').addEventListener('click', sendFeedback);
}

function renderStars(){
  const el = document.getElementById('starBox');
  let s = '';
  for(let i=1;i<=5;i++) s += i<=currentRating ? '<span class="active">★</span>' : '☆';
  el.innerHTML = s;
}

function sendFeedback(){
  const binId = document.getElementById('binSelect').value;
  const text = document.getElementById('feedbackText').value.trim();
  if(!binId) return alert('Choose bin');
  if(!currentRating) return alert('Give a rating');

  db.collection('feedbacks').add({
    binId, rating: currentRating, comment: text || '', uid: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=> {
    alert('Thanks for the feedback!');
    document.getElementById('feedbackText').value = '';
    currentRating = 0; renderStars();
  }).catch(e => alert('Error: '+ e.message));
}

// load bins from Firestore and add markers / cards
function watchBins(){
  db.collection('bins').onSnapshot(snap => {
    const bins = [];
    snap.forEach(doc => bins.push({ id: doc.id, ...doc.data() }));
    renderBins(bins);
  });
}

// add/update markers and list entries
function renderBins(bins){
  const list = document.getElementById('binsList');
  list.innerHTML = '';
  const binSelect = document.getElementById('binSelect');
  binSelect.innerHTML = '<option value="">--choose--</option>';

  bins.forEach(b=>{
    // marker
    if(markers[b.id]) {
      markers[b.id].setLatLng([b.lat, b.lng]);
      markers[b.id].getPopup().setContent(popupHtml(b));
    } else {
      const m = L.marker([b.lat,b.lng]).addTo(map).bindPopup(popupHtml(b));
      markers[b.id] = m;
    }

    // card
    const card = document.createElement('div');
    card.className = 'bin-card';
    card.innerHTML = `
      <div class="bin-visual">
        <div class="bin-fill" id="fill-${b.id}" style="height:${b.level}% ; background:${b.level>=80 ? '#e74c3c' : (b.level>=50? '#f59e0b' : '#10b981')}"></div>
      </div>
      <div class="bin-meta">
        <strong>${b.name}</strong><div class="muted">Level: ${b.level}%</div>
        <div class="bin-actions">
          <button class="btn" onclick="contactCollector('${b.id}','${b.name}')">Contact</button>
          <button class="btn" onclick="zoomTo('${b.id}')">Zoom</button>
        </div>
      </div>
    `;
    list.appendChild(card);

    // populate select
    const opt = document.createElement('option'); opt.value = b.id; opt.textContent = b.name;
    binSelect.appendChild(opt);

    // animate fill periodically if simulated (we animate CSS height smoothly already)
  });
}

// popup HTML for marker
function popupHtml(b){
  return `<strong>${b.name}</strong><div>Level: ${b.level}%</div><div><button onclick="contactCollector('${b.id}','${b.name}')">Contact Collector</button></div>`;
}

function zoomTo(id){
  const m = markers[id];
  if(m) map.setView(m.getLatLng(), 18);
}

function contactCollector(binId, name){
  // create an alert doc in Firestore
  db.collection('alerts').add({
    binId, name, uid: currentUser.uid, resolved:false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=> alert('Collector alerted for '+name)).catch(e=> alert('Error: '+e.message));
}

// show recent feedbacks
function watchFeedbacks(){
  db.collection('feedbacks').orderBy('createdAt','desc').limit(10).onSnapshot(snap => {
    const ul = document.getElementById('feedbackList'); ul.innerHTML = '';
    snap.forEach(d => {
      const data = d.data();
      const li = document.createElement('li');
      li.textContent = `${data.rating}★ — ${data.comment || '(no comment)'}`;
      ul.appendChild(li);
    });
  });
}

// monitor auth
onAuth(user => {
  if(!user) { window.location.href = 'index.html'; return; }
  currentUser = user;
  // initialize map & watchers
  initMap();
  bindUI();
  watchBins();
  watchFeedbacks();
});
