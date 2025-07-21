// CLIFT Clean Post-Processing Effects
// Only color styling and glow - no mess

window.CLIFTPostFX = {
    gl: null,
    canvas: null,
    sourceCanvas: null,
    program: null,
    sourceTexture: null,
    quadBuffer: null,
    uniformLocations: null,
    
    // Clean options - only what we need
    options: {
        enabled: true,
        crtStyle: 'green',
        glowEnabled: true,
        glowIntensity: 0.8,
        glowSize: 1.0,
        colorEnabled: true,
        invertColors: false
    },
    
    // CRT color styles
    styles: {
        green: [0.0, 1.0, 0.3],
        amber: [1.0, 0.7, 0.0],
        blue: [0.3, 0.7, 1.0],
        white: [1.0, 1.0, 1.0],
        cyan: [0.0, 1.0, 1.0],
        red: [1.0, 0.3, 0.3]
    },
    
    init: function(sourceCanvas) {
        console.log('Initializing Clean Post-FX...');
        this.sourceCanvas = sourceCanvas;
        this.createCanvas();
        
        if (!this.initWebGL()) {
            console.error('Failed to initialize WebGL');
            return false;
        }
        
        this.createShaders();
        this.createBuffers();
        this.startRenderLoop();
        
        console.log('Clean Post-FX initialized successfully');
        return true;
    },
    
    createCanvas: function() {
        const existing = document.getElementById('postfx-canvas');
        if (existing) existing.remove();
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'postfx-canvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.cssText = `
            position: fixed; top: 0; left: 0; 
            width: 100vw; height: 100vh; 
            z-index: 1; pointer-events: none;
            image-rendering: pixelated;
        `;
        
        document.body.appendChild(this.canvas);
        console.log('Clean PostFX canvas created');
    },
    
    initWebGL: function() {
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return false;
        }
        return true;
    },
    
    createShaders: function() {
        const gl = this.gl;
        
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;
        
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform vec2 u_resolution;
            uniform vec3 u_crtColor;
            uniform bool u_glowEnabled;
            uniform float u_glowIntensity;
            uniform float u_glowSize;
            uniform bool u_colorEnabled;
            uniform bool u_invertColors;
            
            varying vec2 v_texCoord;
            
            // Clean glow function
            vec3 glow(sampler2D tex, vec2 uv, float intensity, float size) {
                if (!u_glowEnabled) return vec3(0.0);
                
                vec3 glowColor = vec3(0.0);
                float texelSize = 1.0 / min(u_resolution.x, u_resolution.y);
                
                // Simple clean glow - 5x5 sample
                for (float x = -2.0; x <= 2.0; x++) {
                    for (float y = -2.0; y <= 2.0; y++) {
                        vec2 offset = vec2(x, y) * texelSize * size;
                        vec3 sample = texture2D(tex, uv + offset).rgb;
                        float distance = length(vec2(x, y));
                        float weight = exp(-distance * distance * 0.4);
                        glowColor += sample * weight;
                    }
                }
                
                return glowColor / 15.0 * intensity;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                vec4 color = texture2D(u_texture, uv);
                
                // Apply glow effect
                if (u_glowEnabled) {
                    vec3 glowColor = glow(u_texture, uv, u_glowIntensity, u_glowSize);
                    color.rgb += u_crtColor * glowColor;
                }
                
                // Apply color styling
                if (u_colorEnabled) {
                    // Apply color inversion if enabled
                    if (u_invertColors) {
                        color.rgb = 1.0 - color.rgb;
                    }
                    
                    // Apply CRT color tint - more dramatic
                    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    color.rgb = mix(color.rgb, u_crtColor * luminance * 1.5, 0.7);
                }
                
                gl_FragColor = color;
            }
        `;
        
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Shader program failed to link:', gl.getProgramInfoLog(this.program));
            return;
        }
        
        // Get uniform locations
        this.uniformLocations = {
            u_texture: gl.getUniformLocation(this.program, 'u_texture'),
            u_resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            u_crtColor: gl.getUniformLocation(this.program, 'u_crtColor'),
            u_glowEnabled: gl.getUniformLocation(this.program, 'u_glowEnabled'),
            u_glowIntensity: gl.getUniformLocation(this.program, 'u_glowIntensity'),
            u_glowSize: gl.getUniformLocation(this.program, 'u_glowSize'),
            u_colorEnabled: gl.getUniformLocation(this.program, 'u_colorEnabled'),
            u_invertColors: gl.getUniformLocation(this.program, 'u_invertColors')
        };
        
        console.log('Clean shaders compiled successfully');
    },
    
    compileShader: function(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    },
    
    createBuffers: function() {
        const gl = this.gl;
        
        const vertices = new Float32Array([
            -1.0, -1.0, 0.0, 0.0,
             1.0, -1.0, 1.0, 0.0,
            -1.0,  1.0, 0.0, 1.0,
             1.0,  1.0, 1.0, 1.0
        ]);
        
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        this.sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    },
    
    render: function() {
        if (!this.options.enabled || !this.sourceCanvas) return;
        
        const gl = this.gl;
        
        // Update source texture - make sure we're getting the current content
        gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
        try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);
        } catch (e) {
            console.warn('PostFX: Could not update texture from source canvas:', e);
            return;
        }
        
        // Setup viewport and clear
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(this.program);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
        gl.uniform1i(this.uniformLocations.u_texture, 0);
        
        // Set uniforms
        gl.uniform2f(this.uniformLocations.u_resolution, this.canvas.width, this.canvas.height);
        
        const crtColor = this.styles[this.options.crtStyle] || this.styles.green;
        gl.uniform3f(this.uniformLocations.u_crtColor, crtColor[0], crtColor[1], crtColor[2]);
        
        gl.uniform1i(this.uniformLocations.u_glowEnabled, this.options.glowEnabled);
        gl.uniform1f(this.uniformLocations.u_glowIntensity, this.options.glowIntensity);
        gl.uniform1f(this.uniformLocations.u_glowSize, this.options.glowSize);
        gl.uniform1i(this.uniformLocations.u_colorEnabled, this.options.colorEnabled);
        gl.uniform1i(this.uniformLocations.u_invertColors, this.options.invertColors);
        
        // Draw quad
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        
        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
        
        gl.enableVertexAttribArray(positionLocation);
        gl.enableVertexAttribArray(texCoordLocation);
        
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    
    startRenderLoop: function() {
        const render = () => {
            const renderCanvas = document.getElementById('ascii-render-canvas');
            const experimentalCanvas = document.getElementById('experimental-render-canvas');
            
            if (this.options.enabled) {
                // Determine which canvas is currently active
                let activeCanvas = renderCanvas;
                if (window.clift && window.clift.currentRenderMode !== 0 && experimentalCanvas) {
                    activeCanvas = experimentalCanvas;
                }
                
                // Update source canvas if changed
                if (activeCanvas && this.sourceCanvas !== activeCanvas) {
                    console.log('PostFX: Switching to canvas:', activeCanvas.id);
                    this.sourceCanvas = activeCanvas;
                }
                
                // Hide both source canvases and show PostFX
                if (renderCanvas) renderCanvas.style.display = 'none';
                if (experimentalCanvas) experimentalCanvas.style.display = 'none';
                this.canvas.style.display = 'block';
                
                if (this.sourceCanvas) {
                    this.render();
                }
            } else {
                // PostFX disabled - show the appropriate canvas
                this.canvas.style.display = 'none';
                if (window.clift && window.clift.currentRenderMode !== 0 && experimentalCanvas) {
                    if (experimentalCanvas) experimentalCanvas.style.display = 'block';
                    if (renderCanvas) renderCanvas.style.display = 'none';
                } else {
                    if (renderCanvas) renderCanvas.style.display = 'block';
                    if (experimentalCanvas) experimentalCanvas.style.display = 'none';
                }
            }
            requestAnimationFrame(render);
        };
        
        render();
        console.log('Clean render loop started');
    },
    
    // Helper methods
    setStyle: function(styleName) {
        if (this.styles[styleName]) {
            this.options.crtStyle = styleName;
            console.log('CRT style set to:', styleName);
        }
    },
    
    applyPreset: function(presetName) {
        const presets = {
            minimal: {
                enabled: true,
                glowEnabled: false,
                colorEnabled: true
            },
            retro: {
                enabled: true,
                glowEnabled: true,
                glowIntensity: 2.5,
                glowSize: 1.2,
                colorEnabled: true,
                crtStyle: 'green'
            },
            heavy: {
                enabled: true,
                glowEnabled: true,
                glowIntensity: 3.5,
                glowSize: 1.8,
                colorEnabled: true,
                crtStyle: 'amber'
            },
            cyberpunk: {
                enabled: true,
                glowEnabled: true,
                glowIntensity: 3.0,
                glowSize: 1.5,
                colorEnabled: true,
                crtStyle: 'cyan'
            }
        };
        
        if (presets[presetName]) {
            Object.assign(this.options, presets[presetName]);
            console.log('Preset applied:', presetName);
        }
    },
    
    toggle: function() {
        this.options.enabled = !this.options.enabled;
        return this.options.enabled;
    },
    
    // Compatibility methods for auto mode
    setColorMode: function(mode) {
        // Color modes: 0 = full color, 1 = inverted
        this.options.invertColors = (mode === 1);
        console.log('Color mode set to:', mode, 'inverted:', this.options.invertColors);
    },
    
    setInvertColors: function(invert) {
        this.options.invertColors = invert;
        console.log('Color inversion set to:', invert);
    }
};