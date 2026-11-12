/* =====================================================================
   EDIT ME — everything on the site is driven from this file.
   - SITE: your name, contact, socials, logbook entries
   - WORK: every project. Each one becomes a radar target, a flight
     strip, and (for photo series) a row on the contact sheet.

   Images: drop files in /images and set `image: "images/salt-road.jpg"`.
   Video:  set `video` to an embeddable URL, e.g.
           "https://player.vimeo.com/video/123456789"
           "https://www.youtube.com/embed/VIDEO_ID"
   Photo series: set `photos: ["images/a.jpg", "images/b.jpg", ...]`.
   Anything left blank falls back to a generated placeholder (uses `hue`).
   ===================================================================== */

window.SITE = {
  name: "Your Name",
  callsign: "N-STORY",            // shown top-left, like a tail number
  base: "KSTY",                   // your "home airport" for the METAR ticker
  title: "Visual Storyteller & Creative Film Maker",
  intro:
    "I read light the way pilots read weather: watch it, wait for it, and fly straight into it when it's right. I direct films, shoot photographs and design identities, and every frame has to know where it's headed.",
  email: "hello@example.com",
  location: "Based on the ground. Available anywhere.",
  socials: [
    { label: "Instagram", url: "#" },
    { label: "Vimeo", url: "#" },
    { label: "YouTube", url: "#" },
    { label: "Behance", url: "#" },
  ],
  // Pilot-logbook style "about" — one row per chapter of your story.
  logbook: [
    { date: "2015", aircraft: "Hand-me-down DSLR", route: "HOME → BACKYARD", remarks: "First frames. Mostly blur, three keepers. Hooked.", hours: 40 },
    { date: "2017", aircraft: "50mm prime", route: "CAMPUS → LOCAL GIGS", remarks: "Shot bands in bad light. Learned to love grain.", hours: 220 },
    { date: "2019", aircraft: "Pen, paper, Adobe", route: "FREELANCE → SMALL BRANDS", remarks: "First paid identity. Learned that design is listening.", hours: 610 },
    { date: "2021", aircraft: "Cinema camera", route: "DOC → FESTIVAL CIRCUIT", remarks: "First short doc screened. Cried in the back row.", hours: 940 },
    { date: "2023", aircraft: "Cessna 172", route: "LOCAL VFR", remarks: "Earned my PPL. Checklists, patience, and reading the sky.", hours: 72 },
    { date: "NOW", aircraft: "All of the above", route: "ANYWHERE → YOUR STORY", remarks: "Films, photographs and design for people, brands and places.", hours: null },
  ],
};

window.WORK = [
  /* ---------------- FILM ---------------- */
  {
    id: "SALT24", type: "film", kind: "DOC", year: 2024, hue: 28,
    title: "Salt Road",
    client: "Independent",
    role: "Director · DP · Editor",
    format: "Short documentary · 12 min",
    summary:
      "Three generations of salt harvesters working the same flats their grandparents did. Shot over four summers at the edges of the day, when the pans turn to mirrors.",
    tools: ["Cinema camera", "Vintage primes", "DaVinci Resolve"],
    note: "golden hr ✓",
    image: "", video: "", link: "",
  },
  {
    id: "NITE23", type: "film", kind: "DOC", year: 2023, hue: 210,
    title: "Night Shift",
    client: "Regional arts grant",
    role: "Director · Camera",
    format: "Mini-doc · 6 min",
    summary:
      "The line crew who keep a small airfield running after midnight: fuel trucks, frost, flashlights and a lot of coffee. A love letter to the people nobody films.",
    tools: ["Low-light rig", "Practical lighting", "Premiere"],
    note: "fuel truck shot!!",
    image: "", video: "", link: "",
  },
  {
    id: "BLOOM25", type: "film", kind: "SPOT", year: 2025, hue: 340,
    title: "Bloom & Co. — Spring",
    client: "Bloom & Co. Florals",
    role: "Director · Colorist",
    format: "Brand film · 60s + cutdowns",
    summary:
      "A spring campaign built around one idea: flowers as a way of saying the thing you can't. Macro lenses, window light, and a single continuous take for the hero spot.",
    tools: ["Macro", "Gimbal", "Resolve"],
    note: "client fav",
    image: "", video: "", link: "",
  },
  {
    id: "VOWS24", type: "film", kind: "WED", year: 2024, hue: 45,
    title: "Two Rivers",
    client: "Private",
    role: "Filmmaker",
    format: "Wedding film · 9 min",
    summary:
      "A riverside wedding shot entirely on vintage glass with a 16mm look. Less highlight reel, more short film about two families becoming one.",
    tools: ["Vintage glass", "Super 16 emulation"],
    note: "16mm look",
    image: "", video: "", link: "",
  },

  /* ---------------- PHOTO ---------------- */
  {
    id: "DUSK25", type: "photo", kind: "SER", year: 2025, hue: 22,
    title: "Long Light",
    client: "Personal series",
    role: "Photographer",
    format: "Photo series · 24 frames",
    summary:
      "Golden hour across the open plains: grain elevators, power lines, and the last ten minutes of the day stretched as long as they'll go.",
    tools: ["35mm", "Medium format"],
    note: "print these",
    photos: [], frames: 8, pick: 2,
    image: "", video: "", link: "",
  },
  {
    id: "HANGR24", type: "photo", kind: "PORT", year: 2024, hue: 190,
    title: "Hangar Portraits",
    client: "Editorial",
    role: "Photographer",
    format: "Portrait series · 16 frames",
    summary:
      "Mechanics, instructors and weekend flyers photographed where they work. One light, one backdrop, a lot of grease under the fingernails.",
    tools: ["Single strobe", "85mm"],
    note: "hands!",
    photos: [], frames: 7, pick: 4,
    image: "", video: "", link: "",
  },
  {
    id: "RAIN23", type: "photo", kind: "STRT", year: 2023, hue: 255,
    title: "Rain Grammar",
    client: "Personal series",
    role: "Photographer",
    format: "Street series · 30 frames",
    summary:
      "City streets in the rain, read like sentences: reflections as punctuation, umbrellas as commas, neon as the occasional exclamation.",
    tools: ["35mm", "Night"],
    note: "neon ✓",
    photos: [], frames: 8, pick: 5,
    image: "", video: "", link: "",
  },

  /* ---------------- DESIGN ---------------- */
  {
    id: "FIELD25", type: "design", kind: "BRND", year: 2025, hue: 95,
    title: "Fieldnotes Coffee",
    client: "Fieldnotes Roasters",
    role: "Identity Designer",
    format: "Brand identity · packaging",
    summary:
      "Identity for a small-batch roaster: a hand-cut wordmark, a stamp system for origins, and bags designed to look like a field journal you'd want to keep.",
    tools: ["Illustrator", "Letterpress"],
    note: "stamp system",
    image: "", video: "", link: "",
  },
  {
    id: "FEST24", type: "design", kind: "PRNT", year: 2024, hue: 12,
    title: "Festival Poster Series",
    client: "Riverlight Film Festival",
    role: "Graphic Designer",
    format: "Poster series · 5 posters",
    summary:
      "Five screen-printed posters for a small film festival. Each one is built from a single frame of a festival film, abstracted until only the color story remains.",
    tools: ["Screenprint", "Photoshop"],
    note: "2-color only",
    image: "", video: "", link: "",
  },
  {
    id: "GRAIN23", type: "design", kind: "MOTN", year: 2023, hue: 300,
    title: "Grain — Title Sequence",
    client: "Short film",
    role: "Motion Designer",
    format: "Title sequence · 90s",
    summary:
      "Opening titles built from scanned film grain and type that resolves like a photo in developer: blurry, then suddenly, perfectly sharp.",
    tools: ["After Effects", "Film scans"],
    note: "type in dev bath",
    image: "", video: "", link: "",
  },
];
