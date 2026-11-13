# Portfolio

A static portfolio site with no build step, hosted on GitHub Pages.

## Edit your content
Everything lives in **`js/data.js`**:
- `SITE`: your name, role, email, socials, bio paragraphs, CV lines, and the skill buttons (`kit`).
- `WORK`: one entry per project. Each project shows up in the numbered list and as a blip on the radar.
  - `type`: `film`, `photo` or `design`.
  - `image: "images/my-file.jpg"`: the cover image. Leave it empty to get a plain numbered placeholder.
  - `video: "https://player.vimeo.com/video/ID"` or `"https://www.youtube.com/embed/ID"`: plays when the project is opened.
  - `photos: ["images/a.jpg", ...]`: the images shown for that project in the gallery section (any type).

Put your images in the `images/` folder.

## Preview
Open `index.html` in your browser.

## Publish
Commit and push to `main`. GitHub Pages updates the live site in about a minute.

## Making browsers pick up changes
Browsers keep copies of `css/style.css` and the `js/` files for a while, so visitors (and you) can see an old version after an update. In `index.html`, each of those links ends in a version tag such as `?v=2026-11-13b`. When you change CSS or JS, update that date (all four links) and browsers will load the new files straight away. Changes to `index.html` itself don't need this.
