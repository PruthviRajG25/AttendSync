import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'attendsync_fallback_secret_key_12345';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token missing or invalid.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'attendsync_fallback_secret_key_12345';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT verification error details:', error);
    res.status(403).json({ message: 'Token expired or invalid.' });
    return;
  }
};
