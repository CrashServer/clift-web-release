// CLIFT Web Explosion Scenes - Audio Reactive Explosions (225-234)
// Detailed audio-reactive explosion scenes with advanced visual effects

// Scene 225: NUCLEAR SHOCKWAVE EXPLOSION
window.CLIFTScenes[225] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    // Audio analysis
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    const bassLevel = bands.bass * 3;
    const midLevel = bands.mid * 2;
    
    // Explosion parameters
    const center = { x: width / 2, y: height / 2 };
    const maxRadius = Math.max(width, height) * 0.8;
    const explosionRadius = bassLevel * maxRadius + Math.sin(t * 4) * midLevel * 10;
    
    // Multiple shock rings
    for (let ring = 0; ring < 5; ring++) {
        const ringRadius = explosionRadius - ring * 8;
        const ringIntensity = Math.max(0, 1 - ring * 0.2) * bassLevel;
        
        if (ringRadius > 0) {
            const circumference = Math.floor(2 * Math.PI * ringRadius);
            for (let i = 0; i < circumference; i++) {
                const angle = (i / circumference) * 2 * Math.PI;
                const x = Math.floor(center.x + Math.cos(angle) * ringRadius);
                const y = Math.floor(center.y + Math.sin(angle) * ringRadius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    // Explosive characters based on intensity
                    const chars = ring === 0 ? '█▓▒' : ring === 1 ? '*%@' : ring === 2 ? '+=' : '·,';
                    const char = chars[Math.floor(ringIntensity * chars.length) % chars.length];
                    buffer[y][x] = char;
                }
            }
        }
    }
    
    // Central explosion core with particles
    const coreSize = bassLevel * 8;
    for (let dy = -coreSize; dy <= coreSize; dy++) {
        for (let dx = -coreSize; dx <= coreSize; dx++) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= coreSize) {
                const x = Math.floor(center.x + dx);
                const y = Math.floor(center.y + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const intensity = 1 - (dist / coreSize);
                    const chars = '█▓▒░';
                    buffer[y][x] = chars[Math.floor(intensity * chars.length) % chars.length];
                }
            }
        }
    }
    
    // Debris field
    const numDebris = Math.floor(bassLevel * 50);
    for (let i = 0; i < numDebris; i++) {
        const angle = (i / numDebris) * 2 * Math.PI;
        const speed = 20 + midLevel * 30;
        const debrisRadius = explosionRadius + speed + Math.random() * 20;
        const x = Math.floor(center.x + Math.cos(angle) * debrisRadius);
        const y = Math.floor(center.y + Math.sin(angle) * debrisRadius);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = Math.random() > 0.5 ? '*' : '·';
        }
    }
};

// Scene 226: STELLAR SUPERNOVA BURST
window.CLIFTScenes[226] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const bassLevel = bands.bass * 4;
    const trebleLevel = bands.treble * 3;
    
    const center = { x: width / 2, y: height / 2 };
    
    // Stellar explosion with multiple phases
    const phaseCount = 8;
    const baseRadius = bassLevel * 15;
    
    for (let phase = 0; phase < phaseCount; phase++) {
        const phaseOffset = (t + phase * 0.5) * 2;
        const phaseRadius = baseRadius + Math.sin(phaseOffset) * trebleLevel * 8;
        const rayCount = 16 + phase * 4;
        
        for (let ray = 0; ray < rayCount; ray++) {
            const angle = (ray / rayCount) * 2 * Math.PI + phaseOffset * 0.1;
            const rayLength = phaseRadius + Math.sin(t * 3 + ray * 0.2) * 5;
            
            // Draw stellar ray
            const steps = Math.floor(rayLength);
            for (let step = 0; step < steps; step++) {
                const x = Math.floor(center.x + Math.cos(angle) * step);
                const y = Math.floor(center.y + Math.sin(angle) * step);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const intensity = 1 - (step / steps);
                    const chars = step < rayLength * 0.3 ? '█▓▒░' : step < rayLength * 0.6 ? '*%@#' : '·,';
                    const char = chars[Math.floor(intensity * chars.length) % chars.length];
                    buffer[y][x] = char;
                }
            }
        }
    }
    
    // Bright stellar core
    const coreSize = Math.max(2, bassLevel * 3);
    for (let dy = -coreSize; dy <= coreSize; dy++) {
        for (let dx = -coreSize; dx <= coreSize; dx++) {
            if (dx*dx + dy*dy <= coreSize*coreSize) {
                const x = Math.floor(center.x + dx);
                const y = Math.floor(center.y + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '█';
                }
            }
        }
    }
};

// Scene 227: PLASMA CHAIN REACTION
window.CLIFTScenes[227] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const midLevel = bands.mid * 3;
    const trebleLevel = bands.treble * 2;
    
    // Multiple explosion centers for chain reaction
    const centers = [
        { x: width * 0.3, y: height * 0.4, phase: 0 },
        { x: width * 0.7, y: height * 0.3, phase: 1.5 },
        { x: width * 0.5, y: height * 0.7, phase: 2.8 },
        { x: width * 0.2, y: height * 0.8, phase: 4.2 },
        { x: width * 0.8, y: height * 0.6, phase: 5.5 }
    ];
    
    centers.forEach((center, index) => {
        const phaseTime = t + center.phase;
        const explosionSize = Math.max(0, Math.sin(phaseTime * 0.8) * midLevel * 20);
        
        if (explosionSize > 1) {
            // Plasma explosion rings
            for (let ring = 0; ring < 4; ring++) {
                const ringRadius = explosionSize - ring * 3;
                if (ringRadius > 0) {
                    const points = Math.floor(ringRadius * 6);
                    for (let p = 0; p < points; p++) {
                        const angle = (p / points) * 2 * Math.PI;
                        const variance = Math.sin(phaseTime * 2 + p * 0.3) * 2;
                        const x = Math.floor(center.x + Math.cos(angle) * (ringRadius + variance));
                        const y = Math.floor(center.y + Math.sin(angle) * (ringRadius + variance));
                        
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const chars = ring === 0 ? '█▓' : ring === 1 ? '▒░' : ring === 2 ? '*%' : '·';
                            buffer[y][x] = chars[Math.floor(Math.random() * chars.length)];
                        }
                    }
                }
            }
            
            // Connecting plasma arcs between centers
            centers.forEach((other, otherIndex) => {
                if (otherIndex > index) {
                    const otherPhaseTime = t + other.phase;
                    const otherSize = Math.max(0, Math.sin(otherPhaseTime * 0.8) * midLevel * 20);
                    
                    if (otherSize > 1) {
                        const dx = other.x - center.x;
                        const dy = other.y - center.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        const steps = Math.floor(distance);
                        
                        for (let s = 0; s < steps; s += 3) {
                            const progress = s / steps;
                            const x = Math.floor(center.x + dx * progress);
                            const y = Math.floor(center.y + dy * progress + Math.sin(s * 0.3 + phaseTime * 3) * trebleLevel * 3);
                            
                            if (x >= 0 && x < width && y >= 0 && y < height) {
                                buffer[y][x] = Math.random() > 0.5 ? '~' : '-';
                            }
                        }
                    }
                }
            });
        }
    });
};

// Scene 228: VOLCANIC ERUPTION CASCADE
window.CLIFTScenes[228] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const bassLevel = bands.bass * 4;
    const midLevel = bands.mid * 3;
    
    // Volcano base at bottom
    const volcanoWidth = width * 0.4;
    const volcanoBase = height - 5;
    const volcanoCenter = width / 2;
    
    // Draw volcano shape
    for (let y = volcanoBase; y < height; y++) {
        for (let x = volcanoCenter - volcanoWidth/2; x < volcanoCenter + volcanoWidth/2; x++) {
            if (x >= 0 && x < width) {
                buffer[Math.floor(y)][Math.floor(x)] = '▓';
            }
        }
        volcanoWidth *= 0.9; // Taper
    }
    
    // Explosive eruption
    const eruptionHeight = bassLevel * (height * 0.8);
    const eruptionWidth = midLevel * 20 + 10;
    
    // Main eruption column
    for (let y = volcanoBase - eruptionHeight; y < volcanoBase; y++) {
        const columnY = Math.floor(y);
        if (columnY >= 0 && columnY < height) {
            const width_at_height = eruptionWidth * (1 + (volcanoBase - y) / eruptionHeight);
            for (let dx = -width_at_height/2; dx < width_at_height/2; dx++) {
                const x = Math.floor(volcanoCenter + dx + Math.sin(t * 2 + y * 0.1) * 3);
                if (x >= 0 && x < width) {
                    const intensity = Math.abs(dx) / (width_at_height/2);
                    const chars = intensity < 0.3 ? '█▓' : intensity < 0.6 ? '▒*' : '░·';
                    buffer[columnY][x] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }
    }
    
    // Lava bombs and particles
    const numBombs = Math.floor(bassLevel * 30);
    for (let i = 0; i < numBombs; i++) {
        const angle = (Math.random() - 0.5) * Math.PI; // Upward arc
        const velocity = 20 + Math.random() * 20;
        const timeInFlight = t * 2 + i * 0.1;
        
        const x = volcanoCenter + Math.sin(angle) * velocity * timeInFlight;
        const y = volcanoBase - Math.cos(angle) * velocity * timeInFlight + 0.5 * 9.8 * timeInFlight * timeInFlight;
        
        const bombX = Math.floor(x);
        const bombY = Math.floor(y);
        
        if (bombX >= 0 && bombX < width && bombY >= 0 && bombY < height) {
            buffer[bombY][bombX] = Math.random() > 0.5 ? '*' : 'o';
        }
    }
    
    // Pyroclastic flow
    const flowHeight = bassLevel * 15;
    for (let y = volcanoBase; y < volcanoBase + flowHeight; y++) {
        const flowY = Math.floor(y);
        if (flowY < height) {
            const spread = (y - volcanoBase) * 2;
            for (let x = volcanoCenter - spread; x < volcanoCenter + spread; x++) {
                const flowX = Math.floor(x);
                if (flowX >= 0 && flowX < width) {
                    if (Math.random() < 0.6) {
                        buffer[flowY][flowX] = Math.random() > 0.5 ? '▒' : '░';
                    }
                }
            }
        }
    }
};

// Scene 229: DIGITAL MATRIX IMPLOSION
window.CLIFTScenes[229] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const trebleLevel = bands.treble * 4;
    const midLevel = bands.mid * 3;
    
    const center = { x: width / 2, y: height / 2 };
    const implosionForce = trebleLevel * 30;
    
    // Digital grid being sucked into center
    const gridSize = 4;
    for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
            const dx = x - center.x;
            const dy = y - center.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance > 5) {
                // Calculate implosion offset
                const implosionStrength = implosionForce / distance;
                const offsetX = -(dx / distance) * implosionStrength * Math.sin(t * 3);
                const offsetY = -(dy / distance) * implosionStrength * Math.sin(t * 3);
                
                const finalX = Math.floor(x + offsetX);
                const finalY = Math.floor(y + offsetY);
                
                if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) {
                    // Digital characters
                    const chars = '01█▓▒░╬╫╪┼';
                    const char = chars[Math.floor((distance + t * 10) % chars.length)];
                    buffer[finalY][finalX] = char;
                }
            }
        }
    }
    
    // Central singularity
    const coreSize = Math.max(3, 8 - trebleLevel * 2); // Shrinks with audio
    for (let dy = -coreSize; dy <= coreSize; dy++) {
        for (let dx = -coreSize; dx <= coreSize; dx++) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= coreSize) {
                const x = Math.floor(center.x + dx);
                const y = Math.floor(center.y + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = dist < coreSize * 0.5 ? '●' : '○';
                }
            }
        }
    }
    
    // Data streams spiraling into center
    const streamCount = 8;
    for (let stream = 0; stream < streamCount; stream++) {
        const baseAngle = (stream / streamCount) * 2 * Math.PI;
        const spiralRadius = 40;
        
        for (let r = 5; r < spiralRadius; r += 2) {
            const spiralAngle = baseAngle + (r * 0.2) + t * 2;
            const x = Math.floor(center.x + Math.cos(spiralAngle) * r);
            const y = Math.floor(center.y + Math.sin(spiralAngle) * r);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const chars = '←↖↑↗→↘↓↙';
                buffer[y][x] = chars[stream % chars.length];
            }
        }
    }
};

// Scene 230: CRYSTALLINE FRACTAL EXPLOSION
window.CLIFTScenes[230] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const bassLevel = bands.bass * 3;
    const trebleLevel = bands.treble * 4;
    
    const center = { x: width / 2, y: height / 2 };
    const maxRadius = Math.min(width, height) * 0.4;
    
    // Recursive crystal generation
    function drawCrystal(centerX, centerY, size, depth, angle) {
        if (depth <= 0 || size < 2) return;
        
        const points = 6; // Hexagonal crystal
        const vertices = [];
        
        for (let i = 0; i < points; i++) {
            const a = (i / points) * 2 * Math.PI + angle;
            const x = centerX + Math.cos(a) * size;
            const y = centerY + Math.sin(a) * size;
            vertices.push({ x, y });
        }
        
        // Draw crystal edges
        for (let i = 0; i < vertices.length; i++) {
            const start = vertices[i];
            const end = vertices[(i + 1) % vertices.length];
            
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const steps = Math.floor(Math.sqrt(dx*dx + dy*dy));
            
            for (let s = 0; s <= steps; s++) {
                const progress = s / steps;
                const x = Math.floor(start.x + dx * progress);
                const y = Math.floor(start.y + dy * progress);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const chars = depth > 2 ? '◆◇' : depth > 1 ? '♦♢' : '·,';
                    buffer[y][x] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }
        
        // Recursive smaller crystals at vertices
        if (depth > 1) {
            vertices.forEach((vertex, i) => {
                const newSize = size * (0.3 + trebleLevel * 0.2);
                const newAngle = angle + (i * Math.PI / 3) + t;
                drawCrystal(vertex.x, vertex.y, newSize, depth - 1, newAngle);
            });
        }
    }
    
    // Main explosion crystal
    const mainSize = bassLevel * maxRadius + 10;
    const maxDepth = Math.floor(3 + trebleLevel * 2);
    drawCrystal(center.x, center.y, mainSize, maxDepth, t * 0.5);
    
    // Crystal shards flying outward
    const shardCount = Math.floor(bassLevel * 50);
    for (let i = 0; i < shardCount; i++) {
        const angle = (i / shardCount) * 2 * Math.PI;
        const distance = (t * 20 + i * 2) % (maxRadius * 2);
        const x = Math.floor(center.x + Math.cos(angle) * distance);
        const y = Math.floor(center.y + Math.sin(angle) * distance);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = Math.random() > 0.5 ? '◊' : '▪';
        }
    }
};

// Scene 231: ELECTROMAGNETIC PULSE BURST
window.CLIFTScenes[231] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const midLevel = bands.mid * 4;
    const trebleLevel = bands.treble * 3;
    
    const center = { x: width / 2, y: height / 2 };
    const pulseRadius = midLevel * Math.min(width, height) * 0.3;
    
    // Main EMP pulse rings
    for (let ring = 0; ring < 6; ring++) {
        const ringRadius = pulseRadius - ring * 5 + Math.sin(t * 4 + ring) * 3;
        
        if (ringRadius > 0) {
            const intensity = Math.max(0, 1 - ring * 0.2);
            const circumference = Math.floor(2 * Math.PI * ringRadius);
            
            for (let i = 0; i < circumference; i += 2) {
                const angle = (i / circumference) * 2 * Math.PI;
                
                // Add electromagnetic interference
                const interference = Math.sin(t * 10 + i * 0.5) * trebleLevel;
                const x = Math.floor(center.x + Math.cos(angle) * ringRadius + interference);
                const y = Math.floor(center.y + Math.sin(angle) * ringRadius + interference);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const chars = ring < 2 ? '█▓' : ring < 4 ? '▒░' : '·,';
                    buffer[y][x] = chars[Math.floor(intensity * chars.length) % chars.length];
                }
            }
        }
    }
    
    // Electromagnetic field lines
    const fieldLineCount = 12;
    for (let line = 0; line < fieldLineCount; line++) {
        const baseAngle = (line / fieldLineCount) * 2 * Math.PI;
        const lineLength = pulseRadius * 1.5;
        
        for (let r = 5; r < lineLength; r += 3) {
            // Create field line distortion
            const fieldStrength = Math.sin(t * 6 + r * 0.1) * trebleLevel * 5;
            const angle = baseAngle + Math.sin(r * 0.1 + t * 2) * 0.3;
            
            const x = Math.floor(center.x + Math.cos(angle) * r + fieldStrength);
            const y = Math.floor(center.y + Math.sin(angle) * r + fieldStrength);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = r % 6 < 2 ? '~' : r % 6 < 4 ? '-' : '·';
            }
        }
    }
    
    // Central EMP source
    const sourceSize = Math.max(2, midLevel * 4);
    for (let dy = -sourceSize; dy <= sourceSize; dy++) {
        for (let dx = -sourceSize; dx <= sourceSize; dx++) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= sourceSize) {
                const x = Math.floor(center.x + dx);
                const y = Math.floor(center.y + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const flicker = Math.sin(t * 20) > 0 ? '●' : '○';
                    buffer[y][x] = dist < sourceSize * 0.5 ? '●' : flicker;
                }
            }
        }
    }
    
    // Digital interference patterns
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 8) {
            if (Math.random() < trebleLevel * 0.3) {
                const interferenceChar = '▫▪░▒▓'[Math.floor(Math.random() * 5)];
                const iX = Math.floor(x + Math.random() * 6 - 3);
                const iY = Math.floor(y + Math.random() * 3 - 1);
                
                if (iX >= 0 && iX < width && iY >= 0 && iY < height) {
                    buffer[iY][iX] = interferenceChar;
                }
            }
        }
    }
};

// Scene 232: WORMHOLE SINGULARITY COLLAPSE
window.CLIFTScenes[232] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const bassLevel = bands.bass * 4;
    const midLevel = bands.mid * 3;
    const trebleLevel = bands.treble * 2;
    
    const center = { x: width / 2, y: height / 2 };
    
    // Wormhole spiral structure
    const spiralCount = 4;
    const maxRadius = Math.min(width, height) * 0.4;
    
    for (let spiral = 0; spiral < spiralCount; spiral++) {
        const spiralPhase = (spiral / spiralCount) * 2 * Math.PI;
        
        for (let r = 3; r < maxRadius; r += 2) {
            // Wormhole distortion based on audio
            const distortion = bassLevel * Math.sin(r * 0.1 + t * 3);
            const spiralAngle = spiralPhase + (r * 0.15) + t * 2 + distortion;
            
            // Calculate position with perspective effect
            const depth = r / maxRadius;
            const perspectiveScale = 1 - depth * 0.5;
            
            const x = Math.floor(center.x + Math.cos(spiralAngle) * r * perspectiveScale);
            const y = Math.floor(center.y + Math.sin(spiralAngle) * r * perspectiveScale);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Character intensity based on depth and audio
                const intensity = (1 - depth) * (1 + trebleLevel);
                const chars = intensity > 1.5 ? '█▓▒' : intensity > 1 ? '░*%' : intensity > 0.5 ? '·,' : ' ';
                
                if (chars.length > 1) {
                    buffer[y][x] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }
    }
    
    // Event horizon ring
    const horizonRadius = 8 + bassLevel * 5;
    const horizonPoints = Math.floor(horizonRadius * 8);
    
    for (let i = 0; i < horizonPoints; i++) {
        const angle = (i / horizonPoints) * 2 * Math.PI + t * 4;
        const warp = Math.sin(angle * 4 + t * 6) * midLevel;
        const x = Math.floor(center.x + Math.cos(angle) * (horizonRadius + warp));
        const y = Math.floor(center.y + Math.sin(angle) * (horizonRadius + warp));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '●';
        }
    }
    
    // Singularity core
    const coreFlicker = Math.sin(t * 15) > 0;
    if (coreFlicker) {
        buffer[Math.floor(center.y)][Math.floor(center.x)] = '◉';
    }
    
    // Matter streams being pulled in
    const streamCount = 16;
    for (let stream = 0; stream < streamCount; stream++) {
        const streamAngle = (stream / streamCount) * 2 * Math.PI;
        const streamLength = maxRadius * 1.2;
        
        for (let s = horizonRadius + 5; s < streamLength; s += 4) {
            // Stream distortion
            const streamWarp = Math.sin(s * 0.1 + t * 4) * trebleLevel * 3;
            const angle = streamAngle + streamWarp * 0.1;
            
            const x = Math.floor(center.x + Math.cos(angle) * s);
            const y = Math.floor(center.y + Math.sin(angle) * s);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const streamChars = '→↘↓↙←↖↑↗';
                const direction = Math.floor((angle + Math.PI) / (Math.PI / 4)) % 8;
                buffer[y][x] = streamChars[direction];
            }
        }
    }
};

// Scene 233: ANTIMATTER ANNIHILATION BURST
window.CLIFTScenes[233] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const bassLevel = bands.bass * 5;
    const midLevel = bands.mid * 3;
    const trebleLevel = bands.treble * 4;
    
    const center = { x: width / 2, y: height / 2 };
    const annihilationRadius = bassLevel * Math.min(width, height) * 0.25;
    
    // Matter-antimatter collision point
    const collisionIntensity = Math.sin(t * 8) * bassLevel;
    if (collisionIntensity > 0.5) {
        const burstRadius = collisionIntensity * 15;
        const burstPoints = Math.floor(burstRadius * 10);
        
        for (let i = 0; i < burstPoints; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * burstRadius;
            const x = Math.floor(center.x + Math.cos(angle) * distance);
            const y = Math.floor(center.y + Math.sin(angle) * distance);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '✶';
            }
        }
    }
    
    // Gamma ray burst patterns
    const rayCount = 24;
    for (let ray = 0; ray < rayCount; ray++) {
        const rayAngle = (ray / rayCount) * 2 * Math.PI + t * 0.5;
        const rayLength = annihilationRadius + trebleLevel * 20;
        const rayIntensity = Math.sin(t * 6 + ray * 0.5) * midLevel;
        
        if (rayIntensity > 0) {
            const steps = Math.floor(rayLength);
            for (let step = 5; step < steps; step += 2) {
                const intensity = rayIntensity * (1 - step / steps);
                if (intensity > 0.2) {
                    const x = Math.floor(center.x + Math.cos(rayAngle) * step);
                    const y = Math.floor(center.y + Math.sin(rayAngle) * step);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const chars = intensity > 0.8 ? '█' : intensity > 0.6 ? '▓' : intensity > 0.4 ? '▒' : '░';
                        buffer[y][x] = chars;
                    }
                }
            }
        }
    }
    
    // Particle-antiparticle pairs
    const pairCount = Math.floor(trebleLevel * 100);
    for (let i = 0; i < pairCount; i++) {
        const pairAngle = Math.random() * 2 * Math.PI;
        const pairDistance = 5 + Math.random() * annihilationRadius;
        
        // Particle
        const x1 = Math.floor(center.x + Math.cos(pairAngle) * pairDistance);
        const y1 = Math.floor(center.y + Math.sin(pairAngle) * pairDistance);
        
        // Antiparticle (opposite side)
        const x2 = Math.floor(center.x - Math.cos(pairAngle) * pairDistance);
        const y2 = Math.floor(center.y - Math.sin(pairAngle) * pairDistance);
        
        if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
            buffer[y1][x1] = '+';
        }
        if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
            buffer[y2][x2] = '-';
        }
    }
    
    // Central annihilation core
    const coreSize = Math.max(3, bassLevel * 6);
    for (let dy = -coreSize; dy <= coreSize; dy++) {
        for (let dx = -coreSize; dx <= coreSize; dx++) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= coreSize) {
                const x = Math.floor(center.x + dx);
                const y = Math.floor(center.y + dy);
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const coreIntensity = 1 - (dist / coreSize);
                    const coreChar = coreIntensity > 0.8 ? '●' : coreIntensity > 0.6 ? '◉' : coreIntensity > 0.4 ? '○' : '·';
                    buffer[y][x] = coreChar;
                }
            }
        }
    }
    
    // Energy ripples
    for (let ripple = 0; ripple < 3; ripple++) {
        const rippleRadius = annihilationRadius * 0.3 + ripple * 8 + Math.sin(t * 4 + ripple * 2) * 5;
        const ripplePoints = Math.floor(rippleRadius * 6);
        
        for (let i = 0; i < ripplePoints; i++) {
            const angle = (i / ripplePoints) * 2 * Math.PI;
            const x = Math.floor(center.x + Math.cos(angle) * rippleRadius);
            const y = Math.floor(center.y + Math.sin(angle) * rippleRadius);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = ripple === 0 ? '◦' : '·';
            }
        }
    }
};

// Scene 234: QUANTUM FOAM DETONATION
window.CLIFTScenes[234] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const audioInfo = params.audioInfo;
    const t = time * 0.001;
    
    const bands = audioInfo?.bands || { bass: 0.3, mid: 0.3, treble: 0.3 };
    const bassLevel = bands.bass * 4;
    const midLevel = bands.mid * 3;
    const trebleLevel = bands.treble * 5;
    
    // Multiple quantum detonation points
    const foamCenters = [
        { x: width * 0.3, y: height * 0.3, phase: 0 },
        { x: width * 0.7, y: height * 0.4, phase: 2 },
        { x: width * 0.4, y: height * 0.7, phase: 4 },
        { x: width * 0.6, y: height * 0.6, phase: 6 },
        { x: width * 0.2, y: height * 0.8, phase: 8 }
    ];
    
    foamCenters.forEach((center, index) => {
        const foamTime = t * 3 + center.phase;
        const foamRadius = bassLevel * 20 + Math.sin(foamTime) * 10;
        const quantumFluctuation = trebleLevel * Math.sin(foamTime * 4);
        
        // Quantum foam bubbles
        const bubbleCount = Math.floor(foamRadius * 2);
        for (let bubble = 0; bubble < bubbleCount; bubble++) {
            const bubbleAngle = (bubble / bubbleCount) * 2 * Math.PI + foamTime * 0.5;
            const bubbleDistance = Math.random() * foamRadius;
            
            // Quantum uncertainty in position
            const uncertainty = quantumFluctuation * 3;
            const x = Math.floor(center.x + Math.cos(bubbleAngle) * bubbleDistance + Math.random() * uncertainty - uncertainty/2);
            const y = Math.floor(center.y + Math.sin(bubbleAngle) * bubbleDistance + Math.random() * uncertainty - uncertainty/2);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Quantum state superposition
                const quantumState = Math.sin(foamTime * 8 + bubble * 0.3);
                const chars = quantumState > 0.5 ? '◉◎○' : quantumState > 0 ? '●◌○' : '·,˙';
                buffer[y][x] = chars[Math.floor(Math.abs(quantumState) * chars.length) % chars.length];
            }
        }
        
        // Planck-scale distortions
        const distortionCount = Math.floor(trebleLevel * 50);
        for (let d = 0; d < distortionCount; d++) {
            const distortionAngle = Math.random() * 2 * Math.PI;
            const distortionRadius = Math.random() * foamRadius * 1.5;
            
            const x = Math.floor(center.x + Math.cos(distortionAngle) * distortionRadius);
            const y = Math.floor(center.y + Math.sin(distortionAngle) * distortionRadius);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const distortionChars = '▫▪◦•▨▧▦▥';
                buffer[y][x] = distortionChars[Math.floor(Math.random() * distortionChars.length)];
            }
        }
    });
    
    // Vacuum fluctuations across the field
    for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 4) {
            const fluctuationProb = trebleLevel * 0.1 + Math.sin(t * 12 + x * 0.1 + y * 0.1) * 0.05;
            
            if (Math.random() < fluctuationProb) {
                const fluctuationX = x + Math.floor(Math.random() * 3);
                const fluctuationY = y + Math.floor(Math.random() * 2);
                
                if (fluctuationX < width && fluctuationY < height) {
                    // Virtual particle pairs
                    const pairChar = Math.random() > 0.5 ? '⟨' : '⟩';
                    buffer[fluctuationY][fluctuationX] = pairChar;
                }
            }
        }
    }
    
    // Quantum tunneling effects
    const tunnelingEvents = Math.floor(midLevel * 30);
    for (let tunnel = 0; tunnel < tunnelingEvents; tunnel++) {
        const startX = Math.floor(Math.random() * width);
        const startY = Math.floor(Math.random() * height);
        const tunnelLength = 5 + Math.random() * 10;
        const tunnelAngle = Math.random() * 2 * Math.PI;
        
        for (let step = 0; step < tunnelLength; step++) {
            const x = Math.floor(startX + Math.cos(tunnelAngle) * step);
            const y = Math.floor(startY + Math.sin(tunnelAngle) * step);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Quantum tunneling visualization
                const tunnelIntensity = 1 - (step / tunnelLength);
                if (tunnelIntensity > 0.3) {
                    buffer[y][x] = tunnelIntensity > 0.7 ? '═' : tunnelIntensity > 0.5 ? '─' : '˗';
                }
            }
        }
    }
};