// CLIFT scenes - category 15: Ikeda-Inspired

// ============================================
// CATEGORY 15: Ikeda-Inspired (150-159)
// ============================================

// Scene 150: Data Matrix
CLIFTScenes[150] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Binary data streams
    for (let x = 0; x < width; x += 8) {
        for (let y = 0; y < height; y += 2) {
            const noise = Math.sin(x * 0.1 + y * 0.1 + t) * 0.5 + 0.5;
            const audioMod = audio[x % audio.length] || 0;
            if (noise + audioMod > 0.7) {
                buffer[y][x] = Math.random() > 0.5 ? '1' : '0';
            }
        }
    }
    
    // Grid lines
    for (let x = 0; x < width; x += 8) {
        for (let y = 0; y < height; y++) {
            buffer[y][x] = '|';
        }
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x++) {
            buffer[y][x] = '-';
        }
    }
};

// Scene 151: Test Pattern
CLIFTScenes[151] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Geometric test patterns
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const patternX = Math.floor(x / 4);
            const patternY = Math.floor(y / 2);
            const pattern = (patternX + patternY + Math.floor(t * 2)) % 4;
            const audioMod = audio[x % audio.length] || 0;
            
            switch (pattern) {
                case 0: buffer[y][x] = audioMod > 0.3 ? '█' : '▓'; break;
                case 1: buffer[y][x] = audioMod > 0.3 ? '▓' : '▒'; break;
                case 2: buffer[y][x] = audioMod > 0.3 ? '▒' : '░'; break;
                case 3: buffer[y][x] = audioMod > 0.3 ? '░' : ' '; break;
            }
        }
    }
    
    // Calibration cross
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    for (let i = 0; i < width; i++) {
        buffer[centerY][i] = '+';
    }
    for (let i = 0; i < height; i++) {
        buffer[i][centerX] = '+';
    }
};

// Scene 152: Sine Wave
CLIFTScenes[152] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Pure sine wave visualization
    for (let x = 0; x < width; x++) {
        const frequency = 0.2 + (audio[x % audio.length] || 0) * 0.5;
        const amplitude = height * 0.3;
        const phase = t * 2 + x * 0.1;
        const y = Math.floor(height / 2 + Math.sin(phase * frequency) * amplitude);
        
        if (y >= 0 && y < height) {
            buffer[y][x] = '~';
        }
        
        // Frequency domain representation
        const fft = Math.abs(Math.sin(x * 0.1 + t)) * (audio[x % audio.length] || 0);
        const fftY = Math.floor(height - 1 - fft * (height - 1));
        if (fftY >= 0 && fftY < height) {
            buffer[fftY][x] = '|';
        }
    }
};

// Scene 153: Barcode
CLIFTScenes[153] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Animated barcode patterns
    for (let x = 0; x < width; x++) {
        const barWidth = 1 + Math.floor((audio[x % audio.length] || 0) * 4);
        const barHeight = Math.floor(height * (0.5 + (audio[x % audio.length] || 0) * 0.5));
        
        if (Math.floor(x / barWidth + t * 10) % 2 === 0) {
            for (let y = 0; y < barHeight; y++) {
                buffer[y][x] = '█';
            }
        }
    }
    
    // Data encoding at bottom
    const dataStr = 'CLIFT' + Math.floor(t * 100).toString();
    for (let i = 0; i < dataStr.length && i < width; i++) {
        buffer[height - 1][i] = dataStr[i];
    }
};

// Scene 154: Pulse
CLIFTScenes[154] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    
    // Rhythmic pulse patterns
    const pulse = Math.sin(t * 4) * 0.5 + 0.5;
    const beatPulse = beat * 0.5 + 0.5;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distance = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
            const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
            const normalizedDistance = distance / maxDistance;
            
            const pulseValue = (pulse + beatPulse) * (1 - normalizedDistance);
            const audioMod = audio[Math.floor(x / 4) % audio.length] || 0;
            
            if (pulseValue + audioMod > 0.7) {
                buffer[y][x] = '●';
            } else if (pulseValue + audioMod > 0.4) {
                buffer[y][x] = '○';
            } else if (pulseValue + audioMod > 0.2) {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 155: Glitch
CLIFTScenes[155] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Digital glitch effects
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const glitchProb = (audio[y % audio.length] || 0) * 0.3;
            const timeGlitch = Math.sin(t * 20 + x * 0.1) * 0.1 + 0.1;
            
            if (Math.random() < glitchProb + timeGlitch) {
                const glitchChars = '█▓▒░▄▀▐▌▬▪▫';
                buffer[y][x] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
        }
    }
    
    // Scan lines
    const scanLine = Math.floor(t * 10) % height;
    for (let x = 0; x < width; x++) {
        buffer[scanLine][x] = '─';
    }
};

// Scene 156: Spectrum
CLIFTScenes[156] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Frequency spectrum display
    for (let x = 0; x < width; x++) {
        const frequency = x / width;
        const magnitude = Math.sin(frequency * 10 + t * 2) * 0.5 + 0.5;
        const audioMod = audio[x % audio.length] || 0;
        const barHeight = Math.floor((magnitude + audioMod) * height);
        
        for (let y = 0; y < barHeight && y < height; y++) {
            const charY = height - 1 - y;
            const intensity = y / barHeight;
            
            // Bounds check to prevent crashes
            if (charY >= 0 && charY < height && x >= 0 && x < width) {
                if (intensity > 0.8) buffer[charY][x] = '█';
                else if (intensity > 0.6) buffer[charY][x] = '▓';
                else if (intensity > 0.4) buffer[charY][x] = '▒';
                else if (intensity > 0.2) buffer[charY][x] = '░';
                else buffer[charY][x] = '·';
            }
        }
    }
};

// Scene 157: Phase
CLIFTScenes[157] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Phase relationship visualizations
    for (let x = 0; x < width; x++) {
        const phase1 = Math.sin(x * 0.1 + t);
        const phase2 = Math.sin(x * 0.1 + t + Math.PI / 2);
        const audioPhase = (audio[x % audio.length] || 0) * Math.PI;
        
        const y1 = Math.floor(height / 2 + phase1 * height * 0.2);
        const y2 = Math.floor(height / 2 + phase2 * height * 0.2);
        const yAudio = Math.floor(height / 2 + Math.sin(audioPhase) * height * 0.3);
        
        if (y1 >= 0 && y1 < height) buffer[y1][x] = '-';
        if (y2 >= 0 && y2 < height) buffer[y2][x] = '=';
        if (yAudio >= 0 && yAudio < height) buffer[yAudio][x] = '~';
    }
};

// Scene 158: Binary
CLIFTScenes[158] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Binary data representations
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const binaryValue = Math.floor(x + y * width + t * 100) % 256;
            const bit = (binaryValue >> (x % 8)) & 1;
            const audioMod = audio[x % audio.length] || 0;
            
            if (bit && audioMod > 0.2) {
                buffer[y][x] = '1';
            } else if (!bit && audioMod > 0.2) {
                buffer[y][x] = '0';
            } else {
                buffer[y][x] = ' ';
            }
        }
    }
};

// Scene 159: Circuit
CLIFTScenes[159] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Electronic circuit patterns
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 8) {
            const audioMod = audio[x % audio.length] || 0;
            const active = audioMod > 0.3;
            
            // Circuit nodes
            buffer[y][x] = active ? '●' : '○';
            
            // Connections
            if (x + 4 < width) {
                for (let i = 1; i < 4; i++) {
                    buffer[y][x + i] = active ? '═' : '─';
                }
            }
            
            if (y + 2 < height) {
                buffer[y + 1][x] = active ? '║' : '│';
                buffer[y + 2][x] = active ? '╬' : '┼';
            }
        }
    }
};
