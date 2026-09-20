#!/usr/bin/env python3
"""Download public-domain / freely licensed historical images into public/visuals."""

from __future__ import annotations

import io
import json
import ssl
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace/public/visuals")
ROOT.mkdir(parents=True, exist_ok=True)

UA = "DongsidaeArchive/1.0 (historical education; https://dongsidae.vercel.app)"
CTX = ssl.create_default_context()

# Wikimedia Commons filenames. License is recorded in src/data/visuals/assets.ts.
FILES = [
    ("nicaea-icon.jpg", "Nicaea_icon.jpg", 1600),
    ("luther-theses.jpg", "Luther_95_Thesen.png", 1600),
    ("luther-posting.jpg", "Luther95theses.jpg", 1400),
    ("luther-cranach.jpg", "Martin_Luther_by_Cranach-restoration.jpg", 1200),
    ("luther-cranach-alt.jpg", "Lucas Cranach d.Ä. - Martin Luther, 1529.jpg", 1200),
    ("constantine-head.jpg", "Constantino_Magno.JPG", 1400),
    ("constantine-head-alt.jpg", "Head_of_Constantine.jpg", 1400),
    ("constantine-colossus.jpg", "Colossus_of_Constantine.jpg", 1400),
    ("arch-constantine.jpg", "Arch_of_Constantine_Rome.jpg", 1600),
    ("goguryeo-muyong.jpg", "Muyongchong.jpg", 1400),
    ("goguryeo-ssireum.jpg", "Ssireum_Goguryeo.jpg", 1400),
    ("goguryeo-anak.jpg", "Anak_Tomb_No_3.jpg", 1400),
    ("luo-river.jpg", "Gu Kaizhi - Nymph of the Luo River (detail).jpg", 1600),
    ("luo-river-alt.jpg", "Nymph_of_the_Luo_River.jpg", 1600),
    ("jungjong.jpg", "King_Jungjong.jpg", 1200),
    ("jungjong-alt.jpg", "Jungjong_of_Joseon.jpg", 1200),
    ("zhengde.jpg", "Ming_Wuzong.jpg", 1200),
    ("zhengde-alt.jpg", "Zhengde_Emperor.jpg", 1200),
    ("selim.jpg", "Selim_I.jpg", 1200),
    ("chemulpo-map.jpg", "Plan_of_the_settlements_at_Chemulpo,_1884._LOC_2007631784.jpg", 1600),
    ("underwood.jpg", "Horace_Grant_Underwood.jpg", 1200),
    ("seoul-1945.jpg", "Seoul_Station_in_1945.8.15.jpg", 1400),
    ("missouri.jpg", "Surrender_of_Japan_-_USS_Missouri.jpg", 1600),
    ("korea-welcome-1945.jpg", "Korean_Welcome,_Seoul_1945.jpg", 1400),
]


def fetch(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=40) as res:
            if res.status != 200:
                return None
            return res.read()
    except Exception as exc:
        print(f"  fail {url}: {exc}")
        return None


def save_webp(data: bytes, dest: Path, max_edge: int) -> bool:
    try:
        im = Image.open(io.BytesIO(data))
        im = im.convert("RGB")
        w, h = im.size
        scale = max_edge / max(w, h)
        if scale < 1:
            im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, "WEBP", quality=78, method=6)
        print(f"  wrote {dest.name} {im.size}")
        return True
    except Exception as exc:
        print(f"  decode fail {dest.name}: {exc}")
        return False


def main() -> None:
    manifest: dict[str, str] = {}
    for dest_name, commons, edge in FILES:
        stem = dest_name.rsplit(".", 1)[0]
        out = ROOT / f"{stem}.webp"
        if out.exists() and out.stat().st_size > 4000:
            print(f"skip {out.name}")
            manifest[stem] = f"/visuals/{out.name}"
            continue
        encoded = urllib.request.quote(commons)
        url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{encoded}?width={edge}"
        print(f"get {commons}")
        data = fetch(url)
        if not data or len(data) < 2000:
            continue
        if save_webp(data, out, edge):
            manifest[stem] = f"/visuals/{out.name}"
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("done", json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
