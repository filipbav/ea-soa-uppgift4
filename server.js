// server.js

const express = require('express');
const app = express();
const PORT = 3000; 

// Tell Express to serve client files from the 'public' directory
app.use(express.static('public')); 

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});