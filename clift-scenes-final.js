// CLIFT Web Scenes - First 20 Scenes
// Complete implementation of scenes 0-19

window.CLIFTScenes = {};

// ============================================
// CATEGORY 0: Audio Reactive Scenes (0-9)
// ============================================

// Scene 0: IKEDA DATA STORM - Enhanced Audio Reactive Spectrum
CLIFTScenes[0] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    // Extract enhanced audio features
    const bands = audioInfo?.bands || { bass: 0.3, lowMid: 0.3, mid: 0.3, highMid: 0.3, treble: 0.3 };
    const advanced = audioInfo?.advanced || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // Advanced audio-reactive parameters
    const spectralCentroid = advanced.brightness || 0.5;
    const attack = advanced.attack || 0;
    const dynamicRange = advanced.dynamicRange || 0.5;
    const percussive = advanced.percussiveContent || 0.3;
    const harmonic = advanced.harmonicContent || 0.3;
    
    // Adaptive character sets based on audio character
    const harmonicChars = spectralCentroid > 0.6 ? '╱╲╳▲▼◆◇' : '▁▂▃▄▅▆▇█';
    const percussiveChars = percussive > 0.7 ? '█▉▊▋▌▍▎▏' : '*@#%&+=';
    const noiseChars = '░▒▓█▓▒░';
    
    // Create explosive spectrum with enhanced reactivity
    for (let i = 0; i < audio.length; i++) {
        const freq = i / audio.length;
        const audioLevel = audio[i];
        
        // Enhanced bar height with attack sensitivity
        const attackBoost = attack > 0.1 ? (1 + attack * 2) : 1;
        const barHeight = Math.floor(audioLevel * height * 1.5 * attackBoost);
        
        // Dynamic bar width based on spectral characteristics
        const widthMult = 1 + (dynamicRange * 0.5);
        const barsPerFreq = Math.max(1, Math.floor(width / audio.length * widthMult));
        const startX = i * Math.floor(width / audio.length);
        
        for (let b = 0; b < barsPerFreq; b++) {
            const x = startX + b;
            if (x >= width) break;
            
            // Intelligent character selection based on audio characteristics
            for (let y = 0; y < barHeight && y < height; y++) {
                const intensity = y / Math.max(1, barHeight - 1);
                let char;
                
                // Select character set based on frequency band and audio characteristics
                if (freq < 0.2 && percussive > 0.6) {
                    // Low frequencies with high percussive content
                    char = percussiveChars[Math.floor(intensity * (percussiveChars.length - 1))];
                } else if (freq > 0.6 && harmonic > 0.5) {
                    // High frequencies with harmonic content
                    char = harmonicChars[Math.floor(intensity * (harmonicChars.length - 1))];
                } else if (advanced.spectralFlatness > 0.7) {
                    // Noisy content
                    char = noiseChars[Math.floor(Math.random() * noiseChars.length)];
                } else {
                    // Standard spectrum
                    const chars = '▁▂▃▄▅▆▇█';
                    char = chars[Math.floor(intensity * (chars.length - 1))];
                }
                
                // Explosive effects on high energy attacks
                if (audioLevel > 0.7 || attack > 0.3) {
                    const explosiveChars = percussive > 0.6 ? '⚡⚡⚡◄►▲▼' : '✦✧★☆◆◇';
                    if (Math.random() < attack + audioLevel - 0.7) {
                        char = explosiveChars[Math.floor(Math.random() * explosiveChars.length)];
                    }
                }
                
                buffer[height - 1 - y][x] = char;
            }
            
            // Enhanced particle explosion effects
            if (audioLevel > 0.4 || beat.detected) {
                const particleIntensity = beat.detected ? beat.intensity : audioLevel;
                const particles = Math.floor(particleIntensity * 15 * (1 + attack));
                
                for (let p = 0; p < particles; p++) {
                    const spreadX = 4 + Math.floor(dynamicRange * 8);
                    const spreadY = 3 + Math.floor(attack * 5);
                    const px = x + Math.floor((Math.random() - 0.5) * spreadX);
                    const py = height - barHeight + Math.floor((Math.random() - 0.5) * spreadY);
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const particleChars = percussive > 0.5 ? '·*◦●○' : '·✦◆▪';
                        buffer[py][px] = particleChars[Math.floor(Math.random() * particleChars.length)];
                    }
                }
            }
        }
    }
    
    // Enhanced strobing baseline with beat synchronization
    const beatPulse = beat.detected ? 1.0 : 0;
    const tonalPulse = Math.sin(t * 10) * 0.5 + 0.5;
    const combinedPulse = Math.max(beatPulse, tonalPulse * (harmonic + 0.3));
    
    if (combinedPulse > 0.7) {
        const baseChars = beat.detected ? '━═══━' : '▬─═─▬';
        const spacing = Math.max(1, Math.floor(4 - bands.bass * 3));
        for (let x = 0; x < width; x += spacing) {
            buffer[height - 1][x] = baseChars[x % baseChars.length];
        }
    }
    
    // Data stream overlays for high spectral flux (rapid changes)
    if (advanced.spectralFlux > 0.3) {
        const streamCount = Math.floor(advanced.spectralFlux * 5);
        for (let s = 0; s < streamCount; s++) {
            const streamX = Math.floor(Math.random() * width);
            const streamLength = Math.floor(advanced.spectralFlux * height * 0.3);
            const startY = Math.floor(Math.random() * (height - streamLength));
            
            const streamChars = '|║│¦┃┆';
            const streamChar = streamChars[Math.floor(Math.random() * streamChars.length)];
            
            for (let y = startY; y < startY + streamLength && y < height; y++) {
                if (Math.random() < 0.7) { // Some gaps for realism
                    buffer[y][streamX] = streamChar;
                }
            }
        }
    }
};

// Scene 1: FREQUENCY SHOCKWAVE BURST - Enhanced Multi-Ring Mandala
CLIFTScenes[1] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.4);
    const audioInfo = params.audioInfo;
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    const maxRadius = Math.min(width, height) / 2 - 1;
    
    // Extract enhanced audio features
    const bands = audioInfo?.bands || { bass: 0.4, lowMid: 0.4, mid: 0.4, highMid: 0.4, treble: 0.4 };
    const advanced = audioInfo?.advanced || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // Advanced parameters
    const spectralRolloff = advanced.spectralRolloff || 0.5;
    const harmonicContent = advanced.harmonicContent || 0.4;
    const attack = advanced.attack || 0;
    const spectralFlux = advanced.spectralFlux || 0;
    
    // Calculate audio energies for different frequency regions
    const bassEnergy = bands.bass;
    const midEnergy = (bands.lowMid + bands.mid) / 2;
    const highEnergy = (bands.highMid + bands.treble) / 2;
    const energy = (bassEnergy + midEnergy + highEnergy) / 3;
    
    // Shockwave bursts on beat detection
    const shockwaveRadius = beat.detected ? beat.intensity * maxRadius * 0.8 : 0;
    const shockwaveDecay = Math.max(0, 1 - ((Date.now() - (audioInfo?.beat?.lastDetected || 0)) / 500));
    
    // Enhanced multi-layer mandala with frequency-specific characteristics
    const layerConfigs = [
        { band: bassEnergy, speed: 0.3, chars: '█▉▊▋▌▍▎▏', spokeBase: 6 },
        { band: midEnergy, speed: 0.6, chars: '▓▒░▒▓', spokeBase: 8 },
        { band: highEnergy, speed: 1.2, chars: '◆◇◊○●◦·', spokeBase: 12 },
        { band: energy, speed: 0.9, chars: '▲▼◄►♦♢', spokeBase: 10 }
    ];
    
    for (let layer = 0; layer < layerConfigs.length; layer++) {
        const config = layerConfigs[layer];
        const layerRadius = (layer + 1) * maxRadius / layerConfigs.length;
        const layerSpeed = config.speed + (spectralFlux * 2); // Speed reacts to spectral change
        const audioLayer = config.band;
        
        // Dynamic spoke count based on harmonic content and attack
        const harmonicMultiplier = harmonicContent > 0.6 ? 1.5 : 1.0;
        const attackMultiplier = attack > 0.2 ? (1 + attack) : 1.0;
        const spokes = Math.floor((config.spokeBase + audioLayer * 16) * harmonicMultiplier * attackMultiplier);
        
        for (let spoke = 0; spoke < spokes; spoke++) {
            const angle = (spoke / spokes) * Math.PI * 2 + t * layerSpeed;
            
            // Enhanced radius variation with spectral characteristics
            const freqVariation = audioLayer * 12;
            const harmonicVariation = harmonicContent * 6;
            const radiusVariation = freqVariation + harmonicVariation;
            const currentRadius = layerRadius + Math.sin(t * 3 + spoke) * radiusVariation;
            
            // Shockwave interaction
            const shockwaveEffect = shockwaveRadius > 0 ? 
                Math.sin((layerRadius - shockwaveRadius) * 0.5) * shockwaveDecay : 0;
            const finalRadius = currentRadius + shockwaveEffect * 8;
            
            // Draw spoke with enhanced audio reactivity
            for (let r = 0; r < finalRadius; r++) {
                const x = Math.floor(centerX + Math.cos(angle) * r);
                const y = Math.floor(centerY + Math.sin(angle) * r * 0.6); // Aspect compensation
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    // Intelligent character selection
                    const intensity = (r / finalRadius) * audioLayer;
                    const charIndex = Math.floor(intensity * (config.chars.length - 1));
                    let char = config.chars[charIndex] || config.chars[0];
                    
                    // Shockwave burst characters
                    if (shockwaveRadius > 0 && Math.abs(r - shockwaveRadius) < 3) {
                        const burstChars = '⚡※⁂⋆✧★☆';
                        char = burstChars[Math.floor(Math.random() * burstChars.length)];
                    }
                    
                    // High-frequency sparkles on treble spikes
                    if (layer === 2 && bands.treble > 0.7 && Math.random() < bands.treble - 0.6) {
                        char = '✦';
                    }
                    
                    // Bass impact intensification
                    if (layer === 0 && bands.bass > 0.6 && r < layerRadius * 0.3) {
                        const impactChars = '●◉⬢⬣◆';
                        char = impactChars[Math.floor(Math.random() * impactChars.length)];
                    }
                    
                    // Attack emphasis
                    if (attack > 0.3 && Math.random() < attack) {
                        const attackChars = layer === 0 ? '▌▐║' : '╱╲╳';
                        char = attackChars[Math.floor(Math.random() * attackChars.length)];
                    }
                    
                    buffer[y][x] = char;
                }
            }
        }
    }
    
    // Enhanced pulsing center core with beat synchronization
    const beatBoost = beat.detected ? beat.intensity * 3 : 0;
    const coreSize = Math.floor((energy * 5) + beatBoost) + 1;
    const coreIntensity = energy + beatBoost;
    
    for (let dy = -coreSize; dy <= coreSize; dy++) {
        for (let dx = -coreSize; dx <= coreSize; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= coreSize) {
                const x = Math.floor(centerX + dx);
                const y = Math.floor(centerY + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    let coreChar;
                    const distRatio = dist / coreSize;
                    
                    if (beat.detected && distRatio < 0.3) {
                        // Beat explosion core
                        coreChar = ['⚫', '⚪', '◉', '◎'][Math.floor(Math.random() * 4)];
                    } else if (coreIntensity > 0.8) {
                        coreChar = distRatio < 0.5 ? '◉' : '○';
                    } else if (coreIntensity > 0.5) {
                        coreChar = distRatio < 0.7 ? '●' : '○';
                    } else {
                        coreChar = '○';
                    }
                    
                    // Harmonic core enhancement
                    if (harmonicContent > 0.7 && distRatio < 0.4) {
                        const harmonicCores = '◇◆♦♢';
                        coreChar = harmonicCores[Math.floor(Math.random() * harmonicCores.length)];
                    }
                    
                    buffer[y][x] = coreChar;
                }
            }
        }
    }
    
    // Radial energy burst lines extending from center
    if (bands.overall > 0.5 || attack > 0.2) {
        const burstLines = Math.floor((bands.overall + attack) * 8);
        for (let line = 0; line < burstLines; line++) {
            const burstAngle = (line / burstLines) * Math.PI * 2 + t * 2;
            const burstLength = Math.floor((bands.overall + attack) * maxRadius * 0.7);
            
            for (let r = coreSize + 2; r < burstLength; r += 2) {
                const x = Math.floor(centerX + Math.cos(burstAngle) * r);
                const y = Math.floor(centerY + Math.sin(burstAngle) * r * 0.6);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const burstChars = attack > 0.3 ? '━═' : '─│';
                    buffer[y][x] = burstChars[r % burstChars.length];
                }
            }
        }
    }
};

// Scene 2: DIGITAL AVALANCHE - HYPER-REACTIVE DATA CASCADE
CLIFTScenes[2] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.3, lowMid: 0.3, mid: 0.3, highMid: 0.3, treble: 0.3 };
    const advanced = audioInfo?.advanced || {};
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const energyMomentum = hyperReactive.energyMomentum || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const dropIntensity = hyperReactive.dropIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const surpriseLevel = hyperReactive.surpriseLevel || 0;
    const emotionalIntensity = hyperReactive.emotionalIntensity || 0;
    const complexityIndex = hyperReactive.complexityIndex || 0;
    const grooveStrength = hyperReactive.grooveStrength || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // ADAPTIVE CASCADE PARAMETERS
    const cascadeSpeed = 1 + (energyMomentum * 8) + (buildupIntensity * 12);
    const streamDensity = Math.min(16, 4 + (complexityIndex * 12));
    const chaosLevel = surpriseLevel + (dropIntensity * 0.8);
    
    // MULTI-LAYER CASCADING DATA STREAMS
    for (let x = 0; x < width; x++) {
        const freqIndex = Math.floor((x / width) * audio.length);
        const localAudio = audio[freqIndex];
        const bandEnergy = x < width * 0.2 ? bands.bass : 
                          x < width * 0.4 ? bands.lowMid :
                          x < width * 0.6 ? bands.mid :
                          x < width * 0.8 ? bands.highMid : bands.treble;
        
        // Stream speed reacts to local frequency content + global momentum
        const baseSpeed = cascadeSpeed * (0.3 + localAudio + bandEnergy);
        const momentumBoost = energyMomentum > 0 ? (1 + energyMomentum * 3) : 
                            energyMomentum < -0.1 ? (0.5) : 1;
        const streamSpeed = baseSpeed * momentumBoost;
        
        // Onset-driven acceleration
        const onsetAccel = onsetStrength > 0.5 ? (1 + onsetStrength * 4) : 1;
        const finalSpeed = streamSpeed * onsetAccel;
        
        const streamY = (t * finalSpeed * 15 + x * 2.5) % (height + streamDensity + 5);
        
        // Enhanced digital rain with multiple stream types
        const streamLength = Math.floor(streamDensity * (0.5 + bandEnergy + buildupIntensity));
        
        for (let i = 0; i < streamLength; i++) {
            const y = Math.floor(streamY - i * 1.2) % height;
            if (y >= 0 && y < height) {
                const intensity = ((streamLength - i) / streamLength) * bandEnergy;
                const distanceFromHead = i / Math.max(1, streamLength - 1);
                
                let char;
                
                // Character selection based on onset type and musical characteristics
                if (onsetType === 'percussive' && i < 3) {
                    // Percussive head characters
                    const percChars = ['█', '▉', '▊', '▋', '■', '●', '◉'];
                    char = percChars[Math.floor(intensity * (percChars.length - 1))];
                } else if (onsetType === 'harmonic' && intensity > 0.6) {
                    // Harmonic content characters
                    const harmChars = ['♫', '♪', '♬', '♩', '♮', '♯', '♭'];
                    char = harmChars[Math.floor(Math.random() * harmChars.length)];
                } else if (onsetType === 'spectral' && distanceFromHead < 0.3) {
                    // Spectral change characters
                    const specChars = ['▲', '▼', '◄', '►', '◆', '◇', '○'];
                    char = specChars[Math.floor(intensity * (specChars.length - 1))];
                } else {
                    // Standard digital rain characters with intensity scaling
                    if (intensity > 0.9) char = '█';
                    else if (intensity > 0.75) char = '▓';
                    else if (intensity > 0.5) char = '▒';
                    else if (intensity > 0.25) char = '░';
                    else if (intensity > 0.1) char = '│';
                    else char = '┆';
                }
                
                // Climax amplification
                if (climaxProbability > 0.8 && Math.random() < climaxProbability - 0.7) {
                    const climaxChars = ['⚡', '※', '⁂', '✦', '✧', '⋆', '✱'];
                    char = climaxChars[Math.floor(Math.random() * climaxChars.length)];
                }
                
                // Surprise-based character mutations
                if (surpriseLevel > 0.6 && Math.random() < (surpriseLevel - 0.5) * 2) {
                    const surpriseChars = ['?', '!', '¿', '¡', '⚠', '※', '⁂'];
                    char = surpriseChars[Math.floor(Math.random() * surpriseChars.length)];
                }
                
                buffer[y][x] = char;
            }
        }
        
        // Groove-responsive side streams
        if (grooveStrength > 0.7 && x % 4 === Math.floor(t * 2) % 4) {
            const sideStreamY = (t * finalSpeed * 8 + x * 1.8) % height;
            const sideY = Math.floor(sideStreamY);
            if (sideY >= 0 && sideY < height) {
                const grooveChars = ['┃', '║', '│', '┆', '︙', ':'];
                buffer[sideY][x] = grooveChars[Math.floor(grooveStrength * (grooveChars.length - 1))];
            }
        }
    }
    
    // HYPER-REACTIVE INTERFERENCE PATTERNS
    // Onset-triggered interference
    if (onsetStrength > 0.4) {
        const interferenceIntensity = onsetStrength * (1 + surpriseLevel);
        const interferenceLines = Math.floor(interferenceIntensity * 15);
        
        for (let i = 0; i < interferenceLines; i++) {
            const y = Math.floor(Math.random() * height);
            const interferenceStrength = onsetStrength + (chaosLevel * 0.5);
            
            for (let x = 0; x < width; x++) {
                if (Math.random() < interferenceStrength * 0.8) {
                    let glitchChar;
                    
                    if (onsetType === 'percussive') {
                        const percGlitch = ['▚', '▞', '▟', '▛', '▜', '▝', '▗', '▖', '■', '▪'];
                        glitchChar = percGlitch[Math.floor(Math.random() * percGlitch.length)];
                    } else if (dropIntensity > 0.5) {
                        const dropGlitch = ['▾', '▿', '⯆', '⯇', '▽', '∇', '⊽'];
                        glitchChar = dropGlitch[Math.floor(Math.random() * dropGlitch.length)];
                    } else if (buildupIntensity > 0.5) {
                        const buildupGlitch = ['▴', '▵', '⯅', '⯆', '△', '⊿', '⟨', '⟩'];
                        glitchChar = buildupGlitch[Math.floor(Math.random() * buildupGlitch.length)];
                    } else {
                        const standardGlitch = ['▚', '▞', '▟', '▛', '▜', '▝', '▗', '▖'];
                        glitchChar = standardGlitch[Math.floor(Math.random() * standardGlitch.length)];
                    }
                    
                    buffer[y][x] = glitchChar;
                }
            }
        }
    }
    
    // EMOTIONAL INTENSITY BURSTS
    if (emotionalIntensity > 0.6) {
        const burstCount = Math.floor(emotionalIntensity * 25 * (1 + buildupIntensity));
        const burstIntensity = emotionalIntensity + climaxProbability;
        
        for (let i = 0; i < burstCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            
            let burstChar;
            if (climaxProbability > 0.7) {
                const climaxBursts = ['◉', '⚫', '⚪', '◎', '●', '○', '⬢', '⬣', '◆', '◇'];
                burstChar = climaxBursts[Math.floor(Math.random() * climaxBursts.length)];
            } else if (emotionalIntensity > 0.8) {
                const intenseBursts = ['★', '☆', '✦', '✧', '⋆', '✱', '※', '⁂'];
                burstChar = intenseBursts[Math.floor(Math.random() * intenseBursts.length)];
            } else {
                const standardBursts = ['◆', '◇', '○', '●', '◉', '★', '☆'];
                burstChar = standardBursts[Math.floor(Math.random() * standardBursts.length)];
            }
            
            buffer[y][x] = burstChar;
        }
    }
    
    // BUILDUP VISUALIZATION - Ascending energy streams
    if (buildupIntensity > 0.3) {
        const buildupStreams = Math.floor(buildupIntensity * 8);
        for (let s = 0; s < buildupStreams; s++) {
            const x = Math.floor((s / buildupStreams) * width);
            const streamHeight = Math.floor(buildupIntensity * height * 0.8);
            
            for (let y = height - streamHeight; y < height; y++) {
                if (y >= 0 && Math.random() < buildupIntensity) {
                    const buildupChars = ['↑', '⇈', '⇑', '▲', '△', '⯅', '▴'];
                    buffer[y][x] = buildupChars[Math.floor(Math.random() * buildupChars.length)];
                }
            }
        }
    }
    
    // DROP VISUALIZATION - Explosive downward cascades
    if (dropIntensity > 0.4) {
        const dropCascades = Math.floor(dropIntensity * 12);
        for (let d = 0; d < dropCascades; d++) {
            const x = Math.floor(Math.random() * width);
            const cascadeLength = Math.floor(dropIntensity * height * 0.6);
            
            for (let i = 0; i < cascadeLength; i++) {
                const y = Math.floor((t * 30 * dropIntensity + i * 2) % height);
                if (y >= 0 && y < height && Math.random() < dropIntensity) {
                    const dropChars = ['↓', '⇊', '⇓', '▼', '▽', '⯇', '▾'];
                    buffer[y][x] = dropChars[Math.floor(Math.random() * dropChars.length)];
                }
            }
        }
    }
    
    // COMPLEXITY-DRIVEN FRACTALS
    if (complexityIndex > 0.7) {
        const fractalCount = Math.floor((complexityIndex - 0.6) * 20);
        for (let f = 0; f < fractalCount; f++) {
            const centerX = Math.floor(Math.random() * width);
            const centerY = Math.floor(Math.random() * height);
            const fractalSize = Math.floor(complexityIndex * 4);
            
            for (let dy = -fractalSize; dy <= fractalSize; dy++) {
                for (let dx = -fractalSize; dx <= fractalSize; dx++) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= fractalSize && Math.random() < complexityIndex - 0.6) {
                            const fractalChars = ['⊙', '⊚', '⊛', '⊜', '⚬', '⚭', '⚮', '⚯'];
                            buffer[y][x] = fractalChars[Math.floor(Math.random() * fractalChars.length)];
                        }
                    }
                }
            }
        }
    }
};

// Scene 3: HYPERSPACE TUNNEL EXPLOSION
CLIFTScenes[3] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.4);
    const t = time * 0.001;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Audio energy calculation
    const energy = audio.reduce((a, b) => a + b, 0) / audio.length;
    const bassEnergy = audio.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
    const highEnergy = audio.slice(32, 64).reduce((a, b) => a + b, 0) / 32;
    
    // HYPERSPACE TUNNEL EFFECT
    const tunnelSpeed = energy * 50 + 10;
    const tunnelZ = (t * tunnelSpeed) % 100;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 1.4; // Aspect correction
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Tunnel rings with audio modulation
            const ringDistance = (distance + tunnelZ) % (5 + energy * 10);
            const audioMod = audio[Math.floor((angle + Math.PI) / (2 * Math.PI) * audio.length)] || 0;
            
            if (ringDistance < 2 + audioMod * 3) {
                const intensity = (2 + audioMod * 3 - ringDistance) / (2 + audioMod * 3);
                let char;
                if (intensity > 0.8) char = '█';
                else if (intensity > 0.6) char = '▓';
                else if (intensity > 0.4) char = '▒';
                else if (intensity > 0.2) char = '░';
                else char = '·';
                
                buffer[y][x] = char;
            }
            
            // EXPLOSIVE RADIAL BURSTS
            if (bassEnergy > 0.6) {
                const burstAngle = Math.floor(angle / (Math.PI / 8)) * (Math.PI / 8);
                const radialDist = Math.abs(angle - burstAngle) * distance;
                
                if (radialDist < bassEnergy * 2 && distance < bassEnergy * 30) {
                    const burstChars = '│║▌▐█';
                    buffer[y][x] = burstChars[Math.floor(Math.random() * burstChars.length)];
                }
            }
        }
    }
    
    // CENTRAL EXPLOSION CORE
    if (energy > 0.5) {
        const coreSize = Math.floor(energy * 8);
        for (let dy = -coreSize; dy <= coreSize; dy++) {
            for (let dx = -coreSize; dx <= coreSize; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= coreSize) {
                    const x = Math.floor(centerX + dx);
                    const y = Math.floor(centerY + dy);
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const coreIntensity = 1 - (dist / coreSize);
                        if (coreIntensity > 0.7) buffer[y][x] = '●';
                        else if (coreIntensity > 0.4) buffer[y][x] = '◉';
                        else buffer[y][x] = '○';
                    }
                }
            }
        }
    }
    
    // HIGH-FREQUENCY STROBE PARTICLES
    if (highEnergy > 0.5) {
        const particleCount = Math.floor(highEnergy * 50);
        for (let i = 0; i < particleCount; i++) {
            const px = Math.floor(Math.random() * width);
            const py = Math.floor(Math.random() * height);
            const strobeChars = '✦✧★☆◆◇';
            if (Math.random() < highEnergy) {
                buffer[py][px] = strobeChars[Math.floor(Math.random() * strobeChars.length)];
            }
        }
    }
};

// Scene 4: Audio Reactive Matrix Rain
CLIFTScenes[4] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01';
    
    if (!params._drops) {
        params._drops = [];
        for (let x = 0; x < width; x++) {
            params._drops[x] = {
                y: Math.random() * height,
                speed: 0.5 + Math.random() * 0.5
            };
        }
    }
    
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    for (let x = 0; x < width; x++) {
        const drop = params._drops[x];
        const audioIndex = Math.floor((x / width) * audio.length);
        
        // Speed based on audio
        drop.speed = 0.5 + audio[audioIndex] * 2;
        
        // Update position
        drop.y += drop.speed;
        if (drop.y > height + 10) {
            drop.y = -10;
        }
        
        // Draw trail
        for (let dy = 0; dy < 10; dy++) {
            const y = Math.floor(drop.y - dy);
            if (y >= 0 && y < height) {
                const brightness = (1 - dy / 10) * (0.5 + audio[audioIndex] * 0.5);
                if (brightness > 0.5) {
                    buffer[y][x] = chars[Math.floor(Math.random() * chars.length)];
                } else if (brightness > 0.2) {
                    buffer[y][x] = '.';
                }
            }
        }
    }
};

// Scene 5: Bass Pulse Circles
CLIFTScenes[5] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const bass = (audio[0] + audio[1] + audio[2] + audio[3]) / 4;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Multiple circles based on frequency bands
    for (let band = 0; band < 8; band++) {
        const radius = (band + 1) * 3 + (audio[band * 8] || 0) * 15;
        const char = band % 2 === 0 ? '#' : '*';
        
        // Draw circle
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const x = Math.floor(centerX + Math.cos(angle) * radius);
            const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5); // Ellipse
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = char;
            }
        }
    }
    
    // Center burst on strong bass
    if (bass > 0.7) {
        const burstSize = bass * 10;
        for (let dy = -burstSize; dy <= burstSize; dy++) {
            for (let dx = -burstSize; dx <= burstSize; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < burstSize) {
                    const x = Math.floor(centerX + dx);
                    const y = Math.floor(centerY + dy);
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = '@';
                    }
                }
            }
        }
    }
};

// Scene 6: Audio Terrain
CLIFTScenes[6] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const chars = ' .:-=+*#%@';
    
    // Generate terrain based on audio
    for (let z = height - 1; z >= 0; z--) {
        const perspective = (height - z) / height;
        
        for (let x = 0; x < width; x++) {
            const audioX = (x / width) * audio.length;
            const audioIndex = Math.floor(audioX);
            const audioValue = audio[audioIndex] || 0;
            
            // Calculate height at this point
            const terrainHeight = audioValue * 10 * perspective;
            const y = height - z - 1;
            
            if (y < terrainHeight) {
                const intensity = (terrainHeight - y) / terrainHeight;
                const charIndex = Math.floor(intensity * (chars.length - 1));
                buffer[z][x] = chars[charIndex];
            } else if (Math.abs(y - terrainHeight) < 1) {
                buffer[z][x] = '─';
            }
        }
    }
};

// Scene 7: Frequency Spiral
CLIFTScenes[7] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    for (let i = 0; i < audio.length; i++) {
        const angle = (i / audio.length) * Math.PI * 4 + t;
        const radius = 5 + i * 0.3 + audio[i] * 20;
        
        // Spiral path
        for (let r = 0; r < radius; r += 2) {
            const x = Math.floor(centerX + Math.cos(angle + r * 0.1) * r);
            const y = Math.floor(centerY + Math.sin(angle + r * 0.1) * r * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const char = audio[i] > 0.5 ? '@' : (audio[i] > 0.3 ? '#' : '+');
                buffer[y][x] = char;
            }
        }
    }
};

// Scene 8: Audio Ripples (Fixed)
CLIFTScenes[8] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Use global storage instead of params for persistence
    if (!window._cliftRipples) {
        window._cliftRipples = [];
    }
    
    const ripples = window._cliftRipples;
    
    // Create new ripples more frequently and with lower threshold
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    const bassEnergy = audio.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    
    // Create ripples based on audio with lower threshold
    if ((avgAudio > 0.3 || bassEnergy > 0.4) && Math.random() < 0.4) {
        ripples.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0,
            maxRadius: (avgAudio + bassEnergy) * 20 + 5, // Minimum radius
            speed: 0.3 + avgAudio * 2,
            intensity: avgAudio + bassEnergy
        });
    }
    
    // Always create at least one ripple for demo
    if (ripples.length === 0 && Math.random() < 0.1) {
        ripples.push({
            x: width / 2,
            y: height / 2,
            radius: 0,
            maxRadius: 15,
            speed: 0.5,
            intensity: 0.5
        });
    }
    
    // Update and draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;
        
        if (ripple.radius > ripple.maxRadius) {
            ripples.splice(i, 1);
            continue;
        }
        
        // Draw ripple with better visibility
        const fadeIntensity = 1 - (ripple.radius / ripple.maxRadius);
        const totalIntensity = fadeIntensity * ripple.intensity;
        
        let char;
        if (totalIntensity > 0.7) char = '●';
        else if (totalIntensity > 0.5) char = '○';
        else if (totalIntensity > 0.3) char = '◦';
        else if (totalIntensity > 0.1) char = '·';
        else char = '`';
        
        // Draw circular ripple
        const step = Math.max(0.1, 0.3 - ripple.radius * 0.01);
        for (let angle = 0; angle < Math.PI * 2; angle += step) {
            const x = Math.floor(ripple.x + Math.cos(angle) * ripple.radius);
            const y = Math.floor(ripple.y + Math.sin(angle) * ripple.radius * 0.6); // Compress vertically
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = char;
            }
        }
    }
    
    // Keep ripple count reasonable
    if (ripples.length > 15) {
        ripples.splice(0, ripples.length - 15);
    }
};

// Scene 9: SPECTRAL DNA HELIX - Enhanced Audio-Reactive Double Helix
CLIFTScenes[9] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    // Extract enhanced audio features
    const bands = audioInfo?.bands || { bass: 0.2, lowMid: 0.2, mid: 0.2, highMid: 0.2, treble: 0.2 };
    const advanced = audioInfo?.advanced || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // Advanced parameters
    const harmonicContent = advanced.harmonicContent || 0.2;
    const attack = advanced.attack || 0;
    const spectralFlux = advanced.spectralFlux || 0;
    const tonality = advanced.tonality || 0.5;
    
    // Helix parameters enhanced by audio
    const helixSpeed = 1 + (spectralFlux * 3); // Rate of change affects rotation speed
    const amplitudeBase = 8 + (bands.overall * 15);
    const phaseShift = harmonicContent * Math.PI; // Harmonic content affects phase relationship
    
    // Multiple helixes based on frequency bands
    const helixConfigs = [
        { band: bands.bass, char: '●', phase: 0, weight: 2.0 },
        { band: bands.mid, char: '○', phase: Math.PI, weight: 1.5 },
        { band: bands.treble, char: '◦', phase: Math.PI * 0.5, weight: 1.0 },
        { band: bands.overall, char: '◉', phase: Math.PI * 1.5, weight: 1.8 }
    ];
    
    for (let y = 0; y < height; y++) {
        const audioIndex = Math.floor((y / height) * audio.length);
        const localAudio = audio[audioIndex];
        
        // Dynamic amplitude modulation per row
        const yProgress = y / height;
        const audioMod = localAudio + (attack * 0.5);
        const amplitude = amplitudeBase * (0.5 + audioMod);
        
        // Beat-synchronized intensity pulses
        const beatEffect = beat.detected ? beat.intensity * Math.sin(y * 0.2) : 0;
        const finalAmplitude = amplitude + beatEffect * 8;
        
        // Draw multiple helixes with frequency-specific characteristics
        const activeHelixes = [];
        for (let h = 0; h < helixConfigs.length; h++) {
            const config = helixConfigs[h];
            
            // Only draw helix if its frequency band is active enough
            if (config.band > 0.1) {
                const helixPhase = (y * 0.2 * helixSpeed) + (t * helixSpeed) + config.phase + phaseShift;
                const helixAmplitude = finalAmplitude * config.band * config.weight;
                
                const x = Math.floor(width / 2 + Math.sin(helixPhase) * helixAmplitude);
                
                if (x >= 0 && x < width) {
                    let char = config.char;
                    
                    // Character mutations based on audio characteristics
                    if (attack > 0.4 && Math.random() < attack) {
                        const attackChars = ['▲', '▼', '◆', '■', '⬢'];
                        char = attackChars[Math.floor(Math.random() * attackChars.length)];
                    }
                    
                    // Tonal vs noise character selection
                    if (tonality < 0.3 && Math.random() < 0.5) {
                        const noiseChars = ['░', '▒', '▓', '█'];
                        char = noiseChars[Math.floor(Math.random() * noiseChars.length)];
                    }
                    
                    // High-frequency sparkles
                    if (config.band === bands.treble && bands.treble > 0.6) {
                        const sparkleChars = ['✦', '✧', '⋆', '✱'];
                        char = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
                    }
                    
                    buffer[y][x] = char;
                    activeHelixes.push({ x, config });
                }
            }
        }
        
        // Enhanced connection bonds with audio reactivity
        const bondFrequency = Math.max(1, Math.floor(4 - (bands.overall * 3)));
        if (y % bondFrequency === 0 && activeHelixes.length >= 2) {
            // Connect the two most prominent helixes
            activeHelixes.sort((a, b) => b.config.band - a.config.band);
            const helix1 = activeHelixes[0];
            const helix2 = activeHelixes[1];
            
            const minX = Math.min(helix1.x, helix2.x);
            const maxX = Math.max(helix1.x, helix2.x);
            
            for (let x = minX + 1; x < maxX && x < width; x++) {
                let bondChar = '-';
                
                // Audio-reactive bond characters
                if (harmonicContent > 0.6) {
                    const harmonicBonds = ['─', '═', '━'];
                    bondChar = harmonicBonds[Math.floor(harmonicContent * harmonicBonds.length)];
                } else if (bands.bass > 0.7) {
                    const bassBonds = ['▬', '■', '▪'];
                    bondChar = bassBonds[Math.floor(Math.random() * bassBonds.length)];
                }
                
                // Spectral flux creates bond disruptions
                if (spectralFlux > 0.4 && Math.random() < spectralFlux - 0.3) {
                    const disruptBonds = ['≋', '≈', '~', '∼'];
                    bondChar = disruptBonds[Math.floor(Math.random() * disruptBonds.length)];
                }
                
                buffer[y][x] = bondChar;
            }
        }
        
        // Central spine enhancement for strong signals
        if (bands.overall > 0.6) {
            const spineX = Math.floor(width / 2);
            if (spineX >= 0 && spineX < width) {
                const spineIntensity = bands.overall + beatEffect;
                let spineChar;
                
                if (beat.detected) {
                    spineChar = '┃';
                } else if (spineIntensity > 0.8) {
                    spineChar = '║';
                } else if (spineIntensity > 0.6) {
                    spineChar = '│';
                } else {
                    spineChar = '┆';
                }
                
                buffer[y][spineX] = spineChar;
            }
        }
    }
    
    // Add floating genetic markers for high-frequency content
    if (bands.treble > 0.5 || spectralFlux > 0.3) {
        const markerCount = Math.floor((bands.treble + spectralFlux) * 8);
        for (let m = 0; m < markerCount; m++) {
            const markerX = Math.floor(Math.random() * width);
            const markerY = Math.floor(Math.random() * height);
            
            const markerChars = tonality > 0.6 ? ['⚬', '⚭', '⚮', '⚯'] : ['·', '▪', '▫', '□'];
            const markerChar = markerChars[Math.floor(Math.random() * markerChars.length)];
            
            if (buffer[markerY] && buffer[markerY][markerX] === ' ') {
                buffer[markerY][markerX] = markerChar;
            }
        }
    }
};

// ============================================
// CATEGORY 1: Geometric Patterns (10-19)
// ============================================

// Scene 10: HYPER-REACTIVE GEOMETRIC CUBE - Musical Structure Visualizer
CLIFTScenes[10] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const audioInfo = params.audioInfo;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.3, lowMid: 0.3, mid: 0.3, highMid: 0.3, treble: 0.3 };
    const advanced = audioInfo?.advanced || {};
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const energyMomentum = hyperReactive.energyMomentum || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const dropIntensity = hyperReactive.dropIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const rhythmicComplexity = hyperReactive.rhythmicComplexity || 0;
    const grooveStrength = hyperReactive.grooveStrength || 0;
    const harmonicStability = hyperReactive.harmonicStability || 0;
    const spectralEvolution = hyperReactive.spectralEvolution || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // ADAPTIVE CUBE PARAMETERS
    const baseSize = Math.min(width, height) / 4;
    const reactiveSize = baseSize * (1 + (bands.overall * 1.5) + (buildupIntensity * 2));
    const size = Math.min(baseSize * 3, reactiveSize);
    
    // Multi-axis rotation with audio reactivity
    const baseRotationX = time * 0.001;
    const baseRotationY = time * 0.0007;
    const baseRotationZ = time * 0.0005;
    
    // Energy momentum affects rotation speed
    const momentumMultiplier = 1 + (energyMomentum * 3);
    const complexityMultiplier = 1 + (rhythmicComplexity * 2);
    const grooveMultiplier = 1 + (grooveStrength * 1.5);
    
    const angleX = baseRotationX * momentumMultiplier * complexityMultiplier;
    const angleY = baseRotationY * momentumMultiplier * grooveMultiplier;
    const angleZ = baseRotationZ * (1 + spectralEvolution * 4);
    
    // Onset-driven rotation bursts
    const onsetRotationBoost = onsetStrength > 0.5 ? onsetStrength * Math.PI * 0.25 : 0;
    const finalAngleX = angleX + onsetRotationBoost;
    const finalAngleY = angleY + (onsetRotationBoost * 0.7);
    const finalAngleZ = angleZ + (onsetRotationBoost * 0.5);
    
    // Multi-cube system based on musical complexity
    const cubeCount = Math.max(1, Math.floor(1 + (rhythmicComplexity * 3) + (buildupIntensity * 2)));
    
    for (let cubeIndex = 0; cubeIndex < cubeCount; cubeIndex++) {
        const cubeOffset = cubeIndex * 0.3;
        const cubeSizeMultiplier = 1 - (cubeIndex * 0.2);
        const currentSize = size * cubeSizeMultiplier;
        
        // Frequency-specific cube positioning
        const positionOffset = cubeIndex * (bands.overall * 10);
        const cubeX = centerX + Math.sin(time * 0.002 + cubeOffset) * positionOffset;
        const cubeY = centerY + Math.cos(time * 0.002 + cubeOffset) * positionOffset * 0.6;
        
        // Define cube vertices with audio-reactive scaling
        const baseVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        
        // Audio-reactive vertex distortion
        const vertices = baseVertices.map((v, index) => {
            const audioIndex = Math.floor((index / 8) * audio.length);
            const localAudio = audio[audioIndex];
            const distortion = localAudio * 0.3 + (onsetStrength * 0.5);
            
            return [
                v[0] * (1 + distortion * Math.sin(time * 0.003 + index)),
                v[1] * (1 + distortion * Math.cos(time * 0.003 + index)),
                v[2] * (1 + distortion * Math.sin(time * 0.004 + index))
            ];
        });
        
        // Define edges with audio-reactive emphasis
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Front face
            [4, 5], [5, 6], [6, 7], [7, 4], // Back face
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
        ];
        
        // Enhanced rotation with all three axes
        const projected = vertices.map(v => {
            let [x, y, z] = v;
            
            // Rotate around X axis
            let tempY = y * Math.cos(finalAngleX) - z * Math.sin(finalAngleX);
            let tempZ = y * Math.sin(finalAngleX) + z * Math.cos(finalAngleX);
            y = tempY;
            z = tempZ;
            
            // Rotate around Y axis
            let tempX = x * Math.cos(finalAngleY) + z * Math.sin(finalAngleY);
            tempZ = -x * Math.sin(finalAngleY) + z * Math.cos(finalAngleY);
            x = tempX;
            z = tempZ;
            
            // Rotate around Z axis (spectral evolution)
            tempX = x * Math.cos(finalAngleZ) - y * Math.sin(finalAngleZ);
            tempY = x * Math.sin(finalAngleZ) + y * Math.cos(finalAngleZ);
            x = tempX;
            y = tempY;
            
            // Project to 2D with audio-reactive perspective
            const perspective = 3 + (harmonicStability * 2);
            const scale = currentSize / (z + perspective);
            
            return [
                Math.floor(cubeX + x * scale),
                Math.floor(cubeY + y * scale),
                z // Keep Z for depth sorting
            ];
        });
        
        // Sort edges by depth for proper rendering
        const edgesWithDepth = edges.map(edge => {
            const [i, j] = edge;
            const avgZ = (projected[i][2] + projected[j][2]) / 2;
            return { edge, depth: avgZ };
        });
        edgesWithDepth.sort((a, b) => a.depth - b.depth);
        
        // Draw edges with audio-reactive styling
        edgesWithDepth.forEach(({ edge }, edgeIndex) => {
            const [i, j] = edge;
            const edgeIntensity = (edgeIndex / edges.length) + (bands.overall * 0.5);
            
            let edgeChar;
            if (onsetType === 'percussive' && beat.detected) {
                edgeChar = ['█', '▉', '▊', '▋'][Math.floor(Math.random() * 4)];
            } else if (onsetType === 'harmonic' && harmonicStability > 0.7) {
                edgeChar = ['═', '║', '╬', '╪'][Math.floor(edgeIntensity * 4)];
            } else if (climaxProbability > 0.8) {
                edgeChar = ['⚡', '※', '⁂', '✦'][Math.floor(Math.random() * 4)];
            } else if (buildupIntensity > 0.6) {
                edgeChar = ['╱', '╲', '╳', '╫'][Math.floor(edgeIntensity * 4)];
            } else if (dropIntensity > 0.5) {
                edgeChar = ['▼', '▽', '⯇', '⊽'][Math.floor(Math.random() * 4)];
            } else {
                // Standard edge characters with intensity
                if (edgeIntensity > 0.8) edgeChar = '█';
                else if (edgeIntensity > 0.6) edgeChar = '▓';
                else if (edgeIntensity > 0.4) edgeChar = '▒';
                else if (edgeIntensity > 0.2) edgeChar = '░';
                else edgeChar = cubeIndex === 0 ? '#' : ':';
            }
            
            drawLine(buffer, projected[i][0], projected[i][1], 
                    projected[j][0], projected[j][1], edgeChar);
        });
        
        // Draw vertices with enhanced audio reactivity
        projected.forEach((p, vertexIndex) => {
            if (p[0] >= 0 && p[0] < width && p[1] >= 0 && p[1] < height) {
                const audioIndex = Math.floor((vertexIndex / 8) * audio.length);
                const vertexIntensity = audio[audioIndex] + (bands.overall * 0.3);
                
                let vertexChar;
                if (beat.detected && beat.intensity > 0.7) {
                    vertexChar = ['●', '◉', '⚫', '⚪'][Math.floor(Math.random() * 4)];
                } else if (onsetStrength > 0.6) {
                    vertexChar = ['◆', '◇', '⬢', '⬣'][Math.floor(vertexIntensity * 4)];
                } else if (vertexIntensity > 0.7) {
                    vertexChar = '@';
                } else if (vertexIntensity > 0.5) {
                    vertexChar = '●';
                } else if (vertexIntensity > 0.3) {
                    vertexChar = '○';
                } else {
                    vertexChar = cubeIndex === 0 ? '@' : '·';
                }
                
                buffer[p[1]][p[0]] = vertexChar;
            }
        });
    }
    
    // Musical structure visualization overlay
    // Buildup: ascending triangular indicators
    if (buildupIntensity > 0.4) {
        const buildupHeight = Math.floor(buildupIntensity * height * 0.3);
        for (let i = 0; i < buildupHeight; i++) {
            const x = Math.floor(centerX + (i - buildupHeight/2));
            const y = height - 1 - i;
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '▲';
            }
        }
    }
    
    // Drop: explosive burst from center
    if (dropIntensity > 0.5) {
        const burstRadius = Math.floor(dropIntensity * 15);
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            for (let r = 0; r < burstRadius; r += 2) {
                const x = Math.floor(centerX + Math.cos(angle) * r);
                const y = Math.floor(centerY + Math.sin(angle) * r * 0.6);
                if (x >= 0 && x < width && y >= 0 && y < height && Math.random() < dropIntensity) {
                    buffer[y][x] = ['*', '✦', '⚡', '※'][Math.floor(Math.random() * 4)];
                }
            }
        }
    }
    
    // Climax: screen-wide energy field
    if (climaxProbability > 0.8) {
        const fieldDensity = (climaxProbability - 0.7) * 50;
        for (let i = 0; i < fieldDensity; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (buffer[y][x] === ' ') {
                const climaxChars = ['✧', '⋆', '✱', '※', '⁂'];
                buffer[y][x] = climaxChars[Math.floor(Math.random() * climaxChars.length)];
            }
        }
    }
};

// Scene 11: Fractal Tree
CLIFTScenes[11] = function(buffer, width, height, time, params) {
    const t = time * 0.0005;
    
    function drawBranch(x, y, angle, length, depth) {
        if (depth <= 0 || length < 1) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        drawLine(buffer, Math.floor(x), Math.floor(y), 
                Math.floor(endX), Math.floor(endY), 
                depth > 3 ? '#' : (depth > 1 ? '+' : '.'));
        
        // Recursive branches
        const angleVariation = Math.sin(t + depth) * 0.5;
        drawBranch(endX, endY, angle - 0.4 + angleVariation, length * 0.7, depth - 1);
        drawBranch(endX, endY, angle + 0.4 + angleVariation, length * 0.7, depth - 1);
    }
    
    // Draw tree
    const startX = width / 2;
    const startY = height - 1;
    drawBranch(startX, startY, -Math.PI / 2, height / 3, 8);
};

// Scene 12: Plasma Effect
CLIFTScenes[12] = function(buffer, width, height, time, params) {
    const chars = ' .:-=+*#%@';
    const t = time * 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = 
                Math.sin(x / 10.0 + t) +
                Math.sin(y / 8.0 + t * 1.5) +
                Math.sin((x + y) / 12.0 + t * 0.5) +
                Math.sin(Math.sqrt(x * x + y * y) / 8.0);
                
            const index = Math.floor((value + 4) / 8 * chars.length);
            buffer[y][x] = chars[Math.max(0, Math.min(chars.length - 1, index))];
        }
    }
};

// Scene 13: Spirograph
CLIFTScenes[13] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    const R = Math.min(width, height) / 3;
    const r = R / 3;
    const d = R / 2;
    
    for (let angle = 0; angle < Math.PI * 20; angle += 0.05) {
        const x = (R - r) * Math.cos(angle + t) + d * Math.cos((R - r) / r * angle + t);
        const y = (R - r) * Math.sin(angle + t) - d * Math.sin((R - r) / r * angle + t);
        
        const px = Math.floor(centerX + x);
        const py = Math.floor(centerY + y * 0.5);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = '#';
        }
    }
};

// Scene 14: Grid Deformation
CLIFTScenes[14] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const gridSize = 4;
    
    for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
            // Calculate deformation
            const dx = Math.sin(y * 0.1 + t) * 3;
            const dy = Math.cos(x * 0.1 + t) * 2;
            
            const newX = Math.floor(x + dx);
            const newY = Math.floor(y + dy);
            
            // Draw grid point
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                buffer[newY][newX] = '+';
                
                // Connect to neighbors
                if (x + gridSize < width) {
                    const nextX = Math.floor(x + gridSize + Math.sin(y * 0.1 + t) * 3);
                    const nextY = Math.floor(y + Math.cos((x + gridSize) * 0.1 + t) * 2);
                    drawLine(buffer, newX, newY, nextX, nextY, '-');
                }
                if (y + gridSize < height) {
                    const nextX = Math.floor(x + Math.sin((y + gridSize) * 0.1 + t) * 3);
                    const nextY = Math.floor(y + gridSize + Math.cos(x * 0.1 + t) * 2);
                    drawLine(buffer, newX, newY, nextX, nextY, '|');
                }
            }
        }
    }
};

// Scene 15: HYPER-REACTIVE SIERPINSKI TRIANGLE - Fractal Music Visualizer
CLIFTScenes[15] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const audioInfo = params.audioInfo;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.3, lowMid: 0.3, mid: 0.3, highMid: 0.3, treble: 0.3 };
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const rhythmicComplexity = hyperReactive.rhythmicComplexity || 0;
    const harmonicStability = hyperReactive.harmonicStability || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const complexityIndex = hyperReactive.complexityIndex || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const spectralEvolution = hyperReactive.spectralEvolution || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // ADAPTIVE FRACTAL PARAMETERS
    const baseSize = Math.min(width, height) - 4;
    const reactiveSize = baseSize * (1 + (bands.overall * 0.5) + (buildupIntensity * 0.8));
    const size = Math.min(baseSize * 1.5, Math.floor(reactiveSize));
    const offsetX = (width - size) / 2;
    const offsetY = 2;
    
    // Multi-scale fractal system based on complexity
    const fractalLevels = Math.max(1, Math.floor(1 + (complexityIndex * 3) + (rhythmicComplexity * 2)));
    
    for (let level = 0; level < fractalLevels; level++) {
        const levelSize = size * (1 - level * 0.2);
        const levelOffsetX = offsetX + (level * 5);
        const levelOffsetY = offsetY + (level * 3);
        
        // Frequency-band specific scaling for each level
        const bandIndex = level % 5;
        const bandValues = [bands.bass, bands.lowMid, bands.mid, bands.highMid, bands.treble];
        const levelIntensity = bandValues[bandIndex];
        
        // Dynamic iteration depth based on audio complexity
        const maxIterations = Math.floor(levelSize * (0.5 + levelIntensity + (complexityIndex * 0.5)));
        
        for (let y = 0; y < maxIterations && y < height - levelOffsetY; y++) {
            for (let x = 0; x <= y && x < levelSize; x++) {
                // Enhanced Sierpinski condition with audio modulation
                const sierpinskiCondition = (x & y) === x;
                const audioMod = y < audio.length ? audio[y] : audio[y % audio.length];
                const audioCondition = audioMod > (0.3 - levelIntensity * 0.2);
                
                if (sierpinskiCondition && audioCondition) {
                    const px = Math.floor(levelOffsetX + (levelSize / 2) - y / 2 + x);
                    const py = levelOffsetY + y;
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        let char;
                        
                        // Character selection based on musical characteristics
                        const position = (x + y) / Math.max(1, levelSize + y);
                        const audioIntensity = audioMod + levelIntensity;
                        
                        if (climaxProbability > 0.8 && Math.random() < climaxProbability - 0.7) {
                            // Climax explosion characters
                            const climaxChars = ['⚡', '✦', '※', '⁂', '⋆'];
                            char = climaxChars[Math.floor(Math.random() * climaxChars.length)];
                        } else if (onsetType === 'percussive' && beat.detected) {
                            // Percussive beat characters
                            const percChars = ['█', '▉', '▊', '▋', '■', '●'];
                            char = percChars[Math.floor(audioIntensity * (percChars.length - 1))];
                        } else if (onsetType === 'harmonic' && harmonicStability > 0.7) {
                            // Harmonic structure characters
                            const harmChars = ['◆', '◇', '⬢', '⬣', '♦', '♢'];
                            char = harmChars[Math.floor(position * (harmChars.length - 1))];
                        } else if (buildupIntensity > 0.5) {
                            // Buildup intensity scaling
                            const buildupChars = ['▲', '△', '⯅', '▴', '▵'];
                            char = buildupChars[Math.floor(buildupIntensity * (buildupChars.length - 1))];
                        } else if (rhythmicComplexity > 0.6) {
                            // Complex rhythmic patterns
                            const complexChars = ['╱', '╲', '╳', '╫', '╪', '╬'];
                            char = complexChars[Math.floor((x * y + level) % complexChars.length)];
                        } else {
                            // Standard intensity-based characters
                            if (audioIntensity > 0.8) char = '█';
                            else if (audioIntensity > 0.6) char = '▓';
                            else if (audioIntensity > 0.4) char = '▒';
                            else if (audioIntensity > 0.2) char = '░';
                            else char = level === 0 ? '#' : ':';
                        }
                        
                        // Spectral evolution effects
                        if (spectralEvolution > 0.5 && Math.random() < spectralEvolution - 0.4) {
                            const evolutionChars = ['~', '≈', '≋', '∼', '⩰'];
                            char = evolutionChars[Math.floor(Math.random() * evolutionChars.length)];
                        }
                        
                        buffer[py][px] = char;
                        
                        // Onset-triggered particle emissions
                        if (onsetStrength > 0.6 && Math.random() < (onsetStrength - 0.5) * 2) {
                            const particleOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]];
                            const offset = particleOffsets[Math.floor(Math.random() * particleOffsets.length)];
                            const particleX = px + offset[0];
                            const particleY = py + offset[1];
                            
                            if (particleX >= 0 && particleX < width && particleY >= 0 && particleY < height) {
                                const particleChars = ['·', '◦', '∘', '⚬', '⚭'];
                                buffer[particleY][particleX] = particleChars[Math.floor(Math.random() * particleChars.length)];
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Musical structure overlays
    // Harmonic resonance field
    if (harmonicStability > 0.8) {
        const resonanceLines = Math.floor((harmonicStability - 0.7) * 20);
        for (let i = 0; i < resonanceLines; i++) {
            const lineY = Math.floor((i / resonanceLines) * height);
            for (let x = 0; x < width; x += 3) {
                if (buffer[lineY] && buffer[lineY][x] === ' ') {
                    buffer[lineY][x] = '─';
                }
            }
        }
    }
    
    // Complexity explosion overlay
    if (complexityIndex > 0.8) {
        const explosionCount = Math.floor((complexityIndex - 0.7) * 15);
        for (let i = 0; i < explosionCount; i++) {
            const centerX = Math.floor(Math.random() * width);
            const centerY = Math.floor(Math.random() * height);
            const radius = Math.floor(complexityIndex * 6);
            
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                for (let r = 1; r <= radius; r++) {
                    const x = Math.floor(centerX + Math.cos(angle) * r);
                    const y = Math.floor(centerY + Math.sin(angle) * r * 0.6);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height && 
                        buffer[y][x] === ' ' && Math.random() < complexityIndex - 0.7) {
                        const explosionChars = ['*', '×', '+', '⋆', '✦'];
                        buffer[y][x] = explosionChars[Math.floor(Math.random() * explosionChars.length)];
                    }
                }
            }
        }
    }
    
    // Beat pulse borders
    if (beat.detected && beat.intensity > 0.5) {
        const pulseIntensity = beat.intensity;
        const borderChar = pulseIntensity > 0.8 ? '═' : '─';
        
        // Top and bottom borders
        for (let x = 0; x < width; x += 2) {
            if (Math.random() < pulseIntensity) {
                if (buffer[0]) buffer[0][x] = borderChar;
                if (buffer[height - 1]) buffer[height - 1][x] = borderChar;
            }
        }
        
        // Left and right borders
        for (let y = 0; y < height; y += 2) {
            if (Math.random() < pulseIntensity) {
                if (buffer[y]) {
                    buffer[y][0] = '║';
                    buffer[y][width - 1] = '║';
                }
            }
        }
    }
};

// Scene 16: Lissajous Curves
CLIFTScenes[16] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    const a = 3 + Math.sin(t * 0.1);
    const b = 4 + Math.cos(t * 0.1);
    const delta = t;
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
        const x = Math.sin(a * angle + delta) * (width / 2 - 2);
        const y = Math.sin(b * angle) * (height / 2 - 2);
        
        const px = Math.floor(centerX + x);
        const py = Math.floor(centerY + y);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = '@';
        }
    }
};

// Scene 17: Pentagon Star
CLIFTScenes[17] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 2;
    const t = time * 0.001;
    
    // Draw multiple rotating pentagons
    for (let p = 0; p < 5; p++) {
        const offset = (p / 5) * Math.PI * 2;
        const points = [];
        
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + t + offset;
            const r = radius * (0.3 + p * 0.15);
            points.push([
                Math.floor(centerX + Math.cos(angle) * r),
                Math.floor(centerY + Math.sin(angle) * r * 0.8)
            ]);
        }
        
        // Connect points to form star
        for (let i = 0; i < 5; i++) {
            drawLine(buffer, points[i][0], points[i][1], 
                    points[(i + 2) % 5][0], points[(i + 2) % 5][1], 
                    p === 0 ? '@' : (p < 3 ? '#' : '+'));
        }
    }
};

// Scene 18: Hexagonal Grid
CLIFTScenes[18] = function(buffer, width, height, time, params) {
    const hexSize = 4;
    const t = time * 0.001;
    
    for (let row = 0; row < height / (hexSize * 1.5); row++) {
        for (let col = 0; col < width / (hexSize * 2); col++) {
            const x = col * hexSize * 2 + (row % 2) * hexSize;
            const y = row * hexSize * 1.5;
            
            // Pulsing based on distance from center
            const dx = x - width / 2;
            const dy = y - height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pulse = Math.sin(dist * 0.1 - t * 3) > 0;
            
            if (pulse) {
                // Draw hexagon
                const angles = [0, 60, 120, 180, 240, 300].map(a => a * Math.PI / 180);
                for (let i = 0; i < 6; i++) {
                    const x1 = Math.floor(x + Math.cos(angles[i]) * hexSize);
                    const y1 = Math.floor(y + Math.sin(angles[i]) * hexSize * 0.6);
                    const x2 = Math.floor(x + Math.cos(angles[(i + 1) % 6]) * hexSize);
                    const y2 = Math.floor(y + Math.sin(angles[(i + 1) % 6]) * hexSize * 0.6);
                    
                    drawLine(buffer, x1, y1, x2, y2, '#');
                }
            }
        }
    }
};

// Scene 19: Moire Pattern
CLIFTScenes[19] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Two overlapping circular patterns
            const dist1 = Math.sqrt(Math.pow(x - width / 3, 2) + Math.pow(y - height / 2, 2));
            const dist2 = Math.sqrt(Math.pow(x - width * 2 / 3, 2) + Math.pow(y - height / 2, 2));
            
            const wave1 = Math.sin(dist1 * 0.5 - t) * 0.5 + 0.5;
            const wave2 = Math.sin(dist2 * 0.5 + t) * 0.5 + 0.5;
            
            const combined = (wave1 + wave2) / 2;
            const charIndex = Math.floor(combined * (chars.length - 1));
            
            buffer[y][x] = chars[charIndex];
        }
    }
};

// ============================================
// CATEGORY 2: Advanced Audio Reactive (20-29)
// ============================================

// Scene 20: HYPER-REACTIVE SPECTRAL FIRE - Musical Flame Engine
CLIFTScenes[20] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.2, lowMid: 0.2, mid: 0.2, highMid: 0.2, treble: 0.2 };
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const energyMomentum = hyperReactive.energyMomentum || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const dropIntensity = hyperReactive.dropIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const emotionalIntensity = hyperReactive.emotionalIntensity || 0;
    const grooveStrength = hyperReactive.grooveStrength || 0;
    const surpriseLevel = hyperReactive.surpriseLevel || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // Initialize multi-layer fire system
    if (!params._fireBuffer) {
        params._fireBuffer = [];
        params._fireVelocity = [];
        params._fireTemperature = [];
        params._fireAge = [];
        
        for (let y = 0; y < height; y++) {
            params._fireBuffer[y] = new Float32Array(width);
            params._fireVelocity[y] = new Float32Array(width);
            params._fireTemperature[y] = new Float32Array(width);
            params._fireAge[y] = new Float32Array(width);
        }
    }
    
    const fire = params._fireBuffer;
    const velocity = params._fireVelocity;
    const temperature = params._fireTemperature;
    const age = params._fireAge;
    
    // Multi-character set system based on musical characteristics
    const standardChars = ' .:-=+*#%@';
    const bassChars = ' ░▒▓█▉▊▋▌▍▎▏';
    const harmonicChars = ' ◦∘○●◉⚫⚪◎';
    const percussiveChars = ' ·▪▫■□▬▭▮▯';
    const climaxChars = ' ✦✧⋆★☆※⁂⚡';
    const buildupChars = ' ▁▂▃▄▅▆▇█';
    const dropChars = ' ▔▓▒░ ░▒▓▔';
    
    // ENHANCED AUDIO-REACTIVE SEEDING
    for (let x = 0; x < width; x++) {
        const freqIndex = Math.floor((x / width) * audio.length);
        const audioLevel = audio[freqIndex] || 0.2;
        
        // Frequency-specific band energy
        const bandEnergy = x < width * 0.2 ? bands.bass :
                          x < width * 0.4 ? bands.lowMid :
                          x < width * 0.6 ? bands.mid :
                          x < width * 0.8 ? bands.highMid : bands.treble;
        
        // Base fire intensity with multiple factors
        let baseIntensity = audioLevel * (1 + bandEnergy);
        
        // Energy momentum amplification
        baseIntensity *= (1 + Math.abs(energyMomentum) * 2);
        
        // Onset strength boost
        if (onsetStrength > 0.4) {
            baseIntensity *= (1 + onsetStrength * 3);
        }
        
        // Beat synchronization
        if (beat.detected) {
            baseIntensity *= (1 + beat.intensity * 2);
        }
        
        // Musical structure amplification
        if (buildupIntensity > 0.3) {
            baseIntensity *= (1 + buildupIntensity * 1.5);
        }
        
        if (climaxProbability > 0.7) {
            baseIntensity *= (1 + (climaxProbability - 0.6) * 4);
        }
        
        // Surprise burst injection
        if (surpriseLevel > 0.6 && Math.random() < (surpriseLevel - 0.5) * 2) {
            baseIntensity *= (1 + surpriseLevel * 3);
        }
        
        // Apply to fire system
        const finalIntensity = Math.min(2.0, baseIntensity + Math.random() * 0.3);
        fire[height - 1][x] = finalIntensity;
        velocity[height - 1][x] = finalIntensity * 0.5;
        temperature[height - 1][x] = finalIntensity;
        age[height - 1][x] = 0;
    }
    
    // ENHANCED FIRE PROPAGATION WITH AUDIO PHYSICS
    for (let y = height - 2; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            // Multi-factor decay calculation
            let baseDecay = 0.95;
            
            // Audio-reactive decay modulation
            baseDecay -= bands.overall * 0.08; // Higher energy = slower decay
            baseDecay += dropIntensity * 0.15; // Drops extinguish fire faster
            baseDecay -= grooveStrength * 0.05; // Groove sustains fire
            
            // Onset-driven turbulence
            const turbulence = onsetStrength > 0.3 ? onsetStrength * 0.2 : 0;
            
            // Wind effects from spectral evolution
            const wind = (hyperReactive.spectralEvolution || 0) * 0.3;
            
            // Enhanced neighbor sampling with wind and turbulence
            let sum = 0;
            let tempSum = 0;
            let velSum = 0;
            let count = 0;
            
            const sampleRadius = Math.floor(1 + turbulence * 3);
            for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
                const nx = x + dx + Math.floor(wind * 2 * Math.sin(y * 0.1));
                if (nx >= 0 && nx < width) {
                    const weight = 1 / (1 + Math.abs(dx));
                    sum += fire[y + 1][nx] * weight;
                    tempSum += temperature[y + 1][nx] * weight;
                    velSum += velocity[y + 1][nx] * weight;
                    count += weight;
                }
            }
            
            if (count > 0) {
                // Update fire properties
                fire[y][x] = (sum / count) * baseDecay;
                temperature[y][x] = (tempSum / count) * (baseDecay + 0.02);
                velocity[y][x] = (velSum / count) * 0.9;
                age[y][x] = age[y + 1][x] + 1;
                
                // Add chaos and turbulence
                const chaos = (Math.random() - 0.5) * 0.1 * (1 + turbulence);
                fire[y][x] += chaos;
                
                // Emotional intensity injection at mid-levels
                if (y > height * 0.3 && y < height * 0.7 && emotionalIntensity > 0.6) {
                    fire[y][x] *= (1 + (emotionalIntensity - 0.5) * 0.8);
                }
                
                // Clamp values
                fire[y][x] = Math.max(0, Math.min(2.0, fire[y][x]));
                temperature[y][x] = Math.max(0, Math.min(2.0, temperature[y][x]));
            }
        }
    }
    
    // ENHANCED RENDERING WITH MUSICAL CHARACTER SELECTION
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const intensity = Math.max(0, Math.min(1, fire[y][x] * 0.5)); // Scale down for 0-1 range
            const temp = temperature[y][x] * 0.5;
            const vel = velocity[y][x] * 0.5;
            
            let chars = standardChars;
            let charIndex = Math.floor(intensity * (chars.length - 1));
            
            // Musical character set selection
            if (climaxProbability > 0.8 && intensity > 0.3) {
                chars = climaxChars;
                charIndex = Math.floor((intensity + climaxProbability - 0.7) * (chars.length - 1));
            } else if (onsetType === 'percussive' && beat.detected && intensity > 0.2) {
                chars = percussiveChars;
                charIndex = Math.floor((intensity + beat.intensity) * (chars.length - 1) * 0.5);
            } else if (onsetType === 'harmonic' && temp > 0.5) {
                chars = harmonicChars;
                charIndex = Math.floor((temp + intensity) * (chars.length - 1) * 0.5);
            } else if (buildupIntensity > 0.5 && y < height * (1 - buildupIntensity)) {
                chars = buildupChars;
                charIndex = Math.floor(buildupIntensity * intensity * (chars.length - 1));
            } else if (dropIntensity > 0.4 && y > height * 0.5) {
                chars = dropChars;
                charIndex = Math.floor(dropIntensity * (chars.length - 1));
            } else if (bands.bass > 0.6 && x < width * 0.3) {
                chars = bassChars;
                charIndex = Math.floor((bands.bass + intensity) * (chars.length - 1) * 0.5);
            }
            
            // Ensure valid character index
            charIndex = Math.max(0, Math.min(chars.length - 1, charIndex));
            buffer[y][x] = chars[charIndex];
            
            // Special effect overlays
            // Onset sparks
            if (onsetStrength > 0.7 && Math.random() < (onsetStrength - 0.6) * 5 && intensity > 0.4) {
                const sparkChars = ['*', '✦', '⚡', '※', '⁂'];
                buffer[y][x] = sparkChars[Math.floor(Math.random() * sparkChars.length)];
            }
            
            // Surprise explosions
            if (surpriseLevel > 0.7 && Math.random() < (surpriseLevel - 0.6) * 3) {
                const explosionChars = ['◉', '⚫', '●', '◎', '○'];
                buffer[y][x] = explosionChars[Math.floor(Math.random() * explosionChars.length)];
            }
            
            // Groove pulse effects
            if (grooveStrength > 0.8 && Math.sin(time * 0.01) > 0.7 && intensity > 0.5) {
                buffer[y][x] = '▬';
            }
        }
    }
    
    // Musical structure overlays
    // Energy momentum indicators
    if (Math.abs(energyMomentum) > 0.3) {
        const momentumChar = energyMomentum > 0 ? '↑' : '↓';
        const arrowCount = Math.floor(Math.abs(energyMomentum) * 10);
        
        for (let i = 0; i < arrowCount && i < width; i++) {
            const x = Math.floor((i / arrowCount) * width);
            const y = energyMomentum > 0 ? height - 3 : 2;
            if (y >= 0 && y < height && buffer[y][x] === ' ') {
                buffer[y][x] = momentumChar;
            }
        }
    }
    
    // Climax fire tornado
    if (climaxProbability > 0.9) {
        const centerX = Math.floor(width / 2);
        const tornadoHeight = Math.floor((climaxProbability - 0.8) * height);
        
        for (let i = 0; i < tornadoHeight; i++) {
            const y = height - 1 - i;
            const radius = Math.floor((i / tornadoHeight) * 8);
            const angle = i * 0.2 + time * 0.001;
            
            for (let r = 0; r <= radius; r++) {
                const x = Math.floor(centerX + Math.cos(angle) * r);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = ['⚡', '※', '⁂', '★', '☆'][Math.floor(Math.random() * 5)];
                }
            }
        }
    }
};

// Scene 21: Audio Tunnel
CLIFTScenes[21] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    // Calculate average audio level
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2; // Aspect ratio correction
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Tunnel depth with audio modulation
            const z = (t * 10 + dist * 0.5) % 20;
            const radius = z * (1 + avgAudio);
            
            // Audio affects tunnel shape
            const audioAngle = Math.floor((angle + Math.PI) / (Math.PI * 2) * audio.length);
            const audioMod = audio[audioAngle % audio.length] || 0.3;
            
            // Create tunnel rings
            const ring = Math.sin(z - t * 5) * audioMod;
            
            if (Math.abs(dist - radius) < 2 + ring * 5) {
                const brightness = 1 - z / 20;
                if (brightness > 0.7) buffer[y][x] = '@';
                else if (brightness > 0.4) buffer[y][x] = '#';
                else if (brightness > 0.2) buffer[y][x] = '+';
                else buffer[y][x] = '.';
            }
        }
    }
};

// Scene 22: Audio Constellation
CLIFTScenes[22] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.1);
    
    // Initialize stars
    if (!params._stars) {
        params._stars = [];
        for (let i = 0; i < 50; i++) {
            params._stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                brightness: Math.random(),
                audioIndex: Math.floor(Math.random() * audio.length)
            });
        }
    }
    
    const stars = params._stars;
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    
    // Update and draw stars
    stars.forEach((star, i) => {
        // Audio affects star brightness
        const audioBrightness = audio[star.audioIndex] || 0.1;
        star.brightness = 0.3 + audioBrightness * 0.7;
        
        // Draw star
        const x = Math.floor(star.x);
        const y = Math.floor(star.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (star.brightness > 0.8) buffer[y][x] = '*';
            else if (star.brightness > 0.5) buffer[y][x] = '+';
            else buffer[y][x] = '.';
        }
    });
    
    // Connect nearby stars when audio is high
    if (avgAudio > 0.3) {
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[j].x - stars[i].x;
                const dy = stars[j].y - stars[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 15 * avgAudio) {
                    const brightness = (stars[i].brightness + stars[j].brightness) / 2;
                    if (brightness > 0.5) {
                        drawLine(buffer, 
                            Math.floor(stars[i].x), Math.floor(stars[i].y),
                            Math.floor(stars[j].x), Math.floor(stars[j].y),
                            '.');
                    }
                }
            }
        }
    }
};

// Scene 23: Audio Radar
CLIFTScenes[23] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 2;
    const t = time * 0.001;
    
    // Radar sweep
    const sweepAngle = (t * 2) % (Math.PI * 2);
    
    // Draw circular grid
    for (let r = 5; r < maxRadius; r += 5) {
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const x = Math.floor(centerX + Math.cos(angle) * r);
            const y = Math.floor(centerY + Math.sin(angle) * r * 0.5);
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '.';
            }
        }
    }
    
    // Draw radar sweep with audio visualization
    for (let r = 0; r < maxRadius; r++) {
        const x = Math.floor(centerX + Math.cos(sweepAngle) * r);
        const y = Math.floor(centerY + Math.sin(sweepAngle) * r * 0.5);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '#';
        }
    }
    
    // Audio blips
    for (let i = 0; i < audio.length; i++) {
        const angle = (i / audio.length) * Math.PI * 2;
        const audioValue = audio[i] || 0.2;
        
        if (audioValue > 0.3) {
            const r = 10 + audioValue * (maxRadius - 10);
            const x = Math.floor(centerX + Math.cos(angle) * r);
            const y = Math.floor(centerY + Math.sin(angle) * r * 0.5);
            
            // Draw blip with fade based on sweep position
            const angleDiff = Math.abs(angle - sweepAngle);
            const fade = Math.max(0, 1 - angleDiff / Math.PI);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                if (fade > 0.5 || audioValue > 0.6) {
                    buffer[y][x] = '@';
                    // Echo effect
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let da = -0.1; da <= 0.1; da += 0.1) {
                            const ex = Math.floor(centerX + Math.cos(angle + da) * (r + dr));
                            const ey = Math.floor(centerY + Math.sin(angle + da) * (r + dr) * 0.5);
                            if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                                if (buffer[ey][ex] === ' ') buffer[ey][ex] = '+';
                            }
                        }
                    }
                }
            }
        }
    }
};

// Scene 24: Audio Waterfall
CLIFTScenes[24] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Initialize waterfall buffer
    if (!params._waterfall) {
        params._waterfall = [];
        for (let y = 0; y < height; y++) {
            params._waterfall[y] = new Float32Array(width);
        }
    }
    
    const waterfall = params._waterfall;
    
    // Shift waterfall down
    for (let y = height - 1; y > 0; y--) {
        for (let x = 0; x < width; x++) {
            waterfall[y][x] = waterfall[y - 1][x] * 0.95;
        }
    }
    
    // Add new audio data at top
    for (let x = 0; x < width; x++) {
        const audioIndex = Math.floor((x / width) * audio.length);
        waterfall[0][x] = audio[audioIndex] || 0.3;
    }
    
    // Apply some horizontal flow
    for (let y = 1; y < height; y++) {
        for (let x = 1; x < width - 1; x++) {
            const flow = Math.sin(time * 0.002 + y * 0.5) * 0.1;
            const flowIndex = x + Math.floor(flow * 3);
            if (flowIndex >= 0 && flowIndex < width) {
                waterfall[y][x] = (waterfall[y][x] + waterfall[y - 1][flowIndex] * 0.3) / 1.3;
            }
        }
    }
    
    // Render waterfall
    const chars = ' ░▒▓█';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const intensity = waterfall[y][x];
            const charIndex = Math.floor(intensity * (chars.length - 1));
            buffer[y][x] = chars[Math.max(0, Math.min(chars.length - 1, charIndex))];
        }
    }
};

// Scene 25: Audio Lightning
CLIFTScenes[25] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.1);
    
    // Initialize lightning state
    if (!params._lightning) {
        params._lightning = {
            bolts: [],
            lastStrike: 0
        };
    }
    
    const lightning = params._lightning;
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    const bass = (audio[0] + audio[1] + audio[2]) / 3 || 0.1;
    
    // Trigger new lightning on bass hits
    if (bass > 0.6 && time - lightning.lastStrike > 200) {
        lightning.lastStrike = time;
        lightning.bolts.push({
            x: Math.random() * width,
            y: 0,
            branches: [],
            life: 1.0,
            mainAngle: Math.PI / 2 + (Math.random() - 0.5) * 0.5
        });
        
        // Generate branches
        const bolt = lightning.bolts[lightning.bolts.length - 1];
        let currentX = bolt.x;
        let currentY = bolt.y;
        
        while (currentY < height) {
            bolt.branches.push({ x: currentX, y: currentY });
            currentY += 1;
            currentX += (Math.random() - 0.5) * 3 + Math.sin(currentY * 0.3) * 2;
            
            // Sub-branches
            if (Math.random() < 0.3 * avgAudio) {
                const subLength = Math.random() * 10 + 5;
                const subAngle = (Math.random() - 0.5) * Math.PI;
                const subBranch = [];
                let subX = currentX;
                let subY = currentY;
                
                for (let i = 0; i < subLength; i++) {
                    subX += Math.cos(subAngle) * 2;
                    subY += Math.sin(subAngle) * 0.5;
                    subBranch.push({ x: subX, y: subY });
                }
                bolt.branches.push(...subBranch);
            }
        }
    }
    
    // Update and draw lightning
    for (let i = lightning.bolts.length - 1; i >= 0; i--) {
        const bolt = lightning.bolts[i];
        bolt.life -= 0.05;
        
        if (bolt.life <= 0) {
            lightning.bolts.splice(i, 1);
            continue;
        }
        
        // Draw bolt
        bolt.branches.forEach(point => {
            const x = Math.floor(point.x);
            const y = Math.floor(point.y);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                if (bolt.life > 0.8) buffer[y][x] = '#';
                else if (bolt.life > 0.5) buffer[y][x] = '+';
                else buffer[y][x] = '.';
                
                // Glow effect
                for (let dx = -1; dx <= 1; dx++) {
                    const gx = x + dx;
                    if (gx >= 0 && gx < width && buffer[y][gx] === ' ') {
                        buffer[y][gx] = '.';
                    }
                }
            }
        });
    }
    
    // Background rain effect
    const rainDensity = avgAudio * 0.5;
    for (let i = 0; i < width * rainDensity; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        if (buffer[y][x] === ' ') {
            buffer[y][x] = Math.random() < 0.5 ? '|' : '.';
        }
    }
};

// Scene 26: Audio Vortex
CLIFTScenes[26] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Audio affects vortex parameters
            const audioIndex = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * audio.length);
            const audioValue = audio[audioIndex % audio.length] || 0.3;
            
            // Spiral equation with audio modulation
            const spiralAngle = angle + dist * 0.1 - t * 3;
            const spiralRadius = dist * (0.5 + audioValue);
            
            // Multiple spiral arms
            const arms = 3 + Math.floor(audioValue * 3);
            const armAngle = (spiralAngle * arms) % (Math.PI * 2);
            
            // Create vortex pattern
            const intensity = Math.sin(armAngle) * Math.exp(-dist / 30) * (0.5 + audioValue);
            
            if (intensity > 0.6) buffer[y][x] = '@';
            else if (intensity > 0.4) buffer[y][x] = '#';
            else if (intensity > 0.2) buffer[y][x] = '+';
            else if (intensity > 0.1) buffer[y][x] = '.';
        }
    }
};

// Scene 27: Audio Cityscape
CLIFTScenes[27] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Initialize buildings
    if (!params._buildings) {
        params._buildings = [];
        let x = 0;
        while (x < width) {
            const buildingWidth = Math.floor(Math.random() * 8 + 4);
            const audioIndex = Math.floor((x / width) * audio.length);
            params._buildings.push({
                x: x,
                width: buildingWidth,
                baseHeight: Math.floor(Math.random() * height * 0.5 + height * 0.3),
                audioIndex: audioIndex,
                windows: []
            });
            
            // Generate window pattern
            const building = params._buildings[params._buildings.length - 1];
            for (let wx = 1; wx < buildingWidth - 1; wx += 2) {
                for (let wy = 2; wy < building.baseHeight - 1; wy += 3) {
                    building.windows.push({ x: wx, y: wy, lit: Math.random() > 0.3 });
                }
            }
            
            x += buildingWidth + 1;
        }
    }
    
    // Draw buildings with audio reactivity
    params._buildings.forEach(building => {
        const audioValue = audio[building.audioIndex % audio.length] || 0.2;
        const height = Math.floor(building.baseHeight * (0.7 + audioValue * 0.3));
        
        // Draw building outline
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < building.width; x++) {
                const bx = building.x + x;
                const by = buffer.length - 1 - y;
                
                if (bx >= 0 && bx < width && by >= 0 && by < buffer.length) {
                    if (x === 0 || x === building.width - 1 || y === height - 1) {
                        buffer[by][bx] = '#';
                    }
                }
            }
        }
        
        // Draw windows with audio flicker
        building.windows.forEach(window => {
            const wx = building.x + window.x;
            const wy = buffer.length - 1 - window.y;
            
            if (wx >= 0 && wx < width && wy >= 0 && wy < buffer.length) {
                const flicker = audioValue > 0.5 && Math.random() < audioValue;
                if (window.lit || flicker) {
                    buffer[wy][wx] = '▪';
                }
            }
        });
    });
    
    // Stars in the sky
    const starDensity = 1 - audio.reduce((a, b) => a + b, 0) / audio.length;
    for (let i = 0; i < width * starDensity * 0.1; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height * 0.3);
        if (buffer[y][x] === ' ') {
            buffer[y][x] = Math.random() < 0.5 ? '.' : '*';
        }
    }
};

// Scene 28: Audio Heartbeat
CLIFTScenes[28] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate heart rate from BPM or audio
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    const heartRate = 60 + avgAudio * 120; // 60-180 BPM
    const beatPhase = (time / (60000 / heartRate)) % 1;
    
    // Heart beat animation
    const scale = 1 + Math.sin(beatPhase * Math.PI * 2) * 0.3 * avgAudio;
    
    // Draw heart shape
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = (x - centerX) / scale;
            const dy = (y - centerY) / scale * 2;
            
            // Heart equation
            const x2 = dx * dx;
            const y2 = dy * dy;
            const a = x2 + y2 - 1;
            const heart = a * a * a - x2 * y2 * dy < 0;
            
            if (heart) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5) buffer[y][x] = '@';
                else if (dist < 8) buffer[y][x] = '#';
                else if (dist < 12) buffer[y][x] = '+';
                else buffer[y][x] = '.';
            }
        }
    }
    
    // ECG line at bottom
    const ecgY = height - 3;
    for (let x = 0; x < width; x++) {
        const t = (x / width + time * 0.001) % 1;
        let ecgValue = 0;
        
        // P wave
        if (t > 0.1 && t < 0.15) ecgValue = Math.sin((t - 0.1) * 40) * 0.3;
        // QRS complex
        else if (t > 0.2 && t < 0.3) {
            if (t < 0.22) ecgValue = -0.3;
            else if (t < 0.25) ecgValue = 1.0 * avgAudio;
            else ecgValue = -0.2;
        }
        // T wave
        else if (t > 0.35 && t < 0.45) ecgValue = Math.sin((t - 0.35) * 20) * 0.4;
        
        const lineY = Math.floor(ecgY - ecgValue * 5);
        if (lineY >= 0 && lineY < height) {
            buffer[lineY][x] = '-';
        }
    }
};

// Scene 29: Audio Galaxy
CLIFTScenes[29] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.1);
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.0005;
    
    // Initialize galaxy particles
    if (!params._galaxy) {
        params._galaxy = [];
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.min(width, height) / 2;
            params._galaxy.push({
                angle: angle,
                radius: radius,
                z: Math.random() * 10,
                speed: 0.5 + Math.random() * 0.5,
                audioIndex: Math.floor(Math.random() * audio.length)
            });
        }
    }
    
    const particles = params._galaxy;
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    
    // Update and draw particles
    particles.forEach(p => {
        // Audio affects particle brightness and movement
        const audioValue = audio[p.audioIndex % audio.length] || 0.1;
        
        // Spiral galaxy rotation
        p.angle += p.speed * 0.01 * (1 + audioValue);
        
        // Spiral arm equation
        const spiralFactor = p.radius * 0.02;
        const x = centerX + Math.cos(p.angle - spiralFactor + t) * p.radius;
        const y = centerY + Math.sin(p.angle - spiralFactor + t) * p.radius * 0.4;
        
        // 3D depth effect
        p.z = (p.z + audioValue * 0.1) % 10;
        const brightness = (10 - p.z) / 10;
        
        const px = Math.floor(x);
        const py = Math.floor(y);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            if (brightness * audioValue > 0.7) buffer[py][px] = '*';
            else if (brightness * audioValue > 0.4) buffer[py][px] = '+';
            else if (brightness * audioValue > 0.1) buffer[py][px] = '.';
        }
    });
    
    // Central black hole with audio visualization
    const blackHoleRadius = 3 + avgAudio * 5;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(centerX + Math.cos(angle) * blackHoleRadius);
        const y = Math.floor(centerY + Math.sin(angle) * blackHoleRadius * 0.5);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '@';
        }
    }
};

// ============================================
// CATEGORY 3: Text & Typography (30-39)
// ============================================

// Scene 30: Scrolling Text Marquee
CLIFTScenes[30] = function(buffer, width, height, time, params) {
    const messages = [
        "CLIFT VJ SOFTWARE",
        "ASCII VISUAL PERFORMANCE",
        "LIVE CODING READY",
        "30 FPS REALTIME",
        "WEB AUDIO REACTIVE"
    ];
    
    const t = time * 0.0001;
    const messageIndex = Math.floor(t % messages.length);
    const message = messages[messageIndex];
    const scrollX = Math.floor(t * 50) % (width + message.length * 8);
    
    // Render big text
    const y = Math.floor(height / 2) - 2;
    for (let i = 0; i < message.length; i++) {
        const x = scrollX - i * 8 + i;
        if (x >= 0 && x < width) {
            // Simple ASCII art font
            const char = message[i];
            if (char !== ' ') {
                for (let dy = 0; dy < 5; dy++) {
                    for (let dx = 0; dx < 7; dx++) {
                        if (x + dx < width && y + dy < height) {
                            buffer[y + dy][x + dx] = char;
                        }
                    }
                }
            }
        }
    }
    
    // Audio reactive background
    const audio = params.audio || new Float32Array(64).fill(0.1);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    const bgChar = avgAudio > 0.5 ? '+' : (avgAudio > 0.3 ? '.' : ' ');
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (buffer[y][x] === ' ' && Math.random() < avgAudio * 0.1) {
                buffer[y][x] = bgChar;
            }
        }
    }
};

// Scene 31: HYPER-REACTIVE PARTICLE STORM - Musical Rain Simulator
CLIFTScenes[31] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.2, lowMid: 0.2, mid: 0.2, highMid: 0.2, treble: 0.2 };
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const energyMomentum = hyperReactive.energyMomentum || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const dropIntensity = hyperReactive.dropIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const rhythmicComplexity = hyperReactive.rhythmicComplexity || 0;
    const harmonicStability = hyperReactive.harmonicStability || 0;
    const surpriseLevel = hyperReactive.surpriseLevel || 0;
    const complexityIndex = hyperReactive.complexityIndex || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // Multi-tier character system based on musical characteristics
    const standardChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const bassChars = '█▉▊▋▌▍▎▏▪▫■□▬▭▮▯';
    const harmonicChars = '♫♪♬♩♮♯♭◊◆◇○●◉⚫⚪◎';
    const percussiveChars = '|!¡│┃║▌▐█▉▊▋';
    const climaxChars = '⚡✦✧⋆★☆※⁂❋❈❉❊❋';
    const buildupChars = '▁▂▃▄▅▆▇█↑⇈⇑▲△⯅';
    const dropChars = '▔▓▒░▽▿▾⯇⇊⇓↓';
    const complexChars = '╔╗╚╝╬╪╫╱╲╳◈◇◆⬢⬣⬡';
    const surpriseChars = '?!¿¡※⚠⁈⁉‼‽⸘';
    
    // Initialize enhanced particle system
    if (!params._rain) {
        params._rain = [];
        params._particles = [];
        
        for (let x = 0; x < width; x++) {
            params._rain[x] = {
                y: Math.random() * height,
                speed: 0.5 + Math.random() * 1.5,
                length: 5 + Math.random() * 15,
                intensity: 0.5,
                type: 'standard',
                age: 0,
                frequency: x / width,
                charSet: standardChars
            };
        }
        
        // Initialize floating particles for special effects
        for (let i = 0; i < 50; i++) {
            params._particles[i] = {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: Math.random(),
                maxLife: 0.5 + Math.random() * 1.5,
                char: '·',
                active: false
            };
        }
    }
    
    const rain = params._rain;
    const particles = params._particles;
    
    // HYPER-REACTIVE RAIN PROCESSING
    for (let x = 0; x < width; x++) {
        const drop = rain[x];
        const audioIndex = Math.floor((x / width) * audio.length);
        const audioValue = audio[audioIndex] || 0.2;
        
        // Frequency-specific band energy for this drop
        const bandEnergy = x < width * 0.2 ? bands.bass :
                          x < width * 0.4 ? bands.lowMid :
                          x < width * 0.6 ? bands.mid :
                          x < width * 0.8 ? bands.highMid : bands.treble;
        
        // Dynamic speed calculation with multiple factors
        let speedMultiplier = 1 + audioValue + bandEnergy;
        
        // Energy momentum effects
        speedMultiplier *= (1 + Math.abs(energyMomentum) * 2);
        
        // Musical structure effects
        if (buildupIntensity > 0.3) {
            speedMultiplier *= (1 + buildupIntensity * 1.5);
        }
        
        if (dropIntensity > 0.4) {
            speedMultiplier *= (1 + dropIntensity * 3); // Massive speed boost on drops
        }
        
        // Onset-driven acceleration bursts
        if (onsetStrength > 0.5) {
            speedMultiplier *= (1 + onsetStrength * 4);
        }
        
        // Beat synchronization
        if (beat.detected) {
            speedMultiplier *= (1 + beat.intensity * 2);
        }
        
        // Update drop properties
        drop.speed = (0.5 + Math.random() * 1.5) * speedMultiplier;
        drop.intensity = audioValue + bandEnergy + (onsetStrength * 0.5);
        drop.age++;
        
        // Adaptive length based on musical complexity
        if (drop.age % 30 === 0) { // Update length occasionally
            drop.length = Math.floor(5 + Math.random() * 15 + (complexityIndex * 20));
        }
        
        // Character set selection based on musical characteristics
        if (climaxProbability > 0.8) {
            drop.type = 'climax';
            drop.charSet = climaxChars;
        } else if (onsetType === 'percussive' && beat.detected) {
            drop.type = 'percussive';
            drop.charSet = percussiveChars;
        } else if (onsetType === 'harmonic' && harmonicStability > 0.7) {
            drop.type = 'harmonic';
            drop.charSet = harmonicChars;
        } else if (buildupIntensity > 0.5) {
            drop.type = 'buildup';
            drop.charSet = buildupChars;
        } else if (dropIntensity > 0.4) {
            drop.type = 'drop';
            drop.charSet = dropChars;
        } else if (complexityIndex > 0.6) {
            drop.type = 'complex';
            drop.charSet = complexChars;
        } else if (surpriseLevel > 0.6) {
            drop.type = 'surprise';
            drop.charSet = surpriseChars;
        } else if (bandEnergy > 0.6 && x < width * 0.3) {
            drop.type = 'bass';
            drop.charSet = bassChars;
        } else {
            drop.type = 'standard';
            drop.charSet = standardChars;
        }
        
        // Update position
        drop.y += drop.speed;
        
        // Reset drop when it goes off screen
        if (drop.y > height + drop.length) {
            drop.y = -drop.length - Math.random() * 20;
            drop.speed = 0.5 + Math.random() * 1.5;
            drop.age = 0;
        }
        
        // ENHANCED RENDERING
        for (let i = 0; i < drop.length; i++) {
            const y = Math.floor(drop.y - i);
            if (y >= 0 && y < height) {
                const brightness = 1 - (i / drop.length);
                const intensityFactor = drop.intensity * brightness;
                
                let char = ' ';
                
                if (intensityFactor > 0.8) {
                    // Bright head character
                    const charIndex = Math.floor(Math.random() * drop.charSet.length);
                    char = drop.charSet[charIndex];
                } else if (intensityFactor > 0.5) {
                    // Medium intensity
                    char = i === 0 ? drop.charSet[Math.floor(Math.random() * drop.charSet.length)] : 
                           drop.charSet[Math.floor(drop.charSet.length * 0.5)] || '▒';
                } else if (intensityFactor > 0.2) {
                    // Tail
                    char = ['·', ':', '.', '░'][Math.floor(Math.random() * 4)];
                }
                
                // Special effect overlays
                if (onsetStrength > 0.7 && i === 0 && Math.random() < onsetStrength - 0.6) {
                    char = ['⚡', '✦', '※'][Math.floor(Math.random() * 3)];
                }
                
                if (char !== ' ') {
                    buffer[y][x] = char;
                }
            }
        }
    }
    
    // FLOATING PARTICLE SYSTEM for special effects
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Activate particles based on musical events
        if (!particle.active) {
            if (onsetStrength > 0.6 && Math.random() < (onsetStrength - 0.5) * 2) {
                particle.active = true;
                particle.x = Math.random() * width;
                particle.y = Math.random() * height;
                particle.vx = (Math.random() - 0.5) * 4 * onsetStrength;
                particle.vy = (Math.random() - 0.5) * 4 * onsetStrength;
                particle.life = 0;
                particle.maxLife = 0.5 + onsetStrength;
                particle.char = onsetType === 'percussive' ? '●' : 
                               onsetType === 'harmonic' ? '♪' : 
                               climaxProbability > 0.8 ? '✦' : '·';
            }
        }
        
        if (particle.active) {
            // Update particle physics
            particle.x += particle.vx * (1 + energyMomentum * 2);
            particle.y += particle.vy * (1 + energyMomentum * 2);
            particle.life += 0.02;
            
            // Apply audio-driven forces
            const centerX = width / 2;
            const centerY = height / 2;
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                // Climax creates attraction to center
                if (climaxProbability > 0.8) {
                    particle.vx -= (dx / dist) * climaxProbability * 0.1;
                    particle.vy -= (dy / dist) * climaxProbability * 0.1;
                }
                
                // Surprise creates repulsion
                if (surpriseLevel > 0.6) {
                    particle.vx += (dx / dist) * surpriseLevel * 0.05;
                    particle.vy += (dy / dist) * surpriseLevel * 0.05;
                }
            }
            
            // Render particle
            const px = Math.floor(particle.x);
            const py = Math.floor(particle.y);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                const alpha = 1 - (particle.life / particle.maxLife);
                if (alpha > 0.1) {
                    buffer[py][px] = particle.char;
                }
            }
            
            // Deactivate when life expires or goes off screen
            if (particle.life >= particle.maxLife || 
                particle.x < -5 || particle.x > width + 5 ||
                particle.y < -5 || particle.y > height + 5) {
                particle.active = false;
            }
        }
    }
    
    // MUSICAL STRUCTURE OVERLAYS
    // Buildup ascending rain
    if (buildupIntensity > 0.5) {
        const ascendingRain = Math.floor(buildupIntensity * width * 0.3);
        for (let i = 0; i < ascendingRain; i++) {
            const x = Math.floor((i / ascendingRain) * width);
            const y = height - 1 - Math.floor((time * 0.01 * buildupIntensity + i) % height);
            if (y >= 0 && y < height && buffer[y][x] === ' ') {
                buffer[y][x] = buildupChars[Math.floor(Math.random() * buildupChars.length)];
            }
        }
    }
    
    // Drop explosion burst
    if (dropIntensity > 0.6) {
        const burstCount = Math.floor(dropIntensity * 30);
        for (let i = 0; i < burstCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height * 0.4); // Top part of screen
            if (buffer[y][x] === ' ' && Math.random() < dropIntensity - 0.5) {
                buffer[y][x] = dropChars[Math.floor(Math.random() * dropChars.length)];
            }
        }
    }
    
    // Climax screen saturation
    if (climaxProbability > 0.9) {
        const saturationLevel = (climaxProbability - 0.85) * 100;
        for (let i = 0; i < saturationLevel; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (Math.random() < 0.3) { // Don't oversaturate
                buffer[y][x] = climaxChars[Math.floor(Math.random() * climaxChars.length)];
            }
        }
    }
    
    // Groove rhythm bars
    if (harmonicStability > 0.8 && beat.detected) {
        const barCount = Math.floor(harmonicStability * 5);
        for (let b = 0; b < barCount; b++) {
            const x = Math.floor((b / barCount) * width);
            for (let y = 0; y < height; y += Math.floor(4 - beat.intensity * 2)) {
                if (buffer[y][x] === ' ') {
                    buffer[y][x] = '│';
                }
            }
        }
    }
};

// Scene 32: Typewriter Effect
CLIFTScenes[32] = function(buffer, width, height, time, params) {
    const poem = [
        "In the glow of terminals bright,",
        "ASCII characters dance through night.",
        "Pixels form in patterns true,",
        "Creating art from me to you.",
        "",
        "Each frame a moment, fleeting fast,",
        "Digital dreams that ever last.",
        "In monospace we find our voice,",
        "In limitations, we rejoice."
    ];
    
    const charsPerSecond = 10;
    const totalChars = poem.join('\n').length;
    const currentChar = Math.floor((time * 0.001 * charsPerSecond) % (totalChars + 50));
    
    let charCount = 0;
    let y = 2;
    
    for (let line of poem) {
        let x = Math.floor((width - line.length) / 2);
        
        for (let char of line) {
            if (charCount < currentChar && x >= 0 && x < width && y < height) {
                buffer[y][x] = char;
            }
            charCount++;
            x++;
        }
        
        charCount++; // newline
        y += 2;
    }
    
    // Cursor
    if (currentChar < totalChars) {
        const cursorBlink = Math.floor(time * 0.005) % 2;
        if (cursorBlink && y - 2 < height) {
            let lastX = Math.floor((width - poem[Math.min(Math.floor(y / 2) - 1, poem.length - 1)].length) / 2);
            lastX += (currentChar % 40);
            if (lastX < width) {
                buffer[y - 2][lastX] = '_';
            }
        }
    }
};

// Scene 33: Binary Matrix
CLIFTScenes[33] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    
    if (!params._binary) {
        params._binary = [];
        for (let i = 0; i < width * height; i++) {
            params._binary[i] = {
                value: Math.random() > 0.5 ? '1' : '0',
                changeTime: Math.random() * 5
            };
        }
    }
    
    const binary = params._binary;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const bit = binary[index];
            
            // Change bits based on time and audio
            if (t - bit.changeTime > 0.1 / (1 + avgAudio * 5)) {
                bit.changeTime = t;
                bit.value = Math.random() > 0.5 ? '1' : '0';
            }
            
            // Create wave effect
            const wave = Math.sin(x * 0.1 + y * 0.1 + t * 2) * avgAudio;
            if (wave > 0.3) {
                buffer[y][x] = bit.value;
            } else if (wave > 0) {
                buffer[y][x] = '.';
            }
        }
    }
};

// Scene 34: Emoji Rain (ASCII style)
CLIFTScenes[34] = function(buffer, width, height, time, params) {
    const emojis = ['♪', '♫', '☺', '☻', '♥', '♦', '♣', '♠', '•', '◘', '○', '◙', '♂', '♀', '♪', '♫', '☼', '►', '◄', '↕', '‼', '¶', '§', '▬', '↨', '↑', '↓', '→', '←', '∟', '↔', '▲', '▼'];
    
    if (!params._emojiRain) {
        params._emojiRain = [];
        for (let i = 0; i < 50; i++) {
            params._emojiRain.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 0.5 + Math.random(),
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
            });
        }
    }
    
    const drops = params._emojiRain;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    drops.forEach(drop => {
        // Update position
        drop.y += drop.speed * (1 + avgAudio);
        
        // Wrap around
        if (drop.y > height) {
            drop.y = -1;
            drop.x = Math.random() * width;
            drop.emoji = emojis[Math.floor(Math.random() * emojis.length)];
        }
        
        // Draw
        const x = Math.floor(drop.x);
        const y = Math.floor(drop.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = drop.emoji;
        }
        
        // Trail effect
        for (let i = 1; i < 3; i++) {
            const ty = y - i;
            if (ty >= 0 && ty < height && buffer[ty][x] === ' ') {
                buffer[ty][x] = '.';
            }
        }
    });
};

// Scene 35: Clock Display
CLIFTScenes[35] = function(buffer, width, height, time, params) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Digital clock display
    const timeStr = `${hours}:${minutes}:${seconds}`;
    const bigDigits = {
        '0': ['█████', '█   █', '█   █', '█   █', '█████'],
        '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
        '2': ['█████', '    █', '█████', '█    ', '█████'],
        '3': ['█████', '    █', '█████', '    █', '█████'],
        '4': ['█   █', '█   █', '█████', '    █', '    █'],
        '5': ['█████', '█    ', '█████', '    █', '█████'],
        '6': ['█████', '█    ', '█████', '█   █', '█████'],
        '7': ['█████', '    █', '   █ ', '  █  ', ' █   '],
        '8': ['█████', '█   █', '█████', '█   █', '█████'],
        '9': ['█████', '█   █', '█████', '    █', '█████'],
        ':': ['     ', '  █  ', '     ', '  █  ', '     ']
    };
    
    const startY = Math.floor((height - 5) / 2);
    let startX = Math.floor((width - timeStr.length * 6) / 2);
    
    for (let char of timeStr) {
        const digit = bigDigits[char];
        if (digit) {
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < digit[y].length; x++) {
                    if (startX + x < width && startY + y < height) {
                        buffer[startY + y][startX + x] = digit[y][x];
                    }
                }
            }
        }
        startX += 6;
    }
    
    // Audio reactive background
    const audio = params.audio || new Float32Array(64).fill(0.1);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    
    // Pulsing border
    const borderChar = avgAudio > 0.5 ? '#' : '*';
    for (let x = 0; x < width; x++) {
        if (buffer[0][x] === ' ') buffer[0][x] = borderChar;
        if (buffer[height - 1][x] === ' ') buffer[height - 1][x] = borderChar;
    }
    for (let y = 0; y < height; y++) {
        if (buffer[y][0] === ' ') buffer[y][0] = borderChar;
        if (buffer[y][width - 1] === ' ') buffer[y][width - 1] = borderChar;
    }
};

// Scene 36: Wave Text
CLIFTScenes[36] = function(buffer, width, height, time, params) {
    const text = "~ WAVE RIDER ~";
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Multiple wave lines
    for (let wave = 0; wave < 5; wave++) {
        const yBase = 2 + wave * 4;
        const phase = wave * 0.5;
        
        for (let i = 0; i < text.length; i++) {
            const x = Math.floor((width - text.length) / 2) + i;
            const audioIndex = Math.floor((i / text.length) * audio.length);
            const audioValue = audio[audioIndex] || 0.3;
            
            const waveHeight = Math.sin(x * 0.2 + t * 3 + phase) * 3 * (0.5 + audioValue);
            const y = Math.floor(yBase + waveHeight);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = text[i];
                
                // Trail effect
                for (let dy = -2; dy <= 2; dy++) {
                    const ty = y + dy;
                    if (ty >= 0 && ty < height && ty !== y && buffer[ty][x] === ' ') {
                        buffer[ty][x] = Math.abs(dy) === 1 ? '=' : '-';
                    }
                }
            }
        }
    }
};

// Scene 37: ASCII Mandala
CLIFTScenes[37] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    const chars = '.+*#@';
    
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2; // Aspect correction
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Mandala pattern
            const petals = 8 + Math.floor(avgAudio * 8);
            const petalAngle = angle * petals + t * 2;
            const radius = dist / (Math.min(width, height) / 2);
            
            const pattern = Math.sin(petalAngle) * Math.cos(radius * 5 - t) + 
                          Math.sin(angle * 3 + t) * Math.sin(radius * 3);
            
            const intensity = (pattern + 2) / 4 * (1 - radius);
            
            if (intensity > 0.2) {
                const charIndex = Math.floor(intensity * (chars.length - 1));
                buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
            }
        }
    }
};

// Scene 38: Bouncing Words
CLIFTScenes[38] = function(buffer, width, height, time, params) {
    const words = ['CLIFT', 'VJ', 'ASCII', 'LIVE', 'CODE', 'MIX', 'BEAT'];
    
    if (!params._bouncingWords) {
        params._bouncingWords = [];
        for (let i = 0; i < words.length; i++) {
            params._bouncingWords.push({
                word: words[i],
                x: Math.random() * (width - words[i].length),
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
    }
    
    const bouncing = params._bouncingWords;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    bouncing.forEach((item, index) => {
        // Update position
        item.x += item.vx * (1 + avgAudio);
        item.y += item.vy * (1 + avgAudio);
        
        // Bounce off walls
        if (item.x <= 0 || item.x >= width - item.word.length) {
            item.vx = -item.vx;
            item.x = Math.max(0, Math.min(width - item.word.length, item.x));
        }
        if (item.y <= 0 || item.y >= height - 1) {
            item.vy = -item.vy;
            item.y = Math.max(0, Math.min(height - 1, item.y));
        }
        
        // Draw word
        const x = Math.floor(item.x);
        const y = Math.floor(item.y);
        
        for (let i = 0; i < item.word.length; i++) {
            if (x + i < width && y < height) {
                buffer[y][x + i] = item.word[i];
            }
        }
        
        // Audio reactive trails
        if (avgAudio > 0.3) {
            const trailY = Math.floor(y - item.vy);
            const trailX = Math.floor(x - item.vx);
            if (trailY >= 0 && trailY < height && trailX >= 0 && trailX < width) {
                buffer[trailY][trailX] = '.';
            }
        }
    });
};

// Scene 39: Terminal Glitch Text
CLIFTScenes[39] = function(buffer, width, height, time, params) {
    const messages = [
        "SYSTEM ONLINE",
        "INITIALIZING...",
        "AUDIO DETECTED",
        "SYNC ESTABLISHED",
        "READY TO MIX"
    ];
    
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.1);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    
    // Terminal-style display
    for (let i = 0; i < messages.length; i++) {
        const y = 2 + i * 2;
        const message = messages[i];
        const x = 2;
        
        for (let j = 0; j < message.length; j++) {
            if (x + j < width && y < height) {
                // Glitch effect based on audio
                if (avgAudio > 0.5 && Math.random() < avgAudio * 0.3) {
                    buffer[y][x + j] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    buffer[y][x + j] = message[j];
                }
            }
        }
    }
    
    // Scanlines
    for (let y = 0; y < height; y++) {
        if ((y + Math.floor(t * 10)) % 3 === 0) {
            for (let x = 0; x < width; x++) {
                if (buffer[y][x] === ' ' && Math.random() < 0.1) {
                    buffer[y][x] = '─';
                }
            }
        }
    }
    
    // Random corruption blocks
    const corruptionLevel = avgAudio;
    for (let i = 0; i < corruptionLevel * 20; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const w = Math.floor(Math.random() * 10);
        const h = Math.floor(Math.random() * 3);
        
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (x + dx < width && y + dy < height) {
                    buffer[y + dy][x + dx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }
            }
        }
    }
};

// ============================================
// CATEGORY 4: Particle Systems (40-49)
// ============================================

// Scene 40: Dynamic Plasma Field
CLIFTScenes[40] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Create plasma field with audio reactivity
    const centerX = width / 2;
    const centerY = height / 2;
    const chars = ' .-:;=+*#%@';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Multiple sine waves for plasma effect
            let value = 0;
            value += Math.sin(dist * 0.2 + t * 3) * 0.5;
            value += Math.sin(x * 0.1 + t * 2) * 0.3;
            value += Math.sin(y * 0.15 + t * 1.5) * 0.3;
            value += Math.sin((x + y) * 0.08 + t * 2.5) * 0.4;
            
            // Audio enhancement
            const audioIndex = Math.floor((x / width) * audio.length);
            const audioValue = audio[audioIndex] || 0.3;
            value += audioValue * Math.sin(dist * 0.1 + t * 5) * 0.8;
            
            // Normalize and apply
            value = (value + 2) / 4;
            value = Math.max(0, Math.min(1, value));
            
            if (value > 0.1) {
                const charIndex = Math.floor(value * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
        }
    }
    
    // Add pulsing center based on beat
    const pulseRadius = 3 + avgAudio * 8;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
        const x = Math.floor(centerX + Math.cos(angle) * pulseRadius);
        const y = Math.floor(centerY + Math.sin(angle) * pulseRadius);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '@';
        }
    }
};

// Scene 41: Audio Waveform Ripples
CLIFTScenes[41] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const centerY = height / 2;
    const chars = ' .-:;=+*#%@';
    
    // Create multiple ripple sources based on audio
    for (let i = 0; i < 5; i++) {
        const x = (i / 4) * width;
        const audioIndex = Math.floor((i / 4) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        
        // Create ripples emanating from audio-reactive points
        for (let px = 0; px < width; px++) {
            for (let py = 0; py < height; py++) {
                const dx = px - x;
                const dy = py - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Wave equation
                const wave = Math.sin(dist * 0.3 - t * 8 + audioValue * 10) * audioValue;
                const amplitude = audioValue * Math.exp(-dist * 0.05);
                
                const intensity = Math.abs(wave * amplitude);
                
                if (intensity > 0.1) {
                    const charIndex = Math.floor(intensity * (chars.length - 1));
                    const currentChar = buffer[py][px];
                    if (currentChar === ' ' || chars.indexOf(currentChar) < charIndex) {
                        buffer[py][px] = chars[charIndex];
                    }
                }
            }
        }
    }
    
    // Add center line for reference
    for (let x = 0; x < width; x++) {
        const audioIndex = Math.floor((x / width) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        const waveY = Math.floor(centerY + Math.sin(x * 0.2 + t * 5) * audioValue * 8);
        if (waveY >= 0 && waveY < height) {
            buffer[waveY][x] = '@';
        }
    }
};

// Scene 42: Fractal Tree Growth
CLIFTScenes[42] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Draw fractal tree that grows with audio
    const drawBranch = (x, y, angle, length, depth) => {
        if (depth <= 0 || length < 1) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        // Draw line
        const steps = Math.floor(length);
        for (let i = 0; i <= steps; i++) {
            const px = Math.floor(x + (endX - x) * (i / steps));
            const py = Math.floor(y + (endY - y) * (i / steps));
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                const char = depth > 2 ? '|' : (depth > 1 ? '/' : '.');
                buffer[py][px] = char;
            }
        }
        
        // Audio-reactive branching
        const branchAngle = 0.5 + avgAudio * 0.3;
        const branchLength = length * (0.6 + avgAudio * 0.2);
        
        // Left branch
        drawBranch(endX, endY, angle - branchAngle, branchLength, depth - 1);
        // Right branch
        drawBranch(endX, endY, angle + branchAngle, branchLength, depth - 1);
    };
    
    // Multiple trees
    for (let i = 0; i < 3; i++) {
        const treeX = (i + 0.5) * (width / 3);
        const treeY = height - 1;
        const audioIndex = Math.floor((i / 3) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        
        const initialLength = 8 + audioValue * 8;
        const maxDepth = 3 + Math.floor(audioValue * 3);
        
        drawBranch(treeX, treeY, -Math.PI / 2, initialLength, maxDepth);
    }
    
    // Add wind effect
    const windOffset = Math.sin(t * 2) * avgAudio * 2;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (buffer[y][x] !== ' ') {
                const newX = Math.floor(x + windOffset * (1 - y / height));
                if (newX >= 0 && newX < width && newX !== x) {
                    if (buffer[y][newX] === ' ') {
                        buffer[y][newX] = buffer[y][x];
                        buffer[y][x] = ' ';
                    }
                }
            }
        }
    }
};

// Scene 43: Spiral Galaxy Formation
CLIFTScenes[43] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const chars = ' .-:;=+*#%@';
    
    // Create spiral arms
    for (let arm = 0; arm < 4; arm++) {
        const armAngle = (arm / 4) * Math.PI * 2;
        const audioIndex = Math.floor((arm / 4) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        
        for (let r = 0; r < Math.min(width, height) / 2; r++) {
            const spiralTightness = 0.3 + audioValue * 0.2;
            const angle = armAngle + r * spiralTightness + t * (1 + audioValue);
            
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r * 0.6;
            
            const px = Math.floor(x);
            const py = Math.floor(y);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                // Density based on distance from center
                const density = Math.exp(-r * 0.1) * (0.5 + audioValue);
                
                // Add some randomness for star field effect
                if (Math.random() < density) {
                    const charIndex = Math.floor(density * (chars.length - 1));
                    const currentChar = buffer[py][px];
                    if (currentChar === ' ' || chars.indexOf(currentChar) < charIndex) {
                        buffer[py][px] = chars[charIndex];
                    }
                }
            }
        }
    }
    
    // Central black hole with accretion disk
    const blackHoleRadius = 2 + avgAudio * 3;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        for (let r = 0; r < blackHoleRadius; r++) {
            const x = Math.floor(centerX + Math.cos(angle + t * 10) * r);
            const y = Math.floor(centerY + Math.sin(angle + t * 10) * r);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = r < blackHoleRadius / 2 ? '@' : '#';
            }
        }
    }
    
    // Add background stars
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        if (buffer[y][x] === ' ' && Math.random() < 0.3) {
            buffer[y][x] = '.';
        }
    }
};

// Scene 44: Cellular Automata Conway's Game of Life
CLIFTScenes[44] = function(buffer, width, height, time, params) {
    if (!params._cells) {
        params._cells = [];
        params._generation = 0;
        
        // Initialize with random pattern
        for (let y = 0; y < height; y++) {
            params._cells[y] = [];
            for (let x = 0; x < width; x++) {
                params._cells[y][x] = Math.random() > 0.7 ? 1 : 0;
            }
        }
    }
    
    const cells = params._cells;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Update every few frames based on audio
    const updateRate = Math.max(1, 8 - Math.floor(avgAudio * 6));
    
    if (params._generation % updateRate === 0) {
        const newCells = [];
        
        for (let y = 0; y < height; y++) {
            newCells[y] = [];
            for (let x = 0; x < width; x++) {
                let neighbors = 0;
                
                // Count neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = (x + dx + width) % width;
                        const ny = (y + dy + height) % height;
                        neighbors += cells[ny][nx];
                    }
                }
                
                // Conway's rules with audio modification
                const current = cells[y][x];
                const survivalThreshold = avgAudio > 0.5 ? 3 : 2;
                const birthThreshold = avgAudio > 0.7 ? 4 : 3;
                
                if (current === 1) {
                    // Live cell survives with 2-3 neighbors
                    newCells[y][x] = (neighbors === 2 || neighbors === survivalThreshold) ? 1 : 0;
                } else {
                    // Dead cell becomes alive with exactly 3 neighbors
                    newCells[y][x] = (neighbors === birthThreshold) ? 1 : 0;
                }
            }
        }
        
        params._cells = newCells;
        
        // Add some randomness to keep it interesting
        if (Math.random() < avgAudio * 0.1) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            params._cells[y][x] = 1;
        }
    }
    
    params._generation++;
    
    // Draw cells with different characters based on age
    const chars = ' .-:;=+*#%@';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (cells[y][x] === 1) {
                // Count neighbors for visual variety
                let neighbors = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = (x + dx + width) % width;
                        const ny = (y + dy + height) % height;
                        neighbors += cells[ny][nx];
                    }
                }
                
                const charIndex = Math.min(chars.length - 1, Math.floor(neighbors / 8 * chars.length));
                buffer[y][x] = chars[charIndex + 1] || '@';
            }
        }
    }
};

// Scene 45: DNA Double Helix
CLIFTScenes[45] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    const centerX = width / 2;
    const helixHeight = height;
    const radius = Math.min(width / 4, 8);
    
    // Draw DNA double helix
    for (let y = 0; y < helixHeight; y++) {
        const progress = y / helixHeight;
        const angle = progress * Math.PI * 4 + t * 2; // 2 full rotations
        
        // Audio affects the twist rate
        const audioIndex = Math.floor(progress * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        const twist = angle + audioValue * 2;
        
        // First strand
        const x1 = centerX + Math.cos(twist) * radius;
        const px1 = Math.floor(x1);
        if (px1 >= 0 && px1 < width && y >= 0 && y < height) {
            buffer[y][px1] = 'O';
        }
        
        // Second strand (opposite phase)
        const x2 = centerX + Math.cos(twist + Math.PI) * radius;
        const px2 = Math.floor(x2);
        if (px2 >= 0 && px2 < width && y >= 0 && y < height) {
            buffer[y][px2] = 'O';
        }
        
        // Base pairs connecting the strands
        if (y % 3 === 0) {
            const minX = Math.min(px1, px2);
            const maxX = Math.max(px1, px2);
            
            for (let x = minX; x <= maxX; x++) {
                if (x >= 0 && x < width) {
                    if (x === minX || x === maxX) {
                        buffer[y][x] = 'O';
                    } else {
                        buffer[y][x] = '-';
                    }
                }
            }
        }
    }
    
    // Add nucleotide labels based on audio
    const nucleotides = ['A', 'T', 'G', 'C'];
    for (let y = 0; y < height; y += 6) {
        const audioIndex = Math.floor((y / height) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        const nucleotide = nucleotides[Math.floor(audioValue * 4)];
        
        if (centerX - 2 >= 0 && centerX + 2 < width) {
            buffer[y][centerX - 2] = nucleotide;
            buffer[y][centerX + 2] = nucleotide;
        }
    }
    
    // Add flowing particles along the helix
    const numParticles = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < numParticles; i++) {
        const particleT = (t * 2 + i * 0.5) % (Math.PI * 4);
        const particleY = Math.floor((particleT / (Math.PI * 4)) * height);
        const particleX = centerX + Math.cos(particleT) * radius;
        
        const px = Math.floor(particleX);
        if (px >= 0 && px < width && particleY >= 0 && particleY < height) {
            buffer[particleY][px] = '*';
        }
    }
};

// Scene 46: Mandelbrot Set Zoom
CLIFTScenes[46] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Mandelbrot parameters with audio-reactive zoom
    const zoom = 1 + avgAudio * 2 + Math.sin(t * 0.5) * 0.5;
    const centerX = -0.5 + Math.sin(t * 0.1) * 0.1;
    const centerY = 0 + Math.cos(t * 0.1) * 0.1;
    
    const maxIterations = 20 + Math.floor(avgAudio * 20);
    const chars = ' .-:;=+*#%@';
    
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            // Map pixel to complex plane
            const x0 = (px - width / 2) * (4 / width) / zoom + centerX;
            const y0 = (py - height / 2) * (4 / height) / zoom + centerY;
            
            let x = 0, y = 0;
            let iteration = 0;
            
            // Mandelbrot iteration
            while (x * x + y * y <= 4 && iteration < maxIterations) {
                const xtemp = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xtemp;
                iteration++;
            }
            
            // Color based on iteration count
            if (iteration === maxIterations) {
                buffer[py][px] = '@'; // Inside the set
            } else {
                const intensity = iteration / maxIterations;
                const charIndex = Math.floor(intensity * (chars.length - 1));
                buffer[py][px] = chars[charIndex];
            }
        }
    }
    
    // Add audio-reactive overlay
    const overlayIntensity = avgAudio * 0.5;
    if (overlayIntensity > 0.3) {
        const overlayX = Math.floor(width / 2);
        const overlayY = Math.floor(height / 2);
        const overlayRadius = Math.floor(overlayIntensity * 10);
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            const x = Math.floor(overlayX + Math.cos(angle) * overlayRadius);
            const y = Math.floor(overlayY + Math.sin(angle) * overlayRadius);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '+';
            }
        }
    }
};

// Scene 47: Voronoi Diagram
CLIFTScenes[47] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Create seed points that move with audio
    const numSeeds = 8 + Math.floor(avgAudio * 6);
    const seeds = [];
    
    for (let i = 0; i < numSeeds; i++) {
        const audioIndex = Math.floor((i / numSeeds) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        
        seeds.push({
            x: width / 2 + Math.sin(t * (i + 1) * 0.3) * width * 0.3,
            y: height / 2 + Math.cos(t * (i + 1) * 0.3) * height * 0.3,
            char: String.fromCharCode(65 + i), // A, B, C, etc.
            intensity: audioValue
        });
    }
    
    // Calculate Voronoi diagram
    const chars = ' .-:;=+*#%@';
    
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            let minDist = Infinity;
            let closestSeed = null;
            
            // Find closest seed
            seeds.forEach(seed => {
                const dx = px - seed.x;
                const dy = py - seed.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < minDist) {
                    minDist = dist;
                    closestSeed = seed;
                }
            });
            
            if (closestSeed) {
                // Distance-based shading
                const maxDist = Math.sqrt(width * width + height * height);
                const normalizedDist = minDist / maxDist;
                const intensity = (1 - normalizedDist) * closestSeed.intensity;
                
                if (intensity > 0.1) {
                    const charIndex = Math.floor(intensity * (chars.length - 1));
                    buffer[py][px] = chars[charIndex];
                }
                
                // Mark seed points
                if (minDist < 2) {
                    buffer[py][px] = closestSeed.char;
                }
            }
        }
    }
    
    // Add edge detection for cell boundaries
    for (let py = 1; py < height - 1; py++) {
        for (let px = 1; px < width - 1; px++) {
            const current = buffer[py][px];
            const neighbors = [
                buffer[py - 1][px],
                buffer[py + 1][px],
                buffer[py][px - 1],
                buffer[py][px + 1]
            ];
            
            // If neighbors are different, this is an edge
            let isEdge = false;
            neighbors.forEach(neighbor => {
                if (neighbor !== current && neighbor !== ' ') {
                    isEdge = true;
                }
            });
            
            if (isEdge && current !== ' ') {
                buffer[py][px] = '|';
            }
        }
    }
};

// Scene 48: Lissajous Patterns
CLIFTScenes[48] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 2;
    
    // Multiple Lissajous curves with different frequencies
    const curves = [
        { a: 1, b: 2, phase: 0, char: '*' },
        { a: 2, b: 3, phase: Math.PI / 4, char: '+' },
        { a: 3, b: 4, phase: Math.PI / 2, char: 'o' },
        { a: 4, b: 5, phase: 3 * Math.PI / 4, char: '#' }
    ];
    
    curves.forEach((curve, index) => {
        const audioIndex = Math.floor((index / curves.length) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        
        // Audio affects frequency and amplitude
        const freqA = curve.a + audioValue * 2;
        const freqB = curve.b + audioValue * 2;
        const amplitude = maxRadius * (0.5 + audioValue * 0.5);
        
        // Draw the curve
        for (let i = 0; i < 200; i++) {
            const param = (i / 200) * Math.PI * 2;
            
            const x = centerX + amplitude * Math.sin(freqA * param + t * 2) * Math.cos(curve.phase);
            const y = centerY + amplitude * Math.sin(freqB * param + t * 2) * Math.sin(curve.phase);
            
            const px = Math.floor(x);
            const py = Math.floor(y);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = curve.char;
            }
        }
    });
    
    // Add harmonic overtones
    const harmonics = 3 + Math.floor(avgAudio * 5);
    for (let h = 1; h <= harmonics; h++) {
        const angle = t * h + avgAudio * Math.PI;
        const radius = maxRadius * (1 / h) * avgAudio;
        
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = String.fromCharCode(48 + h); // Numbers 1-9
        }
    }
    
    // Add center point
    if (centerX >= 0 && centerX < width && centerY >= 0 && centerY < height) {
        buffer[Math.floor(centerY)][Math.floor(centerX)] = '@';
    }
};

// Scene 49: Interference Patterns
CLIFTScenes[49] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Create multiple wave sources
    const sources = [];
    const numSources = 3 + Math.floor(avgAudio * 3);
    
    for (let i = 0; i < numSources; i++) {
        const audioIndex = Math.floor((i / numSources) * audio.length);
        const audioValue = audio[audioIndex] || 0.3;
        
        sources.push({
            x: width / 2 + Math.sin(t * (i + 1) * 0.5) * width * 0.3,
            y: height / 2 + Math.cos(t * (i + 1) * 0.5) * height * 0.3,
            frequency: 0.1 + audioValue * 0.1,
            amplitude: audioValue,
            phase: i * Math.PI / 2
        });
    }
    
    const chars = ' .-:;=+*#%@';
    
    // Calculate interference pattern
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            let totalAmplitude = 0;
            
            // Sum waves from all sources
            sources.forEach(source => {
                const dx = px - source.x;
                const dy = py - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Wave equation: amplitude * sin(frequency * distance - time + phase)
                const wave = source.amplitude * Math.sin(
                    source.frequency * distance - t * 5 + source.phase
                );
                
                // Apply distance falloff
                const falloff = 1 / (1 + distance * 0.05);
                totalAmplitude += wave * falloff;
            });
            
            // Normalize and apply
            const intensity = (totalAmplitude + 1) / 2; // Convert from [-1,1] to [0,1]
            const clampedIntensity = Math.max(0, Math.min(1, intensity));
            
            if (clampedIntensity > 0.1) {
                const charIndex = Math.floor(clampedIntensity * (chars.length - 1));
                buffer[py][px] = chars[charIndex];
            }
        }
    }
    
    // Mark wave sources
    sources.forEach(source => {
        const sx = Math.floor(source.x);
        const sy = Math.floor(source.y);
        
        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            buffer[sy][sx] = '@';
            
            // Add pulsing rings around sources
            const pulseRadius = 2 + Math.sin(t * 10) * source.amplitude * 3;
            for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
                const x = Math.floor(sx + Math.cos(angle) * pulseRadius);
                const y = Math.floor(sy + Math.sin(angle) * pulseRadius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = 'o';
                }
            }
        }
    });
};

// ============================================
// CATEGORY 5: Abstract & Psychedelic (50-59)
// ============================================

// Scene 50: Kaleidoscope Fractal
CLIFTScenes[50] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.0005;
    const chars = ' .:-=+*#%@';
    
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Kaleidoscope symmetry
            const folds = 6 + Math.floor(avgAudio * 6);
            const foldedAngle = Math.abs((angle % (Math.PI * 2 / folds)) - Math.PI / folds);
            
            // Fractal pattern
            let value = 0;
            for (let i = 1; i <= 4; i++) {
                value += Math.sin(dist * i * 0.1 + t * i) * 
                        Math.cos(foldedAngle * i + t * (5 - i)) / i;
            }
            
            value = (value + 2) / 4;
            value *= 1 - (dist / Math.min(width, height));
            
            if (value > 0.1) {
                const charIndex = Math.floor(value * (chars.length - 1));
                buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
            }
        }
    }
};

// Scene 51: Morphing Blobs
CLIFTScenes[51] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Multiple blobs
    const blobs = [];
    for (let i = 0; i < 5; i++) {
        const audioIndex = Math.floor((i / 5) * audio.length);
        const audioValue = audio[audioIndex] || 0.2;
        
        blobs.push({
            x: width / 2 + Math.sin(t * (i + 1) * 0.3) * width * 0.3,
            y: height / 2 + Math.cos(t * (i + 1) * 0.3) * height * 0.3,
            radius: 5 + audioValue * 15 + Math.sin(t * (i + 2)) * 3
        });
    }
    
    // Metaball rendering
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            
            blobs.forEach(blob => {
                const dx = x - blob.x;
                const dy = (y - blob.y) * 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                sum += blob.radius * blob.radius / (dist * dist + 1);
            });
            
            if (sum > 1) {
                const charIndex = Math.floor(Math.min(sum - 1, 1) * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
        }
    }
};

// Scene 52: Cellular Automata
CLIFTScenes[52] = function(buffer, width, height, time, params) {
    if (!params._cells) {
        params._cells = [];
        for (let y = 0; y < height; y++) {
            params._cells[y] = [];
            for (let x = 0; x < width; x++) {
                params._cells[y][x] = Math.random() > 0.5 ? 1 : 0;
            }
        }
        params._generation = 0;
    }
    
    const cells = params._cells;
    const audio = params.audio || new Float32Array(64).fill(0.1);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    
    // Update every few frames
    if (params._generation % (5 - Math.floor(avgAudio * 4)) === 0) {
        const newCells = [];
        
        for (let y = 0; y < height; y++) {
            newCells[y] = [];
            for (let x = 0; x < width; x++) {
                let neighbors = 0;
                
                // Count neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ny = (y + dy + height) % height;
                        const nx = (x + dx + width) % width;
                        neighbors += cells[ny][nx];
                    }
                }
                
                // Apply rules (modified by audio)
                const current = cells[y][x];
                const threshold = 3 + Math.floor(avgAudio * 2);
                
                if (current === 1) {
                    newCells[y][x] = (neighbors === 2 || neighbors === threshold) ? 1 : 0;
                } else {
                    newCells[y][x] = (neighbors === threshold) ? 1 : 0;
                }
            }
        }
        
        params._cells = newCells;
    }
    
    params._generation++;
    
    // Draw cells
    const chars = [' ', '.', '+', '#', '@'];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (cells[y][x]) {
                const age = params._generation % chars.length;
                buffer[y][x] = chars[age];
            }
        }
    }
};

// Scene 53: Sine Wave Interference
CLIFTScenes[53] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Multiple wave sources
    const sources = [];
    for (let i = 0; i < 3; i++) {
        sources.push({
            x: width / 2 + Math.sin(t * (i + 1) * 0.3) * width * 0.4,
            y: height / 2 + Math.cos(t * (i + 1) * 0.3) * height * 0.4,
            frequency: 0.2 + i * 0.1 + avgAudio * 0.2,
            amplitude: 1 + avgAudio,
            phase: t * (i + 1)
        });
    }
    
    // Calculate interference pattern
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            
            sources.forEach(source => {
                const dx = x - source.x;
                const dy = (y - source.y) * 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                sum += Math.sin(dist * source.frequency + source.phase) * source.amplitude;
            });
            
            const normalized = (sum / sources.length + 1) / 2;
            const charIndex = Math.floor(normalized * (chars.length - 1));
            
            if (charIndex > 0) {
                buffer[y][x] = chars[Math.max(0, Math.min(charIndex, chars.length - 1))];
            }
        }
    }
};

// Scene 54: Reaction Diffusion
CLIFTScenes[54] = function(buffer, width, height, time, params) {
    if (!params._reaction) {
        params._reaction = {
            a: [],
            b: []
        };
        
        // Initialize with random pattern
        for (let y = 0; y < height; y++) {
            params._reaction.a[y] = [];
            params._reaction.b[y] = [];
            for (let x = 0; x < width; x++) {
                params._reaction.a[y][x] = 1;
                params._reaction.b[y][x] = Math.random() < 0.1 ? 1 : 0;
            }
        }
    }
    
    const reaction = params._reaction;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    // Gray-Scott parameters (modified by audio)
    const dA = 1.0;
    const dB = 0.5;
    const feed = 0.055 + avgAudio * 0.01;
    const kill = 0.062 + avgAudio * 0.005;
    
    // Update reaction-diffusion
    const newA = [];
    const newB = [];
    
    for (let y = 0; y < height; y++) {
        newA[y] = [];
        newB[y] = [];
        for (let x = 0; x < width; x++) {
            const a = reaction.a[y][x];
            const b = reaction.b[y][x];
            
            // Laplacian
            let laplaceA = 0;
            let laplaceB = 0;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const ny = (y + dy + height) % height;
                    const nx = (x + dx + width) % width;
                    const weight = (dx === 0 && dy === 0) ? -1 : 0.2;
                    laplaceA += reaction.a[ny][nx] * weight;
                    laplaceB += reaction.b[ny][nx] * weight;
                }
            }
            
            // Reaction-diffusion equations
            const abb = a * b * b;
            newA[y][x] = a + (dA * laplaceA - abb + feed * (1 - a)) * 0.1;
            newB[y][x] = b + (dB * laplaceB + abb - (kill + feed) * b) * 0.1;
            
            // Clamp values
            newA[y][x] = Math.max(0, Math.min(1, newA[y][x]));
            newB[y][x] = Math.max(0, Math.min(1, newB[y][x]));
        }
    }
    
    reaction.a = newA;
    reaction.b = newB;
    
    // Render
    const chars = ' .:-=+*#%@';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = reaction.b[y][x];
            const charIndex = Math.floor(value * (chars.length - 1));
            buffer[y][x] = chars[charIndex];
        }
    }
};

// Scene 55: Fractal Zoom
CLIFTScenes[55] = function(buffer, width, height, time, params) {
    const t = time * 0.00005;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    // Zoom parameters
    const zoom = Math.exp(t) * (1 + avgAudio);
    const centerX = -0.5 + Math.sin(t * 10) * 0.1;
    const centerY = 0 + Math.cos(t * 10) * 0.1;
    
    // Mandelbrot set
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const x0 = (x - width / 2) / (width / 4) / zoom + centerX;
            const y0 = (y - height / 2) / (height / 4) / zoom + centerY;
            
            let zx = 0, zy = 0;
            let iter = 0;
            const maxIter = 50 + Math.floor(avgAudio * 50);
            
            while (zx * zx + zy * zy < 4 && iter < maxIter) {
                const tmp = zx * zx - zy * zy + x0;
                zy = 2 * zx * zy + y0;
                zx = tmp;
                iter++;
            }
            
            if (iter < maxIter) {
                const charIndex = Math.floor((iter / maxIter) * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
        }
    }
};

// Scene 56: Liquid Crystal
CLIFTScenes[56] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Multiple layers of motion
            const flow1 = Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 - t);
            const flow2 = Math.sin((x + y) * 0.05 + t * 0.7) * Math.cos((x - y) * 0.05 - t * 0.7);
            const flow3 = Math.sin(Math.sqrt(x * x + y * y) * 0.1 + t * 1.3);
            
            // Audio modulation
            const audioIndex = Math.floor(((x + y) / (width + height)) * audio.length);
            const audioValue = audio[audioIndex % audio.length] || 0.3;
            
            const combined = (flow1 + flow2 + flow3) / 3 * (0.5 + audioValue);
            const normalized = (combined + 1) / 2;
            
            const charIndex = Math.floor(normalized * (chars.length - 1));
            buffer[y][x] = chars[Math.max(0, Math.min(charIndex, chars.length - 1))];
        }
    }
};

// Scene 57: Dimensional Portal
CLIFTScenes[57] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Portal effect
            const twist = angle + dist * 0.1 - t * 2;
            const pulse = Math.sin(dist * 0.2 - t * 5) * avgAudio;
            
            // Dimensional warping
            const warpX = dx + Math.sin(twist) * 10 * pulse;
            const warpY = dy + Math.cos(twist) * 10 * pulse;
            const warpDist = Math.sqrt(warpX * warpX + warpY * warpY);
            
            // Create portal layers
            const layer1 = Math.sin(warpDist * 0.1 + t);
            const layer2 = Math.cos(angle * 3 + t * 2);
            const layer3 = Math.sin(twist * 2);
            
            const value = (layer1 + layer2 + layer3) / 3;
            const intensity = (value + 1) / 2 * (1 - dist / Math.min(width, height));
            
            if (intensity > 0.1) {
                const charIndex = Math.floor(intensity * (chars.length - 1));
                buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
            }
        }
    }
};

// Scene 58: Neural Network
CLIFTScenes[58] = function(buffer, width, height, time, params) {
    if (!params._neurons) {
        params._neurons = [];
        // Create neurons
        for (let i = 0; i < 20; i++) {
            params._neurons.push({
                x: Math.random() * width,
                y: Math.random() * height,
                activation: Math.random(),
                connections: []
            });
        }
        
        // Create connections
        params._neurons.forEach((neuron, i) => {
            const numConnections = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numConnections; j++) {
                const target = Math.floor(Math.random() * params._neurons.length);
                if (target !== i) {
                    neuron.connections.push(target);
                }
            }
        });
    }
    
    const neurons = params._neurons;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    const t = time * 0.001;
    
    // Update neuron activations
    neurons.forEach((neuron, i) => {
        // Pulse activation
        neuron.activation = (Math.sin(t * 2 + i) + 1) / 2 * (0.5 + avgAudio);
        
        // Slowly move neurons
        neuron.x += Math.sin(t + i) * 0.2;
        neuron.y += Math.cos(t + i) * 0.1;
        
        // Wrap around
        if (neuron.x < 0) neuron.x = width;
        if (neuron.x > width) neuron.x = 0;
        if (neuron.y < 0) neuron.y = height;
        if (neuron.y > height) neuron.y = 0;
    });
    
    // Draw connections
    neurons.forEach((neuron, i) => {
        neuron.connections.forEach(targetIdx => {
            const target = neurons[targetIdx];
            const strength = (neuron.activation + target.activation) / 2;
            
            if (strength > 0.3) {
                drawLine(buffer, 
                    Math.floor(neuron.x), Math.floor(neuron.y),
                    Math.floor(target.x), Math.floor(target.y),
                    strength > 0.7 ? '=' : '-');
            }
        });
    });
    
    // Draw neurons
    neurons.forEach(neuron => {
        const x = Math.floor(neuron.x);
        const y = Math.floor(neuron.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (neuron.activation > 0.7) {
                buffer[y][x] = '@';
                // Draw activation aura
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const ax = x + dx;
                        const ay = y + dy;
                        if (ax >= 0 && ax < width && ay >= 0 && ay < height && buffer[ay][ax] === ' ') {
                            buffer[ay][ax] = '+';
                        }
                    }
                }
            } else if (neuron.activation > 0.3) {
                buffer[y][x] = 'o';
            } else {
                buffer[y][x] = '.';
            }
        }
    });
};

// Scene 59: Quantum Field
CLIFTScenes[59] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    // Quantum field parameters
    const wavelength = 10 + avgAudio * 20;
    const amplitude = 5 + avgAudio * 10;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Quantum probability waves
            const wave1 = Math.sin(x / wavelength + t) * Math.cos(y / wavelength - t);
            const wave2 = Math.sin((x + y) / wavelength * 0.7 + t * 1.3);
            const wave3 = Math.cos(Math.sqrt((x - width/2) * (x - width/2) + 
                                           (y - height/2) * (y - height/2)) / wavelength + t);
            
            // Interference pattern
            const interference = wave1 * wave2 * wave3;
            
            // Uncertainty principle visualization
            const uncertainty = Math.random() * 0.2 * avgAudio;
            
            const value = Math.abs(interference + uncertainty);
            const normalized = Math.min(value * amplitude, 1);
            
            if (normalized > 0.1) {
                const charIndex = Math.floor(normalized * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
            
            // Quantum tunneling effect
            if (Math.random() < 0.001 * avgAudio && buffer[y][x] === ' ') {
                buffer[y][x] = '*';
            }
        }
    }
};

// Category 6: Retro & Gaming (60-69)

// Scene 60: Pong Game
CLIFTScenes[60] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.5;
    
    // Initialize game state
    if (!params._pongState) {
        params._pongState = {
            ballX: width / 2,
            ballY: height / 2,
            ballVX: 1,
            ballVY: 0.5,
            paddle1Y: height / 2,
            paddle2Y: height / 2,
            score1: 0,
            score2: 0
        };
    }
    
    const state = params._pongState;
    const paddleHeight = 5;
    const ballSpeed = 0.5 + avgAudio;
    
    // Update paddles (AI controlled by sine waves)
    state.paddle1Y = (height / 2) + Math.sin(t) * (height / 3);
    state.paddle2Y = (height / 2) + Math.sin(t * 1.3) * (height / 3);
    
    // Update ball
    state.ballX += state.ballVX * ballSpeed;
    state.ballY += state.ballVY * ballSpeed;
    
    // Ball collision with top/bottom
    if (state.ballY <= 1 || state.ballY >= height - 2) {
        state.ballVY = -state.ballVY;
    }
    
    // Ball collision with paddles
    if (state.ballX <= 3 && Math.abs(state.ballY - state.paddle1Y) < paddleHeight / 2) {
        state.ballVX = Math.abs(state.ballVX);
        state.ballVY += (state.ballY - state.paddle1Y) * 0.2;
    }
    if (state.ballX >= width - 4 && Math.abs(state.ballY - state.paddle2Y) < paddleHeight / 2) {
        state.ballVX = -Math.abs(state.ballVX);
        state.ballVY += (state.ballY - state.paddle2Y) * 0.2;
    }
    
    // Ball out of bounds
    if (state.ballX < 0 || state.ballX > width) {
        state.ballX = width / 2;
        state.ballY = height / 2;
        state.ballVX = -state.ballVX;
        state.ballVY = (Math.random() - 0.5) * 2;
    }
    
    // Draw field
    for (let y = 0; y < height; y++) {
        // Center line
        if (y % 3 === 0) {
            buffer[y][Math.floor(width / 2)] = '|';
        }
    }
    
    // Draw paddles
    for (let i = -paddleHeight/2; i <= paddleHeight/2; i++) {
        const y1 = Math.floor(state.paddle1Y + i);
        const y2 = Math.floor(state.paddle2Y + i);
        if (y1 >= 0 && y1 < height) buffer[y1][2] = '#';
        if (y2 >= 0 && y2 < height) buffer[y2][width - 3] = '#';
    }
    
    // Draw ball
    const bx = Math.floor(state.ballX);
    const by = Math.floor(state.ballY);
    if (bx >= 0 && bx < width && by >= 0 && by < height) {
        buffer[by][bx] = '@';
    }
    
    // Draw borders
    for (let x = 0; x < width; x++) {
        buffer[0][x] = '=';
        buffer[height - 1][x] = '=';
    }
};

// Scene 61: Space Invaders
CLIFTScenes[61] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Invader patterns
    const invader1 = [
        ' @ @ ',
        '@@@@@',
        '@ @ @',
        ' @ @ '
    ];
    
    const invader2 = [
        '  @  ',
        ' @@@ ',
        '@@@@@',
        '@ @ @'
    ];
    
    // Wave motion
    const waveX = Math.sin(t) * 10;
    const waveY = Math.floor(t * 0.5) % 10;
    
    // Draw invaders grid
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
            const invader = (row + col) % 2 === 0 ? invader1 : invader2;
            const baseX = col * 8 + 5 + waveX;
            const baseY = row * 5 + 2 + waveY;
            
            // Draw invader
            invader.forEach((line, y) => {
                for (let x = 0; x < line.length; x++) {
                    const px = Math.floor(baseX + x);
                    const py = baseY + y;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        if (line[x] !== ' ') {
                            buffer[py][px] = line[x];
                        }
                    }
                }
            });
        }
    }
    
    // Draw player ship
    const shipX = Math.floor(width / 2 + Math.sin(t * 2) * 20);
    const shipY = height - 4;
    const ship = [
        '  A  ',
        ' AAA ',
        'AAAAA'
    ];
    
    ship.forEach((line, y) => {
        for (let x = 0; x < line.length; x++) {
            const px = shipX + x - 2;
            const py = shipY + y;
            if (px >= 0 && px < width && py >= 0 && py < height) {
                if (line[x] !== ' ') {
                    buffer[py][px] = line[x];
                }
            }
        }
    });
    
    // Laser effects (audio reactive)
    if (bassLevel > 0.5) {
        for (let y = shipY - 1; y >= 0; y -= 2) {
            if (Math.random() < 0.3) {
                buffer[y][shipX] = '|';
            }
        }
    }
};

// Scene 62: Tetris Blocks
CLIFTScenes[62] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Tetris pieces
    const pieces = [
        // I piece
        [['#','#','#','#']],
        // O piece
        [['#','#'],['#','#']],
        // T piece
        [[' ','#',' '],['#','#','#']],
        // S piece
        [[' ','#','#'],['#','#',' ']],
        // Z piece
        [['#','#',' '],[' ','#','#']],
        // J piece
        [['#',' ',' '],['#','#','#']],
        // L piece
        [[' ',' ','#'],['#','#','#']]
    ];
    
    // Falling pieces
    const numPieces = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < numPieces; i++) {
        const piece = pieces[Math.floor((t * 2 + i * 7) % pieces.length)];
        const x = Math.floor(((t * 10 + i * 17) % 1) * (width - 4));
        const y = Math.floor(((t * 5 + i * 13) % 1) * height);
        const rotation = Math.floor(t + i) % 4;
        
        // Draw piece with rotation
        piece.forEach((row, py) => {
            row.forEach((cell, px) => {
                if (cell === '#') {
                    let dx = px, dy = py;
                    // Simple rotation
                    if (rotation === 1) { dx = py; dy = -px; }
                    else if (rotation === 2) { dx = -px; dy = -py; }
                    else if (rotation === 3) { dx = -py; dy = px; }
                    
                    const fx = x + dx + 2;
                    const fy = y + dy + 2;
                    if (fx >= 0 && fx < width && fy >= 0 && fy < height) {
                        buffer[fy][fx] = '#';
                    }
                }
            });
        });
    }
    
    // Stacked blocks at bottom
    for (let y = height - 5; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.sin(x * 0.5 + y) > 0.3) {
                buffer[y][x] = '█';
            }
        }
    }
};

// Scene 63: Pac-Man Chase
CLIFTScenes[63] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Maze pattern
    const mazePattern = [
        '#################',
        '#...............#',
        '#.###.#####.###.#',
        '#...............#',
        '#.###.##.##.###.#',
        '#.....#...#.....#',
        '#####.#...#.#####',
        '#.....#...#.....#',
        '#.###.#####.###.#',
        '#...............#',
        '#.###.#####.###.#',
        '#...............#',
        '#################'
    ];
    
    // Draw maze (centered and tiled)
    const offsetX = Math.floor((width - 17) / 2);
    const offsetY = Math.floor((height - 13) / 2);
    
    mazePattern.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            const px = offsetX + x;
            const py = offsetY + y;
            if (px >= 0 && px < width && py >= 0 && py < height) {
                if (row[x] === '#') {
                    buffer[py][px] = '█';
                } else if (row[x] === '.') {
                    // Animated dots
                    if (Math.sin(t * 5 + x + y) > 0) {
                        buffer[py][px] = '·';
                    }
                }
            }
        }
    });
    
    // Pac-Man position
    const pacX = offsetX + 8 + Math.sin(t) * 6;
    const pacY = offsetY + 6 + Math.cos(t * 0.7) * 4;
    
    // Draw Pac-Man (changes based on audio)
    const pacChar = avgAudio > 0.5 ? 'C' : 'c';
    if (Math.floor(pacX) >= 0 && Math.floor(pacX) < width && 
        Math.floor(pacY) >= 0 && Math.floor(pacY) < height) {
        buffer[Math.floor(pacY)][Math.floor(pacX)] = pacChar;
    }
    
    // Draw ghosts
    const ghosts = ['M', 'W', 'A', 'V'];
    ghosts.forEach((ghost, i) => {
        const gx = offsetX + 8 + Math.sin(t * 0.8 + i) * 7;
        const gy = offsetY + 6 + Math.cos(t * 0.6 + i) * 5;
        if (Math.floor(gx) >= 0 && Math.floor(gx) < width && 
            Math.floor(gy) >= 0 && Math.floor(gy) < height) {
            buffer[Math.floor(gy)][Math.floor(gx)] = ghost;
        }
    });
};

// Scene 64: ASCII Arcade
CLIFTScenes[64] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Multiple mini-games on screen
    const gameTime = t * 2;
    const currentGame = Math.floor(gameTime / 5) % 4;
    
    // Game borders
    const sections = 4;
    const sectionWidth = Math.floor(width / sections);
    
    for (let s = 0; s < sections; s++) {
        const x0 = s * sectionWidth;
        const x1 = (s + 1) * sectionWidth - 1;
        
        // Vertical dividers
        if (s < sections - 1) {
            for (let y = 0; y < height; y++) {
                buffer[y][x1] = '|';
            }
        }
        
        // Mini game in each section
        const localT = t + s * 0.5;
        const centerX = x0 + sectionWidth / 2;
        
        switch (s % 4) {
            case 0: // Bouncing ball
                const ballY = Math.abs(Math.sin(localT * 3)) * (height - 2) + 1;
                buffer[Math.floor(ballY)][Math.floor(centerX)] = 'O';
                break;
                
            case 1: // Rotating spinner
                const angle = localT * 4;
                const spinChars = ['|', '/', '-', '\\'];
                const spinChar = spinChars[Math.floor(angle) % 4];
                buffer[Math.floor(height / 2)][Math.floor(centerX)] = spinChar;
                break;
                
            case 2: // Jumping character
                const jumpY = height - 3 - Math.abs(Math.sin(localT * 2)) * 5;
                buffer[Math.floor(jumpY)][Math.floor(centerX)] = '@';
                buffer[height - 2][Math.floor(centerX - 2)] = '===';
                buffer[height - 2][Math.floor(centerX - 1)] = '===';
                buffer[height - 2][Math.floor(centerX)] = '===';
                buffer[height - 2][Math.floor(centerX + 1)] = '===';
                buffer[height - 2][Math.floor(centerX + 2)] = '===';
                break;
                
            case 3: // Snake pattern
                for (let i = 0; i < 8; i++) {
                    const sx = centerX + Math.sin(localT + i * 0.3) * 5;
                    const sy = height / 2 + Math.cos(localT + i * 0.3) * 3;
                    if (Math.floor(sx) >= x0 && Math.floor(sx) < x1 && 
                        Math.floor(sy) >= 0 && Math.floor(sy) < height) {
                        buffer[Math.floor(sy)][Math.floor(sx)] = i === 0 ? '@' : '#';
                    }
                }
                break;
        }
    }
    
    // Audio reactive score display
    const score = Math.floor(avgAudio * 9999);
    const scoreStr = `SCORE: ${score}`;
    for (let i = 0; i < scoreStr.length; i++) {
        if (i < width) {
            buffer[0][i] = scoreStr[i];
        }
    }
};

// Scene 65: Missile Command
CLIFTScenes[65] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Cities at bottom
    const cities = [
        { x: width * 0.2, intact: true },
        { x: width * 0.4, intact: true },
        { x: width * 0.6, intact: true },
        { x: width * 0.8, intact: true }
    ];
    
    // Draw cities
    cities.forEach(city => {
        const x = Math.floor(city.x);
        if (city.intact) {
            // City buildings
            buffer[height - 3][x - 1] = '█';
            buffer[height - 3][x] = '█';
            buffer[height - 3][x + 1] = '█';
            buffer[height - 2][x - 2] = '█';
            buffer[height - 2][x - 1] = '█';
            buffer[height - 2][x] = '█';
            buffer[height - 2][x + 1] = '█';
            buffer[height - 2][x + 2] = '█';
        }
    });
    
    // Incoming missiles
    const missileCount = 3 + Math.floor(bassLevel * 5);
    for (let i = 0; i < missileCount; i++) {
        const startX = (Math.sin(t * 0.5 + i * 2) + 1) * width / 2;
        const progress = ((t * 0.2 + i * 0.3) % 1);
        const missileX = startX;
        const missileY = progress * height;
        
        // Draw missile trail
        for (let j = 0; j < 5; j++) {
            const ty = missileY - j;
            if (ty >= 0 && ty < height && missileX >= 0 && missileX < width) {
                const char = j === 0 ? 'v' : '.';
                buffer[Math.floor(ty)][Math.floor(missileX)] = char;
            }
        }
    }
    
    // Defense explosions (audio reactive)
    if (bassLevel > 0.5) {
        const explX = Math.floor(Math.random() * width);
        const explY = Math.floor(Math.random() * height * 0.7);
        const explRadius = 2 + Math.floor(bassLevel * 3);
        
        for (let dy = -explRadius; dy <= explRadius; dy++) {
            for (let dx = -explRadius; dx <= explRadius; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= explRadius) {
                    const x = explX + dx;
                    const y = explY + dy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = dist < explRadius / 2 ? '*' : '+';
                    }
                }
            }
        }
    }
    
    // Ground
    for (let x = 0; x < width; x++) {
        buffer[height - 1][x] = '=';
    }
};

// Scene 66: Asteroids Field
CLIFTScenes[66] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize asteroids
    if (!params._asteroids) {
        params._asteroids = [];
        for (let i = 0; i < 15; i++) {
            params._asteroids.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    // Update and draw asteroids
    params._asteroids.forEach(ast => {
        // Update position
        ast.x += ast.vx + avgAudio * ast.vx;
        ast.y += ast.vy + avgAudio * ast.vy;
        ast.rotation += ast.rotSpeed;
        
        // Wrap around screen
        if (ast.x < 0) ast.x = width;
        if (ast.x > width) ast.x = 0;
        if (ast.y < 0) ast.y = height;
        if (ast.y > height) ast.y = 0;
        
        // Draw asteroid shape
        const shapes = ['O', '0', '@', '*'];
        const shapeIndex = Math.floor(ast.size);
        const shape = shapes[Math.min(shapeIndex, shapes.length - 1)];
        
        // Draw with rotation effect
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const dx = Math.cos(a + ast.rotation) * ast.size;
            const dy = Math.sin(a + ast.rotation) * ast.size * 0.5;
            const px = Math.floor(ast.x + dx);
            const py = Math.floor(ast.y + dy);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = shape;
            }
        }
    });
    
    // Player ship in center
    const shipX = width / 2 + Math.sin(t) * 10;
    const shipY = height / 2 + Math.cos(t * 0.7) * 5;
    const shipAngle = t;
    
    // Draw ship
    const shipPoints = [
        { x: 0, y: -2 },
        { x: -1, y: 1 },
        { x: 1, y: 1 }
    ];
    
    shipPoints.forEach(point => {
        const rotX = point.x * Math.cos(shipAngle) - point.y * Math.sin(shipAngle);
        const rotY = point.x * Math.sin(shipAngle) + point.y * Math.cos(shipAngle);
        const px = Math.floor(shipX + rotX);
        const py = Math.floor(shipY + rotY);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = 'A';
        }
    });
    
    // Laser shots (audio reactive)
    if (avgAudio > 0.4) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const dist = 5 + avgAudio * 10;
            const lx = Math.floor(shipX + Math.cos(angle) * dist);
            const ly = Math.floor(shipY + Math.sin(angle) * dist);
            
            if (lx >= 0 && lx < width && ly >= 0 && ly < height) {
                buffer[ly][lx] = '-';
            }
        }
    }
};

// Scene 67: Centipede
CLIFTScenes[67] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Centipede segments
    const segmentCount = 20;
    const waveSpeed = 2 + avgAudio * 3;
    
    // Draw mushrooms
    for (let i = 0; i < 30; i++) {
        const mx = Math.floor(Math.sin(i * 7.3) * width / 2 + width / 2);
        const my = Math.floor(Math.sin(i * 5.7) * height / 3 + height / 3);
        if (mx >= 0 && mx < width && my >= 0 && my < height) {
            buffer[my][mx] = 'T';
        }
    }
    
    // Draw centipede
    for (let i = 0; i < segmentCount; i++) {
        const offset = i * 0.3;
        const x = (t * waveSpeed + offset) % (width * 2);
        const row = Math.floor((t * waveSpeed + offset) / (width * 2)) % (height - 5);
        
        // Zigzag pattern
        const actualX = row % 2 === 0 ? x % width : width - (x % width) - 1;
        const y = row + 2;
        
        if (actualX >= 0 && actualX < width && y >= 0 && y < height) {
            // Head is different
            if (i === 0) {
                buffer[y][Math.floor(actualX)] = '@';
            } else {
                buffer[y][Math.floor(actualX)] = 'o';
            }
        }
    }
    
    // Player at bottom
    const playerX = Math.floor(width / 2 + Math.sin(t * 2) * 20);
    if (playerX >= 0 && playerX < width - 2) {
        buffer[height - 2][playerX] = '^';
        buffer[height - 2][playerX - 1] = '<';
        buffer[height - 2][playerX + 1] = '>';
    }
    
    // Shooting (audio reactive)
    if (avgAudio > 0.4) {
        for (let y = height - 3; y >= 0; y -= 2) {
            if (Math.random() < 0.3) {
                buffer[y][playerX] = '|';
            }
        }
    }
};

// Scene 68: Breakout Bricks
CLIFTScenes[68] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize game state
    if (!params._breakoutState) {
        params._breakoutState = {
            bricks: [],
            ballX: width / 2,
            ballY: height - 5,
            ballVX: 1,
            ballVY: -1,
            paddleX: width / 2
        };
        
        // Create bricks
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                params._breakoutState.bricks.push({
                    x: col * 7 + 5,
                    y: row * 2 + 2,
                    width: 6,
                    alive: true,
                    char: row < 2 ? '=' : row < 4 ? '-' : '.'
                });
            }
        }
    }
    
    const state = params._breakoutState;
    const ballSpeed = 0.5 + avgAudio;
    
    // Update ball
    state.ballX += state.ballVX * ballSpeed;
    state.ballY += state.ballVY * ballSpeed;
    
    // Ball collision with walls
    if (state.ballX <= 0 || state.ballX >= width - 1) {
        state.ballVX = -state.ballVX;
    }
    if (state.ballY <= 0) {
        state.ballVY = Math.abs(state.ballVY);
    }
    
    // Ball reset if it goes off bottom
    if (state.ballY > height) {
        state.ballY = height - 5;
        state.ballX = width / 2;
        state.ballVY = -1;
    }
    
    // Paddle movement (follows sine wave)
    state.paddleX = width / 2 + Math.sin(t) * 20;
    
    // Ball collision with paddle
    const paddleWidth = 8;
    if (state.ballY >= height - 3 && state.ballY <= height - 2 &&
        Math.abs(state.ballX - state.paddleX) < paddleWidth / 2) {
        state.ballVY = -Math.abs(state.ballVY);
        state.ballVX += (state.ballX - state.paddleX) * 0.2;
    }
    
    // Draw bricks
    state.bricks.forEach(brick => {
        if (brick.alive) {
            // Check collision with ball
            if (Math.abs(state.ballX - brick.x) < brick.width / 2 &&
                Math.abs(state.ballY - brick.y) < 1) {
                brick.alive = false;
                state.ballVY = -state.ballVY;
            }
            
            // Draw brick
            for (let i = 0; i < brick.width; i++) {
                const bx = Math.floor(brick.x - brick.width / 2 + i);
                if (bx >= 0 && bx < width) {
                    buffer[brick.y][bx] = brick.char;
                }
            }
        }
    });
    
    // Draw paddle
    for (let i = -paddleWidth / 2; i < paddleWidth / 2; i++) {
        const px = Math.floor(state.paddleX + i);
        if (px >= 0 && px < width) {
            buffer[height - 2][px] = '=';
        }
    }
    
    // Draw ball
    const bx = Math.floor(state.ballX);
    const by = Math.floor(state.ballY);
    if (bx >= 0 && bx < width && by >= 0 && by < height) {
        buffer[by][bx] = 'O';
    }
    
    // Revive some bricks occasionally
    if (Math.random() < 0.01) {
        const deadBricks = state.bricks.filter(b => !b.alive);
        if (deadBricks.length > 0) {
            deadBricks[Math.floor(Math.random() * deadBricks.length)].alive = true;
        }
    }
};

// Scene 69: Donkey Kong
CLIFTScenes[69] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Platform levels
    const platforms = [
        { y: height - 2, slope: 0 },
        { y: height - 6, slope: 0.1 },
        { y: height - 10, slope: -0.1 },
        { y: height - 14, slope: 0.1 },
        { y: height - 18, slope: -0.1 }
    ];
    
    // Draw platforms
    platforms.forEach((platform, level) => {
        for (let x = 0; x < width; x++) {
            const py = Math.floor(platform.y + x * platform.slope);
            if (py >= 0 && py < height) {
                buffer[py][x] = '=';
                // Ladders
                if (x % 15 === 10 && level < platforms.length - 1) {
                    for (let ly = py - 1; ly > platforms[level + 1].y; ly--) {
                        if (ly >= 0) buffer[ly][x] = 'H';
                    }
                }
            }
        }
    });
    
    // Mario position
    const marioLevel = Math.floor(t / 3) % platforms.length;
    const marioX = ((t * 10) % width);
    const marioY = platforms[marioLevel].y - 1 + marioX * platforms[marioLevel].slope;
    
    // Draw Mario
    if (Math.floor(marioX) >= 0 && Math.floor(marioX) < width && 
        Math.floor(marioY) >= 0 && Math.floor(marioY) < height) {
        buffer[Math.floor(marioY)][Math.floor(marioX)] = 'M';
    }
    
    // Barrels (audio reactive)
    const barrelCount = 3 + Math.floor(bassLevel * 5);
    for (let i = 0; i < barrelCount; i++) {
        const barrelProgress = ((t * 0.5 + i * 0.2) % 1);
        const barrelLevel = Math.floor(barrelProgress * platforms.length);
        const platform = platforms[barrelLevel];
        const barrelX = barrelProgress * width;
        const barrelY = platform.y - 1 + barrelX * platform.slope;
        
        if (Math.floor(barrelX) >= 0 && Math.floor(barrelX) < width && 
            Math.floor(barrelY) >= 0 && Math.floor(barrelY) < height) {
            buffer[Math.floor(barrelY)][Math.floor(barrelX)] = 'O';
        }
    }
    
    // DK at top
    const dkX = width / 2;
    const dkY = 2;
    if (dkX - 1 >= 0 && dkX + 1 < width) {
        buffer[dkY][Math.floor(dkX - 1)] = '[';
        buffer[dkY][Math.floor(dkX)] = bassLevel > 0.5 ? 'D' : 'K';
        buffer[dkY][Math.floor(dkX + 1)] = ']';
    }
    
    // Princess at top platform
    buffer[platforms[platforms.length - 1].y - 1][Math.floor(width / 2 + 5)] = 'P';
};

// Category 7: Natural & Organic (70-79)

// Scene 70: Tree of Life
CLIFTScenes[70] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Tree trunk
    const trunkX = width / 2;
    const trunkHeight = height * 0.4;
    
    for (let y = height - 1; y > height - trunkHeight; y--) {
        const trunkWidth = 3 + (height - y) * 0.1;
        for (let dx = -trunkWidth / 2; dx <= trunkWidth / 2; dx++) {
            const x = Math.floor(trunkX + dx);
            if (x >= 0 && x < width) {
                buffer[y][x] = '|';
            }
        }
    }
    
    // Recursive branch drawing
    function drawBranch(x, y, angle, length, depth) {
        if (depth <= 0 || length < 1 || y < 0) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y - Math.sin(angle) * length * 0.5;
        
        // Draw branch line
        const steps = Math.max(3, length);
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const bx = Math.floor(x + (endX - x) * t);
            const by = Math.floor(y + (endY - y) * t);
            
            if (bx >= 0 && bx < width && by >= 0 && by < height) {
                buffer[by][bx] = depth > 2 ? '/' : '*';
            }
        }
        
        // Audio reactive branching
        const branchFactor = 0.7 + avgAudio * 0.3;
        
        // Sub-branches
        drawBranch(endX, endY, angle - 0.4 + Math.sin(t + depth) * 0.2, 
                  length * branchFactor, depth - 1);
        drawBranch(endX, endY, angle + 0.4 + Math.cos(t + depth) * 0.2, 
                  length * branchFactor, depth - 1);
    }
    
    // Main branches
    const mainBranches = 5;
    for (let i = 0; i < mainBranches; i++) {
        const angle = -Math.PI / 2 + (i - 2) * 0.3;
        const startY = height - trunkHeight + i * 2;
        drawBranch(trunkX, startY, angle, 8 + avgAudio * 5, 4);
    }
    
    // Falling leaves (audio reactive)
    const leafCount = Math.floor(10 + avgAudio * 20);
    for (let i = 0; i < leafCount; i++) {
        const leafX = (Math.sin(t + i) + 1) * width / 2;
        const leafY = ((t * 5 + i * 3) % 1) * height;
        const leafChar = Math.random() > 0.5 ? '*' : '+';
        
        if (Math.floor(leafX) >= 0 && Math.floor(leafX) < width && 
            Math.floor(leafY) >= 0 && Math.floor(leafY) < height) {
            buffer[Math.floor(leafY)][Math.floor(leafX)] = leafChar;
        }
    }
};

// Scene 71: Ocean Waves
CLIFTScenes[71] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Multiple wave layers
    for (let y = 0; y < height; y++) {
        const waveOffset = y * 0.1;
        
        for (let x = 0; x < width; x++) {
            // Primary wave
            const wave1 = Math.sin(x * 0.1 + t * 2 - waveOffset) * (3 + avgAudio * 5);
            const wave2 = Math.sin(x * 0.05 + t * 1.5 - waveOffset * 0.5) * (2 + avgAudio * 3);
            const wave3 = Math.sin(x * 0.2 + t * 3 - waveOffset * 2) * (1 + avgAudio * 2);
            
            const totalWave = wave1 + wave2 + wave3;
            const waveHeight = height / 2 + totalWave;
            
            // Determine character based on position relative to wave
            if (y > waveHeight + 2) {
                // Deep water
                buffer[y][x] = '≈';
            } else if (y > waveHeight) {
                // Wave crest
                buffer[y][x] = '~';
            } else if (y > waveHeight - 1) {
                // Foam
                if (Math.random() < 0.3 + avgAudio * 0.4) {
                    buffer[y][x] = '°';
                }
            } else if (y < 5) {
                // Sky with birds
                if (Math.random() < 0.001) {
                    buffer[y][x] = Math.random() > 0.5 ? '^' : 'v';
                }
            }
        }
    }
    
    // Add some fish
    const fishCount = 3 + Math.floor(avgAudio * 5);
    for (let i = 0; i < fishCount; i++) {
        const fishX = (Math.sin(t * 0.5 + i * 2) + 1) * width / 2;
        const fishY = height * 0.6 + Math.sin(t + i) * 5;
        const fishDir = Math.cos(t + i) > 0;
        
        if (Math.floor(fishX) >= 1 && Math.floor(fishX) < width - 1 && 
            Math.floor(fishY) >= 0 && Math.floor(fishY) < height) {
            if (fishDir) {
                buffer[Math.floor(fishY)][Math.floor(fishX) - 1] = '<';
                buffer[Math.floor(fishY)][Math.floor(fishX)] = '>';
            } else {
                buffer[Math.floor(fishY)][Math.floor(fishX)] = '<';
                buffer[Math.floor(fishY)][Math.floor(fishX) + 1] = '>';
            }
        }
    }
};

// Scene 72: Flower Garden
CLIFTScenes[72] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Ground
    for (let x = 0; x < width; x++) {
        buffer[height - 1][x] = '_';
        buffer[height - 2][x] = Math.random() > 0.5 ? '.' : ',';
    }
    
    // Flowers
    const flowerCount = 15 + Math.floor(avgAudio * 10);
    for (let i = 0; i < flowerCount; i++) {
        const flowerX = Math.floor((Math.sin(i * 3.7) + 1) * width / 2);
        const stemHeight = 3 + Math.floor(Math.sin(i * 2.3) * 2 + avgAudio * 3);
        
        // Flower patterns
        const patterns = [
            ['*', '|'], // Simple
            ['@', '|'], // Round
            ['+', '|'], // Cross
            ['¤', '|'], // Fancy
            ['§', '|']  // Special
        ];
        
        const pattern = patterns[i % patterns.length];
        const sway = Math.sin(t * 2 + i) * avgAudio;
        
        // Draw stem
        for (let h = 0; h < stemHeight; h++) {
            const y = height - 3 - h;
            const x = Math.floor(flowerX + sway * h * 0.1);
            if (x >= 0 && x < width && y >= 0) {
                buffer[y][x] = pattern[1];
            }
        }
        
        // Draw flower head
        const headY = height - 3 - stemHeight;
        const headX = Math.floor(flowerX + sway * stemHeight * 0.1);
        
        if (headY >= 0 && headY < height - 1) {
            // Petals
            const petalSize = 1 + Math.floor(avgAudio * 2);
            for (let dy = -petalSize; dy <= petalSize; dy++) {
                for (let dx = -petalSize; dx <= petalSize; dx++) {
                    if (Math.abs(dx) + Math.abs(dy) <= petalSize) {
                        const px = headX + dx;
                        const py = headY + dy;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            if (dx === 0 && dy === 0) {
                                buffer[py][px] = pattern[0];
                            } else if (Math.random() > 0.3) {
                                buffer[py][px] = '*';
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Butterflies
    const butterflyCount = 2 + Math.floor(avgAudio * 3);
    for (let i = 0; i < butterflyCount; i++) {
        const bx = (Math.sin(t + i * 2) + 1) * width / 2;
        const by = height / 3 + Math.sin(t * 2 + i) * height / 4;
        
        if (Math.floor(bx) >= 1 && Math.floor(bx) < width - 1 && 
            Math.floor(by) >= 0 && Math.floor(by) < height) {
            buffer[Math.floor(by)][Math.floor(bx) - 1] = '(';
            buffer[Math.floor(by)][Math.floor(bx)] = '8';
            buffer[Math.floor(by)][Math.floor(bx) + 1] = ')';
        }
    }
};

// Scene 73: Mountain Range
CLIFTScenes[73] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Multiple mountain layers for depth
    const layers = [
        { amplitude: height * 0.8, frequency: 0.02, char: '#', offset: 0 },
        { amplitude: height * 0.6, frequency: 0.03, char: '*', offset: 10 },
        { amplitude: height * 0.4, frequency: 0.04, char: '+', offset: 20 },
        { amplitude: height * 0.2, frequency: 0.05, char: '-', offset: 30 }
    ];
    
    // Draw each mountain layer
    layers.forEach((layer, layerIndex) => {
        for (let x = 0; x < width; x++) {
            // Mountain height calculation
            const phase = x * layer.frequency + layer.offset + t * 0.1 * (layerIndex + 1);
            const mountain1 = Math.sin(phase) * layer.amplitude / 2;
            const mountain2 = Math.sin(phase * 1.7) * layer.amplitude / 3;
            const mountain3 = Math.sin(phase * 3.1) * layer.amplitude / 4;
            
            const mountainHeight = height - (mountain1 + mountain2 + mountain3 + layer.amplitude / 2);
            const audioMod = avgAudio * Math.sin(x * 0.1 + t) * 3;
            const finalHeight = Math.floor(mountainHeight + audioMod);
            
            // Fill mountain
            for (let y = finalHeight; y < height; y++) {
                if (y >= 0 && y < height) {
                    // Only draw if not already drawn by a previous layer
                    if (buffer[y][x] === ' ' || layerIndex === 0) {
                        buffer[y][x] = layer.char;
                    }
                }
            }
            
            // Snow caps on tallest peaks
            if (finalHeight < height * 0.3 && layerIndex === 0) {
                if (finalHeight >= 0) {
                    buffer[finalHeight][x] = '^';
                }
            }
        }
    });
    
    // Stars in sky
    for (let i = 0; i < 20; i++) {
        const starX = Math.floor(Math.sin(i * 7.3) * width / 2 + width / 2);
        const starY = Math.floor(Math.sin(i * 5.7) * height / 4 + height / 6);
        if (starX >= 0 && starX < width && starY >= 0 && starY < height) {
            if (buffer[starY][starX] === ' ') {
                buffer[starY][starX] = Math.random() > 0.5 ? '.' : '*';
            }
        }
    }
    
    // Moon
    const moonX = Math.floor(width * 0.8);
    const moonY = Math.floor(height * 0.2);
    const moonPhase = Math.floor(t / 5) % 8;
    const moonChars = ['O', ')', 'D', 'C', 'O', '(', 'D', 'C'];
    if (moonX >= 0 && moonX < width && moonY >= 0 && moonY < height) {
        buffer[moonY][moonX] = moonChars[moonPhase];
    }
};

// Scene 74: Lightning Storm
CLIFTScenes[74] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Rain effect
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const rainChance = 0.02 + bassLevel * 0.08;
            if (Math.random() < rainChance) {
                const rainPhase = (t * 20 + x * 0.1 + y * 0.5) % 1;
                if (rainPhase < 0.3) buffer[y][x] = '|';
                else if (rainPhase < 0.6) buffer[y][x] = '/';
                else if (rainPhase < 0.9) buffer[y][x] = '\\';
            }
        }
    }
    
    // Lightning bolts (audio triggered)
    if (bassLevel > 0.6 || Math.random() < 0.02) {
        const boltX = Math.floor(Math.random() * width);
        let currentX = boltX;
        
        for (let y = 0; y < height; y++) {
            // Lightning path
            currentX += Math.floor(Math.random() * 3) - 1;
            
            if (currentX >= 0 && currentX < width) {
                buffer[y][currentX] = '#';
                
                // Lightning glow
                if (currentX > 0) buffer[y][currentX - 1] = '+';
                if (currentX < width - 1) buffer[y][currentX + 1] = '+';
                
                // Branches
                if (Math.random() < 0.3) {
                    const branchLength = Math.floor(Math.random() * 5) + 2;
                    const branchDir = Math.random() > 0.5 ? 1 : -1;
                    
                    for (let b = 0; b < branchLength; b++) {
                        const bx = currentX + b * branchDir;
                        const by = y + b;
                        if (bx >= 0 && bx < width && by < height) {
                            buffer[by][bx] = '-';
                        }
                    }
                }
            }
        }
    }
    
    // Storm clouds
    const cloudY = Math.floor(height * 0.2);
    for (let x = 0; x < width; x++) {
        const cloudDensity = Math.sin(x * 0.1 + t) + Math.sin(x * 0.05 - t * 0.5);
        if (cloudDensity > 0.5) {
            for (let cy = 0; cy < cloudY; cy++) {
                if (Math.random() < 0.3) {
                    buffer[cy][x] = '▓';
                }
            }
        }
    }
};

// Scene 75: Coral Reef
CLIFTScenes[75] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Ocean floor
    for (let x = 0; x < width; x++) {
        const sandHeight = height - 2 - Math.floor(Math.sin(x * 0.1) * 2);
        for (let y = sandHeight; y < height; y++) {
            buffer[y][x] = '.';
        }
    }
    
    // Coral formations
    const coralTypes = [
        { char: '§', height: 5, width: 3 },
        { char: '¥', height: 4, width: 2 },
        { char: '∩', height: 3, width: 4 },
        { char: 'Ψ', height: 6, width: 2 }
    ];
    
    for (let i = 0; i < 8; i++) {
        const coral = coralTypes[i % coralTypes.length];
        const baseX = Math.floor((i * 13.7) % width);
        const baseY = height - 3 - Math.floor(Math.sin(i * 2.3) * 3);
        
        // Draw coral with swaying motion
        for (let h = 0; h < coral.height; h++) {
            const sway = Math.sin(t * 2 + i + h * 0.5) * avgAudio * 2;
            for (let w = -coral.width / 2; w <= coral.width / 2; w++) {
                const x = Math.floor(baseX + w + sway);
                const y = baseY - h;
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = coral.char;
                }
            }
        }
    }
    
    // Fish swimming
    const fishCount = 5 + Math.floor(avgAudio * 5);
    for (let i = 0; i < fishCount; i++) {
        const fishX = (t * 10 + i * 17) % width;
        const fishY = height / 2 + Math.sin(t + i) * height / 3;
        const fishType = i % 3;
        
        if (Math.floor(fishX) >= 1 && Math.floor(fishX) < width - 2 && 
            Math.floor(fishY) >= 0 && Math.floor(fishY) < height) {
            switch (fishType) {
                case 0:
                    buffer[Math.floor(fishY)][Math.floor(fishX)] = '<';
                    buffer[Math.floor(fishY)][Math.floor(fishX) + 1] = '>';
                    break;
                case 1:
                    buffer[Math.floor(fishY)][Math.floor(fishX)] = '>';
                    buffer[Math.floor(fishY)][Math.floor(fishX) + 1] = '<';
                    break;
                case 2:
                    buffer[Math.floor(fishY)][Math.floor(fishX)] = '≈';
                    break;
            }
        }
    }
    
    // Bubbles
    const bubbleCount = Math.floor(10 + avgAudio * 20);
    for (let i = 0; i < bubbleCount; i++) {
        const bubbleX = Math.floor(Math.sin(i * 3.7) * width / 2 + width / 2);
        const bubbleY = ((t * 5 + i * 2.3) % 1) * height;
        const bubbleChar = Math.random() > 0.5 ? 'o' : '°';
        
        if (bubbleX >= 0 && bubbleX < width && Math.floor(bubbleY) >= 0 && 
            Math.floor(bubbleY) < height) {
            buffer[Math.floor(bubbleY)][bubbleX] = bubbleChar;
        }
    }
};

// Scene 76: Aurora Borealis
CLIFTScenes[76] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Aurora waves
    for (let y = 0; y < height * 0.7; y++) {
        for (let x = 0; x < width; x++) {
            // Multiple sine waves for aurora effect
            const wave1 = Math.sin(x * 0.05 + t) * 10;
            const wave2 = Math.sin(x * 0.08 - t * 1.3) * 8;
            const wave3 = Math.sin(x * 0.03 + t * 0.7) * 12;
            
            const combinedWave = wave1 + wave2 + wave3;
            const auroraCenter = height * 0.3;
            const auroraY = auroraCenter + combinedWave;
            
            const distance = Math.abs(y - auroraY);
            const intensity = Math.exp(-distance * 0.1) * (0.5 + avgAudio);
            
            if (intensity > 0.2) {
                const chars = [' ', '.', ':', '-', '=', '+', '*', '#'];
                const charIndex = Math.min(Math.floor(intensity * chars.length), chars.length - 1);
                
                // Color variation effect
                if (Math.sin(x * 0.1 + y * 0.1 + t) > 0) {
                    buffer[y][x] = chars[charIndex];
                } else if (Math.cos(x * 0.1 - y * 0.1 + t * 1.5) > 0 && intensity > 0.4) {
                    buffer[y][x] = chars[Math.max(0, charIndex - 1)];
                }
            }
        }
    }
    
    // Stars
    for (let i = 0; i < 30; i++) {
        const starX = Math.floor(Math.sin(i * 7.3) * width / 2 + width / 2);
        const starY = Math.floor(Math.sin(i * 5.7) * height / 2 + height / 4);
        if (starX >= 0 && starX < width && starY >= 0 && starY < height) {
            if (buffer[starY][starX] === ' ') {
                buffer[starY][starX] = Math.sin(t + i) > 0 ? '*' : '.';
            }
        }
    }
    
    // Ground/horizon
    for (let x = 0; x < width; x++) {
        for (let y = Math.floor(height * 0.8); y < height; y++) {
            buffer[y][x] = '_';
        }
    }
};

// Scene 77: Volcano Eruption
CLIFTScenes[77] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Volcano shape
    const volcanoBase = height - 1;
    const volcanoTop = height * 0.3;
    const volcanoCenter = width / 2;
    const craterWidth = 8;
    
    // Draw volcano
    for (let y = volcanoTop; y < volcanoBase; y++) {
        const progress = (y - volcanoTop) / (volcanoBase - volcanoTop);
        const volcanoWidth = progress * width * 0.6;
        
        for (let x = -volcanoWidth / 2; x <= volcanoWidth / 2; x++) {
            const px = Math.floor(volcanoCenter + x);
            const py = Math.floor(y);
            if (px >= 0 && px < width && py >= 0 && py < height) {
                // Crater at top
                if (y === Math.floor(volcanoTop) && 
                    Math.abs(x) < craterWidth / 2) {
                    continue;
                }
                buffer[py][px] = '#';
            }
        }
    }
    
    // Lava eruption (audio reactive)
    const eruptionStrength = bassLevel;
    const particleCount = Math.floor(20 + eruptionStrength * 40);
    
    for (let i = 0; i < particleCount; i++) {
        const age = ((t * 2 + i * 0.1) % 1);
        const vx = (Math.random() - 0.5) * 20;
        const vy = -15 - eruptionStrength * 10;
        
        const px = volcanoCenter + vx * age;
        const py = volcanoTop + vy * age + 0.5 * 9.8 * age * age;
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            const char = age < 0.3 ? '@' : age < 0.6 ? '*' : '+';
            buffer[Math.floor(py)][Math.floor(px)] = char;
        }
    }
    
    // Lava flow
    for (let y = Math.floor(volcanoTop) + 1; y < height; y++) {
        const flowWidth = Math.sin(y * 0.2 + t) * 3 + craterWidth / 2;
        for (let x = -flowWidth; x <= flowWidth; x++) {
            const px = Math.floor(volcanoCenter + x + Math.sin(y * 0.3 + t * 2) * 2);
            if (px >= 0 && px < width && buffer[y][px] === '#') {
                if (Math.random() < 0.3 + bassLevel * 0.5) {
                    buffer[y][px] = '≈';
                }
            }
        }
    }
    
    // Smoke clouds
    for (let i = 0; i < 10; i++) {
        const smokeX = volcanoCenter + (Math.random() - 0.5) * 20;
        const smokeY = volcanoTop - 5 - i * 2;
        const smokeRadius = 2 + i * 0.5;
        
        if (smokeY >= 0) {
            for (let dx = -smokeRadius; dx <= smokeRadius; dx++) {
                const px = Math.floor(smokeX + dx);
                if (px >= 0 && px < width && Math.random() < 0.5) {
                    buffer[Math.floor(smokeY)][px] = '°';
                }
            }
        }
    }
};

// Scene 78: Desert Mirage
CLIFTScenes[78] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Desert dunes
    for (let x = 0; x < width; x++) {
        const dune1 = Math.sin(x * 0.05) * height * 0.2;
        const dune2 = Math.sin(x * 0.03 + 2) * height * 0.15;
        const dune3 = Math.sin(x * 0.08 - 1) * height * 0.1;
        
        const duneHeight = height * 0.7 + dune1 + dune2 + dune3;
        
        // Mirage effect (heat shimmer)
        const shimmer = Math.sin(x * 0.2 + t * 5) * avgAudio * 2;
        
        for (let y = Math.floor(duneHeight + shimmer); y < height; y++) {
            if (y >= 0 && y < height) {
                // Sand texture
                if (Math.random() > 0.3) {
                    buffer[y][x] = '.';
                } else if (Math.random() > 0.5) {
                    buffer[y][x] = ':';
                }
            }
        }
    }
    
    // Oasis mirage (appears and disappears)
    const mirageStrength = (Math.sin(t * 0.5) + 1) / 2 * avgAudio;
    if (mirageStrength > 0.3) {
        const oasisX = width / 2 + Math.sin(t * 0.3) * 10;
        const oasisY = height * 0.6;
        const oasisRadius = 5 + mirageStrength * 5;
        
        // Water
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -oasisRadius; dx <= oasisRadius; dx++) {
                const px = Math.floor(oasisX + dx);
                const py = Math.floor(oasisY + dy);
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    if (Math.abs(dx) + Math.abs(dy) * 2 < oasisRadius) {
                        buffer[py][px] = '~';
                    }
                }
            }
        }
        
        // Palm trees
        for (let i = -1; i <= 1; i++) {
            const palmX = Math.floor(oasisX + i * 6);
            const palmY = Math.floor(oasisY - 3);
            
            if (palmX >= 0 && palmX < width && palmY >= 0 && palmY < height - 3) {
                // Trunk
                for (let h = 0; h < 4; h++) {
                    buffer[palmY + h][palmX] = '|';
                }
                // Fronds
                if (palmY - 1 >= 0 && palmX - 1 >= 0 && palmX + 1 < width) {
                    buffer[palmY - 1][palmX - 1] = '\\';
                    buffer[palmY - 1][palmX] = '|';
                    buffer[palmY - 1][palmX + 1] = '/';
                }
            }
        }
    }
    
    // Sun
    const sunX = Math.floor(width * 0.8);
    const sunY = Math.floor(height * 0.2 + Math.sin(t * 0.2) * 2);
    const sunRadius = 3;
    
    for (let dy = -sunRadius; dy <= sunRadius; dy++) {
        for (let dx = -sunRadius; dx <= sunRadius; dx++) {
            if (dx * dx + dy * dy <= sunRadius * sunRadius) {
                const px = sunX + dx;
                const py = sunY + dy;
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    buffer[py][px] = '@';
                }
            }
        }
    }
    
    // Heat waves
    for (let y = 0; y < height * 0.7; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.02 * mirageStrength && buffer[y][x] === ' ') {
                buffer[y][x] = '°';
            }
        }
    }
};

// Scene 79: Forest Fire
CLIFTScenes[79] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Trees
    const treeCount = 15;
    for (let i = 0; i < treeCount; i++) {
        const treeX = Math.floor((i / treeCount) * width + Math.sin(i * 2.3) * 5);
        const treeHeight = 6 + Math.floor(Math.sin(i * 3.7) * 3);
        const isOnFire = Math.sin(t * 0.5 + i) > 0.3 - avgAudio;
        
        // Tree trunk
        for (let h = 0; h < treeHeight; h++) {
            const y = height - 2 - h;
            if (treeX >= 0 && treeX < width && y >= 0) {
                buffer[y][treeX] = isOnFire && h > treeHeight / 2 ? '!' : '|';
            }
        }
        
        // Tree crown
        if (!isOnFire) {
            const crownY = height - 2 - treeHeight;
            const crownRadius = 2;
            for (let dy = -crownRadius; dy <= crownRadius; dy++) {
                for (let dx = -crownRadius; dx <= crownRadius; dx++) {
                    if (Math.abs(dx) + Math.abs(dy) <= crownRadius) {
                        const px = treeX + dx;
                        const py = crownY + dy;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            buffer[py][px] = '*';
                        }
                    }
                }
            }
        } else {
            // Fire on tree
            const fireHeight = treeHeight * (0.5 + bassLevel * 0.5);
            for (let h = 0; h < fireHeight; h++) {
                const y = height - 2 - treeHeight + h;
                const fireWidth = 1 + (fireHeight - h) / 2;
                
                for (let dx = -fireWidth; dx <= fireWidth; dx++) {
                    const px = treeX + dx;
                    if (px >= 0 && px < width && y >= 0 && y < height) {
                        const fireChar = Math.random() > 0.5 ? '^' : 
                                       Math.random() > 0.5 ? 'A' : 'V';
                        buffer[y][px] = fireChar;
                    }
                }
            }
        }
    }
    
    // Ground fire spread
    const fireSpread = avgAudio;
    for (let x = 0; x < width; x++) {
        if (Math.sin(x * 0.1 + t * 2) * fireSpread > 0.3) {
            buffer[height - 1][x] = Math.random() > 0.5 ? '.' : ',';
            if (Math.random() < fireSpread * 0.5) {
                buffer[height - 2][x] = '^';
            }
        }
    }
    
    // Smoke
    for (let i = 0; i < 30; i++) {
        const smokeX = Math.floor(Math.sin(i * 2.3 + t) * width / 2 + width / 2);
        const smokeY = (t * 10 + i * 3) % (height * 0.7);
        const smokeChar = Math.random() > 0.5 ? '°' : 'o';
        
        if (smokeX >= 0 && smokeX < width && Math.floor(smokeY) >= 0 && 
            Math.floor(smokeY) < height) {
            buffer[Math.floor(smokeY)][smokeX] = smokeChar;
        }
    }
    
    // Ember particles
    const emberCount = Math.floor(10 + bassLevel * 20);
    for (let i = 0; i < emberCount; i++) {
        const emberX = Math.random() * width;
        const emberY = height - 5 - ((t * 20 + i * 5) % (height - 5));
        
        if (Math.floor(emberX) >= 0 && Math.floor(emberX) < width && 
            Math.floor(emberY) >= 0 && Math.floor(emberY) < height) {
            buffer[Math.floor(emberY)][Math.floor(emberX)] = '*';
        }
    }
};

// Category 8: Tech & Digital (80-89)

// Scene 80: Circuit Board
CLIFTScenes[80] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Circuit traces
    const traces = [];
    for (let i = 0; i < 10; i++) {
        traces.push({
            startX: Math.floor(Math.random() * width),
            startY: Math.floor(Math.random() * height),
            endX: Math.floor(Math.random() * width),
            endY: Math.floor(Math.random() * height),
            active: Math.sin(t + i) > 0
        });
    }
    
    // Draw PCB background
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if ((x + y) % 10 === 0) {
                buffer[y][x] = '·';
            }
        }
    }
    
    // Draw traces
    traces.forEach((trace, i) => {
        const char = trace.active ? '=' : '-';
        // Horizontal segment
        const midY = Math.floor((trace.startY + trace.endY) / 2);
        for (let x = Math.min(trace.startX, trace.endX); x <= Math.max(trace.startX, trace.endX); x++) {
            if (x >= 0 && x < width && midY >= 0 && midY < height) {
                buffer[midY][x] = char;
            }
        }
        // Vertical segments
        for (let y = Math.min(trace.startY, midY); y <= Math.max(trace.startY, midY); y++) {
            if (trace.startX >= 0 && trace.startX < width && y >= 0 && y < height) {
                buffer[y][trace.startX] = char;
            }
        }
        for (let y = Math.min(midY, trace.endY); y <= Math.max(midY, trace.endY); y++) {
            if (trace.endX >= 0 && trace.endX < width && y >= 0 && y < height) {
                buffer[y][trace.endX] = char;
            }
        }
    });
    
    // Draw components
    const componentCount = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < componentCount; i++) {
        const cx = Math.floor(Math.sin(i * 3.7) * width / 2 + width / 2);
        const cy = Math.floor(Math.cos(i * 2.3) * height / 2 + height / 2);
        
        if (cx >= 1 && cx < width - 1 && cy >= 0 && cy < height) {
            // IC chip
            buffer[cy][cx - 1] = '[';
            buffer[cy][cx] = Math.sin(t * 5 + i) > 0 ? '@' : 'O';
            buffer[cy][cx + 1] = ']';
        }
    }
    
    // Animated electrons (audio reactive)
    const electronCount = Math.floor(avgAudio * 20);
    for (let i = 0; i < electronCount; i++) {
        const progress = ((t * 2 + i * 0.1) % 1);
        const traceIndex = i % traces.length;
        const trace = traces[traceIndex];
        
        if (trace.active) {
            const x = trace.startX + (trace.endX - trace.startX) * progress;
            const y = trace.startY + (trace.endY - trace.startY) * progress;
            
            if (Math.floor(x) >= 0 && Math.floor(x) < width && 
                Math.floor(y) >= 0 && Math.floor(y) < height) {
                buffer[Math.floor(y)][Math.floor(x)] = '*';
            }
        }
    }
};

// Scene 81: Binary Matrix
CLIFTScenes[81] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Binary data streams
    for (let x = 0; x < width; x++) {
        const columnSpeed = 0.5 + Math.sin(x * 0.1) * 0.3 + avgAudio;
        const offset = (t * columnSpeed * 10 + x * 2) % (height * 2);
        
        for (let y = 0; y < height; y++) {
            const charPos = (y + offset) % (height * 2);
            
            if (charPos < height) {
                // Binary digits
                const isBright = charPos < 3 || (charPos > height - 5 && charPos < height - 2);
                
                if (Math.random() < 0.9) {
                    if (isBright) {
                        buffer[y][x] = Math.random() > 0.5 ? '1' : '0';
                    } else {
                        const dimChance = 1 - (Math.abs(charPos - height/2) / (height/2));
                        if (Math.random() < dimChance * 0.7) {
                            buffer[y][x] = Math.random() > 0.5 ? '1' : '0';
                        }
                    }
                }
            }
        }
    }
    
    // Glitch blocks (audio reactive)
    if (avgAudio > 0.5) {
        const glitchCount = Math.floor(avgAudio * 5);
        for (let i = 0; i < glitchCount; i++) {
            const gx = Math.floor(Math.random() * width);
            const gy = Math.floor(Math.random() * height);
            const gw = Math.floor(Math.random() * 10 + 5);
            const gh = Math.floor(Math.random() * 3 + 1);
            
            for (let dy = 0; dy < gh; dy++) {
                for (let dx = 0; dx < gw; dx++) {
                    const x = gx + dx;
                    const y = gy + dy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = Math.random() > 0.5 ? '█' : '▓';
                    }
                }
            }
        }
    }
};

// Scene 82: Network Visualization
CLIFTScenes[82] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize network nodes
    if (!params._networkNodes) {
        params._networkNodes = [];
        for (let i = 0; i < 12; i++) {
            params._networkNodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                type: Math.floor(Math.random() * 3),
                connections: []
            });
        }
        
        // Create connections
        params._networkNodes.forEach((node, i) => {
            const numConnections = 2 + Math.floor(Math.random() * 2);
            for (let j = 0; j < numConnections; j++) {
                const target = Math.floor(Math.random() * params._networkNodes.length);
                if (target !== i) {
                    node.connections.push(target);
                }
            }
        });
    }
    
    const nodes = params._networkNodes;
    
    // Update nodes
    nodes.forEach(node => {
        node.x += node.vx + Math.sin(t + node.x * 0.1) * 0.2;
        node.y += node.vy + Math.cos(t + node.y * 0.1) * 0.1;
        
        // Bounce off walls
        if (node.x < 0 || node.x > width) node.vx = -node.vx;
        if (node.y < 0 || node.y > height) node.vy = -node.vy;
        
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
    });
    
    // Draw connections with data packets
    nodes.forEach((node, i) => {
        node.connections.forEach((targetIdx, connIdx) => {
            const target = nodes[targetIdx];
            
            // Draw connection line
            const steps = 20;
            for (let s = 0; s < steps; s++) {
                const t = s / steps;
                const x = Math.floor(node.x + (target.x - node.x) * t);
                const y = Math.floor(node.y + (target.y - node.y) * t);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '.';
                }
            }
            
            // Animated data packets
            const packetProgress = ((time * 0.002 + i + connIdx * 0.3) % 1);
            const px = Math.floor(node.x + (target.x - node.x) * packetProgress);
            const py = Math.floor(node.y + (target.y - node.y) * packetProgress);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = avgAudio > 0.5 ? '@' : '*';
            }
        });
    });
    
    // Draw nodes
    const nodeChars = ['[O]', '{#}', '<*>'];
    nodes.forEach(node => {
        const x = Math.floor(node.x);
        const y = Math.floor(node.y);
        const nodeChar = nodeChars[node.type];
        
        for (let i = 0; i < nodeChar.length; i++) {
            if (x - 1 + i >= 0 && x - 1 + i < width && y >= 0 && y < height) {
                buffer[y][x - 1 + i] = nodeChar[i];
            }
        }
    });
};

// Scene 83: Blockchain Visualization
CLIFTScenes[83] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Block dimensions
    const blockWidth = 12;
    const blockHeight = 5;
    const blockSpacing = 3;
    
    // Calculate visible blocks
    const totalBlocks = 10;
    const scrollOffset = (t * 5) % ((blockWidth + blockSpacing) * 2);
    
    // Draw blockchain
    for (let i = 0; i < totalBlocks; i++) {
        const blockX = i * (blockWidth + blockSpacing) - scrollOffset;
        const blockY = height / 2 - blockHeight / 2 + Math.sin(t + i) * 2;
        
        if (blockX + blockWidth > 0 && blockX < width) {
            // Draw block
            for (let y = 0; y < blockHeight; y++) {
                for (let x = 0; x < blockWidth; x++) {
                    const px = Math.floor(blockX + x);
                    const py = Math.floor(blockY + y);
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        // Block border
                        if (y === 0 || y === blockHeight - 1 || x === 0 || x === blockWidth - 1) {
                            buffer[py][px] = '#';
                        } else {
                            // Block content (hash visualization)
                            const hashChar = ((x + y + i) % 3 === 0) ? 
                                (Math.random() > 0.5 ? '1' : '0') : ' ';
                            buffer[py][px] = hashChar;
                        }
                    }
                }
            }
            
            // Draw chain links
            if (i < totalBlocks - 1 && blockX + blockWidth < width) {
                const linkY = Math.floor(blockY + blockHeight / 2);
                for (let lx = blockX + blockWidth; lx < blockX + blockWidth + blockSpacing; lx++) {
                    if (lx >= 0 && lx < width && linkY >= 0 && linkY < height) {
                        buffer[linkY][Math.floor(lx)] = '=';
                    }
                }
            }
        }
    }
    
    // Mining animation (audio reactive)
    if (avgAudio > 0.4) {
        const mineX = Math.floor(width * 0.8);
        const mineY = Math.floor(height * 0.2);
        const mineRadius = 2 + Math.floor(avgAudio * 3);
        
        for (let dy = -mineRadius; dy <= mineRadius; dy++) {
            for (let dx = -mineRadius; dx <= mineRadius; dx++) {
                if (Math.abs(dx) + Math.abs(dy) <= mineRadius) {
                    const px = mineX + dx;
                    const py = mineY + dy;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = Math.random() > 0.5 ? '*' : '+';
                    }
                }
            }
        }
    }
};

// Scene 84: CPU Monitor
CLIFTScenes[84] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize CPU cores
    if (!params._cpuCores) {
        params._cpuCores = [];
        for (let i = 0; i < 8; i++) {
            params._cpuCores.push({
                usage: Math.random(),
                temp: 40 + Math.random() * 30,
                history: new Array(20).fill(0)
            });
        }
    }
    
    const cores = params._cpuCores;
    
    // Update cores
    cores.forEach((core, i) => {
        // Simulate CPU usage
        core.usage = Math.max(0, Math.min(1, 
            core.usage + (Math.random() - 0.5) * 0.2 + avgAudio * 0.3));
        core.temp = 40 + core.usage * 50 + Math.random() * 10;
        
        // Update history
        core.history.shift();
        core.history.push(core.usage);
    });
    
    // Draw CPU grid
    const coreWidth = Math.floor(width / 4) - 2;
    const coreHeight = Math.floor(height / 2) - 2;
    
    cores.forEach((core, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x0 = col * (coreWidth + 2) + 1;
        const y0 = row * (coreHeight + 2) + 1;
        
        // Draw core border
        for (let x = 0; x < coreWidth; x++) {
            if (x0 + x < width) {
                buffer[y0][x0 + x] = '-';
                buffer[y0 + coreHeight - 1][x0 + x] = '-';
            }
        }
        for (let y = 0; y < coreHeight; y++) {
            if (y0 + y < height) {
                buffer[y0 + y][x0] = '|';
                if (x0 + coreWidth - 1 < width) {
                    buffer[y0 + y][x0 + coreWidth - 1] = '|';
                }
            }
        }
        
        // Draw usage bar
        const barHeight = Math.floor(core.usage * (coreHeight - 2));
        for (let y = 0; y < barHeight; y++) {
            for (let x = 2; x < coreWidth - 2; x++) {
                const py = y0 + coreHeight - 2 - y;
                const px = x0 + x;
                if (px < width && py < height) {
                    buffer[py][px] = core.usage > 0.8 ? '#' : 
                                    core.usage > 0.5 ? '=' : 
                                    ':';
                }
            }
        }
        
        // Core label
        const label = `C${i}`;
        if (y0 + 1 < height && x0 + 2 < width) {
            buffer[y0 + 1][x0 + 2] = label[0];
            buffer[y0 + 1][x0 + 3] = label[1];
        }
        
        // Temperature indicator
        if (core.temp > 80) {
            if (y0 + 2 < height && x0 + 2 < width) {
                buffer[y0 + 2][x0 + 2] = '!';
            }
        }
    });
    
    // Overall system load
    const avgUsage = cores.reduce((sum, core) => sum + core.usage, 0) / cores.length;
    const loadStr = `LOAD: ${Math.floor(avgUsage * 100)}%`;
    for (let i = 0; i < loadStr.length && i < width; i++) {
        buffer[height - 1][i] = loadStr[i];
    }
};

// Scene 85: Data Stream
CLIFTScenes[85] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Data channels
    const channels = 5;
    const channelHeight = Math.floor(height / channels);
    
    for (let ch = 0; ch < channels; ch++) {
        const y0 = ch * channelHeight;
        const speed = 1 + ch * 0.5 + avgAudio * 2;
        const offset = (t * speed * 10) % (width * 2);
        
        // Channel separator
        if (ch > 0) {
            for (let x = 0; x < width; x++) {
                buffer[y0][x] = '-';
            }
        }
        
        // Data packets
        for (let x = 0; x < width; x++) {
            const dataX = (x + offset) % (width * 2);
            
            if (dataX < width) {
                // Packet structure
                const packetPhase = Math.floor(dataX / 8) % 4;
                let char = ' ';
                
                switch (packetPhase) {
                    case 0: // Header
                        char = '[';
                        break;
                    case 1: // Data
                        char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                        break;
                    case 2: // More data
                        char = String.fromCharCode(48 + Math.floor(Math.random() * 10));
                        break;
                    case 3: // Footer
                        char = ']';
                        break;
                }
                
                // Draw in channel
                for (let dy = 1; dy < channelHeight && y0 + dy < height; dy++) {
                    if (dy === Math.floor(channelHeight / 2)) {
                        buffer[y0 + dy][x] = char;
                    } else if (Math.random() < 0.1 * avgAudio) {
                        // Noise
                        buffer[y0 + dy][x] = '.';
                    }
                }
            }
        }
        
        // Channel label
        if (y0 + channelHeight / 2 < height) {
            const label = `CH${ch}`;
            for (let i = 0; i < label.length && i < width; i++) {
                buffer[Math.floor(y0 + channelHeight / 2)][i] = label[i];
            }
        }
    }
};

// Scene 86: Server Rack
CLIFTScenes[86] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Server units
    const serverHeight = 3;
    const serverCount = Math.floor(height / (serverHeight + 1));
    
    for (let s = 0; s < serverCount; s++) {
        const y0 = s * (serverHeight + 1);
        const isActive = Math.sin(t + s * 0.5) > -0.5;
        const load = isActive ? 0.3 + avgAudio * 0.7 : 0.1;
        
        // Server chassis
        for (let y = 0; y < serverHeight && y0 + y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y === 0 || y === serverHeight - 1) {
                    buffer[y0 + y][x] = '=';
                } else if (x === 0 || x === width - 1) {
                    buffer[y0 + y][x] = '|';
                } else if (x < 10) {
                    // Front panel
                    if (x === 2 && y === 1) {
                        // Power LED
                        buffer[y0 + y][x] = isActive ? '@' : 'o';
                    } else if (x >= 5 && x <= 8 && y === 1) {
                        // Activity LEDs
                        buffer[y0 + y][x] = Math.random() < load ? '*' : '.';
                    }
                } else if (x > width - 15) {
                    // Ventilation
                    if ((x + y) % 2 === 0) {
                        buffer[y0 + y][x] = '░';
                    }
                } else {
                    // Server label/status
                    const label = `SERVER-${s.toString().padStart(2, '0')} LOAD:${Math.floor(load * 100)}%`;
                    if (y === 1 && x - 12 >= 0 && x - 12 < label.length) {
                        buffer[y0 + y][x] = label[x - 12];
                    }
                }
            }
        }
    }
    
    // Network activity indicator
    const netY = height - 1;
    const netActivity = Math.sin(t * 10) > 0;
    const netStr = netActivity ? 'NET:[>>>>]' : 'NET:[    ]';
    for (let i = 0; i < netStr.length && i < width; i++) {
        buffer[netY][width - netStr.length + i] = netStr[i];
    }
};

// Scene 87: Quantum Computing
CLIFTScenes[87] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Qubit states
    const qubitCount = 8;
    const qubitSpacing = width / (qubitCount + 1);
    
    for (let q = 0; q < qubitCount; q++) {
        const qx = (q + 1) * qubitSpacing;
        const qy = height / 2;
        
        // Qubit superposition visualization
        const phase = t * 2 + q * Math.PI / 4;
        const amplitude = 0.5 + avgAudio * 0.5;
        
        // Bloch sphere representation
        const radius = 5 + amplitude * 3;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const x = Math.floor(qx + Math.cos(angle + phase) * radius);
            const y = Math.floor(qy + Math.sin(angle + phase) * radius * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = Math.random() > 0.5 ? '+' : '-';
            }
        }
        
        // Qubit center
        if (Math.floor(qx) >= 0 && Math.floor(qx) < width && 
            Math.floor(qy) >= 0 && Math.floor(qy) < height) {
            buffer[Math.floor(qy)][Math.floor(qx)] = 'Q';
        }
        
        // Entanglement lines
        if (q < qubitCount - 1) {
            const nextQx = (q + 2) * qubitSpacing;
            const steps = Math.abs(nextQx - qx);
            
            for (let s = 0; s < steps; s += 2) {
                const ex = Math.floor(qx + s);
                const ey = Math.floor(qy + Math.sin(t * 3 + s * 0.1) * 2);
                
                if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                    buffer[ey][ex] = '~';
                }
            }
        }
    }
    
    // Quantum gates
    const gateY = Math.floor(height * 0.8);
    const gates = ['H', 'X', 'Y', 'Z', 'CNOT'];
    gates.forEach((gate, i) => {
        const gx = Math.floor((i + 1) * width / (gates.length + 1));
        
        if (gx - 2 >= 0 && gx + 2 < width && gateY >= 0 && gateY < height) {
            // Gate box
            buffer[gateY][gx - 2] = '[';
            buffer[gateY][gx + 2] = ']';
            
            // Gate name
            for (let c = 0; c < gate.length; c++) {
                if (gx - gate.length/2 + c >= 0 && gx - gate.length/2 + c < width) {
                    buffer[gateY][Math.floor(gx - gate.length/2 + c)] = gate[c];
                }
            }
        }
    });
};

// Scene 88: AI Neural Processor
CLIFTScenes[88] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Neural network layers
    const layers = [4, 6, 8, 6, 4, 2];
    const layerSpacing = width / (layers.length + 1);
    
    // Draw neurons and connections
    let prevLayerNeurons = [];
    
    layers.forEach((neuronCount, layerIndex) => {
        const layerX = (layerIndex + 1) * layerSpacing;
        const neuronSpacing = height / (neuronCount + 1);
        const currentLayerNeurons = [];
        
        // Draw neurons in this layer
        for (let n = 0; n < neuronCount; n++) {
            const nx = layerX;
            const ny = (n + 1) * neuronSpacing;
            currentLayerNeurons.push({ x: nx, y: ny });
            
            // Activation level
            const activation = (Math.sin(t * 3 + layerIndex + n) + 1) / 2 * avgAudio;
            
            // Draw neuron
            if (Math.floor(nx) >= 0 && Math.floor(nx) < width && 
                Math.floor(ny) >= 0 && Math.floor(ny) < height) {
                if (activation > 0.7) {
                    buffer[Math.floor(ny)][Math.floor(nx)] = '@';
                } else if (activation > 0.3) {
                    buffer[Math.floor(ny)][Math.floor(nx)] = 'O';
                } else {
                    buffer[Math.floor(ny)][Math.floor(nx)] = 'o';
                }
            }
            
            // Draw connections to previous layer
            if (layerIndex > 0) {
                prevLayerNeurons.forEach(prevNeuron => {
                    // Connection strength based on audio
                    if (Math.random() < 0.3 + avgAudio * 0.4) {
                        const steps = 10;
                        for (let s = 0; s < steps; s++) {
                            const t = s / steps;
                            const cx = Math.floor(prevNeuron.x + (nx - prevNeuron.x) * t);
                            const cy = Math.floor(prevNeuron.y + (ny - prevNeuron.y) * t);
                            
                            if (cx >= 0 && cx < width && cy >= 0 && cy < height && 
                                buffer[cy][cx] === ' ') {
                                buffer[cy][cx] = activation > 0.5 ? '=' : '-';
                            }
                        }
                    }
                });
            }
        }
        
        prevLayerNeurons = currentLayerNeurons;
    });
    
    // Processing indicator
    const procStr = `PROCESSING: ${Math.floor(avgAudio * 100)}%`;
    for (let i = 0; i < procStr.length && i < width; i++) {
        buffer[0][i] = procStr[i];
    }
};

// Scene 89: Cybersecurity Matrix
CLIFTScenes[89] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Firewall visualization
    const firewallX = Math.floor(width * 0.3);
    for (let y = 0; y < height; y++) {
        if (Math.sin(y * 0.5 + t * 2) > -0.5) {
            buffer[y][firewallX] = '█';
        }
    }
    
    // Incoming threats
    const threatCount = 5 + Math.floor(bassLevel * 10);
    for (let i = 0; i < threatCount; i++) {
        const threatY = Math.floor(Math.sin(t + i * 2) * height / 2 + height / 2);
        const threatX = Math.floor((t * 20 + i * 10) % (firewallX + 10));
        
        if (threatX < firewallX && threatX >= 0 && threatY >= 0 && threatY < height) {
            // Threat visualization
            const threatType = i % 3;
            let threatChar = 'X';
            
            switch (threatType) {
                case 0: threatChar = 'X'; break; // Malware
                case 1: threatChar = '!'; break; // Intrusion
                case 2: threatChar = '#'; break; // DDoS
            }
            
            buffer[threatY][threatX] = threatChar;
            
            // Threat trail
            for (let tx = Math.max(0, threatX - 5); tx < threatX; tx++) {
                if (buffer[threatY][tx] === ' ') {
                    buffer[threatY][tx] = '.';
                }
            }
        }
    }
    
    // Security scan lines
    const scanY = Math.floor((t * 10) % height);
    for (let x = 0; x < width; x++) {
        if (buffer[scanY][x] === ' ') {
            buffer[scanY][x] = '-';
        }
    }
    
    // Protected zone
    for (let y = 0; y < height; y++) {
        for (let x = firewallX + 2; x < width; x++) {
            if ((x + y) % 10 === 0 && buffer[y][x] === ' ') {
                buffer[y][x] = '·';
            }
        }
    }
    
    // Encrypted data packets
    const packetCount = Math.floor(avgAudio * 5);
    for (let i = 0; i < packetCount; i++) {
        const px = firewallX + 5 + Math.floor(Math.random() * (width - firewallX - 10));
        const py = Math.floor(Math.random() * height);
        
        if (px >= 0 && px < width - 3 && py >= 0 && py < height) {
            buffer[py][px] = '[';
            buffer[py][px + 1] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            buffer[py][px + 2] = ']';
        }
    }
    
    // Security status
    const status = bassLevel > 0.7 ? 'ALERT!' : avgAudio > 0.5 ? 'SCANNING' : 'SECURE';
    const statusStr = `SECURITY: ${status}`;
    for (let i = 0; i < statusStr.length && i < width; i++) {
        buffer[height - 1][i] = statusStr[i];
    }
};

// Category 9: Cinematic & Animation (90-99)

// Scene 90: Film Reel
CLIFTScenes[90] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Film strip parameters
    const frameWidth = 12;
    const frameHeight = 8;
    const sprocketSize = 2;
    const scrollSpeed = 2 + avgAudio * 3;
    const scrollOffset = (t * scrollSpeed) % (frameHeight + 4);
    
    // Draw film strips on sides
    for (let y = 0; y < height; y++) {
        const frameY = (y + scrollOffset) % (frameHeight + 4);
        
        // Left sprocket holes
        if (frameY < sprocketSize || frameY >= frameHeight + 2) {
            for (let x = 0; x < 3; x++) {
                buffer[y][x] = 'O';
            }
        }
        
        // Right sprocket holes
        if (frameY < sprocketSize || frameY >= frameHeight + 2) {
            for (let x = width - 3; x < width; x++) {
                buffer[y][x] = 'O';
            }
        }
        
        // Film edges
        buffer[y][3] = '|';
        buffer[y][width - 4] = '|';
    }
    
    // Draw frames
    const centerX = width / 2;
    for (let y = -frameHeight; y < height + frameHeight; y++) {
        const frameY = (y + scrollOffset);
        const frameIndex = Math.floor(frameY / (frameHeight + 4));
        const localY = frameY % (frameHeight + 4);
        
        if (localY >= 0 && localY < frameHeight) {
            // Frame border
            for (let x = -frameWidth/2; x <= frameWidth/2; x++) {
                const px = Math.floor(centerX + x);
                const py = y;
                
                if (px >= 4 && px < width - 4 && py >= 0 && py < height) {
                    if (localY === 0 || localY === frameHeight - 1 || 
                        x === -frameWidth/2 || x === frameWidth/2) {
                        buffer[py][px] = '#';
                    } else {
                        // Frame content - different for each frame
                        const sceneType = Math.abs(frameIndex) % 4;
                        switch (sceneType) {
                            case 0: // Action scene
                                if (Math.abs(x) + Math.abs(localY - frameHeight/2) < 4) {
                                    buffer[py][px] = '*';
                                }
                                break;
                            case 1: // Dialog scene
                                if (localY === frameHeight/2 && Math.abs(x) < 3) {
                                    buffer[py][px] = '"';
                                }
                                break;
                            case 2: // Landscape
                                if (localY > frameHeight/2 + Math.sin(x * 0.5) * 2) {
                                    buffer[py][px] = '=';
                                }
                                break;
                            case 3: // Close-up
                                if (Math.sqrt(x*x + (localY-frameHeight/2)*(localY-frameHeight/2)) < 3) {
                                    buffer[py][px] = '@';
                                }
                                break;
                        }
                    }
                }
            }
            
            // Frame number
            if (localY === 1 && Math.floor(centerX - 2) >= 4 && 
                Math.floor(centerX + 2) < width - 4) {
                const numStr = frameIndex.toString().padStart(3, '0');
                for (let i = 0; i < numStr.length; i++) {
                    buffer[y][Math.floor(centerX - 1 + i)] = numStr[i];
                }
            }
        }
    }
};

// Scene 91: Stop Motion Animation
CLIFTScenes[91] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Animation frames (4 fps effect)
    const frameRate = 4 + avgAudio * 8;
    const currentFrame = Math.floor(t * frameRate);
    
    // Character animation states
    const walkCycle = [
        { body: 'O', leftLeg: '/', rightLeg: '\\', leftArm: '\\', rightArm: '/' },
        { body: 'O', leftLeg: '|', rightLeg: '|', leftArm: '-', rightArm: '-' },
        { body: 'O', leftLeg: '\\', rightLeg: '/', leftArm: '/', rightArm: '\\' },
        { body: 'O', leftLeg: '|', rightLeg: '|', leftArm: '-', rightArm: '-' }
    ];
    
    // Character position
    const charX = ((currentFrame * 2) % (width + 10)) - 5;
    const charY = height - 8;
    const pose = walkCycle[currentFrame % walkCycle.length];
    
    // Draw character
    if (charX >= 0 && charX < width && charY >= 0 && charY < height) {
        // Head
        buffer[charY][charX] = pose.body;
        
        // Body
        if (charY + 1 < height) buffer[charY + 1][charX] = '|';
        if (charY + 2 < height) buffer[charY + 2][charX] = '|';
        
        // Arms
        if (charX - 1 >= 0 && charY + 1 < height) 
            buffer[charY + 1][charX - 1] = pose.leftArm;
        if (charX + 1 < width && charY + 1 < height) 
            buffer[charY + 1][charX + 1] = pose.rightArm;
        
        // Legs
        if (charX - 1 >= 0 && charY + 3 < height) 
            buffer[charY + 3][charX - 1] = pose.leftLeg;
        if (charX + 1 < width && charY + 3 < height) 
            buffer[charY + 3][charX + 1] = pose.rightLeg;
    }
    
    // Scenery (moving background)
    const bgOffset = Math.floor(currentFrame * 0.5) % 20;
    
    // Trees
    for (let i = 0; i < 5; i++) {
        const treeX = (i * 20 - bgOffset + width) % width;
        const treeHeight = 5 + (i % 3) * 2;
        
        for (let h = 0; h < treeHeight; h++) {
            const ty = height - 5 - h;
            if (treeX >= 0 && treeX < width && ty >= 0) {
                buffer[ty][treeX] = '|';
            }
        }
        
        // Tree top
        const topY = height - 5 - treeHeight;
        if (topY >= 0 && treeX >= 1 && treeX < width - 1) {
            buffer[topY][treeX - 1] = '/';
            buffer[topY][treeX] = '^';
            buffer[topY][treeX + 1] = '\\';
        }
    }
    
    // Ground
    for (let x = 0; x < width; x++) {
        buffer[height - 2][x] = '_';
        buffer[height - 1][x] = '#';
    }
    
    // Frame counter (film style)
    const frameStr = `FRAME: ${currentFrame.toString().padStart(5, '0')}`;
    for (let i = 0; i < frameStr.length && i < width; i++) {
        buffer[0][i] = frameStr[i];
    }
};

// Scene 92: Camera Dolly
CLIFTScenes[92] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Camera movement
    const dollyPosition = Math.sin(t * 0.5) * 30;
    const zoomLevel = 1 + Math.sin(t * 0.3) * 0.5 + avgAudio * 0.5;
    
    // Scene elements with parallax
    const layers = [
        { depth: 3, elements: ['*', '.', '*'], speed: 0.1 },  // Stars
        { depth: 2, elements: ['^', 'A', '^'], speed: 0.3 },  // Mountains
        { depth: 1, elements: ['|', 'T', '|'], speed: 0.6 },  // Trees
        { depth: 0, elements: ['#', '=', '#'], speed: 1.0 }   // Foreground
    ];
    
    // Draw layers back to front
    layers.forEach((layer, layerIndex) => {
        const parallaxOffset = dollyPosition * layer.speed;
        const layerY = height - (layerIndex + 1) * 5;
        
        for (let i = 0; i < 20; i++) {
            const elementX = (i * 10 + parallaxOffset + width * 2) % width;
            const elementType = layer.elements[i % layer.elements.length];
            
            // Apply zoom
            const scaledX = width / 2 + (elementX - width / 2) / zoomLevel;
            
            if (scaledX >= 0 && scaledX < width && layerY >= 0 && layerY < height) {
                // Draw element with depth-based size
                const size = Math.floor((3 - layer.depth) * zoomLevel);
                
                for (let s = 0; s < size; s++) {
                    const px = Math.floor(scaledX + s - size / 2);
                    const py = layerY - s;
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = elementType;
                    }
                }
            }
        }
    });
    
    // Camera frame overlay
    const frameSize = 5;
    // Top and bottom
    for (let x = frameSize; x < width - frameSize; x++) {
        buffer[frameSize][x] = '-';
        buffer[height - frameSize - 1][x] = '-';
    }
    // Left and right
    for (let y = frameSize; y < height - frameSize; y++) {
        buffer[y][frameSize] = '|';
        buffer[y][width - frameSize - 1] = '|';
    }
    // Corners
    buffer[frameSize][frameSize] = '+';
    buffer[frameSize][width - frameSize - 1] = '+';
    buffer[height - frameSize - 1][frameSize] = '+';
    buffer[height - frameSize - 1][width - frameSize - 1] = '+';
    
    // Camera info
    const info = `DOLLY: ${Math.floor(dollyPosition)} ZOOM: ${zoomLevel.toFixed(1)}x`;
    for (let i = 0; i < info.length && i < width; i++) {
        buffer[0][i] = info[i];
    }
};

// Scene 93: Storyboard Panels
CLIFTScenes[93] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Panel layout
    const panelWidth = Math.floor(width / 3) - 2;
    const panelHeight = Math.floor(height / 2) - 2;
    const panels = 6;
    
    // Current active panel (animated)
    const activePanel = Math.floor(t + avgAudio * 2) % panels;
    
    for (let p = 0; p < panels; p++) {
        const row = Math.floor(p / 3);
        const col = p % 3;
        const x0 = col * (panelWidth + 2) + 1;
        const y0 = row * (panelHeight + 2) + 1;
        
        // Draw panel border
        const borderChar = p === activePanel ? '#' : '-';
        for (let x = 0; x < panelWidth; x++) {
            if (x0 + x < width) {
                buffer[y0][x0 + x] = borderChar;
                if (y0 + panelHeight - 1 < height) {
                    buffer[y0 + panelHeight - 1][x0 + x] = borderChar;
                }
            }
        }
        for (let y = 0; y < panelHeight; y++) {
            if (y0 + y < height) {
                buffer[y0 + y][x0] = borderChar;
                if (x0 + panelWidth - 1 < width) {
                    buffer[y0 + y][x0 + panelWidth - 1] = borderChar;
                }
            }
        }
        
        // Panel content
        if (p === activePanel) {
            // Detailed scene
            const sceneType = Math.floor(t / 3) % 4;
            
            switch (sceneType) {
                case 0: // Wide shot
                    for (let x = 2; x < panelWidth - 2; x++) {
                        const mountainY = y0 + panelHeight / 2 + Math.sin(x * 0.3) * 2;
                        if (mountainY < y0 + panelHeight - 1) {
                            buffer[Math.floor(mountainY)][x0 + x] = '^';
                        }
                    }
                    break;
                    
                case 1: // Close-up
                    const centerX = x0 + panelWidth / 2;
                    const centerY = y0 + panelHeight / 2;
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            if (Math.abs(dx) + Math.abs(dy) <= 2) {
                                const px = Math.floor(centerX + dx);
                                const py = Math.floor(centerY + dy);
                                if (px > x0 && px < x0 + panelWidth - 1 && 
                                    py > y0 && py < y0 + panelHeight - 1) {
                                    buffer[py][px] = '@';
                                }
                            }
                        }
                    }
                    break;
                    
                case 2: // Action
                    for (let i = 0; i < 5; i++) {
                        const ax = x0 + 2 + i * 2;
                        const ay = y0 + 2 + Math.floor(Math.sin(t * 5 + i) * 2);
                        if (ax < x0 + panelWidth - 1 && ay < y0 + panelHeight - 1) {
                            buffer[ay][ax] = '*';
                        }
                    }
                    break;
                    
                case 3: // Dialog
                    const text = "...";
                    const textY = y0 + panelHeight - 3;
                    for (let i = 0; i < text.length; i++) {
                        if (x0 + 2 + i < x0 + panelWidth - 1) {
                            buffer[textY][x0 + 2 + i] = text[i];
                        }
                    }
                    break;
            }
        } else {
            // Sketched content
            const sketchDensity = 0.1;
            for (let y = 2; y < panelHeight - 2; y++) {
                for (let x = 2; x < panelWidth - 2; x++) {
                    if (Math.random() < sketchDensity) {
                        buffer[y0 + y][x0 + x] = '.';
                    }
                }
            }
        }
        
        // Panel number
        if (y0 + 1 < height && x0 + 1 < width) {
            buffer[y0 + 1][x0 + 1] = (p + 1).toString();
        }
    }
};

// Scene 94: Time-lapse Photography
CLIFTScenes[94] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Time acceleration
    const timeSpeed = 50 + avgAudio * 100;
    const dayTime = (t * timeSpeed) % 100;
    const isDay = dayTime < 50;
    
    // Sky gradient
    for (let y = 0; y < height / 2; y++) {
        for (let x = 0; x < width; x++) {
            if (isDay) {
                // Day sky
                if (y < 2) buffer[y][x] = '.';
                else if (Math.random() < 0.001) buffer[y][x] = '*'; // Birds
            } else {
                // Night sky
                if (Math.random() < 0.01) buffer[y][x] = '.'; // Stars
                else if (Math.random() < 0.001) buffer[y][x] = '*'; // Bright stars
            }
        }
    }
    
    // Sun/Moon
    const celestialX = Math.floor((dayTime / 100) * width);
    const celestialY = Math.floor(5 + Math.sin((dayTime / 100) * Math.PI) * -10);
    
    if (celestialX >= 0 && celestialX < width && celestialY >= 0 && celestialY < height) {
        if (isDay) {
            // Sun
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (dx*dx + dy*dy <= 4) {
                        const px = celestialX + dx;
                        const py = celestialY + dy;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            buffer[py][px] = '@';
                        }
                    }
                }
            }
        } else {
            // Moon
            buffer[celestialY][celestialX] = 'O';
        }
    }
    
    // City skyline
    const buildings = [];
    for (let i = 0; i < 10; i++) {
        buildings.push({
            x: Math.floor(i * width / 10 + width / 20),
            height: 5 + Math.floor(Math.sin(i * 2.3) * 3),
            width: 3 + Math.floor(Math.sin(i * 1.7) * 2)
        });
    }
    
    // Draw buildings
    buildings.forEach(building => {
        for (let y = height - building.height; y < height; y++) {
            for (let x = 0; x < building.width; x++) {
                const px = building.x + x;
                if (px >= 0 && px < width) {
                    buffer[y][px] = '#';
                    
                    // Windows (lit at night)
                    if (!isDay && y < height - 1 && x > 0 && x < building.width - 1) {
                        if ((y - (height - building.height)) % 2 === 0 && x % 2 === 1) {
                            buffer[y][px] = Math.random() > 0.3 ? '*' : '#';
                        }
                    }
                }
            }
        }
    });
    
    // Traffic (more at certain times)
    const trafficDensity = Math.sin(dayTime * 0.1) * 0.5 + 0.5;
    const carCount = Math.floor(5 * trafficDensity);
    
    for (let i = 0; i < carCount; i++) {
        const carX = Math.floor((t * 10 + i * 20) % width);
        const carY = height - 2;
        
        if (carX >= 0 && carX < width - 2) {
            buffer[carY][carX] = '[';
            buffer[carY][carX + 1] = isDay ? '=' : '*';
            buffer[carY][carX + 2] = ']';
        }
    }
    
    // Time indicator
    const timeStr = `TIME: ${Math.floor(dayTime).toString().padStart(2, '0')}:00`;
    for (let i = 0; i < timeStr.length && i < width; i++) {
        buffer[0][i] = timeStr[i];
    }
};

// Scene 95: Rotoscope Effect
CLIFTScenes[95] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Animated figure
    const figureX = width / 2 + Math.sin(t) * 20;
    const figureY = height / 2;
    
    // Motion trail
    const trailLength = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < trailLength; i++) {
        const trailT = t - i * 0.1;
        const trailX = width / 2 + Math.sin(trailT) * 20;
        const trailY = height / 2;
        const alpha = 1 - i / trailLength;
        
        // Draw fading figure
        if (alpha > 0.3) {
            const char = alpha > 0.7 ? '@' : alpha > 0.5 ? 'o' : '.';
            
            // Head
            if (Math.floor(trailX) >= 0 && Math.floor(trailX) < width && 
                Math.floor(trailY - 3) >= 0) {
                buffer[Math.floor(trailY - 3)][Math.floor(trailX)] = char;
            }
            
            // Body outline
            for (let by = -2; by <= 2; by++) {
                const bx = Math.sin(by * 0.5 + trailT * 3) * 2;
                const px = Math.floor(trailX + bx);
                const py = Math.floor(trailY + by);
                
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    buffer[py][px] = char;
                }
            }
        }
    }
    
    // Current frame outline
    // Head
    const headX = Math.floor(figureX);
    const headY = Math.floor(figureY - 3);
    if (headX >= 0 && headX < width && headY >= 0) {
        buffer[headY][headX] = 'O';
    }
    
    // Arms (animated)
    const armAngle = Math.sin(t * 3) * 0.5;
    const leftArmX = Math.floor(figureX - 3 - Math.sin(armAngle) * 2);
    const rightArmX = Math.floor(figureX + 3 + Math.sin(armAngle) * 2);
    const armY = Math.floor(figureY - 1);
    
    if (leftArmX >= 0 && leftArmX < width && armY >= 0 && armY < height) {
        buffer[armY][leftArmX] = '\\';
    }
    if (rightArmX >= 0 && rightArmX < width && armY >= 0 && armY < height) {
        buffer[armY][rightArmX] = '/';
    }
    
    // Torso
    for (let ty = -2; ty <= 2; ty++) {
        const tx = Math.floor(figureX);
        const py = Math.floor(figureY + ty);
        
        if (tx >= 0 && tx < width && py >= 0 && py < height) {
            buffer[py][tx] = '|';
        }
    }
    
    // Legs (walking animation)
    const walkPhase = Math.sin(t * 4);
    const leftLegX = Math.floor(figureX - 1 - walkPhase);
    const rightLegX = Math.floor(figureX + 1 + walkPhase);
    const legY = Math.floor(figureY + 3);
    
    if (leftLegX >= 0 && leftLegX < width && legY >= 0 && legY < height) {
        buffer[legY][leftLegX] = '/';
    }
    if (rightLegX >= 0 && rightLegX < width && legY >= 0 && legY < height) {
        buffer[legY][rightLegX] = '\\';
    }
    
    // Background grid (rotoscope reference)
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
            if (buffer[y][x] === ' ') {
                buffer[y][x] = '+';
            }
        }
    }
};

// Scene 96: Zoetrope Animation
CLIFTScenes[96] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Zoetrope wheel
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 2;
    const rotation = t * (1 + avgAudio * 2);
    const slotCount = 12;
    
    // Draw outer ring
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = 'O';
        }
    }
    
    // Draw slots and animation frames
    for (let slot = 0; slot < slotCount; slot++) {
        const slotAngle = (slot / slotCount) * Math.PI * 2 + rotation;
        const slotX = centerX + Math.cos(slotAngle) * (radius - 5);
        const slotY = centerY + Math.sin(slotAngle) * (radius - 5) * 0.5;
        
        // Animation frame in slot
        const frameIndex = slot % 4;
        const frames = ['\\o/', '|o|', '/o\\', '|o|'];
        const frame = frames[frameIndex];
        
        // Draw frame if visible (front half of wheel)
        if (Math.cos(slotAngle) > 0) {
            for (let i = 0; i < frame.length; i++) {
                const fx = Math.floor(slotX - frame.length/2 + i);
                const fy = Math.floor(slotY);
                
                if (fx >= 0 && fx < width && fy >= 0 && fy < height) {
                    buffer[fy][fx] = frame[i];
                }
            }
        }
        
        // Slot dividers
        const dividerX = Math.floor(centerX + Math.cos(slotAngle) * radius);
        const dividerY = Math.floor(centerY + Math.sin(slotAngle) * radius * 0.5);
        
        if (dividerX >= 0 && dividerX < width && dividerY >= 0 && dividerY < height) {
            buffer[dividerY][dividerX] = '|';
        }
    }
    
    // Center spindle
    if (Math.floor(centerX) >= 0 && Math.floor(centerX) < width && 
        Math.floor(centerY) >= 0 && Math.floor(centerY) < height) {
        buffer[Math.floor(centerY)][Math.floor(centerX)] = '@';
    }
    
    // Viewing window
    const windowX = Math.floor(centerX);
    const windowY = Math.floor(centerY - radius * 0.5 - 3);
    
    if (windowY >= 0 && windowX - 2 >= 0 && windowX + 2 < width) {
        buffer[windowY][windowX - 2] = '[';
        buffer[windowY][windowX + 2] = ']';
        buffer[windowY][windowX] = 'V';
    }
};

// Scene 97: Motion Blur
CLIFTScenes[97] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Moving objects with trails
    const objects = [
        { x: width * 0.2, y: height * 0.3, vx: 3, vy: 0.5, char: '@' },
        { x: width * 0.8, y: height * 0.6, vx: -2, vy: -0.3, char: '#' },
        { x: width * 0.5, y: height * 0.8, vx: 1.5, vy: -1, char: '*' }
    ];
    
    objects.forEach((obj, index) => {
        // Update position
        const speed = 1 + avgAudio * 2;
        const currentX = (obj.x + t * obj.vx * speed * 10) % width;
        const currentY = (obj.y + t * obj.vy * speed * 10 + height) % height;
        
        // Motion blur trail
        const blurLength = 5 + Math.floor(avgAudio * 15);
        const blurChars = ['#', '=', '-', '.', ' '];
        
        for (let i = 0; i < blurLength; i++) {
            const blurT = t - i * 0.02;
            const blurX = Math.floor((obj.x + blurT * obj.vx * speed * 10) % width);
            const blurY = Math.floor((obj.y + blurT * obj.vy * speed * 10 + height) % height);
            
            if (blurX >= 0 && blurX < width && blurY >= 0 && blurY < height) {
                const charIndex = Math.min(i, blurChars.length - 1);
                if (buffer[blurY][blurX] === ' ') {
                    buffer[blurY][blurX] = blurChars[charIndex];
                }
            }
        }
        
        // Current position
        if (Math.floor(currentX) >= 0 && Math.floor(currentX) < width && 
            Math.floor(currentY) >= 0 && Math.floor(currentY) < height) {
            buffer[Math.floor(currentY)][Math.floor(currentX)] = obj.char;
        }
    });
    
    // Speed lines
    if (avgAudio > 0.5) {
        const lineCount = Math.floor(avgAudio * 10);
        for (let i = 0; i < lineCount; i++) {
            const lineY = Math.floor(Math.random() * height);
            const lineLength = 10 + Math.floor(Math.random() * 20);
            const lineStart = Math.floor(Math.random() * width);
            
            for (let x = 0; x < lineLength; x++) {
                const px = (lineStart + x) % width;
                if (buffer[lineY][px] === ' ') {
                    buffer[lineY][px] = '-';
                }
            }
        }
    }
};

// Scene 98: Claymation Style
CLIFTScenes[98] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Clay figure morphing
    const morphPhase = (t * 0.5) % 1;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Base clay blob
    const blobRadius = 8 + Math.sin(t) * 3 + avgAudio * 5;
    const blobHeight = blobRadius * 0.6;
    
    for (let y = -blobHeight; y <= blobHeight; y++) {
        for (let x = -blobRadius; x <= blobRadius; x++) {
            const dist = Math.sqrt((x / blobRadius) * (x / blobRadius) + 
                                  (y / blobHeight) * (y / blobHeight));
            
            if (dist <= 1) {
                const px = Math.floor(centerX + x);
                const py = Math.floor(centerY + y);
                
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    // Clay texture
                    const texture = dist < 0.3 ? '@' : 
                                  dist < 0.6 ? '#' : 
                                  dist < 0.9 ? '=' : 
                                  '-';
                    buffer[py][px] = texture;
                }
            }
        }
    }
    
    // Morphing features
    if (morphPhase < 0.33) {
        // Eyes appearing
        const eyeProgress = morphPhase * 3;
        const eyeY = Math.floor(centerY - 2);
        const leftEyeX = Math.floor(centerX - 3);
        const rightEyeX = Math.floor(centerX + 3);
        
        if (eyeProgress > 0.5) {
            if (leftEyeX >= 0 && leftEyeX < width && eyeY >= 0 && eyeY < height) {
                buffer[eyeY][leftEyeX] = 'O';
            }
            if (rightEyeX >= 0 && rightEyeX < width && eyeY >= 0 && eyeY < height) {
                buffer[eyeY][rightEyeX] = 'O';
            }
        }
    } else if (morphPhase < 0.66) {
        // Smile forming
        const smileProgress = (morphPhase - 0.33) * 3;
        const smileY = Math.floor(centerY + 2);
        const smileWidth = Math.floor(smileProgress * 5);
        
        for (let x = -smileWidth; x <= smileWidth; x++) {
            const px = Math.floor(centerX + x);
            if (px >= 0 && px < width && smileY >= 0 && smileY < height) {
                buffer[smileY][px] = '-';
            }
        }
    } else {
        // Arms extending
        const armProgress = (morphPhase - 0.66) * 3;
        const armLength = Math.floor(armProgress * 5);
        
        // Left arm
        for (let i = 0; i < armLength; i++) {
            const ax = Math.floor(centerX - blobRadius + 2 - i);
            const ay = Math.floor(centerY);
            if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
                buffer[ay][ax] = '=';
            }
        }
        
        // Right arm
        for (let i = 0; i < armLength; i++) {
            const ax = Math.floor(centerX + blobRadius - 2 + i);
            const ay = Math.floor(centerY);
            if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
                buffer[ay][ax] = '=';
            }
        }
    }
    
    // Clay drips (audio reactive)
    if (avgAudio > 0.4) {
        const dripCount = Math.floor(avgAudio * 5);
        for (let i = 0; i < dripCount; i++) {
            const dripX = Math.floor(centerX + (Math.random() - 0.5) * blobRadius * 2);
            const dripY = Math.floor(centerY + blobHeight + 1 + i);
            
            if (dripX >= 0 && dripX < width && dripY >= 0 && dripY < height) {
                buffer[dripY][dripX] = '.';
            }
        }
    }
};

// Scene 99: Director's Cut
CLIFTScenes[99] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Film production elements
    const scene = Math.floor(t / 5) % 4;
    
    // Clapperboard at scene changes
    if ((t % 5) < 0.5) {
        const clapX = width / 2 - 10;
        const clapY = height / 2 - 4;
        
        // Clapper
        const clapper = [
            '┌────────────────────┐',
            '│ SCENE ' + (scene + 1).toString().padStart(2, '0') + '  TAKE 01 │',
            '├────────────────────┤',
            '│ CLIFT PRODUCTION   │',
            '│ DIR: ASCII MASTER  │',
            '│ CAM: TERMINAL      │',
            '└────────────────────┘'
        ];
        
        clapper.forEach((line, y) => {
            for (let x = 0; x < line.length; x++) {
                const px = Math.floor(clapX + x);
                const py = Math.floor(clapY + y);
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    buffer[py][px] = line[x];
                }
            }
        });
        
        // Clap sticks (animated)
        const clapAngle = Math.sin(t * 20) * 0.3;
        const stickY = clapY - 1;
        for (let x = 0; x < 20; x++) {
            const px = Math.floor(clapX + x);
            const py = Math.floor(stickY - x * clapAngle);
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = '=';
            }
        }
    } else {
        // Scene content
        switch (scene) {
            case 0: // Action scene
                const explosionX = Math.floor(Math.random() * width);
                const explosionY = Math.floor(Math.random() * height);
                const explosionRadius = 3 + Math.floor(avgAudio * 5);
                
                for (let dy = -explosionRadius; dy <= explosionRadius; dy++) {
                    for (let dx = -explosionRadius; dx <= explosionRadius; dx++) {
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist <= explosionRadius) {
                            const px = explosionX + dx;
                            const py = explosionY + dy;
                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                buffer[py][px] = dist < explosionRadius/2 ? '*' : '+';
                            }
                        }
                    }
                }
                break;
                
            case 1: // Dramatic close-up
                const eyeX = width / 2;
                const eyeY = height / 2;
                
                // Large eye
                for (let x = -8; x <= 8; x++) {
                    const y = Math.floor(Math.sqrt(64 - x*x) * 0.5);
                    const topY = Math.floor(eyeY - y);
                    const botY = Math.floor(eyeY + y);
                    const px = Math.floor(eyeX + x);
                    
                    if (px >= 0 && px < width) {
                        if (topY >= 0 && topY < height) buffer[topY][px] = '-';
                        if (botY >= 0 && botY < height) buffer[botY][px] = '-';
                    }
                }
                
                // Iris
                for (let dy = -3; dy <= 3; dy++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        if (dx*dx + dy*dy <= 9) {
                            const px = Math.floor(eyeX + dx);
                            const py = Math.floor(eyeY + dy);
                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                buffer[py][px] = dx*dx + dy*dy <= 4 ? '@' : 'O';
                            }
                        }
                    }
                }
                break;
                
            case 2: // Chase scene
                for (let i = 0; i < 3; i++) {
                    const carX = Math.floor((t * 20 + i * 15) % width);
                    const carY = height - 5 + i;
                    
                    if (carX >= 0 && carX < width - 3 && carY >= 0 && carY < height) {
                        buffer[carY][carX] = '<';
                        buffer[carY][carX + 1] = '=';
                        buffer[carY][carX + 2] = '>';
                    }
                }
                break;
                
            case 3: // Credits roll
                const credits = [
                    'DIRECTED BY',
                    'ASCII MASTER',
                    '',
                    'PRODUCED BY',
                    'TERMINAL STUDIOS',
                    '',
                    'STARRING',
                    'THE CHARACTERS'
                ];
                
                const scrollY = Math.floor(t * 5) % (height + credits.length * 2);
                
                credits.forEach((line, i) => {
                    const lineY = height - scrollY + i * 2;
                    if (lineY >= 0 && lineY < height) {
                        const lineX = Math.floor((width - line.length) / 2);
                        for (let c = 0; c < line.length; c++) {
                            if (lineX + c >= 0 && lineX + c < width) {
                                buffer[lineY][lineX + c] = line[c];
                            }
                        }
                    }
                });
                break;
        }
    }
    
    // Director viewfinder overlay
    const viewfinderSize = 3;
    // Corners
    for (let i = 0; i < viewfinderSize; i++) {
        // Top-left
        if (i < width) buffer[0][i] = '─';
        if (i < height) buffer[i][0] = '│';
        // Top-right
        if (width - 1 - i >= 0) buffer[0][width - 1 - i] = '─';
        if (i < height) buffer[i][width - 1] = '│';
        // Bottom-left
        if (i < width) buffer[height - 1][i] = '─';
        if (height - 1 - i >= 0) buffer[height - 1 - i][0] = '│';
        // Bottom-right
        if (width - 1 - i >= 0) buffer[height - 1][width - 1 - i] = '─';
        if (height - 1 - i >= 0) buffer[height - 1 - i][width - 1] = '│';
    }
    
    // Recording indicator
    if (Math.sin(t * 4) > 0) {
        const recStr = '● REC';
        for (let i = 0; i < recStr.length && i + 5 < width; i++) {
            buffer[2][i + 5] = recStr[i];
        }
    }
};

// Helper function to draw lines
function drawLine(buffer, x0, y0, x1, y1, char) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        if (x0 >= 0 && x0 < buffer[0].length && y0 >= 0 && y0 < buffer.length) {
            buffer[y0][x0] = char;
        }
        
        if (x0 === x1 && y0 === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}

// ============================================
// CATEGORY 10: Experimental & Avant-garde (100-109)
// ============================================

// Scene 100: Glitch Poetry
CLIFTScenes[100] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    const mid = params.audio ? params.audio[32] : 0.5;
    
    // Poetic words that get glitched
    const words = [
        'DIGITAL', 'DREAMS', 'ELECTRIC', 'VOID', 'SIGNAL',
        'NOISE', 'STATIC', 'PULSE', 'FLOW', 'ECHO',
        'GLITCH', 'BINARY', 'MATRIX', 'CODE', 'CYBER'
    ];
    
    // Scattered words with glitch effects
    for (let i = 0; i < 5 + bass * 10; i++) {
        const word = words[Math.floor(Math.random() * words.length)];
        const x = Math.floor(Math.random() * (width - word.length));
        const y = Math.floor(Math.random() * height);
        
        // Apply glitch transformations
        const glitchType = Math.floor(Math.random() * 4);
        
        for (let c = 0; c < word.length; c++) {
            if (x + c < width) {
                switch (glitchType) {
                    case 0: // Normal
                        buffer[y][x + c] = word[c];
                        break;
                    case 1: // Vertical shift
                        const shiftY = (y + Math.floor(Math.sin(t + c) * 2)) % height;
                        if (shiftY >= 0) buffer[shiftY][x + c] = word[c];
                        break;
                    case 2: // Character substitution
                        const glitchChars = '▀▄█▌▐░▒▓';
                        buffer[y][x + c] = Math.random() > 0.7 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : word[c];
                        break;
                    case 3: // Duplication
                        buffer[y][x + c] = word[c];
                        if (y + 1 < height) buffer[y + 1][x + c] = word[c];
                        break;
                }
            }
        }
    }
    
    // Glitch lines
    const glitchLines = Math.floor(mid * 10);
    for (let i = 0; i < glitchLines; i++) {
        const y = Math.floor(Math.random() * height);
        const startX = Math.floor(Math.random() * width);
        const length = Math.floor(Math.random() * 20 + 5);
        const chars = '═║╔╗╚╝╠╣╦╩╬';
        
        for (let x = startX; x < startX + length && x < width; x++) {
            buffer[y][x] = chars[Math.floor(Math.random() * chars.length)];
        }
    }
};

// Scene 101: ASCII Kaleidoscope
CLIFTScenes[101] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const centerX = width / 2;
    const centerY = height / 2;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Number of symmetry segments
    const segments = 8;
    const angleStep = (Math.PI * 2) / segments;
    
    // Generate pattern in one segment
    for (let angle = 0; angle < angleStep; angle += 0.1) {
        for (let r = 0; r < Math.min(centerX, centerY); r++) {
            const baseX = Math.cos(angle + t) * r;
            const baseY = Math.sin(angle + t) * r;
            
            // Audio modulation
            const audioMod = audio[Math.floor(r / 2) % audio.length];
            
            // Create kaleidoscope effect
            for (let seg = 0; seg < segments; seg++) {
                const rotAngle = seg * angleStep;
                
                // Apply rotation
                const x = Math.floor(centerX + baseX * Math.cos(rotAngle) - baseY * Math.sin(rotAngle));
                const y = Math.floor(centerY + baseX * Math.sin(rotAngle) + baseY * Math.cos(rotAngle));
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const intensity = (r / Math.min(centerX, centerY)) * audioMod;
                    const chars = ' .·:;+=xX#';
                    const charIndex = Math.floor(intensity * (chars.length - 1));
                    buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
                }
            }
        }
    }
    
    // Add rotating center piece
    const centerChars = '◆◇○●□■△▽';
    const centerChar = centerChars[Math.floor(t) % centerChars.length];
    buffer[Math.floor(centerY)][Math.floor(centerX)] = centerChar;
};

// Scene 102: Dimensional Rift
CLIFTScenes[102] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    
    // Create multiple dimensional layers
    const layers = 3;
    
    for (let layer = 0; layer < layers; layer++) {
        const offset = layer * 0.5;
        const phase = t + offset;
        
        // Each layer has its own portal
        const portalX = width / 2 + Math.sin(phase * 0.7) * (width / 4);
        const portalY = height / 2 + Math.cos(phase * 0.5) * (height / 4);
        const portalSize = 5 + bass * 10 + layer * 2;
        
        // Draw warped space around portal
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - portalX;
                const dy = y - portalY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < portalSize) {
                    // Inside portal - different dimension
                    const warpX = x + Math.sin(dist * 0.5 + phase) * 3;
                    const warpY = y + Math.cos(dist * 0.5 + phase) * 2;
                    
                    if (warpX >= 0 && warpX < width && warpY >= 0 && warpY < height) {
                        const layerChars = ['░', '▒', '▓'];
                        buffer[y][x] = layerChars[layer % layerChars.length];
                    }
                } else if (dist < portalSize + 3) {
                    // Portal edge
                    const edgeChars = '╱╲╳';
                    buffer[y][x] = edgeChars[Math.floor(Math.random() * edgeChars.length)];
                }
            }
        }
    }
    
    // Dimensional tears
    const tears = 5 + Math.floor(bass * 5);
    for (let i = 0; i < tears; i++) {
        const tearX = Math.floor(Math.random() * width);
        const tearY = Math.floor(Math.random() * height);
        const tearLength = Math.floor(Math.random() * 10 + 5);
        const tearDir = Math.random() > 0.5 ? 1 : -1;
        
        for (let j = 0; j < tearLength; j++) {
            const x = tearX + j * tearDir;
            const y = tearY + Math.floor(j * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = Math.random() > 0.5 ? '\\' : '/';
            }
        }
    }
};

// Scene 103: Quantum Superposition
CLIFTScenes[103] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Quantum states
    const states = ['|0⟩', '|1⟩', '|+⟩', '|−⟩', '|↑⟩', '|↓⟩'];
    
    // Wave function visualization
    for (let x = 0; x < width; x++) {
        const wavePhase = x / width * Math.PI * 4;
        const amplitude = Math.sin(wavePhase + t) * Math.cos(wavePhase * 0.5 - t * 0.7);
        const audioMod = audio[Math.floor(x / width * audio.length)];
        
        const y = Math.floor(height / 2 + amplitude * (height / 3) * audioMod);
        
        if (y >= 0 && y < height) {
            // Probability density
            for (let dy = -2; dy <= 2; dy++) {
                const probY = y + dy;
                if (probY >= 0 && probY < height) {
                    const prob = Math.exp(-Math.abs(dy) * 0.5);
                    const chars = ' ·∙•●';
                    const charIndex = Math.floor(prob * (chars.length - 1));
                    buffer[probY][x] = chars[charIndex];
                }
            }
        }
        
        // Quantum states at peaks
        if (Math.abs(amplitude) > 0.8 && x % 10 === 0) {
            const state = states[Math.floor(Math.random() * states.length)];
            for (let i = 0; i < state.length && x + i < width; i++) {
                if (y >= 0 && y < height) {
                    buffer[y][x + i] = state[i];
                }
            }
        }
    }
    
    // Entangled particles
    const particles = 10;
    for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2 + t;
        const radius = 10 + Math.sin(t * 2 + i) * 5;
        
        const x1 = Math.floor(width / 2 + Math.cos(angle) * radius);
        const y1 = Math.floor(height / 2 + Math.sin(angle) * radius);
        
        const x2 = Math.floor(width / 2 - Math.cos(angle) * radius);
        const y2 = Math.floor(height / 2 - Math.sin(angle) * radius);
        
        if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
            buffer[y1][x1] = '◉';
        }
        if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
            buffer[y2][x2] = '◉';
        }
        
        // Entanglement connection
        const steps = 10;
        for (let s = 0; s < steps; s++) {
            const sx = Math.floor(x1 + (x2 - x1) * s / steps);
            const sy = Math.floor(y1 + (y2 - y1) * s / steps);
            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                buffer[sy][sx] = '·';
            }
        }
    }
};

// Scene 104: Recursive Fractals
CLIFTScenes[104] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    
    // Recursive function to draw fractals
    function drawFractal(x, y, size, depth, angle) {
        if (depth <= 0 || size < 1) return;
        
        // Draw current level
        const chars = '█▓▒░·';
        const charIndex = Math.floor((depth / 5) * (chars.length - 1));
        
        for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
                const px = Math.floor(x + dx);
                const py = Math.floor(y + dy);
                
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    if (Math.random() > 0.3) {
                        buffer[py][px] = chars[Math.min(charIndex, chars.length - 1)];
                    }
                }
            }
        }
        
        // Recursive calls with rotation
        const newSize = size * 0.5;
        const angleStep = (Math.PI * 2) / 4;
        
        for (let i = 0; i < 4; i++) {
            const newAngle = angle + angleStep * i + t * 0.2;
            const offsetX = Math.cos(newAngle) * size;
            const offsetY = Math.sin(newAngle) * size;
            
            drawFractal(
                x + offsetX,
                y + offsetY,
                newSize,
                depth - 1,
                newAngle
            );
        }
    }
    
    // Start multiple fractals
    const fractalCount = 3 + Math.floor(bass * 2);
    for (let i = 0; i < fractalCount; i++) {
        const startX = width / 2 + Math.cos(t + i) * (width / 4);
        const startY = height / 2 + Math.sin(t + i) * (height / 4);
        const startSize = 8 + bass * 5;
        
        drawFractal(startX, startY, startSize, 5, i * Math.PI / 2);
    }
};

// Scene 105: Time Distortion
CLIFTScenes[105] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Multiple time streams
    const streams = 5;
    
    for (let stream = 0; stream < streams; stream++) {
        const timeOffset = stream * 0.5;
        const streamTime = t * (1 + stream * 0.3) + timeOffset;
        const streamY = Math.floor((stream / streams) * height);
        const streamHeight = Math.floor(height / streams);
        
        // Each stream moves at different speed
        for (let x = 0; x < width; x++) {
            const waveY = Math.sin(x * 0.1 + streamTime) * (streamHeight / 3);
            const y = streamY + streamHeight / 2 + waveY;
            
            if (y >= streamY && y < streamY + streamHeight && y < height) {
                // Time representation
                const timeChar = Math.floor(streamTime + x * 0.1) % 10;
                buffer[Math.floor(y)][x] = timeChar.toString();
                
                // Distortion effects
                const distortion = audio[stream * 10 % audio.length];
                if (distortion > 0.7) {
                    // Glitch in time
                    buffer[Math.floor(y)][x] = '█';
                    if (Math.floor(y) + 1 < height) {
                        buffer[Math.floor(y) + 1][x] = '▀';
                    }
                }
            }
        }
        
        // Stream separators
        if (streamY + streamHeight < height) {
            for (let x = 0; x < width; x++) {
                buffer[streamY + streamHeight][x] = '─';
            }
        }
    }
    
    // Temporal anomalies
    const anomalies = Math.floor(audio[0] * 10);
    for (let i = 0; i < anomalies; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const size = Math.floor(Math.random() * 5 + 2);
        
        // Circular time distortion
        for (let dy = -size; dy <= size; dy++) {
            for (let dx = -size; dx <= size; dx++) {
                if (dx * dx + dy * dy <= size * size) {
                    const px = x + dx;
                    const py = y + dy;
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = '◉';
                    }
                }
            }
        }
    }
};

// Scene 106: Synaesthetic Patterns
CLIFTScenes[106] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Map audio frequencies to visual patterns
    const patterns = [
        { chars: '░▒▓█', type: 'blocks' },      // Bass
        { chars: '┌┐└┘', type: 'corners' },     // Low-mid
        { chars: '─│┼', type: 'lines' },        // Mid
        { chars: '╱╲╳', type: 'diagonals' },    // High-mid
        { chars: '◦○●', type: 'circles' },      // Treble
        { chars: '▲▼◆◇', type: 'shapes' }       // High treble
    ];
    
    // Divide screen into frequency regions
    const regionWidth = Math.floor(width / patterns.length);
    
    for (let region = 0; region < patterns.length; region++) {
        const pattern = patterns[region];
        const startX = region * regionWidth;
        const endX = Math.min((region + 1) * regionWidth, width);
        
        // Get audio for this frequency range
        const freqStart = Math.floor((region / patterns.length) * audio.length);
        const freqEnd = Math.floor(((region + 1) / patterns.length) * audio.length);
        
        let avgAudio = 0;
        for (let i = freqStart; i < freqEnd; i++) {
            avgAudio += audio[i];
        }
        avgAudio /= (freqEnd - freqStart);
        
        // Generate pattern based on audio intensity
        const density = avgAudio;
        const patternChars = pattern.chars;
        
        for (let y = 0; y < height; y++) {
            for (let x = startX; x < endX; x++) {
                if (Math.random() < density) {
                    const charIndex = Math.floor(Math.random() * patternChars.length);
                    buffer[y][x] = patternChars[charIndex];
                    
                    // Create spreading effect
                    if (avgAudio > 0.7) {
                        const spread = Math.floor(avgAudio * 3);
                        for (let dx = -spread; dx <= spread; dx++) {
                            const spreadX = x + dx;
                            if (spreadX >= startX && spreadX < endX) {
                                const fadeChar = patternChars[0]; // Lightest char
                                if (Math.random() < 0.3) {
                                    buffer[y][spreadX] = fadeChar;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Add flowing connections between regions
    for (let region = 0; region < patterns.length - 1; region++) {
        const x = (region + 1) * regionWidth;
        const flow = Math.sin(t + region) * height / 2 + height / 2;
        
        for (let y = 0; y < height; y++) {
            const dist = Math.abs(y - flow);
            if (dist < 3 && x < width) {
                buffer[y][x] = '║';
            }
        }
    }
};

// Scene 107: Emergent Behaviors
CLIFTScenes[107] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    
    // Agent-based system
    const agentCount = 20 + Math.floor(bass * 20);
    const agents = [];
    
    // Initialize agents
    for (let i = 0; i < agentCount; i++) {
        agents.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            type: Math.floor(Math.random() * 3),
            life: 1.0
        });
    }
    
    // Update and interact agents
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Move
        agent.x += agent.vx + Math.sin(t + i) * 0.5;
        agent.y += agent.vy + Math.cos(t + i) * 0.5;
        
        // Wrap around
        if (agent.x < 0) agent.x = width - 1;
        if (agent.x >= width) agent.x = 0;
        if (agent.y < 0) agent.y = height - 1;
        if (agent.y >= height) agent.y = 0;
        
        // Interact with nearby agents
        for (let j = i + 1; j < agents.length; j++) {
            const other = agents[j];
            const dx = agent.x - other.x;
            const dy = agent.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 5) {
                // Different interactions based on types
                if (agent.type === other.type) {
                    // Same type - attract
                    agent.vx -= dx * 0.01;
                    agent.vy -= dy * 0.01;
                } else {
                    // Different type - repel
                    agent.vx += dx * 0.02;
                    agent.vy += dy * 0.02;
                }
            }
        }
        
        // Limit velocity
        const speed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
        if (speed > 2) {
            agent.vx = (agent.vx / speed) * 2;
            agent.vy = (agent.vy / speed) * 2;
        }
        
        // Draw agent and trail
        const x = Math.floor(agent.x);
        const y = Math.floor(agent.y);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const typeChars = ['○', '□', '△'];
            buffer[y][x] = typeChars[agent.type];
            
            // Draw interaction lines
            for (let j = 0; j < agents.length; j++) {
                if (i !== j) {
                    const other = agents[j];
                    const dist = Math.sqrt(
                        (agent.x - other.x) ** 2 + 
                        (agent.y - other.y) ** 2
                    );
                    
                    if (dist < 10 && dist > 2) {
                        const steps = Math.floor(dist);
                        for (let s = 0; s < steps; s++) {
                            const sx = Math.floor(agent.x + (other.x - agent.x) * s / steps);
                            const sy = Math.floor(agent.y + (other.y - agent.y) * s / steps);
                            
                            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                                if (agent.type === other.type) {
                                    buffer[sy][sx] = '·';
                                } else {
                                    buffer[sy][sx] = '¨';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Scene 108: Nonlinear Dynamics
CLIFTScenes[108] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Strange attractor visualization
    let x = 0.1;
    let y = 0.1;
    let z = 0.1;
    
    // Lorenz attractor parameters (modified by audio)
    const sigma = 10 + audio[0] * 5;
    const rho = 28 + audio[32] * 10;
    const beta = 8/3 + audio[63] * 2;
    
    const iterations = 1000;
    const dt = 0.01;
    
    for (let i = 0; i < iterations; i++) {
        // Lorenz equations
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        
        // Map to screen coordinates
        const screenX = Math.floor(width / 2 + x * 2);
        const screenY = Math.floor(height / 2 - z + 20);
        
        if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
            // Density-based rendering
            const density = (i / iterations);
            const chars = ' ·∙•●○◉';
            const charIndex = Math.floor(density * (chars.length - 1));
            buffer[screenY][screenX] = chars[charIndex];
            
            // Phase space projection
            const phaseX = Math.floor(width / 2 + y * 2);
            const phaseY = Math.floor(height / 2 + x);
            
            if (phaseX >= 0 && phaseX < width && phaseY >= 0 && phaseY < height) {
                buffer[phaseY][phaseX] = '×';
            }
        }
    }
    
    // Bifurcation diagram overlay
    for (let r = 0; r < width; r++) {
        const rParam = 2.5 + (r / width) * 1.5;
        let xBif = 0.5;
        
        // Iterate to find stable points
        for (let n = 0; n < 100; n++) {
            xBif = rParam * xBif * (1 - xBif);
        }
        
        // Plot next iterations
        for (let n = 0; n < 50; n++) {
            xBif = rParam * xBif * (1 - xBif);
            const yBif = Math.floor((1 - xBif) * height);
            
            if (yBif >= 0 && yBif < height) {
                buffer[yBif][r] = '▪';
            }
        }
    }
};

// Scene 109: Meta Patterns
CLIFTScenes[109] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    const treble = params.audio ? params.audio[50] : 0.5;
    
    // Pattern that creates patterns
    const metaRules = [
        { symbol: '█', rule: 'spread', param: bass },
        { symbol: '○', rule: 'rotate', param: treble },
        { symbol: '╬', rule: 'branch', param: (bass + treble) / 2 },
        { symbol: '◆', rule: 'pulse', param: Math.sin(t) * 0.5 + 0.5 }
    ];
    
    // Seed pattern in center
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Initialize with random seed
    const seedType = Math.floor(t / 3) % metaRules.length;
    buffer[centerY][centerX] = metaRules[seedType].symbol;
    
    // Apply meta rules iteratively
    const tempBuffer = buffer.map(row => [...row]);
    
    for (let iteration = 0; iteration < 5; iteration++) {
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const currentChar = tempBuffer[y][x];
                
                // Find matching rule
                const rule = metaRules.find(r => r.symbol === currentChar);
                if (rule) {
                    switch (rule.rule) {
                        case 'spread':
                            // Spread to adjacent cells
                            if (Math.random() < rule.param) {
                                for (let dy = -1; dy <= 1; dy++) {
                                    for (let dx = -1; dx <= 1; dx++) {
                                        if (tempBuffer[y + dy][x + dx] === ' ' && Math.random() < 0.3) {
                                            buffer[y + dy][x + dx] = rule.symbol;
                                        }
                                    }
                                }
                            }
                            break;
                            
                        case 'rotate':
                            // Create rotating pattern
                            const angle = Math.atan2(y - centerY, x - centerX) + t * rule.param;
                            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                            
                            if (dist > 3 && dist < 15) {
                                const newX = Math.floor(centerX + Math.cos(angle) * dist);
                                const newY = Math.floor(centerY + Math.sin(angle) * dist);
                                
                                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                                    buffer[newY][newX] = rule.symbol;
                                }
                            }
                            break;
                            
                        case 'branch':
                            // Create branching structures
                            if (Math.random() < rule.param * 0.1) {
                                const branchDir = Math.floor(Math.random() * 4);
                                const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                                const [dx, dy] = dirs[branchDir];
                                
                                for (let i = 1; i < 5; i++) {
                                    const bx = x + dx * i;
                                    const by = y + dy * i;
                                    
                                    if (bx >= 0 && bx < width && by >= 0 && by < height) {
                                        buffer[by][bx] = rule.symbol;
                                    }
                                }
                            }
                            break;
                            
                        case 'pulse':
                            // Pulsing expansion
                            const pulseRadius = Math.floor(rule.param * 10);
                            
                            for (let dy = -pulseRadius; dy <= pulseRadius; dy++) {
                                for (let dx = -pulseRadius; dx <= pulseRadius; dx++) {
                                    if (dx * dx + dy * dy === pulseRadius * pulseRadius) {
                                        const px = x + dx;
                                        const py = y + dy;
                                        
                                        if (px >= 0 && px < width && py >= 0 && py < height) {
                                            buffer[py][px] = rule.symbol;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            }
        }
        
        // Copy buffer for next iteration
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                tempBuffer[y][x] = buffer[y][x];
            }
        }
    }
};

// ============================================
// CATEGORY 11: Interactive & Responsive (110-119)
// ============================================

// Scene 110: Cursor Trails
CLIFTScenes[110] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate cursor movement (in real implementation, would track actual cursor)
    const cursorX = Math.floor(width / 2 + Math.sin(t) * width / 3);
    const cursorY = Math.floor(height / 2 + Math.cos(t * 0.7) * height / 3);
    
    // Trail particles
    const trailLength = 20 + audio[0] * 30;
    const trailChars = '·∙•○◉●◎◐◑◒◓';
    
    for (let i = 0; i < trailLength; i++) {
        const trailT = t - i * 0.05;
        const tx = Math.floor(width / 2 + Math.sin(trailT) * width / 3);
        const ty = Math.floor(height / 2 + Math.cos(trailT * 0.7) * height / 3);
        
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            const charIndex = Math.floor((i / trailLength) * (trailChars.length - 1));
            buffer[ty][tx] = trailChars[trailChars.length - 1 - charIndex];
            
            // Particle effects around trail
            if (audio[i % audio.length] > 0.6) {
                for (let p = 0; p < 3; p++) {
                    const px = tx + Math.floor((Math.random() - 0.5) * 5);
                    const py = ty + Math.floor((Math.random() - 0.5) * 3);
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = '°';
                    }
                }
            }
        }
    }
    
    // Cursor representation
    if (cursorX >= 0 && cursorX < width && cursorY >= 0 && cursorY < height) {
        buffer[cursorY][cursorX] = '⊕';
        
        // Cursor aura
        const auraSize = 2 + Math.floor(audio[32] * 3);
        for (let dy = -auraSize; dy <= auraSize; dy++) {
            for (let dx = -auraSize; dx <= auraSize; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 1 && dist <= auraSize) {
                    const ax = cursorX + dx;
                    const ay = cursorY + dy;
                    
                    if (ax >= 0 && ax < width && ay >= 0 && ay < height && buffer[ay][ax] === ' ') {
                        const auraChars = '░▒▓';
                        const auraIndex = Math.floor((dist / auraSize) * (auraChars.length - 1));
                        buffer[ay][ax] = auraChars[auraChars.length - 1 - auraIndex];
                    }
                }
            }
        }
    }
};

// Scene 111: Touch Ripples
CLIFTScenes[111] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    
    // Simulate touch points
    const touches = [];
    for (let i = 0; i < 3 + Math.floor(bass * 2); i++) {
        touches.push({
            x: Math.floor(width / 2 + Math.sin(t * (i + 1) * 0.3) * width / 3),
            y: Math.floor(height / 2 + Math.cos(t * (i + 1) * 0.4) * height / 3),
            age: (t * (i + 1)) % 3
        });
    }
    
    // Create ripples from each touch
    touches.forEach(touch => {
        const maxRadius = 15;
        
        for (let radius = 0; radius < maxRadius; radius++) {
            const waveOffset = touch.age * 5;
            const currentRadius = (waveOffset + radius) % maxRadius;
            
            if (currentRadius > 0) {
                // Draw circle
                for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                    const x = Math.floor(touch.x + Math.cos(angle) * currentRadius);
                    const y = Math.floor(touch.y + Math.sin(angle) * currentRadius * 0.5); // Elliptical
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const intensity = 1 - (currentRadius / maxRadius);
                        const waveChars = ' .·:;≈~～';
                        const charIndex = Math.floor(intensity * (waveChars.length - 1));
                        
                        if (buffer[y][x] === ' ' || charIndex > 3) {
                            buffer[y][x] = waveChars[charIndex];
                        }
                    }
                }
            }
        }
        
        // Touch point center
        if (touch.x >= 0 && touch.x < width && touch.y >= 0 && touch.y < height) {
            buffer[touch.y][touch.x] = '◉';
        }
    });
    
    // Interference patterns where ripples meet
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let waveSum = 0;
            
            touches.forEach(touch => {
                const dist = Math.sqrt((x - touch.x) ** 2 + (y - touch.y) ** 2);
                const wave = Math.sin(dist * 0.5 - touch.age * 5) * Math.exp(-dist * 0.1);
                waveSum += wave;
            });
            
            if (Math.abs(waveSum) > 1.5) {
                buffer[y][x] = '▓';
            }
        }
    }
};

// Scene 112: Gesture Recognition
CLIFTScenes[112] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate different gestures
    const gestureType = Math.floor(t / 3) % 5;
    const gestureProgress = (t % 3) / 3;
    
    // Clear with background pattern
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.02) {
                buffer[y][x] = '·';
            }
        }
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    switch (gestureType) {
        case 0: // Swipe right
            for (let i = 0; i < 30; i++) {
                const x = Math.floor(gestureProgress * width + i - 30);
                const y = Math.floor(centerY + Math.sin(i * 0.3) * 2);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const chars = '→═══▶';
                    const charIndex = Math.floor(i / 30 * (chars.length - 1));
                    buffer[y][x] = chars[charIndex];
                }
            }
            
            // Gesture name
            const swipeText = "SWIPE →";
            for (let i = 0; i < swipeText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = swipeText[i];
                }
            }
            break;
            
        case 1: // Pinch
            const pinchRadius = 10 * (1 - gestureProgress);
            
            // Two points moving together
            const p1x = Math.floor(centerX - pinchRadius);
            const p1y = Math.floor(centerY);
            const p2x = Math.floor(centerX + pinchRadius);
            const p2y = Math.floor(centerY);
            
            // Draw pinch points
            if (p1x >= 0 && p1x < width && p1y >= 0 && p1y < height) {
                buffer[p1y][p1x] = '◄';
            }
            if (p2x >= 0 && p2x < width && p2y >= 0 && p2y < height) {
                buffer[p2y][p2x] = '►';
            }
            
            // Connection lines
            for (let x = p1x + 1; x < p2x; x++) {
                if (x >= 0 && x < width) {
                    buffer[centerY][x] = '─';
                }
            }
            
            const pinchText = "PINCH ◄►";
            for (let i = 0; i < pinchText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = pinchText[i];
                }
            }
            break;
            
        case 2: // Rotate
            const rotateAngle = gestureProgress * Math.PI * 2;
            const rotateRadius = 8;
            
            // Draw rotating arrows
            for (let i = 0; i < 8; i++) {
                const angle = rotateAngle + (i / 8) * Math.PI * 2;
                const x = Math.floor(centerX + Math.cos(angle) * rotateRadius);
                const y = Math.floor(centerY + Math.sin(angle) * rotateRadius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const arrowChars = '↑↗→↘↓↙←↖';
                    buffer[y][x] = arrowChars[i % arrowChars.length];
                }
            }
            
            // Center pivot
            buffer[Math.floor(centerY)][Math.floor(centerX)] = '⊕';
            
            const rotateText = "ROTATE ↻";
            for (let i = 0; i < rotateText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = rotateText[i];
                }
            }
            break;
            
        case 3: // Tap
            const tapScale = Math.sin(gestureProgress * Math.PI);
            const tapRadius = Math.floor(tapScale * 5);
            
            // Expanding circles
            for (let r = 0; r <= tapRadius; r++) {
                for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                    const x = Math.floor(centerX + Math.cos(angle) * r);
                    const y = Math.floor(centerY + Math.sin(angle) * r);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = r === tapRadius ? '○' : '·';
                    }
                }
            }
            
            // Tap center
            buffer[Math.floor(centerY)][Math.floor(centerX)] = '⊙';
            
            const tapText = "TAP ⊙";
            for (let i = 0; i < tapText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = tapText[i];
                }
            }
            break;
            
        case 4: // Hold
            const holdTime = gestureProgress;
            const holdIntensity = Math.floor(holdTime * 5);
            
            // Pulsing center
            for (let r = 0; r <= holdIntensity; r++) {
                for (let y = -r; y <= r; y++) {
                    for (let x = -r; x <= r; x++) {
                        if (x * x + y * y <= r * r) {
                            const px = Math.floor(centerX) + x;
                            const py = Math.floor(centerY) + y;
                            
                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                const intensityChars = ' ░▒▓█';
                                const charIndex = Math.min(r, intensityChars.length - 1);
                                buffer[py][px] = intensityChars[charIndex];
                            }
                        }
                    }
                }
            }
            
            const holdText = "HOLD ◉";
            for (let i = 0; i < holdText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = holdText[i];
                }
            }
            break;
    }
    
    // Audio reactivity overlay
    const audioLevel = audio[0];
    if (audioLevel > 0.7) {
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            buffer[y][x] = '✦';
        }
    }
};

// Scene 113: Voice Waveform
CLIFTScenes[113] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Main waveform
    const waveHeight = height * 0.6;
    const centerY = height / 2;
    
    for (let x = 0; x < width; x++) {
        // Get audio sample
        const audioIndex = Math.floor((x / width) * audio.length);
        const amplitude = audio[audioIndex];
        
        // Create thick waveform
        const waveY = centerY + Math.sin(x * 0.1 + t) * amplitude * waveHeight / 2;
        
        // Draw waveform with thickness
        for (let thickness = -1; thickness <= 1; thickness++) {
            const y = Math.floor(waveY + thickness);
            
            if (y >= 0 && y < height) {
                const waveChars = '─═━';
                const charIndex = Math.abs(thickness);
                buffer[y][x] = waveChars[charIndex];
            }
        }
        
        // Vertical lines for high amplitude
        if (amplitude > 0.7) {
            const topY = Math.floor(waveY - amplitude * 5);
            const bottomY = Math.floor(waveY + amplitude * 5);
            
            for (let y = topY; y <= bottomY; y++) {
                if (y >= 0 && y < height && y !== Math.floor(waveY)) {
                    buffer[y][x] = '│';
                }
            }
        }
    }
    
    // Frequency bands visualization
    const bands = 8;
    const bandWidth = Math.floor(width / bands);
    
    for (let band = 0; band < bands; band++) {
        const startX = band * bandWidth;
        const bandAudio = audio[Math.min(band * 8, audio.length - 1)] || 0.5;
        
        // Band indicator at top
        const bandHeight = Math.floor(bandAudio * 5);
        for (let h = 0; h < bandHeight; h++) {
            for (let x = startX; x < startX + bandWidth - 1 && x < width; x++) {
                if (h < height) {
                    buffer[h][x] = '▄';
                }
            }
        }
    }
    
    // Voice activity indicator
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    if (avgAudio > 0.3) {
        const indicator = "◉ VOICE ACTIVE";
        for (let i = 0; i < indicator.length && i < width - 2; i++) {
            buffer[height - 2][i + 2] = indicator[i];
        }
    }
    
    // dB meter on the right
    const dbLevels = 10;
    for (let level = 0; level < dbLevels; level++) {
        const y = height - 1 - level;
        const threshold = level / dbLevels;
        
        if (y >= 0 && avgAudio > threshold) {
            const meterChars = '▁▂▃▄▅▆▇█';
            const charIndex = Math.floor((level / dbLevels) * (meterChars.length - 1));
            
            if (width - 3 >= 0) {
                buffer[y][width - 3] = meterChars[charIndex];
                buffer[y][width - 2] = meterChars[charIndex];
            }
        }
    }
};

// Scene 114: Beat Matcher
CLIFTScenes[114] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const beat = params.beat || 0;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Beat grid
    const gridSize = 4;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    
    // Draw grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;
            
            // Grid borders
            for (let dx = 0; dx < cellWidth; dx++) {
                if (x + dx < width) {
                    if (row < gridSize - 1 && y + cellHeight < height) {
                        buffer[y + cellHeight][x + dx] = '─';
                    }
                }
            }
            for (let dy = 0; dy < cellHeight; dy++) {
                if (y + dy < height) {
                    if (col < gridSize - 1 && x + cellWidth < width) {
                        buffer[y + dy][x + cellWidth] = '│';
                    }
                }
            }
            
            // Cell activation based on beat
            const cellIndex = row * gridSize + col;
            const isActive = Math.floor(beat * 16) % 16 === cellIndex;
            
            if (isActive) {
                // Fill active cell
                for (let dy = 1; dy < cellHeight; dy++) {
                    for (let dx = 1; dx < cellWidth; dx++) {
                        if (x + dx < width && y + dy < height) {
                            buffer[y + dy][x + dx] = '█';
                        }
                    }
                }
            }
            
            // Beat number in cell
            const beatNum = cellIndex + 1;
            const numStr = beatNum.toString();
            const numX = x + Math.floor((cellWidth - numStr.length) / 2);
            const numY = y + Math.floor(cellHeight / 2);
            
            for (let i = 0; i < numStr.length; i++) {
                if (numX + i < width && numY < height) {
                    if (!isActive) {
                        buffer[numY][numX + i] = numStr[i];
                    }
                }
            }
        }
    }
    
    // Beat indicator bar
    const barY = height - 3;
    const beatPosition = Math.floor(beat * width);
    
    for (let x = 0; x < width; x++) {
        if (barY >= 0) {
            buffer[barY][x] = '─';
            
            if (x === beatPosition) {
                buffer[barY][x] = '●';
                if (barY - 1 >= 0) buffer[barY - 1][x] = '│';
                if (barY + 1 < height) buffer[barY + 1][x] = '│';
            }
        }
    }
    
    // BPM display
    const bpmText = `BPM: ${params.bpm || 120}`;
    for (let i = 0; i < bpmText.length && i < width; i++) {
        buffer[0][i] = bpmText[i];
    }
    
    // Audio level visualization around active cells
    const bass = audio[0];
    if (bass > 0.6) {
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            
            if (buffer[y][x] === ' ') {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 115: Motion Tracker
CLIFTScenes[115] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate motion detection zones
    const zones = [];
    for (let i = 0; i < 5; i++) {
        zones.push({
            x: Math.floor(width / 6 * (i + 1)),
            y: Math.floor(height / 2 + Math.sin(t + i) * height / 3),
            activity: audio[i * 10] || 0.5,
            id: i
        });
    }
    
    // Draw detection grid
    const gridStep = 3;
    for (let y = 0; y < height; y += gridStep) {
        for (let x = 0; x < width; x += gridStep) {
            buffer[y][x] = '·';
        }
    }
    
    // Draw active zones
    zones.forEach(zone => {
        if (zone.activity > 0.3) {
            const radius = Math.floor(zone.activity * 10);
            
            // Zone circle
            for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                const cx = Math.floor(zone.x + Math.cos(angle) * radius);
                const cy = Math.floor(zone.y + Math.sin(angle) * radius);
                
                if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                    buffer[cy][cx] = '○';
                }
            }
            
            // Motion vectors
            const vectorLength = Math.floor(zone.activity * 5);
            const vectorAngle = t + zone.id;
            
            for (let i = 0; i < vectorLength; i++) {
                const vx = Math.floor(zone.x + Math.cos(vectorAngle) * i);
                const vy = Math.floor(zone.y + Math.sin(vectorAngle) * i);
                
                if (vx >= 0 && vx < width && vy >= 0 && vy < height) {
                    buffer[vy][vx] = i === vectorLength - 1 ? '►' : '─';
                }
            }
            
            // Zone ID
            if (zone.x >= 0 && zone.x < width && zone.y >= 0 && zone.y < height) {
                buffer[zone.y][zone.x] = (zone.id + 1).toString();
            }
        }
    });
    
    // Motion trails
    const trailCount = Math.floor(audio[32] * 10);
    for (let i = 0; i < trailCount; i++) {
        const trailX = Math.floor(Math.random() * width);
        const trailY = Math.floor(Math.random() * height);
        const trailLength = Math.floor(Math.random() * 5 + 2);
        
        for (let j = 0; j < trailLength; j++) {
            const tx = trailX + j;
            if (tx < width && buffer[trailY][tx] === ' ') {
                buffer[trailY][tx] = '·';
            }
        }
    }
    
    // Status bar
    const statusText = "MOTION TRACKING ACTIVE";
    for (let i = 0; i < statusText.length && i < width; i++) {
        buffer[0][i] = statusText[i];
    }
    
    // Activity meter
    const avgActivity = zones.reduce((sum, z) => sum + z.activity, 0) / zones.length;
    const meterWidth = Math.floor(avgActivity * 20);
    
    for (let i = 0; i < meterWidth && i < width - 10; i++) {
        buffer[height - 1][i + 5] = '█';
    }
};

// Scene 116: Proximity Sensor
CLIFTScenes[116] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate proximity reading
    const proximity = (Math.sin(t) + 1) / 2;
    const objectDistance = proximity * 20; // Distance in units
    
    // Radar sweep
    const sweepAngle = (t * 2) % (Math.PI * 2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const maxRadius = Math.min(width, height) / 2 - 2;
    
    // Draw radar circles
    for (let r = 5; r < maxRadius; r += 5) {
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const x = Math.floor(centerX + Math.cos(angle) * r);
            const y = Math.floor(centerY + Math.sin(angle) * r);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '·';
            }
        }
    }
    
    // Radar sweep line
    for (let r = 0; r < maxRadius; r++) {
        const x = Math.floor(centerX + Math.cos(sweepAngle) * r);
        const y = Math.floor(centerY + Math.sin(sweepAngle) * r);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '═';
        }
    }
    
    // Detected object
    if (objectDistance < maxRadius) {
        const objAngle = sweepAngle - 0.5;
        const objX = Math.floor(centerX + Math.cos(objAngle) * objectDistance);
        const objY = Math.floor(centerY + Math.sin(objAngle) * objectDistance);
        
        // Object representation
        if (objX >= 1 && objX < width - 1 && objY >= 1 && objY < height - 1) {
            buffer[objY][objX] = '◉';
            buffer[objY - 1][objX] = '│';
            buffer[objY + 1][objX] = '│';
            buffer[objY][objX - 1] = '─';
            buffer[objY][objX + 1] = '─';
            
            // Distance indicator
            const distText = Math.floor(objectDistance).toString() + 'm';
            for (let i = 0; i < distText.length; i++) {
                if (objX + i + 2 < width) {
                    buffer[objY][objX + i + 2] = distText[i];
                }
            }
        }
    }
    
    // Proximity waves
    const waveCount = Math.floor((1 - proximity) * 5);
    for (let w = 0; w < waveCount; w++) {
        const waveRadius = w * 3 + (t * 10) % 15;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            const x = Math.floor(centerX + Math.cos(angle) * waveRadius);
            const y = Math.floor(centerY + Math.sin(angle) * waveRadius);
            
            if (x >= 0 && x < width && y >= 0 && y < height && buffer[y][x] === ' ') {
                buffer[y][x] = '»';
            }
        }
    }
    
    // Status display
    const statusText = `PROXIMITY: ${Math.floor(objectDistance)}m`;
    for (let i = 0; i < statusText.length && i < width; i++) {
        buffer[0][i] = statusText[i];
    }
    
    // Warning if too close
    if (proximity < 0.2) {
        const warning = "! WARNING: OBJECT NEAR !";
        const warnX = Math.floor((width - warning.length) / 2);
        
        for (let i = 0; i < warning.length; i++) {
            if (warnX + i >= 0 && warnX + i < width) {
                buffer[height - 2][warnX + i] = warning[i];
            }
        }
    }
};

// Scene 117: Rhythm Game
CLIFTScenes[117] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const beat = params.beat || 0;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Game lanes
    const lanes = 4;
    const laneWidth = Math.floor(width / lanes);
    
    // Draw lanes
    for (let lane = 0; lane < lanes; lane++) {
        const x = lane * laneWidth;
        
        // Lane dividers
        for (let y = 0; y < height; y++) {
            if (x > 0) {
                buffer[y][x] = '│';
            }
        }
        
        // Hit zone at bottom
        const hitZoneY = height - 5;
        for (let dx = 1; dx < laneWidth && x + dx < width; dx++) {
            buffer[hitZoneY][x + dx] = '═';
            buffer[hitZoneY + 1][x + dx] = '─';
        }
    }
    
    // Falling notes
    const noteSpeed = 10;
    const notes = [];
    
    // Generate notes based on audio
    for (let lane = 0; lane < lanes; lane++) {
        const audioIndex = lane * 16;
        if (audio[audioIndex] > 0.6 && Math.random() > 0.7) {
            notes.push({
                lane: lane,
                y: 0,
                hit: false
            });
        }
    }
    
    // Simulate existing notes
    for (let i = 0; i < 8; i++) {
        notes.push({
            lane: Math.floor(Math.random() * lanes),
            y: Math.floor(Math.random() * height * 0.7),
            hit: false
        });
    }
    
    // Draw and update notes
    notes.forEach(note => {
        const x = note.lane * laneWidth + Math.floor(laneWidth / 2);
        const y = Math.floor(note.y);
        
        if (y >= 0 && y < height && x >= 0 && x < width) {
            // Note representation
            if (y < height - 5) {
                buffer[y][x] = '▼';
                if (y > 0) buffer[y - 1][x] = '│';
            } else if (y === height - 5) {
                // Hit zone
                buffer[y][x] = '◉';
                note.hit = true;
            }
        }
        
        // Hit effect
        if (note.hit && y === height - 5) {
            const effectChars = '✦*+×';
            for (let i = 0; i < 3; i++) {
                const ex = x + Math.floor((Math.random() - 0.5) * 4);
                const ey = y + Math.floor((Math.random() - 0.5) * 2);
                
                if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                    buffer[ey][ex] = effectChars[Math.floor(Math.random() * effectChars.length)];
                }
            }
        }
    });
    
    // Score and combo
    const score = Math.floor(t * 100);
    const combo = Math.floor(beat * 16) % 100;
    
    const scoreText = `SCORE: ${score}`;
    const comboText = `COMBO: ${combo}x`;
    
    for (let i = 0; i < scoreText.length && i < width / 2; i++) {
        buffer[0][i] = scoreText[i];
    }
    
    for (let i = 0; i < comboText.length && i + width / 2 < width; i++) {
        buffer[0][i + Math.floor(width / 2)] = comboText[i];
    }
    
    // Perfect/Good/Miss indicators
    const hitQuality = audio[0] > 0.8 ? "PERFECT!" : audio[0] > 0.5 ? "GOOD!" : "MISS";
    const qualityX = Math.floor((width - hitQuality.length) / 2);
    
    if (Math.random() > 0.7) {
        for (let i = 0; i < hitQuality.length; i++) {
            if (qualityX + i >= 0 && qualityX + i < width) {
                buffer[height - 3][qualityX + i] = hitQuality[i];
            }
        }
    }
};

// Scene 118: Eye Tracking
CLIFTScenes[118] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate eye position
    const eyeX = Math.floor(width / 2 + Math.sin(t * 0.7) * width / 3);
    const eyeY = Math.floor(height / 2 + Math.cos(t * 0.5) * height / 3);
    
    // Draw eye representation
    const eyeRadius = 4;
    
    // Outer eye
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(eyeX + Math.cos(angle) * eyeRadius);
        const y = Math.floor(eyeY + Math.sin(angle) * eyeRadius * 0.6);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '○';
        }
    }
    
    // Pupil (follows audio)
    const pupilOffset = audio[0] * 2 - 1;
    const pupilX = Math.floor(eyeX + pupilOffset * 2);
    const pupilY = Math.floor(eyeY);
    
    if (pupilX >= 0 && pupilX < width && pupilY >= 0 && pupilY < height) {
        buffer[pupilY][pupilX] = '●';
    }
    
    // Gaze trail
    const trailLength = 20;
    for (let i = 0; i < trailLength; i++) {
        const trailT = t - i * 0.05;
        const tx = Math.floor(width / 2 + Math.sin(trailT * 0.7) * width / 3);
        const ty = Math.floor(height / 2 + Math.cos(trailT * 0.5) * height / 3);
        
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            const intensity = 1 - (i / trailLength);
            const trailChars = '·:;=';
            const charIndex = Math.floor(intensity * (trailChars.length - 1));
            buffer[ty][tx] = trailChars[charIndex];
        }
    }
    
    // Focus indicators
    const focusPoints = [];
    for (let i = 0; i < 5; i++) {
        focusPoints.push({
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            importance: Math.random()
        });
    }
    
    focusPoints.forEach(point => {
        const dist = Math.sqrt((point.x - eyeX) ** 2 + (point.y - eyeY) ** 2);
        const isFocused = dist < 10;
        
        if (point.x >= 0 && point.x < width && point.y >= 0 && point.y < height) {
            buffer[point.y][point.x] = isFocused ? '⊕' : '⊙';
            
            // Focus connection
            if (isFocused) {
                const steps = Math.floor(dist);
                for (let s = 0; s < steps; s++) {
                    const sx = Math.floor(eyeX + (point.x - eyeX) * s / steps);
                    const sy = Math.floor(eyeY + (point.y - eyeY) * s / steps);
                    
                    if (sx >= 0 && sx < width && sy >= 0 && sy < height && buffer[sy][sx] === ' ') {
                        buffer[sy][sx] = '·';
                    }
                }
            }
        }
    });
    
    // Heatmap overlay
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt((x - eyeX) ** 2 + (y - eyeY) ** 2);
            
            if (dist < 15 && dist > 5 && Math.random() > 0.8) {
                const heatChars = ' ░▒';
                const heatIndex = Math.floor((1 - dist / 15) * (heatChars.length - 1));
                
                if (buffer[y][x] === ' ') {
                    buffer[y][x] = heatChars[heatIndex];
                }
            }
        }
    }
    
    // Status
    const statusText = "EYE TRACKING ACTIVE";
    for (let i = 0; i < statusText.length && i < width; i++) {
        buffer[0][i] = statusText[i];
    }
};

// Scene 119: Biometric Display
CLIFTScenes[119] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate biometric data
    const heartRate = 60 + Math.sin(t) * 20 + audio[0] * 40;
    const breathing = Math.sin(t * 0.3) * 0.5 + 0.5;
    const stress = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Heart rate monitor
    const hrY = Math.floor(height * 0.3);
    const hrText = `♥ HR: ${Math.floor(heartRate)} BPM`;
    
    for (let i = 0; i < hrText.length && i < width; i++) {
        buffer[hrY][i] = hrText[i];
    }
    
    // ECG wave
    for (let x = 0; x < width; x++) {
        const ecgPhase = (x / width + t) * Math.PI * 4;
        let ecgValue = 0;
        
        // Simulate QRS complex
        if (ecgPhase % (Math.PI * 2) < 0.2) {
            ecgValue = Math.sin(ecgPhase * 20) * 3;
        } else {
            ecgValue = Math.sin(ecgPhase) * 0.5;
        }
        
        const ecgY = Math.floor(hrY + 2 + ecgValue);
        
        if (ecgY >= 0 && ecgY < height) {
            buffer[ecgY][x] = '─';
            
            // Heart beat effect
            if (Math.abs(ecgValue) > 2) {
                if (ecgY - 1 >= 0) buffer[ecgY - 1][x] = '│';
                if (ecgY + 1 < height) buffer[ecgY + 1][x] = '│';
            }
        }
    }
    
    // Breathing wave
    const breathY = Math.floor(height * 0.5);
    const breathText = `◊ RESP: ${Math.floor(breathing * 20 + 10)}/min`;
    
    for (let i = 0; i < breathText.length && i < width; i++) {
        buffer[breathY][i] = breathText[i];
    }
    
    // Breathing visualization
    for (let x = 0; x < width; x++) {
        const breathWave = Math.sin((x / width) * Math.PI * 2 + t * 0.3) * breathing * 3;
        const waveY = Math.floor(breathY + 2 + breathWave);
        
        if (waveY >= 0 && waveY < height) {
            buffer[waveY][x] = '~';
        }
    }
    
    // Stress level meter
    const stressY = Math.floor(height * 0.7);
    const stressText = `▣ STRESS: ${Math.floor(stress * 100)}%`;
    
    for (let i = 0; i < stressText.length && i < width; i++) {
        buffer[stressY][i] = stressText[i];
    }
    
    // Stress bar
    const stressBarWidth = Math.floor(stress * (width - 20));
    for (let i = 0; i < stressBarWidth; i++) {
        const barX = i + 15;
        if (barX < width) {
            const barChar = stress > 0.7 ? '█' : stress > 0.4 ? '▓' : '▒';
            buffer[stressY + 1][barX] = barChar;
        }
    }
    
    // Overall status
    const status = stress > 0.7 ? "ALERT" : stress > 0.4 ? "ACTIVE" : "CALM";
    const statusColor = stress > 0.7 ? "!" : stress > 0.4 ? "*" : "+";
    
    const statusText = `${statusColor} STATUS: ${status} ${statusColor}`;
    const statusX = Math.floor((width - statusText.length) / 2);
    
    for (let i = 0; i < statusText.length; i++) {
        if (statusX + i >= 0 && statusX + i < width) {
            buffer[height - 2][statusX + i] = statusText[i];
        }
    }
    
    // Biometric particles
    const particleCount = Math.floor(stress * 20);
    for (let i = 0; i < particleCount; i++) {
        const px = Math.floor(Math.random() * width);
        const py = Math.floor(Math.random() * height);
        
        if (buffer[py][px] === ' ') {
            const particleChars = '°∙·';
            buffer[py][px] = particleChars[Math.floor(Math.random() * particleChars.length)];
        }
    }
};

// ============================================
// CATEGORY 12: Fusion & Hybrid (120-129)
// ============================================

// Scene 120: Data Rain Matrix
CLIFTScenes[120] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Matrix rain columns
    const columns = Math.floor(width / 2);
    const columnData = [];
    
    // Initialize columns with random data
    for (let i = 0; i < columns; i++) {
        columnData.push({
            x: i * 2,
            y: Math.floor(Math.random() * height),
            speed: 0.5 + Math.random() * 1.5 + audio[i % audio.length],
            chars: '01アイウエオカキクケコサシスセソタチツテト',
            trail: Math.floor(Math.random() * 10 + 5)
        });
    }
    
    // Update and draw columns
    columnData.forEach((col, i) => {
        // Move column down
        col.y += col.speed;
        if (col.y > height + col.trail) {
            col.y = -col.trail;
            col.speed = 0.5 + Math.random() * 1.5 + audio[i % audio.length];
        }
        
        // Draw trail
        for (let j = 0; j < col.trail; j++) {
            const y = Math.floor(col.y - j);
            if (y >= 0 && y < height && col.x < width) {
                const brightness = 1 - (j / col.trail);
                const charIndex = Math.floor(Math.random() * col.chars.length);
                const char = col.chars[charIndex];
                
                // Color gradient effect
                if (j === 0) {
                    buffer[y][col.x] = char;
                    if (col.x + 1 < width) buffer[y][col.x + 1] = char;
                } else if (brightness > 0.7) {
                    buffer[y][col.x] = char;
                } else if (brightness > 0.3) {
                    buffer[y][col.x] = '░';
                } else {
                    buffer[y][col.x] = '·';
                }
            }
        }
    });
    
    // Glitch effect on high audio
    if (audio[0] > 0.7) {
        for (let i = 0; i < 10; i++) {
            const glitchX = Math.floor(Math.random() * width);
            const glitchY = Math.floor(Math.random() * height);
            const glitchSize = Math.floor(Math.random() * 10 + 5);
            
            for (let x = glitchX; x < glitchX + glitchSize && x < width; x++) {
                if (glitchY < height) {
                    buffer[glitchY][x] = '█';
                }
            }
        }
    }
};

// Scene 121: Hybrid Organism
CLIFTScenes[121] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Organic center
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Breathing organism
    const breathe = Math.sin(t * 0.5) * 0.5 + 0.5;
    const size = 5 + breathe * 10 + audio[0] * 5;
    
    // Draw organic body
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wobble = Math.sin(angle * 3 + t) * 2;
        const r = size + wobble;
        
        const x = Math.floor(centerX + Math.cos(angle) * r);
        const y = Math.floor(centerY + Math.sin(angle) * r * 0.7);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '●';
            
            // Inner structure
            const innerR = r * 0.7;
            const innerX = Math.floor(centerX + Math.cos(angle) * innerR);
            const innerY = Math.floor(centerY + Math.sin(angle) * innerR * 0.7);
            
            if (innerX >= 0 && innerX < width && innerY >= 0 && innerY < height) {
                buffer[innerY][innerX] = '○';
            }
        }
    }
    
    // Digital tentacles
    const tentacles = 6;
    for (let i = 0; i < tentacles; i++) {
        const baseAngle = (i / tentacles) * Math.PI * 2;
        const length = 15 + audio[i * 10 % audio.length] * 10;
        
        for (let j = 0; j < length; j++) {
            const wave = Math.sin(j * 0.3 + t * 2) * 0.2;
            const angle = baseAngle + wave;
            
            const x = Math.floor(centerX + Math.cos(angle) * (size + j));
            const y = Math.floor(centerY + Math.sin(angle) * (size + j) * 0.7);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const chars = '═╬╪╫';
                const charIndex = j % chars.length;
                buffer[y][x] = chars[charIndex];
                
                // Electric pulses
                if (Math.random() > 0.9) {
                    if (x + 1 < width) buffer[y][x + 1] = '▪';
                    if (x - 1 >= 0) buffer[y][x - 1] = '▪';
                }
            }
        }
    }
    
    // Data particles around organism
    const particleCount = Math.floor(audio[32] * 20);
    for (let i = 0; i < particleCount; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = size + 5 + Math.random() * 10;
        
        const px = Math.floor(centerX + Math.cos(pAngle) * pDist);
        const py = Math.floor(centerY + Math.sin(pAngle) * pDist);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            const dataChars = '01·°';
            buffer[py][px] = dataChars[Math.floor(Math.random() * dataChars.length)];
        }
    }
};

// Scene 122: Neon City Grid
CLIFTScenes[122] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Perspective grid
    const horizon = Math.floor(height * 0.4);
    const vanishX = width / 2;
    
    // Draw horizon line
    for (let x = 0; x < width; x++) {
        buffer[horizon][x] = '─';
    }
    
    // Vertical grid lines with perspective
    for (let i = -10; i <= 10; i++) {
        const baseX = vanishX + i * 5;
        
        for (let y = horizon; y < height; y++) {
            const perspective = (y - horizon) / (height - horizon);
            const x = Math.floor(vanishX + (baseX - vanishX) * perspective);
            
            if (x >= 0 && x < width) {
                buffer[y][x] = '│';
            }
        }
    }
    
    // Horizontal grid lines
    for (let y = horizon + 2; y < height; y += 2) {
        const perspective = (y - horizon) / (height - horizon);
        const lineWidth = Math.floor(width * perspective);
        const startX = Math.floor((width - lineWidth) / 2);
        
        for (let x = startX; x < startX + lineWidth; x++) {
            if (x >= 0 && x < width && buffer[y][x] === ' ') {
                buffer[y][x] = '─';
            }
        }
    }
    
    // Neon buildings
    const buildings = 5 + Math.floor(audio[0] * 3);
    for (let i = 0; i < buildings; i++) {
        const buildingX = Math.floor(Math.random() * width);
        const buildingHeight = Math.floor(Math.random() * (horizon - 2) + 2);
        const buildingWidth = Math.floor(Math.random() * 8 + 4);
        
        // Building outline
        for (let y = horizon - buildingHeight; y < horizon; y++) {
            for (let x = buildingX; x < buildingX + buildingWidth && x < width; x++) {
                if (y === horizon - buildingHeight || x === buildingX || x === buildingX + buildingWidth - 1) {
                    buffer[y][x] = '█';
                } else if (Math.random() > 0.3) {
                    // Windows
                    buffer[y][x] = Math.random() > 0.5 ? '▪' : '□';
                }
            }
        }
    }
    
    // Flying data streams
    const streams = Math.floor(audio[32] * 5);
    for (let i = 0; i < streams; i++) {
        const streamY = Math.floor(Math.random() * horizon);
        const streamStart = Math.floor(t * 20 + i * 10) % (width + 20) - 20;
        
        for (let x = streamStart; x < streamStart + 10 && x >= 0 && x < width; x++) {
            if (streamY >= 0 && streamY < height) {
                const streamChars = '»»═══──···';
                const charIndex = Math.min(x - streamStart, streamChars.length - 1);
                buffer[streamY][x] = streamChars[charIndex];
            }
        }
    }
    
    // Retro sun/moon
    const sunX = Math.floor(width * 0.8);
    const sunY = Math.floor(horizon * 0.3);
    const sunRadius = 3;
    
    for (let dy = -sunRadius; dy <= sunRadius; dy++) {
        for (let dx = -sunRadius; dx <= sunRadius; dx++) {
            if (dx * dx + dy * dy <= sunRadius * sunRadius) {
                const x = sunX + dx;
                const y = sunY + dy;
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '●';
                }
            }
        }
    }
};

// Scene 123: Audio DNA Helix
CLIFTScenes[123] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // DNA helix parameters
    const centerX = width / 2;
    const amplitude = width / 4;
    const frequency = 0.3;
    
    // Draw double helix
    for (let y = 0; y < height; y++) {
        const phase = y * frequency + t;
        
        // First strand
        const x1 = Math.floor(centerX + Math.sin(phase) * amplitude);
        // Second strand (180 degrees out of phase)
        const x2 = Math.floor(centerX - Math.sin(phase) * amplitude);
        
        if (x1 >= 0 && x1 < width) {
            buffer[y][x1] = '●';
        }
        if (x2 >= 0 && x2 < width) {
            buffer[y][x2] = '○';
        }
        
        // Connecting bonds (only when strands cross)
        if (Math.abs(x1 - x2) < amplitude * 0.5) {
            const bondStart = Math.min(x1, x2);
            const bondEnd = Math.max(x1, x2);
            
            for (let x = bondStart + 1; x < bondEnd; x++) {
                if (x >= 0 && x < width) {
                    // Audio reactive bonds
                    const audioIndex = Math.floor((y / height) * audio.length);
                    if (audio[audioIndex] > 0.5) {
                        buffer[y][x] = '═';
                    } else {
                        buffer[y][x] = '─';
                    }
                }
            }
        }
    }
    
    // Genetic data particles
    const dataPoints = Math.floor(audio[0] * 20);
    for (let i = 0; i < dataPoints; i++) {
        const y = Math.floor(Math.random() * height);
        const phase = y * frequency + t;
        const helixX = centerX + Math.sin(phase) * amplitude * 0.7;
        
        const x = Math.floor(helixX + (Math.random() - 0.5) * 10);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const genChars = 'ATCG';
            buffer[y][x] = genChars[Math.floor(Math.random() * genChars.length)];
        }
    }
    
    // Energy waves along helix
    const waveY = Math.floor((t * 5) % height);
    for (let x = 0; x < width; x++) {
        if (waveY >= 0 && waveY < height && buffer[waveY][x] === ' ') {
            const dist = Math.abs(x - centerX);
            if (dist < amplitude * 1.2) {
                buffer[waveY][x] = '·';
            }
        }
    }
};

// Scene 124: Fractal Tree of Life
CLIFTScenes[124] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Tree base
    const baseX = Math.floor(width / 2);
    const baseY = height - 1;
    
    // Recursive tree drawing
    function drawBranch(x, y, angle, length, depth) {
        if (depth <= 0 || length < 2 || y < 0) return;
        
        // Calculate end point
        const endX = Math.floor(x + Math.cos(angle) * length);
        const endY = Math.floor(y - Math.sin(angle) * length);
        
        // Draw branch
        const steps = Math.floor(length);
        for (let i = 0; i < steps; i++) {
            const bx = Math.floor(x + (endX - x) * i / steps);
            const by = Math.floor(y + (endY - y) * i / steps);
            
            if (bx >= 0 && bx < width && by >= 0 && by < height) {
                if (depth > 3) {
                    buffer[by][bx] = '║';
                } else if (depth > 1) {
                    buffer[by][bx] = '│';
                } else {
                    // Leaves
                    const leafChars = '*◦○●';
                    const audioMod = audio[Math.floor((bx / width) * audio.length)];
                    const charIndex = Math.floor(audioMod * (leafChars.length - 1));
                    buffer[by][bx] = leafChars[charIndex];
                }
            }
        }
        
        // Branch splitting with audio influence
        const splitAngle = 0.4 + audio[depth % audio.length] * 0.3;
        const branchReduction = 0.7;
        
        // Animate branches
        const sway = Math.sin(t + depth) * 0.1;
        
        // Left branch
        drawBranch(endX, endY, angle - splitAngle + sway, length * branchReduction, depth - 1);
        // Right branch
        drawBranch(endX, endY, angle + splitAngle + sway, length * branchReduction, depth - 1);
        
        // Sometimes add middle branch
        if (Math.random() > 0.5 && depth > 2) {
            drawBranch(endX, endY, angle + sway * 0.5, length * branchReduction * 0.8, depth - 1);
        }
    }
    
    // Draw main trunk and branches
    const treeHeight = 10 + audio[0] * 5;
    drawBranch(baseX, baseY, Math.PI / 2, treeHeight, 6);
    
    // Ground and roots
    for (let x = 0; x < width; x++) {
        if (height - 1 < height) {
            buffer[height - 1][x] = '═';
        }
    }
    
    // Digital roots
    for (let i = 0; i < 5; i++) {
        const rootX = baseX + (i - 2) * 3;
        const rootLength = 3 + Math.random() * 2;
        
        for (let j = 0; j < rootLength; j++) {
            const rx = rootX + Math.floor((Math.random() - 0.5) * 3);
            const ry = height - 1 - j;
            
            if (rx >= 0 && rx < width && ry >= 0) {
                buffer[ry][rx] = '╱';
            }
        }
    }
};

// Scene 125: Quantum Wave Collapse
CLIFTScenes[125] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Wave function states
    const states = [];
    const gridSize = 5;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    
    // Initialize quantum states
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            states.push({
                x: col * cellWidth,
                y: row * cellHeight,
                collapsed: Math.random() > 0.5,
                probability: Math.random(),
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // Update and collapse states based on audio
    states.forEach((state, i) => {
        const audioIndex = i % audio.length;
        
        // Collapse probability increases with audio
        if (!state.collapsed && audio[audioIndex] > 0.7) {
            state.collapsed = true;
            state.collapseTime = t;
        }
        
        // Uncollapse over time
        if (state.collapsed && t - state.collapseTime > 2) {
            state.collapsed = false;
        }
        
        // Draw state
        for (let dy = 0; dy < cellHeight - 1; dy++) {
            for (let dx = 0; dx < cellWidth - 1; dx++) {
                const x = state.x + dx;
                const y = state.y + dy;
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (state.collapsed) {
                        // Collapsed state - particle
                        if (dx === Math.floor(cellWidth / 2) && dy === Math.floor(cellHeight / 2)) {
                            buffer[y][x] = '◉';
                        } else {
                            const dist = Math.sqrt(
                                Math.pow(dx - cellWidth / 2, 2) + 
                                Math.pow(dy - cellHeight / 2, 2)
                            );
                            if (dist < cellWidth / 3) {
                                buffer[y][x] = '▪';
                            }
                        }
                    } else {
                        // Superposition - wave
                        const wave = Math.sin(dx * 0.5 + state.phase + t) * 
                                   Math.sin(dy * 0.5 + state.phase + t);
                        
                        if (wave > 0.5) {
                            buffer[y][x] = '░';
                        } else if (wave > 0) {
                            buffer[y][x] = '·';
                        }
                    }
                }
            }
        }
    });
    
    // Quantum entanglement lines
    for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
            if (states[i].collapsed && states[j].collapsed) {
                const x1 = states[i].x + cellWidth / 2;
                const y1 = states[i].y + cellHeight / 2;
                const x2 = states[j].x + cellWidth / 2;
                const y2 = states[j].y + cellHeight / 2;
                
                // Draw entanglement
                const steps = 20;
                for (let s = 0; s < steps; s++) {
                    const t = s / steps;
                    const x = Math.floor(x1 + (x2 - x1) * t);
                    const y = Math.floor(y1 + (y2 - y1) * t);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        if (s % 3 === 0) {
                            buffer[y][x] = '·';
                        }
                    }
                }
            }
        }
    }
};

// Scene 126: Cosmic Web
CLIFTScenes[126] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Galaxy nodes
    const nodes = [];
    const nodeCount = 8 + Math.floor(audio[0] * 5);
    
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            mass: 0.5 + Math.random() * 0.5,
            type: Math.floor(Math.random() * 3)
        });
    }
    
    // Update node positions
    nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Wrap around
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;
        
        // Gravitational influence
        nodes.forEach(other => {
            if (other !== node) {
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0 && dist < 30) {
                    const force = (other.mass * node.mass) / (dist * dist) * 0.01;
                    node.vx += dx * force;
                    node.vy += dy * force;
                }
            }
        });
        
        // Limit velocity
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > 1) {
            node.vx = (node.vx / speed) * 1;
            node.vy = (node.vy / speed) * 1;
        }
    });
    
    // Draw cosmic web connections
    nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
            if (i < j) {
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 25) {
                    // Draw filament
                    const steps = Math.floor(dist);
                    for (let s = 0; s < steps; s++) {
                        const t = s / steps;
                        const x = Math.floor(node.x + dx * t);
                        const y = Math.floor(node.y + dy * t);
                        
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const intensity = 1 - dist / 25;
                            const chars = '·:═';
                            const charIndex = Math.floor(intensity * (chars.length - 1));
                            buffer[y][x] = chars[charIndex];
                        }
                    }
                }
            }
        });
        
        // Draw galaxy nodes
        const x = Math.floor(node.x);
        const y = Math.floor(node.y);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const nodeChars = ['◉', '◎', '⊕'];
            buffer[y][x] = nodeChars[node.type];
            
            // Galaxy halo
            const haloSize = Math.floor(node.mass * 3 + audio[i % audio.length] * 2);
            for (let dy = -haloSize; dy <= haloSize; dy++) {
                for (let dx = -haloSize; dx <= haloSize; dx++) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 1 && dist <= haloSize) {
                        const hx = x + dx;
                        const hy = y + dy;
                        
                        if (hx >= 0 && hx < width && hy >= 0 && hy < height && buffer[hy][hx] === ' ') {
                            const haloChars = '·°';
                            const charIndex = dist < haloSize / 2 ? 1 : 0;
                            buffer[hy][hx] = haloChars[charIndex];
                        }
                    }
                }
            }
        }
    });
    
    // Dark matter particles
    const particleCount = Math.floor(audio[32] * 30);
    for (let i = 0; i < particleCount; i++) {
        const px = Math.floor(Math.random() * width);
        const py = Math.floor(Math.random() * height);
        
        if (buffer[py][px] === ' ') {
            buffer[py][px] = '·';
        }
    }
};

// Scene 127: Neural Mandala
CLIFTScenes[127] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 2;
    
    // Mandala layers
    const layers = 5;
    
    for (let layer = 0; layer < layers; layer++) {
        const layerRadius = (maxRadius / layers) * (layer + 1);
        const segments = 6 + layer * 2;
        const rotation = t * (0.1 + layer * 0.05) * (layer % 2 === 0 ? 1 : -1);
        
        // Neural connections within layer
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + rotation;
            const nextAngle = ((i + 1) / segments) * Math.PI * 2 + rotation;
            
            // Node positions
            const x1 = Math.floor(centerX + Math.cos(angle) * layerRadius);
            const y1 = Math.floor(centerY + Math.sin(angle) * layerRadius);
            const x2 = Math.floor(centerX + Math.cos(nextAngle) * layerRadius);
            const y2 = Math.floor(centerY + Math.sin(nextAngle) * layerRadius);
            
            // Draw nodes
            if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
                const nodeChars = '○◐◑◒◓●';
                const audioIndex = (layer * segments + i) % audio.length;
                const charIndex = Math.floor(audio[audioIndex] * (nodeChars.length - 1));
                buffer[y1][x1] = nodeChars[charIndex];
            }
            
            // Connect nodes
            const steps = Math.floor(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
            for (let s = 0; s < steps; s++) {
                const t = s / steps;
                const x = Math.floor(x1 + (x2 - x1) * t);
                const y = Math.floor(y1 + (y2 - y1) * t);
                
                if (x >= 0 && x < width && y >= 0 && y < height && buffer[y][x] === ' ') {
                    buffer[y][x] = layer % 2 === 0 ? '─' : '│';
                }
            }
            
            // Connect to inner layer
            if (layer > 0) {
                const innerRadius = (maxRadius / layers) * layer;
                const innerX = Math.floor(centerX + Math.cos(angle) * innerRadius);
                const innerY = Math.floor(centerY + Math.sin(angle) * innerRadius);
                
                const radialSteps = Math.floor(layerRadius - innerRadius);
                for (let s = 0; s < radialSteps; s++) {
                    const t = s / radialSteps;
                    const x = Math.floor(innerX + (x1 - innerX) * t);
                    const y = Math.floor(innerY + (y1 - innerY) * t);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height && buffer[y][x] === ' ') {
                        buffer[y][x] = s % 2 === 0 ? '·' : ' ';
                    }
                }
            }
        }
    }
    
    // Center core
    const coreSize = 2 + Math.floor(audio[0] * 2);
    for (let dy = -coreSize; dy <= coreSize; dy++) {
        for (let dx = -coreSize; dx <= coreSize; dx++) {
            if (dx * dx + dy * dy <= coreSize * coreSize) {
                const x = Math.floor(centerX) + dx;
                const y = Math.floor(centerY) + dy;
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '◉';
                }
            }
        }
    }
};

// Scene 128: Liquid Crystal Display
CLIFTScenes[128] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // LCD pixel grid
    const pixelSize = 3;
    const gridWidth = Math.floor(width / pixelSize);
    const gridHeight = Math.floor(height / pixelSize);
    
    // LCD crystal states
    const crystals = [];
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            crystals.push({
                x: col * pixelSize,
                y: row * pixelSize,
                state: Math.random(),
                targetState: Math.random(),
                transition: 0
            });
        }
    }
    
    // Update crystal states based on flowing pattern
    crystals.forEach((crystal, i) => {
        const row = Math.floor(i / gridWidth);
        const col = i % gridWidth;
        
        // Wave pattern influenced by audio
        const waveX = Math.sin(col * 0.3 + t) * 0.5 + 0.5;
        const waveY = Math.cos(row * 0.3 + t * 0.7) * 0.5 + 0.5;
        const audioMod = audio[Math.floor((col / gridWidth) * audio.length)];
        
        crystal.targetState = (waveX + waveY) / 2 * audioMod;
        
        // Smooth transition
        crystal.state += (crystal.targetState - crystal.state) * 0.1;
        
        // Draw pixel
        for (let dy = 0; dy < pixelSize - 1; dy++) {
            for (let dx = 0; dx < pixelSize - 1; dx++) {
                const x = crystal.x + dx;
                const y = crystal.y + dy;
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const intensity = crystal.state;
                    const chars = ' ░▒▓█';
                    const charIndex = Math.floor(intensity * (chars.length - 1));
                    buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
                }
            }
        }
        
        // Pixel borders
        for (let d = 0; d < pixelSize; d++) {
            if (crystal.x + pixelSize - 1 < width && crystal.y + d < height) {
                buffer[crystal.y + d][crystal.x + pixelSize - 1] = '│';
            }
            if (crystal.y + pixelSize - 1 < height && crystal.x + d < width) {
                buffer[crystal.y + pixelSize - 1][crystal.x + d] = '─';
            }
        }
    });
    
    // LCD artifacts and ghosting
    if (audio[0] > 0.7) {
        for (let i = 0; i < 5; i++) {
            const ghostY = Math.floor(Math.random() * height);
            const ghostLength = Math.floor(Math.random() * 20 + 10);
            const ghostX = Math.floor(Math.random() * (width - ghostLength));
            
            for (let x = ghostX; x < ghostX + ghostLength && x < width; x++) {
                if (buffer[ghostY][x] === ' ') {
                    buffer[ghostY][x] = '░';
                }
            }
        }
    }
};

// Scene 129: Infinite Zoom Mandelbrot
CLIFTScenes[129] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Zoom parameters
    const zoom = Math.exp(t * 0.1) * (1 + audio[0] * 0.5);
    const centerX = -0.5 + Math.sin(t * 0.1) * 0.1;
    const centerY = 0 + Math.cos(t * 0.1) * 0.1;
    
    // ASCII gradient for Mandelbrot visualization
    const gradient = ' ·:;+=xX#';
    
    // Calculate Mandelbrot set
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            // Map pixel to complex plane
            const x0 = (px - width / 2) / (width / 4) / zoom + centerX;
            const y0 = (py - height / 2) / (height / 4) / zoom + centerY;
            
            let x = 0;
            let y = 0;
            let iteration = 0;
            const maxIteration = 50 + Math.floor(audio[32] * 30);
            
            // Mandelbrot iteration
            while (x * x + y * y <= 4 && iteration < maxIteration) {
                const xtemp = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xtemp;
                iteration++;
            }
            
            // Color based on iteration count
            if (iteration === maxIteration) {
                buffer[py][px] = ' ';
            } else {
                const colorIndex = Math.floor((iteration / maxIteration) * (gradient.length - 1));
                buffer[py][px] = gradient[colorIndex];
            }
        }
    }
    
    // Overlay zoom level indicator
    const zoomText = `ZOOM: ${zoom.toFixed(1)}x`;
    for (let i = 0; i < zoomText.length && i < width; i++) {
        buffer[0][i] = zoomText[i];
    }
    
    // Audio reactive border
    const borderIntensity = audio[0];
    if (borderIntensity > 0.5) {
        // Top and bottom
        for (let x = 0; x < width; x++) {
            if (Math.random() < borderIntensity) {
                buffer[0][x] = '█';
                buffer[height - 1][x] = '█';
            }
        }
        // Left and right
        for (let y = 0; y < height; y++) {
            if (Math.random() < borderIntensity) {
                buffer[y][0] = '█';
                buffer[y][width - 1] = '█';
            }
        }
    }
};

// ============================================
// CATEGORY 13: Minimal & Zen (130-139)
// ============================================

// Scene 130: Breathing Circle
CLIFTScenes[130] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const breath = (Math.sin(t * 0.5) + 1) * 0.5 + audio[0] * 0.3;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 2;
    const radius = maxRadius * breath;
    
    // Draw breathing circle
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '○';
        }
    }
    
    // Center point
    if (breath > 0.7) {
        buffer[Math.floor(centerY)][Math.floor(centerX)] = '•';
    }
};

// Scene 131: Zen Garden
CLIFTScenes[131] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Sand ripples
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
            const wave = Math.sin(dist * 0.3 - t) * 0.5 + 0.5;
            
            if (wave > 0.7) {
                buffer[y][x] = '·';
            } else if (wave > 0.5) {
                buffer[y][x] = '.';
            }
        }
    }
    
    // Rocks (audio reactive placement)
    const numRocks = 3 + Math.floor(audio[0] * 2);
    for (let i = 0; i < numRocks; i++) {
        const rockX = Math.floor(width * (0.2 + i * 0.2));
        const rockY = Math.floor(height * (0.3 + Math.sin(t + i) * 0.2));
        
        if (rockX >= 0 && rockX < width && rockY >= 0 && rockY < height) {
            buffer[rockY][rockX] = '●';
        }
    }
};

// Scene 132: Minimal Lines
CLIFTScenes[132] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const intensity = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Horizontal lines
    const lineCount = 3 + Math.floor(intensity * 5);
    for (let i = 0; i < lineCount; i++) {
        const y = Math.floor(height * (i + 1) / (lineCount + 1));
        const offset = Math.sin(t + i) * 10;
        
        for (let x = 0; x < width; x++) {
            const xPos = x + offset;
            if (Math.sin(xPos * 0.1) > 0.5) {
                buffer[y][x] = '─';
            }
        }
    }
    
    // Vertical accents
    if (intensity > 0.5) {
        const x = Math.floor(width / 2);
        for (let y = 0; y < height; y++) {
            if (y % 3 === 0) {
                buffer[y][x] = '│';
            }
        }
    }
};

// Scene 133: Floating Dots
CLIFTScenes[133] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Initialize dots
    if (!params._dots) {
        params._dots = [];
        for (let i = 0; i < 20; i++) {
            params._dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3,
                char: '·•○'[Math.floor(Math.random() * 3)]
            });
        }
    }
    
    // Update and draw dots
    params._dots.forEach((dot, i) => {
        // Float movement
        dot.x += dot.vx + audio[i % 64] * 0.5;
        dot.y += dot.vy;
        
        // Wrap around
        if (dot.x < 0) dot.x = width - 1;
        if (dot.x >= width) dot.x = 0;
        if (dot.y < 0) dot.y = height - 1;
        if (dot.y >= height) dot.y = 0;
        
        // Draw
        const x = Math.floor(dot.x);
        const y = Math.floor(dot.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = dot.char;
        }
    });
};

// Scene 134: Wave Meditation
CLIFTScenes[134] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Single wave across screen
    for (let x = 0; x < width; x++) {
        const wave1 = Math.sin(x * 0.1 + t) * (height / 4);
        const wave2 = Math.sin(x * 0.05 + t * 0.7) * (height / 6);
        const combined = wave1 + wave2;
        
        const y = Math.floor(height / 2 + combined + avgAudio * 5);
        
        if (y >= 0 && y < height) {
            buffer[y][x] = '~';
            
            // Reflection
            const reflectY = height - 1 - y;
            if (reflectY >= 0 && reflectY < height && reflectY > y) {
                buffer[reflectY][x] = '˜';
            }
        }
    }
};

// Scene 135: Minimal Geometry
CLIFTScenes[135] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Rotating square
    const size = 10 + audio[0] * 10;
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = t;
    
    // Draw square corners
    const corners = [
        [-size/2, -size/2],
        [size/2, -size/2],
        [size/2, size/2],
        [-size/2, size/2]
    ];
    
    corners.forEach((corner, i) => {
        const nextCorner = corners[(i + 1) % 4];
        
        // Rotate
        const x1 = corner[0] * Math.cos(angle) - corner[1] * Math.sin(angle);
        const y1 = corner[0] * Math.sin(angle) + corner[1] * Math.cos(angle);
        const x2 = nextCorner[0] * Math.cos(angle) - nextCorner[1] * Math.sin(angle);
        const y2 = nextCorner[0] * Math.sin(angle) + nextCorner[1] * Math.cos(angle);
        
        // Draw line between corners
        const steps = 20;
        for (let s = 0; s < steps; s++) {
            const t = s / steps;
            const x = Math.floor(centerX + x1 + (x2 - x1) * t);
            const y = Math.floor(centerY + y1 + (y2 - y1) * t);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '□';
            }
        }
    });
};

// Scene 136: Pulse Field
CLIFTScenes[136] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Grid of pulsing points
    const gridX = 8;
    const gridY = 4;
    const cellWidth = width / gridX;
    const cellHeight = height / gridY;
    
    for (let gy = 0; gy < gridY; gy++) {
        for (let gx = 0; gx < gridX; gx++) {
            const index = gy * gridX + gx;
            const pulse = Math.sin(t * 2 + index * 0.5) * 0.5 + 0.5;
            const audioPulse = audio[index % 64];
            const intensity = pulse * 0.7 + audioPulse * 0.3;
            
            const x = Math.floor((gx + 0.5) * cellWidth);
            const y = Math.floor((gy + 0.5) * cellHeight);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                if (intensity > 0.7) {
                    buffer[y][x] = '◉';
                } else if (intensity > 0.4) {
                    buffer[y][x] = '○';
                } else if (intensity > 0.1) {
                    buffer[y][x] = '·';
                }
            }
        }
    }
};

// Scene 137: Horizon Line
CLIFTScenes[137] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Horizon position (audio reactive)
    const horizonY = Math.floor(height / 2 + audio[0] * 5 * Math.sin(t));
    
    // Draw horizon
    for (let x = 0; x < width; x++) {
        buffer[horizonY][x] = '─';
    }
    
    // Sun/moon
    const celestialX = Math.floor(width / 2 + Math.sin(t * 0.3) * width / 3);
    const celestialY = Math.floor(horizonY - 5 - Math.abs(Math.sin(t * 0.3)) * 5);
    
    if (celestialX >= 1 && celestialX < width - 1 && celestialY >= 1 && celestialY < height - 1) {
        buffer[celestialY][celestialX] = '○';
        // Rays
        if (audio[32] > 0.5) {
            buffer[celestialY - 1][celestialX] = '|';
            buffer[celestialY + 1][celestialX] = '|';
            buffer[celestialY][celestialX - 1] = '─';
            buffer[celestialY][celestialX + 1] = '─';
        }
    }
    
    // Reflection
    if (celestialY < horizonY) {
        const reflectY = horizonY + (horizonY - celestialY);
        if (reflectY < height) {
            buffer[reflectY][celestialX] = '˙';
        }
    }
};

// Scene 138: Minimal Rain
CLIFTScenes[138] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const intensity = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Initialize raindrops
    if (!params._raindrops) {
        params._raindrops = [];
        for (let i = 0; i < 30; i++) {
            params._raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    // Update and draw raindrops
    params._raindrops.forEach(drop => {
        drop.y += drop.speed + intensity;
        
        if (drop.y >= height) {
            drop.y = 0;
            drop.x = Math.random() * width;
        }
        
        const x = Math.floor(drop.x);
        const y = Math.floor(drop.y);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '|';
            
            // Splash at bottom
            if (y === height - 1) {
                if (x > 0) buffer[y][x - 1] = '·';
                if (x < width - 1) buffer[y][x + 1] = '·';
            }
        }
    });
};

// Scene 139: Enso Circle
CLIFTScenes[139] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const brush = audio[0];
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Draw incomplete circle (Enso)
    const startAngle = t * 0.2;
    const endAngle = startAngle + Math.PI * 1.8; // Incomplete circle
    
    for (let angle = startAngle; angle < endAngle; angle += 0.05) {
        const thickness = 1 + brush * 2;
        
        for (let r = radius - thickness; r <= radius + thickness; r += 0.5) {
            const x = Math.floor(centerX + Math.cos(angle) * r);
            const y = Math.floor(centerY + Math.sin(angle) * r * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const intensity = 1 - Math.abs(r - radius) / thickness;
                buffer[y][x] = intensity > 0.7 ? '#' : (intensity > 0.3 ? '=' : '·');
            }
        }
    }
};

// ============================================
// CATEGORY 14: Finale & Epic (140-149)
// ============================================

// Scene 140: Grand Finale Fireworks
CLIFTScenes[140] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    const bassLevel = audio.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    
    // Initialize fireworks
    if (!params._fireworks) {
        params._fireworks = [];
    }
    
    // Launch new fireworks on bass hits
    if (bassLevel > 0.7 && Math.random() > 0.5) {
        params._fireworks.push({
            x: Math.random() * width,
            y: height,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            age: 0,
            exploded: false,
            particles: []
        });
    }
    
    // Update and draw fireworks
    params._fireworks = params._fireworks.filter(fw => {
        fw.age++;
        
        if (!fw.exploded) {
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += 0.1;
            
            // Draw trail
            const x = Math.floor(fw.x);
            const y = Math.floor(fw.y);
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '|';
            }
            
            // Explode at peak
            if (fw.vy > 0 || fw.y < height / 3) {
                fw.exploded = true;
                // Create explosion particles
                const particleCount = 20 + Math.floor(audio[32] * 30);
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;
                    const speed = 1 + Math.random() * 2;
                    fw.particles.push({
                        x: fw.x,
                        y: fw.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 30 + Math.random() * 20
                    });
                }
            }
        } else {
            // Update particles
            fw.particles = fw.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                p.life--;
                
                const x = Math.floor(p.x);
                const y = Math.floor(p.y);
                if (x >= 0 && x < width && y >= 0 && y < height && p.life > 0) {
                    const chars = ['*', '+', '·'];
                    buffer[y][x] = chars[Math.floor((1 - p.life / 50) * chars.length)];
                }
                
                return p.life > 0;
            });
        }
        
        return fw.age < 100 && (fw.particles.length > 0 || !fw.exploded);
    });
    
    // Grand finale text
    if (bassLevel > 0.8) {
        const text = "FINALE!";
        const x = Math.floor((width - text.length) / 2);
        const y = Math.floor(height / 2);
        for (let i = 0; i < text.length; i++) {
            if (x + i < width) {
                buffer[y][x + i] = text[i];
            }
        }
    }
};

// Scene 141: Epic Scrolling Credits
CLIFTScenes[141] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Credits text
    const credits = [
        "CLIFT WEB",
        "========",
        "",
        "ASCII VJ SOFTWARE",
        "",
        "CREATED BY",
        "THE COMMUNITY",
        "",
        "SPECIAL THANKS TO",
        "ALL CONTRIBUTORS",
        "",
        "POWERED BY",
        "WEB AUDIO API",
        "CANVAS",
        "JAVASCRIPT",
        "",
        "150 SCENES",
        "12 EFFECTS",
        "∞ POSSIBILITIES",
        "",
        "KEEP CREATING!",
        "",
        "♫ ♪ ♫ ♪"
    ];
    
    const scrollY = (t * 10) % (credits.length + height);
    
    // Draw credits
    credits.forEach((line, i) => {
        const y = Math.floor(height - scrollY + i);
        if (y >= 0 && y < height) {
            const x = Math.floor((width - line.length) / 2);
            for (let j = 0; j < line.length; j++) {
                if (x + j >= 0 && x + j < width) {
                    buffer[y][x + j] = line[j];
                }
            }
        }
    });
    
    // Side decorations (audio reactive)
    for (let y = 0; y < height; y++) {
        const intensity = audio[y % 64];
        if (intensity > 0.5) {
            buffer[y][0] = '║';
            buffer[y][width - 1] = '║';
        }
    }
};

// Scene 142: All Patterns Mashup
CLIFTScenes[142] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.4);
    
    // Divide screen into quadrants showing different patterns
    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);
    
    // Top-left: Spiral
    for (let a = 0; a < 50; a++) {
        const angle = a * 0.3 + t;
        const r = a * 0.5;
        const x = Math.floor(midX / 2 + Math.cos(angle) * r);
        const y = Math.floor(midY / 2 + Math.sin(angle) * r * 0.5);
        if (x >= 0 && x < midX && y >= 0 && y < midY) {
            buffer[y][x] = '@';
        }
    }
    
    // Top-right: Matrix rain
    for (let x = midX; x < width; x++) {
        const offset = (t * 20 + x * 7) % 100;
        const y = Math.floor(offset * height / 100);
        if (y < midY) {
            buffer[y][x] = String.fromCharCode(33 + Math.floor(Math.random() * 93));
        }
    }
    
    // Bottom-left: Audio bars
    for (let i = 0; i < midX; i++) {
        const barHeight = Math.floor(audio[i % 64] * midY);
        for (let y = 0; y < barHeight; y++) {
            buffer[height - 1 - y][i] = '█';
        }
    }
    
    // Bottom-right: Plasma
    for (let y = midY; y < height; y++) {
        for (let x = midX; x < width; x++) {
            const v1 = Math.sin((x - midX) * 0.2 + t);
            const v2 = Math.sin((y - midY) * 0.2 + t * 1.1);
            const v3 = Math.sin(Math.sqrt((x - midX) * (x - midX) + (y - midY) * (y - midY)) * 0.3 + t);
            const v = (v1 + v2 + v3) / 3;
            buffer[y][x] = v > 0.5 ? '#' : (v > 0 ? '=' : ' ');
        }
    }
    
    // Divider lines
    for (let y = 0; y < height; y++) buffer[y][midX] = '│';
    for (let x = 0; x < width; x++) buffer[midY][x] = '─';
    buffer[midY][midX] = '┼';
};

// Scene 143: Infinite Tunnel Journey
CLIFTScenes[143] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Multiple tunnel layers
    for (let layer = 0; layer < 5; layer++) {
        const offset = t * (5 - layer) + layer * 10;
        const size = ((offset % 20) / 20) * Math.min(width, height) / 2;
        
        // Draw rectangular tunnel segment
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const x = Math.floor(centerX + Math.cos(angle) * size);
            const y = Math.floor(centerY + Math.sin(angle) * size * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const brightness = 1 - (layer / 5);
                const chars = ['█', '▓', '▒', '░', '·'];
                buffer[y][x] = chars[Math.min(layer, chars.length - 1)];
            }
        }
    }
    
    // Center vortex (audio reactive)
    if (avgAudio > 0.5) {
        const vortexSize = avgAudio * 5;
        for (let dy = -vortexSize; dy <= vortexSize; dy++) {
            for (let dx = -vortexSize; dx <= vortexSize; dx++) {
                const x = Math.floor(centerX + dx);
                const y = Math.floor(centerY + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (Math.abs(dx) + Math.abs(dy) <= vortexSize) {
                        buffer[y][x] = '*';
                    }
                }
            }
        }
    }
};

// Scene 144: Time Warp Clock
CLIFTScenes[144] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 2;
    
    // Draw clock face
    for (let hour = 0; hour < 12; hour++) {
        const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
        const x = Math.floor(centerX + Math.cos(angle) * radius * 0.9);
        const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = (hour % 3 === 0) ? '●' : '·';
        }
    }
    
    // Time warp effect (audio reactive)
    const warpFactor = audio[0] * 10;
    
    // Hour hand
    const hourAngle = (t * 0.1 + warpFactor) - Math.PI / 2;
    for (let r = 0; r < radius * 0.5; r++) {
        const x = Math.floor(centerX + Math.cos(hourAngle) * r);
        const y = Math.floor(centerY + Math.sin(hourAngle) * r * 0.5);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '=';
        }
    }
    
    // Minute hand
    const minuteAngle = (t + warpFactor * 2) - Math.PI / 2;
    for (let r = 0; r < radius * 0.7; r++) {
        const x = Math.floor(centerX + Math.cos(minuteAngle) * r);
        const y = Math.floor(centerY + Math.sin(minuteAngle) * r * 0.5);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '-';
        }
    }
    
    // Second hand (rapidly spinning in warp)
    const secondAngle = (t * 10 + warpFactor * 5) - Math.PI / 2;
    for (let r = 0; r < radius * 0.8; r++) {
        const x = Math.floor(centerX + Math.cos(secondAngle) * r);
        const y = Math.floor(centerY + Math.sin(secondAngle) * r * 0.5);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '|';
        }
    }
    
    // Center
    buffer[Math.floor(centerY)][Math.floor(centerX)] = '◉';
    
    // Warp ripples
    if (audio[32] > 0.5) {
        const rippleRadius = (t * 20) % radius;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const x = Math.floor(centerX + Math.cos(angle) * rippleRadius);
            const y = Math.floor(centerY + Math.sin(angle) * rippleRadius * 0.5);
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '○';
            }
        }
    }
};

// Scene 145: Cosmic Symphony
CLIFTScenes[145] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.4);
    
    // Musical staff lines
    const staffY = [
        Math.floor(height * 0.2),
        Math.floor(height * 0.35),
        Math.floor(height * 0.5),
        Math.floor(height * 0.65),
        Math.floor(height * 0.8)
    ];
    
    // Draw staff
    staffY.forEach(y => {
        for (let x = 0; x < width; x++) {
            buffer[y][x] = '─';
        }
    });
    
    // Place notes based on audio
    for (let i = 0; i < width && i < audio.length; i++) {
        const noteY = staffY[Math.floor(audio[i] * staffY.length)];
        const x = Math.floor((i / audio.length) * width);
        
        if (audio[i] > 0.3) {
            // Note head
            buffer[noteY][x] = '♪';
            
            // Stem
            if (noteY > 3) {
                for (let y = noteY - 3; y < noteY; y++) {
                    if (y >= 0 && y < height) {
                        buffer[y][x] = '│';
                    }
                }
            }
        }
    }
    
    // Cosmic background (stars)
    for (let i = 0; i < 50; i++) {
        const x = Math.floor((Math.sin(t + i) * 0.5 + 0.5) * width);
        const y = Math.floor((Math.cos(t * 0.7 + i * 2) * 0.5 + 0.5) * height);
        if (x >= 0 && x < width && y >= 0 && y < height && buffer[y][x] === ' ') {
            buffer[y][x] = '.·*'[i % 3];
        }
    }
    
    // Title
    const title = "♫ COSMIC SYMPHONY ♫";
    const titleX = Math.floor((width - title.length) / 2);
    if (titleX >= 0) {
        for (let i = 0; i < title.length && titleX + i < width; i++) {
            buffer[1][titleX + i] = title[i];
        }
    }
};

// Scene 146: Digital Phoenix
CLIFTScenes[146] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.4);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Phoenix body
    const bodyY = centerY + Math.sin(t) * 3;
    
    // Wings animation
    const wingSpan = 15 + avgAudio * 20;
    const wingFlap = Math.sin(t * 3) * 0.3;
    
    // Draw phoenix
    for (let x = -wingSpan; x <= wingSpan; x++) {
        const wingY = Math.abs(x) * 0.3 * (1 + wingFlap);
        const px = Math.floor(centerX + x);
        const py = Math.floor(bodyY - wingY);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            if (Math.abs(x) < 3) {
                // Body
                buffer[py][px] = '█';
            } else {
                // Wings
                const wingChar = (Math.abs(x) < wingSpan * 0.6) ? '▓' : '░';
                buffer[py][px] = wingChar;
            }
        }
        
        // Wing feathers
        if (Math.abs(x) > 5 && Math.abs(x) < wingSpan - 2) {
            const featherY = py + Math.floor(Math.sin(x * 0.5 + t * 2) * 2);
            if (px >= 0 && px < width && featherY >= 0 && featherY < height) {
                buffer[featherY][px] = '~';
            }
        }
    }
    
    // Head
    const headY = Math.floor(bodyY - 5);
    if (headY >= 0 && headY < height) {
        buffer[headY][Math.floor(centerX)] = '◉';
    }
    
    // Fire trail (audio reactive)
    for (let y = Math.floor(bodyY); y < height; y++) {
        const spread = (y - bodyY) * 0.5;
        for (let dx = -spread; dx <= spread; dx++) {
            const x = Math.floor(centerX + dx);
            if (x >= 0 && x < width && Math.random() < avgAudio) {
                const intensity = 1 - (y - bodyY) / (height - bodyY);
                buffer[y][x] = intensity > 0.7 ? '#' : (intensity > 0.3 ? '+' : '·');
            }
        }
    }
    
    // Digital glitch effects
    if (avgAudio > 0.6) {
        for (let i = 0; i < 20; i++) {
            const glitchX = Math.floor(Math.random() * width);
            const glitchY = Math.floor(Math.random() * height);
            buffer[glitchY][glitchX] = '01'[Math.floor(Math.random() * 2)];
        }
    }
};

// Scene 147: Retro Future City
CLIFTScenes[147] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Skyline
    const buildings = [];
    for (let i = 0; i < 10; i++) {
        buildings.push({
            x: Math.floor(i * width / 10),
            width: Math.floor(width / 12),
            height: Math.floor(height * (0.3 + Math.sin(i + t * 0.1) * 0.2 + audio[i * 6] * 0.3))
        });
    }
    
    // Draw buildings
    buildings.forEach((b, i) => {
        for (let x = b.x; x < b.x + b.width && x < width; x++) {
            for (let y = height - b.height; y < height; y++) {
                if (y >= 0) {
                    buffer[y][x] = '█';
                }
                
                // Windows
                if ((x - b.x) % 3 === 1 && (y - (height - b.height)) % 3 === 1) {
                    if (Math.random() > 0.3 || audio[i * 6] > 0.5) {
                        buffer[y][x] = '□';
                    }
                }
            }
        }
    });
    
    // Flying cars
    for (let i = 0; i < 5; i++) {
        const carX = Math.floor((t * 20 + i * 30) % (width + 10)) - 5;
        const carY = Math.floor(height * 0.2 + Math.sin(t + i) * 5);
        
        if (carX >= 0 && carX < width - 3 && carY >= 0 && carY < height) {
            buffer[carY][carX] = '<';
            buffer[carY][carX + 1] = '=';
            buffer[carY][carX + 2] = '=';
            buffer[carY][carX + 3] = '>';
        }
    }
    
    // Neon grid ground
    const groundY = height - 1;
    for (let x = 0; x < width; x++) {
        if (x % 4 === 0) {
            for (let y = groundY - 3; y <= groundY; y++) {
                if (y >= 0 && y < height) {
                    buffer[y][x] = '│';
                }
            }
        }
    }
    
    // Stars
    for (let i = 0; i < 30; i++) {
        const starX = Math.floor((i * 7 + t * 2) % width);
        const starY = Math.floor(height * 0.1 + (i * 3) % (height * 0.2));
        if (starX >= 0 && starX < width && starY >= 0 && starY < height && buffer[starY][starX] === ' ') {
            buffer[starY][starX] = '·*'[i % 2];
        }
    }
};

// Scene 148: Everything Everywhere
CLIFTScenes[148] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Multiple reality layers
    const layers = 5;
    
    for (let layer = 0; layer < layers; layer++) {
        const layerT = t + layer * 0.5;
        const opacity = audio[layer * 10] || 0.5;
        
        // Each layer shows different pattern
        switch (layer % 5) {
            case 0: // Spirals
                for (let a = 0; a < 30; a++) {
                    const angle = a * 0.2 + layerT;
                    const r = a * 0.5;
                    const x = Math.floor(width / 2 + Math.cos(angle) * r);
                    const y = Math.floor(height / 2 + Math.sin(angle) * r * 0.5);
                    if (x >= 0 && x < width && y >= 0 && y < height && Math.random() < opacity) {
                        buffer[y][x] = '@';
                    }
                }
                break;
                
            case 1: // Grid
                for (let x = 0; x < width; x += 5) {
                    for (let y = 0; y < height; y += 3) {
                        if (Math.random() < opacity) {
                            buffer[y][x] = '+';
                        }
                    }
                }
                break;
                
            case 2: // Waves
                for (let x = 0; x < width; x++) {
                    const y = Math.floor(height / 2 + Math.sin(x * 0.1 + layerT) * height / 4);
                    if (y >= 0 && y < height && Math.random() < opacity) {
                        buffer[y][x] = '~';
                    }
                }
                break;
                
            case 3: // Particles
                for (let i = 0; i < 50; i++) {
                    const x = Math.floor((layerT * 10 + i * 13) % width);
                    const y = Math.floor((layerT * 5 + i * 7) % height);
                    if (Math.random() < opacity) {
                        buffer[y][x] = '*';
                    }
                }
                break;
                
            case 4: // Text
                const text = "EVERYTHING";
                const textY = Math.floor(height / 2 + Math.sin(layerT) * 5);
                const textX = Math.floor((layerT * 10) % (width + text.length)) - text.length;
                for (let i = 0; i < text.length; i++) {
                    if (textX + i >= 0 && textX + i < width && Math.random() < opacity) {
                        buffer[textY][textX + i] = text[i];
                    }
                }
                break;
        }
    }
    
    // Central focus point
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const x = centerX + dx;
            const y = centerY + dy;
            if (x >= 0 && x < width && y >= 0 && y < height) {
                if (Math.abs(dx) + Math.abs(dy) <= 2) {
                    buffer[y][x] = '◉';
                }
            }
        }
    }
};

// Scene 149: The End... Or Beginning?
CLIFTScenes[149] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Pulsing message
    const messages = [
        "THE END",
        "...OR...",
        "THE BEGINNING?",
        "∞",
        "LOOP FOREVER",
        "♫ ∞ ♫"
    ];
    
    const messageIndex = Math.floor(t / 3) % messages.length;
    const message = messages[messageIndex];
    const fade = (Math.sin(t * 2) + 1) / 2;
    
    // Draw message with fade effect
    const msgY = Math.floor(height / 2);
    const msgX = Math.floor((width - message.length) / 2);
    
    for (let i = 0; i < message.length; i++) {
        if (msgX + i >= 0 && msgX + i < width && Math.random() < fade) {
            buffer[msgY][msgX + i] = message[i];
        }
    }
    
    // Circular infinity symbol animation
    const radius = Math.min(width, height) / 3;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        // Figure-8 infinity pattern
        const x1 = Math.floor(width / 2 + Math.cos(angle + t) * radius);
        const y1 = Math.floor(height / 2 + Math.sin(angle * 2 + t) * radius * 0.5);
        
        if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
            const intensity = (Math.sin(angle * 3 + t * 2) + 1) / 2;
            buffer[y1][x1] = intensity > 0.7 ? '●' : (intensity > 0.3 ? '○' : '·');
        }
    }
    
    // Audio reactive particles spiraling outward
    for (let i = 0; i < 64; i++) {
        if (audio[i] > 0.3) {
            const particleAngle = (i / 64) * Math.PI * 2 + t;
            const particleRadius = (t * 10 + i * 2) % (Math.min(width, height) / 2);
            const px = Math.floor(width / 2 + Math.cos(particleAngle) * particleRadius);
            const py = Math.floor(height / 2 + Math.sin(particleAngle) * particleRadius);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = '*+·'[Math.floor(audio[i] * 3)];
            }
        }
    }
    
    // Loop counter
    const loopCount = Math.floor(t / 20);
    const counterText = `Loop #${loopCount}`;
    for (let i = 0; i < counterText.length && i < width; i++) {
        buffer[height - 1][i] = counterText[i];
    }
};

// ============================================
// CATEGORY 15: Ikeda-Inspired (150-159)
// ============================================

// Scene 150: Data Matrix
CLIFTScenes[150] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Binary data streams
    for (let x = 0; x < width; x += 8) {
        for (let y = 0; y < height; y += 2) {
            const noise = Math.sin(x * 0.1 + y * 0.1 + t) * 0.5 + 0.5;
            const audioMod = audio[x % audio.length] || 0;
            if (noise + audioMod > 0.7) {
                buffer[y][x] = Math.random() > 0.5 ? '1' : '0';
            }
        }
    }
    
    // Grid lines
    for (let x = 0; x < width; x += 8) {
        for (let y = 0; y < height; y++) {
            buffer[y][x] = '|';
        }
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x++) {
            buffer[y][x] = '-';
        }
    }
};

// Scene 151: Test Pattern
CLIFTScenes[151] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Geometric test patterns
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const patternX = Math.floor(x / 4);
            const patternY = Math.floor(y / 2);
            const pattern = (patternX + patternY + Math.floor(t * 2)) % 4;
            const audioMod = audio[x % audio.length] || 0;
            
            switch (pattern) {
                case 0: buffer[y][x] = audioMod > 0.3 ? '█' : '▓'; break;
                case 1: buffer[y][x] = audioMod > 0.3 ? '▓' : '▒'; break;
                case 2: buffer[y][x] = audioMod > 0.3 ? '▒' : '░'; break;
                case 3: buffer[y][x] = audioMod > 0.3 ? '░' : ' '; break;
            }
        }
    }
    
    // Calibration cross
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    for (let i = 0; i < width; i++) {
        buffer[centerY][i] = '+';
    }
    for (let i = 0; i < height; i++) {
        buffer[i][centerX] = '+';
    }
};

// Scene 152: Sine Wave
CLIFTScenes[152] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Pure sine wave visualization
    for (let x = 0; x < width; x++) {
        const frequency = 0.2 + (audio[x % audio.length] || 0) * 0.5;
        const amplitude = height * 0.3;
        const phase = t * 2 + x * 0.1;
        const y = Math.floor(height / 2 + Math.sin(phase * frequency) * amplitude);
        
        if (y >= 0 && y < height) {
            buffer[y][x] = '~';
        }
        
        // Frequency domain representation
        const fft = Math.abs(Math.sin(x * 0.1 + t)) * (audio[x % audio.length] || 0);
        const fftY = Math.floor(height - 1 - fft * (height - 1));
        if (fftY >= 0 && fftY < height) {
            buffer[fftY][x] = '|';
        }
    }
};

// Scene 153: Barcode
CLIFTScenes[153] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Animated barcode patterns
    for (let x = 0; x < width; x++) {
        const barWidth = 1 + Math.floor((audio[x % audio.length] || 0) * 4);
        const barHeight = Math.floor(height * (0.5 + (audio[x % audio.length] || 0) * 0.5));
        
        if (Math.floor(x / barWidth + t * 10) % 2 === 0) {
            for (let y = 0; y < barHeight; y++) {
                buffer[y][x] = '█';
            }
        }
    }
    
    // Data encoding at bottom
    const dataStr = 'CLIFT' + Math.floor(t * 100).toString();
    for (let i = 0; i < dataStr.length && i < width; i++) {
        buffer[height - 1][i] = dataStr[i];
    }
};

// Scene 154: Pulse
CLIFTScenes[154] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    
    // Rhythmic pulse patterns
    const pulse = Math.sin(t * 4) * 0.5 + 0.5;
    const beatPulse = beat * 0.5 + 0.5;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distance = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
            const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
            const normalizedDistance = distance / maxDistance;
            
            const pulseValue = (pulse + beatPulse) * (1 - normalizedDistance);
            const audioMod = audio[Math.floor(x / 4) % audio.length] || 0;
            
            if (pulseValue + audioMod > 0.7) {
                buffer[y][x] = '●';
            } else if (pulseValue + audioMod > 0.4) {
                buffer[y][x] = '○';
            } else if (pulseValue + audioMod > 0.2) {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 155: Glitch
CLIFTScenes[155] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Digital glitch effects
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const glitchProb = (audio[y % audio.length] || 0) * 0.3;
            const timeGlitch = Math.sin(t * 20 + x * 0.1) * 0.1 + 0.1;
            
            if (Math.random() < glitchProb + timeGlitch) {
                const glitchChars = '█▓▒░▄▀▐▌▬▪▫';
                buffer[y][x] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
        }
    }
    
    // Scan lines
    const scanLine = Math.floor(t * 10) % height;
    for (let x = 0; x < width; x++) {
        buffer[scanLine][x] = '─';
    }
};

// Scene 156: Spectrum
CLIFTScenes[156] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Frequency spectrum display
    for (let x = 0; x < width; x++) {
        const frequency = x / width;
        const magnitude = Math.sin(frequency * 10 + t * 2) * 0.5 + 0.5;
        const audioMod = audio[x % audio.length] || 0;
        const barHeight = Math.floor((magnitude + audioMod) * height);
        
        for (let y = 0; y < barHeight && y < height; y++) {
            const charY = height - 1 - y;
            const intensity = y / barHeight;
            
            // Bounds check to prevent crashes
            if (charY >= 0 && charY < height && x >= 0 && x < width) {
                if (intensity > 0.8) buffer[charY][x] = '█';
                else if (intensity > 0.6) buffer[charY][x] = '▓';
                else if (intensity > 0.4) buffer[charY][x] = '▒';
                else if (intensity > 0.2) buffer[charY][x] = '░';
                else buffer[charY][x] = '·';
            }
        }
    }
};

// Scene 157: Phase
CLIFTScenes[157] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Phase relationship visualizations
    for (let x = 0; x < width; x++) {
        const phase1 = Math.sin(x * 0.1 + t);
        const phase2 = Math.sin(x * 0.1 + t + Math.PI / 2);
        const audioPhase = (audio[x % audio.length] || 0) * Math.PI;
        
        const y1 = Math.floor(height / 2 + phase1 * height * 0.2);
        const y2 = Math.floor(height / 2 + phase2 * height * 0.2);
        const yAudio = Math.floor(height / 2 + Math.sin(audioPhase) * height * 0.3);
        
        if (y1 >= 0 && y1 < height) buffer[y1][x] = '-';
        if (y2 >= 0 && y2 < height) buffer[y2][x] = '=';
        if (yAudio >= 0 && yAudio < height) buffer[yAudio][x] = '~';
    }
};

// Scene 158: Binary
CLIFTScenes[158] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Binary data representations
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const binaryValue = Math.floor(x + y * width + t * 100) % 256;
            const bit = (binaryValue >> (x % 8)) & 1;
            const audioMod = audio[x % audio.length] || 0;
            
            if (bit && audioMod > 0.2) {
                buffer[y][x] = '1';
            } else if (!bit && audioMod > 0.2) {
                buffer[y][x] = '0';
            } else {
                buffer[y][x] = ' ';
            }
        }
    }
};

// Scene 159: Circuit
CLIFTScenes[159] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Electronic circuit patterns
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 8) {
            const audioMod = audio[x % audio.length] || 0;
            const active = audioMod > 0.3;
            
            // Circuit nodes
            buffer[y][x] = active ? '●' : '○';
            
            // Connections
            if (x + 4 < width) {
                for (let i = 1; i < 4; i++) {
                    buffer[y][x + i] = active ? '═' : '─';
                }
            }
            
            if (y + 2 < height) {
                buffer[y + 1][x] = active ? '║' : '│';
                buffer[y + 2][x] = active ? '╬' : '┼';
            }
        }
    }
};

// ============================================
// CATEGORY 16: Giger-Inspired (160-169)
// ============================================

// Scene 160: Biomech Spine
CLIFTScenes[160] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Organic spine structures
    const spineX = Math.floor(width / 2);
    const spineWave = Math.sin(t * 2) * 3;
    
    for (let y = 0; y < height; y++) {
        const vertebra = Math.floor(y / 3);
        const audioMod = audio[vertebra % audio.length] || 0;
        const x = spineX + Math.floor(spineWave * Math.sin(y * 0.5));
        
        if (x >= 0 && x < width) {
            // Vertebrae
            buffer[y][x] = audioMod > 0.4 ? '◊' : '◦';
            
            // Ribs
            const ribLength = Math.floor(4 + audioMod * 6);
            for (let i = 1; i <= ribLength; i++) {
                if (x - i >= 0) buffer[y][x - i] = '─';
                if (x + i < width) buffer[y][x + i] = '─';
            }
            
            // Organic connections
            if (y % 3 === 0 && x + 1 < width) {
                buffer[y][x + 1] = audioMod > 0.5 ? '╦' : '┬';
            }
        }
    }
};

// Scene 161: Alien Eggs
CLIFTScenes[161] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Egg-like organic forms
    for (let eggY = 2; eggY < height - 2; eggY += 6) {
        for (let eggX = 4; eggX < width - 4; eggX += 10) {
            const audioMod = audio[eggX % audio.length] || 0;
            const pulsating = Math.sin(t * 3 + eggX * 0.1) * 0.5 + 0.5;
            const active = audioMod > 0.3;
            
            // Egg shell
            const eggSize = Math.floor(2 + pulsating * 2);
            for (let dy = -eggSize; dy <= eggSize; dy++) {
                for (let dx = -eggSize; dx <= eggSize; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= eggSize && eggY + dy >= 0 && eggY + dy < height && eggX + dx >= 0 && eggX + dx < width) {
                        if (distance > eggSize - 1) {
                            buffer[eggY + dy][eggX + dx] = active ? '▓' : '▒';
                        } else if (active && distance < 1) {
                            buffer[eggY + dy][eggX + dx] = '●'; // Embryo
                        }
                    }
                }
            }
        }
    }
};

// Scene 162: Mech Tentacles
CLIFTScenes[162] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Mechanical tentacle structures
    for (let tentacle = 0; tentacle < 4; tentacle++) {
        const startX = Math.floor(width * tentacle / 4);
        const audioMod = audio[tentacle * 16 % audio.length] || 0;
        
        for (let segment = 0; segment < 20; segment++) {
            const segmentT = t + tentacle * 0.5 + segment * 0.1;
            const x = startX + Math.floor(Math.sin(segmentT) * 10);
            const y = Math.floor(segment * height / 20);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const jointChar = audioMod > 0.5 ? '◈' : '◇';
                const segmentChar = audioMod > 0.3 ? '║' : '│';
                
                buffer[y][x] = segment % 3 === 0 ? jointChar : segmentChar;
                
                // Mechanical details
                if (segment % 3 === 0 && x + 1 < width) {
                    buffer[y][x + 1] = audioMod > 0.4 ? '╫' : '┼';
                }
            }
        }
    }
};

// Scene 163: Xenomorph Hive
CLIFTScenes[163] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Alien hive environments
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const hiveCell = Math.floor(x / 6) + Math.floor(y / 4);
            const audioMod = audio[hiveCell % audio.length] || 0;
            const organic = Math.sin(x * 0.2 + y * 0.1 + t) * 0.5 + 0.5;
            
            if (organic > 0.7 && audioMod > 0.3) {
                buffer[y][x] = '▓';
            } else if (organic > 0.5 && audioMod > 0.2) {
                buffer[y][x] = '▒';
            } else if (organic > 0.3 && audioMod > 0.1) {
                buffer[y][x] = '░';
            }
            
            // Hive structure
            if (x % 6 === 0 || y % 4 === 0) {
                buffer[y][x] = audioMod > 0.4 ? '█' : '▓';
            }
        }
    }
};

// Scene 164: Biomech Skull
CLIFTScenes[164] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Skull outline
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const audioMod = audio[Math.floor(distance) % audio.length] || 0;
            
            // Skull shape
            if (distance > 8 && distance < 10) {
                buffer[y][x] = audioMod > 0.4 ? '█' : '▓';
            }
            
            // Eye sockets
            if (distance < 3 && (Math.abs(dx) > 2 || Math.abs(dy) > 1)) {
                buffer[y][x] = audioMod > 0.5 ? '●' : '○';
            }
            
            // Mechanical components
            if (distance < 8 && Math.random() < 0.05 + audioMod * 0.1) {
                buffer[y][x] = '╬';
            }
        }
    }
};

// Scene 165: Face Hugger
CLIFTScenes[165] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Face hugger body
    for (let y = centerY - 2; y <= centerY + 2; y++) {
        for (let x = centerX - 4; x <= centerX + 4; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[x % audio.length] || 0;
                buffer[y][x] = audioMod > 0.4 ? '▓' : '▒';
            }
        }
    }
    
    // Legs/tentacles
    for (let leg = 0; leg < 8; leg++) {
        const angle = (leg / 8) * Math.PI * 2;
        const legLength = 8 + Math.sin(t * 2 + leg) * 3;
        
        for (let segment = 1; segment <= legLength; segment++) {
            const x = centerX + Math.floor(Math.cos(angle) * segment);
            const y = centerY + Math.floor(Math.sin(angle) * segment);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[leg * 8 % audio.length] || 0;
                buffer[y][x] = audioMod > 0.3 ? '═' : '─';
            }
        }
    }
};

// Scene 166: Biomech Heart
CLIFTScenes[166] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Pulsating heart
    const heartbeat = Math.sin(t * 4) * 0.5 + 0.5;
    const beatPulse = beat * 0.3 + 0.7;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const audioMod = audio[Math.floor(distance) % audio.length] || 0;
            
            const heartShape = distance < 6 * (heartbeat * beatPulse);
            
            if (heartShape) {
                if (audioMod > 0.6) {
                    buffer[y][x] = '♥';
                } else if (audioMod > 0.4) {
                    buffer[y][x] = '▓';
                } else if (audioMod > 0.2) {
                    buffer[y][x] = '▒';
                } else {
                    buffer[y][x] = '░';
                }
            }
            
            // Mechanical valves
            if (distance > 6 && distance < 8 && Math.floor(t * 2) % 2 === 0) {
                buffer[y][x] = audioMod > 0.4 ? '╬' : '┼';
            }
        }
    }
};

// Scene 167: Alien Architecture
CLIFTScenes[167] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Biomechanical architectural forms
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const structure = Math.floor(x / 8) + Math.floor(y / 6);
            const audioMod = audio[structure % audio.length] || 0;
            const organic = Math.sin(x * 0.1 + y * 0.1 + t * 0.5) * 0.5 + 0.5;
            
            // Structural elements
            if (x % 8 === 0 && audioMod > 0.3) {
                buffer[y][x] = '║';
            } else if (y % 6 === 0 && audioMod > 0.3) {
                buffer[y][x] = '═';
            } else if (organic > 0.8 && audioMod > 0.4) {
                buffer[y][x] = '▓';
            } else if (organic > 0.6 && audioMod > 0.2) {
                buffer[y][x] = '▒';
            }
            
            // Joints and connections
            if (x % 8 === 0 && y % 6 === 0) {
                buffer[y][x] = audioMod > 0.5 ? '╬' : '┼';
            }
        }
    }
};

// Scene 168: Chestburster
CLIFTScenes[168] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Emergence sequence
    const emergence = Math.sin(t * 0.5) * 0.5 + 0.5;
    
    // Host body
    for (let y = centerY - 3; y <= centerY + 3; y++) {
        for (let x = centerX - 8; x <= centerX + 8; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[x % audio.length] || 0;
                buffer[y][x] = audioMod > 0.3 ? '▓' : '▒';
            }
        }
    }
    
    // Bursting creature
    const burstLength = Math.floor(emergence * 10);
    for (let i = 0; i < burstLength; i++) {
        const x = centerX + i;
        const y = centerY + Math.floor(Math.sin(i * 0.5) * 2);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const audioMod = audio[i % audio.length] || 0;
            buffer[y][x] = audioMod > 0.5 ? '▬' : '─';
        }
    }
    
    // Blood splatter
    for (let splat = 0; splat < 10; splat++) {
        const splatX = centerX + Math.floor(Math.sin(t + splat) * 15);
        const splatY = centerY + Math.floor(Math.cos(t + splat) * 8);
        
        if (splatX >= 0 && splatX < width && splatY >= 0 && splatY < height) {
            const audioMod = audio[splat % audio.length] || 0;
            if (audioMod > 0.4) {
                buffer[splatY][splatX] = '●';
            }
        }
    }
};

// Scene 169: Space Jockey
CLIFTScenes[169] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Large-scale alien pilot forms
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const audioMod = audio[Math.floor(distance) % audio.length] || 0;
            
            // Massive skeletal structure
            if (distance > 10 && distance < 12) {
                buffer[y][x] = audioMod > 0.4 ? '█' : '▓';
            }
            
            // Pilot chair integration
            if (distance < 8 && Math.abs(dy) < 2) {
                buffer[y][x] = audioMod > 0.5 ? '╬' : '┼';
            }
            
            // Atmospheric details
            if (Math.random() < 0.02 + audioMod * 0.05) {
                buffer[y][x] = '·';
            }
        }
    }
};

// ============================================
// CATEGORY 17: Revolt (170-179)
// ============================================

// Scene 170: Rising Fists
CLIFTScenes[170] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Rising fists symbolizing resistance
    for (let fist = 0; fist < 6; fist++) {
        const fistX = Math.floor(width * fist / 6) + 5;
        const audioMod = audio[fist * 10 % audio.length] || 0;
        const rise = Math.sin(t * 2 + fist * 0.5) * 0.3 + 0.7;
        const fistY = Math.floor(height * rise);
        
        if (fistX >= 0 && fistX < width && fistY >= 0 && fistY < height) {
            // Fist shape
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (fistY + dy >= 0 && fistY + dy < height && fistX + dx >= 0 && fistX + dx < width) {
                        buffer[fistY + dy][fistX + dx] = audioMod > 0.4 ? '█' : '▓';
                    }
                }
            }
            
            // Arm
            for (let armY = fistY + 3; armY < height && armY < fistY + 8; armY++) {
                if (fistX >= 0 && fistX < width) {
                    buffer[armY][fistX] = audioMod > 0.3 ? '║' : '│';
                }
            }
        }
    }
};

// Scene 171: Breaking Chains
CLIFTScenes[171] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Chain-breaking animations
    for (let chain = 0; chain < 4; chain++) {
        const chainY = Math.floor(height * chain / 4) + 3;
        const audioMod = audio[chain * 16 % audio.length] || 0;
        const breaking = Math.sin(t * 3 + chain) * 0.5 + 0.5;
        
        for (let x = 0; x < width; x++) {
            const segment = Math.floor(x / 6);
            const broken = breaking > 0.7 && segment % 2 === 0;
            
            if (chainY >= 0 && chainY < height) {
                if (broken && audioMod > 0.4) {
                    buffer[chainY][x] = '∞'; // Broken link
                } else if (audioMod > 0.2) {
                    buffer[chainY][x] = '○'; // Chain link
                } else {
                    buffer[chainY][x] = '─'; // Chain segment
                }
            }
        }
    }
};

// Scene 172: Crowd March
CLIFTScenes[172] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Marching crowd formations
    for (let row = 0; row < 4; row++) {
        const rowY = Math.floor(height * (row + 1) / 5);
        const marchOffset = Math.floor(t * 10 + row * 5) % width;
        
        for (let person = 0; person < 8; person++) {
            const personX = (marchOffset + person * 8) % width;
            const audioMod = audio[person * 8 % audio.length] || 0;
            
            if (personX >= 0 && personX < width && rowY >= 0 && rowY < height) {
                // Person representation
                buffer[rowY][personX] = audioMod > 0.4 ? '♦' : '♢';
                
                // Movement trail
                const trailX = (personX - 2 + width) % width;
                if (trailX >= 0 && trailX < width) {
                    buffer[rowY][trailX] = audioMod > 0.2 ? '·' : ' ';
                }
            }
        }
    }
};

// Scene 173: Barricade Building
CLIFTScenes[173] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Construction of protest barriers
    const barricadeHeight = Math.floor(height * 0.6);
    const construction = Math.sin(t * 0.5) * 0.5 + 0.5;
    
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const buildHeight = Math.floor(construction * barricadeHeight * (1 + audioMod * 0.5));
        
        for (let y = height - buildHeight; y < height; y++) {
            if (y >= 0 && y < height) {
                // Barricade materials
                const material = Math.floor(Math.random() * 3 + audioMod * 2);
                switch (material) {
                    case 0: buffer[y][x] = '█'; break;
                    case 1: buffer[y][x] = '▓'; break;
                    case 2: buffer[y][x] = '▒'; break;
                    case 3: buffer[y][x] = '░'; break;
                    case 4: buffer[y][x] = '■'; break;
                }
            }
        }
    }
};

// Scene 174: Molotov Cocktails
CLIFTScenes[174] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Protest weapon visualizations
    for (let molotov = 0; molotov < 5; molotov++) {
        const audioMod = audio[molotov * 12 % audio.length] || 0;
        
        if (audioMod > 0.3) {
            const trajectory = t * 5 + molotov * 2;
            const x = Math.floor(width * 0.2 + (trajectory % 1) * width * 0.6);
            const y = Math.floor(height * 0.2 + Math.sin(trajectory * 3) * height * 0.6);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = audioMod > 0.6 ? '💥' : '○';
                
                // Flame trail
                for (let trail = 1; trail <= 3; trail++) {
                    const trailX = x - trail;
                    if (trailX >= 0 && trailX < width) {
                        buffer[y][trailX] = '·';
                    }
                }
            }
        }
    }
};

// Scene 175: Tear Gas
CLIFTScenes[175] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Gas cloud effects
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const gasCloud = Math.sin(x * 0.1 + y * 0.15 + t * 2) * 0.5 + 0.5;
            const audioMod = audio[x % audio.length] || 0;
            const gasIntensity = gasCloud * (audioMod + 0.3);
            
            if (gasIntensity > 0.7) {
                buffer[y][x] = '▓';
            } else if (gasIntensity > 0.5) {
                buffer[y][x] = '▒';
            } else if (gasIntensity > 0.3) {
                buffer[y][x] = '░';
            } else if (gasIntensity > 0.1) {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 176: Graffiti Wall
CLIFTScenes[176] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Dynamic graffiti animations
    const messages = ['RESIST', 'REVOLT', 'UNITY', 'FREEDOM'];
    
    for (let msg = 0; msg < messages.length; msg++) {
        const message = messages[msg];
        const msgY = Math.floor(height * msg / 4) + 2;
        const audioMod = audio[msg * 16 % audio.length] || 0;
        const spray = Math.sin(t * 2 + msg) * 0.5 + 0.5;
        
        if (audioMod > 0.3) {
            for (let i = 0; i < message.length; i++) {
                const x = Math.floor(width * 0.2 + i * 2);
                if (x >= 0 && x < width && msgY >= 0 && msgY < height) {
                    buffer[msgY][x] = message[i];
                    
                    // Spray effect around letters
                    if (spray > 0.5) {
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (msgY + dy >= 0 && msgY + dy < height && x + dx >= 0 && x + dx < width) {
                                    if (Math.random() < 0.3) {
                                        buffer[msgY + dy][x + dx] = '·';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Scene 177: Police Line Breaking
CLIFTScenes[177] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Barrier breakthrough scenes
    const lineY = Math.floor(height / 2);
    const breakthrough = Math.sin(t * 1.5) * 0.5 + 0.5;
    
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const section = Math.floor(x / 8);
        const broken = breakthrough > 0.7 && section % 2 === 0 && audioMod > 0.4;
        
        if (lineY >= 0 && lineY < height) {
            if (broken) {
                buffer[lineY][x] = ' '; // Broken line
                buffer[lineY - 1][x] = '▓'; // Debris
                buffer[lineY + 1][x] = '▒'; // Debris
            } else {
                buffer[lineY][x] = audioMod > 0.3 ? '█' : '▓'; // Intact line
            }
        }
    }
    
    // Crowd pressure indicators
    for (let pressure = 0; pressure < 10; pressure++) {
        const pX = Math.floor(width * pressure / 10);
        const pY = lineY + Math.floor(Math.sin(t * 3 + pressure) * 3);
        
        if (pX >= 0 && pX < width && pY >= 0 && pY < height) {
            const audioMod = audio[pressure * 6 % audio.length] || 0;
            if (audioMod > 0.5) {
                buffer[pY][pX] = '!';
            }
        }
    }
};

// Scene 178: Flag Burning
CLIFTScenes[178] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Flag destruction imagery
    const burning = Math.sin(t * 3) * 0.5 + 0.5;
    
    // Flag base
    for (let y = centerY - 4; y <= centerY + 4; y++) {
        for (let x = centerX - 8; x <= centerX + 8; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const audioMod = audio[x % audio.length] || 0;
                const burnLevel = burning * (1 + audioMod);
                
                if (burnLevel > 0.8) {
                    buffer[y][x] = '▓'; // Burning
                } else if (burnLevel > 0.5) {
                    buffer[y][x] = '▒'; // Smoldering
                } else if (burnLevel > 0.2) {
                    buffer[y][x] = '█'; // Intact
                }
            }
        }
    }
    
    // Flames
    for (let flame = 0; flame < 15; flame++) {
        const flameX = centerX + Math.floor(Math.sin(t * 4 + flame) * 12);
        const flameY = centerY - 6 + Math.floor(Math.cos(t * 3 + flame) * 4);
        
        if (flameX >= 0 && flameX < width && flameY >= 0 && flameY < height) {
            const audioMod = audio[flame % audio.length] || 0;
            if (audioMod > 0.3) {
                buffer[flameY][flameX] = '▲';
            }
        }
    }
};

// Scene 179: Victory Dance
CLIFTScenes[179] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Celebration sequences
    for (let dancer = 0; dancer < 8; dancer++) {
        const danceX = Math.floor(width * dancer / 8) + 2;
        const danceY = Math.floor(height * 0.7 + Math.sin(t * 4 + dancer) * 4);
        const audioMod = audio[dancer * 8 % audio.length] || 0;
        
        if (danceX >= 0 && danceX < width && danceY >= 0 && danceY < height) {
            // Dancing figure
            buffer[danceY][danceX] = audioMod > 0.4 ? '♪' : '♫';
            
            // Arms raised
            if (danceX - 1 >= 0) buffer[danceY][danceX - 1] = '\\';
            if (danceX + 1 < width) buffer[danceY][danceX + 1] = '/';
            
            // Celebration effects
            if (audioMod > 0.6) {
                for (let effect = 0; effect < 5; effect++) {
                    const eX = danceX + Math.floor(Math.sin(t * 6 + effect) * 3);
                    const eY = danceY + Math.floor(Math.cos(t * 6 + effect) * 2);
                    
                    if (eX >= 0 && eX < width && eY >= 0 && eY < height) {
                        buffer[eY][eX] = '★';
                    }
                }
            }
        }
    }
};

// ============================================
// CATEGORY 18: Audio Reactive (180-189)
// ============================================

// Scene 180: Audio 3D Cubes
CLIFTScenes[180] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Cubes that react to audio frequencies
    for (let cube = 0; cube < 6; cube++) {
        const cubeX = Math.floor(width * cube / 6) + 4;
        const cubeY = Math.floor(height / 2);
        const audioMod = audio[cube * 10 % audio.length] || 0;
        const cubeSize = Math.floor(2 + audioMod * 4);
        
        // Draw cube wireframe
        for (let face = 0; face < 2; face++) {
            const offset = face * 2;
            
            // Top and bottom lines
            for (let i = 0; i < cubeSize; i++) {
                if (cubeX + i + offset >= 0 && cubeX + i + offset < width) {
                    if (cubeY - cubeSize + offset >= 0 && cubeY - cubeSize + offset < height) {
                        buffer[cubeY - cubeSize + offset][cubeX + i + offset] = '─';
                    }
                    if (cubeY + cubeSize + offset >= 0 && cubeY + cubeSize + offset < height) {
                        buffer[cubeY + cubeSize + offset][cubeX + i + offset] = '─';
                    }
                }
            }
            
            // Side lines
            for (let i = 0; i < cubeSize * 2; i++) {
                if (cubeY - cubeSize + i + offset >= 0 && cubeY - cubeSize + i + offset < height) {
                    if (cubeX + offset >= 0 && cubeX + offset < width) {
                        buffer[cubeY - cubeSize + i + offset][cubeX + offset] = '│';
                    }
                    if (cubeX + cubeSize + offset >= 0 && cubeX + cubeSize + offset < width) {
                        buffer[cubeY - cubeSize + i + offset][cubeX + cubeSize + offset] = '│';
                    }
                }
            }
        }
        
        // Connection lines
        for (let i = 0; i < cubeSize; i++) {
            if (cubeX + i >= 0 && cubeX + i < width) {
                if (cubeY - cubeSize >= 0 && cubeY - cubeSize < height) {
                    buffer[cubeY - cubeSize][cubeX + i] = audioMod > 0.5 ? '╱' : '╲';
                }
                if (cubeY + cubeSize >= 0 && cubeY + cubeSize < height) {
                    buffer[cubeY + cubeSize][cubeX + i] = audioMod > 0.5 ? '╱' : '╲';
                }
            }
        }
    }
};

// Scene 181: Audio Strobes
CLIFTScenes[181] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    
    // Strobe effects synchronized to beats
    const strobeIntensity = beat * 0.5 + 0.5;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const audioMod = audio[x % audio.length] || 0;
            const strobe = Math.sin(t * 20 + x * 0.1 + y * 0.1) * 0.5 + 0.5;
            const combined = (strobe + audioMod + strobeIntensity) / 3;
            
            if (combined > 0.8) {
                buffer[y][x] = '█';
            } else if (combined > 0.6) {
                buffer[y][x] = '▓';
            } else if (combined > 0.4) {
                buffer[y][x] = '▒';
            } else if (combined > 0.2) {
                buffer[y][x] = '░';
            }
        }
    }
};

// Scene 182: Audio Explosions
CLIFTScenes[182] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Explosive effects triggered by audio
    for (let explosion = 0; explosion < 4; explosion++) {
        const audioMod = audio[explosion * 16 % audio.length] || 0;
        
        if (audioMod > 0.6) {
            const expX = Math.floor(width * (explosion + 1) / 5);
            const expY = Math.floor(height * 0.5);
            const radius = Math.floor(audioMod * 8);
            
            for (let angle = 0; angle < 16; angle++) {
                const radians = (angle / 16) * Math.PI * 2;
                const x = expX + Math.floor(Math.cos(radians) * radius);
                const y = expY + Math.floor(Math.sin(radians) * radius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '*';
                }
            }
            
            // Center blast
            if (expX >= 0 && expX < width && expY >= 0 && expY < height) {
                buffer[expY][expX] = audioMod > 0.8 ? '◉' : '○';
            }
        }
    }
};

// Scene 183: Audio Wave Tunnel
CLIFTScenes[183] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Tunnels that pulse with music
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            const audioIndex = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * audio.length);
            const audioMod = audio[audioIndex] || 0;
            
            const tunnelWave = Math.sin(distance * 0.5 - t * 5 + audioMod * 10) * 0.5 + 0.5;
            
            if (tunnelWave > 0.7) {
                buffer[y][x] = '█';
            } else if (tunnelWave > 0.5) {
                buffer[y][x] = '▓';
            } else if (tunnelWave > 0.3) {
                buffer[y][x] = '▒';
            } else if (tunnelWave > 0.1) {
                buffer[y][x] = '░';
            }
        }
    }
};

// Scene 184: Audio Spectrum 3D
CLIFTScenes[184] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // 3D frequency spectrum visualizations
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const depth = Math.sin(x * 0.1 + t) * 0.3 + 0.7;
        const barHeight = Math.floor(audioMod * height * depth);
        
        for (let y = 0; y < barHeight; y++) {
            const charY = height - 1 - y;
            const intensity = (y / barHeight) * depth;
            
            if (charY >= 0 && charY < height) {
                if (intensity > 0.8) {
                    buffer[charY][x] = '█';
                } else if (intensity > 0.6) {
                    buffer[charY][x] = '▓';
                } else if (intensity > 0.4) {
                    buffer[charY][x] = '▒';
                } else if (intensity > 0.2) {
                    buffer[charY][x] = '░';
                } else {
                    buffer[charY][x] = '·';
                }
            }
        }
        
        // 3D perspective lines
        if (x % 4 === 0) {
            const perspectiveY = Math.floor(height * 0.8 + Math.sin(x * 0.2 + t) * 2);
            if (perspectiveY >= 0 && perspectiveY < height) {
                buffer[perspectiveY][x] = '/';
            }
        }
    }
};

// Scene 185: Audio Particles
CLIFTScenes[185] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Particle systems driven by audio
    for (let particle = 0; particle < 50; particle++) {
        const audioMod = audio[particle % audio.length] || 0;
        
        if (audioMod > 0.2) {
            const particleAge = (t * 2 + particle * 0.1) % 10;
            const startX = Math.floor(width / 2);
            const startY = Math.floor(height / 2);
            
            const velocity = audioMod * 15;
            const angle = (particle / 50) * Math.PI * 2;
            
            const x = startX + Math.floor(Math.cos(angle) * velocity * particleAge);
            const y = startY + Math.floor(Math.sin(angle) * velocity * particleAge);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const life = 1 - (particleAge / 10);
                if (life > 0.7) {
                    buffer[y][x] = '●';
                } else if (life > 0.4) {
                    buffer[y][x] = '○';
                } else if (life > 0.1) {
                    buffer[y][x] = '·';
                }
            }
        }
    }
};

// Scene 186: Audio Pulse Rings
CLIFTScenes[186] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    
    // Concentric rings pulsing to beats
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const maxRadius = Math.min(width, height) / 2;
    
    for (let ring = 0; ring < 8; ring++) {
        const audioMod = audio[ring * 8 % audio.length] || 0;
        const ringTime = t * 2 + ring * 0.5;
        const radius = (ringTime % 5) * maxRadius / 5;
        const intensity = audioMod * beat * (1 - (ringTime % 5) / 5);
        
        if (intensity > 0.2) {
            // Draw ring
            for (let angle = 0; angle < 32; angle++) {
                const radians = (angle / 32) * Math.PI * 2;
                const x = centerX + Math.floor(Math.cos(radians) * radius);
                const y = centerY + Math.floor(Math.sin(radians) * radius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (intensity > 0.6) {
                        buffer[y][x] = '○';
                    } else if (intensity > 0.4) {
                        buffer[y][x] = '◦';
                    } else {
                        buffer[y][x] = '·';
                    }
                }
            }
        }
    }
};

// Scene 187: Audio Waveform 3D
CLIFTScenes[187] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // 3D waveform representations
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const waveform = Math.sin(x * 0.2 + t * 3) * audioMod;
        const y = Math.floor(height / 2 + waveform * height * 0.3);
        
        if (y >= 0 && y < height) {
            buffer[y][x] = '~';
        }
        
        // 3D depth layers
        for (let depth = 1; depth <= 3; depth++) {
            const depthY = y + depth;
            const depthAudio = audioMod * (1 - depth * 0.2);
            
            if (depthY >= 0 && depthY < height && depthAudio > 0.3) {
                buffer[depthY][x] = depth === 1 ? '▒' : (depth === 2 ? '░' : '·');
            }
        }
    }
};

// Scene 188: Audio Matrix Grid
CLIFTScenes[188] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Grid patterns responding to audio
    for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 6) {
            const gridCell = Math.floor(x / 6) + Math.floor(y / 3);
            const audioMod = audio[gridCell % audio.length] || 0;
            
            if (audioMod > 0.3) {
                // Grid cell activation
                for (let dy = 0; dy < 3 && y + dy < height; dy++) {
                    for (let dx = 0; dx < 6 && x + dx < width; dx++) {
                        const cellIntensity = audioMod * (1 - (dx + dy) * 0.1);
                        
                        if (cellIntensity > 0.7) {
                            buffer[y + dy][x + dx] = '█';
                        } else if (cellIntensity > 0.5) {
                            buffer[y + dy][x + dx] = '▓';
                        } else if (cellIntensity > 0.3) {
                            buffer[y + dy][x + dx] = '▒';
                        }
                    }
                }
            }
            
            // Grid lines
            if (audioMod > 0.2) {
                for (let i = 0; i < 6 && x + i < width; i++) {
                    buffer[y][x + i] = '─';
                }
                for (let i = 0; i < 3 && y + i < height; i++) {
                    buffer[y + i][x] = '│';
                }
            }
        }
    }
};

// Scene 189: Audio Fractals
CLIFTScenes[189] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Fractal patterns driven by music
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = (x - centerX) * 0.1;
            const dy = (y - centerY) * 0.1;
            
            let zx = 0;
            let zy = 0;
            let iteration = 0;
            const maxIterations = 20;
            
            // Audio-modulated fractal parameters
            const audioIndex = Math.floor(((x + y) * 0.5) % audio.length);
            const audioMod = audio[audioIndex] || 0;
            const fractalTime = t * 0.5 + audioMod * 2;
            
            while (iteration < maxIterations && zx * zx + zy * zy < 4) {
                const tempX = zx * zx - zy * zy + dx + Math.sin(fractalTime) * 0.1;
                zy = 2 * zx * zy + dy + Math.cos(fractalTime) * 0.1;
                zx = tempX;
                iteration++;
            }
            
            const fractalValue = iteration / maxIterations;
            const audioFractal = fractalValue * (1 + audioMod);
            
            if (audioFractal > 0.8) {
                buffer[y][x] = '█';
            } else if (audioFractal > 0.6) {
                buffer[y][x] = '▓';
            } else if (audioFractal > 0.4) {
                buffer[y][x] = '▒';
            } else if (audioFractal > 0.2) {
                buffer[y][x] = '░';
            }
        }
    }
};

// ============================================
// CATEGORY 19: NEW CREATIVE SCENES (190-199)
// ============================================

// Scene 190: Audio Reactive DNA Helix
CLIFTScenes[190] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerY = Math.floor(height / 2);
    
    for (let x = 0; x < width; x++) {
        const phase = x * 0.2 + t * 2;
        const audioIndex = Math.floor(x * audio.length / width);
        const audioMod = audio[audioIndex] || 0;
        
        // First helix strand
        const y1 = centerY + Math.sin(phase) * (height * 0.3) * (1 + audioMod);
        const y1Int = Math.floor(y1);
        
        // Second helix strand (opposite phase)
        const y2 = centerY + Math.sin(phase + Math.PI) * (height * 0.3) * (1 + audioMod);
        const y2Int = Math.floor(y2);
        
        // Draw helix strands
        if (y1Int >= 0 && y1Int < height) {
            buffer[y1Int][x] = audioMod > 0.7 ? '@' : (audioMod > 0.4 ? 'O' : 'o');
        }
        if (y2Int >= 0 && y2Int < height) {
            buffer[y2Int][x] = audioMod > 0.7 ? '@' : (audioMod > 0.4 ? 'O' : 'o');
        }
        
        // Connect strands periodically
        if (x % 4 === 0) {
            const minY = Math.min(y1Int, y2Int);
            const maxY = Math.max(y1Int, y2Int);
            for (let y = minY + 1; y < maxY && y >= 0 && y < height; y++) {
                buffer[y][x] = audioMod > 0.5 ? '|' : ':';
            }
        }
    }
};

// Scene 191: Cyberpunk Rain Matrix
CLIFTScenes[191] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Initialize rain columns
    if (!params._rainColumns) {
        params._rainColumns = [];
        for (let x = 0; x < width; x++) {
            params._rainColumns.push({
                y: Math.random() * height,
                speed: 0.5 + Math.random() * 1.5,
                length: 5 + Math.floor(Math.random() * 15),
                chars: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン'
            });
        }
    }
    
    // Update and draw rain
    params._rainColumns.forEach((col, x) => {
        const audioIndex = Math.floor(x * audio.length / width);
        const audioMod = audio[audioIndex] || 0;
        
        // Move column down with audio influence
        col.y += col.speed * (1 + audioMod * 2);
        
        // Reset if off screen
        if (col.y - col.length > height) {
            col.y = -col.length;
            col.speed = 0.5 + Math.random() * 1.5;
            col.length = 5 + Math.floor(Math.random() * 15);
        }
        
        // Draw the rain trail
        for (let i = 0; i < col.length; i++) {
            const y = Math.floor(col.y - i);
            if (y >= 0 && y < height) {
                const intensity = 1 - (i / col.length);
                const charIndex = Math.floor(Math.random() * col.chars.length);
                
                if (i === 0) {
                    buffer[y][x] = audioMod > 0.5 ? '#' : col.chars[charIndex];
                } else if (intensity > 0.7) {
                    buffer[y][x] = col.chars[charIndex];
                } else if (intensity > 0.3) {
                    buffer[y][x] = audioMod > 0.3 ? '+' : '.';
                } else {
                    buffer[y][x] = '.';
                }
            }
        }
    });
};

// Scene 192: Audio Particle Storm
CLIFTScenes[192] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Initialize particle system
    if (!params._storm) {
        params._storm = [];
        for (let i = 0; i < 200; i++) {
            params._storm.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                char: '*',
                life: Math.random()
            });
        }
    }
    
    // Update particles
    params._storm.forEach((p, i) => {
        const audioIndex = Math.floor(i % audio.length);
        const audioMod = audio[audioIndex] || 0;
        
        // Audio-driven forces
        const forceX = Math.sin(t + i * 0.1) * audioMod * 2;
        const forceY = Math.cos(t + i * 0.1) * audioMod * 2;
        
        // Update velocity with audio influence
        p.vx = p.vx * 0.95 + forceX;
        p.vy = p.vy * 0.95 + forceY;
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around edges
        if (p.x < 0) p.x = width - 1;
        if (p.x >= width) p.x = 0;
        if (p.y < 0) p.y = height - 1;
        if (p.y >= height) p.y = 0;
        
        // Update life and character
        p.life -= 0.01;
        if (p.life <= 0) {
            p.life = 1;
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.vx = 0;
            p.vy = 0;
        }
        
        // Choose character based on audio and life
        if (audioMod > 0.7) {
            p.char = '@';
        } else if (audioMod > 0.5) {
            p.char = '*';
        } else if (audioMod > 0.3) {
            p.char = '+';
        } else {
            p.char = '.';
        }
        
        // Draw particle with trail
        const px = Math.floor(p.x);
        const py = Math.floor(p.y);
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = p.char;
            
            // Motion trail
            const trailX = Math.floor(p.x - p.vx);
            const trailY = Math.floor(p.y - p.vy);
            if (trailX >= 0 && trailX < width && trailY >= 0 && trailY < height) {
                if (buffer[trailY][trailX] === ' ') {
                    buffer[trailY][trailX] = p.life > 0.5 ? '·' : '.';
                }
            }
        }
    });
};

// Scene 193: Geometric Mandala Generator
CLIFTScenes[193] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const maxRadius = Math.min(width, height) / 2 - 1;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Multiple rotating layers
            let value = 0;
            for (let layer = 0; layer < 6; layer++) {
                const layerAngle = angle + t * (layer + 1) * 0.5;
                const audioIndex = Math.floor((layer * 10 + distance) % audio.length);
                const audioMod = audio[audioIndex] || 0;
                
                // Geometric patterns
                const pattern1 = Math.sin(layerAngle * 6) * Math.cos(distance * 0.3 - t);
                const pattern2 = Math.sin(layerAngle * 8 + t) * Math.sin(distance * 0.2);
                const pattern3 = Math.cos(layerAngle * 4) * Math.sin(layerAngle * 12);
                
                value += (pattern1 + pattern2 + pattern3) * audioMod * 0.3;
            }
            
            // Distance-based fade
            const fade = 1 - (distance / maxRadius);
            value *= fade;
            
            // Convert to characters
            if (value > 0.8) {
                buffer[y][x] = '█';
            } else if (value > 0.6) {
                buffer[y][x] = '▓';
            } else if (value > 0.4) {
                buffer[y][x] = '▒';
            } else if (value > 0.2) {
                buffer[y][x] = '░';
            } else if (value > 0.1) {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 194: Audio Reactive Fire
CLIFTScenes[194] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Initialize fire buffer
    if (!params._fireBuffer) {
        params._fireBuffer = [];
        for (let y = 0; y < height; y++) {
            params._fireBuffer[y] = new Float32Array(width);
        }
    }
    
    // Add heat at bottom based on audio
    for (let x = 0; x < width; x++) {
        const audioIndex = Math.floor(x * audio.length / width);
        const audioMod = audio[audioIndex] || 0;
        
        // Bottom row heat sources
        if (Math.random() < 0.8 + audioMod * 0.2) {
            params._fireBuffer[height - 1][x] = audioMod;
        }
        
        // Additional heat sources based on strong audio
        if (audioMod > 0.7 && Math.random() < 0.3) {
            const heatY = height - 1 - Math.floor(Math.random() * 5);
            if (heatY >= 0) {
                params._fireBuffer[heatY][x] = audioMod;
            }
        }
    }
    
    // Propagate fire upwards
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width; x++) {
            // Average heat from below and nearby
            let heat = 0;
            let count = 0;
            
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                if (nx >= 0 && nx < width) {
                    heat += params._fireBuffer[y + 1][nx];
                    count++;
                }
            }
            
            // Cool down and rise
            params._fireBuffer[y][x] = (heat / count) * 0.95;
        }
    }
    
    // Render fire
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const heat = params._fireBuffer[y][x];
            
            if (heat > 0.9) {
                buffer[y][x] = '#';
            } else if (heat > 0.7) {
                buffer[y][x] = '@';
            } else if (heat > 0.5) {
                buffer[y][x] = '%';
            } else if (heat > 0.3) {
                buffer[y][x] = '*';
            } else if (heat > 0.15) {
                buffer[y][x] = '+';
            } else if (heat > 0.05) {
                buffer[y][x] = '.';
            }
        }
    }
};

// Scene 195: 3D Rotating Cube Wireframe
CLIFTScenes[195] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Cube vertices
    const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    
    // Cube edges
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    
    // Audio-influenced rotation
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    const rotX = t + avgAudio * 2;
    const rotY = t * 0.7 + avgAudio;
    const rotZ = t * 0.3;
    
    // Rotation matrices
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);
    
    // Transform vertices
    const transformed = vertices.map(([x, y, z]) => {
        // Rotate X
        let newY = y * cosX - z * sinX;
        let newZ = y * sinX + z * cosX;
        y = newY;
        z = newZ;
        
        // Rotate Y
        let newX = x * cosY + z * sinY;
        newZ = -x * sinY + z * cosY;
        x = newX;
        z = newZ;
        
        // Rotate Z
        newX = x * cosZ - y * sinZ;
        newY = x * sinZ + y * cosZ;
        x = newX;
        y = newY;
        
        // Scale based on audio
        const scale = 10 * (1 + avgAudio * 2);
        
        // Project to 2D
        const perspective = 5 / (5 + z);
        return [
            centerX + x * scale * perspective,
            centerY + y * scale * perspective,
            z
        ];
    });
    
    // Draw edges
    edges.forEach(([start, end]) => {
        const [x1, y1, z1] = transformed[start];
        const [x2, y2, z2] = transformed[end];
        
        // Simple line drawing
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(x1 + (x2 - x1) * t);
            const y = Math.floor(y1 + (y2 - y1) * t);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Depth-based character
                const depth = z1 + (z2 - z1) * t;
                buffer[y][x] = depth > 0 ? '#' : (depth > -0.5 ? '+' : '·');
            }
        }
    });
    
    // Draw vertices
    transformed.forEach(([x, y, z], i) => {
        const audioIndex = i % audio.length;
        const audioMod = audio[audioIndex] || 0;
        
        const vx = Math.floor(x);
        const vy = Math.floor(y);
        if (vx >= 0 && vx < width && vy >= 0 && vy < height) {
            buffer[vy][vx] = audioMod > 0.5 ? '@' : 'O';
        }
    });
};

// Scene 196: Cellular Automata Music Visualizer
CLIFTScenes[196] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Initialize cellular automata grid
    if (!params._cells || params._frameCount === undefined) {
        params._cells = [];
        params._nextCells = [];
        for (let y = 0; y < height; y++) {
            params._cells[y] = new Uint8Array(width);
            params._nextCells[y] = new Uint8Array(width);
        }
        params._frameCount = 0;
        
        // Random initial state
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                params._cells[y][x] = Math.random() < 0.3 ? 1 : 0;
            }
        }
    }
    
    // Inject audio energy periodically
    if (params._frameCount % 10 === 0) {
        for (let x = 0; x < width && x < audio.length; x++) {
            const audioMod = audio[x] || 0;
            if (audioMod > 0.5) {
                const y = Math.floor(Math.random() * height);
                params._cells[y][x] = 1;
                
                // Create small patterns based on audio
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width && Math.random() < audioMod) {
                            params._cells[ny][nx] = 1;
                        }
                    }
                }
            }
        }
    }
    
    // Update cellular automata
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Count neighbors
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dy === 0 && dx === 0) continue;
                    
                    const ny = (y + dy + height) % height;
                    const nx = (x + dx + width) % width;
                    neighbors += params._cells[ny][nx];
                }
            }
            
            // Apply rules (modified Conway's Game of Life)
            const current = params._cells[y][x];
            const audioIndex = Math.floor(x * audio.length / width);
            const audioMod = audio[audioIndex] || 0;
            
            // Audio influences the rules
            const birthThreshold = audioMod > 0.5 ? 2 : 3;
            const surviveMin = audioMod > 0.3 ? 1 : 2;
            
            if (current === 1) {
                // Survival
                params._nextCells[y][x] = (neighbors >= surviveMin && neighbors <= 3) ? 1 : 0;
            } else {
                // Birth
                params._nextCells[y][x] = (neighbors === birthThreshold) ? 1 : 0;
            }
        }
    }
    
    // Swap buffers
    const temp = params._cells;
    params._cells = params._nextCells;
    params._nextCells = temp;
    
    // Render with different characters based on neighbor count
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (params._cells[y][x]) {
                // Count neighbors for display
                let neighbors = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dy === 0 && dx === 0) continue;
                        const ny = (y + dy + height) % height;
                        const nx = (x + dx + width) % width;
                        neighbors += params._cells[ny][nx];
                    }
                }
                
                if (neighbors >= 6) buffer[y][x] = '@';
                else if (neighbors >= 4) buffer[y][x] = '#';
                else if (neighbors >= 2) buffer[y][x] = '*';
                else buffer[y][x] = '·';
            }
        }
    }
    
    params._frameCount++;
};

// Scene 197: Audio Wormhole Tunnel
CLIFTScenes[197] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Audio-reactive tunnel parameters
            const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
            const audioIndex = Math.floor((angle + Math.PI) / (2 * Math.PI) * audio.length);
            const audioMod = audio[audioIndex] || 0;
            
            // Tunnel depth effect
            const tunnelDepth = t * 5 + distance * 0.1;
            const ringIndex = Math.floor(tunnelDepth) % 10;
            const ringPhase = tunnelDepth - Math.floor(tunnelDepth);
            
            // Spiral motion
            const spiralAngle = angle + tunnelDepth * 0.2 + audioMod * Math.PI;
            const spiralX = Math.cos(spiralAngle) * distance;
            const spiralY = Math.sin(spiralAngle) * distance;
            
            // Wormhole distortion
            const distortion = Math.sin(tunnelDepth * 0.5) * audioMod * 10;
            const warpedDistance = distance + distortion;
            
            // Ring patterns
            const ringPattern = Math.sin(ringIndex * 0.8 + ringPhase * Math.PI * 2);
            const intensity = ringPattern * (1 - distance / Math.min(width, height) * 2) * (1 + audioMod);
            
            // Render
            if (intensity > 0.8) {
                buffer[y][x] = '@';
            } else if (intensity > 0.6) {
                buffer[y][x] = '#';
            } else if (intensity > 0.4) {
                buffer[y][x] = '*';
            } else if (intensity > 0.2) {
                buffer[y][x] = '+';
            } else if (intensity > 0.1) {
                buffer[y][x] = '·';
            }
            
            // Central vortex
            if (distance < 3 + audioMod * 5) {
                buffer[y][x] = avgAudio > 0.5 ? '◉' : '○';
            }
        }
    }
};

// Scene 198: Glitch Art Generator
CLIFTScenes[198] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Initialize glitch buffer
    if (!params._glitchBuffer) {
        params._glitchBuffer = [];
        params._glitchPatterns = ['█▓▒░', '┌┐└┘│─', '╔╗╚╝║═', '▲▼◄►◆◇', '░▒▓█▓▒░'];
        for (let y = 0; y < height; y++) {
            params._glitchBuffer[y] = new Array(width).fill(' ');
        }
    }
    
    // Base pattern generation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const audioIndex = Math.floor((x + y) * 0.5 % audio.length);
            const audioMod = audio[audioIndex] || 0;
            
            // Multiple noise layers
            const noise1 = Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 - t);
            const noise2 = Math.sin(x * 0.05 + y * 0.05 + t * 2);
            const noise3 = Math.random() < 0.1 ? 1 : 0;
            
            const combined = (noise1 + noise2 + noise3) * audioMod;
            
            if (combined > 0.5) {
                const patternIndex = Math.floor(audioMod * params._glitchPatterns.length);
                const pattern = params._glitchPatterns[patternIndex];
                const charIndex = Math.floor(Math.random() * pattern.length);
                params._glitchBuffer[y][x] = pattern[charIndex];
            }
        }
    }
    
    // Glitch effects based on audio
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Horizontal displacement glitch
    if (avgAudio > 0.6 && Math.random() < 0.3) {
        const glitchY = Math.floor(Math.random() * height);
        const glitchHeight = 1 + Math.floor(Math.random() * 3);
        const displacement = Math.floor((Math.random() - 0.5) * width * 0.3);
        
        for (let dy = 0; dy < glitchHeight && glitchY + dy < height; dy++) {
            const y = glitchY + dy;
            const temp = [...params._glitchBuffer[y]];
            for (let x = 0; x < width; x++) {
                const sourceX = (x - displacement + width) % width;
                buffer[y][x] = temp[sourceX];
            }
        }
    }
    
    // Vertical slicing
    if (avgAudio > 0.7 && Math.random() < 0.2) {
        const sliceX = Math.floor(Math.random() * width);
        const sliceWidth = 1 + Math.floor(Math.random() * 5);
        
        for (let dx = 0; dx < sliceWidth && sliceX + dx < width; dx++) {
            const x = sliceX + dx;
            const shift = Math.floor((Math.random() - 0.5) * height * 0.5);
            
            for (let y = 0; y < height; y++) {
                const sourceY = (y - shift + height) % height;
                buffer[y][x] = params._glitchBuffer[sourceY][x];
            }
        }
    }
    
    // Copy glitch buffer to main buffer where not already modified
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (buffer[y][x] === ' ') {
                buffer[y][x] = params._glitchBuffer[y][x];
            }
        }
    }
    
    // Random corruption based on audio peaks
    for (let i = 0; i < audio.length; i++) {
        if (audio[i] > 0.8 && Math.random() < 0.1) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const corruptChars = '▀▄█▌▐░▒▓■□▪▫';
            buffer[y][x] = corruptChars[Math.floor(Math.random() * corruptChars.length)];
        }
    }
};

// Scene 199: Audio Reactive Fractal Tree
CLIFTScenes[199] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const centerX = Math.floor(width / 2);
    const centerY = height - 1;
    
    // Tree drawing function
    function drawBranch(x, y, angle, length, depth, audioInfluence) {
        if (depth <= 0 || length < 1 || y < 0 || depth > 8) return;
        
        // Calculate end point
        const endX = x + Math.cos(angle) * length;
        const endY = y - Math.sin(angle) * length;
        
        // Draw branch
        const steps = Math.floor(length);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = Math.floor(x + (endX - x) * t);
            const py = Math.floor(y + (endY - y) * t);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                if (depth > 3) {
                    buffer[py][px] = '║';
                } else if (depth > 2) {
                    buffer[py][px] = '│';
                } else if (depth > 1) {
                    buffer[py][px] = '¦';
                } else {
                    buffer[py][px] = audioInfluence > 0.5 ? '*' : '·';
                }
            }
        }
        
        // Branch recursively
        const branchCount = depth > 3 ? 2 : (2 + Math.floor(audioInfluence * 2));
        const angleSpread = (Math.PI / 3) * (1 + audioInfluence * 0.5);
        
        for (let i = 0; i < branchCount; i++) {
            const branchAngle = angle + (i - (branchCount - 1) / 2) * angleSpread / branchCount;
            const wind = Math.sin(t * 2 + depth) * 0.1 * audioInfluence;
            
            drawBranch(
                endX,
                endY,
                branchAngle + wind,
                length * (0.6 + audioInfluence * 0.2),
                depth - 1,
                audioInfluence
            );
        }
    }
    
    // Calculate average audio for main trunk
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Draw main trunk and branches
    drawBranch(
        centerX,
        centerY,
        Math.PI / 2,
        height * 0.3 * (1 + avgAudio * 0.5),
        6,
        avgAudio
    );
    
    // Add leaves based on audio
    for (let i = 0; i < audio.length; i++) {
        if (audio[i] > 0.5) {
            const leafCount = Math.floor(audio[i] * 10);
            for (let j = 0; j < leafCount; j++) {
                const x = Math.floor(Math.random() * width);
                const y = Math.floor(Math.random() * (height * 0.7));
                
                if (buffer[y][x] === ' ' && Math.random() < audio[i]) {
                    const leafChars = ['♣', '♠', '*', '°', '·'];
                    buffer[y][x] = leafChars[Math.floor(Math.random() * leafChars.length)];
                }
            }
        }
    }
    
    // Ground
    for (let x = 0; x < width; x++) {
        if (buffer[height - 1][x] === ' ') {
            buffer[height - 1][x] = '═';
        }
    }
};

// Scene 200: 3D Rotating Cube
CLIFTScenes[200] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer if not already done
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear the scene and add a single rotating cube
    window.CLIFT3DRenderer.clearScene();
    
    // Create animated cube
    const cube = window.CLIFT3DRenderer.createCube(0, 0, 0, 3);
    cube.rotY = time * 0.02;
    cube.rotX = time * 0.01;
    
    // Add audio reactivity
    if (params.audio) {
        const intensity = params.audio.reduce((a, b) => a + b) / params.audio.length;
        cube.scaleX = cube.scaleY = cube.scaleZ = 1 + intensity;
    }
    
    window.CLIFT3DRenderer.addObject(cube);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};

// Scene 201: 3D Multi-Object Scene
CLIFTScenes[201] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear and set up scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create multiple 3D objects
    const cube = window.CLIFT3DRenderer.createCube(-6, 0, 0, 2);
    cube.rotY = time * 0.03;
    cube.rotX = time * 0.02;
    
    const pyramid = window.CLIFT3DRenderer.createPyramid(0, 0, 0, 2);
    pyramid.rotY = -time * 0.02;
    pyramid.rotZ = time * 0.01;
    
    const sphere = window.CLIFT3DRenderer.createSphere(6, 0, 0, 1.5);
    sphere.rotX = time * 0.04;
    
    // Add audio reactivity
    if (params.audio) {
        const bass = params.audio.slice(0, 16).reduce((a, b) => a + b) / 16;
        const mid = params.audio.slice(16, 32).reduce((a, b) => a + b) / 16;
        const high = params.audio.slice(32, 64).reduce((a, b) => a + b) / 32;
        
        cube.y = bass * 5;
        pyramid.y = mid * 3;
        sphere.y = high * 4;
    }
    
    window.CLIFT3DRenderer.addObject(cube);
    window.CLIFT3DRenderer.addObject(pyramid);
    window.CLIFT3DRenderer.addObject(sphere);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};

// Scene 202: 3D Wireframe Scene
CLIFTScenes[202] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Enable wireframe mode
    window.CLIFT3DRenderer.options.wireframe = true;
    window.CLIFT3DRenderer.options.wireChar = '▓';
    
    // Clear and set up scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create wireframe objects
    const cube = window.CLIFT3DRenderer.createCube(-4, 0, 0, 2);
    cube.rotY = time * 0.02;
    cube.rotX = time * 0.01;
    
    const pyramid = window.CLIFT3DRenderer.createPyramid(4, 0, 0, 2);
    pyramid.rotY = -time * 0.025;
    pyramid.rotZ = time * 0.015;
    
    // Add beat detection
    if (params.beat > 0.5) {
        cube.scaleX = cube.scaleY = cube.scaleZ = 1.5;
        pyramid.scaleX = pyramid.scaleY = pyramid.scaleZ = 1.3;
    }
    
    window.CLIFT3DRenderer.addObject(cube);
    window.CLIFT3DRenderer.addObject(pyramid);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
    
    // Reset wireframe mode
    window.CLIFT3DRenderer.options.wireframe = false;
};

// Scene 203: 3D Spinning Tunnel
CLIFTScenes[203] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create tunnel effect with multiple rings
    for (let i = 0; i < 10; i++) {
        const z = i * 4 - 20;
        const scale = 1 + i * 0.3;
        
        // Create ring of cubes
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2 + time * 0.01;
            const x = Math.cos(angle) * (3 + i * 0.5);
            const y = Math.sin(angle) * (3 + i * 0.5);
            
            const cube = window.CLIFT3DRenderer.createCube(x, y, z, 0.5);
            cube.rotY = time * 0.02 + i * 0.1;
            cube.rotX = time * 0.01 + j * 0.2;
            
            // Different characters for depth
            const chars = ['·', ':', '▒', '█'];
            cube.color = chars[i % chars.length];
            
            window.CLIFT3DRenderer.addObject(cube);
        }
    }
    
    // Move camera forward
    window.CLIFT3DRenderer.setCamera(0, 0, -10 + Math.sin(time * 0.01) * 5);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};

// Scene 204: 3D Audio Visualizer
CLIFTScenes[204] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create 3D audio bars
    if (params.audio) {
        const numBars = 16;
        const barWidth = 2;
        
        for (let i = 0; i < numBars; i++) {
            const audioIndex = Math.floor((i / numBars) * params.audio.length);
            const level = params.audio[audioIndex] || 0;
            
            const x = (i - numBars / 2) * barWidth;
            const y = 0;
            const z = 0;
            
            const cube = window.CLIFT3DRenderer.createCube(x, y, z, 0.8);
            cube.scaleY = 1 + level * 10;
            cube.rotY = time * 0.01 + i * 0.1;
            
            // Color based on frequency
            const chars = ['·', ':', '▒', '█'];
            cube.color = chars[Math.floor(level * chars.length) % chars.length];
            
            window.CLIFT3DRenderer.addObject(cube);
        }
    }
    
    // Rotate camera around the scene
    const cameraAngle = time * 0.005;
    window.CLIFT3DRenderer.setCamera(
        Math.cos(cameraAngle) * 15,
        5,
        Math.sin(cameraAngle) * 15
    );
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};