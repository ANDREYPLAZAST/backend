const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar el middleware de autenticación
const auth = require('./src/middleware/auth');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Crear carpeta de uploads si no existe
const uploadDir = path.join(__dirname, 'uploads/profile-images');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar carpeta de uploads como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/curso_app')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Importar rutas
const yahooFinanceService = require('./src/services/yahooFinanceService');
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Usar rutas
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', userRoutes);

// Ruta para fondos
app.get('/api/fondo/:ticker', auth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase(); // Convertir a mayúsculas
        console.log('Buscando ticker:', ticker);

        const datos = await yahooFinanceService.obtenerDatosFondo(ticker);
        
        if (!datos) {
            return res.status(404).json({ 
                error: "No se encontraron datos para este ticker",
                ticker 
            });
        }

        res.json({
            status: 'success',
            data: datos
        });
    } catch (error) {
        console.error('Error en la ruta /api/fondo/:ticker:', error);
        res.status(500).json({ 
            status: 'error',
            error: "Error al obtener datos financieros",
            message: error.message,
            ticker: req.params.ticker
        });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
