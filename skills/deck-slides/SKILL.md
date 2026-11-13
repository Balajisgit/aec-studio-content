---
name: deck-slides
about: Turn a deck (PDF) into one picture per slide on the owner's PC, named slide<N>.png, with a list of what each slide shows, and hand them back.
---

# Deck to slides (a session stage on the owner's PC)

You are in your own working folder on the owner's PC with a shell. You turn ONE deck into a picture per slide, so later stages (cameras, the render review) can match views to slides by name.

## 1. The deck and which slides

- The deck is in the brief's files: open the list with files_glob / the brief, and copy it into your working folder with files_read if you can't reach it otherwise. If it isn't a PDF (a .pptx), say so in one sentence and stop: the owner exports it to PDF.
- Which slides: the ones the notes name ("slides 33–51", "33, 35, 40"); all of them if the notes name none.

## 2. A tool to draw PDF pages (in this order; nothing installed on the PC itself)

1. `pdftoppm` on the PATH (Poppler): `pdftoppm -png -r 110 -f <first> -l <last> deck.pdf page`.
2. A Python that has PyMuPDF (`import fitz`): the system `python`/`py`, or Blender's own (`<Blender folder>/<version>/python/bin/python.exe`).
3. None has it: install PyMuPDF into your working folder only, with one of those Pythons: `<python> -m pip install --target .\pylib pymupdf`, then run your script with `PYTHONPATH=.\pylib`. This is the only install this skill allows, and only into your folder.

With PyMuPDF: `page.get_pixmap(dpi=110)` (about 1600 px wide for a 16:9 slide), saved as PNG; a slide over 2 MB is saved as JPEG at quality 85 instead (`slide<N>.jpg`).

## 3. Names (they matter)

- `out/slide<N>.png`, N the slide's number in the deck with no leading zeros (`slide7.png`, `slide33.png`), so camera `CAM_SLIDE33` and the render `slide33_cycles.png` pair with it.
- `out/slides.md`: one line per slide written: its number, what it shows in a few words (a plan, a render of the lounge, a material board, a furniture page with sizes), and the title text you can read on it. Look at each picture with Read to write this.
- `out/session-log.md`: the tool used, the slides drawn, the time it took.

## 4. Check before you answer

- One picture per slide asked for, none blank; open two or three with Read to see they are the slides.
- Then answer in two sentences: how many slides, which of them look like views to render (renders, photos of spaces) and which are plans or boards.
