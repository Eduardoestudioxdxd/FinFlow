// src/api.js

// ESTA ES LA LÍNEA QUE FALTABA:
const API_URL = 'https://finflow-ssbh.onrender.com/api';

// --- TARJETAS ---
export const getCards = async () => {
  const res = await fetch(`${API_URL}/cards`);
  return await res.json();
};

export const createCard = async (cardData) => {
  const res = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return await res.json();
};

export const updateCard = async (id, cardData) => {
  const res = await fetch(`${API_URL}/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return await res.json();
};

export const deleteCard = async (id) => {
  await fetch(`${API_URL}/cards/${id}`, { method: 'DELETE' });
};

// --- PERIODOS (PRESUPUESTOS) ---
export const getPeriods = async () => {
  const res = await fetch(`${API_URL}/periods`);
  return await res.json();
};

export const createPeriod = async (periodData) => {
  const res = await fetch(`${API_URL}/periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(periodData),
  });
  return await res.json();
};

export const updatePeriod = async (id, periodData) => {
  const res = await fetch(`${API_URL}/periods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(periodData),
  });
  return await res.json();
};

export const deletePeriod = async (id) => {
  await fetch(`${API_URL}/periods/${id}`, { method: 'DELETE' });
};

// --- WIDGETS ---
export const getWidgets = async () => {
  const res = await fetch(`${API_URL}/widgets`);
  return await res.json();
};

export const saveWidgets = async (widgetsList) => {
  const res = await fetch(`${API_URL}/widgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(widgetsList),
  });
  return await res.json();
};

// --- AUTENTICACIÓN (LOGIN / REGISTRO) ---
export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  // Si el servidor responde con error (ej. correo duplicado), lanzamos la excepción
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
  // Si la contraseña está mal, lanzamos la excepción para que el Frontend la muestre en rojo
  if (!res.ok) throw new Error(data.message || 'Error en el inicio de sesión');
  return data;
};