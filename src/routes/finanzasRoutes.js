const express = require('express');
const router = express.Router();
const finanzasController = require('../controllers/finanzasController');
const auth = require('../middleware/auth');

router.post('/balance/inicial', auth, finanzasController.inicializarBalance);
router.post('/movimientos', auth, finanzasController.registrarMovimiento);

module.exports = router; 