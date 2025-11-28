import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

const app = express();
// 1. Render/servidores en la nube definen su propio puerto
const PORT = process.env.PORT || 3000; 
// 2. Usamos la variable de entorno MONGO_URI
const MONGO_URI = process.env.MONGO_URI; 

// --- CONFIGURACIÓN DE CORS (SOLUCIÓN) ---
const allowedOrigin = 'https://peaceful-melba-99d709.netlify.app';

// Middlewares
app.use(cors({
    // Permite peticiones SOLO desde tu dominio de Netlify
    origin: allowedOrigin, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
}));
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Conexión a Base de Datos
const connectDB = async () => {
    try {
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