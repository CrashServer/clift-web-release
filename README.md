# 🌊 CLIFT Web - ASCII Art VJ Software

```
   ▄████▄   ██▓     ██▓  █████▒▄▄▄█████▓
  ▒██▀ ▀█  ▓██▒    ▓██▒▓██   ▒ ▓  ██▒ ▓▒
  ▒▓█    ▄ ▒██░    ▒██▒▒████ ░ ▒ ▓██░ ▒░
  ▒▓▓▄ ▄██▒▒██░    ░██░░▓█▒  ░ ░ ▓██▓ ░ 
  ▒ ▓███▀ ░░██████▒░██░░▒█░      ▒██▒ ░ 
  ░ ░▒ ▒  ░░ ▒░▓  ░░▓   ▒ ░      ▒ ░░   
    ░  ▒   ░ ░ ▒  ░ ▒ ░ ░          ░    
  ░          ░ ░    ▒ ░ ░ ░      ░      
  ░ ░          ░  ░ ░              
  ░                               
```

**Browser-based ASCII Art VJ Software**

*A project by [crashserver.fr](https://crashserver.fr)* · TRY IT LIVE [HERE](https://crashserver.fr/apps/clift-web/)

The JS port of [CLIFT terminal](https://github.com/CrashServer/clift_terminal).

If you want to support : https://coff.ee/crashserver

```
    ╔══════════════════════════════════════╗
    ║  CLIFT: future proof, ascii vjing    ║  
    ║  for yesterday                       ║
    ╚══════════════════════════════════════╝
```

## ▶ Running it

Open `index.html` in a browser. That's it: no server, no build step, no dependencies.
It also works when served from any static host.

Firefox and Chromium-based browsers are both supported. Microphone input asks for
permission and also works when the page is opened from disk (`file://`).

## 🔥 Features

- **235 ASCII scenes** in 24 named banks, with a searchable scene browser
- **Dual decks + crossfader** with live mini-previews of both decks, 8 mix patterns
  and beat-length transitions (1-16 beats)
- **26 ASCII effects** (glitch, mirror, 3D tunnel, dither...) and **12 experimental
  render modes** (surface, particles, splines, 3D city, plasma, terminal...)
- **Colors**: 10 color pairs (incl. inverse pairs), 10 gradients, Full / Mono / Accent modes, FG/BG invert
- **GPU rendering**: the ASCII grid is drawn by a WebGL shader from a glyph atlas, with
  post-FX in the same pipeline; falls back to canvas 2D (automatic on software-only WebGL,
  or pick it under Output → Renderer)
- **Post-FX** (WebGL): CRT tint, glow, scanlines, vignette, chromatic offset + presets
- **Audio**: demo signal (no permission needed), live input with device selection,
  or play an audio file (drop it onto the page). 64-band log spectrum, 5 bands,
  beat detection, tempo estimation and auto-level (keeps quiet inputs and highs lively)
- **Tempo**: BPM clock, tap tempo (re-syncs the downbeat), sync to detected BPM
- **Visual FX** (GPU, on the whole image):
  - **dynamic split**: panels re-cut on the beat (each panel its own window of the image -
    offset, zoomed, flipped) or sliding horizontal / vertical slices
  - **glitch**: block displacement, scanline tears, per-block RGB split, channel swaps
  - **explode**: shards flying out from a point with dark cracks, shockwave ring, or a
    steady shatter that breathes with the bass
  - **displacement**: flowing noise displacement and "liquid" (brightness displacement)
  - video **feedback** (trails, tunnels, smears), mirrored / repeated tiles, bass zoom,
    spin, wave, pixelate, hue cycling, posterize
  - 15 one-click **looks** (trails, liquid, melt, mirror, panels, tunnel, slicer, tiles,
    glitch, mosaic, datamosh, shatter, acid, storm...). No kaleidoscopes - VJ law.
- **Hits**: explode, shockwave, glitch burst, split, strobe, invert flash, zoom punch,
  hue jump, feedback burst - from buttons, MIDI pads, or automatically **on beat**
- **On beat**: any of the hits plus tile shuffle / color change / effect change / scene
  change, each every 1-32 beats, counted on the BPM clock or on detected beats
- **Full Auto (the Director)**: follows the music instead of a timer. It tracks
  breakdowns, build-ups, peaks and drops, changes on phrase boundaries (8-64 beats), picks
  scenes whose energy fits the moment (no repeats), long dissolves in breakdowns, cuts at
  peaks, explosion + shockwave + glitch + cut on the drop, build-ups that get glitchier
  toward the drop, matching FX looks and color palettes. It drives everything visual
  the app has: scenes (incl. custom ones), transitions and mix patterns, all FX looks and
  hits, colors, color modes, invert, ASCII effects, CRT post-FX, render modes, grid size,
  deck speed, scene params, the text overlay (on drops / as a marquee) and your saved
  snapshots. Intensity goes from calm to wild; every part can be excluded in its options.
  BPM, audio input, recording, projector and MIDI stay in your hands
- **Speed & Pulse** on every deck: Speed runs the scene 0.25x-4x, Pulse lets bass and
  beats push the scene forward and flash its colors, so every scene moves with the music.
  Scenes that have their own knobs also get Param 1-3
- **Projector window** (Shift+F): a second window with only the visuals; drag it to the
  projector, double-click for fullscreen. The main window keeps the controls and a preview
- **MIDI**: map any knob, fader or pad with *Learn* (40 targets: crossfader, speed,
  pulse, transitions, scene/bank stepping, effects, snapshots...); optional MIDI clock sync
- **Snapshots**: 8 slots holding a complete look; Shift+click saves, click or Shift+1…8 recalls
- **Text overlay** (L): big block letters, a plain line or a marquee, optionally pulsing on the beat
- **Favorites**: star scenes in the browser; they get their own bank and Full Auto can stick to them
- **Sessions**: autosaved locally (a reload brings you back), export / import JSON
  (old CLIFT Web session files load too)
- **Recording**: records the visible output (post-FX and render modes included) to
  WebM, with sound when a live input or audio file is playing
- **Editors**: code editor and node editor; saved scenes land in a "Custom" bank and
  persist across reloads
- **Live coding link**: WebSocket client for the CLIFT live-coding server (code overlay
  + remote scene / effect / BPM control)

## 🎛️ Controls

Press **H** in the app for the full list. The essentials:

| Key | Action | | Key | Action |
|---|---|---|---|---|
| ← → | previous / next scene | | Space | pause |
| ↑ ↓ | previous / next bank | | T | transition to the other deck |
| 1 … 0 | scene 1-10 of the bank | | Z / B / V | crossfader A / middle / B |
| Tab | switch edit deck | | M | Full Auto |
| E / Shift+E | next / previous effect | | R / Shift+R | render mode / back to ASCII |
| N / J / K | primary / secondary color / gradient | | P / D / S | post-FX / preset / tint |
| A | audio input on/off | | Q | tap tempo |
| O | record | | F / Shift+F | fullscreen / projector window |
| U | hide / show the interface | | W | live-coding server |
| Shift+1 … 8 | recall snapshot | | L | text overlay |
| G / Shift+G | next split mode / re-split now | | Y / Shift+Y | feedback on/off / reset FX |

Digits use the physical number keys, so they also work on AZERTY keyboards without Shift.

Mouse: click a scene to load it into the edit deck, Shift+click to load it into the
other deck. Click a deck card in the mixer to edit that deck.

## 🛠️ Architecture

Plain JavaScript loaded with classic `<script>` tags (ES modules are blocked on
`file://`). Everything hangs off one global namespace, `CLIFT`.

```
index.html               markup + script order
css/clift.css            interface styles
js/
├── main.js              boot: wires modules, restores the session, starts the loop
├── core/
│   ├── clift.js         namespace, event bus, logging, storage helpers
│   ├── palette.js       color pairs + gradient functions
│   ├── catalog-data.js  bank + scene names
│   ├── catalog.js       scene lookup, stepping, search
│   ├── custom-scenes.js editor-made scenes (ids 1000+), persisted in localStorage
│   ├── engine.js        BPM clock, decks, mixing, effects, ASCII renderer
│   ├── render-modes.js  experimental render modes
│   ├── automation.js    Full Auto (the Director)
│   ├── session.js       snapshot / restore / autosave / file import-export
│   ├── snapshots.js     8 recallable looks
│   ├── text-overlay.js  text drawn over the output
│   └── display.js       render size (main window or projector window)
├── audio/
│   ├── audio.js         sources (demo / input / file), spectrum, bands, beats
│   └── analysis.js      advanced features (spectral shape, buildup/drop...)
├── fx/                  ASCII effects, fx-rack.js (visual FX + hits), beat-actions.js,
│                        output.js (GPU text, visual FX + feedback passes, post-FX)
├── scenes/              one file per bank (_helpers.js loads first)
├── lib/                 3D ASCII renderer used by the 3D scenes
├── io/                  recorder, WebSocket client, MIDI, projector window
├── editors/             code editor, node editor
└── ui/                  controls.js (panel + mixer), keyboard.js (keymap + help)
```

Each frame: advance the BPM clock and each deck's scene clock → analyse audio → render
deck A and B into character buffers → color them → mix through the crossfader → apply the
ASCII effect and text overlay → draw (GPU glyph shader, canvas 2D, or a render mode) →
visual FX pass with feedback (when any is on) → color FX / CRT post → mirror to the
projector window if open.

Open with `index.html?debug` to get verbose logs in the console.

## 🎨 Writing scenes

A scene is a function that fills a character buffer:

```javascript
CLIFTScenes[300] = function (buffer, width, height, time, params) {
    // buffer[y][x] = single character, cleared to ' ' before every call
    // time: milliseconds on the deck's own clock (pauses with the app, follows Speed/Pulse)
    // params persists between frames for this deck + scene: keep state on it,
    // e.g. params._particles = params._particles || [];
    const bass = params.audioInfo.bands.bass;      // 0..1 (also lowMid, mid, highMid, treble)
    const spectrum = params.audio;                 // Float32Array(64), log-spaced, 0..1
    const beat = params.audioInfo.beat.detected;   // true on detected beats
    const phase = params.beatPhase;                // 0..1 position in the current beat (BPM clock)
    const speed = params.param1;                   // deck knob, 0..1 (default 0.5)

    const y = Math.floor(height / 2);
    const len = Math.floor(bass * width);
    for (let x = 0; x < len; x++) buffer[y][x] = beat ? '█' : '▓';
};
```

To ship it with the app, add it to a file in `js/scenes/` (or a new file plus a
`<script>` tag in `index.html`) and give it a bank entry and name in
`js/core/catalog-data.js`. For quick experiments use the code editor: **Session &
tools → Code editor** opens the current scene as an editable copy; **Save** puts it
in the Custom bank.

A scene that throws is disabled and shown as crashed (marked red in the browser)
instead of stopping the show; the error is printed in the console.

## 🔌 Live-coding WebSocket

Default `ws://localhost:7745` (editable in the panel, saved locally). Messages are JSON:

```javascript
{ player: 0, code: '...', executed: '...', active: true, duration: 5000 }  // code overlay
{ type: 'scene_change', deck: 0, sceneId: 42 }
{ type: 'effect_change', effect: 'Glitch' }      // name or index
{ type: 'bpm_change', bpm: 128 }
```

Local scene / effect / BPM changes are sent with the same shapes.

## 🐛 Known limits

- Experimental render modes and post-FX are GPU-heavy; without hardware acceleration
  some modes drop to low frame rates.
- Web MIDI works in Chromium-based browsers; Firefox does not allow it from a local file.
- The projector window is fed by the main window, so keep the main window visible:
  browsers pause rendering for minimized (and on some systems fully covered) windows.
- Recording uses MediaRecorder (WebM); quality depends on the browser.

## 📜 License

**MIT License**

## 💫 Credits

**Developed by the crashserver.fr team** · **Happy VJing!** 🎵✨
