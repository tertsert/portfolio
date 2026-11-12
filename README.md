# Portfolio

A static portfolio site with no build step, hosted on GitHub Pages.

## Edit your content
Everything lives in **`js/data.js`**:
- `SITE`: your name, role, email, socials, bio paragraphs, CV lines, and the skill buttons (`kit`).
- `WORK`: one entry per project. Each project shows up in the numbered list and as a blip on the radar.
  - `type`: `film`, `photo` or `design`.
  - `image: "images/my-file.jpg"`: the cover image. Leave it empty to get a plain numbered placeholder.
  - `video: "https://player.vimeo.com/video/ID"` or `"https://www.youtube.com/embed/ID"`: plays when the project is opened.
  - `photos: ["images/a.jpg", ...]`: for photo projects, the frames shown in the Photographs section.

Put your images in the `images/` folder.

## Preview
Open `index.html` in your browser.

## Publish
Commit and push to `main`. GitHub Pages updates the live site in about a minute.
