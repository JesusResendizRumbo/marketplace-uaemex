# 🎓 ESTRUCTURA Y GUION DE PRESENTACIÓN: MARKETPLACE CU UAEM ECATEPEC
### Proyecto de Titulación / Asignatura: Plataforma Web Universitaria de Comercio Seguro
**Plantel:** Centro Universitario UAEM Ecatepec • **Ubicación:** Ecatepec de Morelos, Estado de México

---

## 📊 Diapositiva 1: Portada
- **Título:** Marketplace Universitario CU UAEM Ecatepec
- **Subtítulo:** Plataforma Web Segura para el Intercambio, Compraventa y Protección de Pagos Académicos
- **Presentador(es):** [Tu Nombre / Equipo]
- **Institución:** Universidad Autónoma del Estado de México (UAEMex)
- **Campus:** Centro Universitario UAEM Ecatepec
- **Lema Institucional:** *Patria, Ciencia y Trabajo*

> 🎙️ **Guion del Presentador (Qué decir):**  
> *"Buenos días/tardes a todos los presentes y miembros del presídium. Hoy tengo el honor de presentarles el 'Marketplace Universitario CU UAEM Ecatepec', una solución tecnológica de comercio seguro y economía circular diseñada exclusivamente para la comunidad estudiantil y académica de nuestro centro universitario."*

---

## 📊 Diapositiva 2: Planteamiento del Problema
- **Comercio informal y desorganizado:** La compraventa de material académico se realiza actualmente por grupos de Facebook o WhatsApp sin ninguna moderación.
- **Vulnerabilidad y estafas:** Riesgo de perfiles falsos, productos defectuosos o robados, y cancelaciones sin previo aviso en el campus.
- **Falta de métodos de pago electrónicos:** Los intercambios dependen 100% de efectivo, exponiendo a los alumnos a pérdidas o falta de cambio.
- **Desperdicio de material académico:** Miles de códigos legales, libros de cálculo, manuales psicodiagnósticos y batas de laboratorio quedan en desuso al terminar el semestre.

> 🎙️ **Guion del Presentador:**  
> *"Todos hemos visto o vivido lo difícil que es conseguir libros o material al inicio de semestre en CU Ecatepec. Los estudiantes acuden a grupos informales de redes sociales donde no hay garantías: perfiles falsos, productos que no corresponden con la foto y riesgos al acordar citas. Nuestro proyecto nace para transformar esa informalidad en un entorno universitario confiable, seguro y profesional."*

---

## 📊 Diapositiva 3: Nuestra Solución y Propuesta de Valor
- **Ecosistema Exclusivo:** Acceso restringido exclusivamente a estudiantes y profesores de CU Ecatepec.
- **Comercio Académico Especializado:** Clasificado por las 6 carreras del plantel (Computación, Derecho, Psicología, Administración, Contaduría, Informática).
- **Mecanismo de Pago Protegido (*Escrow*):** Retención del dinero con tarjeta hasta la entrega física confirmada.
- **Módulo de Objetos Perdidos:** Apoyo solidario para recuperar pertenencias extraviadas en las instalaciones del campus.

> 🎙️ **Guion del Presentador:**  
> *"La solución es una plataforma web progresiva que une dos pilares fundamentales: la exclusividad universitaria mediante validación institucional y un protocolo de pago con tarjeta en custodia para eliminar el riesgo de fraudes entre compañeros."*

---

## 📊 Diapositiva 4: Exclusividad Institucional y Validación de Identidad
- **Filtro de Dominio Estricto:** Solo se admiten correos oficiales `@alumno.uaemex.mx` y `@profesor.uaemex.mx`.
- **Autenticación con Códigos OTP de 6 Dígitos:** Despacho automatizado de un código aleatorio criptográfico con vigencia de 15 minutos.
- **Protección de Contraseñas:** Cifrado unidireccional con algoritmo `bcrypt` (10 rondas de sal).
- **Sesiones Seguras:** Generación de Tokens Web JSON (JWT) con expiración controlada.

> 🎙️ **Guion del Presentador:**  
> *"La base de la seguridad es que nadie ajeno a la UAEMex puede registrarse. Al crear una cuenta, el sistema valida que el dominio sea institucional y envía un código numérico aleatorio al buzón del alumno. Esto garantiza que cada usuario corresponde a un estudiante matriculado y activo."*

---

## 📊 Diapositiva 5: Pasarela de Pago Web con Custodia (*Escrow*) y Código de Entrega
- **El reto:** ¿Cómo pagar con tarjeta en línea sin riesgo de estafas en el campus?
- **El flujo de 4 pasos:**
  1. El comprador paga con tarjeta (Débito o Crédito) en la plataforma web.
  2. El sistema retiene los fondos en custodia segura (*Escrow*) y genera un **Código de Entrega de 4 dígitos** exclusivo para el comprador.
  3. Los estudiantes se citan en un punto seguro de CU Ecatepec (Biblioteca, Explanada, Cafetería Edificio B).
  4. El comprador revisa el artículo y le muestra su código de 4 dígitos al vendedor.

> 🎙️ **Guion del Presentador:**  
> *"Implementamos un sistema de custodia similar al de las grandes plataformas internacionales. Cuando el comprador paga con tarjeta, el dinero no va de inmediato al vendedor; se queda congelado en la plataforma. Solo cuando se encuentran físicamente en CU Ecatepec y el comprador comprueba que el libro o calculadora está en buen estado, le comparte su código de 4 dígitos."*

---

## 📊 Diapositiva 6: Dispersión Bancaria (CLABE) y Sistema de Reputación
- **Cobro para el Vendedor:**
  - El vendedor registra su **CLABE Interbancaria de 18 dígitos** y banco en su perfil.
  - Al ingresar el código de 4 dígitos del comprador, el dinero retenido se libera y transfiere automáticamente vía SPEI a su cuenta.
- **Evaluación y Reputación:**
  - Sistema de calificación con **1 a 5 estrellas**.
  - Etiquetas cualitativas (*100% Recomendado, Muy puntual, Producto tal como en las fotos*).
  - Promedio de reputación visible para toda la comunidad.

> 🎙️ **Guion del Presentador:**  
> *"Resolvimos el ciclo completo de cobro: el vendedor configura su CLABE interbancaria de 18 dígitos. Al validar el código de entrega, la plataforma dispersa los fondos a su cuenta bancaria. Inmediatamente después, el comprador califica al vendedor con estrellas y comentarios para construir un historial de confianza en nuestro plantel."*

---

## 📊 Diapositiva 7: Módulo Adicional: Objetos Perdidos y Encontrados
- **Problemática en campus:** Credenciales, llaves, calculadoras y chamarras olvidadas en aulas y laboratorios.
- **Funcionalidades del módulo:**
  - Reporte de artículos **Extraviados (Rojo)** y **Encontrados (Verde)**.
  - Registro de ubicación específica (ej. *Laboratorio de Cómputo 3, Jardineras Edificio A*).
  - Estado del reporte: *Abierto*, *Reclamado* o *Devuelto*.

> 🎙️ **Guion del Presentador:**  
> *"Como valor agregado a la vida universitaria en Ecatepec, integramos un módulo centralizado de objetos perdidos, facilitando que credenciales o calculadoras olvidadas regresen rápidamente a sus dueños legítimos sin burocracia."*

---

## 📊 Diapositiva 8: Arquitectura Técnica y Stack Tecnológico
- **Frontend:** React 19 + Vite + Lucide Icons + CSS modular adaptativo (100% Mobile Friendly).
- **Backend:** Node.js + Express REST API (Arquitectura MVC, middlewares de seguridad, CORS y JWT).
- **Base de Datos:** PostgreSQL en la nube con **Supabase** (Tipos ENUM, restricciones de dominio, llaves foráneas y esquemas relacionales).
- **Infraestructura en la Nube:**
  - Servidor desplegado en **Render** (Node.js 24/7).
  - Aplicación Web desplegada en **Vercel** (CDN Global con CI/CD automatizado).
  - Pasarela SMTP para envío automatizado de correos institucionales.

> 🎙️ **Guion del Presentador:**  
> *"La arquitectura del software sigue los estándares modernos de desarrollo desacoplado. Frontend en React con Vite para máxima velocidad, backend en Express con arquitectura modular, y una base de datos relacional robusta en PostgreSQL alojada en Supabase, todo desplegado en la nube con disponibilidad permanente."*

---

## 📊 Diapositiva 9: Demostración en Vivo / Capturas del Sistema
- Demostración de las vistas clave:
  1. Catálogo interactivo con filtros por **Carrera** y **Categoría**.
  2. Publicación de producto con subida de fotos y condición física.
  3. Modal de pago con tarjeta con prevención matemática de cobros dobles (Algoritmo de Luhn).
  4. Generación del comprobante con Folio Único y Código de Entrega.
  5. Panel del Vendedor: Pestaña de Cobros / CLABE y liberación de fondos.
  6. Calificación interactiva de 5 estrellas.

> 🎙️ **Guion del Presentador:**  
> *"En pantalla podemos observar la interfaz final, diseñada con los colores institucionales verde y oro de nuestra máxima casa de estudios. Cada botón y flujo fue pensado para que un estudiante tarde menos de 1 minuto en publicar o comprar un artículo de forma totalmente intuitiva."*

---

## 📊 Diapositiva 10: Conclusiones, Impacto Social y Futuro
- **Ahorro Económico:** Reducción de hasta un 60% en el gasto de material académico mediante reuso estudiantil.
- **Cero Fraudes:** Erradicación de cancelaciones falsas o fraudes con tarjeta gracias a la custodia física en campus.
- **Sentido de Comunidad:** Fortalecimiento del compañerismo entre generaciones de CU Ecatepec.
- **Próximas fases:** Notificaciones push en móviles y vinculación directa con el sistema escolar institucional.

> 🎙️ **Guion del Presentador:**  
> *"En conclusión, este proyecto demuestra cómo la ingeniería de software resuelve problemas cotidianos reales de nuestra comunidad universitaria. Fomenta la sustentabilidad, el ahorro económico y la seguridad dentro del Centro Universitario UAEM Ecatepec. Quedo a su entera disposición para cualquier pregunta o demostración técnica. Muchas gracias."*
