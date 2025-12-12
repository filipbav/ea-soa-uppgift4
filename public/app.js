
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
    resultDiv.innerHTML = '<pre>' + JSON.stringify(data.data, null, 2) + '</pre>';
  } catch (err) {
    resultDiv.innerHTML = '<span style="color:red">Fel: ' + err.message + '</span>';
  }
}
