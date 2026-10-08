// CLIFT scenes - category 13: Minimal & Zen

// ============================================
// CATEGORY 13: Minimal & Zen (130-139)
// ============================================

// Scene 130: Breathing Circle
CLIFTScenes[130] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const breath = (Math.sin(t * 0.5) + 1) * 0.5 + audio[0] * 0.3;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 2;
    const radius = maxRadius * breath;
    
    // Draw breathing circle
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '○';
        }
    }
    
    // Center point
    if (breath > 0.7) {
        buffer[Math.floor(centerY)][Math.floor(centerX)] = '•';
    }
};

// Scene 131: Zen Garden
CLIFTScenes[131] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Sand ripples
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
            const wave = Math.sin(dist * 0.3 - t) * 0.5 + 0.5;
            
            if (wave > 0.7) {
                buffer[y][x] = '·';
            } else if (wave > 0.5) {
                buffer[y][x] = '.';
            }
        }
    }
    
    // Rocks (audio reactive placement)
    const numRocks = 3 + Math.floor(audio[0] * 2);
    for (let i = 0; i < numRocks; i++) {
        const rockX = Math.floor(width * (0.2 + i * 0.2));
        const rockY = Math.floor(height * (0.3 + Math.sin(t + i) * 0.2));
        
        if (rockX >= 0 && rockX < width && rockY >= 0 && rockY < height) {
            buffer[rockY][rockX] = '●';
        }
    }
};

// Scene 132: Minimal Lines
CLIFTScenes[132] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const intensity = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Horizontal lines
    const lineCount = 3 + Math.floor(intensity * 5);
    for (let i = 0; i < lineCount; i++) {
        const y = Math.floor(height * (i + 1) / (lineCount + 1));
        const offset = Math.sin(t + i) * 10;
        
        for (let x = 0; x < width; x++) {
            const xPos = x + offset;
            if (Math.sin(xPos * 0.1) > 0.5) {
                buffer[y][x] = '─';
            }
        }
    }
    
    // Vertical accents
    if (intensity > 0.5) {
        const x = Math.floor(width / 2);
        for (let y = 0; y < height; y++) {
            if (y % 3 === 0) {
                buffer[y][x] = '│';
            }
        }
    }
};

// Scene 133: Floating Dots
CLIFTScenes[133] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Initialize dots
    if (!params._dots) {
        params._dots = [];
        for (let i = 0; i < 20; i++) {
            params._dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3,
                char: '·•○'[Math.floor(Math.random() * 3)]
            });
        }
    }
    
    // Update and draw dots
    params._dots.forEach((dot, i) => {
        // Float movement
        dot.x += dot.vx + audio[i % 64] * 0.5;
        dot.y += dot.vy;
        
        // Wrap around
        if (dot.x < 0) dot.x = width - 1;
        if (dot.x >= width) dot.x = 0;
        if (dot.y < 0) dot.y = height - 1;
        if (dot.y >= height) dot.y = 0;
        
        // Draw
        const x = Math.floor(dot.x);
        const y = Math.floor(dot.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = dot.char;
        }
    });
};

// Scene 134: Wave Meditation
CLIFTScenes[134] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Single wave across screen
    for (let x = 0; x < width; x++) {
        const wave1 = Math.sin(x * 0.1 + t) * (height / 4);
        const wave2 = Math.sin(x * 0.05 + t * 0.7) * (height / 6);
        const combined = wave1 + wave2;
        
        const y = Math.floor(height / 2 + combined + avgAudio * 5);
        
        if (y >= 0 && y < height) {
            buffer[y][x] = '~';
            
            // Reflection
            const reflectY = height - 1 - y;
            if (reflectY >= 0 && reflectY < height && reflectY > y) {
                buffer[reflectY][x] = '˜';
            }
        }
    }
};

// Scene 135: Minimal Geometry
CLIFTScenes[135] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Rotating square
    const size = 10 + audio[0] * 10;
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = t;
    
    // Draw square corners
    const corners = [
        [-size/2, -size/2],
        [size/2, -size/2],
        [size/2, size/2],
        [-size/2, size/2]
    ];
    
    corners.forEach((corner, i) => {
        const nextCorner = corners[(i + 1) % 4];
        
        // Rotate
        const x1 = corner[0] * Math.cos(angle) - corner[1] * Math.sin(angle);
        const y1 = corner[0] * Math.sin(angle) + corner[1] * Math.cos(angle);
        const x2 = nextCorner[0] * Math.cos(angle) - nextCorner[1] * Math.sin(angle);
        const y2 = nextCorner[0] * Math.sin(angle) + nextCorner[1] * Math.cos(angle);
        
        // Draw line between corners
        const steps = 20;
        for (let s = 0; s < steps; s++) {
            const t = s / steps;
            const x = Math.floor(centerX + x1 + (x2 - x1) * t);
            const y = Math.floor(centerY + y1 + (y2 - y1) * t);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '□';
            }
        }
    });
};

// Scene 136: Pulse Field
CLIFTScenes[136] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    // Grid of pulsing points
    const gridX = 8;
    const gridY = 4;
    const cellWidth = width / gridX;
    const cellHeight = height / gridY;
    
    for (let gy = 0; gy < gridY; gy++) {
        for (let gx = 0; gx < gridX; gx++) {
            const index = gy * gridX + gx;
            const pulse = Math.sin(t * 2 + index * 0.5) * 0.5 + 0.5;
            const audioPulse = audio[index % 64];
            const intensity = pulse * 0.7 + audioPulse * 0.3;
            
            const x = Math.floor((gx + 0.5) * cellWidth);
            const y = Math.floor((gy + 0.5) * cellHeight);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                if (intensity > 0.7) {
                    buffer[y][x] = '◉';
                } else if (intensity > 0.4) {
                    buffer[y][x] = '○';
                } else if (intensity > 0.1) {
                    buffer[y][x] = '·';
                }
            }
        }
    }
};

// Scene 137: Horizon Line
CLIFTScenes[137] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Horizon position (audio reactive)
    const horizonY = Math.floor(height / 2 + audio[0] * 5 * Math.sin(t));
    
    // Draw horizon
    for (let x = 0; x < width; x++) {
        buffer[horizonY][x] = '─';
    }
    
    // Sun/moon
    const celestialX = Math.floor(width / 2 + Math.sin(t * 0.3) * width / 3);
    const celestialY = Math.floor(horizonY - 5 - Math.abs(Math.sin(t * 0.3)) * 5);
    
    if (celestialX >= 1 && celestialX < width - 1 && celestialY >= 1 && celestialY < height - 1) {
        buffer[celestialY][celestialX] = '○';
        // Rays
        if (audio[32] > 0.5) {
            buffer[celestialY - 1][celestialX] = '|';
            buffer[celestialY + 1][celestialX] = '|';
            buffer[celestialY][celestialX - 1] = '─';
            buffer[celestialY][celestialX + 1] = '─';
        }
    }
    
    // Reflection
    if (celestialY < horizonY) {
        const reflectY = horizonY + (horizonY - celestialY);
        if (reflectY < height) {
            buffer[reflectY][celestialX] = '˙';
        }
    }
};

// Scene 138: Minimal Rain
CLIFTScenes[138] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const intensity = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Initialize raindrops
    if (!params._raindrops) {
        params._raindrops = [];
        for (let i = 0; i < 30; i++) {
            params._raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    // Update and draw raindrops
    params._raindrops.forEach(drop => {
        drop.y += drop.speed + intensity;
        
        if (drop.y >= height) {
            drop.y = 0;
            drop.x = Math.random() * width;
        }
        
        const x = Math.floor(drop.x);
        const y = Math.floor(drop.y);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '|';
            
            // Splash at bottom
            if (y === height - 1) {
                if (x > 0) buffer[y][x - 1] = '·';
                if (x < width - 1) buffer[y][x + 1] = '·';
            }
        }
    });
};

// Scene 139: Enso Circle
CLIFTScenes[139] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const brush = audio[0];
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Draw incomplete circle (Enso)
    const startAngle = t * 0.2;
    const endAngle = startAngle + Math.PI * 1.8; // Incomplete circle
    
    for (let angle = startAngle; angle < endAngle; angle += 0.05) {
        const thickness = 1 + brush * 2;
        
        for (let r = radius - thickness; r <= radius + thickness; r += 0.5) {
            const x = Math.floor(centerX + Math.cos(angle) * r);
            const y = Math.floor(centerY + Math.sin(angle) * r * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const intensity = 1 - Math.abs(r - radius) / thickness;
                buffer[y][x] = intensity > 0.7 ? '#' : (intensity > 0.3 ? '=' : '·');
            }
        }
    }
};
