const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Obtenemos el token del encabezado "Authorization"
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // Verificamos el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Establecemos el ID del usuario en la solicitud
    next(); // Pasamos al siguiente middleware o controlador
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = auth;