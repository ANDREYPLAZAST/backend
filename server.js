const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Configurar carpeta de uploads como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/curso_app')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Importar y usar rutas
const yahooFinanceService = require('./src/services/yahooFinanceService');
const authRoutes = require('./src/routes/authRoutes');

// Usar rutas
app.use('/api', authRoutes);

// Ruta para fondos
app.get('/api/fondo/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker;
        const datos = await yahooFinanceService.obtenerDatosFondo(ticker);
        res.json(datos);
    } catch (error) {
        console.error('Error en la ruta /api/fondo/:ticker:', error);
        res.status(500).json({ 
            error: "Error al obtener datos financieros",
            mensaje: error.message 
        });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
