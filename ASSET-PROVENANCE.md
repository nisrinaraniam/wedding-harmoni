# Asset provenance — Cintya & Hans / Peranakan Bloom

## Generated decorative assets

The PNG masters in the sibling `peranakan-bloom/assets` directory were created with the built-in image generation tool in this conversation. The local website uses WebP copies in `assets/`, preserving transparency and the artwork. Conversion only resized to a maximum 1200-pixel longest edge (1600 for the satin backdrop); it did not crop, recolor, or combine layers.

The collection follows the user's supplied Peranakan Bloom decor reference and semi-classic invitation screenshots. The user's final direction combines porcelain blue satin, jade green and vermilion accents, ivory/lilac stationery, small pastel floral accents, individual lanterns, and a bouquet with visible stems.

`GENERATION-PROMPTS.json` records the source mappings and generation prompts supplied for asset preparation. It contains development prompts as well as selected source files; files included by the website are listed under `assets`. `assets-info.json` records dimensions, alpha statistics, and solid-alpha bounding boxes for positioning. Large floral variants and architectural-cover experiments were excluded from the website asset set.

Every decorative object remains a separate file. The backdrop is intentionally opaque. The frame centers are genuinely transparent; the date card and tray centers are intentionally opaque.

## Reference photographs and event information

Reference URL: https://wedding-velvet.vercel.app/

At the user's request, the local prototype borrows event details and example portrait images from this reference. The sample images are not asserted to depict Cintya or Hans. Replace them with the couple's supplied photos before public use.

- `assets/photo-1.jpg`: https://wedding-velvet.vercel.app/photos/couple-1.jpg
- `assets/photo-2.jpg`: https://wedding-velvet.vercel.app/photos/couple-2.jpg

No ownership or license claim is made for these reference photos; reuse here follows the user's instruction for the local design prototype.

## Typography

Font families: Pinyon Script and Cormorant Garamond, distributed by Google Fonts. The local stylesheet is `assets/fonts/fonts.css`; font binaries are numbered `font-*.woff2` (or the format returned by Google Fonts). Their upstream SIL Open Font License files are saved alongside the fonts as `pinyonscript-OFL.txt` and `cormorantgaramond-OFL.txt`.

- https://fonts.google.com/specimen/Pinyon+Script
- https://fonts.google.com/specimen/Cormorant+Garamond
- https://github.com/google/fonts/tree/main/ofl/pinyonscript
- https://github.com/google/fonts/tree/main/ofl/cormorantgaramond

The downloader runs from `work/download-site-fonts-photos.py`; the primary agent completes network downloads because the asset-preparation worker does not inherit the primary turn's network grant.

## Keepsake pearl strand

`assets/15-keepsake-pearls.webp` is a separate generated ivory pearl strand with a champagne clasp, converted from its PNG master with transparency preserved. Its generation prompt and source mapping are included in `GENERATION-PROMPTS.json`.


Hanging support ornaments (jade-gold rails, rosettes, cords) are original CSS geometry, attached to all six lantern/knot placements. Hero uses the same generated blue satin asset as the cover.
