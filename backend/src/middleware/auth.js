const { verifyJwt } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const token = authHeader.slice(7);
  const payload = verifyJwt(token);

  if (!payload) {
    return res.status(401).json({ error: 'Токен недействителен или истёк' });
  }

  req.user = payload;
  next();
}

module.exports = { requireAuth };
