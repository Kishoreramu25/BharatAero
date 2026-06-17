const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Access denied. Missing authorization token.',
        status: 401
      }
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const secret = process.env.JWT_SECRET || 'bharataero-default-jwt-secret-key-123456';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {

    return res.status(403).json({
      error: {
        message: 'Invalid or expired authentication token.',
        status: 403
      }
    });
  }
};
