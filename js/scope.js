/* A small, low-resolution green radar screen.
   Drawn at half resolution and scaled up so the pixels show. */
(() => {
  const canvas = document.getElementById("scope");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const box = document.getElementById("crt-screen");
  const read = document.getElementById("crt-read");
  const WORK = window.WORK || [];
  const TAU = Math.PI * 2;
  const slow = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SCALE = 2;
  const G = (a) => `rgba(110,255,140,${a})`;

  let N = 0, R = 0, c = 0;
  let sweep = -Math.PI / 2, last = performance.now(), t = 0;
  let hot = null, lastOver = null, mx = -1, my = -1, filter = "all", started = 0;

  // place blips: spread around the circle with a golden-angle spiral
  const blips = WORK.map((p, i) => {
    const a = i * 2.39996 - 1.2;
    const d = 0.32 + ((i * 0.37) % 0.5);
    return { p, n: String(i + 1), a, d, lit: -9 };
  });

  function size() {
    const w = Math.floor(box.clientWidth / SCALE);
    if (!w || w === N) return;
    N = w; c = N / 2; R = N / 2 - 6;
    canvas.width = N; canvas.height = N;
    canvas.style.width = N * SCALE + "px";
    canvas.style.height = N * SCALE + "px";
    ctx.fillStyle = "#071309";
    ctx.fillRect(0, 0, N, N);
  }
  new ResizeObserver(size).observe(box);

  const pos = (b) => [Math.round(c + Math.cos(b.a) * b.d * R), Math.round(c + Math.sin(b.a) * b.d * R)];

  function boot(el) {
    const lines = ["SCOPE 01", "", "> LOADING TRAFFIC", `> ${String(WORK.length).padStart(2, "0")} TARGETS`, "> OK"];
    ctx.fillStyle = "#071309"; ctx.fillRect(0, 0, N, N);
    ctx.fillStyle = G(0.95);
    ctx.font = "10px VT323, monospace";
    const shown = Math.floor(el / 0.22);
    lines.slice(0, shown).forEach((l, i) => ctx.fillText(l, 8, 16 + i * 11));
    if (Math.floor(el * 4) % 2) ctx.fillRect(8, 16 + Math.min(shown, lines.length) * 11 - 8, 5, 8);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    if (!N) return requestAnimationFrame(frame);
    if (!started) started = t;
    if (t - started < 1.5) { boot(t - started); return requestAnimationFrame(frame); }

    // phosphor fade: paint over the last frame with a little transparency
    ctx.fillStyle = "rgba(7,19,9,0.16)";
    ctx.fillRect(0, 0, N, N);

    // rings + cross
    ctx.strokeStyle = G(0.22); ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(c, c, (R * i) / 4, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(c - R, c); ctx.lineTo(c + R, c); ctx.moveTo(c, c - R); ctx.lineTo(c, c + R); ctx.stroke();
    // bearing ticks
    for (let d = 0; d < 360; d += 10) {
      const a = (d * Math.PI) / 180, l = d % 30 ? 2 : 4;
      ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * R, c + Math.sin(a) * R);
      ctx.lineTo(c + Math.cos(a) * (R - l), c + Math.sin(a) * (R - l)); ctx.stroke();
    }

    // sweep
    const prev = sweep;
    sweep += dt * (TAU / 5) * (slow ? 0.3 : 1);
    ctx.strokeStyle = G(0.9);
    ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(sweep) * R, c + Math.sin(sweep) * R); ctx.stroke();

    // blips
    ctx.font = "10px VT323, monospace";
    let over = null;
    for (const b of blips) {
      const span = sweep - prev;
      if ((((b.a - prev) % TAU) + TAU) % TAU <= span) b.lit = t;
      const on = filter === "all" || b.p.type === filter;
      const [x, y] = pos(b);
      if (mx >= 0 && Math.abs(mx - x) < 6 && Math.abs(my - y) < 6 && on) over = b;
      const isHot = hot === b.p.id;
      const glow = isHot ? 1 : Math.max(0.5, 1 - (t - b.lit) / 3);
      if (!on) continue;
      {
        ctx.fillStyle = G(glow);
        ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.fillText(b.n, Math.round(x + 4), Math.round(y - 2));
      }
      if (isHot) {
        if (Math.floor(t * 3) % 2) { ctx.strokeStyle = G(1); ctx.strokeRect(x - 4.5, y - 4.5, 9, 9); }
        const label = b.p.title.toUpperCase();
        const w = ctx.measureText(label).width;
        const lx = Math.min(Math.max(4, x - w / 2), N - w - 4);
        const ly = y > c ? y - 10 : y + 16;
        ctx.fillStyle = "#071309"; ctx.fillRect(lx - 2, ly - 8, w + 4, 10);
        ctx.fillStyle = G(1); ctx.fillText(label, lx, ly);
      }
    }
    canvas.style.cursor = over ? "pointer" : "crosshair";
    const overId = over ? over.p.id : null;
    if (overId !== lastOver) { lastOver = overId; window.Scope.onHover?.(overId); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function local(e) {
    const r = canvas.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width) * N;
    my = ((e.clientY - r.top) / r.height) * N;
  }
  canvas.addEventListener("pointermove", local);
  canvas.addEventListener("pointerleave", () => { mx = my = -1; });
  canvas.addEventListener("click", (e) => {
    local(e);
    const on = (b) => filter === "all" || b.p.type === filter;
    const b = blips.find((b) => { const [x, y] = pos(b); return on(b) && Math.abs(mx - x) < 7 && Math.abs(my - y) < 7; });
    if (b) window.Scope.onClick?.(b.p.id);
  });

  window.Scope = {
    highlight(id) {
      hot = id;
      const p = WORK.find((w) => w.id === id);
      if (read) read.textContent = p ? `TGT ${String(WORK.indexOf(p) + 1).padStart(2, "0")} · ${p.type} ${p.year}` : (matchMedia("(hover: none)").matches ? "Tap a blip" : "Hover a project");
    },
    filter(f) { filter = f; },
  };
})();
