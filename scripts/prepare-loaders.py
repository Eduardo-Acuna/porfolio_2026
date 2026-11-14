"""Convert the original loading GIFs to lighter animated WebP assets.

Run with PYTHONPATH=.tools/media and the existing imageio-ffmpeg dependency.
"""
from pathlib import Path
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
for name, width in [('gif-cargando', 1598), ('gif-cargando-reponsive', 502)]:
    source = root / 'assets/img' / f'{name}.gif'
    target = source.with_suffix('.webp')
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error',
        '-y', '-i', str(source), '-an',
        '-vf', f"fps=24,scale='min({width},iw)':-2:flags=lanczos",
        '-c:v', 'libwebp_anim', '-quality', '92', '-compression_level', '3',
        '-loop', '0', str(target),
    ], check=True)
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size}', flush=True)
