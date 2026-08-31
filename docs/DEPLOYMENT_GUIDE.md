# ☁️ GUÍA PASO A PASO: DESPLIEGUE EN LA NUBE GRATUITO (24/7)
### Proyecto: Marketplace Universitario CU UAEM Ecatepec
**Objetivo:** Publicar la plataforma en Internet con base de datos real, backend en la nube y frontend en Vercel sin costo alguno.

---

## 🗺️ Mapa del Despliegue

```text
[ Supabase ]           ➔          [ Render ]           ➔          [ Vercel ]
(Base de Datos PostgreSQL)     (Servidor Backend Express)      (Frontend Web React)
   Gratis y en la nube          URL: api-uaemex.onrender.com   URL: marketplace-ecatepec.vercel.app
```

---

## 🟢 PASO 1: Crear la Base de Datos PostgreSQL en Supabase (2 minutos)

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita (puedes iniciar sesión con tu cuenta de GitHub o Google).
2. Haz clic en **"New Project"** (Nuevo Proyecto).
3. Completa los datos:
   - **Name:** `marketplace-uaemex`
   - **Database Password:** Escribe una contraseña segura (guárdala, la necesitarás).
   - **Region:** Selecciona `US East (North Virginia)` o la más cercana a México.
4. Una vez creado el proyecto, ve al menú izquierdo y selecciona **SQL Editor** (icono de terminal `>_`).
5. Abre y copia todo el contenido del archivo:
   👉 **[DATABASE_SCHEMA.sql](file:///C:/Users/jesus/.gemini/antigravity/scratch/marketplace-uaemex/docs/DATABASE_SCHEMA.sql)**
6. Pégalo en el editor SQL de Supabase y haz clic en el botón verde **"Run"** (Ejecutar).
   - *¡Listo! Se crearán todas las tablas con restricciones de correo `@alumno.uaemex.mx`, pagos con tarjeta en custodia y datos iniciales de CU Ecatepec.*
7. Ve a **Project Settings** (icono de engrane) ➔ **Database** ➔ Sección **Connection string** ➔ selecciona la pestaña **URI** y copia tu enlace de conexión (ejemplo):
   ```text
   postgresql://postgres.xxxx:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

---

## 🟢 PASO 2: Subir tu Código a GitHub (2 minutos)

1. Ve a [https://github.com](https://github.com) e inicia sesión.
2. Haz clic en el botón verde **"New"** para crear un nuevo repositorio.
3. Nómbralo: `marketplace-uaemex` y selecciónalo como **Público** (o Privado).
4. Haz clic en **"Create repository"**.
5. Sube tu carpeta de proyecto:
   - Puedes arrastrar la carpeta `marketplace-uaemex` directamente desde el navegador en la opción *"uploading an existing file"*.
   - O si usas Git desde terminal:
     ```bash
     git init
     git add .
     git commit -m "feat: Marketplace CU UAEM Ecatepec con pago con tarjeta"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/marketplace-uaemex.git
     git push -u origin main
     ```

---

## 🟢 PASO 3: Desplegar el Backend en Render (3 minutos)

1. Entra a [https://render.com](https://render.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"New +"** ➔ **"Web Service"**.
3. Selecciona tu repositorio `marketplace-uaemex`.
4. Configura los campos del servicio:
   - **Name:** `api-marketplace-uaemex`
   - **Region:** `Ohio (US East)`
   - **Root Directory:** `backend` *(muy importante indicar la carpeta backend)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Baja a la sección **"Environment Variables"** y añade:
   - `DATABASE_URL` = *(Pega aquí la URI de conexión de Supabase que copiaste en el Paso 1)*
   - `JWT_SECRET` = `uaemex_super_secret_production_key_2026`
   - `NODE_ENV` = `production`
   - `PORT` = `5001`
6. Haz clic en **"Create Web Service"**.
7. En un par de minutos, Render te dará tu enlace público, por ejemplo:
   👉 `https://api-marketplace-uaemex.onrender.com`

---

## 🟢 PASO 4: Desplegar el Frontend en Vercel (2 minutos)

1. Entra a [https://vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New..."** ➔ **"Project"**.
3. Selecciona tu repositorio `marketplace-uaemex`.
4. Configura el proyecto:
   - **Project Name:** `marketplace-cu-ecatepec`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Haz clic en *Edit* y selecciona la carpeta `frontend`.
5. Haz clic en el botón azul **"Deploy"**.
6. ¡En menos de 45 segundos tendrás tu aplicación web en línea 24/7 con un enlace público como:
   👉 **`https://marketplace-cu-ecatepec.vercel.app`**

---

### 🎉 Resultado Final
- Podrás compartir el enlace de Vercel con cualquier persona, profesor o evaluador.
- Cualquier estudiante de la UAEMex podrá registrarse con su correo institucional `@alumno.uaemex.mx`.
- Podrán publicar productos, pagarlos con tarjeta en línea con protección *Escrow* y calificar a los vendedores desde cualquier dispositivo en todo el mundo.
