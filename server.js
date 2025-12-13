

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


const timeEditService = require('./services/timeEditService');
const canvasService = require('./services/canvasService');

app.use(express.json());
app.use(express.static('public'));

// rout för canvas
app.post('/api/canvas-export', async (req, res) => {
    const reservations = req.body.reservations;
    if (!Array.isArray(reservations) || reservations.length === 0) {
        return res.status(400).json({ ok: false, message: 'Inga reservationer att exportera.' });
    }
    try {
        // Konvertera och exportera varje reservation
        const results = [];
        for (const reservation of reservations) {
            try {
                const eventObj = canvasService.timeEditToCanvasEvent(reservation);
                const apiResult = await canvasService.createCalendarEvent(eventObj);
                results.push({ ok: true, event: apiResult });
            } catch (err) {
                results.push({ ok: false, message: err.message });
            }
        }
        res.json({ ok: true, results });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// route för timeedit
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