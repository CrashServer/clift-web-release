// Visual FX rack: GPU effects applied to the whole output image.
//
//   split     - dynamic screen split: panels re-cut on the beat (each shows its
//               own window of the image) or sliding slices
//   glitch    - block displacement, scanline tears, RGB split, channel swaps
//   explode   - shards flying away from the center (hit) or a steady shatter, shockwave
//   displace  - flowing noise displacement, "liquid" (image displaced by its brightness)
//   feedback  - the previous frame zoomed / rotated / hue-shifted under the new one
//   tiles     - repeated / mirrored tiles; plus bass zoom, spin, wave, pixelate
//   color     - hue cycling, posterize, invert / strobe flashes
//
// Settings are plain numbers (saved in sessions and snapshots). Hits are
// envelopes fired by buttons, MIDI, beat actions and the Director.
// update() turns settings + audio + envelopes into the uniforms output.js uses.

(function () {
    const GRIDS = [
        { name: 'Off', cols: 1, rows: 1, mirror: false },
        { name: '2×1', cols: 2, rows: 1, mirror: false },
        { name: '1×2', cols: 1, rows: 2, mirror: false },
        { name: '2×2', cols: 2, rows: 2, mirror: false },
        { name: '3×3', cols: 3, rows: 3, mirror: false },
        { name: '4×4', cols: 4, rows: 4, mirror: false },
        { name: 'Mirror 2×1', cols: 2, rows: 1, mirror: true },
        { name: 'Mirror 2×2', cols: 2, rows: 2, mirror: true },
        { name: 'Mirror 3×3', cols: 3, rows: 3, mirror: true },
        { name: 'Mirror 4×4', cols: 4, rows: 4, mirror: true }
    ];

    const SPLITS = ['Off', 'Panels', 'Slices ═', 'Slices ║'];
    const SPLIT_EVERY = [0, 1, 2, 4, 8]; // beats between re-cuts, 0 = only on hits

    const DEFAULTS = {
        split: 0,           // index into SPLITS
        splitEvery: 2,      // re-cut / re-slide every N beats
        sliceAmount: 0.35,  // how far slices slide
        glitch: 0,          // 0..1
        shatter: 0,         // 0..1 steady cracked-glass amount (breathes with the bass)
        displace: 0,        // 0..1 flowing noise displacement
        liquid: 0,          // 0..1 brightness displacement
        feedback: 0,        // 0..0.97 how much of the previous frame stays
        fbZoom: 0.02,       // -0.1..0.1 feedback zoom per frame (+ = tunnel out)
        fbRotate: 0,        // -1..1 feedback rotation speed
        fbHue: 0,           // 0..1 hue drift of the trails
        fbLevel: 0,         // 0..1 how much loudness boosts feedback
        grid: 0,            // index into GRIDS
        bassZoom: 0,        // 0..1 bass pumps the image zoom
        spin: 0,            // -1..1 continuous image rotation
        wave: 0,            // 0..1 wavy distortion
        pixelate: 0,        // 0..1 mosaic
        hueSpeed: 0,        // 0..1 continuous hue rotation
        posterize: 0,       // 0..1 color banding
        invert: false
    };

    // Looks: complete rack settings. `energy` hints the Director at where they fit.
    const look = (energy, s) => ({ energy, ...DEFAULTS, ...s });
    const LOOKS = {
        clean: look(0.1, {}),
        trails: look(0.3, { feedback: 0.82, fbZoom: 0, fbLevel: 0.3 }),
        liquid: look(0.35, { liquid: 0.6, displace: 0.3, feedback: 0.8, fbZoom: 0.005, fbHue: 0.2 }),
        melt: look(0.45, { feedback: 0.9, fbZoom: -0.015, fbHue: 0.35, wave: 0.45 }),
        mirror: look(0.5, { grid: 7, bassZoom: 0.5 }),
        panels: look(0.55, { split: 1, splitEvery: 2, bassZoom: 0.3 }),
        tunnel: look(0.6, { feedback: 0.88, fbZoom: 0.035, fbRotate: 0.15, fbHue: 0.15, bassZoom: 0.4 }),
        slicer: look(0.6, { split: 2, splitEvery: 1, sliceAmount: 0.5, feedback: 0.5, fbZoom: 0 }),
        tiles: look(0.65, { grid: 4, feedback: 0.6, fbZoom: 0.02, bassZoom: 0.35 }),
        glitch: look(0.7, { glitch: 0.45, split: 3, splitEvery: 2, sliceAmount: 0.2 }),
        mosaic: look(0.7, { grid: 8, pixelate: 0.45, posterize: 0.5, bassZoom: 0.4 }),
        datamosh: look(0.75, { glitch: 0.3, liquid: 0.5, displace: 0.2, feedback: 0.9, fbZoom: 0 }),
        shatter: look(0.8, { shatter: 0.35, feedback: 0.6, fbZoom: 0.02, bassZoom: 0.3 }),
        acid: look(0.85, { grid: 9, hueSpeed: 0.4, feedback: 0.85, fbHue: 0.6, displace: 0.25, bassZoom: 0.5 }),
        storm: look(0.95, { split: 1, splitEvery: 1, glitch: 0.3, displace: 0.3, feedback: 0.7, fbZoom: 0.05, bassZoom: 0.6 })
    };

    // Envelope lengths in ms. 'explode' / 'shock' run 0 -> 1 (progress), the rest 1 -> 0.
    const ENVELOPES = { strobe: 90, invert: 140, punch: 220, burst: 600, glitch: 450, split: 500, explode: 750, shock: 650 };
    const PROGRESS = new Set(['explode', 'shock']);

    const rand = Math.random;

    const rack = {
        GRIDS,
        SPLITS,
        SPLIT_EVERY,
        LOOKS,
        lookNames: Object.keys(LOOKS),
        look: 'clean',
        settings: { ...DEFAULTS },
        env: { strobe: 0, invert: 0, punch: 0, burst: 0, glitch: 0, split: 0, explode: 0, shock: 0 },
        hueOffset: 0,
        angle: 0,
        panels: new Float32Array(0),
        panelViews: new Float32Array(0),
        slices: 10,
        sliceSeeds: [1, 2],
        sliceMix: 1,
        glitchSeed: 1,
        explodeCenter: [0.5, 0.5],
        u: null, // computed uniforms

        init() {
            this.newPanels();
            CLIFT.events.on('clock-beat', (count) => {
                const every = this.settings.splitEvery;
                if (this.settings.split > 0 && every > 0 && count % every === 0) this.resplit();
            });
            CLIFT.events.on('beat', () => {
                if (this.settings.glitch > 0) this.glitchSeed = rand() * 100;
            });
        },

        set(key, value) {
            this.settings[key] = value;
            this.look = '';
            CLIFT.events.emit('state');
        },

        applyLook(name) {
            const l = LOOKS[name];
            if (!l) return;
            for (const k of Object.keys(DEFAULTS)) this.settings[k] = l[k];
            this.look = name;
            if (this.settings.split) this.resplit();
            CLIFT.events.emit('state');
        },

        reset() {
            this.applyLook('clean');
            this.hueOffset = 0;
            this.angle = 0;
        },

        stepGrid(dir = 1) {
            this.set('grid', CLIFT.util.wrap(this.settings.grid + dir, GRIDS.length));
        },

        stepSplit(dir = 1) {
            this.set('split', CLIFT.util.wrap(this.settings.split + dir, SPLITS.length));
            this.resplit();
        },

        toggleFeedback() {
            this.set('feedback', this.settings.feedback > 0 ? 0 : 0.85);
        },

        // ---- dynamic split layouts ----------------------------------------------

        resplit() {
            if (this.settings.split === 1 || this.env.split > 0) this.newPanels();
            else this.newSlices();
        },

        // Random binary split of the screen into 2-6 panels, each with its own view.
        newPanels() {
            const count = 2 + Math.floor(rand() * 5);
            let rects = [[0, 0, 1, 1]];
            while (rects.length < count) {
                rects.sort((a, b) => b[2] * b[3] - a[2] * a[3]);
                const [x, y, w, h] = rects.shift();
                const t = 0.3 + rand() * 0.4;
                if (w * 16 > h * 9) rects.push([x, y, w * t, h], [x + w * t, y, w * (1 - t), h]);
                else rects.push([x, y, w, h * t], [x, y + h * t, w, h * (1 - t)]);
            }
            this.panels = new Float32Array(rects.flat());
            this.panelViews = new Float32Array(rects.flatMap(() => [
                (rand() - 0.5) * 0.4,
                (rand() - 0.5) * 0.3,
                [1, 1, 1.4, 2, 0.7][Math.floor(rand() * 5)],
                rand() < 0.3 ? 1 : 0
            ]));
        },

        newSlices() {
            this.sliceSeeds = [this.sliceSeeds[1], rand() * 100];
            this.sliceMix = 0;
            this.slices = 6 + Math.floor(rand() * 14);
        },

        // ---- hits -------------------------------------------------------------------

        hit(kind, strength = 1) {
            if (kind === 'hueJump') {
                this.hueOffset = (this.hueOffset + 0.2 + rand() * 0.6) % 1;
            } else if (kind === 'grid') {
                let g;
                do { g = 1 + Math.floor(rand() * (GRIDS.length - 1)); } while (g === this.settings.grid);
                this.settings.grid = g;
                this.look = '';
                CLIFT.events.emit('state');
            } else if (kind === 'split') {
                this.env.split = 1;
                this.resplit();
            } else if (PROGRESS.has(kind)) {
                this.env[kind] = 0.0001; // starts the progress envelope
                this.explodeCenter = rand() < 0.6 ? [0.5, 0.5] : [0.25 + rand() * 0.5, 0.25 + rand() * 0.5];
                this.explodeStrength = strength;
            } else if (kind in this.env) {
                this.env[kind] = Math.max(this.env[kind], strength);
                if (kind === 'glitch') this.glitchSeed = rand() * 100;
            }
        },

        // Anything that needs the full-screen FX pass this frame?
        get active() {
            const s = this.settings, e = this.env;
            return s.feedback > 0 || s.grid > 0 || s.split > 0 || s.glitch > 0 || s.shatter > 0 || s.displace > 0 ||
                s.liquid > 0 || s.bassZoom > 0 || s.spin !== 0 || s.wave > 0 || s.pixelate > 0 || s.hueSpeed > 0 ||
                s.posterize > 0 || s.invert || this.hueOffset !== 0 || Object.values(e).some(v => v > 0.01);
        },

        update(dt, audio) {
            const s = this.settings, e = this.env;
            for (const k of Object.keys(e)) {
                if (PROGRESS.has(k)) e[k] = e[k] > 0 ? (e[k] + dt / ENVELOPES[k] >= 1 ? 0 : e[k] + dt / ENVELOPES[k]) : 0;
                else e[k] = Math.max(0, e[k] - dt / ENVELOPES[k]);
            }
            const bass = audio ? audio.bands.bass : 0;
            const level = audio ? audio.volume : 0;
            const beat = audio ? audio.beat.intensity : 0;
            const sec = dt / 1000;

            this.angle += s.spin * sec * 1.5;
            this.hueOffset = (this.hueOffset + s.hueSpeed * sec * 0.25) % 1;
            this.sliceMix = Math.min(1, this.sliceMix + dt / 140);
            const glitch = Math.min(1, s.glitch * (0.5 + beat) + e.glitch * 0.9);
            if (glitch > 0 && rand() < sec * 14) this.glitchSeed = rand() * 100; // re-roll ~14x per second
            const grid = GRIDS[s.grid] || GRIDS[0];
            const explode = e.explode > 0 ? Math.sin(Math.PI * e.explode) * (this.explodeStrength || 1) : 0;

            this.u = {
                gridCols: grid.cols,
                gridRows: grid.rows,
                gridMirror: grid.mirror,
                splitMode: s.split || (e.split > 0 ? 1 : 0),
                panels: this.panels,
                panelViews: this.panelViews,
                slices: this.slices,
                sliceAmount: s.sliceAmount * (0.6 + bass * 0.8),
                sliceSeeds: this.sliceSeeds,
                sliceMix: this.sliceMix,
                shatter: Math.max(s.shatter * (0.3 + bass), explode),
                explodeCenter: this.explodeCenter,
                shock: e.shock > 0 ? e.shock * 1.4 : -1,
                shockAmp: 1 - e.shock,
                zoom: 1 + s.bassZoom * bass * 0.35 + e.punch * 0.3,
                rotate: this.angle,
                displace: s.displace * (0.6 + bass * 0.8),
                liquid: s.liquid,
                wave: s.wave,
                pixelate: s.pixelate > 0 ? Math.round(160 - s.pixelate * 140) : 0,
                glitch,
                glitchSeed: this.glitchSeed,
                feedback: Math.min(0.97, s.feedback + s.fbLevel * level * 0.25 + e.burst * Math.max(0, 0.9 - s.feedback)),
                fbZoom: s.fbZoom + e.burst * 0.03,
                fbRotate: s.fbRotate * 0.02,
                fbHue: s.fbHue * 0.05,
                hue: this.hueOffset,
                posterize: s.posterize > 0 ? Math.round(12 - s.posterize * 9) : 0,
                invert: s.invert ? 1 - e.invert : e.invert,
                strobe: e.strobe
            };
        },

        getState() {
            return { look: this.look, settings: { ...this.settings } };
        },

        setState(state) {
            if (!state || !state.settings) return;
            for (const k of Object.keys(DEFAULTS)) {
                if (typeof state.settings[k] === typeof DEFAULTS[k]) this.settings[k] = state.settings[k];
            }
            this.settings.grid = CLIFT.util.clamp(this.settings.grid | 0, 0, GRIDS.length - 1);
            this.settings.split = CLIFT.util.clamp(this.settings.split | 0, 0, SPLITS.length - 1);
            if (!SPLIT_EVERY.includes(this.settings.splitEvery)) this.settings.splitEvery = DEFAULTS.splitEvery;
            this.look = LOOKS[state.look] ? state.look : '';
            CLIFT.events.emit('state');
        }
    };

    CLIFT.fx = rack;
})();
