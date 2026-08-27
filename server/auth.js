import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'navonmesh-tedx-raichur-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'navonmesh2026!';

export function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

export function generateToken(payload = { role: 'admin' }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired admin session.' });
  }
}
