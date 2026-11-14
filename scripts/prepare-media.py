"""Run with PYTHONPATH=.tools/media after installing Pillow and imageio-ffmpeg."""
from pathlib import Path
import subprocess
from PIL import Image
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
for name, width in [('inicio1', 1100), ('inicio-reponsive', 720), ('inicio3', 720), ('sobremi1', 900), ('fondo5', 600), ('logo-vii', 160)]:
    source = root / f'assets/img/{name}.png'
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.thumbnail((width, width * 4))
        image.save(target, 'WEBP', quality=82, method=6)
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size}', flush=True)

for source in (root / 'assets/img/proyectos').glob('*.gif'):
    target = source.with_suffix('.mp4')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-vf', "fps=15,scale='min(1280,iw)':-2:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2", '-c:v', 'libx264', '-preset', 'fast', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', str(target)], check=True)
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size}', flush=True)
