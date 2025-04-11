const express = require('express');
const axios = require('axios');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(express.json());

// Load gRPC PlayerService
const playerProtoPath = path.join(__dirname, '../proto/player.proto');
const packageDefinition = protoLoader.loadSync(playerProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '../proto'), './node_modules/google-proto-files']
});
const playerProto = grpc.loadPackageDefinition(packageDefinition).player;

const playerClient = new playerProto.PlayerService('localhost:5000', grpc.credentials.createInsecure());

// -------------------- BATTLE ROUTES --------------------

app.post('/api/battles', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:7000/api/battles', req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/battles', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:7000/api/battles');
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/battles/:battleId', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:7000/api/battles/${req.params.battleId}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.put('/api/battles/:battleId/status', async (req, res) => {
  try {
    const response = await axios.put(`http://localhost:7000/api/battles/${req.params.battleId}/status`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.put('/api/battles/:battleId/winner', async (req, res) => {
  try {
    const response = await axios.put(`http://localhost:7000/api/battles/${req.params.battleId}/winner`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.post('/api/battles/:battleId/events', async (req, res) => {
  try {
    const response = await axios.post(`http://localhost:7000/api/battles/${req.params.battleId}/events`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/battles/:battleId/events', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:7000/api/battles/${req.params.battleId}/events`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

// -------------------- RESERVATIONS --------------------

app.get('/api/reservations/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5050/booking/reservations/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/reservations/by-date', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5050/booking/reservations/by-date', { params: req.query });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/reservations/table/:table_assigned', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5050/booking/reservations/table/${req.params.table_assigned}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

// -------------------- RESERVATION ASSIGNMENTS --------------------

app.get('/api/reservation_assignments', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5050/booking/reservation_assignments');
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/reservation_assignments/:reservation_id', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5050/booking/reservation_assignments/${req.params.reservation_id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.get('/api/reservation_assignments/user/:user_id', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5050/booking/reservation_assignments/user/${req.params.user_id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.post('/api/reservation_assignments', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5050/booking/reservation_assignments', req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.put('/api/reservation_assignments/:reservation_id/:user_id', async (req, res) => {
  try {
    const url = `http://localhost:5050/booking/reservation_assignments/${req.params.reservation_id}/${req.params.user_id}`;
    const response = await axios.put(url, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

app.delete('/api/reservation_assignments/:reservation_id/:user_id', async (req, res) => {
  try {
    const url = `http://localhost:5050/booking/reservation_assignments/${req.params.reservation_id}/${req.params.user_id}`;
    const response = await axios.delete(url);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: String(err) });
  }
});

// -------------------- PLAYER SERVICE (gRPC) --------------------

app.post('/api/players', (req, res) => {
  const data = req.body;

  // Ensure achievements is an array of strings
  if (typeof data.achievements === 'string') {
    data.achievements = [data.achievements];
  } else if (!Array.isArray(data.achievements)) {
    data.achievements = [];
  }

  playerClient.CreatePlayer(data, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: response.id });
  });
});

app.delete('/api/players/:id', (req, res) => {
  playerClient.DeletePlayerById({ id: Number(req.params.id) }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Player deleted successfully" });
  });
});

app.post('/api/players/query', (req, res) => {
  playerClient.FindPlayers(req.body, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.players);
  });
});

app.post('/api/players/:id/achievements', (req, res) => {
  playerClient.AddAchievement({ id: Number(req.params.id), achievement: req.body.achievement }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Achievement added" });
  });
});

const updatePlayerField = (method) => (req, res) => {
  const data = { ...req.body, id: Number(req.params.id) };
  playerClient[method](data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `${method} successful` });
  });
};

app.put('/api/players/:id/update/profile', updatePlayerField('UpdateProfile'));
app.put('/api/players/:id/update/email', updatePlayerField('UpdateEmail'));
app.put('/api/players/:id/update/password', updatePlayerField('UpdatePassword'));
app.put('/api/players/:id/update/score', updatePlayerField('UpdateScore'));
app.put('/api/players/:id/update/stats', updatePlayerField('UpdateStats'));
app.put('/api/players/:id/update/mainFaction', updatePlayerField('UpdateMainFaction'));
app.put('/api/players/:id/update/media', updatePlayerField('UpdateMedia'));

app.post('/api/players/login', (req, res) => {
  const { email, password } = req.body;
  playerClient.Login({ email, password }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ token: response.token, message: response.message });
  });
});

// -------------------- START SERVER --------------------

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Web API Gateway running on port ${PORT}`);
});