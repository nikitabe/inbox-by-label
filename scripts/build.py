"""Build a Store ZIP; bootstrap reserves a Store item without working OAuth."""
import argparse
import json
import re
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--bootstrap', action='store_true', help='Draft upload only; Connect Gmail stays disabled')
p.add_argument('--client-id')
p.add_argument('--homepage')
args = p.parse_args()
manifest = json.loads((ROOT/'extension/manifest.json').read_text())
if not args.bootstrap:
    if not args.client_id or not re.fullmatch(r'[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com', args.client_id):
        p.error('Provide the production Chrome Extension OAuth --client-id tied to the Store item ID.')
    if not args.homepage or not args.homepage.startswith('https://'):
        p.error('Provide the published HTTPS --homepage.')
    manifest['oauth2']['client_id'] = args.client_id
    manifest['homepage_url'] = args.homepage
out = ROOT/'dist'; out.mkdir(exist_ok=True)
archive = out/('inbox-by-label-bootstrap.zip' if args.bootstrap else 'inbox-by-label-store.zip')
with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
    z.writestr('manifest.json', json.dumps(manifest, indent=2)+'\n')
    for f in sorted((ROOT/'extension').rglob('*')):
        if f.is_file() and f.name != 'manifest.json':
            z.write(f, f.relative_to(ROOT/'extension'))
print(archive)
if args.bootstrap:
    print('DRAFT ONLY: reserve a Store item, then rebuild with its production OAuth client before submission.')
