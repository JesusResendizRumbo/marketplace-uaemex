# 👥 HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN (BDD / Gherkin)
### Proyecto: Marketplace Universitario UAEMex
**Formato:** Agile User Stories + Criterios de Aceptación en formato Gherkin (Dado que / Cuando / Entonces)

---

## 📌 Resumen de Épicas

| Épica | Nombre | Descripción |
| :--- | :--- | :--- |
| **EP-01** | Autenticación y Verificación Institucional | Control de acceso exclusivo para la comunidad UAEMex. |
| **EP-02** | Gestión de Publicaciones y Marketplace | Creación, edición y ciclo de vida de artículos en venta/donación. |
| **EP-03** | Búsqueda y Filtrado Inteligente | Localización ágil de productos segmentados por facultad y campus. |
| **EP-04** | Módulo de Objetos Perdidos | Reporte y resolución de artículos extraviados en instalaciones. |
| **EP-05** | Chat y Contacto Seguro | Negociación y acuerdo de puntos de entrega seguros en la universidad. |
| **EP-06** | Reputación y Moderación | Calificación de usuarios y reporte de comportamientos indebidos. |

---

## 🎯 Detalle de Historias de Usuario

### 🟢 ÉPICA 1: Autenticación y Verificación Institucional

#### HU-01: Registro con correo institucional UAEMex
- **Como:** Estudiante o docente de la UAEMex  
- **Quiero:** Registrarme en la plataforma utilizando mi correo institucional (`@alumno.uaemex.mx` o `@profesor.uaemex.mx`)  
- **Para:** Garantizar que interactúo en un entorno seguro y exclusivo para miembros de la universidad.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 5 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Registro exitoso con correo institucional válido
  Dado que el usuario se encuentra en la pantalla de registro
  Cuando ingresa su nombre, un correo que finaliza en "@alumno.uaemex.mx", su facultad y una contraseña segura
  Y presiona el botón "Crear Cuenta"
  Entonces el sistema registra la cuenta en estado "Pendiente de Validación"
  Y despacha un correo con un código OTP de 6 dígitos
  Y redirige al usuario a la pantalla de verificación.

Escenario: Intento de registro con correo no institucional (ej. Gmail, Hotmail)
  Dado que el usuario se encuentra en la pantalla de registro
  Cuando ingresa un correo con dominio "juan.perez@gmail.com"
  Y presiona el botón "Crear Cuenta"
  Entonces el sistema bloquea el envío del formulario
  Y muestra un mensaje de error: "Solo se admiten correos institucionales (@alumno.uaemex.mx o @profesor.uaemex.mx)".

Escenario: Verificación de código OTP correcta
  Dado que el usuario ha recibido su código OTP de 6 dígitos
  Cuando ingresa el código correcto antes del tiempo límite de 15 minutos
  Entonces el sistema activa la cuenta
  Y genera un token de sesión JWT para ingresar automáticamente a la plataforma.
```

---

#### HU-02: Inicio de Sesión y Persistencia de Sesión
- **Como:** Usuario registrado de la comunidad UAEMex  
- **Quiero:** Iniciar sesión con mi correo institucional y contraseña  
- **Para:** Acceder a mi panel de publicaciones, mensajes y compras de forma segura.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 3 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Inicio de sesión con credenciales correctas
  Dado que el usuario está en la página de Login
  Cuando introduce su correo institucional verificado y contraseña correcta
  Y presiona "Iniciar Sesión"
  Entonces el sistema responde con un código HTTP 200 y un token JWT
  Y el frontend almacena el token de manera segura y redirige al Catálogo Principal.

Escenario: Contraseña incorrecta
  Dado que el usuario intenta ingresar sus credenciales
  Cuando introduce una contraseña errónea
  Entonces el sistema muestra: "Credenciales inválidas. Por favor verifica tus datos"
  Y no expone información sobre si el correo existe o no en la base de datos.
```

---

### 🟢 ÉPICA 2: Gestión de Publicaciones y Marketplace

#### HU-03: Publicar un artículo para venta o donación
- **Como:** Estudiante universitario  
- **Quiero:** Publicar un artículo académico (libro, bata, calculadora, material) con fotografías, precio y estado  
- **Para:** Ofrecérselo a compañeros de mi facultad u otros campus universitarios.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 5 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Publicación exitosa de producto con imágenes
  Dado que un usuario ha iniciado sesión
  Cuando accede al formulario "Vender un Artículo"
  Y completa el título "Cálculo de Stewart 8va Edición", descripción, categoría "Libros", precio "350", estado "Usado - Buen estado", facultad "Facultad de Ingeniería" y sube 2 fotografías
  Y presiona "Publicar Artículo"
  Entonces las imágenes se cargan y optimizan en Cloudinary
  Y se crea el registro en la base de datos con estatus "Disponible"
  Y el producto aparece inmediatamente listado en el Catálogo.

Escenario: Intento de publicación con precio negativo o campos vacíos
  Dado que el usuario intenta publicar sin ingresar el título o con un precio de "-50"
  Cuando presiona "Publicar Artículo"
  Entonces el sistema muestra advertencias en los campos obligatorios
  Y no realiza ninguna petición al backend.
```

---

#### HU-04: Actualizar el estado del producto (Disponible, Apartado, Vendido)
- **Como:** Vendedor  
- **Quiero:** Cambiar el estado de mi publicación cuando un comprador haya apartado o comprado mi artículo  
- **Para:** Evitar que otros estudiantes sigan preguntando por un artículo no disponible.  
- **Prioridad:** Media (Should have)  
- **Estimación:** 2 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Vendedor marca su artículo como "Vendido"
  Dado que el usuario es el dueño de la publicación
  Cuando selecciona la opción "Marcar como Vendido" desde su panel de mis productos
  Entonces el estatus del producto cambia a "Vendido"
  Y el catálogo muestra una etiqueta sobrepuesta de "Vendido"
  Y se deshabilitan las opciones de contacto/chat para nuevos compradores.
```

---

### 🟢 ÉPICA 3: Búsqueda y Filtrado Inteligente

#### HU-05: Filtrado por Facultad y Campus
- **Como:** Estudiante del Campus El Cerrillo o Ciudad Universitaria (CU)  
- **Quiero:** Filtrar los artículos disponibles por mi facultad o plantel específico  
- **Para:** Encontrar productos que pueda recoger en persona entre clases sin tener que desplazarme a otro municipio.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 5 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Filtrar artículos por Facultad de Medicina
  Dado que el usuario está navegando en el catálogo de productos
  Cuando selecciona en el filtro de ubicación "Facultad de Medicina"
  Entonces el catálogo se actualiza mostrando únicamente artículos cuya facultad de entrega sea "Facultad de Medicina"
  Y muestra un contador indicando el número de resultados encontrados.
```

---

#### HU-06: Búsqueda por palabra clave y rango de precios
- **Como:** Comprador con presupuesto ajustado  
- **Quiero:** Buscar términos como "bata de laboratorio" y delimitar un precio máximo de $200  
- **Para:** Encontrar ofertas accesibles a mi presupuesto estudiantil rápidamente.  
- **Prioridad:** Media (Should have)  
- **Estimación:** 3 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Búsqueda combinada con precio máximo
  Dado que el usuario introduce "Bata" en la barra de búsqueda
  Y define el filtro de precio máximo en "$200"
  Cuando presiona Buscar o filtra dinámicamente
  Entonces el sistema devuelve todos los artículos que coinciden con el término cuyo precio <= 200
  Y descarta los artículos que superen dicho monto.
```

---

### 🟢 ÉPICA 4: Módulo de Objetos Perdidos ("Lost & Found")

#### HU-07: Publicar reporte de objeto encontrado en el campus
- **Como:** Estudiante que encontró una credencial o calculadora en las instalaciones  
- **Quiero:** Publicar un aviso con la foto, fecha y salón/área donde fue hallado  
- **Para:** Ayudar a que su dueño legítimo pueda recuperarlo fácilmente.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 5 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Reporte de hallazgo de credencial escolar
  Dado que un usuario encuentra una credencial en "Biblioteca Central CU"
  Cuando ingresa a la sección "Objetos Perdidos" y selecciona "Reportar Hallazgo"
  Y sube la foto (con opción de difuminar datos sensibles), detalla el lugar y selecciona la fecha
  Y publica el reporte
  Entonces el reporte se muestra en la sección de Objetos Perdidos con una insignia verde "Objeto Encontrado"
  Y se habilita un botón seguro para que el dueño solicite la entrega.
```

---

### 🟢 ÉPICA 5: Chat y Negociación Segura

#### HU-08: Mensajería interna por producto
- **Como:** Comprador interesado  
- **Quiero:** Enviar un mensaje directo al vendedor desde la vista del producto  
- **Para:** Acordar el punto de entrega en la facultad, hora y dudas del artículo sin tener que compartir mi número telefónico privado de inmediato.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 8 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Iniciar conversación sobre un producto
  Dado que el comprador visualiza el detalle del "Estetoscopio Littmann"
  Cuando da clic en "Enviar Mensaje al Vendedor"
  Y escribe: "¿Te parece vernos en las jardineras de Medicina a las 2 pm?"
  Entonces se crea una conversación vinculada al producto
  Y el vendedor recibe una notificación en la plataforma con el mensaje entrante.
```

---

### 🟢 ÉPICA 6: Reputación, Reseñas y Moderación

#### HU-09: Calificar y dejar reseña a un vendedor
- **Como:** Comprador que completó una transacción  
- **Quiero:** Calificar al vendedor con estrellas (1 a 5) y dejar una opinión  
- **Para:** Construir una comunidad universitaria confiable y reconocer a los buenos vendedores.  
- **Prioridad:** Media (Should have)  
- **Estimación:** 3 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Calificación exitosa post-compra
  Dado que una venta ha sido marcada como concluida
  Cuando el comprador asigna 5 estrellas y escribe "Excelente vendedor, puntual y el libro estaba impecable"
  Y presiona "Enviar Reseña"
  Entonces la calificación se almacena
  Y el promedio de reputación en el perfil del vendedor se recalcula automáticamente.
```

---

#### HU-10: Denunciar publicación fraudulenta o inapropiada
- **Como:** Usuario de la comunidad  
- **Quiero:** Denunciar una publicación sospechosa o que viole las normas universitarias  
- **Para:** Mantener el marketplace seguro y libre de estafas o artículos indebidos.  
- **Prioridad:** Alta (Must have)  
- **Estimación:** 3 Puntos de Historia  

##### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Envío de reporte de publicación
  Dado que un usuario detecta una publicación que ofrece respuestas de exámenes
  Cuando hace clic en el botón "Reportar Publicación"
  Y selecciona el motivo "Material prohibido / Falta a la ética académica" y añade un comentario
  Entonces el sistema registra el reporte
  Y lo envía a la bandeja del panel de administración para su revisión inmediata.
```
