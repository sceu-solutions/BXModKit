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

const dropdownData = {
  "number_floor": ["3","4","5","6","7","8","9","10","11","12","13","14","15"],
  "Access_side": ["1","2"],
  "Country": ["ES","FR","IT","DE"],
  "GQ": ["320","450","630","800","1000","1250"],
  "Machine room": ["A","B"],
  "VAF type": ["25","43"],
  "Drive brake current": ["under 1.6 A","over 1.5 A"],
  "Door drive type": ["mono phase","three phase"],
  "Installation type": ["traction","hydraulic"]
};

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(page).style.display = 'block';
}

function populateDropdowns() {
  const container = document.getElementById("dropdowns");
  container.innerHTML = "";
  for (const key in dropdownData) {
    const label = document.createElement("label");
    label.textContent = key;
    const select = document.createElement("select");
    select.name = key;
    select.required = true;
    dropdownData[key].forEach(val => {
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val;
      select.appendChild(option);
    });
    container.appendChild(label);
    container.appendChild(select);
  }
}

document.getElementById("configForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const commissionNumber = form.commissionNumber.value.trim();
  if (!commissionNumber) {
    alert("Commission Number è obbligatorio");
    return;
  }
  const config = {};
  for (const key in dropdownData) {
    config[key] = form[key].value;
  }
  const configString = Object.values(config).join(";");
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  await db.collection("configurations").doc(code).set({
    commissionNumber,
    configString,
    timestamp: new Date()
  });
  document.getElementById("generatedCode").textContent = "Codice generato: " + code;
  form.reset();
  populateDropdowns();
  loadAllConfigurations();
});

async function findConfiguration() {
  const code = document.getElementById("searchCode").value.trim();
  if (!code) return;
  const doc = await db.collection("configurations").doc(code).get();
  const container = document.getElementById("foundConfig");
  if (doc.exists) {
    const data = doc.data();
    container.innerHTML = "<p><strong>Commission Number:</strong> " + data.commissionNumber + "</p><p><strong>Configurazione:</strong> " + data.configString + "</p>";
  } else {
    container.textContent = "Configurazione non trovata.";
  }
}

async function loadAllConfigurations() {
  const snapshot = await db.collection("configurations").orderBy("timestamp", "desc").get();
  const tbody = document.querySelector("#allConfigsTable tbody");
  tbody.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement("tr");
    tr.innerHTML = "<td>" + doc.id + "</td><td>" + data.commissionNumber + "</td><td>" + data.configString + "</td>";
    tbody.appendChild(tr);
  });
}

window.onload = () => {
  populateDropdowns();
  loadAllConfigurations();
};
