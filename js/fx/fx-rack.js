// Visual FX rack: GPU effects applied to the whole output image.
//
//   feedback  - the previous frame, zoomed / rotated / hue-shifted, kept under
//               the new one (trails, tunnels, smears)
//   grid      - split the image into tiles, mirrored tiles or a kaleidoscope
//   warp      - bass zoom, rotation, wave, pixelate
//   color     - hue rotation, posterize, invert / strobe flashes
//
// Settings are plain numbers (saved in sessions and snapshots). Momentary
// "hits" (strobe, invert flash, zoom punch, hue jump, feedback burst) are
// envelopes that decay over a few frames; beat actions and the Director fire them.
// update() turns settings + audio + envelopes into the uniforms output.js uses.

(function () {
    const GRIDS = [
        { name: 'Off', cols: 1, rows: 1, mirror: false, kaleido: 0 },
        { name: '2×1', cols: 2, rows: 1, mirror: false, kaleido: 0 },
        { name: '1×2', cols: 1, rows: 2, mirror: false, kaleido: 0 },
        { name: '2×2', cols: 2, rows: 2, mirror: false, kaleido: 0 },
        { name: '3×3', cols: 3, rows: 3, mirror: false, kaleido: 0 },
        { name: '4×4', cols: 4, rows: 4, mirror: false, kaleido: 0 },
        { name: 'Mirror 2×1', cols: 2, rows: 1, mirror: true, kaleido: 0 },
        { name: 'Mirror 2×2', cols: 2, rows: 2, mirror: true, kaleido: 0 },
        { name: 'Mirror 3×3', cols: 3, rows: 3, mirror: true, kaleido: 0 },
        { name: 'Mirror 4×4', cols: 4, rows: 4, mirror: true, kaleido: 0 },
        { name: 'Kaleido 4', cols: 1, rows: 1, mirror: false, kaleido: 4 },
        { name: 'Kaleido 6', cols: 1, rows: 1, mirror: false, kaleido: 6 },
        { name: 'Kaleido 8', cols: 1, rows: 1, mirror: false, kaleido: 8 },
        { name: 'Kaleido 12', cols: 1, rows: 1, mirror: false, kaleido: 12 }
    ];

    const DEFAULTS = {
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
    const LOOKS = {
        clean: { energy: 0.1, ...DEFAULTS },
        trails: { energy: 0.3, ...DEFAULTS, feedback: 0.82, fbZoom: 0.0, fbLevel: 0.3 },
        tunnel: { energy: 0.6, ...DEFAULTS, feedback: 0.88, fbZoom: 0.035, fbRotate: 0.15, fbHue: 0.15, bassZoom: 0.4 },
        melt: { energy: 0.5, ...DEFAULTS, feedback: 0.9, fbZoom: -0.015, fbHue: 0.35, wave: 0.45 },
        mirror: { energy: 0.55, ...DEFAULTS, grid: 7, bassZoom: 0.5 },
        tiles: { energy: 0.65, ...DEFAULTS, grid: 4, feedback: 0.6, fbZoom: 0.02, bassZoom: 0.35 },
        kaleido: { energy: 0.75, ...DEFAULTS, grid: 11, feedback: 0.7, fbZoom: 0.025, fbRotate: 0.3, spin: 0.15, bassZoom: 0.5 },
        acid: { energy: 0.85, ...DEFAULTS, grid: 12, feedback: 0.85, fbZoom: 0.04, fbRotate: -0.25, fbHue: 0.6, hueSpeed: 0.35, bassZoom: 0.6 },
        mosaic: { energy: 0.7, ...DEFAULTS, grid: 8, pixelate: 0.45, posterize: 0.5, bassZoom: 0.4 },
        storm: { energy: 0.95, ...DEFAULTS, grid: 9, feedback: 0.75, fbZoom: 0.06, fbRotate: 0.5, fbHue: 0.4, wave: 0.3, bassZoom: 0.8, hueSpeed: 0.2 }
    };

    const ENVELOPES = {
        strobe: 90,     // ms to fade out
        invert: 140,
        punch: 220,
        burst: 600,
        hueJump: 0      // instant, stays
    };

    const rack = {
        GRIDS,
        LOOKS,
        lookNames: Object.keys(LOOKS),
        look: 'clean',
        settings: { ...DEFAULTS },
        env: { strobe: 0, invert: 0, punch: 0, burst: 0 },
        hueOffset: 0,
        angle: 0,
        fbAngle: 0,
        u: null, // computed uniforms

        set(key, value) {
            this.settings[key] = value;
            this.look = '';
            CLIFT.events.emit('state');
        },

        applyLook(name) {
            const look = LOOKS[name];
            if (!look) return;
            for (const k of Object.keys(DEFAULTS)) this.settings[k] = look[k];
            this.look = name;
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

        toggleFeedback() {
            this.set('feedback', this.settings.feedback > 0 ? 0 : 0.85);
        },

        // Momentary hits.
        hit(kind, strength = 1) {
            if (kind === 'hueJump') {
                this.hueOffset = (this.hueOffset + 0.2 + Math.random() * 0.6) % 1;
            } else if (kind === 'grid') {
                let g;
                do { g = 1 + CLIFT.util.randInt(GRIDS.length - 1); } while (g === this.settings.grid);
                this.settings.grid = g;
                this.look = '';
                CLIFT.events.emit('state');
            } else if (kind in this.env) {
                this.env[kind] = Math.max(this.env[kind], strength);
            }
        },

        // Anything that needs the full-screen FX passes this frame?
        get active() {
            const s = this.settings, e = this.env;
            return s.feedback > 0 || s.grid > 0 || s.bassZoom > 0 || s.spin !== 0 || s.wave > 0 ||
                s.pixelate > 0 || s.hueSpeed > 0 || s.posterize > 0 || s.invert || this.hueOffset !== 0 ||
                e.strobe > 0.01 || e.invert > 0.01 || e.punch > 0.01 || e.burst > 0.01;
        },

        update(dt, audio) {
            const s = this.settings, e = this.env;
            for (const k of Object.keys(e)) {
                e[k] = ENVELOPES[k] ? Math.max(0, e[k] - dt / ENVELOPES[k]) : 0;
            }
            const bass = audio ? audio.bands.bass : 0;
            const level = audio ? audio.volume : 0;
            const sec = dt / 1000;

            this.angle += s.spin * sec * 1.5;
            this.hueOffset = (this.hueOffset + s.hueSpeed * sec * 0.25) % 1;
            this.fbAngle = s.fbRotate * 0.02;
            const grid = GRIDS[s.grid] || GRIDS[0];

            this.u = {
                gridCols: grid.cols,
                gridRows: grid.rows,
                gridMirror: grid.mirror,
                kaleido: grid.kaleido,
                zoom: 1 + s.bassZoom * bass * 0.35 + e.punch * 0.3,
                rotate: this.angle,
                wave: s.wave,
                pixelate: s.pixelate > 0 ? Math.round(160 - s.pixelate * 140) : 0,
                feedback: Math.min(0.97, s.feedback + s.fbLevel * level * 0.25 + e.burst * Math.max(0, 0.9 - s.feedback)),
                fbZoom: s.fbZoom + e.burst * 0.03,
                fbRotate: this.fbAngle,
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
            this.look = LOOKS[state.look] ? state.look : '';
            CLIFT.events.emit('state');
        }
    };

    CLIFT.fx = rack;
})();
