"""Generate web assets without modifying the original PNG/GIF sources."""
from pathlib import Path
import argparse
import re
import subprocess
from PIL import Image
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--images-only', action='store_true', help='Skip converting loading animations')
args = parser.parse_args()
sources = [root / 'index.html', root / 'css/style.css', root / 'css/ux.css']
references = set()
for source in sources:
    for reference in re.findall(r'assets/img/[^\s\"\'<>)]*\.(?:png|webp)', source.read_text(encoding='utf-8')):
        original = (root / reference).with_suffix('.png')
        if original.is_file() and original.stem not in {'inicio1', 'inicio-reponsive', 'inicio3', 'sobremi1', 'fondo5', 'logo-vii'}:
            references.add(original.relative_to(root).as_posix())
for reference in sorted(references):
    source = root / reference
    target = source.with_suffix('.webp')
    width = 128 if source.stem.startswith(('icono-', 'boton-')) else 1920
    if source.stem == 'sobremi2':
        width = 1000
    with Image.open(source) as image:
        image.thumbnail((width, 1920), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=85, method=4)
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size}', flush=True)

# Keep full certificates for the viewer and use small previews in the carousel.
html = (root / 'index.html').read_text(encoding='utf-8')
for reference in re.findall(r'<img\b[^>]*src="(assets/img/(?:certificados|proyectos)/[^"]+)"', html):
    source = root / reference
    if source.stem.endswith('.thumb'):
        candidates = [source.with_name(source.stem.removesuffix('.thumb') + suffix) for suffix in ['.webp', '.jpg', '.png']]
        source = next((candidate for candidate in candidates if candidate.is_file()), source)
        if source.stem.endswith('.thumb'):
            raise FileNotFoundError(f'Original preview image not found: {reference}')
    target = source.with_name(source.stem + '.thumb.webp')
    with Image.open(source) as image:
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=85, method=4)
    print(f'{source.name}: preview {target.stat().st_size} bytes', flush=True)

for name in ([] if args.images_only else ['gif-cargando', 'gif-cargando-reponsive']):
    source = root / 'assets/img' / f'{name}.gif'
    target = source.with_suffix('.mp4')
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error',
        '-y', '-i', str(source), '-an', '-vf', 'fps=24',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(target),
    ], check=True)
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size}', flush=True)
