import mongoose from 'mongoose';

const widgetSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  isFixed: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

export default mongoose.model('Widget', widgetSchema);