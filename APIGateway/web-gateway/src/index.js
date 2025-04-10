const express = require('express');
const axios = require('axios');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

const playerClient = new playerProto.PlayerService(
  'localhost:5000',
  grpc.credentials.createInsecure()
);

const app = express();
app.use(express.json());

app.post('/api/battles', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:7000/api/battles', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    res.status(status).json({ error: String(error) });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5050/booking/reservations', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    res.status(status).json({ error: String(error) });
  }
});

app.get('/api/players/:id', (req, res) => {
  const playerId = Number(req.params.id);
  playerClient.FindPlayers({ id: playerId }, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (response.players.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(response.players[0]);
  });
});

app.get('/api/players/:id/overview', async (req, res) => {
  const playerId = Number(req.params.id);
  try {
    const playerInfo = await new Promise((resolve, reject) => {
      playerClient.FindPlayers({ id: playerId }, (err, data) => {
        if (err) reject(err);
        else if (data.players.length === 0) reject(new Error('Player not found'));
        else resolve(data.players[0]);
      });
    });

    const bookingsResp = await axios.get(`http://localhost:5050/booking/reservation_assignments/user/${playerId}`);

    const overview = {
      player: playerInfo,
      reservations: bookingsResp.data,
    };
    res.json(overview);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ error: String(error) });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Web API Gateway running on port ${PORT}`);
});