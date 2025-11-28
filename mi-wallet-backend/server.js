const express = require('express'); // Cambiado a require
const mongoose = require('mongoose'); // Cambiado a require
const cors = require('cors'); // Cambiado a require
const dotenv = require('dotenv'); // Cambiado a require

// Rutas y Modelos también deben usar require en sus archivos
const apiRoutes = require('./routes/api'); 
const authRoutes = require('./routes/auth');

// Cargar variables de entorno (para MONGO_URI y PORT)
dotenv.config();

const app = express();
// Render asigna el puerto (process.env.PORT)
const PORT = process.env.PORT || 3000; 
const MONGO_URI = process.env.MONGO_URI; // Variable de Render/local

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