const User = require('../models/User');

// Inicializar balance
exports.inicializarBalance = async (req, res) => {
  try {
    const { monto } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.balanceInicial = monto;
    user.balanceActual = monto;
    
    // Registrar como primer movimiento
    user.movimientos.push({
      tipo: 'ingreso',
      descripcion: 'Balance inicial',
      monto: monto,
      fecha: new Date()
    });

    await user.save();

    res.json({
      message: 'Balance inicial establecido',
      balanceActual: user.balanceActual
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al establecer balance inicial' });
  }
};

// Registrar movimiento
exports.registrarMovimiento = async (req, res) => {
  try {
    const { tipo, descripcion, monto } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar balance según tipo de movimiento
    if (tipo === 'ingreso') {
      user.balanceActual += monto;
    } else if (tipo === 'egreso') {
      if (user.balanceActual < monto) {
        return res.status(400).json({ message: 'Saldo insuficiente' });
      }
      user.balanceActual -= monto;
    }

    // Registrar movimiento
    user.movimientos.push({
      tipo,
      descripcion,
      monto,
      fecha: new Date()
    });

    await user.save();

    res.json({
      message: 'Movimiento registrado exitosamente',
      balanceActual: user.balanceActual,
      movimiento: user.movimientos[user.movimientos.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar movimiento' });
  }
}; 