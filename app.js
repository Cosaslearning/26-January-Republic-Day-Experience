function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

const AUTO_TIMELINE = [
  // scene 3 (date card)
  { scene: 3, delayMs: 1350, next: 4 },
  // scene 4 (flag reveal)
  { scene: 4, delayMs: 1800, next: 5 },
  // scene 5 (quote)
  { scene: 5, delayMs: 2100, next: 6 },
];

class SceneController {
  /**
   * @param {number} maxIndex inclusive max scene index
   */
  constructor(maxIndex) {
    this.maxIndex = maxIndex;
    this.index = 0;
    /** @type {Set<(index:number)=>void>} */
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of this.listeners) fn(this.index);
  }

  goToScene(i) {
    const next = Math.max(0, Math.min(this.maxIndex, Number(i)));
    if (next === this.index) return this.index;
    this.index = next;
    this.emit();
    return this.index;
  }

  nextScene() {
    return this.goToScene(this.index + 1);
  }

  prevScene() {
    return this.goToScene(this.index - 1);
  }
}

class TickTypewriter {
  /**
   * Tick-based typewriter (deterministic for tests).
   * Call `tick()` to append one character.
   */
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.cancelled = false;
  }

  cancel() {
    this.cancelled = true;
  }

  tick() {
    if (this.cancelled) return { done: true, value: "" };
    if (this.pos >= this.text.length) return { done: true, value: "" };
    const ch = this.text[this.pos];
    this.pos += 1;
    return { done: this.pos >= this.text.length, value: ch };
  }
}

class CountdownEffect {
  constructor({ el, from = 3, to = 1, stepMs = 650, onDone }) {
    this.el = el;
    this.from = from;
    this.to = to;
    this.stepMs = stepMs;
    this.onDone = onDone;
    this._timer = null;
    this._value = from;
    this._cancelled = false;
  }

  start() {
    this._cancelled = false;
    this._value = this.from;
    this.render();
    if (prefersReducedMotion()) {
      this._value = this.to;
      this.render();
      this.onDone?.();
      return;
    }
    this._timer = window.setInterval(() => {
      if (this._cancelled) return;
      this._value -= 1;
      this.render();
      if (this._value <= this.to) {
        this.stop();
        this.onDone?.();
      }
    }, this.stepMs);
  }

  render() {
    if (!this.el) return;
    this.el.textContent = String(this._value);
    this.el.classList.remove("pulse");
    // restart animation
    void this.el.offsetWidth;
    this.el.classList.add("pulse");
  }

  stop() {
    this._cancelled = true;
    if (this._timer) window.clearInterval(this._timer);
    this._timer = null;
  }
}

class CanvasConfetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.running = false;
    this.particles = [];
    this._raf = 0;
    this._last = 0;
    this._resizeHandler = () => this.resize();
  }

  resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  seed(count = 140) {
    const rect = this.canvas.getBoundingClientRect();
    const colors = ["#ff9933", "#f4f6ff", "#138808", "#0a3d91"];
    this.particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * rect.width,
      y: -20 - Math.random() * rect.height * 0.2,
      vx: (Math.random() - 0.5) * 70,
      vy: 80 + Math.random() * 160,
      r: 2 + Math.random() * 3.5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 4,
      color: colors[(Math.random() * colors.length) | 0],
      life: 2.5 + Math.random() * 1.8,
    }));
  }

  start() {
    if (prefersReducedMotion()) return;
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._resizeHandler);
    this.resize();
    this.seed();
    this._last = performance.now();
    this._raf = requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    window.removeEventListener("resize", this._resizeHandler);
    this.clear();
  }

  clear() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  loop(t) {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this._last) / 1000);
    this._last = t;
    this.step(dt);
    this.draw();
    this._raf = requestAnimationFrame((nt) => this.loop(nt));
  }

  step(dt) {
    const rect = this.canvas.getBoundingClientRect();
    const g = 320;
    for (const p of this.particles) {
      p.vy += g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= dt;
      if (p.y > rect.height + 30 || p.life <= 0) {
        p.y = -20 - Math.random() * 80;
        p.x = Math.random() * rect.width;
        p.vy = 80 + Math.random() * 160;
        p.vx = (Math.random() - 0.5) * 70;
        p.life = 2.5 + Math.random() * 1.8;
      }
      if (p.x < -30) p.x = rect.width + 30;
      if (p.x > rect.width + 30) p.x = -30;
    }
  }

  draw() {
    const rect = this.canvas.getBoundingClientRect();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, rect.width, rect.height);
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.9;
      // rectangle confetti
      ctx.fillRect(-p.r * 1.6, -p.r * 0.8, p.r * 3.2, p.r * 1.6);
      ctx.restore();
    }
  }
}

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function setSceneActive(index) {
  const scenes = qsa(".scene");
  for (const s of scenes) {
    const isActive = Number(s.dataset.scene) === index;
    s.classList.toggle("is-active", isActive);
    if (isActive) s.removeAttribute("aria-hidden");
    else s.setAttribute("aria-hidden", "true");
  }
}

function wire() {
  // Note (AI-assisted): We keep the wiring guarded so this file can be reused
  // in different HTML shells without throwing when expected elements are missing.
  const appRoot = document.getElementById("app");
  const sceneEls = qsa(".scene");
  if (!appRoot || sceneEls.length === 0) return;

  const maxSceneIndex = Math.max(
    ...sceneEls.map((s) => Number(s.dataset.scene))
  );
  const ctrl = new SceneController(maxSceneIndex);

  const typeEl = qs("#typewriterText");
  const countdownEl = qs("#countdownNumber");
  const confettiCanvas = /** @type {HTMLCanvasElement|null} */ (qs("#confettiCanvas"));
  const confetti = confettiCanvas ? new CanvasConfetti(confettiCanvas) : null;

  let typeTimer = 0;
  let typewriter = null;
  let countdown = null;
  let autoTimer = 0;
  let finaleStopTimer = 0;
  let started = false;

  function clearAutoTimer() {
    if (autoTimer) window.clearTimeout(autoTimer);
    autoTimer = 0;
  }

  function clearFinaleStopTimer() {
    if (finaleStopTimer) window.clearTimeout(finaleStopTimer);
    finaleStopTimer = 0;
  }

  function queueGoTo(sceneIndex, delayMs) {
    clearAutoTimer();
    const delay = prefersReducedMotion() ? 0 : delayMs;
    autoTimer = window.setTimeout(() => ctrl.goToScene(sceneIndex), delay);
  }

  function stopTypewriter() {
    if (typeTimer) window.clearInterval(typeTimer);
    typeTimer = 0;
    if (typewriter) typewriter.cancel();
    typewriter = null;
  }

  function startTypewriter(onDone) {
    stopTypewriter();
    if (!typeEl) return;
    typeEl.textContent = "";
    typewriter = new TickTypewriter(
      "I don't just write code — I write dreams for my nation."
    );
    if (prefersReducedMotion()) {
      // reduced motion: render instantly
      let res = typewriter.tick();
      while (!res.done) {
        typeEl.textContent += res.value;
        res = typewriter.tick();
      }
      // last tick
      typeEl.textContent += res.value;
      onDone?.();
      return;
    }
    typeTimer = window.setInterval(() => {
      if (!typewriter) return;
      const { done, value } = typewriter.tick();
      typeEl.textContent += value;
      if (done) {
        stopTypewriter();
        onDone?.();
      }
    }, 40);
  }

  function stopCountdown() {
    countdown?.stop();
    countdown = null;
  }

  function startCountdown() {
    stopCountdown();
    countdown = new CountdownEffect({
      el: countdownEl,
      from: 3,
      to: 1,
      stepMs: 650,
      onDone: () => {
        // Auto-advance after countdown completes.
        queueGoTo(2, 450);
      },
    });
    countdown.start();
  }

  function stopFinale() {
    confetti?.stop();
    clearFinaleStopTimer();
  }

  function startFinale() {
    confetti?.start();
    clearFinaleStopTimer();
    const stopDelay = prefersReducedMotion() ? 0 : 7000;
    finaleStopTimer = window.setTimeout(() => confetti?.stop(), stopDelay);
  }

  function startFlagReveal() {
    const flag = qs(".flag");
    flag?.classList.add("is-revealing");
  }

  function stopFlagReveal() {
    const flag = qs(".flag");
    flag?.classList.remove("is-revealing");
  }

  ctrl.onChange((idx) => {
    // stop effects before switching
    stopTypewriter();
    stopCountdown();
    stopFinale();
    stopFlagReveal();
    clearAutoTimer();
    clearFinaleStopTimer();

    setSceneActive(idx);

    // start effects for active scene
    if (idx === 1) startCountdown();
    if (idx === 2) {
      startTypewriter(() => queueGoTo(3, 900));
    }
    if (idx === 4) startFlagReveal();
    if (idx === 6) startFinale();

    // schedule timeline-based scenes
    const step = AUTO_TIMELINE.find((s) => s.scene === idx);
    if (step) queueGoTo(step.next, step.delayMs);
  });

  // initial
  setSceneActive(0);

  // Start button (only on first scene).
  document.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement|null} */ (
      e.target?.closest?.("[data-action='start']")
    );
    if (!target) return;
    if (started) return;
    started = true;
    target.setAttribute("disabled", "true");
    ctrl.goToScene(1);
  });

  // expose for tests/manual debugging without bundlers
  window.__RepublicDay = { ctrl, TickTypewriter, SceneController };
}

// Expose constructors for tests (no bundlers, works on file://).
window.RepublicDayLib = {
  SceneController,
  TickTypewriter,
  CountdownEffect,
  CanvasConfetti,
  getAutoTimeline: () => AUTO_TIMELINE.slice(),
};

// Browser-only bootstrap.
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
}

