/**
 * src/app.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Express application factory.
 * Separating app creation from server.js allows the app to be imported
 * cleanly in tests without actually binding to a port.
 */



const express = require('express');
const cors = require('cors');


const employeeRoutes = require('./routes/employeeRoutes');
const assetRoutes = require('./routes/assetRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    // Allow the Vite dev server and the production Nginx host
    origin: [
      'http://localhost:5173', // Vite dev
      'http://localhost:4173', // Vite preview
      process.env.FRONTEND_ORIGIN || '*', // Production (set FRONTEND_ORIGIN in .env)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health-check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Employee & Asset API is running without erros',
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
