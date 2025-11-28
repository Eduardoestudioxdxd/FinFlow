const mongoose = require('mongoose');

// Sub-esquema para los movimientos (debe ser importado dentro de periodSchema)
const movementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: String, required: true },
  iconKey: { type: String, default: 'other' },
  cardId: { type: String, default: '' }
});

const periodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  color: { type: String, default: '#3B82F6' },
  movements: [movementSchema]
}, { timestamps: true });

module.exports = mongoose.model('Period', periodSchema);