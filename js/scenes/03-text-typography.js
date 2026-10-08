// CLIFT scenes - category 3: Text & Typography

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
