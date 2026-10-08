// CLIFT scenes - category 2: Advanced Audio Reactive

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
