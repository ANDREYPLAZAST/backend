const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = require('../middleware/upload');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profile-images/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMulter = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no soportado'), false);
    }
  }
});

// Rutas públicas
router.post('/auth/login', authController.login);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/register', authController.register);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-code', authController.verifyCode);
router.post('/auth/reset-password', authController.resetPassword);

// Rutas protegidas (requieren autenticación)
router.get('/auth/profile', auth, authController.getProfile);
router.put('/users/profile', auth, userController.updateProfile);
router.put('/users/change-password', auth, userController.changePassword);

// Ruta para subir imagen de perfil
router.post('/users/profile-image', 
  auth, 
  uploadMulter.single('profileImage'),
  userController.uploadProfileImage
);

module.exports = router; 