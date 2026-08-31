# 📐 DIAGRAMAS UML Y ARQUITECTURA TÉCNICA
### Proyecto: Marketplace Universitario UAEMex

---

## 1. 👥 DIAGRAMA DE CASOS DE USO GENERAL

```mermaid
graph TD
    %% Actores
    User([Estudiante / Docente UAEMex])
    Moderator([Administrador / Moderador])
    AuthService((Servicio de Correo OTP))
    StorageService((Cloudinary / Storage))

    %% Casos de Uso Usuario
    subgraph Marketplace Universitario UAEMex
        UC1[Registrarse con correo institucional]
        UC2[Iniciar Sesión JWT]
        UC3[Explorar Catálogo y Filtrar por Facultad]
        UC4[Publicar Artículo para Venta/Donación]
        UC5[Reportar / Consultar Objeto Perdido]
        UC6[Chatear con Vendedor por Producto]
        UC7[Calificar Vendedor / Dejar Reseña]
        UC8[Reportar Publicación Inapropiada]
        
        %% Casos de Uso Moderador
        UC9[Revisar y Atender Reportes]
        UC10[Suspender / Banear Usuario]
        UC11[Eliminar Publicación Fraudulenta]
    end

    %% Relaciones
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8

    UC1 -.->|Envía código de verificación| AuthService
    UC4 -.->|Sube y optimiza fotos| StorageService

    Moderator --> UC9
    Moderator --> UC10
    Moderator --> UC11
```

---

## 2. 🗄️ DIAGRAMA ENTIDAD-RELACIÓN (MERMAID ERD)

```mermaid
erDiagram
    FACULTIES ||--o{ USERS : "pertenece_a"
    FACULTIES ||--o{ PRODUCTS : "entrega_en"
    FACULTIES ||--o{ LOST_ITEMS : "ubicado_en"
    
    USERS ||--o{ PRODUCTS : "publica"
    USERS ||--o{ LOST_ITEMS : "reporta"
    USERS ||--o{ CONVERSATIONS : "participa_como_comprador"
    USERS ||--o{ CONVERSATIONS : "participa_como_vendedor"
    USERS ||--o{ MESSAGES : "envia"
    USERS ||--o{ REVIEWS : "escribe_resena"
    USERS ||--o{ REVIEWS : "recibe_calificacion"
    USERS ||--o{ USER_FAVORITES : "guarda"
    USERS ||--o{ REPORTS : "denuncia"
    
    CATEGORIES ||--o{ PRODUCTS : "clasifica"
    
    PRODUCTS ||--o{ CONVERSATIONS : "genera_chat"
    PRODUCTS ||--o{ REVIEWS : "asociado_a"
    PRODUCTS ||--o{ USER_FAVORITES : "marcado_por"
    PRODUCTS ||--o{ REPORTS : "es_reportado"

    FACULTIES {
        uuid id PK
        string name
        string campus_zone
    }

    USERS {
        uuid id PK
        string email UK
        string full_name
        string password_hash
        enum role
        uuid faculty_id FK
        string career
        boolean is_verified
        numeric average_rating
        integer total_reviews
    }

    CATEGORIES {
        uuid id PK
        string name UK
        string slug UK
        string icon_name
    }

    PRODUCTS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        uuid faculty_id FK
        string title
        text description
        numeric price
        enum condition
        enum status
        string_array images
        boolean is_exchangeable
    }

    LOST_ITEMS {
        uuid id PK
        uuid user_id FK
        uuid faculty_id FK
        string title
        text description
        string location_details
        date event_date
        enum type
        enum status
        string_array images
    }

    CONVERSATIONS {
        uuid id PK
        uuid product_id FK
        uuid buyer_id FK
        uuid seller_id FK
        timestamp updated_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        boolean is_read
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid product_id FK
        uuid reviewer_id FK
        uuid target_user_id FK
        integer rating
        text comment
    }
```

---

## 3. 🔐 DIAGRAMA DE SECUENCIA: REGISTRO Y VALIDACIÓN OTP

```mermaid
sequenceDiagram
    autonumber
    actor Estudiante as Estudiante UAEMex
    participant UI as Frontend (React App)
    participant API as Backend (API REST)
    participant DB as PostgreSQL (Supabase)
    participant Mailer as Servicio de Correo (Resend)

    Estudiante->>UI: Ingresa nombre, email @alumno.uaemex.mx y password
    UI->>API: POST /api/auth/register (datos de usuario)
    
    API->>API: Valida formato y regex de dominio UAEMex
    API->>DB: Verifica si el correo ya existe
    DB-->>API: Correo disponible
    
    API->>API: Hashea contraseña con bcrypt (cost 10)
    API->>API: Genera token OTP (6 dígitos numéricos, expira en 15 min)
    API->>DB: INSERT INTO users (is_verified = FALSE, verification_token = OTP)
    
    API->>Mailer: Enviar correo institucional con código OTP
    Mailer-->>Estudiante: ✉️ Notificación con código OTP: "123456"
    API-->>UI: 201 Created (Requiere verificación OTP)
    UI-->>Estudiante: Muestra pantalla de verificación de código

    Estudiante->>UI: Ingresa código "123456"
    UI->>API: POST /api/auth/verify-otp (email, otp)
    API->>DB: SELECT token WHERE email = email AND token_expires_at > NOW()
    DB-->>API: Coincidencia exitosa
    
    API->>DB: UPDATE users SET is_verified = TRUE, verification_token = NULL
    API->>API: Genera JWT (userId, role, facultyId)
    API-->>UI: 200 OK + JWT Token + Perfil de Usuario
    UI-->>Estudiante: Redirección al Catálogo Principal (Sesión Iniciada)
```

---

## 4. 📦 DIAGRAMA DE SECUENCIA: PUBLICACIÓN DE PRODUCTO CON FOTOS

```mermaid
sequenceDiagram
    autonumber
    actor Vendedor as Vendedor Universitario
    participant UI as Frontend (React App)
    participant API as Backend (Node.js API)
    participant Cloudinary as Cloudinary API
    participant DB as PostgreSQL (Supabase)

    Vendedor->>UI: Llena formulario (título, precio, facultad) y selecciona 2 fotos
    Vendedor->>UI: Presiona "Publicar Artículo"
    
    UI->>Cloudinary: Sube imágenes directamente con preset seguro
    Cloudinary-->>UI: Retorna URLs optimizadas (https://res.cloudinary.com/.../img.webp)
    
    UI->>API: POST /api/products con Header "Authorization: Bearer JWT" + Body JSON (con array de URLs)
    
    API->>API: Valida JWT y permisos de usuario activo
    API->>API: Valida campos requeridos (título > 3 letras, precio >= 0)
    API->>DB: INSERT INTO products (user_id, title, price, images, status='available')
    DB-->>API: Retorna registro de producto creado con UUID
    
    API-->>UI: 201 Created (Detalles del producto)
    UI-->>Vendedor: Muestra alerta de éxito y redirige a la vista del producto publicado
```

---

## 5. 💬 DIAGRAMA DE SECUENCIA: MENSAJERÍA / CHAT INTERNO

```mermaid
sequenceDiagram
    autonumber
    actor Comprador as Comprador
    actor Vendedor as Vendedor
    participant UI_C as Frontend Comprador
    participant UI_V as Frontend Vendedor
    participant API as Servidor API / Socket
    participant DB as PostgreSQL (Supabase)

    Comprador->>UI_C: Clic en "Contactar Vendedor" en el producto
    UI_C->>API: POST /api/conversations (product_id, seller_id)
    API->>DB: Busca si ya existe conversación o crea una nueva
    DB-->>API: Retorna conversation_id
    API-->>UI_C: 200 OK (Detalles del chat)

    Comprador->>UI_C: Escribe "¿Sigue disponible el libro? Estoy en Fac. de Ingeniería"
    UI_C->>API: POST /api/conversations/:id/messages (content)
    API->>DB: INSERT INTO messages (conversation_id, sender_id, content)
    DB-->>API: Mensaje guardado con timestamp
    API-->>UI_C: 201 Created (Mensaje emitido con check)
    
    API->>UI_V: Notificación en tiempo real / Actualización de bandeja
    UI_V-->>Vendedor: Visualiza globo de notificación y lee mensaje entrante
```
