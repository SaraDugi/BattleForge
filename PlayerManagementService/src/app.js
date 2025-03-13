const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const playerRoutes = require('./playerRoutes');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true              
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/players', playerRoutes);

app.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}`;
  console.log(`Server is running on port ${PORT}`);
  console.log(`Full API URL for players: ${baseUrl}/players`);
});