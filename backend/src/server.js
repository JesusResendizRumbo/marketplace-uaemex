import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import lostItemRoutes from './routes/lostItemRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Middlewares
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuración de CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como Postman o apps móviles)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo permitimos todos
      }
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de verificación de salud (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'Marketplace Universitario UAEMex API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Manejo de errores
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Iniciar servidor permitiendo conexiones en red local (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 SERVIDOR BACKEND UAEMex EN LÍNEA`);
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`🔗 API Local:   http://localhost:${PORT}/api`);
  console.log(`📡 API en Red:  http://0.0.0.0:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

export default app;
