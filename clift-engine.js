// CLIFT Web Engine - Core rendering and control system

// Color system - matching original CLIFT ncurses colors
const CLIFT_COLORS = {
    PAIRS: {
        1: { fg: '#ff0000', bg: '#000000', name: 'Red' },      // Red
        2: { fg: '#00ff00', bg: '#000000', name: 'Grn' },      // Green
        3: { fg: '#0066ff', bg: '#000000', name: 'Blu' },      // Blue
        4: { fg: '#ffff00', bg: '#000000', name: 'Yel' },      // Yellow
        5: { fg: '#ff00ff', bg: '#000000', name: 'Mag' },      // Magenta
        6: { fg: '#00ffff', bg: '#000000', name: 'Cyn' },      // Cyan
        7: { fg: '#ffffff', bg: '#000000', name: 'Wht' },      // White
        8: { fg: '#000000', bg: '#ff0000', name: 'InvR' },     // Inverse Red
        9: { fg: '#000000', bg: '#00ff00', name: 'InvG' },     // Inverse Green
        10: { fg: '#000000', bg: '#0066ff', name: 'InvB' }     // Inverse Blue
    }
};

// Gradient types for color blending
const GRADIENT_TYPES = {
    LINEAR_H: 0,     // Horizontal linear
    LINEAR_V: 1,     // Vertical linear
    LINEAR_D1: 2,    // Diagonal top-left to bottom-right
    LINEAR_D2: 3,    // Diagonal top-right to bottom-left
    RADIAL: 4,       // Circular from center
    DIAMOND: 5,      // Diamond shape
    WAVE_H: 6,       // Horizontal wave
    WAVE_V: 7,       // Vertical wave
    NOISE: 8,        // Random noise blend
    SPIRAL: 9        // Spiral pattern
};

const GRADIENT_NAMES = [
    'Lin-H', 'Lin-V', 'Diag1', 'Diag2', 'Radial',
    'Diamond', 'Wave-H', 'Wave-V', 'Noise', 'Spiral'
];

class CLIFTEngine {
    constructor(config) {
        this.canvas = config.canvas;
        this.width = config.width || 80;
        this.height = config.height || 24;
        this.fps = config.fps || 30;
        
        // Create a 2D canvas for rendering ASCII art
        this.renderCanvas = document.createElement('canvas');
        this.renderCanvas.id = 'ascii-render-canvas';
        this.ctx = this.renderCanvas.getContext('2d');
        this.setupRenderCanvas();
        
        // Dual deck system with color support
        this.decks = [
            { 
                scene: 0, 
                category: 0, 
                params: {},
                primaryColor: 2,      // Green
                secondaryColor: 6,    // Cyan
                gradientType: GRADIENT_TYPES.LINEAR_H,
                active: true,
                renderMode: 0         // ASCII mode
            },
            { 
                scene: 10, 
                category: 1, 
                params: {},
                primaryColor: 1,      // Red
                secondaryColor: 4,    // Yellow
                gradientType: GRADIENT_TYPES.RADIAL,
                active: false,
                renderMode: 0         // ASCII mode
            }
        ];
        this.activeDeck = 0;
        this.crossfader = 0.0; // 0 = Deck A, 1 = Deck B
        this.lastCrossfader = 0.0;
        
        // Rendering buffers with color support
        this.bufferA = this.createBuffer();
        this.bufferB = this.createBuffer();
        this.outputBuffer = this.createBuffer();
        this.colorBufferA = this.createColorBuffer();
        this.colorBufferB = this.createColorBuffer();
        this.outputColorBuffer = this.createColorBuffer();
        
        // Effects
        this.currentEffect = 0;
        this.effects = ['None', 'Invert', 'Mirror', 'Rotate', 'Zoom', 'Pixelate', 
                       'Wave', 'Ripple', 'Glitch', 'RGB Shift', 'Blur', 'Edge',
                       'Glow', 'ASCII Gradient', 'Scanlines', 'Chromatic', 'Character Emission',
                       '3D Perspective', '3D Cylinder', '3D Sphere', '3D Tunnel',
                       'Edge Detection', 'Emboss', 'Motion Blur', 'Sharpen', 'ASCII Blur', 'Dither'];
        
        // Timing
        this.bpm = 120;
        this.beat = 0;
        this.frameCount = 0;
        this.lastTime = 0;
        this.actualFPS = 0;
        
        // Audio
        this.audioEnabled = false;
        this.audioData = null;  // Don't initialize with zeros
        this.fullAudioData = null;
        this.audioIntensity = 0.0;
        this.beatPhase = 0.0;
        this.lastBeatTime = 0;
        
        
        // Color settings
        this.colorEnabled = true;
        this.invertColors = false;
        this.colorMode = 0; // 0 = full color, 1 = monochrome, 2 = red-only, etc.
        
        // Animation
        this.running = false;
        this.paused = false;
        this.animationId = null;
        
        // Experimental Rendering Modes
        this.renderModes = ['ASCII', 'Surface', 'Mesh', 'Particles', 'Lines', 'Dots', 'Waves', 'Plasma', '3D ASCII'];
        this.currentRenderMode = 0; // 0 = ASCII
        this.experimentalCanvas = null;
        this.experimentalCtx = null;
        
        // Particle system for particle mode
        this.particles = [];
        this.maxParticles = 2000;
        
        // Line system for line mode
        this.lineSegments = [];
        this.maxLines = 500;
        
        // Full Auto mode - BPM synchronized
        this.fullAuto = false;
        this.autoTimer = 0;
        this.lastAutoSwitch = 0;
        this.autoBeatCount = 0;
        
        // Adjust canvas size based on screen
        this.adjustCanvasSize();
        window.addEventListener('resize', () => {
            this.adjustCanvasSize();
            this.updateCanvasSize();
        });
    }
    
    setupRenderCanvas() {
        // Hide the original DOM canvas and show render canvas
        this.canvas.style.display = 'none';
        this.renderCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            font-family: 'Courier New', monospace;
            z-index: 1;
            background: #000;
            image-rendering: pixelated;
        `;
        document.body.appendChild(this.renderCanvas);
        
        this.updateCanvasSize();
    }
    
    updateCanvasSize() {
        // Calculate character dimensions
        const charWidth = Math.floor(window.innerWidth / this.width);
        const charHeight = Math.floor(window.innerHeight / this.height);
        
        this.renderCanvas.width = this.width * charWidth;
        this.renderCanvas.height = this.height * charHeight;
        
        this.charWidth = charWidth;
        this.charHeight = charHeight;
        
        // Set up 2D context for ASCII rendering
        this.ctx.font = `${charHeight * 0.8}px "Courier New", monospace`;
        this.ctx.textBaseline = 'top';
        this.ctx.imageSmoothingEnabled = false;
    }
    
    // Calculate gradient factor (0.0 to 1.0) for color blending
    calculateGradientFactor(x, y, width, height, gradientType, time) {
        const centerX = width / 2;
        const centerY = height / 2;
        const normalizedX = x / width;
        const normalizedY = y / height;
        
        switch (gradientType) {
            case GRADIENT_TYPES.LINEAR_H:
                return normalizedX;
                
            case GRADIENT_TYPES.LINEAR_V:
                return normalizedY;
                
            case GRADIENT_TYPES.LINEAR_D1:
                return (normalizedX + normalizedY) / 2;
                
            case GRADIENT_TYPES.LINEAR_D2:
                return (normalizedX + (1 - normalizedY)) / 2;
                
            case GRADIENT_TYPES.RADIAL:
                const distance = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );
                const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
                return Math.min(1.0, distance / maxDistance);
                
            case GRADIENT_TYPES.DIAMOND:
                const manhattanDistance = Math.abs(x - centerX) + Math.abs(y - centerY);
                const maxManhattan = centerX + centerY;
                return Math.min(1.0, manhattanDistance / maxManhattan);
                
            case GRADIENT_TYPES.WAVE_H:
                const waveH = (Math.sin(normalizedX * Math.PI * 2 + time * 0.02) + 1) / 2;
                return waveH;
                
            case GRADIENT_TYPES.WAVE_V:
                const waveV = (Math.sin(normalizedY * Math.PI * 2 + time * 0.02) + 1) / 2;
                return waveV;
                
            case GRADIENT_TYPES.NOISE:
                // Pseudo-random noise pattern
                const noise = (Math.sin(x * 0.1 + time * 0.01) * Math.cos(y * 0.1 + time * 0.01) + 1) / 2;
                return noise;
                
            case GRADIENT_TYPES.SPIRAL:
                const angle = Math.atan2(y - centerY, x - centerX);
                const spiralDistance = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );
                const spiral = (Math.sin(angle * 3 + spiralDistance * 0.1 + time * 0.03) + 1) / 2;
                return spiral;
                
            default:
                return 0.5;
        }
    }
    
    // Get visual color for a character based on position and deck settings
    getVisualColor(char, deck, audioIntensity, x, y, width, height, time) {
        // Special case for Matrix rain - always green
        if (deck.scene === 1 && deck.category === 0) {
            return 2; // Green
        }
        
        // Calculate gradient factor for this position
        let gradientFactor = this.calculateGradientFactor(
            x, y, width, height, deck.gradientType, time
        );
        
        // Apply audio intensity modulation to gradient
        gradientFactor += audioIntensity * 0.3;
        gradientFactor = Math.max(0.0, Math.min(1.0, gradientFactor));
        
        // Blend between primary and secondary colors based on gradient
        if (gradientFactor > 0.5) {
            return deck.secondaryColor;
        } else {
            return deck.primaryColor;
        }
    }
    
    createBuffer() {
        const buffer = [];
        for (let y = 0; y < this.height; y++) {
            buffer[y] = new Array(this.width).fill(' ');
        }
        return buffer;
    }
    
    createColorBuffer() {
        const buffer = [];
        for (let y = 0; y < this.height; y++) {
            buffer[y] = new Array(this.width).fill(7); // Default to white
        }
        return buffer;
    }
    
    clearBuffer(buffer) {
        // Optimized buffer clearing using fill()
        for (let y = 0; y < this.height; y++) {
            buffer[y].fill(' ');
        }
    }
    
    clearColorBuffer(buffer) {
        // Optimized color buffer clearing using fill()
        for (let y = 0; y < this.height; y++) {
            buffer[y].fill(7); // Default to white
        }
    }
    
    adjustCanvasSize() {
        // Default classic ASCII VJ dimensions - can be changed via setResolution
        if (!this.width) this.width = 80;
        if (!this.height) this.height = 24;
        
        // Recreate buffers with current size
        this.bufferA = this.createBuffer();
        this.bufferB = this.createBuffer();
        this.outputBuffer = this.createBuffer();
        this.colorBufferA = this.createColorBuffer();
        this.colorBufferB = this.createColorBuffer();
        this.outputColorBuffer = this.createColorBuffer();
    }
    
    setResolution(width, height) {
        console.log(`Changing resolution from ${this.width}x${this.height} to ${width}x${height}`);
        
        this.width = width;
        this.height = height;
        
        // Update canvas dimensions and rendering
        this.updateCanvasSize();
        
        // Recreate all buffers
        this.adjustCanvasSize();
        
        console.log(`Resolution changed to ${width}x${height}`);
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.running) return;
        
        // Handle pause state
        if (this.paused) {
            // Keep animation frame going but don't update anything
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        // Update FPS counter
        if (deltaTime > 0) {
            this.actualFPS = Math.round(1000 / deltaTime);
        }
        
        // Update beat counter
        const beatInterval = 60000 / this.bpm;
        this.beat = (currentTime % beatInterval) / beatInterval;
        
        // Auto options helper function
        const getAutoOptions = () => {
            const elements = window.elements;
            if (!elements) return { scenes: true, effects: true, crossfade: true, postfx: true, experimental: true, colors: true, subdivision: 4 };
            
            return {
                scenes: elements.autoScenes ? elements.autoScenes.checked : true,
                effects: elements.autoEffects ? elements.autoEffects.checked : true,
                crossfade: elements.autoCrossfade ? elements.autoCrossfade.checked : true,
                postfx: elements.autoPostfx ? elements.autoPostfx.checked : true,
                experimental: elements.autoExperimental ? elements.autoExperimental.checked : true,
                colors: elements.autoColors ? elements.autoColors.checked : true,
                subdivision: elements.autoSubdivision ? parseInt(elements.autoSubdivision.value) : 4
            };
        };

        // Full Auto mode - BPM-synchronized with different timing multipliers
        if (this.fullAuto && !this.paused) {
            const beatProgress = this.beat;
            const beatInterval = 60000 / this.bpm; // milliseconds per beat
            
            // Check if we're on a beat (close to 0 in the beat cycle)
            const onBeat = beatProgress < 0.1;
            
            if (onBeat && currentTime - this.lastAutoSwitch > 100) { // Prevent multiple triggers
                this.lastAutoSwitch = currentTime;
                
                // Get current auto options
                const options = getAutoOptions();
                const beatCount = Math.floor(currentTime / beatInterval);
                const subdivision = options.subdivision;
                
                // Scene changes: every (16 / subdivision) beats
                const sceneInterval = Math.max(1, Math.floor(16 / subdivision));
                if (beatCount % sceneInterval === 0) {
                    if (options.crossfade) {
                        // Trigger crossfade transition
                        console.log('Full Auto: Triggering crossfade transition');
                        if (window.TransitionEngine) {
                            window.TransitionEngine.trigger();
                            console.log('Full Auto: TransitionEngine.trigger() called');
                        } else {
                            console.log('Full Auto: TransitionEngine not available, using fallback');
                            this.switchDeck(); // Fallback
                        }
                    }
                    
                    if (options.scenes) {
                        // Random scene from ALL available scenes (0-199 + custom scenes)
                        const totalCustomScenes = Object.keys(window.CLIFTCustomScenes || {}).length;
                        const totalScenes = 200 + totalCustomScenes;
                        const randomScene = Math.floor(Math.random() * totalScenes);
                        const deck = this.decks[this.activeDeck];
                        
                        if (randomScene < 200) {
                            // Original scenes (0-199)
                            deck.category = Math.floor(randomScene / 10);
                            deck.scene = randomScene % 10;
                        } else {
                            // Custom scenes (category 20+)
                            const customSceneIndex = randomScene - 200;
                            const customSceneIds = Object.keys(window.CLIFTCustomScenes || {});
                            if (customSceneIds.length > 0) {
                                const customSceneId = customSceneIds[customSceneIndex % customSceneIds.length];
                                deck.category = Math.floor(parseInt(customSceneId) / 10);
                                deck.scene = parseInt(customSceneId) % 10;
                            }
                        }
                        console.log(`Full Auto Scene Change: ${deck.category}-${deck.scene}`);
                    }
                    
                    if (options.colors) {
                        // Random colors with scene change
                        this.randomizeColors();
                    }
                    
                    if (options.experimental) {
                        // Random render mode for current deck
                        const deck = this.decks[this.activeDeck];
                        deck.renderMode = Math.floor(Math.random() * this.renderModes.length);
                        console.log(`Full Auto Render Mode: ${this.renderModes[deck.renderMode]}`);
                    }
                    
                    if (options.postfx && window.CLIFTPostFX) {
                        // Post-FX changes
                        const presets = ['minimal', 'retro', 'heavy', 'cyberpunk'];
                        const styles = ['green', 'amber', 'blue', 'white', 'cyan', 'red'];
                        const randomPreset = presets[Math.floor(Math.random() * presets.length)];
                        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
                        
                        window.CLIFTPostFX.applyPreset(randomPreset);
                        window.CLIFTPostFX.setStyle(randomStyle);
                        console.log(`Full Auto Post-FX: ${randomPreset} / ${randomStyle}`);
                    }
                }
                
                // Effect changes: every (8 / subdivision) beats
                const effectInterval = Math.max(1, Math.floor(8 / subdivision));
                if (beatCount % effectInterval === 0 && beatCount % sceneInterval !== 0) {
                    if (options.effects) {
                        this.currentEffect = Math.floor(Math.random() * this.effects.length);
                        console.log(`Full Auto Effect: ${this.effects[this.currentEffect]}`);
                    }
                }
                
                // Gradient and color changes: every (4 / subdivision) beats  
                const colorInterval = Math.max(1, Math.floor(4 / subdivision));
                if (beatCount % colorInterval === 0 && beatCount % effectInterval !== 0 && beatCount % sceneInterval !== 0) {
                    if (options.colors) {
                        // Random gradient type for current deck
                        this.decks[this.activeDeck].gradientType = Math.floor(Math.random() * Object.keys(GRADIENT_TYPES).length);
                        
                        // Color cycling
                        if (Math.random() > 0.5) {
                            this.nextPrimaryColor();
                        } else {
                            this.nextSecondaryColor();
                        }
                        
                        // Random color mode occasionally
                        if (Math.random() > 0.8) {
                            this.colorMode = Math.floor(Math.random() * 2); // Only 0 or 1 for clean PostFX
                            if (options.postfx && window.CLIFTPostFX) {
                                window.CLIFTPostFX.setColorMode(this.colorMode);
                            }
                        }
                    }
                }
                
                // Crossfader and subtle changes: every 2 beats
                if (beatCount % 2 === 0 && beatCount % 4 !== 0) {
                    // Advanced crossfader automation with multiple patterns
                    const pattern = Math.floor(currentTime / 15000) % 5;
                    switch (pattern) {
                        case 0: // Smooth sine wave
                            this.crossfader = Math.sin(currentTime * 0.001) * 0.5 + 0.5;
                            break;
                        case 1: // Rapid back-and-forth
                            this.crossfader = Math.sin(currentTime * 0.005) * 0.5 + 0.5;
                            break;
                        case 2: // Sawtooth sweep
                            this.crossfader = (currentTime * 0.0003) % 1.0;
                            break;
                        case 3: // Square wave cuts
                            this.crossfader = Math.sin(currentTime * 0.002) > 0 ? 0.9 : 0.1;
                            break;
                        case 4: // Random jumps
                            if (Math.random() > 0.9) this.crossfader = Math.random();
                            break;
                    }
                    
                    // Random color inversion occasionally
                    if (Math.random() > 0.9) {
                        this.invertColors = !this.invertColors;
                        if (window.CLIFTPostFX) {
                            window.CLIFTPostFX.setInvertColors(this.invertColors);
                        }
                    }
                    
                    // Subtle clean PostFX changes
                    if (window.CLIFTPostFX && Math.random() > 0.9) {
                        window.CLIFTPostFX.options.glowEnabled = Math.random() > 0.2; // Keep glow on most of the time
                    }
                }
                
                // Every beat: minor clean PostFX automation
                if (beatCount % 1 === 0) {
                    // Simple clean Post-FX parameter automation
                    if (window.CLIFTPostFX && Math.random() > 0.95) {
                        // Only adjust glow intensity subtly
                        window.CLIFTPostFX.options.glowIntensity = 2.0 + Math.random() * 3.0;
                    }
                    
                    // Random deck parameter changes
                    if (Math.random() > 0.95) {
                        const deck = this.decks[this.activeDeck];
                        if (Math.random() > 0.5) {
                            deck.gradientType = Math.floor(Math.random() * Object.keys(GRADIENT_TYPES).length);
                        }
                        if (Math.random() > 0.7) {
                            deck.primaryColor = Math.floor(Math.random() * 10) + 1;
                            deck.secondaryColor = Math.floor(Math.random() * 10) + 1;
                        }
                    }
                }
            }
        }
        
        // Clear buffers (only if scene changed or crossfader moved significantly)
        const shouldClearBuffers = this.frameCount % 2 === 0 || Math.abs(this.crossfader - this.lastCrossfader) > 0.1;
        if (shouldClearBuffers) {
            this.clearBuffer(this.bufferA);
            this.clearBuffer(this.bufferB);
            this.clearColorBuffer(this.colorBufferA);
            this.clearColorBuffer(this.colorBufferB);
            this.lastCrossfader = this.crossfader;
        }
        
        // Render scenes to deck buffers
        this.renderScene(this.decks[0], this.bufferA, this.colorBufferA, currentTime);
        this.renderScene(this.decks[1], this.bufferB, this.colorBufferB, currentTime);
        
        // Mix decks based on crossfader
        this.mixBuffers();
        
        // Apply effects
        if (this.currentEffect > 0) {
            this.applyEffect(this.outputBuffer, this.currentEffect);
        }
        
        // Render to canvas
        this.render();
        
        // Render experimental mode if enabled for active deck
        const activeDeckRenderMode = this.decks[this.activeDeck].renderMode;
        if (activeDeckRenderMode !== 0) {
            // Update global mode to match active deck for rendering
            this.currentRenderMode = activeDeckRenderMode;
            this.renderExperimental();
        } else {
            this.currentRenderMode = 0;
        }
        
        this.frameCount++;
        this.lastTime = currentTime;
        
        // Schedule next frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    renderScene(deck, buffer, colorBuffer, time) {
        const sceneId = deck.category * 10 + deck.scene;
        
        if (window.DebugLogger) {
            window.DebugLogger.info('ENGINE', 'renderScene called', {
                sceneId,
                category: deck.category,
                scene: deck.scene,
                audioEnabled: this.audioEnabled,
                demoMode: this.demoAudioMode,
                time: time
            });
        }
        
        // Check custom scenes first (category 20+), then original scenes
        let sceneFunction = null;
        if (deck.category >= 20 && window.CLIFTCustomScenes && window.CLIFTCustomScenes[sceneId]) {
            sceneFunction = window.CLIFTCustomScenes[sceneId];
            if (window.DebugLogger) {
                window.DebugLogger.info('ENGINE', 'Using custom scene function', { sceneId });
            }
        } else if (window.CLIFTScenes && window.CLIFTScenes[sceneId]) {
            sceneFunction = window.CLIFTScenes[sceneId];
            if (window.DebugLogger) {
                window.DebugLogger.info('ENGINE', 'Using regular scene function', { sceneId });
            }
        } else {
            if (window.DebugLogger) {
                window.DebugLogger.warn('ENGINE', 'No scene function found', { sceneId });
            }
        }
        
        if (sceneFunction) {
            // Create params object compatible with scenes
            let audioArray;
            
            // Use actual audio data or provide simulated default
            if (this.audioEnabled && this.audioData) {
                if (window.DebugLogger) {
                    window.DebugLogger.info('AUDIO', 'Using real audio data');
                }
                audioArray = Array.isArray(this.audioData) ? this.audioData : (this.audioData?.spectrum || this.audioData);
                if (window.DebugLogger) {
                    window.DebugLogger.info('AUDIO', 'Real audio processed', {
                        type: typeof audioArray,
                        length: audioArray?.length,
                        isArray: Array.isArray(audioArray),
                        isFloat32: audioArray instanceof Float32Array
                    });
                }
            } else {
                if (window.DebugLogger) {
                    window.DebugLogger.info('AUDIO', 'Creating default audio data (audio disabled) - mimicking real audio structure');
                }
                // Create EXACT same structure as real audio system provides
                // Real audio creates normalized Float32Array(64), not 128!
                const spectrum = new Float32Array(64);
                for (let i = 0; i < 64; i++) {
                    spectrum[i] = Math.random() * 0.3;
                }
                
                // Create fake band levels matching real audio structure
                const bandLevels = {
                    bass: 0.3,
                    lowMid: 0.3, 
                    mid: 0.3,
                    highMid: 0.3,
                    treble: 0.3,
                    overall: 0.3
                };
                
                // Create fake advanced features
                const advancedFeatures = {
                    attack: 0,
                    brightness: 0.5,
                    dynamicRange: 0.5,
                    percussiveContent: 0.3,
                    harmonicContent: 0.5,
                    spectralFlatness: 0.5,
                    spectralCentroid: 0.5,
                    spectralRolloff: 0.7,
                    zeroCrossingRate: 0.4
                };
                
                // Create complete audioData structure exactly like real audio
                const fakeAudioData = {
                    spectrum: spectrum,
                    bands: bandLevels,
                    beat: {
                        detected: false,
                        intensity: 0,
                        confidence: 0.5
                    },
                    volume: 0.3,
                    energy: 0.3,
                    bpm: 120,
                    advanced: advancedFeatures,
                    hyperReactive: {
                        attack: 0,
                        brightness: 0.5,
                        dynamicRange: 0.5
                    }
                };
                
                // Set both audio and audioData to match real audio behavior
                audioArray = spectrum; // For backward compatibility
                this.audioData = fakeAudioData; // Store complete structure
                this.fullAudioData = fakeAudioData;
                
                if (window.DebugLogger) {
                    window.DebugLogger.info('AUDIO', 'Fake audio data created with real structure', {
                        spectrumLength: spectrum.length,
                        hasBands: !!fakeAudioData.bands,
                        hasAdvanced: !!fakeAudioData.advanced,
                        structure: Object.keys(fakeAudioData)
                    });
                }
            }
            
            // Debug audio data occasionally
            if (Math.random() < 0.02 && (sceneId < 4 || (sceneId >= 20 && sceneId < 30))) { // 2% chance, for showcase scenes and category 2
                console.log(`Scene ${sceneId} audio:`, {
                    enabled: this.audioEnabled,
                    demoMode: this.demoAudioMode,
                    dataLength: audioArray?.length,
                    avgLevel: audioArray ? Array.from(audioArray).reduce((a,b) => a+b, 0) / audioArray.length : 0,
                    maxLevel: audioArray ? Math.max(...audioArray) : 0,
                    firstFew: audioArray ? Array.from(audioArray.slice(0, 5)) : []
                });
            }
            
            console.log(`[DEBUG] Preparing to call scene function ${sceneId}`);
            console.log(`[DEBUG] Audio state: audioArray length=${audioArray?.length}, beat=${this.beat}, beatPhase=${this.beatPhase}`);
            
            const params = {
                beat: this.beat,
                beatPhase: this.beatPhase,
                bpm: this.bpm,
                frame: this.frameCount,
                audio: audioArray,  // Scenes expect 'audio' not 'audioData'
                audioData: audioArray,  // Keep both for compatibility
                // Add full audio data if available (real or demo) - now uses the fake structure when audio disabled
                audioInfo: this.getAudioInfo() || this.fullAudioData,
                deckParams: deck.params
            };
            
            // Safety check: ensure audio array is never empty or malformed
            if (!params.audio || params.audio.length === 0) {
                if (window.DebugLogger) {
                    window.DebugLogger.error('AUDIO', 'Invalid audio array detected! Creating emergency fallback', {
                        audioType: typeof params.audio,
                        audioLength: params.audio?.length,
                        audioValue: params.audio
                    });
                }
                params.audio = new Float32Array(128);
                for (let i = 0; i < 128; i++) {
                    params.audio[i] = 0.3;
                }
                params.audioData = params.audio;
            }
            
            if (window.DebugLogger) {
                window.DebugLogger.info('SCENE', 'About to call scene function', {
                    sceneId,
                    audioLength: params.audio?.length,
                    audioInfoType: typeof params.audioInfo,
                    hasBands: !!params.audioInfo?.bands,
                    beat: params.beat,
                    bpm: params.bpm,
                    audioIsValidArray: Array.isArray(params.audio) || params.audio instanceof Float32Array,
                    bufferDimensions: { width: this.width, height: this.height },
                    time: time
                });
            }
            
            try {
                sceneFunction(buffer, this.width, this.height, time, params);
                if (window.DebugLogger) {
                    window.DebugLogger.info('SCENE', 'Scene function completed successfully', { sceneId });
                }
            } catch (error) {
                if (window.DebugLogger) {
                    window.DebugLogger.error('SCENE', 'CRASH in scene function', {
                        sceneId,
                        error: error.message,
                        stack: error.stack,
                        audioState: {
                            audio: params.audio,
                            length: params.audio?.length,
                            type: typeof params.audio,
                            isArray: Array.isArray(params.audio),
                            isFloat32: params.audio instanceof Float32Array,
                            first10: params.audio ? Array.from(params.audio.slice(0, 10)) : null
                        },
                        params: {
                            beat: params.beat,
                            beatPhase: params.beatPhase,
                            bpm: params.bpm,
                            frame: params.frame
                        }
                    });
                }
                throw error; // Re-throw to see the full crash
            }
        } else {
            // Fallback test pattern
            this.renderTestPattern(buffer, sceneId);
        }
        
        // Populate color buffer based on characters and gradient
        this.populateColorBuffer(deck, buffer, colorBuffer, time);
    }
    
    populateColorBuffer(deck, buffer, colorBuffer, time) {
        // Calculate audio intensity from audio data
        let audioIntensity = 0;
        if (this.audioEnabled && this.audioData && this.audioData.length > 0) {
            const audioArray = Array.isArray(this.audioData) ? this.audioData : Array.from(this.audioData);
            audioIntensity = audioArray.reduce((sum, val) => sum + val, 0) / audioArray.length;
        }
        
        // Populate color buffer based on characters and deck gradient settings
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = buffer[y][x];
                if (char && char !== ' ') {
                    colorBuffer[y][x] = this.getVisualColor(
                        char, deck, audioIntensity, x, y, this.width, this.height, time
                    );
                } else {
                    colorBuffer[y][x] = 7; // Default to white for empty spaces
                }
            }
        }
    }
    
    renderTestPattern(buffer, sceneId) {
        // Enhanced test pattern that fills the screen
        const text = `Scene ${sceneId}`;
        const centerY = Math.floor(this.height / 2);
        const centerX = Math.floor((this.width - text.length) / 2);
        
        // Clear buffer first
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                buffer[y][x] = ' ';
            }
        }
        
        // Scene title
        for (let i = 0; i < text.length; i++) {
            if (centerX + i < this.width) {
                buffer[centerY][centerX + i] = text[i];
            }
        }
        
        // Animated pattern that fills the screen
        const t = this.frameCount / 30;
        const chars = ['░', '▒', '▓', '█'];
        
        // Fill background with animated pattern
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y !== centerY || x < centerX || x >= centerX + text.length) {
                    const distance = Math.sqrt((x - this.width/2)**2 + (y - this.height/2)**2);
                    const wave = Math.sin(distance * 0.3 + t) * 0.5 + 0.5;
                    const charIndex = Math.floor(wave * chars.length);
                    buffer[y][x] = chars[charIndex % chars.length];
                }
            }
        }
        
        // Animated border
        const borderChar = chars[Math.floor(t) % chars.length];
        for (let x = 0; x < this.width; x++) {
            buffer[0][x] = borderChar;
            buffer[this.height - 1][x] = borderChar;
        }
        for (let y = 0; y < this.height; y++) {
            buffer[y][0] = borderChar;
            buffer[y][this.width - 1] = borderChar;
        }
    }
    
    mixBuffers() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.crossfader <= 0) {
                    // Full Deck A
                    this.outputBuffer[y][x] = this.bufferA[y][x];
                    this.outputColorBuffer[y][x] = this.colorBufferA[y][x];
                } else if (this.crossfader >= 1) {
                    // Full Deck B
                    this.outputBuffer[y][x] = this.bufferB[y][x];
                    this.outputColorBuffer[y][x] = this.colorBufferB[y][x];
                } else {
                    // Mix based on crossfader position with patterns
                    const useA = this.getMixPattern(x, y, this.crossfader);
                    
                    if (useA) {
                        this.outputBuffer[y][x] = this.bufferA[y][x];
                        this.outputColorBuffer[y][x] = this.colorBufferA[y][x];
                    } else {
                        this.outputBuffer[y][x] = this.bufferB[y][x];
                        this.outputColorBuffer[y][x] = this.colorBufferB[y][x];
                    }
                }
            }
        }
    }
    
    // Get mix pattern for crossfading (matching original CLIFT behavior)
    getMixPattern(x, y, crossfaderPos) {
        // Create different mixing patterns similar to original CLIFT
        const pattern = Math.floor(this.frameCount / 60) % 4; // Change pattern every 2 seconds
        
        switch (pattern) {
            case 0: // Checkerboard pattern
                return ((x + y) % 2) == 0 ? Math.random() > crossfaderPos : Math.random() < crossfaderPos;
                
            case 1: // Horizontal stripes
                return (y % 4) < 2 ? Math.random() > crossfaderPos : Math.random() < crossfaderPos;
                
            case 2: // Vertical stripes
                return (x % 4) < 2 ? Math.random() > crossfaderPos : Math.random() < crossfaderPos;
                
            case 3: // Time-based alternating
                return (Math.floor(this.frameCount / 30 + x + y) % 2) == 0 ? 
                    Math.random() > crossfaderPos : Math.random() < crossfaderPos;
                    
            default:
                return Math.random() > crossfaderPos;
        }
    }
    
    applyEffect(buffer, effectId) {
        if (window.CLIFTEffects && window.CLIFTEffects[this.effects[effectId]]) {
            window.CLIFTEffects[this.effects[effectId]](buffer, this.width, this.height, {
                frame: this.frameCount,
                beat: this.beat
            });
        }
    }
    
    render() {
        // Initialize dirty region tracking if not exists
        if (!this.dirtyRegions) {
            this.dirtyRegions = new Set();
            this.previousBuffer = this.createBuffer();
            this.previousColorBuffer = this.createBuffer();
            this.renderBatches = new Map();
            this.performanceStats = {
                frameCount: 0,
                lastFpsUpdate: performance.now(),
                fps: 0,
                dirtyRegionCount: 0,
                renderMethod: 'full'
            };
        }
        
        const renderStart = performance.now();
        
        // Calculate dirty regions by comparing current buffer with previous
        this.calculateDirtyRegions();
        
        // Use optimized rendering method
        if (this.dirtyRegions.size > (this.width * this.height * 0.3)) {
            // If more than 30% changed, full render is more efficient
            this.renderFull();
            this.performanceStats.renderMethod = 'full';
        } else {
            // Use dirty region rendering for better performance
            this.renderDirtyRegions();
            this.performanceStats.renderMethod = 'dirty';
        }
        
        // Store current buffer state for next frame comparison
        this.copyBuffer(this.outputBuffer, this.previousBuffer);
        this.copyBuffer(this.outputColorBuffer, this.previousColorBuffer);
        
        // Update performance stats
        this.updatePerformanceStats(renderStart);
    }
    
    calculateDirtyRegions() {
        this.dirtyRegions.clear();
        
        // Safety check: ensure buffers exist
        if (!this.previousBuffer || !this.previousColorBuffer) {
            // First render, mark everything as dirty
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
            }
            return;
        }
        
        for (let y = 0; y < this.height; y++) {
            if (!this.previousBuffer[y] || !this.previousColorBuffer[y]) {
                // Row doesn't exist, mark entire row as dirty
                for (let x = 0; x < this.width; x++) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
                continue;
            }
            
            for (let x = 0; x < this.width; x++) {
                const currentChar = this.outputBuffer[y][x];
                const previousChar = this.previousBuffer[y][x];
                const currentColor = this.outputColorBuffer[y][x];
                const previousColor = this.previousColorBuffer[y][x];
                
                if (currentChar !== previousChar || currentColor !== previousColor) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
            }
        }
    }
    
    renderFull() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        
        // Batch characters by color for efficient rendering
        this.renderBatches.clear();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y][x];
                if (char && char !== ' ') {
                    let color = '#0f0';
                    
                    if (this.colorEnabled) {
                        const colorId = this.outputColorBuffer[y][x];
                        const colorPair = CLIFT_COLORS.PAIRS[colorId];
                        if (colorPair) {
                            color = this.invertColors ? colorPair.bg : colorPair.fg;
                        }
                    }
                    
                    // Batch characters by color
                    const key = `${color}|${char}`;
                    if (!this.renderBatches.has(key)) {
                        this.renderBatches.set(key, []);
                    }
                    this.renderBatches.get(key).push({x, y});
                }
            }
        }
        
        // Render batches (one fillStyle set per color+char combination)
        for (const [key, positions] of this.renderBatches) {
            const [color, char] = key.split('|');
            this.ctx.fillStyle = color;
            
            for (const {x, y} of positions) {
                this.ctx.fillText(char, x * this.charWidth, y * this.charHeight);
            }
        }
        
    }
    
    renderDirtyRegions() {
        // Only clear and redraw dirty regions
        for (const regionKey of this.dirtyRegions) {
            const [x, y] = regionKey.split(',').map(Number);
            
            // Clear the character cell
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(
                x * this.charWidth, 
                y * this.charHeight, 
                this.charWidth, 
                this.charHeight
            );
            
            // Render new character if it exists
            const char = this.outputBuffer[y][x];
            if (char && char !== ' ') {
                let color = '#0f0';
                
                if (this.colorEnabled) {
                    const colorId = this.outputColorBuffer[y][x];
                    const colorPair = CLIFT_COLORS.PAIRS[colorId];
                    if (colorPair) {
                        color = this.invertColors ? colorPair.bg : colorPair.fg;
                    }
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillText(char, x * this.charWidth, y * this.charHeight);
            }
        }
        
    }
    
    copyBuffer(source, destination) {
        // Safety check: ensure both buffers exist and have correct dimensions
        if (!source || !destination) return;
        
        for (let y = 0; y < this.height; y++) {
            if (!source[y] || !destination[y]) continue;
            for (let x = 0; x < this.width; x++) {
                if (source[y][x] !== undefined) {
                    destination[y][x] = source[y][x];
                }
            }
        }
    }
    
    updatePerformanceStats(renderStart) {
        this.performanceStats.frameCount++;
        this.performanceStats.dirtyRegionCount = this.dirtyRegions.size;
        
        const now = performance.now();
        const renderTime = now - renderStart;
        
        // Update FPS every second
        if (now - this.performanceStats.lastFpsUpdate >= 1000) {
            this.performanceStats.fps = Math.round(
                this.performanceStats.frameCount * 1000 / (now - this.performanceStats.lastFpsUpdate)
            );
            this.performanceStats.frameCount = 0;
            this.performanceStats.lastFpsUpdate = now;
            
            // Log performance stats occasionally
            if (this.performanceStats.fps % 10 === 0) {
                console.log(`CLIFT Performance: ${this.performanceStats.fps}fps, ` +
                          `${this.performanceStats.dirtyRegionCount} dirty regions, ` +
                          `${this.performanceStats.renderMethod} render, ` +
                          `${renderTime.toFixed(2)}ms render time`);
            }
        }
    }
    
    getPerformanceInfo() {
        return {
            fps: this.performanceStats?.fps || 0,
            dirtyRegions: this.performanceStats?.dirtyRegionCount || 0,
            renderMethod: this.performanceStats?.renderMethod || 'unknown',
            totalCells: this.width * this.height,
            efficiency: this.performanceStats ? 
                Math.round((1 - this.performanceStats.dirtyRegionCount / (this.width * this.height)) * 100) : 0
        };
    }
    
    // Control methods
    selectDeck(deck) {
        this.activeDeck = deck;
    }
    
    switchDeck() {
        this.activeDeck = 1 - this.activeDeck;
    }
    
    setCrossfader(value) {
        this.crossfader = Math.max(0, Math.min(1, value));
    }
    
    selectCategory(cat) {
        this.decks[this.activeDeck].category = Math.max(0, cat);
        this.decks[this.activeDeck].scene = 0;
    }
    
    nextScene() {
        const deck = this.decks[this.activeDeck];
        deck.scene = (deck.scene + 1) % 10;
    }
    
    prevScene() {
        const deck = this.decks[this.activeDeck];
        deck.scene = (deck.scene - 1 + 10) % 10;
    }
    
    cycleEffect() {
        this.currentEffect = (this.currentEffect + 1) % this.effects.length;
    }
    
    nextEffect() {
        this.currentEffect = (this.currentEffect + 1) % this.effects.length;
    }
    
    prevEffect() {
        this.currentEffect = (this.currentEffect - 1 + this.effects.length) % this.effects.length;
    }
    
    setBPM(bpm) {
        this.bpm = Math.max(60, Math.min(300, bpm));
    }
    
    // Color control methods
    setPrimaryColor(colorId) {
        this.decks[this.activeDeck].primaryColor = Math.max(1, Math.min(10, colorId));
    }
    
    setSecondaryColor(colorId) {
        this.decks[this.activeDeck].secondaryColor = Math.max(1, Math.min(10, colorId));
    }
    
    setGradientType(gradientType) {
        this.decks[this.activeDeck].gradientType = Math.max(0, Math.min(9, gradientType));
    }
    
    nextPrimaryColor() {
        const deck = this.decks[this.activeDeck];
        deck.primaryColor = (deck.primaryColor % 10) + 1;
    }
    
    nextSecondaryColor() {
        const deck = this.decks[this.activeDeck];
        deck.secondaryColor = (deck.secondaryColor % 10) + 1;
    }
    
    cycleGradientType() {
        const deck = this.decks[this.activeDeck];
        deck.gradientType = (deck.gradientType + 1) % 10;
    }
    
    randomizeColors() {
        const deck = this.decks[this.activeDeck];
        deck.primaryColor = Math.floor(Math.random() * 10) + 1;
        deck.secondaryColor = Math.floor(Math.random() * 10) + 1;
        deck.gradientType = Math.floor(Math.random() * 10);
    }
    
    prevGradientType() {
        const deck = this.decks[this.activeDeck];
        deck.gradientType = (deck.gradientType - 1 + 10) % 10;
    }
    
    toggleColorEnabled() {
        this.colorEnabled = !this.colorEnabled;
        return this.colorEnabled;
    }
    
    toggleInvertColors() {
        this.invertColors = !this.invertColors;
        return this.invertColors;
    }
    
    cycleColorMode() {
        this.colorMode = (this.colorMode + 1) % 3;
        return this.colorMode;
    }
    
    // Getters for UI
    getFPS() {
        return this.actualFPS;
    }
    
    getCurrentScene() {
        if (!this.decks || this.activeDeck < 0 || this.activeDeck >= this.decks.length) {
            return '0-0';
        }
        const deck = this.decks[this.activeDeck];
        if (!deck) {
            return '0-0';
        }
        return `${deck.category || 0}-${deck.scene || 0}`;
    }
    
    getCurrentEffect() {
        if (!this.effects || this.currentEffect < 0 || this.currentEffect >= this.effects.length) {
            return 'None';
        }
        return this.effects[this.currentEffect] || 'None';
    }
    
    getBPM() {
        return this.bpm;
    }
    
    getActiveDeck() {
        return this.activeDeck;
    }
    
    // Color getters for UI
    getPrimaryColor() {
        return this.decks[this.activeDeck].primaryColor;
    }
    
    getSecondaryColor() {
        return this.decks[this.activeDeck].secondaryColor;
    }
    
    getGradientType() {
        return this.decks[this.activeDeck].gradientType;
    }
    
    getGradientName() {
        return GRADIENT_NAMES[this.decks[this.activeDeck].gradientType];
    }
    
    getColorName(colorId) {
        return CLIFT_COLORS.PAIRS[colorId]?.name || 'Unknown';
    }
    
    isColorEnabled() {
        return this.colorEnabled;
    }
    
    isInvertColors() {
        return this.invertColors;
    }
    
    getColorMode() {
        return this.colorMode;
    }
    
    // Audio integration
    async toggleAudio() {
        if (!this.audioEnabled) {
            if (window.CLIFTAudio) {
                try {
                    console.log('Starting audio...');
                    await window.CLIFTAudio.start((audioData) => {
                        // Store the complete audio data structure
                        this.audioData = audioData.spectrum || audioData;
                        this.fullAudioData = audioData;
                        
                        // Debug: Log audio data occasionally
                        if (Math.random() < 0.01) {
                            console.log('Audio data received:', {
                                spectrumLength: this.audioData?.length,
                                hasFullData: !!this.fullAudioData,
                                bands: this.fullAudioData?.bands
                            });
                        }
                    });
                    this.audioEnabled = true;
                    console.log('Audio enabled successfully');
                    
                    // Return success
                    return true;
                } catch (error) {
                    console.error('Audio failed:', error);
                    // Re-throw the error so the UI can handle it properly
                    throw error;
                }
            }
        } else {
            if (window.CLIFTAudio) {
                window.CLIFTAudio.stop();
            }
            this.audioEnabled = false;
            
            // Clear fake audio interval if it exists
            if (this.fakeAudioInterval) {
                clearInterval(this.fakeAudioInterval);
                this.fakeAudioInterval = null;
            }
        }
    }
    
    setupFakeAudio() {
        console.log('Setting up fake audio fallback');
        // Create fake audio data for when microphone access fails
        this.fakeAudioInterval = setInterval(() => {
            const fakeData = new Float32Array(64);
            const time = Date.now() / 1000;
            for (let i = 0; i < 64; i++) {
                // Generate fake audio data with some variation
                fakeData[i] = Math.abs(Math.sin(time * 0.5 + i * 0.1)) * 0.3 + 
                             Math.random() * 0.1;
            }
            this.audioData = fakeData;
        }, 1000 / 30); // 30 FPS updates
    }
    
    // WebSocket for live coding overlay
    toggleWebSocket() {
        console.log('WebSocket overlay not implemented in web version yet');
    }
    
    // Recording functionality
    toggleRecording() {
        if (!this.recording) {
            this.startRecording();
        } else {
            this.stopRecording();
        }
        return this.recording;
    }
    
    startRecording() {
        try {
            // Simple canvas recording using MediaRecorder
            if (!this.renderCanvas) {
                throw new Error('No canvas available for recording');
            }
            
            const stream = this.renderCanvas.captureStream(30); // 30 FPS
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: 'video/webm'
                });
                
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clift_recording_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                this.showSessionMessage('Recording saved!', '#0f0');
            };
            
            this.mediaRecorder.start(1000); // Collect data every second
            this.recording = true;
            this.recordingStartTime = Date.now();
            
            console.log('Recording started');
            this.showSessionMessage('Recording started...', '#f00');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.recording = false;
            this.showSessionMessage('Recording failed!', '#f00');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.recording) {
            this.mediaRecorder.stop();
            this.recording = false;
            
            const duration = ((Date.now() - this.recordingStartTime) / 1000).toFixed(1);
            console.log(`Recording stopped. Duration: ${duration}s`);
            this.showSessionMessage(`Recording stopped (${duration}s)`, '#0f0');
        }
    }
    
    // Session Management
    saveSession() {
        const sessionData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            settings: {
                bpm: this.bpm,
                fullAuto: this.fullAuto,
                activeDeck: this.activeDeck,
                crossfader: this.crossfader,
                currentEffect: this.currentEffect,
                colorMode: this.colorMode,
                invertColors: this.invertColors,
                audioEnabled: this.audioEnabled,
                paused: this.paused
            },
            decks: {
                A: {
                    scene: this.decks[0].scene,
                    category: this.decks[0].category,
                    primaryColor: this.decks[0].primaryColor,
                    secondaryColor: this.decks[0].secondaryColor,
                    gradientType: this.decks[0].gradientType,
                    params: this.decks[0].params,
                    renderMode: this.decks[0].renderMode
                },
                B: {
                    scene: this.decks[1].scene,
                    category: this.decks[1].category,
                    primaryColor: this.decks[1].primaryColor,
                    secondaryColor: this.decks[1].secondaryColor,
                    gradientType: this.decks[1].gradientType,
                    params: this.decks[1].params,
                    renderMode: this.decks[1].renderMode
                }
            },
            postfx: window.CLIFTPostFX ? {
                enabled: window.CLIFTPostFX.options.enabled,
                crtStyle: window.CLIFTPostFX.options.crtStyle,
                glowEnabled: window.CLIFTPostFX.options.glowEnabled,
                glowIntensity: window.CLIFTPostFX.options.glowIntensity
            } : null
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('clift_session', JSON.stringify(sessionData));
            console.log('Session saved to localStorage');
            this.showSessionMessage('Session saved locally!', '#0f0');
        } catch (error) {
            console.error('Failed to save session:', error);
            this.showSessionMessage('Save failed!', '#f00');
        }
    }
    
    loadSession() {
        try {
            const savedData = localStorage.getItem('clift_session');
            if (savedData) {
                const sessionData = JSON.parse(savedData);
                this.importSession(sessionData);
                this.showSessionMessage('Session loaded!', '#0f0');
            } else {
                this.showSessionMessage('No saved session found', '#f80');
            }
        } catch (error) {
            console.error('Failed to load session:', error);
            this.showSessionMessage('Load failed!', '#f00');
        }
    }
    
    exportSession() {
        const sessionData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            settings: {
                bpm: this.bpm,
                fullAuto: this.fullAuto,
                activeDeck: this.activeDeck,
                crossfader: this.crossfader,
                currentEffect: this.currentEffect,
                colorMode: this.colorMode,
                invertColors: this.invertColors,
                audioEnabled: this.audioEnabled,
                paused: this.paused
            },
            decks: {
                A: {
                    scene: this.decks[0].scene,
                    category: this.decks[0].category,
                    primaryColor: this.decks[0].primaryColor,
                    secondaryColor: this.decks[0].secondaryColor,
                    gradientType: this.decks[0].gradientType,
                    params: this.decks[0].params,
                    renderMode: this.decks[0].renderMode
                },
                B: {
                    scene: this.decks[1].scene,
                    category: this.decks[1].category,
                    primaryColor: this.decks[1].primaryColor,
                    secondaryColor: this.decks[1].secondaryColor,
                    gradientType: this.decks[1].gradientType,
                    params: this.decks[1].params,
                    renderMode: this.decks[1].renderMode
                }
            },
            postfx: window.CLIFTPostFX ? {
                enabled: window.CLIFTPostFX.options.enabled,
                crtStyle: window.CLIFTPostFX.options.crtStyle,
                glowEnabled: window.CLIFTPostFX.options.glowEnabled,
                glowIntensity: window.CLIFTPostFX.options.glowIntensity
            } : null
        };
        
        // Create downloadable file
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `clift_session_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showSessionMessage('Session exported!', '#0f0');
    }
    
    importSession(sessionData) {
        try {
            if (sessionData.settings) {
                this.bpm = sessionData.settings.bpm || 120;
                this.activeDeck = sessionData.settings.activeDeck || 0;
                this.crossfader = sessionData.settings.crossfader || 0.5;
                this.currentEffect = sessionData.settings.currentEffect || 0;
                this.colorMode = sessionData.settings.colorMode || 0;
                this.invertColors = sessionData.settings.invertColors || false;
                // Don't restore fullAuto, audioEnabled, paused automatically
            }
            
            if (sessionData.decks) {
                if (sessionData.decks.A) {
                    Object.assign(this.decks[0], sessionData.decks.A);
                    // Ensure renderMode has a default value
                    if (this.decks[0].renderMode === undefined) {
                        this.decks[0].renderMode = 0;
                    }
                }
                if (sessionData.decks.B) {
                    Object.assign(this.decks[1], sessionData.decks.B);
                    // Ensure renderMode has a default value
                    if (this.decks[1].renderMode === undefined) {
                        this.decks[1].renderMode = 0;
                    }
                }
            }
            
            if (sessionData.postfx && window.CLIFTPostFX) {
                window.CLIFTPostFX.options.enabled = sessionData.postfx.enabled;
                window.CLIFTPostFX.options.crtStyle = sessionData.postfx.crtStyle || 'green';
                window.CLIFTPostFX.options.glowEnabled = sessionData.postfx.glowEnabled;
                window.CLIFTPostFX.options.glowIntensity = sessionData.postfx.glowIntensity || 2.5;
            }
            
            console.log('Session imported successfully');
            this.showSessionMessage('Session imported!', '#0f0');
        } catch (error) {
            console.error('Failed to import session:', error);
            this.showSessionMessage('Import failed!', '#f00');
        }
    }
    
    showSessionMessage(text, color) {
        // Create temporary status message
        const msgDiv = document.createElement('div');
        msgDiv.textContent = text;
        msgDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: rgba(0,0,0,0.9); color: ${color}; padding: 10px;
            border: 1px solid ${color}; font-family: monospace; font-size: 14px;
        `;
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            if (msgDiv.parentNode) {
                document.body.removeChild(msgDiv);
            }
        }, 3000);
    }
    
    // Full Auto mode
    toggleFullAuto() {
        this.fullAuto = !this.fullAuto;
        if (this.fullAuto) {
            this.lastAutoSwitch = performance.now();
            this.autoBeatCount = 0;
            console.log('Full Auto mode enabled - BPM-synchronized timing active');
        } else {
            console.log('Full Auto mode disabled');
        }
        return this.fullAuto;
    }
    
    // Demo audio mode - generates fake audio data for testing
    startDemoAudio() {
        this.demoAudioMode = true;
        this.demoAudioTimer = 0;
        this.demoAudioData = new Float32Array(128); // Match real audio buffer size
        this.demoBeatTimer = 0;
        this.demoBeatPhase = 0;
        
        // Generate initial demo data
        this.generateDemoAudioData();
        
        console.log('Demo audio mode started');
    }
    
    stopDemoAudio() {
        this.demoAudioMode = false;
        this.demoAudioData = null;
        
        console.log('Demo audio mode stopped');
    }
    
    generateDemoAudioData() {
        if (!this.demoAudioMode || !this.demoAudioData) return;
        
        const time = performance.now() * 0.001;
        this.demoAudioTimer = time;
        
        // Simulate different musical patterns
        const bassFreq = 0.8 + Math.sin(time * 0.3) * 0.2; // Slow bass variation
        const midFreq = 1.2 + Math.sin(time * 0.7) * 0.3;  // Mid frequency variation
        const hiFreq = 0.9 + Math.sin(time * 1.3) * 0.4;   // High frequency variation
        
        // Generate beat pattern (4/4 time at ~120 BPM)
        const beatTime = (time * 2) % 4; // 4 beats cycle
        const beatIntensity = Math.max(0, 1 - (beatTime % 1) * 4); // Sharp attack, quick decay
        const beat = beatIntensity * (0.8 + Math.random() * 0.2);
        
        // Fill frequency bins with demo data
        for (let i = 0; i < this.demoAudioData.length; i++) {
            const freq = i / this.demoAudioData.length;
            let value = 0;
            
            if (freq < 0.2) {
                // Bass frequencies - strong beat response
                value = bassFreq * beat * (0.7 + Math.sin(time * 2.1 + i * 0.1) * 0.3);
            } else if (freq < 0.4) {
                // Low-mid frequencies
                value = midFreq * (0.5 + Math.sin(time * 1.7 + i * 0.2) * 0.4) * (0.3 + beat * 0.7);
            } else if (freq < 0.7) {
                // Mid frequencies
                value = midFreq * (0.4 + Math.sin(time * 2.3 + i * 0.15) * 0.3) * (0.4 + beat * 0.3);
            } else {
                // High frequencies - more sparkly
                value = hiFreq * (0.2 + Math.sin(time * 3.1 + i * 0.3) * 0.2) * (0.6 + beat * 0.4);
            }
            
            // Add some randomness for realistic variation
            value *= (0.8 + Math.random() * 0.4);
            
            // Clamp to realistic range
            this.demoAudioData[i] = Math.max(0, Math.min(1, value * 0.6));
        }
        
        // Update demo beat detection
        this.demoBeatPhase = (this.demoBeatPhase + 0.02) % 1.0;
        const beatDetected = beatIntensity > 0.7;
        
        // Store demo audio info for scenes to use
        this.demoAudioInfo = {
            bands: {
                bass: this.demoAudioData.slice(0, 6).reduce((a, b) => a + b, 0) / 6,
                lowMid: this.demoAudioData.slice(6, 12).reduce((a, b) => a + b, 0) / 6,
                mid: this.demoAudioData.slice(12, 32).reduce((a, b) => a + b, 0) / 20,
                highMid: this.demoAudioData.slice(32, 48).reduce((a, b) => a + b, 0) / 16,
                treble: this.demoAudioData.slice(48, 64).reduce((a, b) => a + b, 0) / 16
            },
            beat: {
                detected: beatDetected,
                intensity: beatIntensity,
                phase: this.demoBeatPhase
            },
            advanced: {
                attack: Math.max(0, beatIntensity - 0.3),
                brightness: 0.4 + Math.sin(time * 0.5) * 0.3,
                dynamicRange: 0.6 + Math.sin(time * 0.8) * 0.2,
                percussiveContent: beat * 0.8,
                harmonicContent: 0.5 + Math.sin(time * 0.4) * 0.2,
                spectralFlatness: 0.3 + Math.random() * 0.3
            }
        };
    }
    
    // Override audio data when in demo mode
    getAudioData() {
        if (this.demoAudioMode) {
            this.generateDemoAudioData();
            return this.demoAudioData;
        }
        return this.audioData;
    }
    
    getAudioInfo() {
        try {
            // Return real audio info if available and method exists
            if (window.CLIFTAudio && typeof window.CLIFTAudio.getAudioInfo === 'function') {
                return window.CLIFTAudio.getAudioInfo();
            }
            // Fallback to basic audio info structure when real audio enabled
            if (window.CLIFTAudio && this.audioEnabled) {
                const bandLevels = window.CLIFTAudio.calculateBandLevels ? window.CLIFTAudio.calculateBandLevels() : null;
                if (bandLevels) {
                    return {
                        bands: bandLevels,
                        beat: { detected: false, intensity: 0, phase: 0 },
                        advanced: {
                            attack: 0,
                            brightness: 0.5,
                            dynamicRange: 0.5,
                            percussiveContent: 0.3,
                            harmonicContent: 0.5,
                            spectralFlatness: 0.5
                        }
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error in getAudioInfo:', error);
            return null;
        }
    }
    
    // Experimental Surface Rendering
    toggleRenderMode() {
        const deck = this.decks[this.activeDeck];
        console.log('toggleRenderMode called for deck', this.activeDeck, 'current mode:', deck.renderMode);
        
        // Cycle through render modes for the active deck
        deck.renderMode = (deck.renderMode + 1) % this.renderModes.length;
        const modeName = this.renderModes[deck.renderMode];
        console.log('New mode for deck', this.activeDeck, ':', deck.renderMode, modeName);
        
        // Update global currentRenderMode to match active deck (for now, for compatibility)
        this.currentRenderMode = deck.renderMode;
        
        if (deck.renderMode === 0) {
            // ASCII mode - just hide experimental canvas, don't destroy it
            if (this.experimentalCanvas) {
                this.experimentalCanvas.style.display = 'none';
            }
            this.renderCanvas.style.display = 'block';
        } else {
            // Experimental mode - create canvas if needed
            if (!this.experimentalCanvas) {
                this.experimentalCanvas = document.createElement('canvas');
                this.experimentalCanvas.id = 'experimental-render-canvas';
                this.experimentalCtx = this.experimentalCanvas.getContext('2d');
                this.setupExperimentalCanvas();
            }
            
            this.renderCanvas.style.display = 'none';
            this.experimentalCanvas.style.display = 'block';
        }
        
        console.log('Render mode changed to:', modeName);
        
        // Notify PostFX about mode change if it's active
        if (window.CLIFTPostFX && window.CLIFTPostFX.options.enabled) {
            // Force PostFX to update its source canvas
            window.CLIFTPostFX.sourceCanvas = null; // Reset to force redetection
        }
        
        return { mode: modeName, index: deck.renderMode };
    }
    
    // Deck switching
    switchToDeck(deckIndex) {
        if (deckIndex >= 0 && deckIndex < this.decks.length) {
            this.activeDeck = deckIndex;
            console.log('Switched to deck', deckIndex, 'with render mode:', this.decks[deckIndex].renderMode);
            return this.decks[deckIndex];
        }
    }
    
    // Legacy compatibility
    toggleSurfaceMode() {
        return this.toggleRenderMode();
    }
    
    get surfaceMode() {
        return this.currentRenderMode !== 0;
    }
    
    setupExperimentalCanvas() {
        if (!this.experimentalCanvas) return;
        
        // Copy dimensions and styling from ASCII canvas
        this.experimentalCanvas.width = this.renderCanvas.width;
        this.experimentalCanvas.height = this.renderCanvas.height;
        
        // Copy essential styles
        this.experimentalCanvas.style.position = 'absolute';
        this.experimentalCanvas.style.top = '0';
        this.experimentalCanvas.style.left = '0';
        this.experimentalCanvas.style.width = '100%';
        this.experimentalCanvas.style.height = '100%';
        this.experimentalCanvas.style.zIndex = '1';
        this.experimentalCanvas.style.background = '#000';
        
        // Insert experimental canvas into the canvas container
        const canvasContainer = this.canvas.parentNode;
        canvasContainer.appendChild(this.experimentalCanvas);
        
        console.log('Experimental canvas initialized:', this.experimentalCanvas.width, 'x', this.experimentalCanvas.height);
        console.log('Canvas mode:', this.renderModes[this.currentRenderMode]);
    }
    
    renderExperimental() {
        if (this.currentRenderMode === 0 || !this.experimentalCtx) return;
        
        const ctx = this.experimentalCtx;
        const canvas = this.experimentalCanvas;
        const mode = this.renderModes[this.currentRenderMode];
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Test rectangle to verify canvas is working
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(5, 5, 30, 30);
        
        const cellWidth = canvas.width / this.width;
        const cellHeight = canvas.height / this.height;
        const time = this.frameCount * 0.016; // Approximate time in seconds
        
        switch (mode) {
            case 'Surface':
                this.renderSurfaceMode(ctx, cellWidth, cellHeight);
                break;
            case 'Mesh':
                this.renderMeshMode(ctx, cellWidth, cellHeight, time);
                break;
            case 'Particles':
                this.renderParticleMode(ctx, cellWidth, cellHeight, time);
                break;
            case 'Lines':
                this.renderLineMode(ctx, cellWidth, cellHeight, time);
                break;
            case 'Dots':
                this.renderDotMode(ctx, cellWidth, cellHeight, time);
                break;
            case 'Waves':
                this.renderWaveMode(ctx, cellWidth, cellHeight, time);
                break;
            case 'Plasma':
                this.renderPlasmaMode(ctx, cellWidth, cellHeight, time);
                break;
            case '3D ASCII':
                this.render3DMode(ctx, cellWidth, cellHeight, time);
                break;
        }
    }
    
    getCharacterIntensity(char) {
        // Map ASCII characters to intensity/height values
        const intensityMap = {
            '.': 0.1, ',': 0.1, '`': 0.1, "'": 0.1,
            '-': 0.2, '_': 0.2, '~': 0.2,
            ':': 0.3, ';': 0.3, '!': 0.3, '|': 0.3,
            '+': 0.4, '=': 0.4, 'i': 0.4, 'l': 0.4,
            'o': 0.5, 'O': 0.5, '0': 0.5, 'c': 0.5,
            'x': 0.6, 'X': 0.6, '*': 0.6, '%': 0.6,
            '#': 0.7, '&': 0.7, '@': 0.7,
            '█': 1.0, '▉': 0.9, '▊': 0.8, '▋': 0.7, '▌': 0.6, '▍': 0.5, '▎': 0.4, '▏': 0.3,
            '▓': 0.8, '▒': 0.6, '░': 0.4,
            '▀': 0.5, '▄': 0.5, '▐': 0.5, '▌': 0.5
        };
        
        return intensityMap[char] || 0.5;
    }
    
    getCharacterSurfaceType(char) {
        // Map characters to surface types for different rendering styles
        if ('█▉▊▋▌▍▎▏▓▒░'.includes(char)) return 'solid';
        if ('*%#@&'.includes(char)) return 'rough';
        if ('~-_='.includes(char)) return 'wave';
        if ('|!:;'.includes(char)) return 'line';
        if ('oO0c'.includes(char)) return 'sphere';
        if ('+xX'.includes(char)) return 'cross';
        return 'basic';
    }
    
    renderSurfaceElement(ctx, x, y, intensity, surfaceType, color, cellWidth, cellHeight) {
        const centerX = x * cellWidth + cellWidth / 2;
        const centerY = y * cellHeight + cellHeight / 2;
        
        // Parse color - fallback to white if parsing fails
        let r, g, b;
        try {
            const parsed = this.parseColor(color);
            r = parsed.r || 255;
            g = parsed.g || 255;
            b = parsed.b || 255;
        } catch (e) {
            // Fallback to bright color for visibility
            r = 0;
            g = 255;
            b = 0;
        }
        
        // Apply lighting based on intensity and position
        const lightIntensity = this.calculateLighting(x, y, intensity);
        const finalR = Math.min(255, r * lightIntensity);
        const finalG = Math.min(255, g * lightIntensity);
        const finalB = Math.min(255, b * lightIntensity);
        
        ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
        
        // Render based on surface type
        switch (surfaceType) {
            case 'solid':
                this.renderSolidSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                break;
            case 'rough':
                this.renderRoughSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                break;
            case 'wave':
                this.renderWaveSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                break;
            case 'line':
                this.renderLineSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                break;
            case 'sphere':
                this.renderSphereSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                break;
            case 'cross':
                this.renderCrossSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
                break;
            default:
                this.renderBasicSurface(ctx, centerX, centerY, intensity, cellWidth, cellHeight);
        }
    }
    
    calculateLighting(x, y, intensity) {
        // Simple lighting calculation with moving light source
        const time = performance.now() * 0.001;
        const lightX = this.width / 2 + Math.sin(time * 0.5) * this.width * 0.3;
        const lightY = this.height / 2 + Math.cos(time * 0.7) * this.height * 0.3;
        
        const distance = Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2);
        const maxDistance = Math.sqrt(this.width ** 2 + this.height ** 2);
        const distanceFactor = 1 - (distance / maxDistance);
        
        // Combine distance lighting with surface height
        const baseLighting = 0.3 + distanceFactor * 0.4;
        const heightLighting = intensity * 0.5;
        
        return Math.min(1.5, baseLighting + heightLighting);
    }
    
    parseColor(colorStr) {
        // Parse color string to RGB values
        if (colorStr.startsWith('#')) {
            const hex = colorStr.slice(1);
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        }
        // Default green if parsing fails
        return { r: 0, g: 255, b: 0 };
    }
    
    renderSolidSurface(ctx, x, y, intensity, w, h) {
        const size = Math.max(2, intensity * Math.min(w, h));
        ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    
    renderRoughSurface(ctx, x, y, intensity, w, h) {
        const size = intensity * Math.min(w, h) * 0.8;
        for (let i = 0; i < 4; i++) {
            const offsetX = (Math.random() - 0.5) * size * 0.5;
            const offsetY = (Math.random() - 0.5) * size * 0.5;
            const dotSize = size * (0.2 + Math.random() * 0.3);
            ctx.fillRect(x + offsetX - dotSize/2, y + offsetY - dotSize/2, dotSize, dotSize);
        }
    }
    
    renderWaveSurface(ctx, x, y, intensity, w, h) {
        const time = performance.now() * 0.002;
        const waveHeight = intensity * h * 0.5;
        const waveY = y + Math.sin(x * 0.1 + time) * waveHeight;
        ctx.fillRect(x - w*0.4, waveY - 1, w*0.8, 2);
    }
    
    renderLineSurface(ctx, x, y, intensity, w, h) {
        const lineHeight = intensity * h;
        ctx.fillRect(x - 1, y - lineHeight/2, 2, lineHeight);
    }
    
    renderSphereSurface(ctx, x, y, intensity, w, h) {
        const radius = intensity * Math.min(w, h) * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderCrossSurface(ctx, x, y, intensity, w, h) {
        const size = intensity * Math.min(w, h) * 0.6;
        ctx.fillRect(x - size/2, y - 1, size, 2);
        ctx.fillRect(x - 1, y - size/2, 2, size);
    }
    
    renderBasicSurface(ctx, x, y, intensity, w, h) {
        const size = intensity * Math.min(w, h) * 0.6;
        ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    
    // ============================================
    // NEW EXPERIMENTAL RENDERING MODES
    // ============================================
    
    renderSurfaceMode(ctx, cellWidth, cellHeight) {
        // Original surface rendering mode
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y][x];
                const color = this.outputColorBuffer[y][x];
                
                if (char && char !== ' ') {
                    const intensity = this.getCharacterIntensity(char);
                    const surfaceType = this.getCharacterSurfaceType(char);
                    this.renderSurfaceElement(ctx, x, y, intensity, surfaceType, color, cellWidth, cellHeight);
                }
            }
        }
    }
    
    renderMeshMode(ctx, cellWidth, cellHeight, time) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1;
        
        // Create wireframe mesh from ASCII data
        for (let y = 0; y < this.height - 1; y++) {
            for (let x = 0; x < this.width - 1; x++) {
                const char = this.outputBuffer[y][x];
                if (char && char !== ' ') {
                    const intensity = this.getCharacterIntensity(char);
                    const color = this.outputColorBuffer[y][x];
                    const { r, g, b } = this.parseColor(color);
                    
                    // Create mesh vertices based on intensity
                    const x1 = x * cellWidth;
                    const y1 = y * cellHeight + intensity * 20;
                    const x2 = (x + 1) * cellWidth;
                    const y2 = y * cellHeight + intensity * 20;
                    const x3 = x * cellWidth;
                    const y3 = (y + 1) * cellHeight + intensity * 20;
                    const x4 = (x + 1) * cellWidth;
                    const y4 = (y + 1) * cellHeight + intensity * 20;
                    
                    // Animate mesh with wave motion
                    const wave = Math.sin(time * 2 + x * 0.1 + y * 0.1) * 5;
                    
                    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1 + wave);
                    ctx.lineTo(x2, y2 + wave);
                    ctx.lineTo(x4, y4 + wave);
                    ctx.lineTo(x3, y3 + wave);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
    }
    
    renderParticleMode(ctx, cellWidth, cellHeight, time) {
        // Update existing particles and create new ones
        this.updateParticles(time);
        
        // Create particles from ASCII data
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y][x];
                if (char && char !== ' ' && Math.random() < 0.1) {
                    const intensity = this.getCharacterIntensity(char);
                    const color = this.outputColorBuffer[y][x];
                    const { r, g, b } = this.parseColor(color);
                    
                    // Create new particle
                    if (this.particles.length < this.maxParticles) {
                        this.particles.push({
                            x: x * cellWidth + Math.random() * cellWidth,
                            y: y * cellHeight + Math.random() * cellHeight,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            life: 1.0,
                            maxLife: 1.0 + intensity,
                            size: intensity * 3 + 1,
                            r, g, b
                        });
                    }
                }
            }
        }
        
        // Render particles
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    renderLineMode(ctx, cellWidth, cellHeight, time) {
        ctx.lineWidth = 2;
        
        // Create flowing lines from ASCII data
        for (let y = 0; y < this.height; y++) {
            ctx.beginPath();
            let started = false;
            
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y][x];
                if (char && char !== ' ') {
                    const intensity = this.getCharacterIntensity(char);
                    const color = this.outputColorBuffer[y][x];
                    const { r, g, b } = this.parseColor(color);
                    
                    const xPos = x * cellWidth;
                    const yPos = y * cellHeight + Math.sin(time * 3 + x * 0.2) * intensity * 10;
                    
                    if (!started) {
                        ctx.moveTo(xPos, yPos);
                        started = true;
                    } else {
                        ctx.lineTo(xPos, yPos);
                    }
                    
                    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                }
            }
            if (started) {
                ctx.stroke();
            }
        }
    }
    
    renderDotMode(ctx, cellWidth, cellHeight, time) {
        // Pulsating dots based on ASCII data
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y][x];
                if (char && char !== ' ') {
                    const intensity = this.getCharacterIntensity(char);
                    const color = this.outputColorBuffer[y][x];
                    const { r, g, b } = this.parseColor(color);
                    
                    const pulse = Math.sin(time * 4 + x * 0.5 + y * 0.3) * 0.5 + 0.5;
                    const size = intensity * 8 * (0.5 + pulse * 0.5);
                    
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.beginPath();
                    ctx.arc(x * cellWidth + cellWidth/2, y * cellHeight + cellHeight/2, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    renderWaveMode(ctx, cellWidth, cellHeight, time) {
        ctx.lineWidth = 2;
        
        // Create wave interference patterns
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y][x];
                if (char && char !== ' ') {
                    const intensity = this.getCharacterIntensity(char);
                    const color = this.outputColorBuffer[y][x];
                    const { r, g, b } = this.parseColor(color);
                    
                    // Create ripple effects
                    const centerX = x * cellWidth + cellWidth/2;
                    const centerY = y * cellHeight + cellHeight/2;
                    const maxRadius = intensity * 40 + 10;
                    
                    // Create expanding rings
                    for (let i = 1; i <= 4; i++) {
                        const wavePhase = (time * 60 + i * 15) % 120;
                        const waveRadius = (wavePhase / 120) * maxRadius;
                        const alpha = Math.max(0, 1 - (wavePhase / 120)) * intensity;
                        
                        if (alpha > 0.1 && waveRadius > 2) {
                            ctx.globalAlpha = alpha;
                            ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                    }
                    ctx.globalAlpha = 1.0; // Reset alpha
                }
            }
        }
    }
    
    renderPlasmaMode(ctx, cellWidth, cellHeight, time) {
        // Optimized plasma - render at lower resolution and scale up
        const scale = 4; // Render at 1/4 resolution for speed
        const lowWidth = Math.floor(this.experimentalCanvas.width / scale);
        const lowHeight = Math.floor(this.experimentalCanvas.height / scale);
        
        // Create a smaller canvas for plasma calculation
        const plasmaData = ctx.createImageData(lowWidth, lowHeight);
        const data = plasmaData.data;
        
        for (let y = 0; y < lowHeight; y++) {
            for (let x = 0; x < lowWidth; x++) {
                // Get corresponding ASCII character
                const asciiX = Math.floor((x * scale) / cellWidth);
                const asciiY = Math.floor((y * scale) / cellHeight);
                const char = this.outputBuffer[asciiY] && this.outputBuffer[asciiY][asciiX] || ' ';
                const intensity = char !== ' ' ? this.getCharacterIntensity(char) : 0.1;
                
                // Generate plasma pattern (optimized)
                const plasma1 = Math.sin(x * 0.4 + time * 2);
                const plasma2 = Math.sin(y * 0.2 + time * 1.5);
                const plasma3 = Math.sin((x + y) * 0.3 + time);
                const plasma4 = Math.sin(Math.sqrt(x*x + y*y) * 0.5 + time * 0.8);
                
                const plasma = (plasma1 + plasma2 + plasma3 + plasma4) * 0.25;
                const modulated = plasma * intensity * 2;
                
                const pixelIndex = (y * lowWidth + x) * 4;
                data[pixelIndex] = Math.floor((Math.sin(modulated * Math.PI) + 1) * 127); // Red
                data[pixelIndex + 1] = Math.floor((Math.sin(modulated * Math.PI + 2.1) + 1) * 127); // Green
                data[pixelIndex + 2] = Math.floor((Math.sin(modulated * Math.PI + 4.2) + 1) * 127); // Blue
                data[pixelIndex + 3] = 255; // Alpha
            }
        }
        
        // Draw the low-res plasma to a temporary canvas and scale it up
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = lowWidth;
        tempCanvas.height = lowHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(plasmaData, 0, 0);
        
        // Scale up the plasma to full resolution with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(tempCanvas, 0, 0, lowWidth, lowHeight, 0, 0, this.experimentalCanvas.width, this.experimentalCanvas.height);
    }
    
    render3DMode(ctx, cellWidth, cellHeight, time) {
        const canvas = this.experimentalCanvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Create array to store 3D points with characters
        const points3D = [];
        
        // Process each character and assign Z-depth based on intensity
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.outputBuffer[y] && this.outputBuffer[y][x] || ' ';
                if (char !== ' ') {
                    const intensity = this.getCharacterIntensity(char);
                    
                    // Convert 2D position to 3D coordinates
                    const x3d = (x - this.width / 2) * cellWidth;
                    const y3d = (y - this.height / 2) * cellHeight;
                    const z3d = intensity * 200 + Math.sin(time + x * 0.1 + y * 0.1) * 50; // Z-depth based on character intensity + animation
                    
                    points3D.push({
                        x: x3d,
                        y: y3d,
                        z: z3d,
                        char: char,
                        intensity: intensity,
                        screenX: 0,
                        screenY: 0,
                        visible: true
                    });
                }
            }
        }
        
        // Performance optimization: limit processing for dense grids
        const maxPoints = 300; // Limit total points to maintain performance
        if (points3D.length > maxPoints) {
            // Keep only high-intensity characters for dense scenes
            points3D.sort((a, b) => b.intensity - a.intensity);
            points3D.length = maxPoints;
        }
        
        // Simple 3D projection (perspective)
        const focalLength = 400;
        const cameraZ = 300;
        
        points3D.forEach(point => {
            const distance = cameraZ + point.z;
            if (distance > 0) {
                point.screenX = centerX + (point.x * focalLength) / distance;
                point.screenY = centerY + (point.y * focalLength) / distance;
                point.visible = true;
            } else {
                point.visible = false;
            }
        });
        
        // Sort points by Z-depth (back to front for proper rendering)
        points3D.sort((a, b) => a.z - b.z);
        
        // Optimized line connections: use spatial partitioning for performance
        const maxConnections = 200; // Limit total connections
        let connectionCount = 0;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // Only check every nth point for connections to reduce O(n²) complexity
        const checkEvery = Math.max(1, Math.floor(points3D.length / 50));
        
        for (let i = 0; i < points3D.length && connectionCount < maxConnections; i += checkEvery) {
            const pointA = points3D[i];
            if (!pointA.visible) continue;
            
            // Only check nearby points (limited range)
            const searchRange = Math.min(20, points3D.length - i);
            for (let j = i + 1; j < i + searchRange && connectionCount < maxConnections; j++) {
                const pointB = points3D[j];
                if (!pointB.visible) continue;
                
                // Quick 2D screen distance check before 3D calculation
                const screenDx = pointA.screenX - pointB.screenX;
                const screenDy = pointA.screenY - pointB.screenY;
                const screenDist = screenDx * screenDx + screenDy * screenDy;
                
                if (screenDist < 10000) { // 100px screen distance
                    // Calculate 3D distance only if screen distance is reasonable
                    const dx = pointA.x - pointB.x;
                    const dy = pointA.y - pointB.y;
                    const dz = pointA.z - pointB.z;
                    const distance3D = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    // Only connect points that are close enough
                    if (distance3D < 120) { // Reduced from 150 for better performance
                        const alpha = Math.max(0, 1 - distance3D / 120) * 0.4;
                        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                        
                        ctx.beginPath();
                        ctx.moveTo(pointA.screenX, pointA.screenY);
                        ctx.lineTo(pointB.screenX, pointB.screenY);
                        ctx.stroke();
                        connectionCount++;
                    }
                }
            }
        }
        
        // Draw the character points
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        points3D.forEach(point => {
            if (!point.visible) return;
            
            // Color based on Z-depth and character intensity
            const depthFactor = Math.max(0.2, 1 - (point.z / 400));
            const red = Math.floor(255 * point.intensity * depthFactor);
            const green = Math.floor(128 * depthFactor);
            const blue = Math.floor(255 * depthFactor);
            
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.fillText(point.char, point.screenX, point.screenY);
        });
    }
    
    updateParticles(time) {
        // Update particle physics
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1; // Gravity
            p.vx *= 0.99; // Air resistance
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    parseColor(color) {
        // Enhanced color parsing with fallbacks
        if (!color || color === 7) {
            return { r: 255, g: 255, b: 255 }; // White fallback
        }
        
        if (typeof color === 'number') {
            const colorPair = CLIFT_COLORS.PAIRS[color];
            if (colorPair) {
                const hex = colorPair.fg.replace('#', '');
                return {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16)
                };
            }
        }
        
        return { r: 0, g: 255, b: 0 }; // Green fallback
    }
}