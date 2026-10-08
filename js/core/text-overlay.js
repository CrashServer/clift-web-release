// Text overlay drawn over the mixed output (after effects).
//   big     - the message as large ASCII letters
//   line    - plain text on the middle row
//   marquee - big letters scrolling across
// Big letters are made by rasterizing the text on a small canvas and turning
// each cell's coverage into a glyph.

(function () {
    const RAMP = ' ░▒▓█'; // block shades read best at low grid resolutions
    const SUB_X = 4, SUB_Y = 8; // raster samples per cell

    const overlay = {
        enabled: false,
        text: 'CLIFT',
        mode: 'big',
        modes: ['big', 'line', 'marquee'],
        color: 7,
        pulse: false,
        cache: null,

        toggle(force) {
            this.enabled = force === undefined ? !this.enabled : !!force;
            CLIFT.events.emit('state');
            return this.enabled;
        },

        set(key, value) {
            this[key] = value;
            this.cache = null;
            CLIFT.events.emit('state');
        },

        // Character mask for the text at `cols` x `rows` cells (marquee: as wide as the text needs).
        mask(cols, rows, fitWidth) {
            const key = `${this.text}|${cols}x${rows}|${fitWidth}`;
            if (this.cache && this.cache.key === key) return this.cache;

            const canvas = this.canvas || (this.canvas = document.createElement('canvas'));
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const font = (px) => `900 ${px}px "Arial Black", Impact, "Helvetica Neue", Arial, sans-serif`;
            const hPx = rows * SUB_Y; // 4x8 samples per cell keeps the ~1:2 cell aspect
            const measure = (str) => { ctx.font = font(100); return ctx.measureText(str).width / 100; };

            // Font size for a set of lines: as tall as the box allows, as wide as the screen allows.
            const fit = (lines) => {
                let px = hPx * 0.8 / lines.length;
                if (fitWidth) px = Math.min(px, cols * SUB_X * 0.92 / Math.max(...lines.map(measure)));
                return px;
            };
            let lines = [this.text];
            let fontPx = fit(lines);
            const spaces = [...this.text.matchAll(/ /g)].map(m => m.index);
            if (fitWidth && spaces.length) {
                // Wrapping at the space nearest the middle gives bigger letters for long messages.
                const mid = spaces.reduce((a, b) => Math.abs(b - this.text.length / 2) < Math.abs(a - this.text.length / 2) ? b : a);
                const two = [this.text.slice(0, mid), this.text.slice(mid + 1)];
                const px2 = fit(two);
                if (px2 > fontPx * 1.15) {
                    lines = two;
                    fontPx = px2;
                }
            }
            if (!fitWidth) cols = Math.ceil(measure(this.text) * fontPx / SUB_X) + 4;

            canvas.width = cols * SUB_X;
            canvas.height = hPx;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = font(fontPx);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            lines.forEach((line, i) => {
                ctx.fillText(line, canvas.width / 2, hPx / 2 + (i - (lines.length - 1) / 2) * fontPx * 1.1);
            });
            const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            const chars = [];
            for (let y = 0; y < rows; y++) {
                const row = [];
                for (let x = 0; x < cols; x++) {
                    let sum = 0;
                    for (let sy = 0; sy < SUB_Y; sy++) {
                        for (let sx = 0; sx < SUB_X; sx++) {
                            sum += px[((y * SUB_Y + sy) * canvas.width + x * SUB_X + sx) * 4];
                        }
                    }
                    const cover = sum / (SUB_X * SUB_Y * 255);
                    row.push(cover < 0.12 ? '' : RAMP[Math.min(RAMP.length - 1, Math.ceil(cover * 1.4 * (RAMP.length - 1)))]);
                }
                chars.push(row);
            }
            this.cache = { key, cols, rows, chars };
            return this.cache;
        },

        apply(engine) {
            if (!this.enabled || !this.text) return;
            if (this.pulse && engine.clock.phase > 0.5) return;
            const w = engine.width, h = engine.height;
            const out = engine.outputBuffer, colors = engine.outputColorBuffer;
            const color = this.color;

            if (this.mode === 'line') {
                const text = ` ${this.text} `.slice(0, w);
                const y = h >> 1, start = Math.max(0, (w - text.length) >> 1);
                for (let i = 0; i < text.length; i++) {
                    out[y][start + i] = text[i];
                    colors[y][start + i] = color;
                }
                return;
            }

            const rows = Math.max(3, Math.floor(h * (this.mode === 'marquee' ? 0.5 : 0.6)));
            const top = (h - rows) >> 1;
            const m = this.mask(w, rows, this.mode === 'big');
            const offset = this.mode === 'marquee'
                ? w - Math.floor(engine.clock.time / 1000 * w * 0.35) % (m.cols + w)
                : (w - m.cols) >> 1;
            for (let y = 0; y < rows; y++) {
                const src = m.chars[y];
                for (let x = 0; x < m.cols; x++) {
                    const c = src[x];
                    const dx = x + offset;
                    if (c && dx >= 0 && dx < w) {
                        out[top + y][dx] = c;
                        colors[top + y][dx] = color;
                    }
                }
            }
        }
    };

    CLIFT.textOverlay = overlay;
})();
