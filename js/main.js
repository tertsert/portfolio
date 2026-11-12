(() => {
  const SITE = window.SITE || {};
  const WORK = window.WORK || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (i) => String(i + 1).padStart(2, "0");

  // ---------- simple fields ----------
  $$("[data-site]").forEach((el) => { if (SITE[el.dataset.site]) el.textContent = SITE[el.dataset.site]; });
  $("#year").textContent = new Date().getFullYear();
  const years = WORK.map((p) => p.year);
  if (years.length) $("#range").textContent = `${Math.min(...years)} → ${Math.max(...years)}`;

  function art(p, i, big = true) {
    if (p.image) return `<img class="cover" src="${esc(p.image)}" alt="${esc(p.title)}">`;
    return `<div class="ph ${p.type}"><span>${esc(p.type)}</span><b>${num(i)}</b></div>`;
  }

  // ---------- project index ----------
  const list = $("#list");
  list.innerHTML = WORK.map((p, i) => `
    <li class="row ${p.type}" data-id="${esc(p.id)}" data-type="${p.type}">
      <button class="row-head" aria-expanded="false" aria-controls="b-${esc(p.id)}">
        <span class="n">${i + 1}.</span>
        <span class="t">${esc(p.title)}</span>
        <span class="k">${esc(p.type)}</span>
        <span class="y">${esc(p.year)}</span>
      </button>
      <div class="row-body" id="b-${esc(p.id)}" hidden>
        <div>${p.video
          ? `<div class="video"><iframe src="${esc(p.video)}" title="${esc(p.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
          : art(p, i)}</div>
        <div>
          <p>${esc(p.summary)}</p>
          <dl>
            <dt>Format</dt><dd>${esc(p.format)}</dd>
            <dt>Role</dt><dd>${esc(p.role)}</dd>
            <dt>Client</dt><dd>${esc(p.client)}</dd>
          </dl>
          ${p.link ? `<a class="more" href="${esc(p.link)}" target="_blank" rel="noopener">See the full project →</a>` : ""}
          ${p.type === "photo" ? `<a class="more" href="#photos">See the frames →</a>` : ""}
        </div>
      </div>
    </li>`).join("");

  function toggle(id, force) {
    const row = list.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (!row) return;
    const open = force ?? !row.classList.contains("open");
    row.classList.toggle("open", open);
    row.querySelector(".row-body").hidden = !open;
    row.querySelector(".row-head").setAttribute("aria-expanded", open);
    return row;
  }
  list.addEventListener("click", (e) => {
    const head = e.target.closest(".row-head");
    if (head) { toggle(head.parentElement.dataset.id); peek.classList.remove("on"); }
  });

  // hover links the list and the radar both ways
  function setHot(id) {
    $$(".row.hot", list).forEach((r) => r.classList.remove("hot"));
    if (id) list.querySelector(`[data-id="${CSS.escape(id)}"]`)?.classList.add("hot");
    window.Scope?.highlight(id);
  }
  list.addEventListener("pointerover", (e) => { const r = e.target.closest(".row"); if (r) window.Scope?.highlight(r.dataset.id); });
  list.addEventListener("pointerleave", () => window.Scope?.highlight(null));
  list.addEventListener("focusin", (e) => { const r = e.target.closest(".row"); if (r) window.Scope?.highlight(r.dataset.id); });
  if (window.Scope) {
    window.Scope.onHover = setHot;
    window.Scope.onClick = (id) => {
      const row = toggle(id, true);
      row?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }

  // filters
  $$(".filters .tag").forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.f;
    $$(".filters .tag").forEach((x) => x.classList.toggle("on", x === b));
    $$(".row", list).forEach((r) => (r.hidden = f !== "all" && r.dataset.type !== f));
    window.Scope?.filter(f);
  }));

  // image preview that follows the cursor over the list
  const peek = $("#peek");
  let peekId = null;
  list.addEventListener("pointermove", (e) => {
    const r = e.target.closest(".row");
    const head = e.target.closest(".row-head");
    if (!r || !head || r.classList.contains("open")) { peek.classList.remove("on"); return; }
    if (peekId !== r.dataset.id) {
      peekId = r.dataset.id;
      const i = WORK.findIndex((p) => p.id === peekId);
      peek.innerHTML = art(WORK[i], i);
    }
    peek.classList.add("on");
    peek.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 90}px) rotate(-2deg)`;
  });
  list.addEventListener("pointerleave", () => peek.classList.remove("on"));

  // ---------- photo series ----------
  const TONES = ["mustard", "sky", "salmon", "teal", "cream", "stone"];
  const sets = WORK.filter((p) => p.type === "photo");
  $("#series").innerHTML = sets.map((p, si) => {
    const srcs = p.photos?.length ? p.photos : Array.from({ length: p.frames || 6 }, () => "");
    return `<div class="series">
      <div>
        <p class="series-name"><b>${si + 1}.</b>${esc(p.title)}</p>
        <p class="series-meta">${esc(p.format)}<br>${esc(p.year)}</p>
      </div>
      <div class="frames">${srcs.map((src, i) => `
        <button class="frame" data-set="${esc(p.id)}" data-i="${i}" aria-label="${esc(p.title)}, frame ${i + 1}">
          ${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<div class="ph" style="--c:var(--${TONES[(si * 2 + i) % TONES.length]})"><span></span><b>${i + 1}.</b></div>`}
        </button>`).join("")}
      </div>
    </div>`;
  }).join("");

  const lb = $("#lightbox");
  $("#series").addEventListener("click", (e) => {
    const f = e.target.closest(".frame");
    if (!f) return;
    const p = WORK.find((w) => w.id === f.dataset.set);
    const i = +f.dataset.i;
    const src = p.photos?.[i];
    $("#lb-img").innerHTML = src ? `<img src="${esc(src)}" alt="${esc(p.title)}, frame ${i + 1}">` : `<div class="ph photo"><span>${esc(p.title)}</span><b>${i + 1}.</b></div>`;
    $("#lb-cap").textContent = `${p.title} — ${i + 1} / ${p.photos?.length || p.frames}`;
    lb.showModal();
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest("[data-close]")) lb.close(); });

  // ---------- bio, cv, button panel ----------
  $("#bio-text").innerHTML = (SITE.bio || []).map((t) => `<p>${esc(t)}</p>`).join("");
  $("#cv").innerHTML = (SITE.cv || []).map((r) => `<li><span>${esc(r.year)}</span>${esc(r.text)}</li>`).join("");

  const lcd = $("#lcd");
  let typing;
  $("#kit").innerHTML = (SITE.kit || []).map((k, i) => `<button class="btn-key ${esc(k.color)}" data-i="${i}">${esc(k.label)}</button>`).join("");
  $("#kit").addEventListener("click", (e) => {
    const b = e.target.closest(".btn-key");
    if (!b) return;
    $$(".btn-key").forEach((x) => x.classList.toggle("down", x === b));
    const text = SITE.kit[+b.dataset.i].text;
    clearInterval(typing);
    let n = 0;
    typing = setInterval(() => { lcd.textContent = text.slice(0, ++n); if (n >= text.length) clearInterval(typing); }, 18);
  });

  // ---------- contact ----------
  const mail = $("#mail");
  mail.textContent = SITE.email;
  mail.href = `mailto:${SITE.email}`;
  $("#copy").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(SITE.email); e.target.textContent = "Copied ✓"; }
    catch { e.target.textContent = "Select it ↑"; }
    setTimeout(() => (e.target.textContent = "Copy"), 1800);
  });
  $("#socials").innerHTML = (SITE.socials || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("");
})();
