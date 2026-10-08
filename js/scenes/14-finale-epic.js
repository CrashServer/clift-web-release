// CLIFT scenes - category 14: Finale & Epic

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
        const noteY = staffY[Math.min(staffY.length - 1, Math.floor(audio[i] * staffY.length))];
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
