
const fetch = require('node-fetch');
require('dotenv').config();

const CANVAS_API_URL = process.env.CANVAS_BASE_URL;
const CANVAS_TOKEN = process.env.CANVAS_ACCESS_TOKEN;



async function createCalendarEvent(eventObj) {
  if (!CANVAS_API_URL || !CANVAS_TOKEN) {
    throw new Error('Saknar CANVAS_BASE_URL eller CANVAS_ACCESS_TOKEN i .env');
  }
  // Ensure eventObj has context_code for personal calendar
  if (!eventObj.context_code) {
    const userId = process.env.CANVAS_USER_ID;
    if (!userId) throw new Error('Saknar CANVAS_USER_ID i .env');
    eventObj.context_code = `user_${userId}`;
  }
  const res = await fetch(`${CANVAS_API_URL}/api/v1/calendar_events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CANVAS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ calendar_event: eventObj })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Canvas API error: ' + err);
  }
  return res.json();
}

function timeEditToCanvasEvent(reservation, options = {}) {
  const {
    titleIndex = 0, // kolumnindex för titel
    locationIndex = 1, // kolumnindex för plats
    descriptionIndex = 7 // kolumnindex för kommentar/beskrivning
  } = options;
  // Bygg ISO-sträng med lokal svensk tidszon (CET/CEST)
  function toLocalIso(date, time) {
    // date: YYYY-MM-DD, time: HH:mm
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const dt = new Date(year, month - 1, day, hour, minute);
    // Hämta offset i minuter och bygg "+01:00" eller "+02:00"
    const offsetMin = -dt.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const absMin = Math.abs(offsetMin);
    const offsetHour = String(Math.floor(absMin / 60)).padStart(2, '0');
    const offsetRest = String(absMin % 60).padStart(2, '0');
    const iso = dt.getFullYear() + '-' +
      String(dt.getMonth() + 1).padStart(2, '0') + '-' +
      String(dt.getDate()).padStart(2, '0') + 'T' +
      String(dt.getHours()).padStart(2, '0') + ':' +
      String(dt.getMinutes()).padStart(2, '0') + ':00' +
      sign + offsetHour + ':' + offsetRest;
    return iso;
  }
  return {
    title: reservation.columns[titleIndex] || 'Bokning',
    description: reservation.columns[descriptionIndex] || '',
    start_at: toLocalIso(reservation.startdate, reservation.starttime),
    end_at: toLocalIso(reservation.enddate, reservation.endtime),
    location_name: reservation.columns[locationIndex] || ''
    // context_code utelämnas = personlig kalender
  };
}

module.exports = {
  createCalendarEvent,
  timeEditToCanvasEvent
};
