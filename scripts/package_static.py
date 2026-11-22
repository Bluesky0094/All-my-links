from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
out = root / 'dist'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for page in ('index.html', 'profilo.html'):
    shutil.copy2(root / page, out / page)
shutil.copytree(root / 'static', out / 'static', dirs_exist_ok=True)
print('Static site packaged in dist/')
