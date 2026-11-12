# Radar portfolio

A static portfolio site styled like an ATC radar scope. There is no build step, so it runs as-is on GitHub Pages.

## Edit your content
Everything lives in **`js/data.js`**:
- `SITE`: name, callsign, intro, email, socials and logbook rows.
- `WORK`: one entry per project. Each entry becomes a radar target, a flight strip in the Strip Bay and, for `type: "photo"`, a row on the contact sheet.
  - `image: "images/whatever.jpg"`: the cover image. Leave it blank and a generated placeholder is used instead.
  - `video: "https://player.vimeo.com/video/ID"` or `"https://www.youtube.com/embed/ID"`: plays inside the strip drawer.
  - `photos: ["images/a.jpg", ...]`: the frames shown on the contact sheet. `pick` is the index of the frame that gets the red circle.
  - `type` must be `film`, `photo` or `design`. `kind` is the short 3–4 letter tag shown in the data block.

Put your images in `/images`.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy to GitHub Pages
1. Push this folder to a GitHub repo. Use `<username>.github.io` for a root URL, or any repo name for `/<repo>/`.
2. In the repo, go to **Settings → Pages → Build and deployment**, choose *Deploy from a branch*, then pick `main` and `/ (root)`.
3. Wait about a minute for the site to go live.

`.nojekyll` is included so GitHub serves the files exactly as they are.
