# GENIA 2026 — Evaluación de Nivelación 01

Aplicación para Vercel con 10 preguntas de selección única, barra de progreso, aprobación con **80/100**, retroalimentación de errores, registro del momento de entrega en **America/Costa_Rica**, base de datos PostgreSQL (Neon) y panel privado con exportación a Excel.

## Requisitos
- Node.js 20 o superior, cuenta de Vercel y base de datos PostgreSQL de **Neon** (puede crearse desde Vercel Marketplace).
- Variables de entorno `DATABASE_URL`, `ADMIN_PASSWORD_HASH` y `SESSION_SECRET`.

## Desplegar
1. Subir **la carpeta completa** del proyecto a un repositorio GitHub privado. Importarlo en Vercel. La raíz del proyecto debe contener `package.json`, `api/`, `lib/` y `public/`.
2. Crear una base de datos Neon PostgreSQL y ejecutar **`schema.sql`** en el SQL editor de Neon, una sola vez.
3. Añadir `DATABASE_URL` en **Vercel → Project → Settings → Environment Variables**. La URL debe requerir SSL. No usarla desde el frontend.
4. Definir contraseña fuerte (mínimo 14 caracteres) y generar su hash **localmente** con `npm run hash-password -- "tu-contraseña-muy-segura"`. Colocar el resultado completo de `ADMIN_PASSWORD_HASH` en variables de Vercel. Nunca incluir la contraseña en Git.
5. Generar secreto aleatorio con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y configurar `SESSION_SECRET` en Vercel.
6. Desplegar (o redeploy después de configurar las variables). Abrir `/` para alumnos y `/admin.html` solo para los organizadores.
7. Probar con una dirección de correo de prueba. Confirmar que un segundo envío con el mismo correo sea rechazado y que `/api/admin/export` sin sesión dé 401.

## Seguridad y reglas
- La clave de respuestas existe únicamente en `lib/questions.js` y se corrige en `/api/submit`. El navegador recibe solo preguntas y opciones.
- Cada **correo normalizado** puede entregar **una única vez**, impuesto por índice `UNIQUE` en base de datos (protege incluso contra entregas simultáneas).
- **Importante:** un correo escrito por el usuario no demuestra su identidad. Con el diseño actual, alguien que conozca el correo de otra persona podría utilizarlo primero. Para impedir suplantaciones con mayor garantía, hace falta autenticación por correo con código de un solo uso (OTP), SSO corporativo o invitaciones personales verificadas. La presente versión implementa un intento por correo declarado, no identidad verificada.
- Las rutas de reportes y exportación verifican cookie de sesión `HttpOnly`, `Secure`, `SameSite=Strict`, firmada con HMAC-SHA256 y caducidad de 8 horas.
- El inicio de sesión utiliza hash `scrypt` con sal y bloqueo temporal después de 5 fallos por origen durante 15 minutos. Se verifica `Origin` en peticiones de modificación.
- **Nunca** publicar `DATABASE_URL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` o contenido de `lib/questions.js` en rutas del sitio. Si el repositorio se hace público, `lib/questions.js` revelará la clave en Git; se recomienda repositorio privado.
- La descarga Excel se genera **solo en el servidor** tras verificar acceso administrativo.
- Datos personales: nombre, correo, respuestas y fecha de presentación. Informar a participantes sobre finalidad, responsables y retención de estos datos, y establecer una política de eliminación de registros acorde a su organización.
- Solo el navegador de administradores con sesión válida puede exportar; desaconsejado compartir el equipo con la sesión abierta.

## Rutas
| Ruta | Acceso | Uso |
|---|---|---|
| `/` | Público | Evaluación |
| `/admin.html` | Página visible, contenidos protegidos | Inicio de sesión de administración |
| `/api/questions` | Público | Preguntas sin respuestas correctas |
| `/api/submit` | Público, POST | Corrección y registro de intento único |
| `/api/admin/login` | Público, POST | Autenticación admin |
| `/api/admin/results` | Solo admin | Resultados recientes |
| `/api/admin/export` | Solo admin | Archivo Excel con resultados y clave |

## Pruebas de aceptación
1. Inicio sin nombre completo no permite avanzar.
2. No se puede avanzar sin seleccionar respuesta.
3. Permite volver y cambiar respuestas antes de finalizar.
4. Confirma entrega final y guarda una sola vez por correo.
5. Muestra nota, estado y corrección solo de los errores.
6. El participante no ve enlaces de exportación.
7. Solo sesión admin permite listar y descargar Excel.
8. Excel incluye nombre, correo, fecha/hora Costa Rica, puntuación, estado y respuestas por pregunta.

## Notas de operación
El servidor necesita acceso válido a Neon para registrar calificaciones. No se incluye almacenamiento local que pueda perder datos con despliegues serverless. La interfaz es estática; el backend son funciones de Vercel. ExcelJS genera el `.xlsx` bajo demanda. Como medida operacional, asegurar respaldos de Neon y control de acceso a la cuenta de Vercel.
