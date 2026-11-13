# Seguridad del portafolio

Revisión local: 13 de noviembre de 2026. El proyecto es un sitio estático: no tiene API, formularios de envío, autenticación, sesiones ni conexión a bases de datos. Los proyectos mostrados son enlaces y videos; sus servidores y repositorios no fueron auditados.

## Controles implementados

- Solo se publica `dist`. El build valida rutas, tipos de archivos y destinos reales antes de copiar; impide incluir archivos de entorno, claves, bases de datos o enlaces a archivos fuera del proyecto.
- Detección de patrones conocidos de credenciales en HTML, JavaScript, CSS y SVG publicados. También detecta JWT de Supabase con rol `service_role`. No es un detector universal: un secreto con otro formato puede pasar desapercibido.
- El despliegue ejecuta las comprobaciones del sitio y falla si faltan recursos, aparecen archivos no permitidos o fallan las cabeceras esperadas.
- CSP: scripts locales, sin scripts inline, manejadores inline, conexiones API, formularios, workers ni contenido embebido. HSTS, `nosniff`, protección contra frames, aislamiento entre orígenes y referentes desactivados.
- Las hojas de estilo externas siguen permitidas únicamente desde Google Fonts y cdnjs. Los atributos de estilo se permiten para el diseño y las animaciones. Esto mantiene una dependencia de esos proveedores.
- El visor admite únicamente imágenes y MP4 locales dentro de `/assets/img/`, sin parámetros ni credenciales en las URLs.
- `.gitignore` y `.vercelignore` excluyen archivos de entorno, claves privadas y volcados de bases de datos. Ignorar un archivo no lo borra si ya estaba en Git ni revoca una clave previamente expuesta.

## Los diez puntos solicitados

| Punto | Estado en este proyecto |
| --- | --- |
| 1. Rate limiting | Pendiente de activar en el Firewall de Vercel. No se simula con JavaScript. |
| 2. Claves fuera del código | No se necesitan claves para este sitio. Se excluyen `.env` y claves privadas del despliegue y se buscan patrones de secretos en archivos publicados. |
| 3. Secretos de producción | No se crearon secretos. Si se agrega un backend, configurarlos como variables sensibles del servidor en Vercel; los secretos de automatización van en GitHub Actions Secrets. Nunca copiar claves privadas al frontend. |
| 4. Límites por IP | Pendiente en la misma regla de rate limiting de Vercel. |
| 5. Entradas y consultas parametrizadas | Se restringen las rutas del visor y del build. No hay consultas SQL ni entradas enviadas a un servidor. Las consultas de una futura API deberán parametrizarse. |
| 6. Validación en servidor | No existe servidor de aplicación. Si se agrega una API, validar tipos, longitudes, permisos y formatos allí, aunque el navegador ya valide. |
| 7. RLS | No hay Supabase ni tablas. Si se agregan, activar RLS y probar que el usuario A no pueda leer ni modificar filas del usuario B. Las claves `service_role` deben quedarse en el servidor. |
| 8. Contraseñas y cifrado | No se almacenan contraseñas ni datos privados de usuarios. El sitio debe publicarse con HTTPS. Si se agrega autenticación, usar un proveedor de autenticación seguro con hashing de contraseñas y revisar cifrado de datos y respaldos. |
| 9. Sesiones que vencen | No hay sesiones de login. `localStorage` solo recuerda el tema visual. Una futura autenticación necesita expiración, revocación y protección adecuada de sus cookies/tokens. |
| 10. CORS solo con tu dominio | No se habilita CORS: no hay una API que lo necesite. No se agrega `Access-Control-Allow-Origin: *`. Una futura API debe permitir orígenes exactos y autenticar/autorizar cada petición; CORS no sustituye esos controles. |

## Pendiente en tu cuenta de Vercel

Estas opciones no se activaron desde este repositorio y su estado no se verificó en tu cuenta.

1. Crear/importar el proyecto y confirmar `dist` como directorio público. Mantener el comando de build de `vercel.json`, que incluye la verificación posterior.
2. En **Firewall → Configure → New Rule**, crear una regla de **Rate Limit**, clave **IP**, ventana fija de **60 segundos**. Como punto de partida orientativo, evaluar **300 solicitudes por minuto** para el sitio. Empezar con **Log** para revisar falsos positivos y después aplicar **429**. Log por sí solo no bloquea. El umbral no es una garantía y debe ajustarse al tráfico real, visitantes detrás de IP compartida y solicitudes de video. Revisar los límites y posibles cargos del plan antes de habilitarla.
3. Guardar la regla, revisar los cambios y publicarlos en Firewall. Los contadores de Vercel son regionales, no un límite global estricto.
4. Revisar Firewall y las alertas/límites de consumo disponibles en tu plan. No confiar en una regla por IP como única defensa frente a ataques distribuidos.
5. Proteger los despliegues de preview y mantener Git Fork Protection. Verificar que producción pública y previews privados tengan el comportamiento deseado.
6. Si en el futuro se necesitan secretos, marcarlos como **Sensitive**, separar Production y Preview y limitar qué personas/integraciones pueden acceder. El sitio actual no necesita ninguno.

## Tus cuentas y datos públicos

- Activar 2FA en Vercel, GitHub, el correo de recuperación y el registrador del dominio; guardar los códigos de recuperación fuera del repositorio.
- Usar contraseñas únicas, revisar sesiones e integraciones autorizadas y conceder a colaboradores únicamente los permisos necesarios.
- En GitHub, revisar protección de la rama de producción, revisiones de cambios y las opciones de detección de secretos disponibles para el repositorio.
- Si alguna clave se publicó alguna vez, revocarla o rotarla primero. Borrarla del archivo o del historial no la vuelve segura.
- El correo, teléfono, fotos, certificados y el enlace al CV son públicos por diseño. Cualquier visitante puede copiarlos o descargarlos. Revisar certificados y CV por documentos de identidad, direcciones, firmas, códigos y otros datos que no quieras hacer públicos antes de publicar. Ninguna cabecera ni CORS impide copiar lo que se muestra públicamente.

## Verificación

```powershell
node --test scripts/security.test.mjs
node scripts/build.mjs
node scripts/check.mjs
```

Las pruebas verifican el rechazo de rutas privadas, tipos prohibidos y ejemplos de credenciales. La revisión local de patrones sobre 45 archivos de texto actuales e históricos no detectó coincidencias; no incluye una auditoría de imágenes, cuentas ni servicios enlazados.

Después del despliegue, comprobar las cabeceras HTTP reales (también en 404 y archivos), el menú, los certificados, las demos y los temas. El servidor local de Python no aplica las cabeceras de Vercel. La configuración local no demuestra que estén activas en producción. No se realizó un pentest ni se garantiza ausencia de vulnerabilidades o ataques.

Fuentes oficiales: [Rate limiting de Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), [variables sensibles](https://vercel.com/docs/environment-variables/sensitive-environment-variables), [2FA en Vercel](https://vercel.com/docs/two-factor-authentication), [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).
