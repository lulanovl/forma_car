// Vercel serverless entry point.
// Vercel imports this file and uses the exported Express app as a
// request handler — no listen() is called here.
const app = require('../backend/src/app');

module.exports = app;
