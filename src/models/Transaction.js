const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    tipo: { 
        type: String, 
        enum: ["ingreso", "egreso", "transferencia"],
        required: true 
    },
    categoria: { 
        type: String, 
        required: true 
    },
    monto: { 
        type: Number, 
        required: true 
    },
    descripcion: String,
    fecha: { 
        type: Date, 
        default: Date.now 
    },
    estado: { 
        type: String, 
        enum: ["completada", "pendiente", "cancelada"],
        default: "completada"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema); 