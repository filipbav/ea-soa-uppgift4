
const TOKEN = process.env.CANVAS_ACCESS_TOKEN || '';
const BASE = 'https://canvas.ltu.se/api/v1'; // vet inte om det är rätt url

function tokenPresent() {
  return !!TOKEN && TOKEN.length > 0;
}

function tokenLength() {
  return TOKEN ? TOKEN.length : 0;
}

// Placeholder: lägg in kalenderlogik här senare
async function addToCalendar(/* event */) {
  throw new Error('addToCalendar not implemented');
}

module.exports = {
  addToCalendar,
  tokenPresent
};
