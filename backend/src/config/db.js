import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Configuración del Pool de conexiones PostgreSQL
const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('✅ Conexión establecida con la Base de Datos PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
