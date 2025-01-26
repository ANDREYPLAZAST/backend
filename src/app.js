const express = require('express');
const app = express();

const authRoutes = require('./routes/auth');

// Rutas
app.use('/api/auth', authRoutes);

module.exports = app; 