const errorHandler = (err, req, res, next) => {
 
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    res.status(400);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    res.status(400);
  }

  // Handle MongoDB duplicate key errors (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    message = field 
      ? `Duplicate value for field: ${field}` 
      : 'Duplicate field value entered';
    res.status(400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    res.status(401);
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired';
    res.status(401);
  }

  // Send response
  res.status(res.statusCode !== 200 ? res.statusCode : statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;