from pathlib import Path

root = Path('.')
for path in sorted(root.rglob('*')):
    if 'greggory' in path.name.lower():
        print(path)
