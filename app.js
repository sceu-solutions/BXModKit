
const firebaseConfig = {
  apiKey: "AIzaSyAXGdzGyZbhmUy5iBPM3R4QkDLos_cVfqA",
  authDomain: "kit-bx-mod-t.firebaseapp.com",
  projectId: "kit-bx-mod-t",
  storageBucket: "kit-bx-mod-t.appspot.com",
  messagingSenderId: "189557352459",
  appId: "1:189557352459:web:c0b5b88412b3a25bad3f0e",
  measurementId: "G-NW61Y519PG"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

document.getElementById('configForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const commission = document.getElementById('commission').value;
  const selects = document.querySelectorAll('select');
  const values = [];
  selects.forEach(s => values.push(`${s.id}: ${s.value}`));
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const date = new Date().toLocaleString();
  await db.collection('configurations').doc(code).set({
    commission, code, date, values
  });
  document.getElementById('generatedCode').innerText = code;
  document.getElementById('result').style.display = 'block';
  loadConfigs();
  window.generatedData = { commission, code, date, values };
});

async function loadConfigs() {
  const snapshot = await db.collection('configurations').get();
  const tbody = document.querySelector('#configTable tbody');
  const allBody = document.querySelector('#allConfigs tbody');
  tbody.innerHTML = '';
  allBody.innerHTML = '';
  snapshot.forEach(doc => {
    const d = doc.data();
    const row = `<tr><td>${d.commission}</td><td>${d.code}</td><td>${d.date}</td><td>${d.values.join('<br>')}</td></tr>`;
    tbody.innerHTML += row;
    allBody.innerHTML += row;
  });
}
loadConfigs();

async function findConfig() {
  const code = document.getElementById('searchCode').value;
  const doc = await db.collection('configurations').doc(code).get();
  const div = document.getElementById('searchResult');
  if (doc.exists) {
    const d = doc.data();
    div.innerHTML = `<p><strong>Commission:</strong> ${d.commission}<br><strong>Codice:</strong> ${d.code}<br><strong>Data:</strong> ${d.date}<br><strong>Valori:</strong><br>${d.values.join('<br>')}</p>`;
  } else {
    div.innerHTML = '<p>Configurazione non trovata.</p>';
  }
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = window.generatedData;
  doc.setFontSize(14);
  doc.text(`KIT-BX7-MOD-T - Configurazione`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Commission: ${data.commission}`, 10, 20);
  doc.text(`Codice: ${data.code}`, 10, 30);
  doc.text(`Data: ${data.date}`, 10, 40);
  doc.text(`Valori selezionati:`, 10, 50);
  data.values.forEach((v, i) => {
    doc.text(`- ${v}`, 10, 60 + i * 10);
  });
  doc.save(`config_${data.code}.pdf`);
}
