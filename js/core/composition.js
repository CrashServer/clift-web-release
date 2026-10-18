// Composition: negative space for each deck.
//
//   density - thins the scene into organic patches of empty space. Light glyphs
//             (. : -) go first, through a slowly drifting noise field, so the
//             thinning is spatially coherent and never flickers.
//   mask    - confines the deck to a shape (circle, band, half, frame...) or a
//             moving one (scanner, spotlight, beat blocks); can be inverted and
//             sized, and breathes with the bass.
//
// Mixed into CLIFTEngine.prototype; renderDeck() calls compose() after the
// scene has drawn. The engine also measures how much of the output is lit
// (coverage), which the Director uses to steer density.

(function () {
    // Value noise: hashed lattice + smooth interpolation (cheap, coherent).
    function hash(x, y) {
        let h = (x * 374761393 + y * 668265263) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    function noise(x, y) {
        const xi = Math.floor(x), yi = Math.floor(y);
        let fx = x - xi, fy = y - yi;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
        return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }

    // Each mask: (u, v, size, t, bass, deck) -> inside? u, v are in [-1, 1],
    // v is scaled by the cell aspect so circles look round on screen.
    const MASKS = [
        { name: 'Full', fn: null },
        { name: 'Circle', fn: (u, v, s, t, b) => Math.hypot(u, v) < 0.25 + s * 0.75 + b * 0.15 },
        { name: 'Ring', fn: (u, v, s, t, b) => { const r = Math.hypot(u, v), R = 0.3 + s * 0.5 + b * 0.1; return r < R && r > R - 0.12 - s * 0.15; } },
        { name: 'Band ═', fn: (u, v, s, t, b) => Math.abs(v) < 0.1 + s * 0.5 + b * 0.08 },
        { name: 'Band ║', fn: (u, v, s, t, b) => Math.abs(u) < 0.08 + s * 0.45 + b * 0.06 },
        { name: 'Left', fn: (u, v, s) => u < -1 + s * 2 },
        { name: 'Right', fn: (u, v, s) => u > 1 - s * 2 },
        { name: 'Diagonal', fn: (u, v, s) => Math.abs(u - v / 1.8) < 0.1 + s * 0.6 },
        { name: 'Box', fn: (u, v, s, t, b) => Math.abs(u) < 0.2 + s * 0.6 + b * 0.08 && Math.abs(v) < 0.2 + s * 0.6 + b * 0.08 },
        { name: 'Frame', fn: (u, v, s) => Math.max(Math.abs(u), Math.abs(v) / 1.8) > 0.95 - s * 0.45 },
        { name: 'Lower third', fn: (u, v, s) => v > 1.8 * (1 - 0.15 - s * 0.5) },
        { name: 'Stripes', fn: (u, v, s, t, b, d, y) => (y % 4) < 1 + Math.round(s * 2) },
        { name: 'Scanner', fn: (u, v, s, t) => Math.abs(u - Math.sin(t * 0.0009)) < 0.06 + s * 0.4 },
        { name: 'Spotlight', fn: (u, v, s, t, b) => Math.hypot(u - (noise(t * 0.0003, 1.7) * 2 - 1) * 0.7, v - (noise(5.1, t * 0.0003) * 2 - 1) * 1.1) < 0.2 + s * 0.5 + b * 0.15 },
        { name: 'Blocks', fn: (u, v, s, t, b, deck) => {
            const seed = (deck.maskSeed || 0) + Math.floor(CLIFT.engine.clock.count / 4); // new layout every bar
            const cx = Math.floor((u + 1) * 3), cy = Math.floor((v / 1.8 + 1) * 2);
            return hash(cx + seed * 7, cy + seed * 13) < 0.2 + s * 0.6;
        } }
    ];

    // Glyph weight: heavy glyphs survive thinning longest.
    function weightOf(engine, ch) {
        return engine.getCharacterIntensity(ch);
    }

    CLIFT.masks = MASKS;

    CLIFT.compositionMethods = {
        // Blank out what the deck's mask and density remove.
        compose(deck, buffer) {
            const mask = MASKS[deck.mask] && MASKS[deck.mask].fn;
            const density = deck.density;
            if (!mask && density >= 0.999) return;

            const w = this.width, h = this.height;
            const t = this.clock.time;
            const bass = this.audioFrame ? this.audioFrame.bands.bass : 0;
            const size = deck.maskSize;
            const invert = deck.maskInvert;
            const aspect = 1.8; // cells are roughly twice as tall as wide
            const nt = t * 0.00015;
            for (let y = 0; y < h; y++) {
                const row = buffer[y];
                const v = ((y + 0.5) / h * 2 - 1) * aspect;
                for (let x = 0; x < w; x++) {
                    const ch = row[x];
                    if (!ch || ch === ' ') continue;
                    if (mask) {
                        const u = (x + 0.5) / w * 2 - 1;
                        if (mask(u, v, size, t, bass, deck, y, x) === invert) { row[x] = ' '; continue; }
                    }
                    if (density < 0.999) {
                        // Patchy noise field (drifts slowly); light glyphs score higher
                        // and disappear first, heavy ones survive longest.
                        const n = noise(x * 0.09 + nt, y * 0.18 - nt * 0.7) * 0.75 + noise(x * 0.31, y * 0.5 + nt) * 0.25;
                        const score = n * 0.7 + (1 - weightOf(this, ch)) * 0.3;
                        if (score > density) row[x] = ' ';
                    }
                }
            }
        },

        // Fraction of output cells that show a glyph (measured every frame).
        measureCoverage(dt = 16) {
            let lit = 0;
            const w = this.width, h = this.height;
            for (let y = 0; y < h; y++) {
                const row = this.outputBuffer[y];
                for (let x = 0; x < w; x++) if (row[x] && row[x] !== ' ') lit++;
            }
            const c = lit / (w * h);
            // Smoothed over ~150ms whatever the frame rate.
            this.coverage = this.coverage === undefined ? c : this.coverage + (c - this.coverage) * (1 - Math.exp(-dt / 150));
        },

        // How much each ASCII effect fills empty space, measured once on a sparse
        // test pattern: 'flood' (fills the screen, e.g. Invert), 'halo' (adds glow
        // around content) or 'clean'. The Director uses this to keep empty space empty.
        profileEffects() {
            const w = 80, h = 24;
            this.effectFill = this.effects.map((name, i) => {
                const fx = window.CLIFTEffects && CLIFTEffects[name];
                if (!i || !fx) return 'clean';
                const buf = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (x * 7 + y * 13) % 19 === 0 ? '#' : ' '));
                const before = buf.flat().filter(c => c !== ' ').length;
                try {
                    fx(buf, w, h, { frame: 10, beat: 0.3, audio: new Float32Array(64).fill(0.4) });
                } catch (e) {
                    return 'clean';
                }
                const after = buf.flat().filter(c => c && c !== ' ').length;
                return after > w * h * 0.5 ? 'flood' : after > before * 2 ? 'halo' : 'clean';
            });
        },

        setDeckComposition(index, key, value) {
            const deck = this.decks[index];
            deck[key] = value;
            if (key === 'mask' && MASKS[value] && MASKS[value].name === 'Blocks') deck.maskSeed = Math.random() * 1000 | 0;
            CLIFT.events.emit('state');
        }
    };
})();
