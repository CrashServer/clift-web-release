// CLIFT scenes - category 0: Audio Reactive

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
