# Portafolio — Eduardo Acuño G.

Sitio de una sola página construido en HTML/CSS/JS puro (sin dependencias, sin build). Podés subirlo tal cual a GitHub Pages, Netlify o Vercel.

## Estructura
```
portafolio-eduardo/
├── index.html        # toda la estructura del sitio
├── css/style.css      # estilos y tokens de diseño
├── js/script.js       # menú móvil, carrusel de certificados, scroll-to-top
├── assets/img/        # poné acá tus fotos, capturas de proyectos, etc.
└── README.md
```

## Qué personalizar
1. **Foto e ilustración del hero**: reemplazá el SVG de `.hero-illustration` por tu propia foto o ilustración en `assets/img/`.
2. **CV**: subí tu PDF a `assets/CV-Eduardo-Acuno.pdf` (el botón "Descargar CV" ya apunta ahí).
3. **Redes**: cambiá los `href` de LinkedIn, Instagram, GitHub y el email en el hero y en el footer.
4. **Certificados**: cada `.cert-card` tiene un `.cert-thumb` de relleno — reemplazalo por `<img src="assets/img/tu-certificado.jpg">`.
5. **Proyectos**: cambiá título, descripción, link y la imagen (`.proyecto-img`) de cada `.proyecto-card`.
6. **Fotos "Sobre mí"**: reemplazá `.polaroid-img` y `.galeria-item` por tus fotos reales.

## Cómo verlo localmente
Abrí `index.html` directo en el navegador, o corré un servidor simple:
```bash
python3 -m http.server 8000
```
y entrá a `http://localhost:8000`.

## Publicarlo gratis
- **GitHub Pages**: subí la carpeta a un repo y activá Pages en Settings → Pages.
- **Netlify / Vercel**: arrastrá la carpeta al dashboard, no necesita configuración.
