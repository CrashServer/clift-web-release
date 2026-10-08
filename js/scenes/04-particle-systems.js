// CLIFT scenes - category 4: Particle Systems

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
