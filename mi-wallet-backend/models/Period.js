const mongoose = require('mongoose');

// Sub-esquema para los widgets de periodo
const periodWidgetSchema = new mongoose.Schema({
    id: { type: Number, required: true }, 
    type: { type: String, enum: ['chart', 'recent', 'balance'], required: true }, 
    title: { type: String, required: true }
}, { _id: false });

// Sub-esquema para los movimientos
const movementSchema = new mongoose.Schema({
    // CORRECCIÓN IMPORTANTE: Agregamos 'id' explícitamente para poder identificar y borrar movimientos únicos
    id: { type: Number, required: true }, 
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    date: { type: String, required: true },
    iconKey: { type: String, default: 'other' },
    cardId: { type: String, default: '' }
}, { _id: false });

const periodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    budget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    color: { type: String, default: '#3B82F6' },
    movements: [movementSchema],
    widgets: [periodWidgetSchema]
}, { timestamps: true });

module.exports = mongoose.model('Period', periodSchema);