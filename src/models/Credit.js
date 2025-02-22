const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    montoAprobado: {
        type: Number,
        required: true
    },
    montoUtilizado: {
        type: Number,
        default: 0
    },
    tasaInteres: {
        type: Number,
        required: true
    },
    plazo: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['activo', 'pagado', 'atrasado'],
        default: 'activo'
    },
    fechaAprobacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Credit', creditSchema); 