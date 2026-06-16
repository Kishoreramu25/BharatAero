// Sample authentication verification middleware using JWT
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
    // In a production application, you would verify using a library like jsonwebtoken:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    
    // For demo/scaffolding purposes, we mock verification of a token prefix
    if (token === 'mock-token-bharataero') {
      req.user = { id: 1, email: 'pilot@bharataero.com', role: 'pilot' };
      return next();
    }
    
    return res.status(403).json({
      error: {
        message: 'Invalid or expired authentication token.',
        status: 403
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        message: 'Authentication process failed.',
        status: 500
      }
    });
  }
};
