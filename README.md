# GENIA 2026 · Taller Genia 01 — Prompting con propósito

Aplicación lista para desplegar en **Vercel** (archivos estáticos + funciones Node.js), basada en el diseño original de `genia-formulario.zip`, con la identidad de KeyOns e Ingenya.

## Qué incluye

- Las **10 preguntas definitivas** de la sesión 01: 6 de opción única, 2 de selección múltiple, 1 para ordenar pasos y 1 para relacionar herramientas.
- **Aleatorización por participante** del orden de las preguntas y de todas las opciones que admiten orden. Cada intento queda guardado con su orden en PostgreSQL y no cambia al navegar o recuperar el intento.
- **12 minutos** desde que el servidor registra el comienzo; el temporizador no se reinicia al recargar. Al acabarse el tiempo, se envían las respuestas marcadas si la pestaña sigue abierta. Hay un margen técnico de red de 15 segundos, no para responder más tiempo.
- **Un intento por correo declarado** (no es verificación de identidad). La base de datos impide un segundo registro de inicio con el mismo correo.
- Calificación **0–100**, sin etiquetas de aprobación/reprobación. Hasta 10 puntos por pregunta; hay crédito parcial en ejercicios de ordenar, relacionar y selección múltiple. En selección múltiple se penalizan distractores seleccionados.
- Resultado individual y repaso con respuestas esperadas y explicaciones de las preguntas incorrectas o parcialmente correctas.
- Dos preguntas finales de opinión (utilidad de 1 a 5 y tema para reforzar), opcionales, sin efecto en la nota.
- Administración protegida por contraseña, con listado de resultados y exportación privada a **Excel y PDF**.
- Diseño responsive, verificado mediante recorrido de interfaz en 1440, 390 y 320 px de ancho.

## Actualización de una versión anterior

1. Haz respaldo de tu base de datos actual en Neon antes de actualizar.
2. En **Neon → SQL Editor**, ejecuta **todo `schema.sql`**. Contiene `CREATE TABLE IF NOT EXISTS` y `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para conservar resultados previos y añadir los datos nuevos. **No borres las tablas**.
3. Sube los archivos de esta carpeta al mismo repositorio de GitHub, reemplazando los anteriores. Asegúrate de que en la raíz queden `package.json`, `api/`, `lib/`, `public/`, `schema.sql` y `vercel.json`.
4. Vercel despliega automáticamente si ya está conectado al repositorio. En caso contrario, importa el repositorio y elige raíz `./`, framework `Other`. El archivo `vercel.json` define `public` como directorio de salida.
5. Mantén las variables de entorno existentes: `DATABASE_URL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`. **No es necesario reemplazarlas si ya funcionan.**
6. Ejecuta `npm test` localmente si quieres verificar el banco de preguntas y el sistema de aleatorización. Prueba un intento completo en Vercel con un correo de prueba nuevo antes de dar el enlace.

**Nota de compatibilidad:** Si ya había resultados con preguntas anteriores, se mantienen. La nueva columna de puntos por pregunta aparecerá sin datos para esas participaciones históricas.

## Despliegue inicial en Vercel

### 1. PostgreSQL en Neon

Crea una base de datos en [Neon](https://neon.tech), copia su connection string a `DATABASE_URL` y ejecuta `schema.sql` desde el SQL Editor.

### 2. Variables de entorno

| Key | Value |
|---|---|
| `DATABASE_URL` | Cadena PostgreSQL con SSL de Neon |
| `ADMIN_PASSWORD_HASH` | Hash scrypt generado con `npm run hash-password -- "contraseña-segura-de-14-caracteres-o-más"` |
| `SESSION_SECRET` | Cadena secreta aleatoria generada con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

En Vercel, configura estas variables para `Production` y para los entornos adicionales que vayas a utilizar. No las publiques ni las subas a GitHub.

### 3. Aplicación

Importa el repositorio. Vercel detectará las funciones en `api/` y servirá el sitio desde `public/`. Si las variables se configuraron después, ejecuta **Redeploy**.

- **Participantes:** `https://tu-dominio/`
- **Administración:** `https://tu-dominio/admin.html`

## Seguridad y privacidad

- Preguntas y opciones se asignan con aleatorización criptográfica del servidor y se almacenan en `quiz_attempts.presentation` para mantener el orden en un intento.
- La clave de corrección se encuentra solo en `lib/questions.js`, fuera de `public/`. El archivo `/api/questions` ya no entrega el banco general de preguntas.
- Toda corrección ocurre en `/api/submit`, utilizando la combinación guardada para ese participante.
- El bloqueo de intento único se basa en **el correo escrito**, no en una identidad verificada. Quien conozca el correo de otra persona podría ingresarlo antes. Para reducir suplantación, se necesitaría código al correo (OTP), SSO o invitaciones verificadas.
- La sesión administrativa utiliza cookie `HttpOnly`, `Secure`, `SameSite=Strict` firmada con HMAC, además de hash de contraseña scrypt y un límite de intentos de inicio de sesión.
- Las rutas de exportación y consulta de notas verifican autenticación en el servidor. Los participantes no ven enlaces ni archivos administrativos.
- Mantén el repositorio **privado** y no publiques el código del backend, porque contiene la clave de respuestas.
- Los datos recopilados incluyen nombre, correo, respuestas, nota, fecha y hora, más comentarios opcionales. Establece política de retención y acceso conforme a tus obligaciones de privacidad.
- No se incluyen archivos de fuentes tipográficas. El navegador obtiene TASA Orbiter y Plus Jakarta Sans desde Google Fonts; requiere acceso a Internet para visualizar esas tipografías.

## Comportamiento del tiempo y de los intentos

El intento se reserva **al presionar «Comenzar»**. Si una persona recarga durante esos 12 minutos en la misma pestaña, el frontend recupera su orden con un token del `sessionStorage`, sin iniciar otro intento. Si cierra la pestaña y pierde el token, o vuelve después de haber agotado el tiempo, debe solicitar apoyo a los organizadores. La corrección al vencimiento se dispara desde el navegador abierto; si la página se cierra antes de que el tiempo termine, no existe un proceso automático en segundo plano que envíe sus respuestas.

## Pruebas recomendadas antes de compartir el enlace

1. Abrir el sitio en computadora y celular; verificar ambos logos, cielo, tipografía, pie de página y controles táctiles.
2. Ingresar un correo nuevo e iniciar. Confirmar 12:00 y que las preguntas muestran barra de progreso.
3. Navegar hacia atrás y verificar que se conservan las respuestas y su orden.
4. Comparar dos intentos con correos de prueba distintos: deben variar posiciones de preguntas y opciones.
5. Resolver selección única, múltiple, ordenamiento y relaciones; comprobar la nota y explicaciones.
6. Enviar opinión y comprobar que aparece en el panel y en Excel/PDF.
7. Entrar a `/admin.html` con contraseña y exportar reportes. Confirmar que las rutas `/api/admin/results`, `/api/admin/export`, `/api/admin/export-pdf` rechazan solicitudes sin sesión.
8. Intentar iniciar de nuevo con el mismo correo: debe impedirlo.
9. Antes de lanzar, revisar las fuentes y accesos de Neon y habilitar copias de seguridad.

## Archivos principales

| Archivo | Función |
|---|---|
| `public/index.html`, `public/style.css`, `public/app.js` | Interfaz participante |
| `public/admin.html`, `public/admin.css`, `public/admin.js` | Interfaz administrativa |
| `public/assets/` | Fotografía del cielo, logos y viñeta de la referencia original |
| `lib/questions.js` | Banco y clave de las 10 preguntas |
| `lib/quiz.js` | Aleatorización, validación y calificación |
| `api/start.js`, `api/resume.js`, `api/submit.js`, `api/feedback.js` | Funciones del participante |
| `api/admin/` | Autenticación, listado de notas, exportación Excel y PDF |
| `schema.sql` | Creación y migración de las tablas |
| `test/quiz.test.js` | Pruebas unitarias; ejecutar con `npm test` |

## Estado de pruebas de esta entrega

- Ocho pruebas unitarias cubren estructura, aleatorización, puntuación, correspondencia de respuestas, crédito parcial y validación de índices.
- Se realizó un recorrido visual automatizado con respuestas de prueba en escritorio y celulares de 390 y 320 px, sin errores de JavaScript ni scroll horizontal.
- **Pendiente:** prueba de extremo a extremo conectada a una base PostgreSQL real y verificación de exportaciones en la cuenta de Vercel. Se recomienda completarla antes de invitar participantes.
