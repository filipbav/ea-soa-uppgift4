
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const timeEditService = require('./services/timeEditService');
const canvasService = require('./services/canvasService');

app.use(express.json());
app.use(express.static('public'));

// API-route: Hämtar schema från TimeEdit
// Anropas från frontend via /api/timeedit?url=...
app.get('/api/timeedit', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        // Om ingen URL skickas med, returnera fel
        return res.status(400).json({ ok: false, message: 'Ingen URL angiven' });
    }

    // Kontroll: URL måste vara en giltig TimeEdit-URL
    const timeEditPattern = /^https:\/\/cloud\.timeedit\.net\/.+\.html$/;
    if (!timeEditPattern.test(url)) {
        return res.status(400).json({ ok: false, message: 'Ogiltig TimeEdit-URL' });
    }

    try {
        // Hämtar schema-data via service
        const data = await timeEditService.getSchedule(url);
        res.json({ ok: true, data });
    } catch (err) {
        // Vid fel, returnera felmeddelande
        res.status(500).json({ ok: false, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});