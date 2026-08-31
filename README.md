# 🎓 Marketplace Universitario UAEMex

Plataforma web segura y centralizada para la compra, venta, intercambio de materiales académicos y gestión de objetos perdidos para la comunidad universitaria de la **Universidad Autónoma del Estado de México (UAEMex)**.

---

## 📌 Visión del Proyecto
Facilitar el comercio seguro y la colaboración entre estudiantes, profesores y personal administrativo de la UAEMex mediante un entorno digital validado exclusivamente con correos institucionales (`@alumno.uaemex.mx` y `@profesor.uaemex.mx`), segmentado por campus/facultades.

---

## 🚀 Arquitectura Técnica Propuesta

| Capa | Tecnología / Herramienta | Propósito / Justificación |
| :--- | :--- | :--- |
| **Frontend** | React (Vite / Next.js) + Tailwind CSS + Lucide Icons | Interfaz moderna, reactiva, mobile-first y rápida. |
| **Backend** | Node.js (Express) o Python (FastAPI) | API REST escalable, ligera y con soporte nativo de tipos. |
| **Base de Datos** | PostgreSQL (Alojado en Supabase) | BD relacional robusta con soporte ACID, extensiones e índices. |
| **Autenticación** | JWT + Verificación OTP/Magic Link vía email institucional | Garantiza acceso exclusivo a la comunidad UAEMex. |
| **Almacenamiento** | Cloudinary / Supabase Storage | Optimización y entrega rápida de imágenes de productos. |
| **Despliegue** | Vercel (Frontend) + Render/Railway (Backend) + Supabase (BD) | Infraestructura 100% gratuita para desarrollo y demo académica. |

---

## 📂 Estructura del Proyecto

```text
marketplace-uaemex/
├── docs/                      # Documentación de ingeniería de software
│   ├── SRS_IEEE830.md         # Especificación de Requisitos de Software (IEEE 830)
│   ├── USER_STORIES.md        # Historias de Usuario con criterios BDD (Gherkin)
│   ├── DATABASE_SCHEMA.sql    # Scripts DDL para PostgreSQL / Supabase
│   ├── API_SPECIFICATION.md   # Especificación de Endpoints REST
│   └── UML_DIAGRAMS.md        # Diagramas Mermaid (Casos de uso, Clases, Secuencia)
├── backend/                   # Servidor API REST
└── frontend/                  # Aplicación Web SPA / SSR
```

---

## 🗺️ Fases del Proyecto

- [x] **Fase 1: Análisis de Requerimientos y Definición** (SRS IEEE 830, Historias de Usuario)
- [ ] **Fase 2: Arquitectura y Modelado Técnico** (Base de datos PostgreSQL, Diagramas UML, API REST)
- [ ] **Fase 3: Prototipado y Diseño UI/UX** (Flujos de navegación y diseño visual)
- [ ] **Fase 4: Desarrollo Full-Stack** (Backend API + Frontend React)
- [ ] **Fase 5: Pruebas, Despliegue y Demo** (Testing, despliegue en la nube y presentación)
