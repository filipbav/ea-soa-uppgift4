
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Importera services
const timeeditService = require('./services/timeeditService');
const canvasService = require('./services/canvasService');

// Express config
app.use(express.json()); 
app.use(express.static('public')); 








app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});