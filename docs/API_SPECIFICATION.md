# 🌐 ESPECIFICACIÓN DE LA API REST
### Proyecto: Marketplace Universitario UAEMex
**Formato:** OpenAPI / RESTful JSON Standard  
**Base URL:** `http://localhost:5000/api` (Desarrollo) / `https://api-marketplace-uaemex.onrender.com/api` (Producción)

---

## 🔒 Autenticación y Seguridad
Todas las rutas protegidas requieren el encabezado estándar HTTP:
```http
Authorization: Bearer <TOKEN_JWT_AQUI>
```

---

## 1. 🔑 MÓDULO DE AUTENTICACIÓN (`/auth`)

### 1.1 Registro de Usuario
- **Ruta:** `POST /auth/register`
- **Acceso:** Público
- **Cuerpo de la Petición (JSON):**
```json
{
  "email": "estudiante@alumno.uaemex.mx",
  "password": "Password123!",
  "fullName": "Carlos Alberto López",
  "facultyId": "a1b2c3d4-0000-0000-0000-000000000001",
  "career": "Ingeniería en Computación",
  "phoneNumber": "7221234567"
}
```
- **Respuestas:**
  - `201 Created`:
  ```json
  {
    "success": true,
    "message": "Registro exitoso. Se ha enviado un código de verificación a tu correo institucional.",
    "email": "estudiante@alumno.uaemex.mx"
  }
  ```
  - `400 Bad Request` (Dominio no institucional o correo duplicado):
  ```json
  {
    "success": false,
    "error": "El correo debe pertenecer a un dominio válido de la UAEMex (@alumno.uaemex.mx o @profesor.uaemex.mx)"
  }
  ```

---

### 1.2 Verificación de Código OTP
- **Ruta:** `POST /auth/verify-otp`
- **Acceso:** Público
- **Cuerpo (JSON):**
```json
{
  "email": "estudiante@alumno.uaemex.mx",
  "otp": "481920"
}
```
- **Respuesta `200 OK`:**
```json
{
  "success": true,
  "message": "Cuenta verificada con éxito",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u9876543-...",
    "email": "estudiante@alumno.uaemex.mx",
    "fullName": "Carlos Alberto López",
    "role": "student",
    "faculty": "Facultad de Ingeniería"
  }
}
```

---

### 1.3 Inicio de Sesión (Login)
- **Ruta:** `POST /auth/login`
- **Acceso:** Público
- **Cuerpo (JSON):**
```json
{
  "email": "estudiante@alumno.uaemex.mx",
  "password": "Password123!"
}
```
- **Respuesta `200 OK`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u9876543-...",
    "email": "estudiante@alumno.uaemex.mx",
    "fullName": "Carlos Alberto López",
    "role": "student",
    "averageRating": 4.85
  }
}
```

---

## 2. 📚 MÓDULO DE PRODUCTOS (`/products`)

### 2.1 Listar y Filtrar Catálogo
- **Ruta:** `GET /products`
- **Acceso:** Público
- **Parámetros Query:**
  - `search` (string): Búsqueda por texto en título y descripción.
  - `category` (string / UUID): Filtrar por ID o slug de categoría.
  - `facultyId` (UUID): Filtrar por facultad de entrega.
  - `minPrice` (number): Precio mínimo.
  - `maxPrice` (number): Precio máximo.
  - `condition` (string): `new`, `like_new`, `good`, `acceptable`.
  - `page` (number, default: 1): Paginación.
  - `limit` (number, default: 12): Resultados por página.
- **Respuesta `200 OK`:**
```json
{
  "success": true,
  "total": 45,
  "page": 1,
  "totalPages": 4,
  "data": [
    {
      "id": "p1111111-...",
      "title": "Cálculo Trascendentes Tempranas - James Stewart",
      "description": "Libro en excelente estado, sin rayaduras ni subrayados.",
      "price": 350.00,
      "condition": "like_new",
      "status": "available",
      "images": ["https://res.cloudinary.com/uaemex/image/upload/v1/librostewart.webp"],
      "faculty": {
        "id": "a1b2c3d4-...",
        "name": "Facultad de Ingeniería",
        "campusZone": "Ciudad Universitaria (CU)"
      },
      "category": {
        "id": "c1111111-...",
        "name": "Libros y Apuntes"
      },
      "seller": {
        "id": "u9876543-...",
        "fullName": "Carlos Alberto López",
        "averageRating": 4.85
      },
      "createdAt": "2026-08-30T15:20:00Z"
    }
  ]
}
```

---

### 2.2 Publicar Nuevo Artículo
- **Ruta:** `POST /products`
- **Acceso:** Privado (Requiere JWT)
- **Cuerpo (JSON):**
```json
{
  "title": "Bata de Laboratorio de Algodón Talla M",
  "description": "Bata blanca reglamentaria para laboratorio de química y biología. Usada un semestre.",
  "price": 180.00,
  "categoryId": "c2222222-...",
  "facultyId": "a2b2c3d4-...",
  "condition": "good",
  "isExchangeable": true,
  "images": [
    "https://res.cloudinary.com/uaemex/image/upload/v1/bata1.webp",
    "https://res.cloudinary.com/uaemex/image/upload/v1/bata2.webp"
  ]
}
```
- **Respuesta `201 Created`:**
```json
{
  "success": true,
  "message": "Producto publicado con éxito",
  "productId": "p2222222-..."
}
```

---

### 2.3 Actualizar Estatus de Producto (Marcar Vendido / Apartado)
- **Ruta:** `PATCH /products/:id/status`
- **Acceso:** Privado (Solo el propietario)
- **Cuerpo (JSON):**
```json
{
  "status": "sold"
}
```

---

## 3. 🔍 MÓDULO DE OBJETOS PERDIDOS (`/lost-items`)

### 3.1 Listar Objetos Extraviados y Encontrados
- **Ruta:** `GET /lost-items`
- **Acceso:** Público
- **Parámetros Query:** `type` (`lost` o `found`), `facultyId`, `status` (`open` o `resolved`).
- **Respuesta `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "l1111111-...",
      "title": "Credencial Universitaria y Llaves",
      "description": "Encontradas sobre las bancas del edificio B cerca de la cafetería.",
      "locationDetails": "Edificio B, junto a cafetería central",
      "eventDate": "2026-08-29",
      "type": "found",
      "status": "open",
      "images": ["https://res.cloudinary.com/uaemex/image/upload/v1/credencial.webp"],
      "facultyName": "Facultad de Contaduría y Administración"
    }
  ]
}
```

---

## 4. 💬 MÓDULO DE CHAT Y CONVERSACIONES (`/conversations`)

### 4.1 Iniciar o Recuperar Conversación por Producto
- **Ruta:** `POST /conversations`
- **Acceso:** Privado (Requiere JWT)
- **Cuerpo (JSON):**
```json
{
  "productId": "p1111111-...",
  "sellerId": "u9876543-..."
}
```
- **Respuesta `200 OK`:**
```json
{
  "success": true,
  "conversationId": "conv-9999-...",
  "messages": []
}
```

### 4.2 Enviar Mensaje
- **Ruta:** `POST /conversations/:id/messages`
- **Acceso:** Privado (Requiere JWT)
- **Cuerpo (JSON):**
```json
{
  "content": "¿Hola! ¿Aún tienes la bata disponible? Podríamos vernos mañana a las 11 am en CU."
}
```

---

## 5. ⭐ MÓDULO DE CALIFICACIONES Y RESEÑAS (`/reviews`)

### 5.1 Enviar Reseña a un Vendedor
- **Ruta:** `POST /reviews`
- **Acceso:** Privado (Requiere JWT)
- **Cuerpo (JSON):**
```json
{
  "productId": "p1111111-...",
  "targetUserId": "u9876543-...",
  "rating": 5,
  "comment": "Trato muy amable, puntual en el punto de entrega y el libro venía tal cual la foto."
}
```
