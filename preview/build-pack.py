"""Build the review download from the same files the preview lessons use."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'content' / 'rebuild'
with zipfile.ZipFile(BASE / 'ccs-ai-pack.zip', 'w', compression=zipfile.ZIP_DEFLATED) as pack:
    for folder in ['ai-pack', 'example']:
        for f in sorted((BASE / folder).rglob('*')):
            if f.is_file():
                info = zipfile.ZipInfo(str(f.relative_to(BASE)), date_time=(2026, 11, 6, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                pack.writestr(info, f.read_bytes())
    for name in ['scraper.mjs', 'csv.mjs', 'collect-websites.mjs', 'company-cache.py']:
        info = zipfile.ZipInfo('tools/' + name, date_time=(2026, 11, 6, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        pack.writestr(info, (ROOT / 'preview/lib' / name).read_bytes())
print('Built versioned CCS pack from canonical files, no credentials or service calls.')
