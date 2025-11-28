import express from 'express';
// CAMBIO CLAVE: Usamos require en lugar de import
const Card = require('../models/Card'); 
const Period = require('../models/Period');
const Widget = require('../models/Widget');

const router = express.Router();

// --- FUNCIÓN MIDDLEWARE DE PROTECCIÓN DE ID ---
const getValidId = (req, res, next) => {
    const id = req.params.id;
    if (!id || id === 'undefined') {
        return res.status(400).json({ message: "ID de recurso inválido o faltante." });
    }
    next();
};

// --- RUTAS DE TARJETAS ---

router.get('/cards', async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

router.post('/cards', async (req, res) => {
  try {
    const newCard = new Card(req.body);
    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/cards/:id', getValidId, async (req, res) => { 
  try {
    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCard) return res.status(404).json({ message: 'Tarjeta no encontrada' });
    res.json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/cards/:id', getValidId, async (req, res) => { 
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarjeta eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// --- RUTAS DE PERIODOS ---

router.get('/periods', async (req, res) => {
  const periods = await Period.find();
  res.json(periods);
});

router.post('/periods', async (req, res) => {
  try {
    const newPeriod = new Period(req.body);
    const savedPeriod = await newPeriod.save();
    res.status(201).json(savedPeriod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/periods/:id', getValidId, async (req, res) => { 
  try {
    const updatedPeriod = await Period.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPeriod) return res.status(404).json({ message: 'Periodo no encontrado' });
    res.json(updatedPeriod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/periods/:id', getValidId, async (req, res) => { 
  try {
    await Period.findByIdAndDelete(req.params.id);
    res.json({ message: 'Periodo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// --- RUTAS DE WIDGETS ---

router.get('/widgets', async (req, res) => {
  try {
    const widgets = await Widget.find().sort({ order: 1 });
    res.json(widgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/widgets', async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
        await Widget.deleteMany({});
        const savedWidgets = await Widget.insertMany(req.body);
        return res.json(savedWidgets);
    }
    const newWidget = new Widget(req.body);
    const saved = await newWidget.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;