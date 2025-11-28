import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Conexión a Base de Datos
// He puesto tu contraseña "dhvoxqTs9co3xXOn" directamente en el link para evitar errores
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://dennisestudio43_db_user:dhvoxqTs9co3xXOn@cuentas.3fkat1g.mongodb.net/miwallet?retryWrites=true&w=majority&appName=cuentas");
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
    console.log(`📡 Servidor escuchando en http://localhost:${PORT}`);
});