const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// Rutas
router.post('/transactions', transactionController.create);
router.get('/transactions', transactionController.getAll);
router.get('/credito-disponible', transactionController.getCreditoDisponible);
router.put('/meta-ahorro', transactionController.updateMetaAhorro);

module.exports = router; 