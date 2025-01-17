const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Ruta para login
router.post('/auth/login', authController.login);

// Ruta para verificar OTP
router.post('/auth/verify-otp', authController.verifyOTP);

// Ruta para obtener el perfil del usuario
router.get('/auth/profile', auth, authController.getProfile);

// Ruta para registrar un nuevo usuario
router.post('/auth/register', authController.register);

module.exports = router;