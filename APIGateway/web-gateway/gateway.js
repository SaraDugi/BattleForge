const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const logger = require('./logger');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const cors = require('cors'); 
const path = require('path');

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const BOOKING_URL = 'http://bookingservice:5050';
const BATTLE_URL = 'http://battle-simulation:7000';
const PROTO_PATH = path.join(__dirname, 'protos', 'player.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const playerProto = grpc.loadPackageDefinition(packageDefinition).player;

const playerClient = new playerProto.PlayerService(
  'playermanagementservice:5000',
  grpc.credentials.createInsecure()
);

app.post('/api/player', (req, res) => {
  const body = req.body;

  const playerData = {
    id: body.id || 0,
    firstName: body.firstName || '',
    lastName: body.lastName || '',
    nickname: body.nickname,
    email: body.email,
    accountPassword: body.accountPassword || '',
    mainFaction: body.mainFaction || 'Unaligned',
    eloRating: body.eloRating || 1000,
    wins: body.wins || 0,
    losses: body.losses || 0,
    tournamentsParticipated: body.tournamentsParticipated || 0,
    achievements: body.achievements || '[]',
    score: body.score || 0,
    profilePic: body.profilePic || '',
    banner: body.banner || '',
    teamId: body.teamId || 0,
  };
  console.log('CreatePlayer request:', playerData);
  playerClient.CreatePlayer(playerData, grpcResponse(res));
});

app.get('/api/player', (req, res) => playerClient.FindPlayers(req.query, grpcResponse(res)));
app.post('/api/player/login', (req, res) => {
  playerClient.Login(req.body, (err, result) => {
    if (err) return res.status(401).json({ error: err.message });
    return res.json({
      message: result.message,
      playerId: result.userId,         
      nickname: result.nickname || ""
    });
  });
});

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
app.get('/api/player/:id', (req, res) => {
  const id = parseInt(req.params.id);
  playerClient.FindPlayers({ id }, grpcResponse(res));
});
app.delete('/api/player/:id', (req, res) => playerClient.DeletePlayerById({ id: parseInt(req.params.id) }, grpcResponse(res)));
app.post('/api/player/:id/achievement', (req, res) => {
  playerClient.AddAchievement(
    { id: parseInt(req.params.id), achievement: req.body.achievement },
    grpcResponse(res)
  );
});

app.get('/api/reservations', proxyToBooking);
app.get('/api/reservations/:id', proxyToBooking);
app.get('/api/reservations/search', proxyToBooking);
app.get('/api/reservations/by-date', proxyToBooking);
app.get('/api/reservations/table/:table', proxyToBooking);
app.post('/api/reservations', proxyToBooking);
app.put('/api/reservations/:id', proxyToBooking);
app.delete('/api/reservations/:id', proxyToBooking);

app.get('/api/reservation_assignments', proxyToBooking);
app.get('/api/reservation_assignments/:reservation_id', proxyToBooking);
app.get('/api/reservation_assignments/user/:user_id', proxyToBooking);
app.post('/api/reservation_assignments', proxyToBooking);
app.put('/api/reservation_assignments/:reservation_id/:user_id', proxyToBooking);
app.delete('/api/reservation_assignments/:reservation_id/:user_id', proxyToBooking);

app.post('/api/battles', proxyToBattle);
app.get('/api/battles', proxyToBattle);
app.get('/api/battles/:battleId', proxyToBattle);
app.put('/api/battles/:battleId/status', proxyToBattle);
app.put('/api/battles/:battleId/winner', proxyToBattle);
app.post('/api/battles/:battleId/events', proxyToBattle);
app.get('/api/battles/:battleId/events', proxyToBattle);

function grpcResponse(res) {
  return (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  };
}

async function proxyToBooking(req, res) {
  try {
    const url = `${BOOKING_URL}/booking${req.originalUrl.replace('/api', '')}`;
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      params: req.query,
      headers: req.headers,
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
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    logger.error(`Battle proxy error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

const PORT = process.env.GATEWAY_PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Unified Gateway listening on http://localhost:${PORT}`);
});