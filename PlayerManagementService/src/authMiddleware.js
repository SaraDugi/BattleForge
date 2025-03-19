const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Access denied, token missing' });
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };