/* =====================================================================
   EDIT ME — all the words, links and projects on the site live here.

   Images: put files in /images, then set  image: "images/my-file.jpg"
   Video:  video: "https://player.vimeo.com/video/123456789"
           or     "https://www.youtube.com/embed/VIDEO_ID"
   Photo series: photos: ["images/a.jpg", "images/b.jpg", ...]
   Anything left empty shows a plain numbered placeholder.
   ===================================================================== */

window.SITE = {
  name: "Your Name",
  role: "Visual storyteller / Film maker",
  email: "hello@example.com",
  socials: [
    { label: "Instagram", url: "#" },
    { label: "Vimeo", url: "#" },
    { label: "YouTube", url: "#" },
  ],
  bio: [
    "I make films, photographs and graphics. I start every project with the same question: what should this feel like? Then I build the frames to get there.",
    "I've shot documentaries at salt flats and airfields, campaigns for small brands, weddings on old glass, and identities for people who make things by hand.",
    "Off the clock I'm at the airport. I hold a private pilot licence, and I still can't walk past a radar screen without stopping to look.",
  ],
  cv: [
    { year: "2026", text: "Freelance — film, photo, design" },
    { year: "2025", text: "Bloom & Co. spring campaign" },
    { year: "2024", text: "Salt Road — festival selection" },
    { year: "2023", text: "Private pilot licence" },
    { year: "2021", text: "First short documentary" },
    { year: "2019", text: "First identity commission" },
    { year: "2015", text: "First camera" },
  ],
  // The button panel in the bio section. Colors: teal, salmon, mustard, stone, sky, cream
  kit: [
    { label: "Direct", color: "teal", text: "Directing short docs, brand films and everything in between." },
    { label: "Shoot", color: "salmon", text: "Cinematography and photography. Natural light first, always." },
    { label: "Edit", color: "mustard", text: "Cutting in Premiere and Resolve. Story lives in the edit." },
    { label: "Color", color: "sky", text: "Grading for mood, not for presets." },
    { label: "Type", color: "stone", text: "Typography, posters and print. Two colors is usually enough." },
    { label: "Brand", color: "cream", text: "Identity systems for small businesses that make real things." },
    { label: "Motion", color: "teal", text: "Title sequences and motion graphics built from real textures." },
    { label: "Fly", color: "salmon", text: "Private pilot (PPL). Where I learned patience, checklists and how to read the sky." },
  ],
};

window.WORK = [
  {
    id: "salt-road", type: "film", year: 2024,
    title: "Salt Road",
    client: "Independent", role: "Director, DP, Editor", format: "Short documentary, 12 min",
    summary: "Three generations of salt harvesters working the same flats their grandparents did. Shot over four summers at the edges of the day, when the pans turn to mirrors.",
    image: "", video: "", link: "",
  },
  {
    id: "night-shift", type: "film", year: 2023,
    title: "Night Shift",
    client: "Regional arts grant", role: "Director, Camera", format: "Mini-doc, 6 min",
    summary: "The line crew who keep a small airfield running after midnight: fuel trucks, frost, flashlights and a lot of coffee.",
    image: "", video: "", link: "",
  },
  {
    id: "bloom", type: "film", year: 2025,
    title: "Bloom & Co. Spring",
    client: "Bloom & Co. Florals", role: "Director, Colorist", format: "Brand film, 60s + cutdowns",
    summary: "A spring campaign about flowers as a way of saying the thing you can't. Macro lenses, window light, one continuous take.",
    image: "", video: "", link: "",
  },
  {
    id: "two-rivers", type: "film", year: 2024,
    title: "Two Rivers",
    client: "Private", role: "Filmmaker", format: "Wedding film, 9 min",
    summary: "A riverside wedding shot entirely on vintage glass. Less highlight reel, more short film about two families becoming one.",
    image: "", video: "", link: "",
  },
  {
    id: "long-light", type: "photo", year: 2025,
    title: "Long Light",
    client: "Personal", role: "Photographer", format: "Photo series, 24 frames",
    summary: "Golden hour across the open plains: grain elevators, power lines and the last ten minutes of the day.",
    photos: [], frames: 6,
    image: "", video: "", link: "",
  },
  {
    id: "hangar", type: "photo", year: 2024,
    title: "Hangar Portraits",
    client: "Editorial", role: "Photographer", format: "Portrait series, 16 frames",
    summary: "Mechanics, instructors and weekend flyers photographed where they work. One light, one backdrop.",
    photos: [], frames: 6,
    image: "", video: "", link: "",
  },
  {
    id: "rain-grammar", type: "photo", year: 2023,
    title: "Rain Grammar",
    client: "Personal", role: "Photographer", format: "Street series, 30 frames",
    summary: "City streets in the rain, read like sentences. Reflections as punctuation, neon as the occasional exclamation.",
    photos: [], frames: 6,
    image: "", video: "", link: "",
  },
  {
    id: "fieldnotes", type: "design", year: 2025,
    title: "Fieldnotes Coffee",
    client: "Fieldnotes Roasters", role: "Identity designer", format: "Identity + packaging",
    summary: "A hand-cut wordmark, a stamp system for origins, and bags that look like a field journal you'd want to keep.",
    image: "", video: "", link: "",
  },
  {
    id: "riverlight", type: "design", year: 2024,
    title: "Riverlight Posters",
    client: "Riverlight Film Festival", role: "Graphic designer", format: "Poster series, 5 screenprints",
    summary: "Five two-color screenprints, each built from a single frame of a festival film and abstracted until only the color story remains.",
    image: "", video: "", link: "",
  },
  {
    id: "grain", type: "design", year: 2023,
    title: "Grain Titles",
    client: "Short film", role: "Motion designer", format: "Title sequence, 90s",
    summary: "Opening titles built from scanned film grain, with type that resolves like a photo in developer.",
    image: "", video: "", link: "",
  },
];
