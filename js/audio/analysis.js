// Higher-level audio features (spectral shape, momentum, buildup/drop detection...).
// Mixed into CLIFT.audio; scenes read the results via params.audioInfo.advanced
// and params.audioInfo.hyperReactive.

CLIFT.audioAnalysis = {
    featureTracker: {
        shortMemory: {
            size: 86, // ~1.5s at 60fps
            spectralCentroid: [],
            energy: [],
            attacks: [],
            beats: [],
            harmonicRatio: [],
            spectralFlux: [],
            spectralRolloff: []
        },
        adaptiveThresholds: {
            attackThreshold: 0.3,
            energyThreshold: 0.5
        }
    },

    // Update feature tracking with memory and pattern detection
    updateFeatureTracking: function(features, bands) {
        const tracker = this.featureTracker;
        
        // Update short-term memory
        const shortMem = tracker.shortMemory;
        this.addToMemory(shortMem.spectralCentroid, features.spectralCentroid, shortMem.size);
        this.addToMemory(shortMem.energy, this.beatDetector.energy, shortMem.size);
        this.addToMemory(shortMem.attacks, features.attack, shortMem.size);
        this.addToMemory(shortMem.beats, this.beatDetector.detected ? 1 : 0, shortMem.size);
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
    }
};
