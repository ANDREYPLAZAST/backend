const multer = require('multer');
const path = require('path');

// Configurar el almacenamiento
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profile-images/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Verificar tipo de archivo
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se permiten jpg, jpeg y png'), false);
  }
};

// Crear el middleware de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload; 