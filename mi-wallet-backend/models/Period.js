const mongoose = require('mongoose');

// NUEVO: Define el sub-esquema para los widgets de periodo
const periodWidgetSchema = new mongoose.Schema({
    // Usamos 'id' de frontend (Date.now()) en lugar de '_id' de Mongoose
    id: { type: Number, required: true }, 
    type: { type: String, enum: ['chart', 'recent', 'balance'], required: true }, 
    title: { type: String, required: true }
}, { _id: false });

// Sub-esquema para los movimientos
const movementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    date: { type: String, required: true },
    iconKey: { type: String, default: 'other' },
    cardId: { type: String, default: '' }
}, { _id: false }); // <--- CAMBIO CRÍTICO AÑADIDO

const periodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    budget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    color: { type: String, default: '#3B82F6' },
    movements: [movementSchema],
    // CAMBIO CRÍTICO: Añadido el campo widgets
    widgets: [periodWidgetSchema]
}, { timestamps: true });

module.exports = mongoose.model('Period', periodSchema);