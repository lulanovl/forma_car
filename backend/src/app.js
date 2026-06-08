require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');

const routes       = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.)
app.use(helmet());

// Restrict CORS to the configured client origin only
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

// Only start the HTTP server when running directly (local dev).
// When Vercel imports this file as a serverless function it just uses
// the exported `app` as a request handler — no listen() needed.
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`FormaCar API running on port ${PORT}`));
}

module.exports = app;
