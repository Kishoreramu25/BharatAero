// Standard Express middleware logging client requests and route matching times
module.exports = (req, res, next) => {
  const start = Date.now();
  const { method, url } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[API Request] ${method} ${url} -> Status: ${statusCode} (${duration}ms)`);
  });
  
  next();
};
