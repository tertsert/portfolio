(() => {
  const SITE = window.SITE || {};
  const WORK = window.WORK || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TYPE_LABEL = { film: "Film", photo: "Photo", design: "Design" };
  const TYPE_ABBR = { film: "FLM", photo: "PHO", design: "DSN" };

  // ---------- site fields ----------
  $$("[data-site]").forEach((el) => {
    const v = SITE[el.dataset.site];
    if (v) el.textContent = v;
  });
  $("#year").textContent = new Date().getFullYear();

  // poster / placeholder art
  function poster(p, extra = "", label = p.id) {
    const style = p.image
      ? `background-image:url('${esc(p.image)}')`
      : `--h:${p.hue ?? 30}`;
    return `<div class="poster ${p.image ? "has-img" : ""} ${extra}" style="${style}">${p.image ? "" : `<span>${esc(label)}</span>`}</div>`;
  }

  // ---------- UTC clock + METAR ticker ----------
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const d = new Date();
    $("#utc").textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }
  tick(); setInterval(tick, 1000);
  (function metar() {
    const d = new Date();
    const stamp = `${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}Z`;
    const counts = WORK.reduce((a, p) => ((a[p.type] = (a[p.type] || 0) + 1), a), {});
    const items = [
      `METAR ${SITE.base || "KSTY"} ${stamp} 24008KT P6SM FEW045 SCT250 19/08 A3001 RMK CREATIVE CAVOK`,
      `TFC ${WORK.length} TGTS — FLM ${counts.film || 0} · PHO ${counts.photo || 0} · DSN ${counts.design || 0}`,
      `NOTAM: NOW BOOKING FILM, PHOTO & DESIGN PROJECTS`,
      `GOLDEN HR EXPECTED ±1HR SUNSET`,
      `ATIS INFO STORY: SAY INTENTIONS ON FREQ ${SITE.email || ""}`.trim(),
    ];
    const run = items.map((t) => `<span>${esc(t)}</span>`).join("<i>✦</i>");
    $("#metar").innerHTML = `<div>${run}<i>✦</i></div><div aria-hidden="true">${run}<i>✦</i></div>`;
  })();

  // ---------- hero traffic list ----------
  const tl = $("#traffic-list");
  tl.innerHTML = WORK.map((p) => `
    <li><button class="tfc ${p.type}" data-id="${esc(p.id)}">
      <span class="tfc-id">${esc(p.id)}</span>
      <span class="tfc-blk">${TYPE_ABBR[p.type]}${String(p.year).slice(-2)} ${esc(p.kind || "")}</span>
      <span class="tfc-title">${esc(p.title)}</span>
    </button></li>`).join("");
  $("#traffic-count").textContent = `${WORK.length} tgts`;
  tl.addEventListener("click", (e) => { const b = e.target.closest(".tfc"); if (b) openStrip(b.dataset.id); });
  tl.addEventListener("pointerover", (e) => { const b = e.target.closest(".tfc"); window.Scope?.focus(b ? b.dataset.id : null); });
  tl.addEventListener("pointerleave", () => window.Scope?.focus(null));
  tl.addEventListener("focusin", (e) => { const b = e.target.closest(".tfc"); window.Scope?.focus(b?.dataset.id); });
  tl.addEventListener("focusout", () => window.Scope?.focus(null));

  // ---------- console ----------
  $$(".console .key").forEach((k) => k.addEventListener("click", () => {
    const S = window.Scope; if (!S) return;
    if (k.dataset.filter) {
      const on = !k.classList.contains("on");
      k.classList.toggle("on", on); k.setAttribute("aria-pressed", on);
      S.setFilter(k.dataset.filter, on);
    } else if (k.dataset.act === "ident") {
      S.ident(); k.classList.add("flash"); setTimeout(() => k.classList.remove("flash"), 2200);
    } else if (k.dataset.act === "pause") {
      const p = S.togglePause(); k.classList.toggle("on", p); k.setAttribute("aria-pressed", p);
      $("#ro-swp").textContent = p ? "SWP HOLD" : "SWP 6.0s";
    } else if (k.dataset.act === "hist") {
      const h = S.toggleHist(); k.classList.toggle("on", h); k.setAttribute("aria-pressed", h);
    }
  }));

  // ---------- strip bay ----------
  const BAYS = [
    { type: "film", name: "Bay 1", label: "Film & video" },
    { type: "photo", name: "Bay 2", label: "Photography" },
    { type: "design", name: "Bay 3", label: "Graphic design" },
  ];
  function stripHTML(p, i) {
    const tilt = ((i * 37) % 7) - 3;
    return `
    <li class="strip ${p.type}" draggable="true" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="Open ${esc(p.title)}">
      <span class="s-band"></span>
      <span class="s-cell s-call"><b>${esc(p.id)}</b><small>${TYPE_ABBR[p.type]}/${esc(p.kind || "")}</small></span>
      <span class="s-cell s-main"><span class="s-title">${esc(p.title)}</span><small>${esc(p.role)} · ${esc(p.client)}</small></span>
      <span class="s-cell s-fmt"><small>${esc(p.format)}</small></span>
      <span class="s-cell s-yr"><b>${esc(p.year)}</b>${p.note ? `<em style="--r:${tilt}deg">${esc(p.note)}</em>` : ""}</span>
      <span class="s-cell s-thumb">${poster(p, "sm")}</span>
      <span class="s-grip" aria-hidden="true">⋮⋮</span>
    </li>`;
  }
  $("#bays").innerHTML = BAYS.map((b) => {
    const items = WORK.filter((p) => p.type === b.type);
    if (!items.length) return "";
    return `<div class="bay reveal ${b.type}">
      <div class="bay-head"><span class="bay-name">${b.name}</span><span class="bay-label">${b.label}</span><span class="bay-n">${String(items.length).padStart(2, "0")}</span></div>
      <ul class="strips">${items.map(stripHTML).join("")}</ul>
    </div>`;
  }).join("");

  // click / keyboard open
  $("#bays").addEventListener("click", (e) => { const s = e.target.closest(".strip"); if (s && !dragged) openStrip(s.dataset.id); });
  $("#bays").addEventListener("keydown", (e) => {
    const s = e.target.closest(".strip");
    if (s && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openStrip(s.dataset.id); }
  });

  // drag to re-sequence within a bay
  let dragEl = null, dragged = false;
  $$(".strips").forEach((list) => {
    list.addEventListener("dragstart", (e) => {
      dragEl = e.target.closest(".strip"); dragged = true;
      dragEl.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragEl.dataset.id);
    });
    list.addEventListener("dragend", () => {
      dragEl?.classList.remove("dragging"); dragEl = null;
      setTimeout(() => (dragged = false), 50);
    });
    list.addEventListener("dragover", (e) => {
      if (!dragEl || dragEl.parentElement !== list) return;
      e.preventDefault();
      const after = [...list.querySelectorAll(".strip:not(.dragging)")].find((s) => {
        const r = s.getBoundingClientRect(); return e.clientY < r.top + r.height / 2;
      });
      after ? list.insertBefore(dragEl, after) : list.appendChild(dragEl);
    });
  });

  // ---------- contact sheet ----------
  const photoSets = WORK.filter((p) => p.type === "photo");
  let frameNo = 1;
  $("#sheet").innerHTML = photoSets.map((p) => {
    const srcs = p.photos && p.photos.length ? p.photos : Array.from({ length: p.frames || 6 }, () => "");
    const frames = srcs.map((src, i) => {
      const n = frameNo++;
      const h = (p.hue ?? 30) + ((i * 23) % 50) - 25;
      const light = 30 + ((i * 17) % 30);
      const bg = src ? `background-image:url('${esc(src)}')` : `--h:${h};--l:${light}%`;
      return `<button class="frame ${i === p.pick ? "picked" : ""}" data-set="${esc(p.id)}" data-i="${i}" aria-label="${esc(p.title)}, frame ${i + 1}">
        <span class="frame-img ${src ? "has-img" : ""}" style="${bg}"></span>
        <span class="edge">${n}<b>▸</b>${n}A</span>
        <svg class="grease" viewBox="0 0 100 80" aria-hidden="true"><path d="M50 6 C82 4 96 24 94 42 C92 64 70 76 46 74 C20 72 4 58 6 38 C8 18 30 6 58 8" pathLength="1"/></svg>
      </button>`;
    }).join("");
    return `<div class="film-row">
      <div class="film-label"><span class="pencil">${esc(p.title)}</span><small>${esc(p.id)} · ${esc(p.year)} · ${esc(p.format)}</small><button class="link" data-open="${esc(p.id)}">Read the strip →</button></div>
      <div class="filmstrip"><div class="film-frames">${frames}</div></div>
    </div>`;
  }).join("");

  const lb = $("#lightbox");
  $("#sheet").addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) return openStrip(o.dataset.open);
    const f = e.target.closest(".frame");
    if (!f) return;
    const p = WORK.find((w) => w.id === f.dataset.set);
    const i = +f.dataset.i;
    const src = p.photos?.[i];
    $("#lb-frame").innerHTML = src
      ? `<img src="${esc(src)}" alt="${esc(p.title)}, frame ${i + 1}">`
      : `<div class="poster big" style="--h:${(p.hue ?? 30) + ((i * 23) % 50) - 25}"><span>${esc(p.id)} · ${i + 1}</span></div>`;
    $("#lb-cap").textContent = `${p.title} — frame ${i + 1} of ${(p.photos?.length || p.frames)}`;
    lb.showModal();
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest("[data-close]")) lb.close(); });

  // ---------- logbook ----------
  const rows = SITE.logbook || [];
  $("#log-rows").innerHTML = rows.map((r) => `
    <tr><td>${esc(r.date)}</td><td>${esc(r.aircraft)}</td><td class="route">${esc(r.route)}</td><td class="remarks">${esc(r.remarks)}</td><td class="num">${r.hours == null ? "∞" : esc(r.hours)}</td></tr>`).join("");
  const total = rows.reduce((a, r) => a + (r.hours || 0), 0);
  $("#log-total").textContent = rows.some((r) => r.hours == null) ? `${total.toLocaleString()}+` : total.toLocaleString();

  // ---------- socials ----------
  $("#socials").innerHTML = (SITE.socials || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("");

  // ---------- strip drawer ----------
  const drawer = $("#drawer"), scrim = $("#scrim"), body = $("#d-body");
  let current = -1, lastFocus = null;

  function media(p) {
    if (p.video) return `<div class="d-media video"><iframe src="${esc(p.video)}" title="${esc(p.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    if (p.type === "photo" && p.photos?.length) {
      return `<div class="d-media gallery">${p.photos.map((s, i) => `<img src="${esc(s)}" alt="${esc(p.title)} ${i + 1}" loading="lazy">`).join("")}</div>`;
    }
    return `<div class="d-media">${poster(p, "big")}</div>`;
  }

  function openStrip(id) {
    const i = WORK.findIndex((p) => p.id === id);
    if (i < 0) return;
    current = i;
    const p = WORK[i];
    body.innerHTML = `
      <div class="d-strip ${p.type}">
        <span class="s-band"></span>
        <div class="d-cell"><small>Callsign</small><b>${esc(p.id)}</b></div>
        <div class="d-cell"><small>Type</small><b>${TYPE_LABEL[p.type]}/${esc(p.kind || "")}</b></div>
        <div class="d-cell"><small>Year</small><b>${esc(p.year)}</b></div>
        ${p.note ? `<em class="d-note">${esc(p.note)}</em>` : ""}
      </div>
      ${media(p)}
      <h3 id="d-title">${esc(p.title)}</h3>
      <p class="d-format">${esc(p.format)}</p>
      <p class="d-summary">${esc(p.summary)}</p>
      <dl class="d-meta">
        <div><dt>Client</dt><dd>${esc(p.client)}</dd></div>
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        ${p.tools?.length ? `<div><dt>Kit</dt><dd>${p.tools.map(esc).join(" · ")}</dd></div>` : ""}
      </dl>
      ${p.link ? `<a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">View project ↗</a>` : ""}
      <p class="d-pos">TFC ${i + 1} / ${WORK.length}</p>`;
    if (drawer.getAttribute("aria-hidden") === "true") lastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(() => { scrim.classList.add("on"); drawer.classList.add("open"); });
    drawer.setAttribute("aria-hidden", "false");
    drawer.scrollTop = 0;
    document.body.classList.add("locked");
    drawer.focus({ preventScroll: true });
  }
  function closeStrip() {
    drawer.classList.remove("open"); scrim.classList.remove("on");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    setTimeout(() => (scrim.hidden = true), 300);
    lastFocus?.focus?.({ preventScroll: true });
  }
  window.openStrip = openStrip;
  $("#d-close").addEventListener("click", closeStrip);
  scrim.addEventListener("click", closeStrip);
  $("#d-prev").addEventListener("click", () => openStrip(WORK[(current - 1 + WORK.length) % WORK.length].id));
  $("#d-next").addEventListener("click", () => openStrip(WORK[(current + 1) % WORK.length].id));
  document.addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("open")) return;
    if (e.key === "Escape") closeStrip();
    if (e.key === "ArrowRight") $("#d-next").click();
    if (e.key === "ArrowLeft") $("#d-prev").click();
  });

  // ---------- radio / clearance form ----------
  const form = $("#clearance"), rb = $("#readback");
  let typing = null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const missing = ["name", "email", "msg"].filter((k) => !String(f[k] || "").trim());
    $$("input, textarea", form).forEach((el) => el.classList.toggle("bad", missing.includes(el.name)));
    if (missing.length || !form.email.checkValidity()) {
      rb.textContent = "Station calling, say again — callsign, frequency and intentions required.";
      rb.className = "readback full err";
      return;
    }
    const squawk = Array.from({ length: 4 }, () => Math.floor(Math.random() * 8)).join("");
    const call = f.name.trim().split(/\s+/)[0];
    const text = `${call}, ${SITE.callsign || "N-STORY"}. Radar contact. Cleared for ${f.type.toLowerCase()}, climb and maintain creativity, squawk ${squawk}. Opening your email now…`;
    rb.className = "readback full ok";
    rb.textContent = "";
    clearInterval(typing);
    let n = 0;
    typing = setInterval(() => {
      rb.textContent = text.slice(0, ++n);
      if (n >= text.length) {
        clearInterval(typing);
        const subject = `Clearance request: ${f.type} — ${f.name}`;
        const bodyTxt = `${f.msg}\n\n— ${f.name}\n${f.email}`;
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTxt)}`;
      }
    }, 22);
    const fr = $("#freq");
    fr.classList.add("tx");
    setTimeout(() => fr.classList.remove("tx"), 1800);
  });

  // ---------- reveal on scroll ----------
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  // active nav
  const navLinks = $$(".nav a");
  const so = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main > section").forEach((s) => so.observe(s));
})();
