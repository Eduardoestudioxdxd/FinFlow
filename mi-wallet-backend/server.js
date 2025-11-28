const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Rutas y Modelos
const apiRoutes = require('./routes/api'); 
const authRoutes = require('./routes/auth');

// Cargar variables de entorno (para MONGO_URI y PORT)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 
const MONGO_URI = process.env.MONGO_URI; 

// URL DE TU FRONTEND EN NETLIFY (SOLUCIÓN FINAL DE CORS)
const allowedOrigin = 'https://peaceful-melba-99d709.netlify.app';

// Middlewares
app.use(express.json());

// CONFIGURACIÓN DE CORS FINAL Y DINÁMICA
app.use(cors({
    // Permite que la app local, el dominio principal de Netlify, y los subdominios aleatorios se conecten
    origin: (origin, callback) => {
        // Permitir peticiones sin origen (como Postman o servidores)
        if (!origin) return callback(null, true);
        
        // Verificar si el origen está en la lista de confianza (incluye Netlify dinámico)
        if (allowedOrigin.includes(origin) || origin.endsWith('.netlify.app') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
}));

// Rutas
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Conexión a Base de Datos
const connectDB = async () => {
    try {
        // Usamos la variable de entorno MONGO_URI (que ya está seteada en Render)
        await mongoose.connect(MONGO_URI); 
        console.log("✅ Conectado exitosamente a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error de conexión a MongoDB:", error.message);
        process.exit(1);
    }
};

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Mi Wallet funcionando 🚀');
});

// Iniciar
app.listen(PORT, () => {
    connectDB();
    console.log(`📡 Servidor escuchando en puerto ${PORT}`);
});