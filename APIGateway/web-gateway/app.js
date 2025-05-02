// gateway.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const playerClient = require('./grpcPlayerClient');
const axios = require('axios');
const logger = require('./logger');

const app = express();
app.use(bodyParser.json());

const BOOKING_URL = 'http://localhost:5050';
const BATTLE_URL = 'http://localhost:3000';

// ----- PLAYER -----
app.post('/api/player', (req, res) => playerClient.CreatePlayer(req.body, grpcResponse(res)));
app.get('/api/player', (req, res) => playerClient.FindPlayers(req.query, grpcResponse(res)));
app.post('/api/player/login', (req, res) => playerClient.Login(req.body, grpcResponse(res)));
app.patch('/api/player/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  if (updates.email) return playerClient.UpdateEmail({ id, email: updates.email }, grpcResponse(res));
  if (updates.password) return playerClient.UpdatePassword({ id, accountPassword: updates.password }, grpcResponse(res));
  if (updates.nickname || updates.firstName || updates.lastName)
    return playerClient.UpdateProfile({ id, ...updates }, grpcResponse(res));
  if (updates.score) return playerClient.UpdateScore({ id, score: updates.score }, grpcResponse(res));
  if (updates.mainFaction) return playerClient.UpdateMainFaction({ id, mainFaction: updates.mainFaction }, grpcResponse(res));
  if (updates.profilePic || updates.banner)
    return playerClient.UpdateMedia({ id, profilePic: updates.profilePic, banner: updates.banner }, grpcResponse(res));

  res.status(400).json({ error: 'No valid update fields provided' });
});

app.delete('/api/player/:id', (req, res) => playerClient.DeletePlayerById({ id: parseInt(req.params.id) }, grpcResponse(res)));
app.post('/api/player/:id/achievement', (req, res) => playerClient.AddAchievement({ id: parseInt(req.params.id), achievement: req.body.achievement }, grpcResponse(res)));
app.get('/api/reservations', proxyToBooking);
app.get('/api/reservations/:id', proxyToBooking);
app.get('/api/reservations/search', proxyToBooking);
app.post('/api/reservations', proxyToBooking);
app.patch('/api/reservations/:id', proxyToBooking);
app.delete('/api/reservations/:id', proxyToBooking);
app.get('/api/reservations/:id/assignments', proxyToBooking);
app.post('/api/reservations/:id/assignments', proxyToBooking);
app.patch('/api/reservations/:id/assignments/:userId', proxyToBooking);
app.delete('/api/reservations/:id/assignments/:userId', proxyToBooking);
app.post('/api/battles', proxyToBattle);
app.get('/api/battles', proxyToBattle);
app.get('/api/battles/:id', proxyToBattle);
app.patch('/api/battles/:id/status', proxyToBattle);
app.patch('/api/battles/:id/winner', proxyToBattle);
app.post('/api/battles/:id/events', proxyToBattle);
app.get('/api/battles/:id/events', proxyToBattle);

function grpcResponse(res) {
  return (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  };
}

async function proxyToBooking(req, res) {
  try {
    const url = `${BOOKING_URL}${req.originalUrl.replace('/api', '')}`;
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      params: req.query,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    logger.error(`Booking proxy error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

async function proxyToBattle(req, res) {
  try {
    const url = `${BATTLE_URL}${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      params: req.query,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    logger.error(`Battle proxy error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

const PORT = process.env.GATEWAY_PORT || 8080;
app.listen(PORT, () => logger.info(`Unified Gateway listening on http://localhost:${PORT}`));