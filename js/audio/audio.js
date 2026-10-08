// CLIFT audio input + analysis.
//
// Sources:
//   demo - synthetic kick/snare/hats locked to the BPM clock (no permissions needed)
//   mic  - any audio input device via getUserMedia
//   file - an audio file played in the page (works offline from file://)
//
// Every source fills the same 1024-bin byte spectrum, so band levels, beat
// detection and the advanced features behave the same whatever the input.
// The engine calls update() once per frame; there is no separate audio loop.

(function () {
    const FFT_SIZE = 2048;
    const BIN_COUNT = FFT_SIZE / 2;
    const SPECTRUM_BANDS = 64;
    const MAX_LEVEL = 0.999;

    const BAND_HZ = {
        bass: [20, 250],
        lowMid: [250, 500],
        mid: [500, 2000],
        highMid: [2000, 4000],
        treble: [4000, 16000]
    };

    const audio = {
        source: 'demo',
        gain: 1.0,
        sampleRate: 44100,
        context: null,
        analyser: null,
        gainNode: null,
        sourceNode: null,
        stream: null,
        mediaEl: null,
        fileName: '',
        deviceId: '',

        bins: new Uint8Array(BIN_COUNT),
        spectrum: new Float32Array(SPECTRUM_BANDS),
        bandBins: null,
        spectrumBins: null,

        beatDetector: {
            threshold: 0.3,
            minInterval: 60000 / 190,
            lastBeat: 0,
            energy: 0,
            prevEnergy: 0,
            energyHistory: [],
            historyLength: 43,
            beatIntensity: 0,
            confidenceLevel: 0,
            detected: false
        },
        beatTimes: [],
        detectedBPM: 0,

        frame: null,

        // Auto-level: scale each spectrum bin / band by its own slowly decaying
        // peak so quiet inputs and high frequencies still reach the levels the
        // scenes' thresholds expect.
        autoLevel: CLIFT.util.storage.get('clift-auto-level', true),
        peaks: new Float32Array(SPECTRUM_BANDS).fill(0.2),
        bandPeaks: {},

        setAutoLevel(on) {
            this.autoLevel = !!on;
            CLIFT.util.storage.set('clift-auto-level', this.autoLevel);
            CLIFT.events.emit('state');
        },

        level(value, peak) {
            if (value < 0.02) return 0; // keep silence silent
            return Math.min(MAX_LEVEL, value * 0.3 + (value / peak) * 0.7);
        },

        get live() {
            return this.source !== 'demo';
        },

        // ---- source control -------------------------------------------------

        ensureContext() {
            if (!this.context) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                this.context = new Ctx();
                this.analyser = this.context.createAnalyser();
                this.analyser.fftSize = FFT_SIZE;
                this.analyser.smoothingTimeConstant = 0.75;
                this.gainNode = this.context.createGain();
                this.gainNode.gain.value = this.gain;
                this.gainNode.connect(this.analyser);
            }
            if (this.context.state === 'suspended') this.context.resume();
            this.setSampleRate(this.context.sampleRate);
        },

        async startMic(deviceId) {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error(window.isSecureContext
                    ? 'This browser does not support audio input'
                    : 'Microphone needs https:// or opening the file locally');
            }
            this.ensureContext();
            const audioConstraints = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
            if (deviceId) audioConstraints.deviceId = { exact: deviceId };
            const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
            this.disconnectSource();
            this.stream = stream;
            this.deviceId = deviceId || '';
            this.sourceNode = this.context.createMediaStreamSource(stream);
            this.sourceNode.connect(this.gainNode);
            this.source = 'mic';
            CLIFT.events.emit('audio-source', this.describe());
        },

        async listInputs() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(d => d.kind === 'audioinput')
                .map((d, i) => ({ id: d.deviceId, label: d.label || `Input ${i + 1}` }));
        },

        async startFile(file) {
            this.ensureContext();
            this.disconnectSource();
            const el = new Audio();
            el.src = URL.createObjectURL(file);
            el.loop = true;
            this.mediaEl = el;
            this.fileName = file.name;
            this.sourceNode = this.context.createMediaElementSource(el);
            this.sourceNode.connect(this.gainNode);
            this.sourceNode.connect(this.context.destination); // keep it audible
            await el.play();
            this.source = 'file';
            CLIFT.events.emit('audio-source', this.describe());
        },

        toggleFilePlayback() {
            if (!this.mediaEl) return false;
            if (this.mediaEl.paused) this.mediaEl.play(); else this.mediaEl.pause();
            return !this.mediaEl.paused;
        },

        useDemo() {
            this.disconnectSource();
            this.source = 'demo';
            this.setSampleRate(44100);
            CLIFT.events.emit('audio-source', this.describe());
        },

        disconnectSource() {
            if (this.sourceNode) {
                try { this.sourceNode.disconnect(); } catch (e) { /* already gone */ }
                this.sourceNode = null;
            }
            if (this.stream) {
                this.stream.getTracks().forEach(t => t.stop());
                this.stream = null;
            }
            if (this.mediaEl) {
                this.mediaEl.pause();
                URL.revokeObjectURL(this.mediaEl.src);
                this.mediaEl = null;
                this.fileName = '';
            }
        },

        describe() {
            if (this.source === 'mic') return 'Live input';
            if (this.source === 'file') return this.fileName || 'Audio file';
            return 'Demo signal';
        },

        setGain(value) {
            this.gain = value;
            if (this.gainNode) this.gainNode.gain.value = value;
        },

        // ---- analysis -------------------------------------------------------

        setSampleRate(rate) {
            if (this.bandBins && rate === this.sampleRate) return;
            this.sampleRate = rate;
            const hzToBin = hz => CLIFT.util.clamp(Math.round(hz / (rate / FFT_SIZE)), 0, BIN_COUNT - 1);

            this.bandBins = {};
            for (const [name, [lo, hi]] of Object.entries(BAND_HZ)) {
                const start = hzToBin(lo);
                this.bandBins[name] = [start, Math.max(start + 1, hzToBin(hi))];
            }

            // Log-spaced 64-band spectrum from 30Hz to 16kHz.
            this.spectrumBins = [];
            let prev = hzToBin(30);
            for (let i = 1; i <= SPECTRUM_BANDS; i++) {
                const edge = Math.max(prev + 1, hzToBin(30 * Math.pow(16000 / 30, i / SPECTRUM_BANDS)));
                this.spectrumBins.push([prev, edge]);
                prev = edge;
            }
        },

        avgBins(start, end) {
            let sum = 0;
            for (let i = start; i < end; i++) sum += this.bins[i];
            return sum / ((end - start) * 255);
        },

        // Synthetic track: four-on-the-floor kick, snare on 2 & 4, offbeat hats,
        // arranged in a 64-beat loop (32 full, 16 lighter groove, 8 breakdown,
        // 8 riser, then the drop) so the Director has sections to follow.
        synthesizeDemo(clock) {
            const bins = this.bins;
            const phase = clock.phase;
            const beatInBar = clock.count % 4;
            const pos = clock.count % 64;
            const t = clock.time * 0.001;
            const breakdown = pos >= 48 && pos < 56;
            const riser = pos >= 56 ? (pos - 56 + phase) / 8 : 0;
            const groove = pos >= 32 && pos < 48 ? 0.6 : 1;
            const kick = breakdown || riser ? 0 : Math.exp(-phase * 7) * groove;
            const snare = (beatInBar === 1 || beatInBar === 3) && !breakdown ? Math.exp(-phase * 9) * groove : 0;
            const hat = breakdown ? 0 : Math.exp(-(((phase * (riser ? 2 : 1)) + 0.5) % 1) * 14);
            const binHz = this.sampleRate / FFT_SIZE;

            for (let i = 0; i < BIN_COUNT; i++) {
                const hz = i * binHz;
                let v = 0;
                if (hz < 140) v += 230 * kick + (breakdown ? 10 : 40);
                else if (hz < 400) v += 90 * kick + 60 + 30 * Math.sin(t * 0.7 + i * 0.3);
                if (hz > 300 && hz < 3000) v += (breakdown ? 50 : 70) + 50 * Math.sin(t * 1.3 + hz * 0.004) + 120 * snare;
                if (hz > 5000 && hz < 14000) v += 40 + 130 * hat;
                if (riser && hz > 1000 && hz < 1000 + riser * 12000) v += 140 * riser;
                v *= 1 - Math.min(0.85, hz / 20000);
                v += Math.random() * 18;
                bins[i] = CLIFT.util.clamp(v * this.gain, 0, 255);
            }
        },

        detectBeat(now) {
            const bd = this.beatDetector;
            const [start, end] = this.bandBins.bass;
            const energy = this.avgBins(start, end);

            bd.prevEnergy = bd.energy;
            bd.energyHistory.push(energy);
            if (bd.energyHistory.length > bd.historyLength) bd.energyHistory.shift();

            const n = bd.energyHistory.length;
            const avg = bd.energyHistory.reduce((a, b) => a + b, 0) / n;
            const variance = bd.energyHistory.reduce((s, v) => s + (v - avg) * (v - avg), 0) / n;
            const threshold = CLIFT.util.clamp(bd.threshold * (1 - Math.min(variance, 0.2)), 0.1, 0.8);
            const rise = Math.max(0, (energy - bd.prevEnergy) / Math.max(avg, 0.001));

            bd.detected = false;
            if (energy > avg * (1 + threshold) && energy > bd.prevEnergy &&
                now - bd.lastBeat > bd.minInterval && rise > 0.1) {
                bd.detected = true;
                bd.beatIntensity = Math.min(1, rise * 2);
                bd.confidenceLevel = Math.min(1, (energy - avg * (1 + threshold)) / (avg * (1 + threshold)));
                bd.lastBeat = now;
                this.recordBeat(now);
                CLIFT.events.emit('beat', bd.beatIntensity);
            } else {
                bd.beatIntensity *= 0.9;
            }
            bd.energy = energy;
        },

        // Tempo from the median inter-beat interval, folded into 80-170 BPM.
        recordBeat(now) {
            const times = this.beatTimes;
            times.push(now);
            if (times.length > 24) times.shift();
            const intervals = [];
            for (let i = 1; i < times.length; i++) {
                const d = times[i] - times[i - 1];
                if (d > 250 && d < 2000) intervals.push(d);
            }
            if (intervals.length < 4) return;
            intervals.sort((a, b) => a - b);
            let bpm = 60000 / intervals[intervals.length >> 1];
            while (bpm < 80) bpm *= 2;
            while (bpm > 170) bpm /= 2;
            this.detectedBPM = Math.round(bpm);
        },

        calculateBandLevels() {
            const levels = { overall: this.avgBins(0, BIN_COUNT) };
            for (const [name, [start, end]] of Object.entries(this.bandBins)) {
                levels[name] = this.avgBins(start, end);
            }
            levels.bass *= 1.6;
            levels.highMid *= 1.3;
            levels.treble *= 1.8;
            for (const k in levels) levels[k] = Math.min(MAX_LEVEL, levels[k]);
            return levels;
        },

        // Called by the engine every frame. `clock` = { time, phase, count } from the BPM clock.
        update(clock) {
            if (this.live && this.analyser) {
                this.analyser.getByteFrequencyData(this.bins);
            } else {
                if (this.source !== 'demo') this.source = 'demo';
                this.synthesizeDemo(clock);
            }

            const spectrum = this.spectrum;
            for (let i = 0; i < SPECTRUM_BANDS; i++) {
                const [start, end] = this.spectrumBins[i];
                // Kept just below 1: scenes index arrays with floor(level * length).
                let v = Math.min(MAX_LEVEL, Math.pow(this.avgBins(start, end), 0.8));
                if (this.autoLevel) {
                    this.peaks[i] = Math.max(v, this.peaks[i] * 0.995, 0.08);
                    v = this.level(v, this.peaks[i]);
                }
                spectrum[i] = v;
            }

            this.detectBeat(clock.time);
            const bands = this.calculateBandLevels();
            const raw = { volume: bands.overall, bass: bands.bass }; // before auto-level
            if (this.autoLevel) {
                for (const k in bands) {
                    this.bandPeaks[k] = Math.max(bands[k], (this.bandPeaks[k] || 0.2) * 0.997, 0.08);
                    bands[k] = this.level(bands[k], this.bandPeaks[k]);
                }
            }
            const advanced = this.calculateAdvancedFeatures(spectrum, bands);
            const hyperReactive = this.updateFeatureTracking(advanced, bands);
            const bd = this.beatDetector;

            this.frame = {
                spectrum,
                bands,
                beat: {
                    detected: bd.detected,
                    intensity: bd.beatIntensity,
                    confidence: bd.confidenceLevel,
                    lastDetected: bd.lastBeat
                },
                volume: bands.overall,
                raw,
                energy: bd.energy,
                bpm: this.detectedBPM || clock.bpm,
                advanced,
                hyperReactive
            };
            return this.frame;
        }
    };

    Object.assign(audio, CLIFT.audioAnalysis);
    audio.setSampleRate(44100);

    CLIFT.audio = audio;
    window.CLIFTAudio = audio; // legacy name used by older scenes/editors
})();
