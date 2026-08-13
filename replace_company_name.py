from pathlib import Path

root = Path('.')
replacements = [
    ('The Greggory Systems And Strategy Firm', 'The Greggory Systems And Strategy Firm'),
    ('The Greggory Systems And Strategy Firm', 'The Greggory Systems And Strategy Firm'),
    ('THE GREGGORY SYSTEMS AND STRATEGY FIRM', 'THE GREGGORY SYSTEMS AND STRATEGY FIRM'),
]
changed_files = []

for path in root.rglob('*'):
    if path.is_file():
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        new_text = text
        for old, new in replacements:
            new_text = new_text.replace(old, new)
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            changed_files.append(str(path))

print('changed', len(changed_files), 'files')
for f in changed_files:
    print(f)
