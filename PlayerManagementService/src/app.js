const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const playerRoutes = require('./playerRoutes');
const winston = require('winston');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Player Management API',
      version: '1.0.0',
      description: 'API for managing players',
    },
    servers: [{
      url: `http://localhost:${PORT}`,
    }],
  },
  apis: ['./src/playerRoutes.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /generate-token:
 *   get:
 *     summary: Generate a test JWT token
 *     description: Returns a sample JWT token for testing.
 *     responses:
 *       200:
 *         description: JWT token generated successfully
 */
app.get('/generate-token', (req, res) => {
  const token = jwt.sign({ user: 'testUser' }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const mockUser = {
    email: 'test@example.com',
    passwordHash: await bcrypt.hash('password123', 10),
  };

  if (email !== mockUser.email) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, mockUser.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

app.use('/players', playerRoutes);

app.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}`;
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Full API URL for players: ${baseUrl}/players`);
  logger.info(`Swagger UI available at ${baseUrl}/api-docs`);
});

module.exports = app;