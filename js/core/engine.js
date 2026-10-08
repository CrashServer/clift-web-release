// CLIFT engine: BPM clock, two decks, crossfader mixing, ASCII effects and the
// ASCII renderer. Experimental render modes live in render-modes.js, the final
// output/post-processing stage in fx/postfx.js.

(function () {
    const { clamp, wrap } = CLIFT.util;

    const EFFECTS = ['None', 'Invert', 'Mirror', 'Rotate', 'Zoom', 'Pixelate',
        'Wave', 'Ripple', 'Glitch', 'RGB Shift', 'Blur', 'Edge',
        'Glow', 'ASCII Gradient', 'Scanlines', 'Chromatic', 'Character Emission',
        '3D Perspective', '3D Cylinder', '3D Sphere', '3D Tunnel',
        'Edge Detection', 'Emboss', 'Motion Blur', 'Sharpen', 'ASCII Blur', 'Dither'];

    const MIX_MODES = ['Auto', 'Dissolve', 'Checker', 'H-Stripes', 'V-Stripes', 'Wipe', 'Radial', 'Glitch'];
    const COLOR_MODES = ['Full', 'Mono', 'Accent'];
    const RESOLUTIONS = [[40, 12], [60, 18], [80, 24], [100, 30], [120, 36], [160, 48], [200, 60]];
    const TRANSITION_BEATS = [1, 2, 4, 8, 16];

    // Glyphs that count as "heavy" for the Accent color mode.
    const ACCENT_CHARS = new Set('#@%&*█▓▒■●◉◈▀▄▌▐XOW$'.split(''));

    function makeDeck(sceneId, primary, secondary, gradient) {
        return {
            sceneId,
            primaryColor: primary,
            secondaryColor: secondary,
            gradientType: gradient,
            params: { param1: 0.5, param2: 0.5, param3: 0.5 },
            speed: 0.5,   // 0..1 -> 0.25x..4x scene time
            pulse: 0.25,  // 0..1 -> how much bass / beats push scene time forward
            time: 10000,  // the deck's own scene clock (ms)
            state: {}     // persistent params object for the current scene (see buildParams)
        };
    }

    // Speed knob 0..1 -> time multiplier 0.25..4 (0.5 = normal).
    function speedFactor(v) {
        return Math.pow(2, (v - 0.5) * 4);
    }

    class CLIFTEngine {
        constructor({ container, width = 80, height = 24 }) {
            this.container = container;
            this.width = width;
            this.height = height;

            this.effects = EFFECTS;
            this.mixModes = MIX_MODES;
            this.colorModes = COLOR_MODES;
            this.resolutions = RESOLUTIONS;
            this.transitionBeatOptions = TRANSITION_BEATS;
            this.renderModes = CLIFT.renderModes.map(m => m.name);

            this.decks = [makeDeck(0, 2, 6, 0), makeDeck(10, 1, 4, 4)];
            this.activeDeck = 0;      // deck the controls edit
            this.crossfader = 0;      // 0 = deck A on air, 1 = deck B
            this.mixMode = 0;
            this.currentEffect = 0;
            this.renderMode = 0;
            this.colorEnabled = true;
            this.invertColors = false;
            this.colorMode = 0;

            this.bpm = 120;
            this.clock = { time: 0, phase: 0, count: 0, bpm: 120 };
            this.tapTimes = [];
            this.transition = null;
            this.transitionBeats = 4;

            this.paused = false;
            this.running = false;
            this.frameCount = 0;
            this.fps = 0;
            this.lastFrameTime = 0;
            this.fpsFrames = 0;
            this.fpsSince = 0;

            this.asciiCanvas = document.createElement('canvas');
            this.asciiCtx = this.asciiCanvas.getContext('2d', { alpha: false });
            this.modeCanvas = document.createElement('canvas');
            this.experimentalCtx = this.modeCanvas.getContext('2d');
            for (const canvas of [this.asciiCanvas, this.modeCanvas]) {
                canvas.style.visibility = 'hidden';
                container.appendChild(canvas);
            }

            this.allocateBuffers();
            this.resize(CLIFT.display.size());
            CLIFT.events.on('display-resize', (size) => this.resize(size));
        }

        // ---- buffers & sizing ----------------------------------------------

        allocateBuffers() {
            const grid = (fill) => Array.from({ length: this.height }, () => new Array(this.width).fill(fill));
            this.bufferA = grid(' ');
            this.bufferB = grid(' ');
            this.outputBuffer = grid(' ');
            this.colorBufferA = grid(7);
            this.colorBufferB = grid(7);
            this.outputColorBuffer = grid(7);
            this.glyphLists = Array.from({ length: CLIFT.palette.count + 1 }, () => []);
            this.bgLists = Array.from({ length: CLIFT.palette.count + 1 }, () => []);
        }

        resize({ width: w, height: h, dpr }) {
            this.asciiCanvas.width = Math.round(w * dpr);
            this.asciiCanvas.height = Math.round(h * dpr);
            // Experimental modes use fixed pixel sizes, so they render at CSS resolution.
            this.modeCanvas.width = w;
            this.modeCanvas.height = h;
            this.dpr = dpr;
            this.updateCellMetrics();
            CLIFT.events.emit('resize', { width: this.asciiCanvas.width, height: this.asciiCanvas.height });
        }

        updateCellMetrics() {
            // Cell size in canvas pixels; the font fills the cell as far as the
            // glyph aspect (~0.6 for monospace) allows.
            this.charWidth = this.asciiCanvas.width / this.width;
            this.charHeight = this.asciiCanvas.height / this.height;
            this.fontSize = Math.max(4, Math.min(this.charHeight * 0.92, this.charWidth / 0.6));
            const ctx = this.asciiCtx;
            ctx.font = `${this.fontSize}px "Courier New", Courier, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
        }

        setResolution(width, height) {
            if (width === this.width && height === this.height) return;
            this.width = width;
            this.height = height;
            this.allocateBuffers();
            this.updateCellMetrics();
            for (const deck of this.decks) deck.state = {}; // scene state is sized to the grid
            if (window.CLIFT3DRenderer) window.CLIFT3DRenderer.initialized = false;
            CLIFT.catalog.broken.clear();
            CLIFT.events.emit('state');
        }

        stepResolution(dir) {
            const i = RESOLUTIONS.findIndex(r => r[0] === this.width && r[1] === this.height);
            const next = RESOLUTIONS[clamp((i < 0 ? 2 : i) + dir, 0, RESOLUTIONS.length - 1)];
            this.setResolution(next[0], next[1]);
        }

        // ---- main loop -------------------------------------------------------

        start() {
            this.running = true;
            this.lastFrameTime = performance.now();
            this.fpsSince = this.lastFrameTime;
            const loop = (now) => {
                if (!this.running) return;
                this.frame(now);
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }

        frame(now) {
            // Clamp so a background tab doesn't jump the clock, but keep beats at low fps.
            const dt = Math.min(250, now - this.lastFrameTime);
            this.lastFrameTime = now;

            this.fpsFrames++;
            if (now - this.fpsSince >= 500) {
                this.fps = Math.round(this.fpsFrames * 1000 / (now - this.fpsSince));
                this.fpsFrames = 0;
                this.fpsSince = now;
            }

            if (!this.paused) {
                this.advanceClock(dt);
                this.audioFrame = CLIFT.audio.update(this.clock);
                this.advanceDeckTime(dt);
                CLIFT.director.update(dt, this.audioFrame);
                CLIFT.fx.update(dt, this.audioFrame);
                this.updateTransition();

                this.renderDeck(this.decks[0], this.bufferA, this.colorBufferA);
                this.renderDeck(this.decks[1], this.bufferB, this.colorBufferB);
                this.mixBuffers();
                if (this.currentEffect > 0) this.applyEffect();
                CLIFT.textOverlay.apply(this);

                if (this.renderMode !== 0) {
                    this.drawRenderMode();
                    CLIFT.output.renderCanvas(this.modeCanvas);
                } else if (CLIFT.output.gpuText) {
                    CLIFT.output.renderGrid(this);
                } else {
                    this.drawASCII();
                    CLIFT.output.renderCanvas(this.asciiCanvas);
                }
                this.frameCount++;
            }

            CLIFT.events.emit('frame', this);
        }

        // ---- BPM clock ---------------------------------------------------------

        advanceClock(dt) {
            const c = this.clock;
            c.time += dt;
            c.bpm = this.bpm;
            c.phase += dt * this.bpm / 60000;
            while (c.phase >= 1) {
                c.phase -= 1;
                c.count++;
                CLIFT.events.emit('clock-beat', c.count);
            }
        }

        // Each deck has its own scene clock: Speed scales it, Pulse lets bass and
        // beats push it forward, so every scene moves with the music.
        advanceDeckTime(dt) {
            const a = this.audioFrame;
            const drive = a.bands.bass * 1.5 + a.beat.intensity * 3;
            for (const deck of this.decks) {
                deck.time += dt * speedFactor(deck.speed) * (1 + deck.pulse * drive);
            }
        }

        setDeckSpeed(index, v) {
            this.decks[index].speed = clamp(v, 0, 1);
            CLIFT.events.emit('state');
        }

        setDeckPulse(index, v) {
            this.decks[index].pulse = clamp(v, 0, 1);
            CLIFT.events.emit('state');
        }

        setBPM(bpm) {
            this.bpm = clamp(Math.round(bpm), 40, 240);
            CLIFT.events.emit('state');
            CLIFT.events.emit('bpm', this.bpm);
        }

        // Tap tempo; every tap also re-aligns the beat phase (downbeat sync).
        tap() {
            const now = performance.now();
            const taps = this.tapTimes;
            if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
            taps.push(now);
            if (taps.length > 8) taps.shift();
            if (taps.length >= 2) {
                const avg = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
                this.setBPM(60000 / avg);
            }
            this.syncDownbeat();
            return taps.length;
        }

        // Snap the beat phase to 0 "now" (tap tempo, MIDI clock). If we were late
        // in the beat, count it as the next beat so no beat event is lost.
        syncDownbeat() {
            const c = this.clock;
            if (c.phase > 0.5) {
                c.count++;
                CLIFT.events.emit('clock-beat', c.count);
            }
            c.phase = 0;
        }

        // ---- decks & scenes ----------------------------------------------------

        deck(index = this.activeDeck) {
            return this.decks[index];
        }

        setScene(sceneId, deckIndex = this.activeDeck) {
            if (!CLIFT.catalog.resolve(sceneId)) return false;
            const deck = this.decks[deckIndex];
            if (deck.sceneId !== sceneId) deck.state = {};
            deck.sceneId = sceneId;
            CLIFT.events.emit('state');
            CLIFT.events.emit('scene', deckIndex);
            return true;
        }

        stepScene(dir, deckIndex = this.activeDeck) {
            this.setScene(CLIFT.catalog.step(this.decks[deckIndex].sceneId, dir), deckIndex);
        }

        stepBank(dir, deckIndex = this.activeDeck) {
            this.setScene(CLIFT.catalog.stepBank(this.decks[deckIndex].sceneId, dir), deckIndex);
        }

        // Number keys pick the Nth scene of the active deck's current bank.
        sceneInBank(n, deckIndex = this.activeDeck) {
            const banks = CLIFT.catalog.allBanks();
            const bank = banks[CLIFT.catalog.bankIndexOf(this.decks[deckIndex].sceneId)];
            if (bank.ids[n] !== undefined) this.setScene(bank.ids[n], deckIndex);
        }

        selectDeck(index) {
            this.activeDeck = index ? 1 : 0;
            CLIFT.events.emit('state');
        }

        setCrossfader(value) {
            this.crossfader = clamp(value, 0, 1);
            CLIFT.events.emit('crossfader', this.crossfader);
        }

        // Deck currently contributing less to the output (where the next scene is cued).
        get offAirDeck() {
            return this.crossfader < 0.5 ? 1 : 0;
        }

        // Animated crossfade toward `target` (0 = A, 1 = B), default: the other side.
        startTransition(target) {
            if (target === undefined) target = this.crossfader < 0.5 ? 1 : 0;
            const ms = this.transitionBeats * 60000 / this.bpm;
            this.transition = { from: this.crossfader, to: target, start: this.clock.time, duration: ms };
            CLIFT.events.emit('transition', target);
        }

        updateTransition() {
            const t = this.transition;
            if (!t) return;
            const p = clamp((this.clock.time - t.start) / t.duration, 0, 1);
            const eased = p * p * (3 - 2 * p);
            this.setCrossfader(t.from + (t.to - t.from) * eased);
            if (p >= 1) this.transition = null;
        }

        // Scenes keep state on the params object (params._cells, params._particles...),
        // so each deck reuses one object per scene instead of creating a new one
        // every frame. It is reset when the deck's scene or the grid size changes.
        buildParams(deck) {
            const audio = this.audioFrame;
            const p = deck.state;
            p.beat = this.clock.phase;
            p.beatPhase = this.clock.phase;
            p.beatCount = this.clock.count;
            p.bpm = this.bpm;
            p.frame = this.frameCount;
            p.audio = audio.spectrum;
            p.audioData = audio.spectrum;
            p.audioInfo = audio;
            p.deckParams = deck.params;
            p.param1 = deck.params.param1;
            p.param2 = deck.params.param2;
            p.param3 = deck.params.param3;
            return p;
        }

        renderDeck(deck, buffer, colorBuffer) {
            for (let y = 0; y < this.height; y++) buffer[y].fill(' ');

            const id = deck.sceneId;
            const fn = CLIFT.catalog.resolve(id);
            if (fn && !CLIFT.catalog.broken.has(id)) {
                try {
                    fn(buffer, this.width, this.height, deck.time, this.buildParams(deck));
                } catch (e) {
                    CLIFT.catalog.broken.add(id);
                    CLIFT.warn(`scene ${id} (${CLIFT.catalog.name(id)}) crashed and was disabled:`, e);
                    CLIFT.events.emit('scene-error', { id, error: e });
                }
            }
            if (!fn || CLIFT.catalog.broken.has(id)) this.renderPlaceholder(buffer, id, !fn);
            this.colorize(deck, buffer, colorBuffer);
        }

        renderPlaceholder(buffer, id, missing) {
            const label = missing ? `SCENE ${id} NOT FOUND` : `SCENE ${id} CRASHED - SEE CONSOLE`;
            const chars = '░▒▓';
            const t = this.frameCount / 20;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const v = Math.sin(Math.hypot(x - this.width / 2, (y - this.height / 2) * 2) * 0.3 - t);
                    buffer[y][x] = v > 0.6 ? chars[Math.floor((v - 0.6) * 7.4)] || '▓' : ' ';
                }
            }
            const row = buffer[this.height >> 1];
            const start = Math.max(0, (this.width - label.length) >> 1);
            for (let i = 0; i < label.length && start + i < this.width; i++) row[start + i] = label[i];
        }

        colorize(deck, buffer, colorBuffer) {
            const time = this.clock.time;
            // Volume shifts the gradient a little; with Pulse, beats flash the secondary color.
            const lift = this.audioFrame.volume * 0.3 + deck.pulse * this.audioFrame.beat.intensity * 0.9;
            const { primaryColor: p, secondaryColor: s, gradientType: g } = deck;
            const mode = this.colorMode;
            for (let y = 0; y < this.height; y++) {
                const row = buffer[y];
                const colors = colorBuffer[y];
                for (let x = 0; x < this.width; x++) {
                    const ch = row[x];
                    if (!ch || ch === ' ') {
                        colors[x] = 7;
                    } else if (mode === 1) {
                        colors[x] = p;
                    } else if (mode === 2) {
                        colors[x] = ACCENT_CHARS.has(ch) ? s : p;
                    } else {
                        const f = CLIFT.palette.gradientFactor(g, x, y, this.width, this.height, time) + lift;
                        colors[x] = f > 0.5 ? s : p;
                    }
                }
            }
        }

        // ---- mixing ------------------------------------------------------------

        mixBuffers() {
            const c = this.crossfader;
            const { bufferA, bufferB, colorBufferA, colorBufferB, outputBuffer, outputColorBuffer } = this;
            const w = this.width;
            const h = this.height;

            if (c <= 0 || c >= 1) {
                const src = c <= 0 ? bufferA : bufferB;
                const srcColors = c <= 0 ? colorBufferA : colorBufferB;
                for (let y = 0; y < h; y++) {
                    const o = outputBuffer[y], oc = outputColorBuffer[y], s = src[y], sc = srcColors[y];
                    for (let x = 0; x < w; x++) { o[x] = s[x]; oc[x] = sc[x]; }
                }
                return;
            }

            // Each cell gets a threshold in [0, 1); it shows deck A while threshold >= crossfader.
            // Patterns only differ in how thresholds are laid out, so every mode fades smoothly.
            let mode = this.mixMode;
            if (mode === 0) mode = 2 + Math.floor(this.clock.time / 2000) % 3; // Auto: rotate patterns
            const rowNoise = mode === 7 ? Array.from({ length: h }, () => Math.random()) : null;
            const cx = w / 2, cy = h / 2, maxR = Math.hypot(cx, cy * 2);

            for (let y = 0; y < h; y++) {
                const o = outputBuffer[y], oc = outputColorBuffer[y];
                for (let x = 0; x < w; x++) {
                    let t;
                    switch (mode) {
                        case 2: t = ((x + y) & 1) * 0.5 + Math.random() * 0.5; break;
                        case 3: t = ((y & 3) < 2 ? 0 : 0.5) + Math.random() * 0.5; break;
                        case 4: t = ((x & 3) < 2 ? 0 : 0.5) + Math.random() * 0.5; break;
                        case 5: t = x / w; break;
                        case 6: t = Math.hypot(x - cx, (y - cy) * 2) / maxR; break;
                        case 7: t = rowNoise[y]; break;
                        default: t = Math.random();
                    }
                    const useA = t >= c;
                    const sb = useA ? bufferA : bufferB;
                    const sc = useA ? colorBufferA : colorBufferB;
                    o[x] = sb[y][x];
                    oc[x] = sc[y][x];
                }
            }
        }

        // ---- effects -----------------------------------------------------------

        applyEffect() {
            const fx = window.CLIFTEffects && window.CLIFTEffects[EFFECTS[this.currentEffect]];
            if (!fx) return;
            try {
                fx(this.outputBuffer, this.width, this.height, {
                    frame: this.frameCount,
                    beat: this.clock.phase,
                    audio: this.audioFrame.spectrum,
                    audioInfo: this.audioFrame
                });
            } catch (e) {
                CLIFT.warn(`effect ${EFFECTS[this.currentEffect]} failed:`, e);
                this.currentEffect = 0;
                CLIFT.events.emit('state');
            }
        }

        setEffect(index) {
            this.currentEffect = wrap(index, EFFECTS.length);
            CLIFT.events.emit('state');
            CLIFT.events.emit('effect', this.currentEffect);
        }

        // ---- colors ------------------------------------------------------------

        setDeckColor(which, value, deckIndex = this.activeDeck) {
            const deck = this.decks[deckIndex];
            const key = which === 'primary' ? 'primaryColor' : 'secondaryColor';
            deck[key] = wrap(value - 1, CLIFT.palette.count) + 1;
            CLIFT.events.emit('state');
        }

        stepDeckColor(which, dir, deckIndex = this.activeDeck) {
            const deck = this.decks[deckIndex];
            const current = which === 'primary' ? deck.primaryColor : deck.secondaryColor;
            this.setDeckColor(which, current + dir, deckIndex);
        }

        stepGradient(dir, deckIndex = this.activeDeck) {
            const deck = this.decks[deckIndex];
            deck.gradientType = wrap(deck.gradientType + dir, CLIFT.palette.gradients.length);
            CLIFT.events.emit('state');
        }

        randomizeColors(deckIndex = this.activeDeck) {
            const deck = this.decks[deckIndex];
            deck.primaryColor = 1 + CLIFT.util.randInt(7);
            do { deck.secondaryColor = 1 + CLIFT.util.randInt(7); } while (deck.secondaryColor === deck.primaryColor);
            deck.gradientType = CLIFT.util.randInt(CLIFT.palette.gradients.length);
            CLIFT.events.emit('state');
        }

        // ---- drawing -----------------------------------------------------------

        drawASCII() {
            const ctx = this.asciiCtx;
            const cw = this.charWidth, ch = this.charHeight;
            const pal = CLIFT.palette;
            const invert = this.invertColors;
            const glyphLists = this.glyphLists, bgLists = this.bgLists;
            for (const list of glyphLists) list.length = 0;
            for (const list of bgLists) list.length = 0;

            for (let y = 0; y < this.height; y++) {
                const row = this.outputBuffer[y], colors = this.outputColorBuffer[y];
                for (let x = 0; x < this.width; x++) {
                    const c = row[x];
                    if (!c || c === ' ') continue;
                    const id = this.colorEnabled ? colors[x] : 2;
                    const idx = y * this.width + x;
                    glyphLists[id].push(idx);
                    const pair = pal.pair(id);
                    if ((invert ? pair.fg : pair.bg) !== '#000000') bgLists[id].push(idx);
                }
            }

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.asciiCanvas.width, this.asciiCanvas.height);

            for (let id = 1; id < bgLists.length; id++) {
                const list = bgLists[id];
                if (!list.length) continue;
                const pair = pal.pair(id);
                ctx.fillStyle = invert ? pair.fg : pair.bg;
                for (const idx of list) {
                    const x = idx % this.width, y = (idx / this.width) | 0;
                    ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch));
                }
            }

            for (let id = 1; id < glyphLists.length; id++) {
                const list = glyphLists[id];
                if (!list.length) continue;
                const pair = pal.pair(id);
                ctx.fillStyle = invert ? pair.bg : pair.fg;
                for (const idx of list) {
                    const x = idx % this.width, y = (idx / this.width) | 0;
                    ctx.fillText(this.outputBuffer[y][x], (x + 0.5) * cw, (y + 0.5) * ch);
                }
            }
        }

        drawRenderMode() {
            const mode = CLIFT.renderModes[this.renderMode];
            const ctx = this.experimentalCtx;
            const canvas = this.modeCanvas;
            ctx.save();
            if (mode.method !== 'renderParticleMode') {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            try {
                this[mode.method](ctx, canvas.width / this.width, canvas.height / this.height, this.frameCount * 0.016);
            } catch (e) {
                CLIFT.warn(`render mode ${mode.name} failed, back to ASCII:`, e);
                this.setRenderMode(0);
            }
            ctx.restore();
        }

        setRenderMode(index) {
            this.renderMode = wrap(index, CLIFT.renderModes.length);
            CLIFT.events.emit('state');
        }

        // ---- misc --------------------------------------------------------------

        togglePause() {
            this.paused = !this.paused;
            CLIFT.events.emit('state');
            return this.paused;
        }
    }

    Object.assign(CLIFTEngine.prototype, CLIFT.renderModeMethods);
    CLIFT.Engine = CLIFTEngine;
    window.CLIFTEngine = CLIFTEngine;
})();
