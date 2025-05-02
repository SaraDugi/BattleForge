const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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
  console.log(`Micro Frontend UI running on http://localhost:${PORT}`);
});