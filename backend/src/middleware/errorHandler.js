/**
 * Global error handler middleware.
 * Must be registered last in the Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler]', err.message || err);

  const status = err.status || err.statusCode || 500;

  // In production, hide internal error details from clients
  const isProduction = process.env.NODE_ENV === 'production';
  const message = (isProduction && status === 500)
    ? 'Внутренняя ошибка сервера'
    : (err.message || 'Внутренняя ошибка сервера');

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
