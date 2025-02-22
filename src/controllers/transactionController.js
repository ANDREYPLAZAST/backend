const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Credit = require('../models/Credit');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const transactionController = {
    // Crear nueva transacción
    create: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { tipo, categoria, monto, descripcion } = req.body;
            const usuarioId = req.user._id;

            // Crear la transacción
            const transaction = new Transaction({
                usuarioId,
                tipo,
                categoria,
                monto,
                descripcion,
                fecha: new Date()
            });

            await transaction.save({ session });

            // Actualizar balance del usuario
            const user = await User.findById(usuarioId);
            if (tipo === 'ingreso') {
                user.balanceActual += parseFloat(monto);
            } else if (tipo === 'egreso') {
                user.balanceActual -= parseFloat(monto);
            }
            await user.save({ session });

            // Calcular nuevos totales
            const totales = await Transaction.aggregate([
                { 
                    $match: { 
                        usuarioId: new ObjectId(usuarioId)
                    } 
                },
                { 
                    $group: {
                        _id: null,
                        ingresos: {
                            $sum: {
                                $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0]
                            }
                        },
                        gastos: {
                            $sum: {
                                $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0]
                            }
                        }
                    }
                }
            ]).session(session);

            await session.commitTransaction();

            res.status(201).json({
                message: "Transacción creada exitosamente",
                transaction,
                balanceActual: user.balanceActual,
                totales: {
                    ingresos: totales[0]?.ingresos || 0,
                    gastos: totales[0]?.gastos || 0
                }
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Error al crear transacción:', error);
            res.status(500).json({ error: 'Error al crear la transacción' });
        } finally {
            session.endSession();
        }
    },

    // Obtener todas las transacciones con totales
    getAll: async (req, res) => {
        try {
            const usuarioId = req.user._id;

            // Obtener todas las transacciones
            const transactions = await Transaction.find({ usuarioId })
                .sort({ fecha: -1 });

            // Calcular totales
            const totales = await Transaction.aggregate([
                { 
                    $match: { 
                        usuarioId: new ObjectId(usuarioId)
                    } 
                },
                { 
                    $group: {
                        _id: null,
                        ingresos: {
                            $sum: {
                                $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0]
                            }
                        },
                        gastos: {
                            $sum: {
                                $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0]
                            }
                        }
                    }
                }
            ]);

            // Obtener usuario para el balance actual
            const user = await User.findById(usuarioId);

            res.json({
                transactions,
                balanceActual: user.balanceActual,
                totales: {
                    ingresos: totales[0]?.ingresos || 0,
                    gastos: totales[0]?.gastos || 0
                }
            });

        } catch (error) {
            console.error('Error al obtener transacciones:', error);
            res.status(500).json({ error: 'Error al obtener las transacciones' });
        }
    },

    // Obtener crédito disponible
    getCreditoDisponible: async (req, res) => {
        try {
            const usuarioId = req.user._id;
            
            // Buscar créditos activos del usuario
            const creditoActivo = await Credit.findOne({
                usuarioId,
                estado: 'activo'
            });

            const creditoDisponible = creditoActivo ? creditoActivo.montoAprobado - creditoActivo.montoUtilizado : 0;

            res.json({
                creditoDisponible,
                tieneCredito: !!creditoActivo
            });

        } catch (error) {
            console.error('Error al obtener crédito disponible:', error);
            res.status(500).json({ error: 'Error al obtener información del crédito' });
        }
    },

    // Actualizar meta de ahorro
    updateMetaAhorro: async (req, res) => {
        try {
            const { metaAhorro } = req.body;
            const usuarioId = req.user._id;

            const user = await User.findByIdAndUpdate(
                usuarioId,
                { metaAhorro },
                { new: true }
            );

            res.json({
                message: 'Meta de ahorro actualizada',
                metaAhorro: user.metaAhorro
            });

        } catch (error) {
            console.error('Error al actualizar meta de ahorro:', error);
            res.status(500).json({ error: 'Error al actualizar meta de ahorro' });
        }
    }
};

module.exports = transactionController; 