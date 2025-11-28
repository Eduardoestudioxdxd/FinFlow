import express from 'express';
import Card from '../models/Card.js';
import Period from '../models/Period.js';
import Widget from '../models/Widget.js';

const router = express.Router();

// --- TARJETAS ---
router.get('/cards', async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});
router.post('/cards', async (req, res) => {
  const newCard = new Card(req.body);
  const savedCard = await newCard.save();
  res.json(savedCard);
});
router.put('/cards/:id', async (req, res) => {
  const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedCard);
});
router.delete('/cards/:id', async (req, res) => {
  await Card.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado' });
});

// --- PERIODOS ---
router.get('/periods', async (req, res) => {
  const periods = await Period.find();
  res.json(periods);
});
router.post('/periods', async (req, res) => {
  const newPeriod = new Period(req.body);
  const savedPeriod = await newPeriod.save();
  res.json(savedPeriod);
});
router.put('/periods/:id', async (req, res) => {
  const updatedPeriod = await Period.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedPeriod);
});
router.delete('/periods/:id', async (req, res) => {
  await Period.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado' });
});

// --- WIDGETS ---
router.get('/widgets', async (req, res) => {
  const widgets = await Widget.find().sort({ order: 1 });
  res.json(widgets);
});
router.post('/widgets', async (req, res) => {
  if (Array.isArray(req.body)) {
      await Widget.deleteMany({});
      const savedWidgets = await Widget.insertMany(req.body);
      return res.json(savedWidgets);
  }
  const newWidget = new Widget(req.body);
  const saved = await newWidget.save();
  res.json(saved);
});
// ... (Todo el código anterior de cards, periods, widgets se queda igual) ...

// --- AUTENTICACIÓN (NUEVO) ---
export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en el registro');
  return data;
};

export const loginUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en el inicio de sesión');
  return data;
};
export default router;