// admin.js
let adminUser = null;
onAuth(async (u) => {
  if(!u) return window.location.href = 'index.html';
  adminUser = u;
  const doc = await db.collection('users').doc(u.uid).get();
  const data = doc.data() || {};
  if(!data.isAdmin) return alert('Not an admin') && (window.location.href = 'dashboard.html');

  // bind UI
  document.getElementById('addBin').addEventListener('click', addBin);
  document.getElementById('backDash').addEventListener('click', ()=> window.location.href='dashboard.html');
  document.getElementById('logoutAdmin').addEventListener('click', ()=> logout());

  loadAlerts();
  loadBins();
});

function addBin(){
  const name = document.getElementById('binName').value.trim();
  const lat = parseFloat(document.getElementById('binLat').value);
  const lng = parseFloat(document.getElementById('binLng').value);
  const level = parseInt(document.getElementById('binLevel').value)||0;
  if(!name || isNaN(lat) || isNaN(lng)) return alert('Fill fields');

  db.collection('bins').add({ name, lat, lng, level }).then(()=> {
    alert('Bin added'); document.getElementById('binName').value='';
  });
}

function loadAlerts(){
  db.collection('alerts').where('resolved','==',false).onSnapshot(snap => {
    const ul = document.getElementById('alertsList'); ul.innerHTML = '';
    snap.forEach(doc => {
      const a = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<strong>${a.name}</strong> — ${new Date(a.createdAt?.toDate?.()||Date.now()).toLocaleString()}
        <button onclick="resolveAlert('${doc.id}')">Resolve</button>`;
      ul.appendChild(li);
    });
  });
}

function resolveAlert(id){
  db.collection('alerts').doc(id).update({ resolved:true }).then(()=> alert('Resolved'));
}

function loadBins(){
  db.collection('bins').onSnapshot(snap => {
    const ul = document.getElementById('allBinsList'); ul.innerHTML = '';
    snap.forEach(doc => {
      const b = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<strong>${b.name}</strong> (${b.level}%) <button onclick="deleteBin('${doc.id}')">Delete</button>`;
      ul.appendChild(li);
    });
  });
}

function deleteBin(id){
  if(!confirm('Delete bin?')) return;
  db.collection('bins').doc(id).delete().then(()=> alert('Deleted'));
}
