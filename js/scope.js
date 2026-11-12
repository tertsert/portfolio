/* Radar scope — every project in WORK becomes a target.
   Targets only "update" when the sweep passes them, like a real
   primary radar, leaving history dots behind. */
(() => {
  const canvas = document.getElementById("scope");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;
  const TAU = Math.PI * 2;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PERIOD = 6;      // seconds per sweep
  const MAX_NM = 40;     // outer ring range
  const FONT = '500 11px "IBM Plex Mono", ui-monospace, monospace';
  const FONT_B = '600 11px "IBM Plex Mono", ui-monospace, monospace';

  const TYPE = {
    film:   { c: "#ffb347", abbr: "FLM" },
    photo:  { c: "#6fd6d0", abbr: "PHO" },
    design: { c: "#ee8ad8", abbr: "DSN" },
  };

  // Waypoints in normalized scope coords (-1..1). Ones with href are navigation.
  const WPTS = {
    FOCUS: { x: 0.06, y: -0.80 },
    STRIP: { x: 0.40, y: -0.46, href: "#work", label: "STRIP BAY" },
    APRTR: { x: 0.80, y: -0.30 },
    RADIO: { x: 0.62, y: 0.22, href: "#radio", label: "RADIO" },
    GRAIN: { x: -0.30, y: -0.30 },
    LUMEN: { x: -0.78, y: -0.18 },
    FRAME: { x: -0.56, y: 0.34, href: "#frames", label: "CONTACT SHEET" },
    SHUTR: { x: -0.16, y: 0.78 },
    LOGBK: { x: 0.24, y: 0.58, href: "#logbook", label: "LOGBOOK" },
  };
  const AIRWAYS = [
    ["FOCUS", "STRIP", "RADIO", "LOGBK", "SHUTR"],
    ["LUMEN", "GRAIN", "STRIP", "APRTR"],
    ["GRAIN", "FOCUS"],
    ["GRAIN", "FRAME", "SHUTR"],
    ["FRAME", "LOGBK"],
  ];
  const wptList = Object.entries(WPTS).map(([name, w]) => ({ name, ...w, rect: null }));

  // ---------- seeded random so layout is stable per project ----------
  function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  // ---------- targets ----------
  const SECTOR = { film: -0.95, photo: 1.95, design: 3.55 }; // screen-angle centers
  const targets = (window.WORK || []).map((p) => {
    const r = seeded(p.id);
    const a = (SECTOR[p.type] ?? 0) + (r() - 0.5) * 1.25;
    const d = 0.3 + r() * 0.5;
    const hd = r() * TAU;
    const sp = 0.006 + r() * 0.008; // radii per second — slow drift
    return {
      p, x: Math.cos(a) * d, y: Math.sin(a) * d,
      vx: Math.cos(hd) * sp, vy: Math.sin(hd) * sp,
      sx: 0, sy: 0, trail: [], lastHit: -99, vis: 1,
      dir: r() < 0.5 ? 1 : -1, rect: null,
    };
  });
  // relax so data blocks don't pile up
  for (let k = 0; k < 80; k++) {
    for (const a of targets) for (const b of targets) {
      if (a === b) continue;
      const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 0.001;
      if (d < 0.3) { const f = (0.3 - d) * 0.25; a.x += (dx / d) * f; a.y += (dy / d) * f; }
    }
    for (const t of targets) for (const w of Object.values(WPTS)) {
      const dx = t.x - w.x, dy = t.y - w.y, d = Math.hypot(dx, dy) || 0.001;
      if (d < 0.16) { const f = (0.16 - d) * 0.3; t.x += (dx / d) * f; t.y += (dy / d) * f; }
    }
    for (const t of targets) {
      const d = Math.hypot(t.x, t.y);
      if (d > 0.82) { t.x *= 0.82 / d; t.y *= 0.82 / d; }
      if (d < 0.18) { t.x *= 0.18 / d; t.y *= 0.18 / d; }
    }
  }
  targets.forEach((t) => { t.sx = t.x; t.sy = t.y; });

  // ---------- state ----------
  let W = 0, R = 0, cx = 0, cy = 0, dpr = 1;
  let sweep = -Math.PI / 2, last = performance.now(), clock = 0;
  let paused = false, showHist = true, identUntil = 0;
  let mx = null, my = null, hover = null, hoverWpt = null, forced = null;
  const filters = { film: true, photo: true, design: true };
  const staticC = document.createElement("canvas");
  const sctx = staticC.getContext("2d");
  const roCursor = document.getElementById("ro-cursor");
  const roTgt = document.getElementById("ro-tgt");

  const P = (x, y) => [cx + x * R, cy + y * R];
  const norm = (a) => ((a % TAU) + TAU) % TAU;

  // ---------- static layer: map, rings, airways ----------
  function drawStatic() {
    staticC.width = W * dpr; staticC.height = W * dpr;
    const g = sctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, W);

    // scope face
    const face = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    face.addColorStop(0, "#1a160f");
    face.addColorStop(0.7, "#100e0a");
    face.addColorStop(1, "#090806");
    g.fillStyle = face;
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();

    g.save();
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();

    // weather returns — faint warm-olive precip cells
    const wr = seeded("wx");
    [[-0.45, -0.62, 0.22], [0.55, 0.62, 0.16]].forEach(([wx, wy, rad]) => {
      for (let i = 0; i < 260; i++) {
        const a = wr() * TAU, d = Math.pow(wr(), 0.7) * rad;
        const [px, py] = P(wx + Math.cos(a) * d * 1.3, wy + Math.sin(a) * d);
        const core = d < rad * 0.35;
        g.fillStyle = core ? "rgba(214,170,64,0.13)" : "rgba(120,150,70,0.10)";
        g.fillRect(px, py, 2.2, 2.2);
      }
    });

    // fan of airways converging off-scope (like the reference)
    g.strokeStyle = "rgba(238,142,58,0.22)";
    g.lineWidth = 1;
    const [fx, fy] = P(0.18, -2.1);
    for (let i = -6; i <= 6; i++) {
      const a = Math.PI / 2 + i * 0.075;
      g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a) * R * 5, fy + Math.sin(a) * R * 5); g.stroke();
    }

    // big blue boundary arc
    g.strokeStyle = "rgba(90,120,255,0.45)";
    g.lineWidth = 1.5;
    g.beginPath(); g.arc(cx - R * 0.25, cy - R * 1.25, R * 1.62, 0, TAU); g.stroke();

    // green sector boundary
    g.strokeStyle = "rgba(127,220,143,0.42)";
    g.lineWidth = 1.2;
    g.beginPath();
    [[-0.95, -0.42], [-0.62, -0.5], [-0.62, 0.12], [-0.1, 0.1], [0.42, 0.06], [0.98, 0.0]].forEach(([x, y], i) => {
      const [px, py] = P(x, y); i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.stroke();
    g.beginPath();
    [[-0.1, 0.1], [-0.18, -0.7], [0.1, -1.0]].forEach(([x, y], i) => {
      const [px, py] = P(x, y); i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.stroke();

    // waypoint airways
    g.strokeStyle = "rgba(240,150,64,0.62)";
    g.lineWidth = 1.2;
    AIRWAYS.forEach((route) => {
      g.beginPath();
      route.forEach((n, i) => { const [px, py] = P(WPTS[n].x, WPTS[n].y); i ? g.lineTo(px, py) : g.moveTo(px, py); });
      g.stroke();
    });
    // stubs leaving the scope
    [["FOCUS", 0.1, -1.4], ["APRTR", 1.4, -0.5], ["LUMEN", -1.4, -0.1], ["SHUTR", -0.3, 1.4], ["RADIO", 1.4, 0.5]].forEach(([n, x, y]) => {
      const [a, b] = P(WPTS[n].x, WPTS[n].y), [c, d] = P(x, y);
      g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke();
    });

    // range rings
    g.font = '500 10px "IBM Plex Mono", monospace';
    for (let i = 1; i <= 5; i++) {
      const rr = (R * i) / 5;
      g.strokeStyle = i === 5 ? "rgba(236,224,200,0.55)" : "rgba(236,224,200,0.22)";
      g.lineWidth = i === 5 ? 1.5 : 1;
      g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.stroke();
      if (i < 5) {
        g.fillStyle = "rgba(236,224,200,0.4)";
        g.fillText(String((MAX_NM * i) / 5), cx + rr * 0.707 + 4, cy + rr * 0.707 - 4);
      }
    }
    g.restore();

    // compass rose ticks + bearings
    g.strokeStyle = "rgba(236,224,200,0.55)";
    g.fillStyle = "rgba(236,224,200,0.6)";
    g.font = '500 10px "IBM Plex Mono", monospace';
    g.textAlign = "center"; g.textBaseline = "middle";
    for (let deg = 0; deg < 360; deg += 5) {
      const a = ((deg - 90) * Math.PI) / 180;
      const len = deg % 30 === 0 ? 10 : deg % 10 === 0 ? 6 : 3;
      g.lineWidth = deg % 30 === 0 ? 1.4 : 1;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      g.lineTo(cx + Math.cos(a) * (R - len), cy + Math.sin(a) * (R - len));
      g.stroke();
      if (deg % 30 === 0) g.fillText(String(deg).padStart(3, "0"), cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14));
    }
    g.textAlign = "start"; g.textBaseline = "alphabetic";

    // center mark
    g.strokeStyle = "rgba(255,107,90,0.8)";
    g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(cx - 6, cy); g.lineTo(cx + 6, cy); g.moveTo(cx, cy - 6); g.lineTo(cx, cy + 6); g.stroke();
  }

  function resize() {
    const s = Math.floor(wrap.clientWidth);
    if (!s || s === W) return;
    W = s; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = s * dpr; canvas.height = s * dpr;
    canvas.style.width = s + "px"; canvas.style.height = s + "px";
    cx = cy = s / 2; R = s / 2 - 26;
    drawStatic();
  }
  new ResizeObserver(resize).observe(wrap);
  if (document.fonts) document.fonts.ready.then(() => { W = 0; resize(); });

  // ---------- per-frame ----------
  function step(dt) {
    const prev = sweep;
    if (!paused) sweep += dt * (TAU / PERIOD) * (reduceMotion ? 0.35 : 1);
    const span = sweep - prev;
    for (const t of targets) {
      if (!paused) {
        t.x += t.vx * dt; t.y += t.vy * dt;
        const d = Math.hypot(t.x, t.y);
        if ((d > 0.85 && t.x * t.vx + t.y * t.vy > 0) || (d < 0.15 && t.x * t.vx + t.y * t.vy < 0)) {
          // gentle 180 with a little offset so tracks don't retrace exactly
          const a = Math.atan2(t.vy, t.vx) + Math.PI + 0.4, s = Math.hypot(t.vx, t.vy);
          t.vx = Math.cos(a) * s; t.vy = Math.sin(a) * s;
        }
      }
      if (span > 0 && norm(Math.atan2(t.y, t.x) - prev) <= span) {
        t.trail.push({ x: t.sx, y: t.sy });
        if (t.trail.length > 5) t.trail.shift();
        t.sx = t.x; t.sy = t.y; t.lastHit = clock;
      }
      t.vis += ((filters[t.p.type] ? 1 : 0) - t.vis) * Math.min(1, dt * 6);
    }
    sweep = norm(sweep);
  }

  function hitTest() {
    hover = null; hoverWpt = null;
    if (mx == null) return;
    for (const t of targets) {
      if (t.vis < 0.5) continue;
      const [bx, by] = P(t.sx, t.sy);
      const r = t.rect;
      if (Math.hypot(mx - bx, my - by) < 14 || (r && mx > r.x - 4 && mx < r.x + r.w + 4 && my > r.y - 4 && my < r.y + r.h + 4)) {
        hover = t; return;
      }
    }
    for (const w of wptList) {
      if (!w.href) continue;
      const [px, py] = P(w.x, w.y), r = w.rect;
      if (Math.hypot(mx - px, my - py) < 14 || (r && mx > r.x - 3 && mx < r.x + r.w + 3 && my > r.y - 3 && my < r.y + r.h + 3)) {
        hoverWpt = w; return;
      }
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    ctx.drawImage(staticC, 0, 0, W, W);

    // phosphor afterglow wedge
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    if (ctx.createConicGradient) {
      const g = ctx.createConicGradient(sweep, cx, cy);
      g.addColorStop(0, "rgba(255,179,71,0)");
      g.addColorStop(0.7, "rgba(255,179,71,0)");
      g.addColorStop(0.94, "rgba(255,179,71,0.10)");
      g.addColorStop(1, "rgba(255,179,71,0.30)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    } else {
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = `rgba(255,179,71,${0.012 * (24 - i) / 2})`;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, sweep - (i + 1) * 0.06, sweep - i * 0.06); ctx.fill();
      }
    }
    // sweep line
    const lg = ctx.createLinearGradient(cx, cy, cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
    lg.addColorStop(0, "rgba(255,200,120,0.15)");
    lg.addColorStop(1, "rgba(255,200,120,0.95)");
    ctx.strokeStyle = lg; ctx.lineWidth = 2;
    ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // waypoints
    ctx.font = FONT_B;
    for (const w of wptList) {
      const [px, py] = P(w.x, w.y);
      const hot = hoverWpt === w;
      ctx.globalAlpha = w.href ? 1 : 0.7;
      ctx.fillStyle = "#ffd84a";
      if (hot) { ctx.shadowColor = "#ffd84a"; ctx.shadowBlur = 14; }
      ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px + 6, py + 5); ctx.lineTo(px - 6, py + 5); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = hot ? "#ffd2c8" : "#ff6b5a";
      const label = w.name;
      ctx.fillText(label, px + 10, py + 4);
      const tw = ctx.measureText(label).width;
      w.rect = { x: px + 8, y: py - 8, w: tw + 6, h: 16 };
      if (w.href) {
        // little nav tick under name
        ctx.strokeStyle = hot ? "#ffd84a" : "rgba(255,107,90,0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash(hot ? [] : [2, 2]);
        ctx.beginPath(); ctx.moveTo(px + 10, py + 8); ctx.lineTo(px + 10 + tw, py + 8); ctx.stroke();
        ctx.setLineDash([]);
        if (hot) {
          ctx.strokeStyle = "rgba(255,216,74,0.8)";
          ctx.beginPath(); ctx.arc(px, py, 13 + Math.sin(clock * 6) * 2, 0, TAU); ctx.stroke();
          ctx.fillStyle = "#ffd84a";
          ctx.fillText("→ " + w.label, px + 10, py + 21);
        }
      }
    }
    ctx.globalAlpha = 1;

    // targets
    const identOn = clock < identUntil;
    let visibleCount = 0;
    for (const t of targets) {
      if (t.vis < 0.02) { t.rect = null; continue; }
      if (t.vis > 0.5) visibleCount++;
      const col = TYPE[t.p.type]?.c || "#efe6d4";
      const hot = hover === t || forced === t;
      const age = clock - t.lastHit;
      let glow = 0.38 + 0.62 * Math.exp(-age / 2.4);
      if (identOn) glow = Math.sin(clock * 20) > 0 ? 1 : 0.2;
      if (hot) glow = 1;
      const a = glow * t.vis;

      if (showHist) {
        t.trail.forEach((pt, i) => {
          const [hx, hy] = P(pt.x, pt.y);
          ctx.globalAlpha = t.vis * (0.12 + i * 0.1);
          ctx.fillStyle = col;
          ctx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
        });
      }

      const [bx, by] = P(t.sx, t.sy);
      ctx.globalAlpha = a;
      ctx.strokeStyle = col; ctx.fillStyle = col;
      ctx.shadowColor = col; ctx.shadowBlur = 8 * glow;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(bx - 4, by - 4, 8, 8);
      if (hot || glow > 0.85) ctx.fillRect(bx - 1.5, by - 1.5, 3, 3);
      // velocity vector (projected 60s)
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + t.vx * R * 4, by + t.vy * R * 4); ctx.stroke();
      ctx.shadowBlur = 0;

      // data block
      const yy = String(t.p.year).slice(-2);
      const lines = R < 200 && !hot ? [t.p.id] : [t.p.id, `${TYPE[t.p.type]?.abbr || "UNK"}${yy} ${t.p.kind || ""}`];
      if (hot) lines.push(t.p.title.toUpperCase(), "▸ OPEN STRIP");
      ctx.font = FONT_B;
      const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
      let dir = t.dir;
      if (dir === 1 && bx + 22 + tw > cx + R * 0.98) dir = -1;
      if (dir === -1 && bx - 22 - tw < cx - R * 0.98) dir = 1;
      const lx = bx + dir * 18, ly = by - 18;
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx + dir * 5, by - 5); ctx.lineTo(lx, ly); ctx.stroke();
      const tx = dir === 1 ? lx + 3 : lx - 3 - tw;
      const top = ly - 6 - (lines.length - 1) * 13;
      if (hot) {
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = "rgba(12,10,8,0.88)";
        ctx.fillRect(tx - 5, top - 11, tw + 10, lines.length * 13 + 8);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = col;
        ctx.strokeRect(tx - 5, top - 11, tw + 10, lines.length * 13 + 8);
      }
      lines.forEach((l, i) => {
        ctx.font = i === 0 ? FONT_B : FONT;
        ctx.fillStyle = i >= 2 ? (i === 3 ? "#ffd84a" : "#efe6d4") : col;
        ctx.fillText(l, tx, top + i * 13);
      });
      t.rect = { x: tx - 4, y: top - 11, w: tw + 8, h: lines.length * 13 + 6 };
    }
    ctx.globalAlpha = 1;
    if (roTgt) roTgt.textContent = `TGT ${String(visibleCount).padStart(2, "0")}`;
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; clock += dt;
    if (W) {
      step(dt);
      hitTest();
      canvas.style.cursor = hover || hoverWpt ? "pointer" : "crosshair";
      draw();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- input ----------
  function setPointer(e) {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    if (roCursor) {
      const dx = (mx - cx) / R, dy = (my - cy) / R, d = Math.hypot(dx, dy);
      if (d <= 1) {
        const brg = Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360);
        roCursor.innerHTML = `BRG ${String(brg).padStart(3, "0")}°<br>RNG ${(d * MAX_NM).toFixed(1).padStart(4, "0")}NM`;
      } else roCursor.innerHTML = "BRG ---°<br>RNG --.-NM";
    }
  }
  canvas.addEventListener("pointermove", setPointer);
  canvas.addEventListener("pointerleave", () => { mx = my = null; });
  canvas.addEventListener("click", (e) => {
    setPointer(e); hitTest();
    if (hover && window.openStrip) window.openStrip(hover.p.id);
    else if (hoverWpt) document.querySelector(hoverWpt.href)?.scrollIntoView({ behavior: "smooth" });
  });

  // ---------- public API for the console + traffic list ----------
  window.Scope = {
    setFilter(type, on) { filters[type] = on; },
    ident() { identUntil = clock + 2.2; },
    togglePause() { paused = !paused; return paused; },
    toggleHist() { showHist = !showHist; return showHist; },
    focus(id) { forced = id ? targets.find((t) => t.p.id === id) || null : null; },
  };
})();
