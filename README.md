# Portafolio de Eduardo

Sitio estático HTML/CSS/JavaScript. No necesita base de datos, funciones de servidor ni claves privadas.

## Publicar en Vercel

Importá el repositorio y elegí **Other** como Framework Preset. Dejá el directorio raíz en la raíz del repositorio. `vercel.json` define:

- Build Command: `node scripts/build.mjs && node scripts/check.mjs`
- Output Directory: `dist`
- No necesita instalar paquetes para el build ni configurar variables de entorno.

Antes de subir los cambios:

```powershell
node scripts/build.mjs
node scripts/check.mjs
```

`dist` se genera localmente y en Vercel; no se sube a Git. El build copia únicamente los archivos públicos referenciados por la página y las hojas de estilo. No publiques la carpeta raíz como Output Directory: contiene originales y herramientas de mantenimiento.

Para previsualizar el resultado:

```powershell
python -m http.server 8000 --directory dist --bind 127.0.0.1
```

Abrí `http://localhost:8000`. El servidor de Python no aplica las cabeceras de Vercel. Después del primer despliegue, comprobá las cabeceras reales y probá las fuentes, íconos, tema, menú, certificados, demos, teclado y la página 404. La política CSP puede bloquear scripts que inyecten extensiones del navegador o la barra de herramientas de Vercel; eso no requiere habilitar scripts externos para los visitantes.

## Experiencia de uso

- Imágenes WebP con dimensiones reservadas y portada adaptada con `picture`.
- Esqueletos y mensajes de error en miniaturas, sin bloquear el contenido.
- Demos MP4 con controles, reproducción automática sin sonido y en bucle, cargadas solo al abrir el visor.
- Visor `dialog`: carga, error, reintento, Escape, foco y liberación del video al cerrar.
- Carruseles con controles, puntos sincronizados, teclado y botones desactivados en los extremos.
- Tema recordado en el navegador y preferencia del sistema en la primera visita.
- Enlace para saltar al contenido y respeto por movimiento reducido.

## Seguridad y límites

`vercel.json` agrega Content-Security-Policy, protección contra inclusión en marcos, `nosniff`, aislamiento entre orígenes, política sin referentes, permisos restringidos y HSTS. La CSP permite JavaScript solo desde el mismo origen y estilos/fuentes de los proveedores ya usados por el diseño. Solo se permiten atributos de estilo inline para el diseño y las animaciones, no bloques de estilo inline. No se permiten formularios, conexiones desde JavaScript, objetos incrustados ni frames.

Consultá [SEGURIDAD.md](SEGURIDAD.md) para ver los diez controles solicitados, las pruebas y las tareas pendientes en Vercel y tus cuentas. El Firewall por IP y la autenticación de dos factores no se activan desde este código.

La salida pública usa una lista de archivos permitidos: no incluye originales GIF, herramientas, documentación, `.git` ni archivos de entorno. Nunca pongas secretos en HTML, JavaScript o assets: todo archivo publicado puede descargarse. Los datos de contacto del portafolio son públicos.

Ningún sitio está exento de ataques o errores. Las cabeceras reducen riesgos del navegador; la defensa contra tráfico abusivo depende del proveedor. Vercel ofrece mitigación DDoS en su plataforma. Revisá el panel Firewall, alertas de consumo y la seguridad de tu cuenta (autenticación de dos factores). Esas opciones no se activan desde este repositorio ni se modificaron en tu cuenta.

Referencias oficiales: [configuración de Vercel](https://vercel.com/docs/project-configuration/vercel-json), [Firewall](https://vercel.com/docs/vercel-firewall), [mitigación DDoS](https://vercel.com/docs/vercel-firewall/ddos-mitigation).

## Actualizar contenido

Editá `index.html`, `css/style.css`, `css/ux.css` y los scripts en `js/`. Conservá los identificadores de los controles. Al agregar una imagen o video, usá rutas locales; el build verifica que los archivos existan.

El build incluye las imágenes referenciadas en ambas hojas de estilo, también los fondos responsive y las decoraciones. La comprobación valida esas rutas con mayúsculas y minúsculas exactas, además de los enlaces HTML. Los íconos de navegación usan nombres sin acentos: `icono-der.png`, `icono-izq.png` e `icono-arriba.png`.

Los originales se conservan en `assets/img`. Para repetir la conversión de las imágenes principales y los GIF, instalá Pillow e imageio-ffmpeg en un entorno Python y ejecutá `python scripts/prepare-media.py`. No son dependencias del sitio ni del build de Vercel.
