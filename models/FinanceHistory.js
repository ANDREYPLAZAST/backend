const mongoose = require('mongoose');

const financeHistorySchema = new mongoose.Schema({
    ticker: String,
    consultasPorUsuario: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }],
    esFavorito: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('FinanceHistory', financeHistorySchema); 