const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Obtener el token del header y limpiarlo
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(403).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Asegurarnos de que el ID del usuario esté presente
    if (!decoded.id) {
      return res.status(403).json({ message: 'Token inválido: ID de usuario no encontrado' });
    }

    // Guardar el ID del usuario en req para uso posterior
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = auth;