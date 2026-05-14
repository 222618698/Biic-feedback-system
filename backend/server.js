// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes     = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for dev; use nginx/S3 in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api',      feedbackRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', company: 'Pillar 5 Group', timestamp: new Date().toISOString() })
);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, _req, res, _next) => {
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: `File too large. Max size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.` });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ success: false, message: 'Too many files. Maximum 5 allowed.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀  Pillar 5 Group API running → http://localhost:${PORT}`);
});
