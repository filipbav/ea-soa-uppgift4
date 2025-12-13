

let lastTimeEditData = null;

async function fetchAndRenderSchedule() {
  const url = document.getElementById('te-url').value.trim();
  const resultDiv = document.getElementById('result');
  const error = validateUrl(url);
  if (error) {
    resultDiv.innerHTML = error;
    return;
  }
  // Visa laddningsindikator
  resultDiv.innerHTML = '<div style="text-align:center;padding:20px;"><div style="border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;width:40px;height:40px;animation:spin 2s linear infinite;margin:0 auto;"></div><p>Hämtar schema...</p></div>';
  try {
    const res = await fetch('/api/timeedit?url=' + encodeURIComponent(url));
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);
    lastTimeEditData = data.data; // Spara senaste TimeEdit-data
    renderSchedule(data.data);
  } catch (err) {
    resultDiv.innerHTML = '<span style="color:red">Fel: ' + err.message + '</span>';
  }
}

function exportToCanvas() {
  const form = document.getElementById('exportForm');
  if (!form) {
    alert('Ingen data att exportera.');
    return;
  }
  const selectedRows = getSelectedRowsFromForm(form);
  if (selectedRows.length === 0) {
    alert('Välj minst en rad att exportera.');
    return;
  }
  if (!lastTimeEditData) {
    alert('Ingen TimeEdit-data att exportera.');
    return;
  }
  // Visa laddningsindikator
  const exportBtn = document.getElementById('exportBtn');
  exportBtn.disabled = true;
  exportBtn.textContent = 'Exporterar...';
  // Skicka valda rader till backend för export till Canvas
  fetch('/api/canvas-export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reservations: selectedRows })
  })
    .then(res => res.json())
    .then(data => {
      exportBtn.disabled = false;
      exportBtn.textContent = 'Exportera valda till Canvas';
      if (!data.ok) {
        showModalWithText('Fel vid export', data.message || 'Okänt fel');
        return;
      }
      // Visa resultat för varje rad
      let html = '<h4>Exportresultat</h4><ul>';
      selectedRows.forEach((row, i) => {
        const result = data.results[i];
        const title = row.columns[0] || 'Okänd titel';
        if (result.ok) {
          html += `<li style="color:green">${title}: Export OK (ID: ${result.event.id})</li>`;
        } else {
          html += `<li style="color:red">${title}: Fel - ${result.message}</li>`;
        }
      });
      html += '</ul>';
      showModalWithText('Export till Canvas', html);
    })
    .catch(err => {
      exportBtn.disabled = false;
      exportBtn.textContent = 'Exportera valda till Canvas';
      showModalWithText('Fel vid export', err.message);
    });
}


// Visar en enkel modal med textinnehåll
function showModalWithText(title, text) {
  let modal = document.getElementById('exportModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exportModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div id="exportModalContent" style="background:#fff;padding:20px;max-width:90vw;max-height:80vh;overflow:auto;border-radius:8px;box-shadow:0 2px 16px #0008;">
        <h3 style="margin-top:0">${title}</h3>
        <pre id="exportModalPre" style="white-space:pre-wrap;word-break:break-all;max-height:60vh;overflow:auto;background:#f8f8f8;padding:10px;border-radius:4px;">${text}</pre>
        <button onclick="document.getElementById('exportModal').remove()" style="margin-top:10px">Stäng</button>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    document.getElementById('exportModalContent').querySelector('h3').textContent = title;
    document.getElementById('exportModalPre').textContent = text;
    modal.style.display = 'flex';
  }
}

// Validerar TimeEdit-URL
function validateUrl(url) {
  if (!url) return '<span style="color:red">Fel: Ange en TimeEdit-URL!</span>';
  const timeEditPattern = /^https:\/\/cloud\.timeedit\.net\/.+\.html$/;
  if (!timeEditPattern.test(url)) {
    return '<span style="color:red">Fel: Ange en giltig TimeEdit-URL som börjar med https://cloud.timeedit.net/ och slutar på .html</span>';
  }
  return null;
}

// Renderar hela schemat (info, tabell)
function renderSchedule(te) {
  const resultDiv = document.getElementById('result');
  if (!te.reservations || te.reservations.length === 0) {
    resultDiv.innerHTML = '<span style="color:orange">Inga bokningar hittades.</span>';
    document.getElementById('exportBtn').style.display = 'none';
    return;
  }
  resultDiv.innerHTML = renderInfo(te) + renderTable(te);
  document.getElementById('exportBtn').style.display = 'inline-block';
}

// Renderar info-ruta överst
function renderInfo(te) {
  const antal = te.reservations.length;
  const startDates = te.reservations.map(r => r.startdate).sort();
  const endDates = te.reservations.map(r => r.enddate).sort();
  const spann = `${startDates[0]} till ${endDates[endDates.length-1]}`;
  let kursnamn = '';
  const kursIndex = te.columnheaders.findIndex(h => h.toLowerCase().includes('kursnamn'));
  if (kursIndex !== -1) {
    for (const r of te.reservations) {
      if (r.columns[kursIndex] && r.columns[kursIndex].trim()) {
        kursnamn = r.columns[kursIndex].trim();
        break;
      }
    }
  }
  let info = `<div style="margin-bottom:10px"><b>Antal bokningar:</b> ${antal}<br><b>Tidsspann:</b> ${spann}`;
  if (kursnamn) info += `<br><b>Kurs:</b> ${kursnamn}`;
  info += '</div>';
  return info;
}

// Renderar tabellen med bokningar och redigerbara fält
function renderTable(te) {
  let html = `<form id="exportForm">
    <div style="margin-bottom:6px;font-size:0.95em">
      <span style="display:inline-block;width:18px;height:18px;background:#fff;border:2px solid #1976d2;vertical-align:middle;margin-right:4px"></span> Redigerbar
      <span style="display:inline-block;width:18px;height:18px;background:#f4f4f4;color:#888;border:1px solid #ddd;vertical-align:middle;margin-left:16px;margin-right:4px"></span> Endast läsbar
    </div>
    <div style="overflow-x:auto;">
    <table border="1" style="border-collapse:collapse;min-width:100%">`;
  html += '<tr><th>Välj</th>';
  for (const header of te.columnheaders) {
    html += '<th>' + header + '</th>';
  }
  html += '<th>Startdatum</th><th>Starttid</th><th>Slutdatum</th><th>Sluttid</th>';
  html += '</tr>';
  // Index för redigerbara fält (Canvas: Titel, Plats, Kommentar)
  const titleIndex = 0;
  const locationIndex = 1;
  const commentIndex = 7;
  for (let i = 0; i < te.reservations.length; i++) {
    const r = te.reservations[i];
    html += '<tr>';
    html += `<td><input type="checkbox" name="select" value="${i}" checked></td>`;
    for (let j = 0; j < r.columns.length; j++) {
      let editable = (j === titleIndex || j === locationIndex || j === commentIndex);
      if (editable) {
        html += `<td><input type="text" name="col${i}_${j}" value="${r.columns[j] || ''}" style="background:#fff;border:2px solid #1976d2;font-weight:500;color:#222"></td>`;
      } else {
        html += `<td><input type="text" name="col${i}_${j}" value="${r.columns[j] || ''}" readonly style="background:#f4f4f4;color:#888;border:1px solid #ddd"></td>`;
      }
    }
    html += `<td><input type="text" name="startdate${i}" value="${r.startdate}" style="background:#fff;border:2px solid #1976d2;font-weight:500;color:#222"></td>`;
    html += `<td><input type="text" name="starttime${i}" value="${r.starttime}" style="background:#fff;border:2px solid #1976d2;font-weight:500;color:#222"></td>`;
    html += `<td><input type="text" name="enddate${i}" value="${r.enddate}" style="background:#fff;border:2px solid #1976d2;font-weight:500;color:#222"></td>`;
    html += `<td><input type="text" name="endtime${i}" value="${r.endtime}" style="background:#fff;border:2px solid #1976d2;font-weight:500;color:#222"></td>`;
    html += '</tr>';
  }
  html += '</table>';
  html += '</div>';
  html += '<button type="button" id="exportBtn" onclick="exportToCanvas()" style="margin-top:10px">Exportera valda till Canvas</button>';
  html += '</form>';
  return html;
}


// Samlar in valda och redigerade rader från formuläret
function getSelectedRowsFromForm(form) {
  const rows = [];
  const checkboxes = form.querySelectorAll('input[type="checkbox"][name="select"]:checked');
  for (const checkbox of checkboxes) {
    const i = checkbox.value;
    const row = {};
    // Samla in alla textfält för denna rad
    const inputs = form.querySelectorAll(`input[name^='col${i}_'], input[name='startdate${i}'], input[name='starttime${i}'], input[name='enddate${i}'], input[name='endtime${i}']`);
    row.columns = [];
    for (const input of inputs) {
      if (input.name.startsWith('col')) {
        row.columns.push(input.value);
      } else if (input.name === `startdate${i}`) {
        row.startdate = input.value;
      } else if (input.name === `starttime${i}`) {
        row.starttime = input.value;
      } else if (input.name === `enddate${i}`) {
        row.enddate = input.value;
      } else if (input.name === `endtime${i}`) {
        row.endtime = input.value;
      }
    }
    rows.push(row);
  }
  return rows;
}

