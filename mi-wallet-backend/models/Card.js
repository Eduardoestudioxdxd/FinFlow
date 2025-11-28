import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  digitos: { type: String, required: true },
  tipo: { type: String, enum: ['Crédito', 'Débito'], required: true },
  gasto: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  color: { type: String, default: '#334155' }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);