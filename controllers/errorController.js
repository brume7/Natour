const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const duplicateKey = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  // For other duplicate key errors, you can customize the message accordingly
  const message = `this value ${duplicateKey} is already in use. Please use another value.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  return new AppError(err.message, 400);
};

const handleJsonWebTokenError = (res) => {
  // Clear the cookie
  res.clearCookie('jwt'); // Replace 'yourCookieName' with the actual name of your cookie

  // Redirect to '/'
  res.redirect('/login');
};
// const handleJsonWebTokenError = (err) => new AppError(err.message + '. please sign in again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    errorStack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(`error 💥 ${err}`);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = ({ name, message, statusCode, status, isOperational, stack } = err);
  if (error.name == 'CastError') error = handleCastErrorDB(error);
  if (/E11000/.test(error.message)) error = handleDuplicateFieldsDB(error);
  if (error.name == 'ValidationError') error = handleValidationErrorDB(error);
  // if (error.name == 'JsonWebTokenError' || error.name == 'TokenExpiredError') error = handleJsonWebTokenError(error);

  if (error.name == 'JsonWebTokenError' || error.name == 'TokenExpiredError') {
    handleJsonWebTokenError(res);
  } else if (process.env.NODE_ENV == 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV == 'production') {
    sendErrorProd(error, res);
  }
};
