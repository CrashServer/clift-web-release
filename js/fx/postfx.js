// Output stage. Each frame the engine hands over its source canvas (ASCII or an
// experimental mode). With post-FX off the source canvas is shown as-is; with
// post-FX on (or while recording) it is drawn onto the output canvas through a
// CRT shader (tint, glow, scanlines, vignette, chromatic offset). The output
// canvas falls back to a plain 2D copy when WebGL is unavailable.

(function () {
    const VERTEX = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            v_uv.y = 1.0 - v_uv.y;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;

    const FRAGMENT = `
        precision mediump float;
        uniform sampler2D u_tex;
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
        varying vec2 v_uv;

        void main() {
            vec2 uv = v_uv;
            vec3 color = texture2D(u_tex, uv).rgb;

            if (u_enabled) {
                if (u_chroma > 0.0) {
                    vec2 off = vec2(u_chroma / u_resolution.x, 0.0);
                    color.r = texture2D(u_tex, uv + off).r;
                    color.b = texture2D(u_tex, uv - off).b;
                }
                if (u_glow > 0.0) {
                    vec3 sum = vec3(0.0);
                    vec2 px = u_glowSize * 2.0 / u_resolution;
                    for (float x = -2.0; x <= 2.0; x++) {
                        for (float y = -2.0; y <= 2.0; y++) {
                            float w = exp(-(x * x + y * y) * 0.35);
                            sum += texture2D(u_tex, uv + vec2(x, y) * px).rgb * w;
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

    const output = {
        canvas: null,
        gl: null,
        ctx2d: null,
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
            this.resize();
            window.addEventListener('resize', () => this.resize());

            const gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });
            if (gl && this.setupGL(gl)) {
                this.gl = gl;
            } else {
                CLIFT.warn('WebGL unavailable - post-FX disabled, using 2D output');
                this.ctx2d = this.canvas.getContext('2d');
            }
        },

        get supported() {
            return !!this.gl;
        },

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = Math.round(window.innerWidth * dpr);
            this.canvas.height = Math.round(window.innerHeight * dpr);
        },

        setupGL(gl) {
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
            const vs = compile(gl.VERTEX_SHADER, VERTEX);
            const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
            if (!vs || !fs) return false;

            const program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                CLIFT.error('shader link failed:', gl.getProgramInfoLog(program));
                return false;
            }
            gl.useProgram(program);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            const pos = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            this.uniforms = {};
            for (const name of ['u_tex', 'u_resolution', 'u_enabled', 'u_tint', 'u_tintAmount', 'u_glow',
                'u_glowSize', 'u_scanlines', 'u_vignette', 'u_chroma', 'u_invert']) {
                this.uniforms[name] = gl.getUniformLocation(program, name);
            }
            gl.uniform1i(this.uniforms.u_tex, 0);
            return true;
        },

        render(source) {
            const useOutput = (this.options.enabled && this.gl) || CLIFT.recorder.recording;
            this.show(useOutput ? this.canvas : source);
            if (!useOutput) return;
            if (this.gl) this.renderGL(source);
            else this.ctx2d.drawImage(source, 0, 0, this.canvas.width, this.canvas.height);
        },

        // Only the canvas currently in use is displayed.
        show(canvas) {
            if (this.visible === canvas) return;
            if (this.visible) this.visible.style.visibility = 'hidden';
            canvas.style.visibility = 'visible';
            this.visible = canvas;
        },

        renderGL(source) {
            const gl = this.gl;
            const o = this.options;
            const u = this.uniforms;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            const tint = STYLES[o.style];
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
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },

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
