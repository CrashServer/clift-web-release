// CLIFT scenes - category 7: Natural & Organic

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
