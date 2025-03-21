const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

function authenticate(call) {
  const meta = call.metadata.get('authorization');
  if (!meta || !meta.length) {
    throw new Error('Missing authorization metadata');
  }

  const authHeader = meta[0];
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization format');
  }
  const token = parts[1];

  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error('Invalid token');
  }
}

module.exports = { authenticate };