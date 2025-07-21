// CLIFT Web Audio - Enhanced with Beat Detection
// Full-featured audio analysis system

window.CLIFTAudio = {
    context: null,
    analyser: null,
    source: null,
    dataArray: null,
    running: false,
    callback: null,
    
    // Enhanced beat detection with intensity
    beatDetector: {
        threshold: 0.3,
        decay: 0.98,
        minInterval: 60000 / 180, // Max 180 BPM
        lastBeat: 0,
        energy: 0,
        prevEnergy: 0,
        energyHistory: [],
        historyLength: 43, // ~1 second at 43fps
        beatCallbacks: [],
        beatIntensity: 0,
        adaptiveThreshold: true,
        varianceThreshold: 0.1,
        confidenceLevel: 0.0
    },
    
    // Enhanced frequency bands (5 bands for better analysis)
    bands: {
        bass: { min: 20, max: 250, binStart: 0, binEnd: 6 },
        lowMid: { min: 250, max: 500, binStart: 6, binEnd: 12 },
        mid: { min: 500, max: 2000, binStart: 12, binEnd: 32 },
        highMid: { min: 2000, max: 4000, binStart: 32, binEnd: 48 },
        treble: { min: 4000, max: 20000, binStart: 48, binEnd: 64 }
    },
    
    // Audio processing parameters
    processing: {
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        inputGain: 1.0,
        bassBoost: 2.0,
        midBoost: 1.0,
        trebleBoost: 1.0
    },
    
    // Advanced real-time tracking systems
    featureTracker: {
        // Short-term memory (last 2 seconds ~86 frames at 43fps)
        shortMemory: {
            size: 86,
            spectralCentroid: [],
            energy: [],
            attacks: [],
            beats: [],
            harmonicRatio: [],
            spectralFlux: [],
            spectralRolloff: []
        },
        
        // Medium-term memory (last 8 seconds ~344 frames)
        mediumMemory: {
            size: 344,
            phrases: [], // Musical phrase boundaries
            dynamics: [], // Overall dynamic level changes
            tonalStability: [], // How tonal vs noise-like
            rhythmicComplexity: [] // Variation in rhythm
        },
        
        // Long-term memory (last 30 seconds ~1290 frames)
        longMemory: {
            size: 1290,
            structuralChanges: [], // Major section changes
            tempoVariations: [], // BPM changes over time
            spectralEvolution: [] // How the frequency content evolves
        },
        
        // Real-time pattern detection
        patterns: {
            currentPhrase: { start: 0, energy: 0, character: 'unknown' },
            buildupDetected: false,
            dropDetected: false,
            breakdownDetected: false,
            climaxIntensity: 0,
            grooveStrength: 0,
            microTiming: { ahead: 0, behind: 0, locked: 0 }
        },
        
        // Adaptive thresholds that learn from the music
        adaptiveThresholds: {
            attackThreshold: 0.3,
            energyThreshold: 0.5,
            spectralChangeThreshold: 0.2,
            buildupThreshold: 0.7,
            dropThreshold: 0.9
        }
    },
    
    start: async function(callback) {
        console.log('CLIFTAudio.start() called - Browser:', navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other');
        this.callback = callback;
        
        try {
            console.log('Creating audio context...');
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext state:', this.context.state);
            
            // Resume audio context if suspended (required by modern browsers)
            if (this.context.state === 'suspended') {
                console.log('AudioContext is suspended, attempting to resume...');
                await this.context.resume();
                console.log('AudioContext resume result, new state:', this.context.state);
            }
            
            console.log('Requesting microphone access...');
            console.log('navigator.mediaDevices:', navigator.mediaDevices);
            console.log('navigator.mediaDevices.getUserMedia:', navigator.mediaDevices?.getUserMedia);
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }
            
            // Chrome-specific: Check permissions API
            if (navigator.permissions) {
                try {
                    const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                    console.log('Microphone permission status:', permissionStatus.state);
                    
                    if (permissionStatus.state === 'denied') {
                        throw new Error('Microphone permission denied. Please enable microphone access in browser settings.');
                    }
                } catch (permError) {
                    console.log('Could not check permissions:', permError);
                }
            }
            
            // Chrome-specific: Ensure we're in a secure context
            const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg');
            if (isChrome && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                console.warn('Chrome requires HTTPS for microphone access (except localhost)');
                throw new Error('Chrome requires HTTPS for microphone access. Please use https:// or localhost');
            }
            
            // Request microphone access with Chrome-friendly options
            console.log('About to call getUserMedia...');
            const constraints = { 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                } 
            };
            console.log('getUserMedia constraints:', constraints);
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Microphone access granted! Stream:', stream);
            console.log('Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
            
            // Create audio nodes
            this.source = this.context.createMediaStreamSource(stream);
            this.analyser = this.context.createAnalyser();
            
            // Configure analyser with enhanced settings
            this.analyser.fftSize = this.processing.fftSize;
            this.analyser.smoothingTimeConstant = this.processing.smoothingTimeConstant;
            
            // Create gain node for input control
            this.gainNode = this.context.createGain();
            this.gainNode.gain.value = this.processing.inputGain;
            
            // Connect nodes with gain control
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            
            console.log('Audio gain node initialized with value:', this.gainNode.gain.value);
            
            // Create data arrays
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.frequencyData = new Float32Array(bufferLength);
            
            // Start analysis
            this.running = true;
            this.analyze();
            
            console.log('Audio input started with beat detection');
            
        } catch (err) {
            console.warn('Microphone not available, using test signal. Reason:', err.message);
            
            // Fallback to test signal
            this.startTestSignal(callback);
        }
    },
    
    startTestSignal: function(callback) {
        // Generate test audio data with beat
        this.running = true;
        const testData = new Float32Array(64);
        let beatPhase = 0;
        
        const animate = () => {
            if (!this.running) return;
            
            const time = Date.now() * 0.001;
            beatPhase += 0.016; // ~60fps
            
            // Simulate 120 BPM beat
            const beatTime = (time * 2) % 1; // 2 beats per second
            const kick = beatTime < 0.1 ? 1 : 0;
            
            // Simulate bass with kick drum
            for (let i = 0; i < 10; i++) {
                testData[i] = kick * 0.8 + Math.sin(time * 2 + i * 0.1) * 0.2;
            }
            
            // Simulate mids
            for (let i = 10; i < 40; i++) {
                testData[i] = (Math.sin(time * 5 + i * 0.2) + 1) * 0.3;
            }
            
            // Simulate highs
            for (let i = 40; i < 64; i++) {
                testData[i] = Math.random() * 0.2 * (Math.sin(time * 3) + 1) * 0.5;
            }
            
            // Detect beat in test signal
            if (kick > 0.5 && Date.now() - this.beatDetector.lastBeat > this.beatDetector.minInterval) {
                this.beatDetector.lastBeat = Date.now();
                this.onBeat();
            }
            
            if (callback) callback(testData);
            
            requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    analyze: function() {
        if (!this.running) return;
        
        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getFloatFrequencyData(this.frequencyData);
        
        // Convert to normalized float array (0-1)
        const normalized = new Float32Array(64);
        const step = Math.floor(this.dataArray.length / 64);
        
        for (let i = 0; i < 64; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
                sum += this.dataArray[i * step + j];
            }
            normalized[i] = (sum / step) / 255;
        }
        
        // Apply logarithmic scaling for better visualization
        for (let i = 0; i < 64; i++) {
            normalized[i] = Math.pow(normalized[i], 0.8);
        }
        
        // Beat detection
        this.detectBeat();
        
        // Calculate enhanced frequency band levels
        const bandLevels = this.calculateBandLevels();
        
        // Calculate advanced audio features
        const advancedFeatures = this.calculateAdvancedFeatures(normalized, bandLevels);
        
        // Update feature tracking and pattern detection
        const hyperReactiveFeatures = this.updateFeatureTracking(advancedFeatures, bandLevels);
        
        // Create comprehensive audio data structure with hyper-reactive features
        const audioData = {
            spectrum: normalized,
            bands: bandLevels,
            beat: {
                detected: Date.now() - this.beatDetector.lastBeat < 100,
                intensity: this.beatDetector.beatIntensity,
                confidence: this.beatDetector.confidenceLevel
            },
            volume: bandLevels.overall,
            energy: this.beatDetector.energy,
            bpm: this.estimateBPM(),
            // Enhanced features for advanced audio reactivity
            advanced: advancedFeatures,
            // Hyper-reactive features with memory and pattern detection
            hyperReactive: hyperReactiveFeatures
        };
        
        // Call callback with enhanced data
        if (this.callback) {
            this.callback(audioData);
        }
        
        // Store current audio data for external access
        this.currentAudioData = audioData;
        
        // Schedule next frame
        requestAnimationFrame(() => this.analyze());
    },
    
    // Get current audio data for external use (e.g., node editor)
    getAudioData: function() {
        if (!this.currentAudioData) return null;
        return this.currentAudioData.spectrum;
    },
    
    // Initialize audio system (must be called after user interaction)
    initAudio: function() {
        if (this.initialized) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.source = this.audioContext.createMediaStreamSource(stream);
                    this.analyser = this.audioContext.createAnalyser();
                    
                    this.analyser.fftSize = 256;
                    this.analyser.smoothingTimeConstant = 0.8;
                    
                    this.source.connect(this.analyser);
                    
                    this.bufferLength = this.analyser.frequencyBinCount;
                    this.dataArray = new Uint8Array(this.bufferLength);
                    this.frequencyData = new Float32Array(this.bufferLength);
                    
                    this.initialized = true;
                    console.log('Audio system initialized with microphone');
                    resolve();
                })
                .catch(error => {
                    console.warn('Microphone access denied, using test signal:', error);
                    this.useTestSignal = true;
                    this.initialized = true;
                    resolve(); // Still resolve so the system can use test signal
                });
        });
    },
    
    detectBeat: function() {
        // Calculate current energy using configured bass range
        let currentEnergy = 0;
        const bassRange = this.bands.bass;
        
        for (let i = bassRange.binStart; i < bassRange.binEnd; i++) {
            currentEnergy += this.dataArray[i] / 255;
        }
        currentEnergy /= (bassRange.binEnd - bassRange.binStart);
        
        // Store previous energy for intensity calculation
        this.beatDetector.prevEnergy = this.beatDetector.energy;
        
        // Update energy history
        this.beatDetector.energyHistory.push(currentEnergy);
        if (this.beatDetector.energyHistory.length > this.beatDetector.historyLength) {
            this.beatDetector.energyHistory.shift();
        }
        
        // Calculate average energy and variance
        const avgEnergy = this.beatDetector.energyHistory.reduce((a, b) => a + b, 0) / 
                         this.beatDetector.energyHistory.length;
        
        // Calculate variance for adaptive threshold
        const variance = this.beatDetector.energyHistory.reduce((sum, val) => 
            sum + Math.pow(val - avgEnergy, 2), 0) / this.beatDetector.energyHistory.length;
        
        // Adaptive threshold adjustment
        let dynamicThreshold = this.beatDetector.threshold;
        if (this.beatDetector.adaptiveThreshold) {
            // Adjust threshold based on variance - higher variance = lower threshold
            dynamicThreshold *= (1 - Math.min(variance, 0.2));
            dynamicThreshold = Math.max(0.1, Math.min(0.8, dynamicThreshold));
        }
        
        // Beat detection with enhanced criteria
        const energyThreshold = avgEnergy * (1 + dynamicThreshold);
        const currentTime = Date.now();
        
        // Calculate beat intensity (energy difference)
        const energyDiff = currentEnergy - this.beatDetector.prevEnergy;
        const intensityFactor = Math.max(0, energyDiff / avgEnergy);
        
        if (currentEnergy > energyThreshold && 
            currentEnergy > this.beatDetector.energy &&
            currentTime - this.beatDetector.lastBeat > this.beatDetector.minInterval &&
            intensityFactor > 0.1) { // Additional intensity requirement
            
            // Beat detected - calculate intensity
            this.beatDetector.beatIntensity = Math.min(1.0, intensityFactor * 2);
            
            // Calculate confidence level based on how much the beat exceeds threshold
            const confidenceFactor = (currentEnergy - energyThreshold) / energyThreshold;
            this.beatDetector.confidenceLevel = Math.min(1.0, confidenceFactor);
            
            this.beatDetector.lastBeat = currentTime;
            this.onBeat();
        } else {
            // Decay beat intensity
            this.beatDetector.beatIntensity *= 0.9;
        }
        
        // Update energy
        this.beatDetector.energy = currentEnergy;
    },
    
    onBeat: function() {
        // Trigger beat callbacks
        this.beatDetector.beatCallbacks.forEach(callback => callback());
        
        // Visual feedback can be added here
        if (window.clift) {
            // Flash effect or trigger scene changes
        }
    },
    
    addBeatListener: function(callback) {
        this.beatDetector.beatCallbacks.push(callback);
    },
    
    removeBeatListener: function(callback) {
        const index = this.beatDetector.beatCallbacks.indexOf(callback);
        if (index > -1) {
            this.beatDetector.beatCallbacks.splice(index, 1);
        }
    },
    
    stop: function() {
        this.running = false;
        
        try {
            if (this.source) {
                this.source.disconnect();
                this.source = null;
            }
            
            if (this.gainNode) {
                this.gainNode.disconnect();
                this.gainNode = null;
            }
            
            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }
            
            if (this.context && this.context.state !== 'closed') {
                this.context.close();
                this.context = null;
            }
            
            // Clear data arrays
            this.dataArray = null;
            this.frequencyData = null;
            this.currentAudioData = null;
            
            console.log('Audio input stopped');
        } catch (err) {
            console.error('Error stopping audio system:', err);
        }
    },
    
    // Get audio levels for specific frequency ranges
    getLevels: function() {
        if (!this.dataArray) {
            return { bass: 0, mid: 0, treble: 0, volume: 0 };
        }
        
        let bass = 0, mid = 0, treble = 0, volume = 0;
        
        // Calculate frequency band averages
        const bassEnd = Math.floor(this.dataArray.length * 0.1);
        const midEnd = Math.floor(this.dataArray.length * 0.5);
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = this.dataArray[i] / 255;
            volume += value;
            
            if (i < bassEnd) {
                bass += value;
            } else if (i < midEnd) {
                mid += value;
            } else {
                treble += value;
            }
        }
        
        return {
            bass: bass / bassEnd,
            mid: mid / (midEnd - bassEnd),
            treble: treble / (this.dataArray.length - midEnd),
            volume: volume / this.dataArray.length
        };
    },
    
    // Calculate enhanced frequency band levels (5 bands)
    calculateBandLevels: function() {
        if (!this.dataArray) {
            return {
                bass: 0,
                lowMid: 0,
                mid: 0,
                highMid: 0,
                treble: 0,
                overall: 0
            };
        }
        
        const bands = this.bands;
        const levels = {
            bass: 0,
            lowMid: 0,
            mid: 0,
            highMid: 0,
            treble: 0,
            overall: 0
        };
        
        // Calculate each band's average level
        for (const [bandName, range] of Object.entries(bands)) {
            let sum = 0;
            let count = 0;
            
            for (let i = range.binStart; i < range.binEnd && i < this.dataArray.length; i++) {
                sum += this.dataArray[i] / 255;
                count++;
            }
            
            if (count > 0) {
                levels[bandName] = sum / count;
            }
        }
        
        // Calculate overall volume
        let totalSum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            totalSum += this.dataArray[i] / 255;
        }
        levels.overall = totalSum / this.dataArray.length;
        
        // Apply frequency-specific boosts matching original CLIFT
        levels.bass *= this.processing.bassBoost;
        levels.mid *= this.processing.midBoost;
        levels.treble *= this.processing.trebleBoost;
        
        // Clamp to 0-1 range
        for (const key in levels) {
            levels[key] = Math.min(1.0, Math.max(0.0, levels[key]));
        }
        
        return levels;
    },
    
    // Update feature tracking with memory and pattern detection
    updateFeatureTracking: function(features, bands) {
        const tracker = this.featureTracker;
        const currentTime = Date.now();
        
        // Update short-term memory
        const shortMem = tracker.shortMemory;
        this.addToMemory(shortMem.spectralCentroid, features.spectralCentroid, shortMem.size);
        this.addToMemory(shortMem.energy, this.beatDetector.energy, shortMem.size);
        this.addToMemory(shortMem.attacks, features.attack, shortMem.size);
        this.addToMemory(shortMem.beats, Date.now() - this.beatDetector.lastBeat < 100 ? 1 : 0, shortMem.size);
        this.addToMemory(shortMem.harmonicRatio, features.harmonicContent, shortMem.size);
        this.addToMemory(shortMem.spectralFlux, features.spectralFlux, shortMem.size);
        this.addToMemory(shortMem.spectralRolloff, features.spectralRolloff, shortMem.size);
        
        // Calculate hyper-reactive features
        const hyperFeatures = {
            // Momentum and acceleration
            energyMomentum: this.calculateMomentum(shortMem.energy),
            centroidAcceleration: this.calculateAcceleration(shortMem.spectralCentroid),
            attackVelocity: this.calculateVelocity(shortMem.attacks),
            
            // Pattern detection
            beatConsistency: this.calculateBeatConsistency(shortMem.beats),
            rhythmicComplexity: this.calculateRhythmicComplexity(shortMem.beats),
            harmonicStability: this.calculateStability(shortMem.harmonicRatio),
            spectralStability: this.calculateStability(shortMem.spectralCentroid),
            
            // Musical structure detection
            buildupIntensity: this.detectBuildup(shortMem.energy),
            dropIntensity: this.detectDrop(shortMem.energy),
            breakdownDetected: this.detectBreakdown(bands),
            climaxProbability: this.detectClimax(shortMem.energy, shortMem.spectralFlux),
            
            // Micro-timing and groove
            grooveStrength: this.calculateGrooveStrength(shortMem.beats, shortMem.energy),
            microTiming: this.analyzeMicroTiming(shortMem.beats),
            swingRatio: this.calculateSwingRatio(shortMem.beats),
            
            // Adaptive learning
            surpriseLevel: this.calculateSurprise(features, bands),
            complexityIndex: this.calculateComplexityIndex(shortMem),
            emotionalIntensity: this.calculateEmotionalIntensity(bands, features),
            
            // Multi-scale correlations
            shortTermTrend: this.calculateTrend(shortMem.energy),
            spectralEvolution: this.calculateSpectralEvolution(shortMem.spectralCentroid, shortMem.spectralRolloff),
            dynamicRange: this.calculateDynamicRange(shortMem.energy),
            
            // Advanced onset detection
            onsetStrength: this.calculateOnsetStrength(features),
            onsetType: this.classifyOnsetType(features, bands),
            transientSharpness: this.calculateTransientSharpness(shortMem.spectralFlux, shortMem.attacks)
        };
        
        // Update adaptive thresholds based on current content
        this.updateAdaptiveThresholds(hyperFeatures, bands);
        
        return hyperFeatures;
    },
    
    // Helper functions for advanced analysis
    addToMemory: function(array, value, maxSize) {
        array.push(value);
        if (array.length > maxSize) {
            array.shift();
        }
    },
    
    calculateMomentum: function(values) {
        if (values.length < 3) return 0;
        const recent = values.slice(-10); // Last 10 frames
        let momentum = 0;
        for (let i = 1; i < recent.length; i++) {
            momentum += recent[i] - recent[i-1];
        }
        return momentum / (recent.length - 1);
    },
    
    calculateAcceleration: function(values) {
        if (values.length < 4) return 0;
        const recent = values.slice(-5);
        let acceleration = 0;
        for (let i = 2; i < recent.length; i++) {
            const velocity1 = recent[i-1] - recent[i-2];
            const velocity2 = recent[i] - recent[i-1];
            acceleration += velocity2 - velocity1;
        }
        return acceleration / Math.max(1, recent.length - 2);
    },
    
    calculateVelocity: function(values) {
        if (values.length < 2) return 0;
        const recent = values.slice(-5);
        let velocity = 0;
        for (let i = 1; i < recent.length; i++) {
            velocity += Math.abs(recent[i] - recent[i-1]);
        }
        return velocity / Math.max(1, recent.length - 1);
    },
    
    calculateBeatConsistency: function(beats) {
        if (beats.length < 8) return 0.5;
        const beatTimes = [];
        for (let i = 0; i < beats.length; i++) {
            if (beats[i] > 0.5) beatTimes.push(i);
        }
        
        if (beatTimes.length < 3) return 0;
        
        const intervals = [];
        for (let i = 1; i < beatTimes.length; i++) {
            intervals.push(beatTimes[i] - beatTimes[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        return Math.max(0, 1 - (variance / avgInterval));
    },
    
    calculateRhythmicComplexity: function(beats) {
        if (beats.length < 16) return 0;
        // Analyze rhythmic patterns using autocorrelation
        const maxLag = Math.min(32, Math.floor(beats.length / 2));
        let maxCorrelation = 0;
        
        for (let lag = 1; lag < maxLag; lag++) {
            let correlation = 0;
            for (let i = 0; i < beats.length - lag; i++) {
                correlation += beats[i] * beats[i + lag];
            }
            correlation /= (beats.length - lag);
            maxCorrelation = Math.max(maxCorrelation, correlation);
        }
        
        return 1 - maxCorrelation; // Higher complexity = lower autocorrelation
    },
    
    calculateStability: function(values) {
        if (values.length < 5) return 0.5;
        const recent = values.slice(-20);
        const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
        const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
        return Math.max(0, 1 - variance * 10); // Scale variance to 0-1
    },
    
    detectBuildup: function(energyHistory) {
        if (energyHistory.length < 30) return 0;
        const recentEnergy = energyHistory.slice(-30);
        const slope = this.calculateTrend(recentEnergy);
        const acceleration = this.calculateAcceleration(recentEnergy);
        
        // Buildup = positive slope + positive acceleration
        const buildupStrength = Math.max(0, slope * 2 + acceleration);
        return Math.min(1, buildupStrength);
    },
    
    detectDrop: function(energyHistory) {
        if (energyHistory.length < 10) return 0;
        const recentEnergy = energyHistory.slice(-10);
        const veryRecentEnergy = energyHistory.slice(-3);
        
        const recentAvg = recentEnergy.reduce((a, b) => a + b, 0) / recentEnergy.length;
        const currentAvg = veryRecentEnergy.reduce((a, b) => a + b, 0) / veryRecentEnergy.length;
        
        const dropIntensity = Math.max(0, recentAvg - currentAvg);
        return Math.min(1, dropIntensity * 3);
    },
    
    detectBreakdown: function(bands) {
        // Breakdown = sudden reduction in harmonic content + bass emphasis
        const bassRatio = bands.bass / Math.max(0.001, bands.overall);
        const harmonicReduction = 1 - (bands.mid + bands.highMid + bands.treble) / 3;
        
        return Math.min(1, (bassRatio * 2 + harmonicReduction) / 3);
    },
    
    detectClimax: function(energyHistory, fluxHistory) {
        if (energyHistory.length < 10 || fluxHistory.length < 10) return 0;
        
        const currentEnergy = energyHistory[energyHistory.length - 1];
        const currentFlux = fluxHistory[fluxHistory.length - 1];
        const maxEnergy = Math.max(...energyHistory.slice(-60)); // Last ~1.5 seconds
        const maxFlux = Math.max(...fluxHistory.slice(-60));
        
        const energyClimax = currentEnergy / Math.max(0.001, maxEnergy);
        const fluxClimax = currentFlux / Math.max(0.001, maxFlux);
        
        return Math.min(1, (energyClimax + fluxClimax) / 2);
    },
    
    calculateGrooveStrength: function(beats, energy) {
        // Groove = consistent rhythm + energy variation on beats
        const beatConsistency = this.calculateBeatConsistency(beats);
        const energyOnBeats = this.calculateEnergyOnBeats(beats, energy);
        
        return (beatConsistency + energyOnBeats) / 2;
    },
    
    calculateEnergyOnBeats: function(beats, energy) {
        if (beats.length !== energy.length || beats.length < 8) return 0;
        
        let beatEnergy = 0;
        let offBeatEnergy = 0;
        let beatCount = 0;
        let offBeatCount = 0;
        
        for (let i = 0; i < beats.length; i++) {
            if (beats[i] > 0.5) {
                beatEnergy += energy[i];
                beatCount++;
            } else {
                offBeatEnergy += energy[i];
                offBeatCount++;
            }
        }
        
        const avgBeatEnergy = beatCount > 0 ? beatEnergy / beatCount : 0;
        const avgOffBeatEnergy = offBeatCount > 0 ? offBeatEnergy / offBeatCount : 0;
        
        return avgBeatEnergy / Math.max(0.001, avgBeatEnergy + avgOffBeatEnergy);
    },
    
    analyzeMicroTiming: function(beats) {
        // Simplified micro-timing analysis
        return { ahead: 0.1, behind: 0.1, locked: 0.8 }; // Placeholder
    },
    
    calculateSwingRatio: function(beats) {
        // Simplified swing analysis
        return 0.5; // Placeholder - would need more sophisticated timing analysis
    },
    
    calculateSurprise: function(features, bands) {
        // How different is current frame from recent average?
        const tracker = this.featureTracker.shortMemory;
        if (tracker.energy.length < 10) return 0;
        
        const recentAvgEnergy = tracker.energy.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const recentAvgCentroid = tracker.spectralCentroid.slice(-10).reduce((a, b) => a + b, 0) / 10;
        
        const energySurprise = Math.abs(this.beatDetector.energy - recentAvgEnergy);
        const centroidSurprise = Math.abs(features.spectralCentroid - recentAvgCentroid);
        
        return Math.min(1, (energySurprise + centroidSurprise) / 2);
    },
    
    calculateComplexityIndex: function(shortMem) {
        if (shortMem.energy.length < 20) return 0.5;
        
        // Combine multiple complexity measures
        const energyComplexity = this.calculateVariance(shortMem.energy.slice(-20));
        const centroidComplexity = this.calculateVariance(shortMem.spectralCentroid.slice(-20));
        const fluxComplexity = this.calculateVariance(shortMem.spectralFlux.slice(-20));
        
        return Math.min(1, (energyComplexity + centroidComplexity + fluxComplexity) / 3);
    },
    
    calculateVariance: function(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    },
    
    calculateEmotionalIntensity: function(bands, features) {
        // Emotional intensity based on energy + harmonic richness + attack
        const energyComponent = bands.overall;
        const harmonicComponent = features.harmonicContent;
        const attackComponent = features.attack;
        const brightnessComponent = features.spectralCentroid;
        
        return Math.min(1, (energyComponent * 0.4 + harmonicComponent * 0.3 + attackComponent * 0.2 + brightnessComponent * 0.1));
    },
    
    calculateTrend: function(values) {
        if (values.length < 3) return 0;
        const recent = values.slice(-15);
        
        // Linear regression slope
        const n = recent.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = recent.reduce((a, b) => a + b, 0);
        const sumXY = recent.reduce((sum, y, x) => sum + x * y, 0);
        const sumX2 = recent.reduce((sum, y, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    },
    
    calculateSpectralEvolution: function(centroidHistory, rolloffHistory) {
        if (centroidHistory.length < 10) return 0;
        
        const centroidTrend = this.calculateTrend(centroidHistory.slice(-10));
        const rolloffTrend = this.calculateTrend(rolloffHistory.slice(-10));
        
        return (Math.abs(centroidTrend) + Math.abs(rolloffTrend)) / 2;
    },
    
    calculateDynamicRange: function(energyHistory) {
        if (energyHistory.length < 5) return 0;
        const recent = energyHistory.slice(-30);
        const max = Math.max(...recent);
        const min = Math.min(...recent);
        return max - min;
    },
    
    calculateOnsetStrength: function(features) {
        // Combine multiple onset indicators
        const spectralFluxOnset = features.spectralFlux > 0.3 ? features.spectralFlux : 0;
        const attackOnset = features.attack > 0.2 ? features.attack : 0;
        const energyOnset = this.beatDetector.energy > this.beatDetector.prevEnergy ? 
                           (this.beatDetector.energy - this.beatDetector.prevEnergy) : 0;
        
        return Math.min(1, (spectralFluxOnset + attackOnset + energyOnset) / 3);
    },
    
    classifyOnsetType: function(features, bands) {
        // Classify the type of musical onset
        if (bands.bass > 0.7 && features.percussiveContent > 0.6) {
            return 'percussive'; // Drum hits, bass drops
        } else if (features.harmonicContent > 0.6 && features.attack > 0.3) {
            return 'harmonic'; // Chord changes, melodic entrances
        } else if (features.spectralFlux > 0.5) {
            return 'spectral'; // Timbral changes, filter sweeps
        } else if (bands.treble > 0.6) {
            return 'high-frequency'; // Cymbal crashes, hi-hats
        } else {
            return 'unknown';
        }
    },
    
    calculateTransientSharpness: function(fluxHistory, attackHistory) {
        if (fluxHistory.length < 3 || attackHistory.length < 3) return 0;
        
        const fluxSharpness = this.calculateVelocity(fluxHistory.slice(-5));
        const attackSharpness = this.calculateVelocity(attackHistory.slice(-5));
        
        return Math.min(1, (fluxSharpness + attackSharpness) / 2);
    },
    
    updateAdaptiveThresholds: function(hyperFeatures, bands) {
        // Slowly adapt thresholds based on music characteristics
        const adapt = this.featureTracker.adaptiveThresholds;
        const learningRate = 0.001; // Very slow adaptation
        
        // Adapt attack threshold based on music dynamics
        const targetAttackThreshold = 0.2 + (hyperFeatures.complexityIndex * 0.3);
        adapt.attackThreshold += (targetAttackThreshold - adapt.attackThreshold) * learningRate;
        
        // Adapt energy threshold based on overall loudness
        const targetEnergyThreshold = 0.3 + (bands.overall * 0.4);
        adapt.energyThreshold += (targetEnergyThreshold - adapt.energyThreshold) * learningRate;
        
        // Clamp thresholds to reasonable ranges
        adapt.attackThreshold = Math.max(0.1, Math.min(0.8, adapt.attackThreshold));
        adapt.energyThreshold = Math.max(0.2, Math.min(0.9, adapt.energyThreshold));
    },

    // Calculate advanced audio features for enhanced scene reactivity
    calculateAdvancedFeatures: function(spectrum, bands) {
        // Spectral centroid (brightness)
        let spectralCentroid = 0;
        let spectralMagnitude = 0;
        for (let i = 0; i < spectrum.length; i++) {
            spectralCentroid += i * spectrum[i];
            spectralMagnitude += spectrum[i];
        }
        spectralCentroid = spectralMagnitude > 0 ? spectralCentroid / spectralMagnitude : 0;
        
        // Spectral rolloff (frequency below which 85% of energy lies)
        let cumulativeEnergy = 0;
        let totalEnergy = spectrum.reduce((sum, val) => sum + val, 0);
        let rolloffBin = 0;
        for (let i = 0; i < spectrum.length; i++) {
            cumulativeEnergy += spectrum[i];
            if (cumulativeEnergy >= totalEnergy * 0.85) {
                rolloffBin = i;
                break;
            }
        }
        
        // Zero crossing rate approximation (roughness/texture)
        let zeroCrossings = 0;
        for (let i = 1; i < spectrum.length; i++) {
            if ((spectrum[i] > 0.1) !== (spectrum[i-1] > 0.1)) {
                zeroCrossings++;
            }
        }
        
        // Dynamic range (difference between max and min)
        const maxLevel = Math.max(...spectrum);
        const minLevel = Math.min(...spectrum);
        const dynamicRange = maxLevel - minLevel;
        
        // Attack detection (rapid energy increase)
        const currentEnergy = this.beatDetector.energy;
        const prevEnergy = this.beatDetector.prevEnergy;
        const attack = Math.max(0, currentEnergy - prevEnergy);
        
        // Harmonic/percussive separation approximation
        let harmonicContent = 0;
        let percussiveContent = 0;
        
        // Low frequencies tend to be more percussive
        percussiveContent = (bands.bass + bands.lowMid) / 2;
        // Mid-high frequencies tend to be more harmonic
        harmonicContent = (bands.mid + bands.highMid + bands.treble) / 3;
        
        // Spectral flux (rate of change in spectrum)
        let spectralFlux = 0;
        if (this.prevSpectrum) {
            for (let i = 0; i < spectrum.length; i++) {
                spectralFlux += Math.abs(spectrum[i] - this.prevSpectrum[i]);
            }
            spectralFlux /= spectrum.length;
        }
        this.prevSpectrum = [...spectrum];
        
        // Tonal vs noise content
        // Calculate spectral flatness (measure of how noise-like a signal is)
        let geometricMean = 1;
        let arithmeticMean = 0;
        for (let i = 0; i < spectrum.length; i++) {
            const val = Math.max(0.001, spectrum[i]); // Avoid log(0)
            geometricMean *= Math.pow(val, 1/spectrum.length);
            arithmeticMean += val;
        }
        arithmeticMean /= spectrum.length;
        const spectralFlatness = geometricMean / arithmeticMean;
        
        return {
            spectralCentroid: spectralCentroid / spectrum.length, // Normalized 0-1
            spectralRolloff: rolloffBin / spectrum.length,        // Normalized 0-1
            zeroCrossingRate: zeroCrossings / spectrum.length,    // Normalized 0-1
            dynamicRange: dynamicRange,                           // 0-1 range
            attack: attack,                                       // Energy attack
            harmonicContent: harmonicContent,                     // 0-1 harmonic energy
            percussiveContent: percussiveContent,                 // 0-1 percussive energy
            spectralFlux: spectralFlux,                          // Rate of spectral change
            spectralFlatness: spectralFlatness,                  // Noise vs tonal (0-1)
            brightness: spectralCentroid / spectrum.length,       // Alias for centroid
            roughness: zeroCrossings / spectrum.length,          // Alias for ZCR
            tonality: 1 - spectralFlatness                       // Inverse of flatness
        };
    },

    // Enhanced BPM estimation with beat history
    estimateBPM: function() {
        if (this.beatDetector.energyHistory.length < 10) {
            return 120; // Default BPM
        }
        
        // Find peaks in energy history to estimate tempo
        const peaks = [];
        const history = this.beatDetector.energyHistory;
        const threshold = 0.6; // Minimum relative peak height
        
        for (let i = 2; i < history.length - 2; i++) {
            const current = history[i];
            const avg = (history[i-2] + history[i-1] + history[i+1] + history[i+2]) / 4;
            
            if (current > avg * (1 + threshold)) {
                peaks.push(i);
            }
        }
        
        if (peaks.length < 2) {
            return 120;
        }
        
        // Calculate intervals between peaks
        const intervals = [];
        for (let i = 1; i < peaks.length && i < 8; i++) {
            const interval = peaks[i] - peaks[i-1];
            if (interval > 0) {
                intervals.push(interval);
            }
        }
        
        if (intervals.length === 0) {
            return 120;
        }
        
        // Convert frame intervals to BPM (assuming ~43fps)
        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        const framesPerSecond = 43; // Approximate frame rate
        const beatsPerSecond = framesPerSecond / avgInterval;
        const bpm = Math.round(beatsPerSecond * 60);
        
        // Clamp to reasonable BPM range
        return Math.max(60, Math.min(200, bpm));
    },

    // Get BPM estimation (legacy method for compatibility)
    getBPM: function() {
        return this.estimateBPM();
    },
    
    // Set audio input gain
    setGain: function(gainValue) {
        console.log('Setting audio gain to:', gainValue);
        this.processing.inputGain = gainValue;
        
        // Update gain node if it exists
        if (this.gainNode && this.gainNode.gain) {
            this.gainNode.gain.value = gainValue;
            console.log('Gain node updated to:', this.gainNode.gain.value);
        }
    },
    
    // Get current gain value
    getGain: function() {
        return this.processing.inputGain;
    }
};

// Enhanced spectrum visualizer
window.CLIFTAudio.drawSpectrum = function(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw spectrum bars
    const barWidth = width / data.length;
    
    for (let i = 0; i < data.length; i++) {
        const barHeight = data[i] * height;
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Gradient based on frequency and intensity
        const hue = (i / data.length) * 120; // Green to yellow
        const saturation = 50 + data[i] * 50;
        const lightness = 30 + data[i] * 40;
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Draw bar with rounded top
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        
        // Add glow effect for high values
        if (data[i] > 0.7) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(x, y, barWidth - 1, 2);
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw beat indicator
    if (Date.now() - this.beatDetector.lastBeat < 100) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, width, 5);
    }
    
    // Draw enhanced level indicators
    const levels = this.calculateBandLevels();
    ctx.font = '10px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Bass:${(levels.bass * 100).toFixed(0)}%`, 5, 15);
    ctx.fillText(`LMid:${(levels.lowMid * 100).toFixed(0)}%`, 5, 30);
    ctx.fillText(`Mid:${(levels.mid * 100).toFixed(0)}%`, 5, 45);
    ctx.fillText(`HMid:${(levels.highMid * 100).toFixed(0)}%`, 5, 60);
    ctx.fillText(`Treb:${(levels.treble * 100).toFixed(0)}%`, 5, 75);
    ctx.fillText(`BPM:${this.estimateBPM()}`, 5, 90);
    ctx.fillText(`Beat:${this.beatDetector.beatIntensity.toFixed(2)}`, 5, 105);
};