// server.js

// Ladda in miljövariabler (som din CANVAS_ACCESS_TOKEN) från .env-filen
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3000; 

// Hämta token från .env-filen.
const CANVAS_TOKEN = process.env.CANVAS_ACCESS_TOKEN; 
// const CANVAS_BASE_URL = 'https://canvas.ltu.se/api/v1'; // Sparad för senare

// --- EXPRESS CONFIGURATION ---
app.use(express.json()); 
app.use(express.static('public')); 

// --- API ROUTES (BACKEND LOGIC) ---

// 1. TOKEN TEST ROUTE
// Syfte: Verifiera att token läses in korrekt från .env
app.get('/api/test-token', (req, res) => {
    if (CANVAS_TOKEN && CANVAS_TOKEN.length > 10) {
        res.send('Token loaded successfully! (Length: ' + CANVAS_TOKEN.length + ')');
    } else {
        // Kontrollerar även om token är tom eller för kort
        res.status(500).send('Error: CANVAS_ACCESS_TOKEN is missing or too short. Check your .env file.');
    }
});

// 2. TIMEEDIT DATA RETRIEVAL ROUTE (Ska implementeras här)
app.get('/api/schedule/timeedit', (req, res) => {
    res.status(501).send('TimeEdit Route not implemented.');
});


// --- SERVER STARTUP ---
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});