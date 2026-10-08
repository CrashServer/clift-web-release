// Output stage.
//
// GPU path (default with hardware WebGL): the ASCII grid is drawn by a shader
// from a glyph atlas - one quad per frame instead of thousands of fillText
// calls - optionally into a framebuffer that the post-FX shader then reads.
// Experimental render modes are 2D canvases; they are uploaded as a texture
// only when post-FX or recording need it, otherwise the canvas is shown (and
// mirrored to the output window) directly.
//
// Canvas path (no WebGL, or software WebGL where uploads are slow): the engine
// draws ASCII with canvas 2D and that canvas is shown directly.

(function () {
    const QUAD_VS = `
        attribute vec2 a_position;
        varying vec2 v_uv; // (0,0) = top-left of the screen
        void main() {
            v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;

    // Grid texel: r,g = glyph index (0 = empty), b = color pair id.
    const ASCII_FS = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform sampler2D u_grid;
        uniform sampler2D u_atlas;
        uniform sampler2D u_palette;   // 16x2: row 0 = fg, row 1 = bg per color pair id
        uniform vec2 u_gridSize;       // cells
        uniform vec2 u_atlasCells;     // glyph columns / rows in the atlas
        uniform vec2 u_atlasFill;      // fraction of the atlas texture covered by glyph cells
        uniform bool u_invert;
        varying vec2 v_uv;

        void main() {
            vec2 cellPos = v_uv * u_gridSize;
            vec2 cell = floor(cellPos);
            vec4 g = texture2D(u_grid, (cell + 0.5) / u_gridSize);
            float index = floor(g.r * 255.0 + 0.5) + floor(g.g * 255.0 + 0.5) * 256.0;
            if (index < 0.5) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                return;
            }
            float id = floor(g.b * 255.0 + 0.5);
            vec3 fg = texture2D(u_palette, vec2((id + 0.5) / 16.0, 0.25)).rgb;
            vec3 bg = texture2D(u_palette, vec2((id + 0.5) / 16.0, 0.75)).rgb;
            if (u_invert) { vec3 t = fg; fg = bg; bg = t; }

            vec2 glyph = vec2(mod(index, u_atlasCells.x), floor(index / u_atlasCells.x));
            vec2 uv = (glyph + fract(cellPos)) / u_atlasCells * u_atlasFill;
            float a = texture2D(u_atlas, uv).a;
            gl_FragColor = vec4(mix(bg, fg, a), 1.0);
        }`;

    // Visual FX pass (CLIFT.fx): kaleidoscope / grid split / zoom / rotate / wave /
    // pixelate on the scene, then video feedback from the previous frame.
    const FX_FS = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform sampler2D u_scene;
        uniform bool u_sceneFlip;
        uniform sampler2D u_prev;      // previous FX output (framebuffer, bottom-up)
        uniform vec2 u_resolution;
        uniform vec2 u_grid;
        uniform bool u_gridMirror;
        uniform float u_kaleido;
        uniform float u_zoom;
        uniform float u_rotate;
        uniform float u_wave;
        uniform float u_pixelate;
        uniform float u_time;
        uniform float u_feedback;
        uniform float u_fbZoom;
        uniform float u_fbRotate;
        uniform float u_fbHue;
        varying vec2 v_uv;

        vec3 hueShift(vec3 c, float a) {
            const vec3 k = vec3(0.57735);
            float ca = cos(a);
            return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
        }

        vec2 rot(vec2 p, float a) {
            float s = sin(a), c = cos(a);
            return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
        }

        void main() {
            vec2 uv = v_uv;
            vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

            if (u_kaleido > 0.5) {
                vec2 p = (uv - 0.5) * aspect;
                float r = length(p);
                float seg = 6.2831853 / u_kaleido;
                float a = mod(atan(p.y, p.x), seg);
                a = abs(a - seg * 0.5);
                uv = vec2(cos(a), sin(a)) * r / aspect + 0.5;
            }
            if (u_grid.x > 1.0 || u_grid.y > 1.0) {
                vec2 g = uv * u_grid;
                vec2 cell = floor(g);
                uv = fract(g);
                if (u_gridMirror) uv = mix(uv, 1.0 - uv, mod(cell, 2.0));
            }
            vec2 p = rot((uv - 0.5) * aspect, u_rotate) / u_zoom;
            uv = p / aspect + 0.5;
            if (u_wave > 0.0) {
                uv.x += sin(uv.y * 18.0 + u_time * 3.0) * u_wave * 0.03;
                uv.y += cos(uv.x * 14.0 + u_time * 2.0) * u_wave * 0.02;
            }
            if (u_pixelate > 0.0) {
                vec2 cells = vec2(u_pixelate) * aspect;
                uv = (floor(uv * cells) + 0.5) / cells;
            }
            uv = 1.0 - abs(mod(uv, 2.0) - 1.0); // mirrored repeat fills the edges
            vec3 color = texture2D(u_scene, u_sceneFlip ? vec2(uv.x, 1.0 - uv.y) : uv).rgb;

            if (u_feedback > 0.0) {
                vec2 q = rot((v_uv - 0.5) * aspect, u_fbRotate) / (1.0 + u_fbZoom);
                vec2 puv = q / aspect + 0.5;
                vec3 prev = vec3(0.0);
                if (puv.x >= 0.0 && puv.x <= 1.0 && puv.y >= 0.0 && puv.y <= 1.0) {
                    prev = texture2D(u_prev, vec2(puv.x, 1.0 - puv.y)).rgb;
                }
                if (u_fbHue != 0.0) prev = hueShift(prev, u_fbHue);
                color = max(color, prev * u_feedback);
            }
            gl_FragColor = vec4(color, 1.0);
        }`;

    const POST_FS = `
        precision mediump float;
        uniform sampler2D u_tex;
        uniform bool u_flipY;          // framebuffer textures are bottom-up
        uniform vec2 u_resolution;
        uniform bool u_enabled;
        uniform vec3 u_tint;
        uniform float u_tintAmount;
        uniform float u_glow;
        uniform float u_glowSize;
        uniform float u_scanlines;
        uniform float u_vignette;
        uniform float u_chroma;
        uniform bool u_invert;
        uniform float u_hue;           // color FX, applied with or without CRT post-FX
        uniform float u_posterize;
        uniform float u_fxInvert;
        uniform float u_strobe;
        varying vec2 v_uv;

        vec3 hueShift(vec3 c, float a) {
            const vec3 k = vec3(0.57735);
            float ca = cos(a);
            return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
        }

        vec3 tex(vec2 uv) {
            return texture2D(u_tex, u_flipY ? vec2(uv.x, 1.0 - uv.y) : uv).rgb;
        }

        void main() {
            vec2 uv = v_uv;
            vec3 color = tex(uv);
            if (u_enabled) {
                if (u_chroma > 0.0) {
                    vec2 off = vec2(u_chroma / u_resolution.x, 0.0);
                    color.r = tex(uv + off).r;
                    color.b = tex(uv - off).b;
                }
                if (u_glow > 0.0) {
                    vec3 sum = vec3(0.0);
                    vec2 px = u_glowSize * 2.0 / u_resolution;
                    for (float x = -2.0; x <= 2.0; x++) {
                        for (float y = -2.0; y <= 2.0; y++) {
                            float w = exp(-(x * x + y * y) * 0.35);
                            sum += tex(uv + vec2(x, y) * px) * w;
                        }
                    }
                    color += sum / 12.0 * u_glow;
                }
                if (u_invert) color = 1.0 - color;
                if (u_tintAmount > 0.0) {
                    float lum = dot(color, vec3(0.299, 0.587, 0.114));
                    color = mix(color, u_tint * lum * 1.4, u_tintAmount);
                }
                if (u_scanlines > 0.0) {
                    float line = 0.5 + 0.5 * sin(uv.y * u_resolution.y * 3.14159 * 0.5);
                    color *= 1.0 - u_scanlines * 0.5 * line;
                }
                if (u_vignette > 0.0) {
                    vec2 d = uv - 0.5;
                    color *= 1.0 - u_vignette * dot(d, d) * 2.2;
                }
            }
            if (u_hue != 0.0) color = hueShift(color, u_hue * 6.2831853);
            if (u_posterize > 0.0) color = floor(color * u_posterize + 0.5) / u_posterize;
            color = mix(color, 1.0 - color, u_fxInvert);
            color = mix(color, vec3(1.0), u_strobe * 0.85);
            gl_FragColor = vec4(color, 1.0);
        }`;

    const STYLES = {
        none: null,
        green: [0.0, 1.0, 0.3],
        amber: [1.0, 0.7, 0.0],
        blue: [0.3, 0.7, 1.0],
        cyan: [0.0, 1.0, 1.0],
        red: [1.0, 0.25, 0.35],
        white: [1.0, 1.0, 1.0]
    };

    const PRESETS = {
        clean: { enabled: true, style: 'none', glow: 0.6, glowSize: 1.0, scanlines: 0, vignette: 0.2, chroma: 0 },
        retro: { enabled: true, style: 'green', glow: 1.6, glowSize: 1.2, scanlines: 0.5, vignette: 0.6, chroma: 0 },
        amber: { enabled: true, style: 'amber', glow: 2.2, glowSize: 1.6, scanlines: 0.6, vignette: 0.7, chroma: 0 },
        cyberpunk: { enabled: true, style: 'cyan', glow: 2.0, glowSize: 1.5, scanlines: 0.3, vignette: 0.5, chroma: 2.5 },
        heavy: { enabled: true, style: 'none', glow: 3.5, glowSize: 2.2, scanlines: 0.4, vignette: 0.8, chroma: 4 }
    };

    const RENDERER_KEY = 'clift-renderer';

    function hexToRgb(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }

    const output = {
        canvas: null,
        gl: null,
        ctx2d: null,
        softwareGL: false,
        rendererPref: CLIFT.util.storage.get(RENDERER_KEY, 'auto'), // auto | gpu | canvas
        options: {
            enabled: false,
            style: 'none',
            tintAmount: 0.7,
            glow: 1.0,
            glowSize: 1.2,
            scanlines: 0.3,
            vignette: 0.4,
            chroma: 0,
            invert: false
        },
        styleNames: Object.keys(STYLES),
        presetNames: Object.keys(PRESETS),
        preset: '',

        init(container) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'output-canvas';
            this.canvas.style.visibility = 'hidden';
            container.appendChild(this.canvas);

            const gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });
            if (gl && this.setupGL(gl)) {
                this.gl = gl;
                const info = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
                this.softwareGL = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
                CLIFT.log('WebGL renderer:', renderer, this.softwareGL ? '(software)' : '');
            } else {
                CLIFT.warn('WebGL unavailable - post-FX disabled, using canvas output');
                this.ctx2d = this.canvas.getContext('2d');
            }
            this.resize(CLIFT.display.size());
            CLIFT.events.on('display-resize', (size) => this.resize(size));
        },

        get supported() {
            return !!this.gl;
        },

        // GPU text rendering is used unless WebGL is missing, the user chose the
        // canvas renderer, or (on auto) WebGL runs in software.
        get gpuText() {
            if (!this.gl) return false;
            if (this.rendererPref === 'gpu') return true;
            if (this.rendererPref === 'canvas') return false;
            return !this.softwareGL;
        },

        setRenderer(pref) {
            this.rendererPref = pref;
            CLIFT.util.storage.set(RENDERER_KEY, pref);
            CLIFT.events.emit('state');
        },

        resize({ width, height, dpr }) {
            this.canvas.width = Math.round(width * dpr);
            this.canvas.height = Math.round(height * dpr);
            // render targets are reallocated lazily (bindTarget compares sizes)
        },

        // ---- GL setup ---------------------------------------------------------

        setupGL(gl) {
            const program = (fsSource) => {
                const compile = (type, src) => {
                    const s = gl.createShader(type);
                    gl.shaderSource(s, src);
                    gl.compileShader(s);
                    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                        CLIFT.error('shader compile failed:', gl.getShaderInfoLog(s));
                        return null;
                    }
                    return s;
                };
                const vs = compile(gl.VERTEX_SHADER, QUAD_VS);
                const fs = compile(gl.FRAGMENT_SHADER, fsSource);
                if (!vs || !fs) return null;
                const p = gl.createProgram();
                gl.attachShader(p, vs);
                gl.attachShader(p, fs);
                gl.bindAttribLocation(p, 0, 'a_position');
                gl.linkProgram(p);
                if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                    CLIFT.error('shader link failed:', gl.getProgramInfoLog(p));
                    return null;
                }
                const uniforms = {};
                const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < n; i++) {
                    const name = gl.getActiveUniform(p, i).name;
                    uniforms[name] = gl.getUniformLocation(p, name);
                }
                return { program: p, u: uniforms };
            };

            this.post = program(POST_FS);
            this.ascii = program(ASCII_FS);
            this.fxProg = program(FX_FS);
            if (!this.post || !this.ascii || !this.fxProg) return false;

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

            const texture = (filter) => {
                const t = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, t);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
                return t;
            };
            this.tex = {
                source: texture(gl.LINEAR),
                grid: texture(gl.NEAREST),
                atlas: texture(gl.LINEAR),
                palette: texture(gl.NEAREST)
            };
            // Render targets: the ASCII scene, and two feedback buffers used ping-pong.
            const target = () => ({ tex: texture(gl.LINEAR), fb: gl.createFramebuffer(), key: '' });
            this.targets = { scene: target(), fb: [target(), target()] };
            this.fbIndex = 0;
            this.maxTexture = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE));
            this.glyphCanvas = document.createElement('canvas');
            this.glyphCtx = this.glyphCanvas.getContext('2d');
            return true;
        },

        // ---- glyph atlas ------------------------------------------------------

        // (Re)build the atlas when the cell size or font changes. Glyphs are
        // added lazily, one texSubImage2D per new character.
        ensureAtlas(cellW, cellH, fontSize) {
            const key = `${cellW}x${cellH}@${fontSize}`;
            if (this.atlasKey === key) return;
            const gl = this.gl;
            this.atlasKey = key;
            this.cellW = cellW;
            this.cellH = cellH;
            this.atlasSize = this.maxTexture;
            this.atlasCols = Math.max(1, Math.floor(this.atlasSize / cellW));
            this.atlasRows = Math.max(1, Math.floor(this.atlasSize / cellH));
            this.glyphs = new Map();
            this.nextGlyph = 1; // 0 = empty cell

            gl.bindTexture(gl.TEXTURE_2D, this.tex.atlas);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.atlasSize, this.atlasSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            const c = this.glyphCanvas;
            c.width = cellW;
            c.height = cellH;
            const ctx = this.glyphCtx;
            ctx.font = `${fontSize}px "Courier New", Courier, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
        },

        glyphIndex(ch) {
            let index = this.glyphs.get(ch);
            if (index !== undefined) return index;
            if (this.nextGlyph >= this.atlasCols * this.atlasRows) {
                this.atlasKey = null; // full: start over next frame
                return 0;
            }
            index = this.nextGlyph++;
            this.glyphs.set(ch, index);
            const ctx = this.glyphCtx;
            ctx.clearRect(0, 0, this.cellW, this.cellH);
            ctx.fillText(ch, this.cellW / 2, this.cellH / 2);
            const gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.tex.atlas);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, (index % this.atlasCols) * this.cellW,
                Math.floor(index / this.atlasCols) * this.cellH, gl.RGBA, gl.UNSIGNED_BYTE, this.glyphCanvas);
            return index;
        },

        uploadPalette(engine) {
            const pal = CLIFT.palette;
            const key = pal.pairs.map(p => p ? p.fg + p.bg : '').join();
            if (this.paletteKey === key) return;
            this.paletteKey = key;
            const data = new Uint8Array(16 * 2 * 4);
            for (let id = 1; id <= pal.count; id++) {
                const p = pal.pair(id);
                data.set([...hexToRgb(p.fg), 255], id * 4);
                data.set([...hexToRgb(p.bg), 255], (16 + id) * 4);
            }
            const gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.tex.palette);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        },

        // ---- per-frame rendering ------------------------------------------------

        // ASCII output through the glyph shader (GPU path).
        renderGrid(engine) {
            const gl = this.gl;
            const w = engine.width, h = engine.height;
            // Glyphs are rasterized at most 96px tall (huge cells would overflow
            // the atlas); the shader scales them up to the on-screen cell.
            const screenW = this.canvas.width / w, screenH = this.canvas.height / h;
            const scale = Math.min(1, 96 / screenH);
            const cellW = Math.max(2, Math.ceil(screenW * scale));
            const cellH = Math.max(2, Math.ceil(screenH * scale));
            const fontSize = Math.max(4, Math.min(cellH * 0.92, cellW / 0.6));
            this.ensureAtlas(cellW, cellH, fontSize);
            this.uploadPalette(engine);

            if (!this.gridData || this.gridData.length !== w * h * 4) this.gridData = new Uint8Array(w * h * 4);
            const data = this.gridData;
            const colorOn = engine.colorEnabled;
            let o = 0;
            for (let y = 0; y < h; y++) {
                const row = engine.outputBuffer[y], colors = engine.outputColorBuffer[y];
                for (let x = 0; x < w; x++, o += 4) {
                    const c = row[x];
                    const index = (!c || c === ' ') ? 0 : this.glyphIndex(c);
                    data[o] = index & 255;
                    data[o + 1] = index >> 8;
                    data[o + 2] = colorOn ? colors[x] : 2;
                }
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.grid);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

            const usePipeline = this.options.enabled || CLIFT.fx.active;
            if (usePipeline) this.bindTarget(this.targets.scene); else gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            const { program, u } = this.ascii;
            gl.useProgram(program);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.grid);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.atlas);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.palette);
            gl.uniform1i(u.u_grid, 0);
            gl.uniform1i(u.u_atlas, 1);
            gl.uniform1i(u.u_palette, 2);
            gl.uniform2f(u.u_gridSize, w, h);
            gl.uniform2f(u.u_atlasCells, this.atlasCols, this.atlasRows);
            gl.uniform2f(u.u_atlasFill, this.atlasCols * this.cellW / this.atlasSize, this.atlasRows * this.cellH / this.atlasSize);
            gl.uniform1i(u.u_invert, engine.invertColors ? 1 : 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            if (usePipeline) this.pipeline(this.targets.scene.tex, true);
            this.show(this.canvas);
            this.present();
        },

        // Bind a render target, (re)allocating it at the canvas size. Returns true if it was (re)created.
        bindTarget(t) {
            const gl = this.gl;
            const key = `${this.canvas.width}x${this.canvas.height}`;
            let fresh = false;
            if (t.key !== key) {
                t.key = key;
                gl.bindTexture(gl.TEXTURE_2D, t.tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
                fresh = true;
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
            }
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            return fresh;
        },

        // Visual FX (if any) into a feedback buffer, then color FX / CRT post to the screen.
        pipeline(srcTex, srcFlip) {
            const gl = this.gl;
            let tex = srcTex, flip = srcFlip;
            if (CLIFT.fx.active) {
                const cur = this.targets.fb[this.fbIndex];
                const prev = this.targets.fb[1 - this.fbIndex];
                // Start feedback from black when the FX switch on (or after a resize).
                if (this.bindTarget(prev) || !this.fxWasActive) {
                    gl.clearColor(0, 0, 0, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                this.bindTarget(cur);
                this.fxPass(srcTex, srcFlip, prev.tex);
                tex = cur.tex;
                flip = true;
                this.fbIndex = 1 - this.fbIndex;
            }
            this.fxWasActive = CLIFT.fx.active;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.postPass(tex, flip);
        },

        fxPass(srcTex, srcFlip, prevTex) {
            const gl = this.gl;
            const f = CLIFT.fx.u;
            const { program, u } = this.fxProg;
            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, srcTex);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, prevTex);
            gl.uniform1i(u.u_scene, 0);
            gl.uniform1i(u.u_prev, 1);
            gl.uniform1i(u.u_sceneFlip, srcFlip ? 1 : 0);
            gl.uniform2f(u.u_resolution, this.canvas.width, this.canvas.height);
            gl.uniform2f(u.u_grid, f.gridCols, f.gridRows);
            gl.uniform1i(u.u_gridMirror, f.gridMirror ? 1 : 0);
            gl.uniform1f(u.u_kaleido, f.kaleido);
            gl.uniform1f(u.u_zoom, f.zoom);
            gl.uniform1f(u.u_rotate, f.rotate);
            gl.uniform1f(u.u_wave, f.wave);
            gl.uniform1f(u.u_pixelate, f.pixelate);
            gl.uniform1f(u.u_time, performance.now() / 1000);
            gl.uniform1f(u.u_feedback, f.feedback);
            gl.uniform1f(u.u_fbZoom, f.fbZoom);
            gl.uniform1f(u.u_fbRotate, f.fbRotate);
            gl.uniform1f(u.u_fbHue, f.fbHue);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },

        // A 2D source canvas (canvas-path ASCII or an experimental render mode).
        renderCanvas(source) {
            const needsOutput = (this.gl && (this.options.enabled || CLIFT.fx.active)) || CLIFT.recorder.recording;
            if (!needsOutput) {
                this.show(source);
                this.present();
                return;
            }
            if (this.gl) {
                const gl = this.gl;
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.tex.source);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
                this.pipeline(this.tex.source, false);
            } else {
                this.ctx2d.drawImage(source, 0, 0, this.canvas.width, this.canvas.height);
            }
            this.show(this.canvas);
            this.present();
        },

        postPass(texture, flipY) {
            const gl = this.gl;
            const o = this.options;
            const { program, u } = this.post;
            gl.useProgram(program);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            const tint = STYLES[o.style];
            gl.uniform1i(u.u_tex, 0);
            gl.uniform1i(u.u_flipY, flipY ? 1 : 0);
            gl.uniform2f(u.u_resolution, this.canvas.width, this.canvas.height);
            gl.uniform1i(u.u_enabled, o.enabled ? 1 : 0);
            gl.uniform3fv(u.u_tint, tint || [1, 1, 1]);
            gl.uniform1f(u.u_tintAmount, tint ? o.tintAmount : 0);
            gl.uniform1f(u.u_glow, o.glow);
            gl.uniform1f(u.u_glowSize, o.glowSize);
            gl.uniform1f(u.u_scanlines, o.scanlines);
            gl.uniform1f(u.u_vignette, o.vignette);
            gl.uniform1f(u.u_chroma, o.chroma);
            gl.uniform1i(u.u_invert, o.invert ? 1 : 0);
            const f = CLIFT.fx.u;
            gl.uniform1f(u.u_hue, f ? f.hue : 0);
            gl.uniform1f(u.u_posterize, f ? f.posterize : 0);
            gl.uniform1f(u.u_fxInvert, f ? f.invert : 0);
            gl.uniform1f(u.u_strobe, f ? f.strobe : 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },

        // Mirror the frame to the projector window (must run right after drawing).
        present() {
            if (CLIFT.outputWindow && CLIFT.outputWindow.isOpen) CLIFT.outputWindow.present(this.visible);
        },

        // Only the canvas currently in use is displayed.
        show(canvas) {
            if (this.visible === canvas) return;
            if (this.visible) this.visible.style.visibility = 'hidden';
            canvas.style.visibility = 'visible';
            this.visible = canvas;
        },

        // ---- options ------------------------------------------------------------

        set(key, value) {
            this.options[key] = value;
            if (key !== 'enabled') this.preset = '';
            CLIFT.events.emit('state');
        },

        toggle() {
            this.set('enabled', !this.options.enabled);
            return this.options.enabled;
        },

        applyPreset(name) {
            if (!PRESETS[name]) return;
            Object.assign(this.options, PRESETS[name]);
            this.preset = name;
            CLIFT.events.emit('state');
        },

        stepPreset(dir = 1) {
            const i = this.presetNames.indexOf(this.preset);
            this.applyPreset(this.presetNames[CLIFT.util.wrap(i + dir, this.presetNames.length)]);
        },

        stepStyle(dir = 1) {
            const i = this.styleNames.indexOf(this.options.style);
            this.set('style', this.styleNames[CLIFT.util.wrap(i + dir, this.styleNames.length)]);
        },

        getOptions() {
            return Object.assign({ preset: this.preset }, this.options);
        },

        setOptions(opts) {
            for (const key of Object.keys(this.options)) {
                if (opts[key] !== undefined && typeof opts[key] === typeof this.options[key]) this.options[key] = opts[key];
            }
            this.preset = PRESETS[opts.preset] ? opts.preset : '';
            CLIFT.events.emit('state');
        }
    };

    CLIFT.output = output;
    window.CLIFTPostFX = output; // legacy name
})();
