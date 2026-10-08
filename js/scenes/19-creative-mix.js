// CLIFT scenes - category 19: Creative Mix

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
