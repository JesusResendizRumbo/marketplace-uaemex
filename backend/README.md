# 🛠️ Backend - Marketplace Universitario UAEMex

API REST construida con **Node.js (Express)**, autenticación institucional mediante **JWT + OTP por correo institucional (@alumno.uaemex.mx)** y persistencia de datos en **PostgreSQL / Supabase**.

---

## 📋 Requisitos Previos
- **Node.js**: v18 LTS o superior (v24 LTS instalado).
- **PostgreSQL**: Instancia local o base de datos en la nube gratuita en [Supabase](https://supabase.com/).

---

## ⚙️ Configuración del Entorno

1. Copia el archivo de variables de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Configura las variables esenciales en tu `.env`:
   - `DATABASE_URL`: URL de conexión a tu base de datos Supabase o PostgreSQL local.
   - `JWT_SECRET`: Llave secreta para firmar los tokens de sesión.
   - `PORT`: Puerto donde correrá la API (por defecto `5000`).
   - `EMAIL_USER` y `EMAIL_PASS` (Opcional): Si no se configuran, el sistema opera en **Modo Simulación**, imprimiendo el código OTP de 6 dígitos directamente en la terminal.

---

## 🚀 Ejecución del Servidor

- **Instalar dependencias:**
  ```bash
  npm install
  ```

- **Iniciar en modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```

- **Iniciar en modo producción:**
  ```bash
  npm start
  ```

---

## 📡 Endpoints Principales

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verificación de estado del servidor | Público |
| `POST` | `/api/auth/register` | Registro de usuario (valida dominio `@alumno.uaemex.mx`) | Público |
| `POST` | `/api/auth/verify-otp` | Valida código de 6 dígitos y entrega JWT | Público |
| `POST` | `/api/auth/login` | Inicio de sesión con credenciales | Público |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | Privado (JWT) |
| `GET` | `/api/products` | Catálogo con filtros por facultad, precio, búsqueda y categoría | Público |
| `POST` | `/api/products` | Publicar nuevo producto | Privado (JWT) |
| `PATCH` | `/api/products/:id/status` | Cambiar estado (`available`, `reserved`, `sold`) | Privado (Dueño) |
| `GET` | `/api/lost-items` | Lista reportes de objetos perdidos y encontrados | Público |
| `POST` | `/api/lost-items` | Publicar reporte de objeto perdido / encontrado | Privado (JWT) |
| `GET` | `/api/conversations` | Bandeja de chats del usuario | Privado (JWT) |
| `POST` | `/api/conversations/:id/messages` | Enviar mensaje en un chat de producto | Privado (JWT) |
| `GET` | `/api/faculties` | Lista todos los planteles y facultades UAEMex | Público |
| `GET` | `/api/categories` | Lista todas las categorías de productos | Público |
| `POST` | `/api/reviews` | Calificar a un vendedor tras una transacción | Privado (JWT) |
