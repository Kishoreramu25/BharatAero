// Input payload validator using key checking schemas
module.exports = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const source = req.method === 'GET' ? req.query : req.body;

    for (const [key, rule] of Object.entries(schema)) {
      const value = source[key];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${key}' is required.`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rule.type === 'number' && isNaN(Number(value))) {
          errors.push(`Field '${key}' must be a number.`);
        }
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`Field '${key}' must be a string.`);
        }
        if (rule.regex && !rule.regex.test(value)) {
          errors.push(`Field '${key}' is invalid according to formatting rules.`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Validation failed.',
          details: errors,
          status: 400
        }
      });
    }

    next();
  };
};
