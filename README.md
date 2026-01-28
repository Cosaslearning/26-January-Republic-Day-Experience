## 26 January • Republic Day Experience

An interactive, single‑page Republic Day experience built with **HTML**, **CSS**, and **vanilla JavaScript**.  
Walk through a sequence of animated scenes: a welcome screen, countdown, typewriter quote, Republic Day date card, animated Indian flag with Ashoka Chakra, a quote card, and a festive confetti finale.

### Demo

You can run this locally by opening `index.html` in a browser, or by serving the folder with any static file server (see [Running locally](#running-locally)).

> Optimized for modern desktop and mobile browsers. No build step or external dependencies required.

---

### Features

- **Scene‑based flow**  
  Multiple full‑screen “scenes” (`.scene`) driven by a `SceneController` in `app.js`, transitioning from landing → countdown → typewriter → date card → flag reveal → quote → finale.

- **Animated countdown**  
  A large, animated countdown (3 → 1) with a subtle pulse effect before transitioning to the next scene.

- **Typewriter quote effect**  
  A deterministic, tick‑based typewriter (`TickTypewriter`) that progressively reveals the line:  
  *“I don't just write code — I write dreams for my nation.”*

- **Indian flag reveal**  
  CSS‑animated tricolour bands and an inline SVG Ashoka Chakra, revealed with smooth entrance animations.

- **Confetti finale**  
  A custom `CanvasConfetti` engine rendering falling tricolour confetti in the final scene for a celebratory finish.

- **Accessibility‑aware**  
  - Skip‑to‑content link (`.skip-link`) for keyboard users  
  - ARIA labels for scenes and key elements  
  - `prefers-reduced-motion` support: motion‑heavy effects (countdown animation, typewriter ticks, confetti, flag animation) gracefully simplify for users who prefer reduced motion.

- **No external dependencies**  
  Pure HTML/CSS/JS, works directly from `file://` or any static host (GitHub Pages, Netlify, Vercel, etc.).

---

### Project Structure

```text
.
├─ index.html    # Main HTML shell and scene markup
├─ styles.css    # Layout, typography, scenes, flag, and animation styles
└─ app.js        # Scene controller, typewriter, countdown, confetti, and wiring
```

#### `index.html`

- Defines the **main app container** (`<main id="app" class="app">`) and all scenes (`<section class="scene" data-scene="...">`).
- Includes:
  - Landing scene with a **Start** button (`data-action="start"`).
  - Countdown, typewriter, date card, **flag reveal** with inline Chakra SVG, a quote card, and the final confetti scene.
- Loads `styles.css` and `app.js` (with `defer`) and adds meta tags for viewport and description.

#### `styles.css`

- Global design tokens (CSS custom properties):
  - Background, text, glass panel, tricolour, chakra, radii, and focus ring.
- Layout:
  - Centered glassmorphism panel (`.center`), full‑screen scenes (`.scene`), and background grain overlay.
- Components:
  - Buttons (`.btn`, `.btn-primary`, `.btn-ghost`)
  - Countdown (`.countdown-number` + `pulse` animation)
  - Typewriter line + caret (`.typewriter`, `.caret`)
  - Date styling (`.date`, `.date-accent`)
  - Flag bands and Chakra (`.flag`, `.band-*`, `.charka`)
  - Quote card (`.quote-card`, `.quote-bar`, `.quote`, `.quote-by`)
  - Confetti canvas and finale title (`.confetti`, `.finale-title`, `.badge`)
- Accessibility:
  - `@media (prefers-reduced-motion: reduce)` removes transitions and animations where appropriate.

#### `app.js`

Key modules:

- **`SceneController`**  
  Controls which `data-scene` is active, with `goToScene`, `nextScene`, `prevScene`, and change listeners. Used to coordinate scene transitions.

- **`TickTypewriter`**  
  Tick‑driven typewriter used in scene 2. Each `tick()` appends exactly one character, making behaviour deterministic (useful for testing and debugging).

- **`CountdownEffect`**  
  Drives the countdown number in scene 1, pulsing and decrementing from 3 to 1, then automatically advancing to the next scene. Respects `prefers-reduced-motion`.

- **`CanvasConfetti`**  
  Handles setup, resize, animation loop, particle physics, and rendering of tricolour confetti on a `<canvas>` in the final scene.

- **Utility helpers**  
  `qs`, `qsa`, `setSceneActive` help with DOM selection and toggling the active scene.

- **`wire()` bootstrap**  
  - Safely wires up the scene controller only if expected elements exist (so the library is re‑usable in other shells).  
  - Hooks the **Start** button (`data-action="start"`) to begin the flow at the countdown scene.  
  - Orchestrates when each effect starts/stops (typewriter, countdown, flag reveal, confetti) based on the current scene and a predefined `AUTO_TIMELINE`.

- **Global exposure for testing/debugging (no bundlers required)**  
  - `window.__RepublicDay` exposes `ctrl`, `TickTypewriter`, and `SceneController`.  
  - `window.RepublicDayLib` exposes constructors and `getAutoTimeline()`.

---

### Running locally

You have two easy options:

#### Option 1: Open directly in a browser

1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Click **Start** to begin the experience.

> Note: Some browser/security setups may limit advanced features for `file://` URLs. If anything looks off, try Option 2.

#### Option 2: Serve with a simple static server

You can use any static server you like. For example, with **Node.js** installed:

```bash
# Using npx serve
npx serve .

# or using http-server
npx http-server .
```

Then open the printed URL (often `http://localhost:3000` or `http://127.0.0.1:8080`) in your browser.

---

### Customization

You can easily tweak the experience:

- **Update text and quotes**  
  - Landing titles, subtitles, and final messages: edit the relevant text in `index.html`.
  - Typewriter message: change the string passed into `TickTypewriter` in `app.js`.

- **Change timing and flow**  
  - Countdown speed: adjust `stepMs` in `new CountdownEffect(...)`.
  - Scene auto‑advance timings: edit the `AUTO_TIMELINE` entries in `app.js`.

- **Adjust visuals**  
  - Colors, gradients, and glow: edit CSS variables in `styles.css` (`:root` block).
  - Animation intensity: tweak keyframes and durations for `pulse`, `bandIn`, `chakraIn`, etc.

---

### Accessibility & Design Notes

- **Motion sensitivity**: The project respects `prefers-reduced-motion` and disables/simplifies motion‑heavy effects for those users.
- **Keyboard users**: A skip link is provided to jump directly to main content.
- **Semantic structure**: Scenes are `<section>` elements with ARIA labels, and key visual elements (e.g., the flag) have appropriate roles/labels where needed.

---

### Development Notes

This project was designed as a **lightweight, dependency‑free interactive experience**:

- No framework or bundler is required.
- All code is intentionally kept in a single `app.js` file to remain easy to inspect and reuse.
- Some parts of the code have been structured and commented to support learning, testing, and potential reuse in other small interactive projects.

If you extend or refactor this, consider keeping:

- The clear scene separation.
- Accessibility and reduced‑motion support.
- The dependency‑free, static‑host‑friendly setup.



