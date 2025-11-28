import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();
// Render/servidores en la nube definen su propio puerto
const PORT = process.env.PORT || 3000; 
const MONGO_URI = process.env.MONGO_URI; 
// URL DE TU FRONTEND EN NETLIFY (Para la solución de CORS)
const allowedOrigin = 'https://peaceful-melba-99d709.netlify.app';

// Middlewares
app.use(express.json());

// CONFIGURACIÓN DE CORS FINAL
app.use(cors({
    origin: allowedOrigin, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
}));

// Rutas
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Conexión a Base de Datos
const connectDB = async () => {
    try {
        // Usamos el link hardcodeado para la conexión (o MONGO_URI si está en .env)
        await mongoose.connect("mongodb+srv://dennisestudio43_db_user:dhvoxqTs9co3xXOn@cuentas.3fkat1g.mongodb.net/miwallet?appName=cuentas");
        console.log("✅ Conectado exitosamente a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error de conexión a MongoDB:", error.message);
        process.exit(1);
    }
};

// Ruta de prueba
app.get('/', (req, res) => {
    // Esta ruta se ejecuta cuando Render comprueba que el servicio está vivo
    res.send('API de Mi Wallet funcionando 🚀');
});

// Iniciar
app.listen(PORT, () => {
    connectDB();
    console.log(`📡 Servidor escuchando en puerto ${PORT}`);
});