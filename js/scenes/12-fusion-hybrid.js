// CLIFT scenes - category 12: Fusion & Hybrid

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
