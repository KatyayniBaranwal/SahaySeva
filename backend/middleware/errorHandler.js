const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server.';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id format.';
  }
  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate record: this value already exists.';
  }
  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
