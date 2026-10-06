from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
out = root / 'dist'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
shutil.copy2(root / 'index.html', out / 'index.html')
shutil.copytree(root / 'static', out / 'static', dirs_exist_ok=True)
print('Static site packaged in dist/')
