// RUTA: mi-wallet-backend/routes/api.js

import express from 'express';
import Card from '../models/Card.js';
import Period from '../models/Period.js';
import Widget from '../models/Widget.js';

const router = express.Router();

// --- FUNCIÓN MIDDLEWARE DE PROTECCIÓN DE ID (NUEVA) ---
const getValidId = (req, res, next) => {
    const id = req.params.id;
    // Si el ID no existe, es nulo o 'undefined', devolvemos error 400
    if (!id || id === 'undefined') {
        return res.status(400).json({ message: "ID de recurso inválido o faltante." });
    }
    next();
};

// --- RUTAS DE TARJETAS (APLICANDO PROTECCIÓN) ---

// ... (getCards, postCards quedan igual) ...

// Editar tarjeta
router.put('/cards/:id', getValidId, async (req, res) => { // Agregamos getValidId
  try {
    // Nota: findByIdAndUpdate buscará por _id en el cuerpo, que es lo que React le envía como 'id'
    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCard) return res.status(404).json({ message: 'Tarjeta no encontrada' });
    res.json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar tarjeta
router.delete('/cards/:id', getValidId, async (req, res) => { // Agregamos getValidId
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarjeta eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// --- RUTAS DE PERIODOS (APLICANDO PROTECCIÓN) ---

// ... (getPeriods, postPeriods quedan igual) ...

// Actualizar periodo
router.put('/periods/:id', getValidId, async (req, res) => { // Agregamos getValidId
  try {
    const updatedPeriod = await Period.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPeriod) return res.status(404).json({ message: 'Periodo no encontrado' });
    res.json(updatedPeriod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar periodo
router.delete('/periods/:id', getValidId, async (req, res) => { // Agregamos getValidId
  try {
    await Period.findByIdAndDelete(req.params.id);
    res.json({ message: 'Periodo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ... (Rutas de Widgets quedan igual, no suelen usar parámetros de ID) ...

export default router;