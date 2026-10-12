// Builds the Express app (no listening here, so it is easy to test)
const path = require('path');
const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '10kb' }));

// REST API
app.use('/api', requestLogger, routes);
app.use('/api', notFound);

// Serve the frontend from the same server (no CORS needed this way)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use(errorHandler);

module.exports = app;
