// 3D ASCII world.
//
// Ray-marched structures (signed distance fields, repeated so the world never
// ends) that the camera flies through. Every surface wears the live mixed decks
// as a texture (triplanar projection), lit and tinted with the deck colors,
// fading to black with distance.
//
// Rendering is two GPU passes:
//   1. march: one ray per character cell into a small target (color + brightness)
//   2. ascii: draws each cell as a glyph picked by brightness from a glyph ramp
//      ('ascii'), as a flat colored cell ('blocks'), or the march result smoothly
//      upscaled at a finer resolution ('raw').
// The result then goes through the visual FX / post-FX like any other source.

(function () {
    const WORLDS = ['Off', 'City', 'Monoliths', 'Temple', 'Cubes', 'Terrain', 'Rings', 'Lattice'];
    const MOVES = ['Fly', 'Orbit', 'Crane', 'Drift'];
    const STYLES = ['ASCII', 'Blocks', 'Raw'];
    const RAMP = ' .,:;-=+*x#%@&█';

    const QUAD_VS = `
        attribute vec2 a_position;
        varying vec2 v_uv; // (0,0) = top-left of the screen
        void main() {
            v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;

    const MARCH_FS = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform sampler2D u_content;
        uniform bool u_contentFlip;
        uniform sampler2D u_spectrum;   // 64 x 1
        uniform float u_world;
        uniform vec2 u_screenAspect;    // (width / height, 1)
        uniform vec3 u_camPos;
        uniform vec3 u_camTarget;
        uniform float u_camRoll;
        uniform float u_fov;
        uniform float u_time;
        uniform float u_bass;
        uniform float u_react;
        uniform float u_contentAmt;
        uniform float u_fog;
        uniform float u_texScale;
        uniform vec3 u_colA;
        uniform vec3 u_colB;
        varying vec2 v_uv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float spec(float x) { return texture2D(u_spectrum, vec2((floor(mod(x, 64.0)) + 0.5) / 64.0, 0.5)).r; }
        float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
        float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }

        float matId; // 0 floor/ground, 1 structure

        float map(vec3 p) {
            int w = int(u_world + 0.5);
            matId = 1.0;
            if (w == 1) { // City: blocks of buildings, avenues every third column
                vec2 id = floor(p.xz / 4.0);
                vec2 q = mod(p.xz, 4.0) - 2.0;
                float h = 1.0 + hash(id) * 7.0 + spec(hash(id + 3.1) * 64.0) * 6.0 * u_react;
                float b = mod(id.x, 3.0) < 0.5 ? 1e3 : sdBox(vec3(q.x, p.y - h * 0.5, q.y), vec3(1.5, h * 0.5, 1.5));
                if (p.y < b) { matId = 0.0; return p.y; }
                return b;
            }
            if (w == 2) { // Monoliths: slabs scattered over a plain
                vec2 id = floor(p.xz / 10.0);
                vec2 q = mod(p.xz, 10.0) - 5.0;
                float r = hash(id);
                float h = 3.0 + r * 8.0 + u_bass * 3.0 * u_react;
                vec3 s = vec3(q.x, p.y - h * 0.5, q.y);
                s.xz = rot(r * 6.28) * s.xz;
                float b = (r > 0.45 && abs(id.x) > 0.5) ? sdBox(s, vec3(0.5, h * 0.5, 1.8)) : 1e3;
                if (p.y < b) { matId = 0.0; return p.y; }
                return b;
            }
            if (w == 3) { // Temple: colonnade between floor and ceiling
                vec2 q = mod(p.xz, 4.0) - 2.0;
                float pillar = length(q) - (0.45 + u_bass * 0.15 * u_react);
                float roof = 8.0 - p.y;
                float d = min(pillar, roof);
                if (p.y < d) { matId = 0.0; return p.y; }
                return d;
            }
            if (w == 4) { // Cubes: floating spinning cubes in a 3D lattice
                vec3 id = floor(p / 5.0);
                vec3 q = mod(p, 5.0) - 2.5;
                float r = hash3(id);
                q.xy = rot(u_time * (r - 0.5) * 2.0) * q.xy;
                q.yz = rot(u_time * (r - 0.3)) * q.yz;
                float size = 0.6 + r * 0.6 + u_bass * 0.5 * u_react;
                return r > 0.35 ? sdBox(q, vec3(size)) : 2.0;
            }
            if (w == 5) { // Terrain: rolling noise landscape (not an exact SDF -> step scaled)
                float h = noise(p.xz * 0.12) * 6.0 + noise(p.xz * 0.37) * 1.8 + spec(floor(p.x * 0.3) + 8.0) * 3.0 * u_react;
                matId = 0.0;
                return (p.y - h) * 0.45;
            }
            if (w == 6) { // Rings: tunnel of rotating rings
                float id = floor(p.z / 6.0);
                vec3 q = vec3(p.x, p.y, mod(p.z, 6.0) - 3.0);
                q.xy = rot(id * 0.7 + u_time * 0.3) * q.xy;
                vec2 t = vec2(length(q.xy) - 4.0, q.z);
                float ring = max(length(t) - (0.35 + u_bass * 0.4 * u_react), -sdBox(q, vec3(0.6, 9.0, 1.0)));
                return ring;
            }
            // Lattice: spheres joined by bars
            vec3 q = mod(p, 4.0) - 2.0;
            float sphere = length(q) - (0.5 + u_bass * 0.45 * u_react);
            float bars = min(min(length(q.xy), length(q.yz)), length(q.xz)) - 0.07;
            return min(sphere, bars);
        }

        vec3 normalAt(vec3 p) {
            vec2 e = vec2(0.01, -0.01);
            return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
        }

        vec3 content(vec2 c) {
            vec2 uv = fract(c * u_texScale / u_screenAspect);
            return texture2D(u_content, u_contentFlip ? vec2(uv.x, 1.0 - uv.y) : uv).rgb;
        }

        void main() {
            vec2 p = (v_uv - 0.5) * u_screenAspect * vec2(1.0, -1.0);
            vec3 fw = normalize(u_camTarget - u_camPos);
            vec3 right = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
            vec3 up = cross(right, fw);
            vec2 pr = rot(u_camRoll) * p;
            vec3 rd = normalize(fw * u_fov + right * pr.x + up * pr.y);

            float t = 0.05;
            float hit = 0.0;
            float steps = 0.0;
            for (int i = 0; i < 90; i++) {
                float d = map(u_camPos + rd * t);
                if (d < 0.002 * t) { hit = 1.0; break; }
                t += d;
                steps += 1.0;
                if (t > 70.0) break;
            }
            if (hit < 0.5) { gl_FragColor = vec4(0.0); return; }

            vec3 pos = u_camPos + rd * t;
            float mat = matId;
            vec3 n = normalAt(pos);
            vec3 light = normalize(vec3(0.45, 0.8, -0.35));
            float diff = max(dot(n, light), 0.0);
            float ao = 1.0 - steps / 90.0;
            // The live decks projected onto the surface from all three axes.
            vec3 w = abs(n);
            w /= (w.x + w.y + w.z);
            vec3 tex = content(pos.zy) * w.x + content(pos.xz) * w.y + content(pos.xy) * w.z;
            // Shape brightness (light, occlusion, material, fog) decides the glyph in
            // ASCII style; the content mostly decides the colors.
            float fogF = exp(-t * (0.015 + u_fog * 0.07));
            float shape = (0.12 + 0.88 * diff) * (0.35 + 0.65 * ao) * (mat < 0.5 ? 0.45 : 1.0) * fogF;
            vec3 base = mix(u_colA, u_colB, clamp(pos.y * 0.08 + mat * 0.3, 0.0, 1.0));
            vec3 color = (base * (0.15 + 0.85 * diff) * (0.4 + 0.6 * ao) * (mat < 0.5 ? 0.45 : 0.8) * (1.0 - u_contentAmt * 0.55)
                + tex * u_contentAmt * 2.2) * fogF;
            float glow = dot(tex, vec3(0.333)) * u_contentAmt * fogF; // bright content lifts the glyph a little
            gl_FragColor = vec4(color, clamp(shape + glow * 0.6, 0.0, 1.0));
        }`;

    const ASCII_FS = `
        precision mediump float;
        uniform sampler2D u_march;   // framebuffer (bottom-up)
        uniform sampler2D u_ramp;    // glyph ramp, one row
        uniform vec2 u_grid;
        uniform float u_rampN;
        uniform float u_style;       // 0 ascii, 1 blocks, 2 raw
        varying vec2 v_uv;

        void main() {
            if (u_style > 1.5) {
                gl_FragColor = vec4(texture2D(u_march, vec2(v_uv.x, 1.0 - v_uv.y)).rgb, 1.0);
                return;
            }
            vec2 cellPos = v_uv * u_grid;
            vec2 cell = floor(cellPos);
            vec4 m = texture2D(u_march, vec2((cell.x + 0.5) / u_grid.x, 1.0 - (cell.y + 0.5) / u_grid.y));
            if (u_style > 0.5) { gl_FragColor = vec4(m.rgb, 1.0); return; }
            float lum = clamp(pow(m.a, 0.85) * 1.25, 0.0, 1.0);
            float idx = floor(lum * (u_rampN - 1.0) + 0.5);
            if (idx < 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
            float a = texture2D(u_ramp, (vec2(idx, 0.0) + fract(cellPos)) / vec2(u_rampN, 1.0)).a;
            // Full-brightness hue of the cell (deck colors / content), glyph carries the shading.
            vec3 hue = m.rgb / max(max(m.r, max(m.g, m.b)), 0.001);
            gl_FragColor = vec4(hue * a * (0.55 + 0.45 * lum), 1.0);
        }`;

    const DEFAULTS = {
        world: 0,        // index into WORLDS
        move: 0,         // index into MOVES
        style: 0,        // index into STYLES
        speed: 0.35,     // travel speed (pushed by the bass)
        altitude: 0.2,   // camera height
        detail: 0.5,     // grid resolution relative to the deck grid
        content: 0.55,   // how much the live decks show on the surfaces
        fog: 0.4,
        react: 0.6,      // how much audio moves the structures
        texScale: 0.35   // size of the content projected on surfaces
    };

    const world = {
        WORLDS, MOVES, STYLES,
        settings: { ...DEFAULTS },
        travel: 0,
        orbit: 0,
        roll: 0,
        cam: { pos: [0, 2, 0], target: [0, 2, 5] },

        get active() {
            return this.settings.world > 0 && !!(CLIFT.output && CLIFT.output.gl);
        },

        set(key, value) {
            this.settings[key] = value;
            CLIFT.events.emit('state');
        },

        step(key, list, dir = 1) {
            this.set(key, CLIFT.util.wrap(this.settings[key] + dir, list.length));
        },

        // New flight: jump somewhere else along the path.
        cut() {
            this.travel += 30 + Math.random() * 200;
            this.orbit = Math.random() * Math.PI * 2;
        },

        update(dt, audio) {
            if (!this.settings.world) return;
            const s = this.settings;
            const sec = dt / 1000;
            const bass = audio ? audio.bands.bass : 0;
            this.bass = bass;
            this.travel += sec * (0.6 + s.speed * 9) * (1 + bass * 0.8 * s.react);
            this.orbit += sec * (0.1 + s.speed * 0.6);
            this.time = (this.time || 0) + sec;
            this.computeCamera();
        },

        // Camera position / look-at per world and move. Paths keep to open space:
        // avenues in the city, lanes between pillars, the axis of the rings...
        computeCamera() {
            const s = this.settings, w = WORLDS[s.world], m = MOVES[s.move];
            const z = this.travel, a = this.orbit, alt = s.altitude;
            let lane = 0, baseY = 1.5 + alt * 6;
            if (w === 'City') { lane = 2; baseY = 1.2 + alt * 14; }
            if (w === 'Temple') { lane = 0; baseY = 1.2 + alt * 5; }
            if (w === 'Monoliths') { lane = 5; baseY = 1.2 + alt * 9; }
            if (w === 'Terrain') { lane = 0; baseY = 7 + alt * 12; }
            if (w === 'Rings' || w === 'Cubes') { lane = 0; baseY = alt * 2; }
            if (w === 'Lattice') { lane = 0; baseY = 0; }

            let pos, target, roll = 0;
            if (m === 'Orbit') {
                const c = [lane, baseY, z * 0.15];
                const r = 6 + alt * 10;
                pos = [c[0] + Math.cos(a) * r, c[1] + 2 + alt * 4, c[2] + Math.sin(a) * r];
                target = c;
            } else if (m === 'Crane') {
                const y = baseY + (Math.sin(this.time * 0.25) * 0.5 + 0.5) * (4 + alt * 10);
                pos = [lane, y, z * 0.4];
                target = [lane + Math.sin(this.time * 0.1) * 3, baseY * 0.5, z * 0.4 + 8];
            } else if (m === 'Drift') {
                pos = [lane + Math.sin(z * 0.05) * 1.2, baseY + Math.sin(z * 0.07) * 0.6, z * 0.5];
                target = [pos[0] + Math.sin(z * 0.03) * 4, pos[1] - 0.3, pos[2] + 6];
                roll = Math.sin(z * 0.04) * 0.35;
            } else { // Fly
                pos = [lane + Math.sin(z * 0.06) * 0.6, baseY, z];
                target = [lane + Math.sin(z * 0.06 + 0.6) * 1.5, baseY - 0.4 - alt * 1.5, z + 7];
            }
            this.cam = { pos, target };
            this.roll = roll;
        },

        // ---- GL ---------------------------------------------------------------

        setupGL(out) {
            const gl = out.gl;
            const compile = (type, src) => {
                const sh = gl.createShader(type);
                gl.shaderSource(sh, src);
                gl.compileShader(sh);
                if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                    CLIFT.error('world shader compile failed:', gl.getShaderInfoLog(sh));
                    return null;
                }
                return sh;
            };
            const program = (fs) => {
                const v = compile(gl.VERTEX_SHADER, QUAD_VS), f = compile(gl.FRAGMENT_SHADER, fs);
                if (!v || !f) return null;
                const p = gl.createProgram();
                gl.attachShader(p, v);
                gl.attachShader(p, f);
                gl.bindAttribLocation(p, 0, 'a_position');
                gl.linkProgram(p);
                if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                    CLIFT.error('world shader link failed:', gl.getProgramInfoLog(p));
                    return null;
                }
                const u = {};
                const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < n; i++) {
                    const name = gl.getActiveUniform(p, i).name;
                    u[name] = gl.getUniformLocation(p, name);
                }
                return { program: p, u };
            };
            this.march = program(MARCH_FS);
            this.ascii = program(ASCII_FS);
            const texture = (filter) => {
                const t = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, t);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
                return t;
            };
            this.tex = { spectrum: texture(gl.NEAREST), ramp: texture(gl.LINEAR) };
            this.targets = {
                march: { tex: texture(gl.NEAREST), fb: gl.createFramebuffer(), key: '' },
                out: { tex: texture(gl.LINEAR), fb: gl.createFramebuffer(), key: '' }
            };
            this.rampCanvas = document.createElement('canvas');
            this.ready = !!(this.march && this.ascii);
            return this.ready;
        },

        bindSized(gl, t, w, h, filter) {
            const key = `${w}x${h}@${filter}`;
            if (t.key !== key) {
                t.key = key;
                // Scratch unit, so (re)allocating never leaves the target bound where a
                // sampler reads (that would be a framebuffer feedback loop).
                gl.activeTexture(gl.TEXTURE7);
                gl.bindTexture(gl.TEXTURE_2D, t.tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
            }
            gl.viewport(0, 0, w, h);
        },

        // Glyph ramp texture, sized to the on-screen cell (capped like the main atlas).
        ensureRamp(gl, cellW, cellH) {
            const scale = Math.min(1, 96 / cellH);
            const w = Math.max(2, Math.ceil(cellW * scale)), h = Math.max(2, Math.ceil(cellH * scale));
            const key = `${w}x${h}`;
            if (this.rampKey === key) return;
            this.rampKey = key;
            const c = this.rampCanvas;
            c.width = w * RAMP.length;
            c.height = h;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${Math.max(4, Math.min(h * 0.92, w / 0.6))}px "Courier New", Courier, monospace`;
            for (let i = 0; i < RAMP.length; i++) ctx.fillText(RAMP[i], (i + 0.5) * w, h / 2);
            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.ramp);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
        },

        // Render the world from the content texture; returns the full-size result.
        render(out, contentTex, contentFlip) {
            const gl = out.gl;
            if (!this.ready && !this.setupGL(out)) return null;
            const s = this.settings;
            const engine = CLIFT.engine;
            const W = out.canvas.width, H = out.canvas.height;

            // Grid: the deck grid scaled by Detail (Raw renders finer and smooths).
            const factor = s.style === 2 ? 2.5 + s.detail * 3 : 0.6 + s.detail * 1.2;
            const cols = Math.max(16, Math.round(engine.width * factor));
            const rows = Math.max(8, Math.round(engine.height * factor));

            // Spectrum for audio-reactive structures.
            const spec = engine.audioFrame ? engine.audioFrame.spectrum : new Float32Array(64);
            const bytes = this.specBytes || (this.specBytes = new Uint8Array(64));
            for (let i = 0; i < 64; i++) bytes[i] = Math.min(255, spec[i] * 255);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.spectrum);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 64, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);

            // Pass 1: march one ray per cell.
            this.bindSized(gl, this.targets.march, cols, rows, s.style === 2 ? gl.LINEAR : gl.NEAREST);
            const { program, u } = this.march;
            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, contentTex);
            gl.uniform1i(u.u_content, 0);
            gl.uniform1i(u.u_contentFlip, contentFlip ? 1 : 0);
            gl.uniform1i(u.u_spectrum, 2);
            gl.uniform1f(u.u_world, s.world);
            gl.uniform2f(u.u_screenAspect, W / H, 1);
            gl.uniform3fv(u.u_camPos, this.cam.pos);
            gl.uniform3fv(u.u_camTarget, this.cam.target);
            gl.uniform1f(u.u_camRoll, this.roll);
            gl.uniform1f(u.u_fov, 1.3);
            gl.uniform1f(u.u_time, this.time || 0);
            gl.uniform1f(u.u_bass, this.bass || 0);
            gl.uniform1f(u.u_react, s.react);
            gl.uniform1f(u.u_contentAmt, s.content);
            gl.uniform1f(u.u_fog, s.fog);
            gl.uniform1f(u.u_texScale, s.texScale);
            const deck = engine.decks[engine.crossfader < 0.5 ? 0 : 1];
            gl.uniform3fv(u.u_colA, CLIFT.palette.rgb(deck.primaryColor).map(v => v / 255));
            gl.uniform3fv(u.u_colB, CLIFT.palette.rgb(deck.secondaryColor).map(v => v / 255));
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Pass 2: glyphs / blocks / smooth at full size.
            this.ensureRamp(gl, W / cols, H / rows);
            this.bindSized(gl, this.targets.out, W, H, gl.LINEAR);
            const a = this.ascii;
            gl.useProgram(a.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.targets.march.tex);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.ramp);
            gl.uniform1i(a.u.u_march, 0);
            gl.uniform1i(a.u.u_ramp, 1);
            gl.uniform2f(a.u.u_grid, cols, rows);
            gl.uniform1f(a.u.u_rampN, RAMP.length);
            gl.uniform1f(a.u.u_style, s.style);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            return this.targets.out.tex;
        },

        getState() {
            return { ...this.settings };
        },

        setState(state) {
            if (!state) return;
            for (const k of Object.keys(DEFAULTS)) if (typeof state[k] === 'number') this.settings[k] = state[k];
            this.settings.world = CLIFT.util.clamp(this.settings.world | 0, 0, WORLDS.length - 1);
            this.settings.move = CLIFT.util.clamp(this.settings.move | 0, 0, MOVES.length - 1);
            this.settings.style = CLIFT.util.clamp(this.settings.style | 0, 0, STYLES.length - 1);
            CLIFT.events.emit('state');
        }
    };

    CLIFT.world = world;
})();
