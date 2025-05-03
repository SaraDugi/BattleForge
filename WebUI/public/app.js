const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Serve static micro frontends
app.use('/players', express.static(path.join(__dirname, 'players')));
app.use('/reservations', express.static(path.join(__dirname, 'booking')));
app.use('/battles', express.static(path.join(__dirname, 'battles')));
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/register', express.static(path.join(__dirname, 'register')));

// Default static for root (homepage/index)
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API requests to the gateway
const API_GATEWAY = process.env.API_GATEWAY || 'http://localhost:7000';
app.use('/api', async (req, res) => {
  try {
    const url = `${API_GATEWAY}${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url,
      headers: req.headers,
      data: req.body,
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Micro Frontend UI running at http://localhost:${PORT}`);
});