"""Trace the supplied logo alpha into a compact silhouette for Blender."""

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from shapely.geometry import Polygon


root = Path(__file__).resolve().parents[1]
source = root / "public" / "assets" / "players-hq" / "8it-logo.png"
destination = Path(__file__).resolve().parent / "8iT_logo_outline.json"

alpha = np.asarray(Image.open(source).convert("RGBA"), dtype=np.uint8)[:, :, 3]
height, width = alpha.shape
mask = np.where(alpha > 50, 255, 0).astype(np.uint8)
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
main = max(contours, key=cv2.contourArea)
rough_outline = cv2.approxPolyDP(main, 2.0, True)[:, 0, :].tolist()
clean_outline = Polygon(rough_outline).buffer(0).simplify(1.0, preserve_topology=True)
outline = [list(point) for point in list(clean_outline.exterior.coords)[:-1]]

destination.write_text(json.dumps({"source": str(source.relative_to(root)), "width": width, "height": height, "points": outline}), encoding="utf-8")
print(f"OUTLINE={destination} POINTS={len(outline)}")
