
// Hämtar schema från TimeEdit genom att skriva in en url
async function fetchSchedule() {
  const url = document.getElementById('te-url').value.trim();
  const resultDiv = document.getElementById('result');
  
  // Validerar att input inte är tom
  if (!url) {
    resultDiv.innerHTML = '<span style="color:red">Fel: Ange en TimeEdit-URL!</span>';
    return;
  }
  // Validerar rätt format på url:en
  const timeEditPattern = /^https:\/\/cloud\.timeedit\.net\/.+\.html$/;
  if (!timeEditPattern.test(url)) {
    resultDiv.innerHTML = '<span style="color:red">Fel: Ange en giltig TimeEdit-URL som börjar med https://cloud.timeedit.net/ och slutar på .html</span>';
    return;
  }

  // Hämtar schemat och visar det i webbläsaren
  // Kan tas bort eller ändras när Canvas-integrationen är klar
  try {
    const res = await fetch('/api/timeedit?url=' + encodeURIComponent(url));
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);
    // Formatera och visa schemat snyggt i en tabell
    const te = data.data;
    if (!te.reservations || te.reservations.length === 0) {
      resultDiv.innerHTML = '<span style="color:orange">Inga bokningar hittades.</span>';
      return;
    }
    let html = '<table border="1" style="border-collapse:collapse;max-width:100%">';
    // Tabellhuvud
    html += '<tr>';
    for (const header of te.columnheaders) {
      html += '<th>' + header + '</th>';
    }
    html += '<th>Startdatum</th><th>Starttid</th><th>Slutdatum</th><th>Sluttid</th>';
    html += '</tr>';
    // Rader
    for (const r of te.reservations) {
      html += '<tr>';
      for (const col of r.columns) {
        html += '<td>' + (col || '') + '</td>';
      }
      html += '<td>' + r.startdate + '</td>';
      html += '<td>' + r.starttime + '</td>';
      html += '<td>' + r.enddate + '</td>';
      html += '<td>' + r.endtime + '</td>';
      html += '</tr>';
    }
    html += '</table>';
    // Visa tabellen och sedan rå JSON under
    resultDiv.innerHTML = html + '<h3>Rå JSON-data</h3><pre>' + JSON.stringify(te, null, 2) + '</pre>';
  } catch (err) {
    resultDiv.innerHTML = '<span style="color:red">Fel: ' + err.message + '</span>';
  }
}
