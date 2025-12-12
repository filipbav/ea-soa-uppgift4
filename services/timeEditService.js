
const fetch = require('node-fetch');

// hämtar ett timeedit schema som slutar på .html
// och ändrar till json

// Hämtar och returnerar schemat som JSON från en TimeEdit-URL
async function getSchedule(url) {
  if (!url || !url.endsWith('.html')) throw new Error('URL måste sluta på .html');
  // Byt ut .html mot .json för att få ut data i JSON-format
  const jsonUrl = url.replace('.html', '.json');
  const res = await fetch(jsonUrl);
  if (!res.ok) throw new Error('Kunde inte hämta schema');
  return res.json();
}

module.exports = { getSchedule };
