// CLIFT scenes - category 10: Experimental & Avant-garde

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
