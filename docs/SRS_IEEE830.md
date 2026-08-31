# 📄 ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (SRS)
### Proyecto: Marketplace Universitario UAEMex
**Estándar:** IEEE Std 830-1998  
**Versión:** 1.0.0  
**Fecha:** Agosto 2026  
**Estado:** Aprobado para Fase 2  

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
El propósito de este documento es definir de manera formal y detallada los requisitos funcionales y no funcionales para el desarrollo del **Marketplace Universitario UAEMex**. Este documento servirá como contrato técnico y guía principal para el equipo de desarrollo, diseñadores UI/UX, evaluadores de calidad (QA) y asesores académicos de la Universidad Autónoma del Estado de México.

### 1.2 Alcance del Producto
El sistema será una plataforma web progresiva (PWA / Web App) orientada exclusivamente a la comunidad universitaria del **Centro Universitario UAEM Ecatepec** (estudiantes, egresados, docentes y personal administrativo). 
El software permitirá:
- La compra, venta e intercambio seguro de libros, material académico, calculadoras, instrumental de psicología, derecho e ingeniería y uniformes.
- **Pasarela de Pago Web con Tarjeta (Débito y Crédito):** Sistema de custodia segura de fondos (*Escrow*) donde el pago queda retenido hasta que el comprador recibe el producto en CU Ecatepec y valida su **Código de Entrega de 4 dígitos**.
- Un módulo especializado de **Objetos Perdidos y Encontrados** dentro del plantel CU Ecatepec.
- La verificación obligatoria de identidad mediante correo institucional (`@alumno.uaemex.mx` y `@profesor.uaemex.mx`).
- Puntos de entrega seguros georreferenciados dentro de las instalaciones de CU Ecatepec (Explanada, Biblioteca, Cafetería, Edificios A y B).

### 1.3 Personal Involucrado y Audiencia
- **Desarrolladores:** Para la implementación de la arquitectura de base de datos, APIs REST y vistas cliente.
- **Comunidad Estudiantil y Docente UAEMex:** Usuarios finales de la plataforma.
- **Moderadores / Administradores:** Responsables de mantener la integridad y convivencia sana en la plataforma.
- **Comité Académico / Evaluadores:** Para revisión de conformidad con estándares de ingeniería de software.

### 1.4 Definiciones, Acrónimos y Abreviaturas
- **UAEMex:** Universidad Autónoma del Estado de México.
- **SRS:** Software Requirements Specification (Especificación de Requisitos de Software).
- **JWT:** JSON Web Token (Estándar de transmisión de credenciales seguras).
- **OTP:** One-Time Password (Código numérico de un solo uso para validación por email).
- **CRUD:** Create, Read, Update, Delete (Operaciones básicas de persistencia de datos).
- **REST:** Representational State Transfer.
- **SPA:** Single Page Application.
- **CORS:** Cross-Origin Resource Sharing.

### 1.5 Referencias
- *IEEE Std 830-1998*: Recommended Practice for Software Requirements Specifications.
- *OWASP Top 10*: Estándares de seguridad en aplicaciones web.
- *Reglamento de Convivencia y Uso de Tecnologías de la Información de la UAEMex*.

---

## 2. DESCRIPCIÓN GENERAL

### 2.1 Perspectiva del Producto
El sistema operará como una aplicación web autónoma basada en una arquitectura cliente-servidor desacoplada:
1. **Frontend:** Aplicación de una sola página (SPA) desarrollada en React/Tailwind CSS con enfoque *mobile-first*.
2. **Backend:** Servicio API REST en Node.js/Express (o Python/FastAPI) encargado de la lógica de negocio, validaciones y autenticación.
3. **Base de Datos:** PostgreSQL relacional administrado en Supabase con persistencia transaccional y reglas de integridad referencial.
4. **Servicios Externos:** 
   - Servicio de correo SMTP/API (Resend / SendGrid / NodeMailer) para envío de códigos OTP y notificaciones.
   - Servicio de almacenamiento multimedia en la nube (Cloudinary / Supabase Storage) para imágenes de artículos.

### 2.2 Funciones del Producto (Resumen)
- **Control de Acceso Institucional:** Registro restringido a dominios oficiales de la UAEMex con código de confirmación.
- **Catálogo y Publicaciones:** Creación de publicaciones con fotografías, estado físico del producto, precio, facultad/campus de entrega y etiquetas.
- **Buscador Inteligente y Filtros:** Búsqueda por palabra clave, filtrado por facultad/campus (ej. CU, Fac. de Ingeniería, Fac. de Medicina, UAP Valle de México, etc.), rango de precio y condición.
- **Gestión de Objetos Perdidos:** Publicación especial de reportes con fotos, fecha y lugar de extravío/hallazgo dentro de las instalaciones.
- **Mensajería Interna / Contacto Seguro:** Canal de chat en la plataforma y botón directo de contacto con resguardo de datos sensibles.
- **Sistema de Calificaciones:** Valoración mutua tras concretar una transacción (1 a 5 estrellas + reseña).
- **Moderación:** Reporte de publicaciones fraudulentas o prohibidas y panel de administración para sancionar infractores.

### 2.3 Clases y Características de Usuarios

| Rol | Descripción | Nivel de Acceso |
| :--- | :--- | :--- |
| **Visitante No Registrado** | Usuario sin sesión iniciada. Puede consultar el catálogo público pero no ver datos de contacto ni publicar. | Lectura básica limitada. |
| **Usuario Universitario (Estudiante/Docente)** | Usuario activo con correo institucional verificado. Puede publicar, comprar, chatear, reportar objetos y calificar. | Acceso general completo a funciones de usuario. |
| **Administrador / Moderador** | Personal designado para supervisar publicaciones, resolver reportes de fraude y gestionar usuarios bloqueados. | Acceso completo a panel de control y moderación. |

### 2.4 Entorno Operativo
- **Navegadores Soportados:** Google Chrome (versión 90+), Mozilla Firefox (versión 90+), Safari (versión 14+), Microsoft Edge (versión 90+), navegadores móviles Android/iOS.
- **Entorno de Ejecución Backend:** Node.js v18 LTS o superior / Python 3.10+.
- **Servidor de Base de Datos:** PostgreSQL 15+.

### 2.5 Restricciones
- **Restricción de Dominio:** Solo se permitirá el registro a cuentas que finalicen con el dominio `@alumno.uaemex.mx`, `@profesor.uaemex.mx` o `@uaemex.mx`.
- **Restricción de Almacenamiento:** Máximo 4 imágenes por publicación (límite de 5 MB por imagen, optimizadas automáticamente en formato WebP).
- **Costo Cero de Infraestructura:** El despliegue inicial debe utilizar planes *Free Tier* (Vercel, Render, Supabase, Cloudinary) para fines de presentación y validación académica.
- **Artículos Prohibidos:** Se prohíbe estrictamente la venta de bebidas alcohólicas, sustancias ilegales, armas, exámenes resueltos o tareas con fines de plagio académico.

---

## 3. REQUISITOS ESPECÍFICOS

### 3.1 Requisitos Funcionales (RF)

#### Módulo de Autenticación y Cuentas
- **RF-01: Registro con Correo Institucional**
  - *Descripción:* El sistema permitirá el registro únicamente con correos institucionales de la UAEMex.
  - *Entradas:* Nombre completo, correo institucional, contraseña segura (mínimo 8 caracteres, al menos un número y mayúscula), Facultad/Campus y Carrera.
  - *Proceso:* El backend valida el regex del dominio, genera un hash seguro de la contraseña (bcrypt) y despacha un código OTP temporal de 6 dígitos con vigencia de 15 minutos al correo proporcionado.
  - *Salida:* Confirmación de cuenta activada tras ingresar el OTP correcto.
  - *Prioridad:* Alta (Crítica).

- **RF-02: Inicio de Sesión y Generación de Token**
  - *Descripción:* El usuario accederá mediante correo y contraseña.
  - *Proceso:* Verificación de credenciales y emisión de un JWT firmado con información del usuario (id, rol, facultad).
  - *Salida:* Token de sesión y redirección al panel principal.
  - *Prioridad:* Alta (Crítica).

- **RF-03: Recuperación de Contraseña**
  - *Descripción:* Solicitud de restablecimiento de contraseña vía código de un solo uso enviado al correo institucional.
  - *Prioridad:* Media.

- **RF-04: Perfil de Usuario y Reputación**
  - *Descripción:* Visualización de perfil con nombre, facultad, fecha de registro, promedio de estrellas recibidas, listado de publicaciones activas e historial de ventas completadas.
  - *Prioridad:* Alta.

#### Módulo de Publicaciones y Marketplace
- **RF-05: Creación de Publicación de Producto**
  - *Descripción:* Los usuarios autenticados podrán publicar artículos para venta o intercambio.
  - *Entradas:* Título, descripción, precio en MXN (o marcar como "$0 / Donación / Intercambio"), categoría (Libros, Electrónica, Uniformes/Batas, Material de Laboratorio, Otros), estado físico (Nuevo, Como nuevo, Usado - Buen estado, Usado - Detalles), facultad de entrega preferente y hasta 4 fotografías.
  - *Salida:* Publicación activa visible en el catálogo con estatus "Disponible".
  - *Prioridad:* Alta (Crítica).

- **RF-06: Edición y Cambio de Estado de Publicación**
  - *Descripción:* El propietario puede editar los detalles de su producto o cambiar su estatus a: "Disponible", "Apartado" o "Vendido".
  - *Prioridad:* Alta.

- **RF-07: Catálogo y Búsqueda con Filtros Avanzados**
  - *Descripción:* Búsqueda en tiempo real por texto predictivo y filtros combinados:
    - Por Campus / Facultad (ej. Toluca CU, Facultad de Contaduría, UAP Cuautitlán Izcalli, etc.).
    - Por Categoría.
    - Por Rango de Precio (Min - Max).
    - Por Estado del artículo (Nuevo/Usado).
    - Ordenamiento por fecha reciente o menor precio.
  - *Prioridad:* Alta (Crítica).

- **RF-08: Lista de Artículos Favoritos**
  - *Descripción:* Los usuarios pueden guardar publicaciones en su lista de favoritos para consulta rápida.
  - *Prioridad:* Baja.

#### Módulo de Objetos Perdidos y Encontrados ("Lost & Found")
- **RF-09: Publicación de Reporte de Objeto Extraviado / Encontrado**
  - *Descripción:* Formulario especializado donde los usuarios pueden reportar:
    - Objeto Encontrado: Ubicación del hallazgo (ej. "Edificio B salón 204"), fecha, descripción y foto.
    - Objeto Perdido: Descripción del artículo extraviado y recompensas/contacto de entrega.
  - *Salida:* Publicación con etiqueta destacada (badge verde "Encontrado" / badge rojo "Extraviado").
  - *Prioridad:* Alta.

- **RF-10: Reclamo y Resolución de Objeto Perdido**
  - *Descripción:* Marcado del reporte como "Entregado a su dueño" con opción de dejar constancia de agradecimiento.
  - *Prioridad:* Media.

#### Módulo de Comunicación y Calificaciones
- **RF-11: Chat Interno / Contacto Seguro**
  - *Descripción:* Canal de comunicación contextualizado por producto entre el comprador y vendedor para pactar punto de entrega dentro del campus universitario sin exponer números personales si el usuario así lo prefiere.
  - *Prioridad:* Alta.

- **RF-12: Sistema de Reseñas y Calificaciones**
  - *Descripción:* Una vez marcado un artículo como vendido, el comprador podrá emitir una calificación de 1 a 5 estrellas y un comentario sobre la puntualidad, veracidad del producto y trato.
  - *Prioridad:* Media.

#### Módulo de Moderación y Seguridad
- **RF-13: Reporte de Publicaciones y Usuarios**
  - *Descripción:* Cualquier usuario puede reportar una publicación indicando motivos (Artículo prohibido, Fraude, Precios falsos, Contenido inapropiado).
  - *Prioridad:* Alta.

- **RF-14: Panel de Moderación de Contenidos**
  - *Descripción:* Vistas exclusivas para administradores que permiten suspender publicaciones reportadas, advertir o banear temporal/permanentemente a usuarios reincidentes.
  - *Prioridad:* Alta.

- **RF-15: Historial y Métricas Básicas**
  - *Descripción:* Métricas de actividad para administradores (número de usuarios activos por facultad, volumen de publicaciones y transacciones exitosas).
  - *Prioridad:* Baja.

---

### 3.2 Requisitos No Funcionales (RNF)

#### RNF-01: Rendimiento
- El tiempo de respuesta del backend para consultas de catálogo no debe superar los **500 ms** bajo una carga típica de 100 usuarios concurrentes.
- El tiempo de carga de la página inicial (First Contentful Paint) no debe superar **1.8 segundos** en redes 4G móviles.

#### RNF-02: Seguridad
- **Almacenamiento de Contraseñas:** Las contraseñas deben cifrarse con algoritmo `bcrypt` o `Argon2` con un factor de trabajo de al menos 10 rondas.
- **Protección de Rutas:** Todas las rutas privadas requerirán un header `Authorization: Bearer <token>` válido.
- **Protección de Datos:** Sanitización estricta de entradas para prevenir inyecciones SQL (uso de consultas parametrizadas / ORM) y ataques XSS (escapado de HTML).
- **Control de Tasa (Rate Limiting):** Límite de 5 intentos fallidos de login por IP cada 15 minutos para mitigar ataques de fuerza bruta.

#### RNF-03: Usabilidad y Diseño
- Interfaz 100% responsiva adaptable a dispositivos móviles (360px de ancho) hasta monitores de escritorio (4K).
- Paleta visual armónica institucional inspirada en los colores representativos de la UAEMex (Verde y Oro universitario) combinados con una estética moderna en modo claro/oscuro.
- Cumplimiento de estándares de accesibilidad WCAG 2.1 nivel AA (contraste de texto y etiquetas legibles).

#### RNF-04: Disponibilidad y Fiabilidad
- Disponibilidad mínima calculada del **99.5%** durante el periodo escolar activo.
- Persistencia de datos transaccional con respaldos diarios automáticos mediante PostgreSQL.

#### RNF-05: Portabilidad y Mantenibilidad
- Código fuente estructurado bajo el principio de separación de responsabilidades (Arquitectura en capas: Controladores, Servicios, Repositorios/Modelos).
- Configuración parametrizada mediante variables de entorno (`.env`) sin credenciales quemadas en el código fuente.
