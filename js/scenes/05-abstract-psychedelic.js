// CLIFT scenes - category 5: Abstract & Psychedelic

// ============================================
// CATEGORY 5: Abstract & Psychedelic (50-59)
// ============================================

// Scene 50: Kaleidoscope Fractal
CLIFTScenes[50] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.0005;
    const chars = ' .:-=+*#%@';
    
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Kaleidoscope symmetry
            const folds = 6 + Math.floor(avgAudio * 6);
            const foldedAngle = Math.abs((angle % (Math.PI * 2 / folds)) - Math.PI / folds);
            
            // Fractal pattern
            let value = 0;
            for (let i = 1; i <= 4; i++) {
                value += Math.sin(dist * i * 0.1 + t * i) * 
                        Math.cos(foldedAngle * i + t * (5 - i)) / i;
            }
            
            value = (value + 2) / 4;
            value *= 1 - (dist / Math.min(width, height));
            
            if (value > 0.1) {
                const charIndex = Math.floor(value * (chars.length - 1));
                buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
            }
        }
    }
};

// Scene 51: Morphing Blobs
CLIFTScenes[51] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Multiple blobs
    const blobs = [];
    for (let i = 0; i < 5; i++) {
        const audioIndex = Math.floor((i / 5) * audio.length);
        const audioValue = audio[audioIndex] || 0.2;
        
        blobs.push({
            x: width / 2 + Math.sin(t * (i + 1) * 0.3) * width * 0.3,
            y: height / 2 + Math.cos(t * (i + 1) * 0.3) * height * 0.3,
            radius: 5 + audioValue * 15 + Math.sin(t * (i + 2)) * 3
        });
    }
    
    // Metaball rendering
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            
            blobs.forEach(blob => {
                const dx = x - blob.x;
                const dy = (y - blob.y) * 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                sum += blob.radius * blob.radius / (dist * dist + 1);
            });
            
            if (sum > 1) {
                const charIndex = Math.floor(Math.min(sum - 1, 1) * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
        }
    }
};

// Scene 52: Cellular Automata
CLIFTScenes[52] = function(buffer, width, height, time, params) {
    if (!params._cells) {
        params._cells = [];
        for (let y = 0; y < height; y++) {
            params._cells[y] = [];
            for (let x = 0; x < width; x++) {
                params._cells[y][x] = Math.random() > 0.5 ? 1 : 0;
            }
        }
        params._generation = 0;
    }
    
    const cells = params._cells;
    const audio = params.audio || new Float32Array(64).fill(0.1);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.1;
    
    // Update every few frames
    if (params._generation % (5 - Math.floor(avgAudio * 4)) === 0) {
        const newCells = [];
        
        for (let y = 0; y < height; y++) {
            newCells[y] = [];
            for (let x = 0; x < width; x++) {
                let neighbors = 0;
                
                // Count neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ny = (y + dy + height) % height;
                        const nx = (x + dx + width) % width;
                        neighbors += cells[ny][nx];
                    }
                }
                
                // Apply rules (modified by audio)
                const current = cells[y][x];
                const threshold = 3 + Math.floor(avgAudio * 2);
                
                if (current === 1) {
                    newCells[y][x] = (neighbors === 2 || neighbors === threshold) ? 1 : 0;
                } else {
                    newCells[y][x] = (neighbors === threshold) ? 1 : 0;
                }
            }
        }
        
        params._cells = newCells;
    }
    
    params._generation++;
    
    // Draw cells
    const chars = [' ', '.', '+', '#', '@'];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (cells[y][x]) {
                const age = params._generation % chars.length;
                buffer[y][x] = chars[age];
            }
        }
    }
};

// Scene 53: Sine Wave Interference
CLIFTScenes[53] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Multiple wave sources
    const sources = [];
    for (let i = 0; i < 3; i++) {
        sources.push({
            x: width / 2 + Math.sin(t * (i + 1) * 0.3) * width * 0.4,
            y: height / 2 + Math.cos(t * (i + 1) * 0.3) * height * 0.4,
            frequency: 0.2 + i * 0.1 + avgAudio * 0.2,
            amplitude: 1 + avgAudio,
            phase: t * (i + 1)
        });
    }
    
    // Calculate interference pattern
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            
            sources.forEach(source => {
                const dx = x - source.x;
                const dy = (y - source.y) * 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                sum += Math.sin(dist * source.frequency + source.phase) * source.amplitude;
            });
            
            const normalized = (sum / sources.length + 1) / 2;
            const charIndex = Math.floor(normalized * (chars.length - 1));
            
            if (charIndex > 0) {
                buffer[y][x] = chars[Math.max(0, Math.min(charIndex, chars.length - 1))];
            }
        }
    }
};

// Scene 54: Reaction Diffusion
CLIFTScenes[54] = function(buffer, width, height, time, params) {
    if (!params._reaction) {
        params._reaction = {
            a: [],
            b: []
        };
        
        // Initialize with random pattern
        for (let y = 0; y < height; y++) {
            params._reaction.a[y] = [];
            params._reaction.b[y] = [];
            for (let x = 0; x < width; x++) {
                params._reaction.a[y][x] = 1;
                params._reaction.b[y][x] = Math.random() < 0.1 ? 1 : 0;
            }
        }
    }
    
    const reaction = params._reaction;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    // Gray-Scott parameters (modified by audio)
    const dA = 1.0;
    const dB = 0.5;
    const feed = 0.055 + avgAudio * 0.01;
    const kill = 0.062 + avgAudio * 0.005;
    
    // Update reaction-diffusion
    const newA = [];
    const newB = [];
    
    for (let y = 0; y < height; y++) {
        newA[y] = [];
        newB[y] = [];
        for (let x = 0; x < width; x++) {
            const a = reaction.a[y][x];
            const b = reaction.b[y][x];
            
            // Laplacian
            let laplaceA = 0;
            let laplaceB = 0;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const ny = (y + dy + height) % height;
                    const nx = (x + dx + width) % width;
                    const weight = (dx === 0 && dy === 0) ? -1 : 0.2;
                    laplaceA += reaction.a[ny][nx] * weight;
                    laplaceB += reaction.b[ny][nx] * weight;
                }
            }
            
            // Reaction-diffusion equations
            const abb = a * b * b;
            newA[y][x] = a + (dA * laplaceA - abb + feed * (1 - a)) * 0.1;
            newB[y][x] = b + (dB * laplaceB + abb - (kill + feed) * b) * 0.1;
            
            // Clamp values
            newA[y][x] = Math.max(0, Math.min(1, newA[y][x]));
            newB[y][x] = Math.max(0, Math.min(1, newB[y][x]));
        }
    }
    
    reaction.a = newA;
    reaction.b = newB;
    
    // Render
    const chars = ' .:-=+*#%@';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = reaction.b[y][x];
            const charIndex = Math.floor(value * (chars.length - 1));
            buffer[y][x] = chars[charIndex];
        }
    }
};

// Scene 55: Fractal Zoom
CLIFTScenes[55] = function(buffer, width, height, time, params) {
    const t = time * 0.00005;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    // Zoom parameters
    const zoom = Math.exp(t) * (1 + avgAudio);
    const centerX = -0.5 + Math.sin(t * 10) * 0.1;
    const centerY = 0 + Math.cos(t * 10) * 0.1;
    
    // Mandelbrot set
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const x0 = (x - width / 2) / (width / 4) / zoom + centerX;
            const y0 = (y - height / 2) / (height / 4) / zoom + centerY;
            
            let zx = 0, zy = 0;
            let iter = 0;
            const maxIter = 50 + Math.floor(avgAudio * 50);
            
            while (zx * zx + zy * zy < 4 && iter < maxIter) {
                const tmp = zx * zx - zy * zy + x0;
                zy = 2 * zx * zy + y0;
                zx = tmp;
                iter++;
            }
            
            if (iter < maxIter) {
                const charIndex = Math.floor((iter / maxIter) * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
        }
    }
};

// Scene 56: Liquid Crystal
CLIFTScenes[56] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.3);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Multiple layers of motion
            const flow1 = Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 - t);
            const flow2 = Math.sin((x + y) * 0.05 + t * 0.7) * Math.cos((x - y) * 0.05 - t * 0.7);
            const flow3 = Math.sin(Math.sqrt(x * x + y * y) * 0.1 + t * 1.3);
            
            // Audio modulation
            const audioIndex = Math.floor(((x + y) / (width + height)) * audio.length);
            const audioValue = audio[audioIndex % audio.length] || 0.3;
            
            const combined = (flow1 + flow2 + flow3) / 3 * (0.5 + audioValue);
            const normalized = (combined + 1) / 2;
            
            const charIndex = Math.floor(normalized * (chars.length - 1));
            buffer[y][x] = chars[Math.max(0, Math.min(charIndex, chars.length - 1))];
        }
    }
};

// Scene 57: Dimensional Portal
CLIFTScenes[57] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = (y - centerY) * 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Portal effect
            const twist = angle + dist * 0.1 - t * 2;
            const pulse = Math.sin(dist * 0.2 - t * 5) * avgAudio;
            
            // Dimensional warping
            const warpX = dx + Math.sin(twist) * 10 * pulse;
            const warpY = dy + Math.cos(twist) * 10 * pulse;
            const warpDist = Math.sqrt(warpX * warpX + warpY * warpY);
            
            // Create portal layers
            const layer1 = Math.sin(warpDist * 0.1 + t);
            const layer2 = Math.cos(angle * 3 + t * 2);
            const layer3 = Math.sin(twist * 2);
            
            const value = (layer1 + layer2 + layer3) / 3;
            const intensity = (value + 1) / 2 * (1 - dist / Math.min(width, height));
            
            if (intensity > 0.1) {
                const charIndex = Math.floor(intensity * (chars.length - 1));
                buffer[y][x] = chars[Math.min(charIndex, chars.length - 1)];
            }
        }
    }
};

// Scene 58: Neural Network
CLIFTScenes[58] = function(buffer, width, height, time, params) {
    if (!params._neurons) {
        params._neurons = [];
        // Create neurons
        for (let i = 0; i < 20; i++) {
            params._neurons.push({
                x: Math.random() * width,
                y: Math.random() * height,
                activation: Math.random(),
                connections: []
            });
        }
        
        // Create connections
        params._neurons.forEach((neuron, i) => {
            const numConnections = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numConnections; j++) {
                const target = Math.floor(Math.random() * params._neurons.length);
                if (target !== i) {
                    neuron.connections.push(target);
                }
            }
        });
    }
    
    const neurons = params._neurons;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    const t = time * 0.001;
    
    // Update neuron activations
    neurons.forEach((neuron, i) => {
        // Pulse activation
        neuron.activation = (Math.sin(t * 2 + i) + 1) / 2 * (0.5 + avgAudio);
        
        // Slowly move neurons
        neuron.x += Math.sin(t + i) * 0.2;
        neuron.y += Math.cos(t + i) * 0.1;
        
        // Wrap around
        if (neuron.x < 0) neuron.x = width;
        if (neuron.x > width) neuron.x = 0;
        if (neuron.y < 0) neuron.y = height;
        if (neuron.y > height) neuron.y = 0;
    });
    
    // Draw connections
    neurons.forEach((neuron, i) => {
        neuron.connections.forEach(targetIdx => {
            const target = neurons[targetIdx];
            const strength = (neuron.activation + target.activation) / 2;
            
            if (strength > 0.3) {
                drawLine(buffer, 
                    Math.floor(neuron.x), Math.floor(neuron.y),
                    Math.floor(target.x), Math.floor(target.y),
                    strength > 0.7 ? '=' : '-');
            }
        });
    });
    
    // Draw neurons
    neurons.forEach(neuron => {
        const x = Math.floor(neuron.x);
        const y = Math.floor(neuron.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (neuron.activation > 0.7) {
                buffer[y][x] = '@';
                // Draw activation aura
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const ax = x + dx;
                        const ay = y + dy;
                        if (ax >= 0 && ax < width && ay >= 0 && ay < height && buffer[ay][ax] === ' ') {
                            buffer[ay][ax] = '+';
                        }
                    }
                }
            } else if (neuron.activation > 0.3) {
                buffer[y][x] = 'o';
            } else {
                buffer[y][x] = '.';
            }
        }
    });
};

// Scene 59: Quantum Field
CLIFTScenes[59] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.2;
    
    // Quantum field parameters
    const wavelength = 10 + avgAudio * 20;
    const amplitude = 5 + avgAudio * 10;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Quantum probability waves
            const wave1 = Math.sin(x / wavelength + t) * Math.cos(y / wavelength - t);
            const wave2 = Math.sin((x + y) / wavelength * 0.7 + t * 1.3);
            const wave3 = Math.cos(Math.sqrt((x - width/2) * (x - width/2) + 
                                           (y - height/2) * (y - height/2)) / wavelength + t);
            
            // Interference pattern
            const interference = wave1 * wave2 * wave3;
            
            // Uncertainty principle visualization
            const uncertainty = Math.random() * 0.2 * avgAudio;
            
            const value = Math.abs(interference + uncertainty);
            const normalized = Math.min(value * amplitude, 1);
            
            if (normalized > 0.1) {
                const charIndex = Math.floor(normalized * (chars.length - 1));
                buffer[y][x] = chars[charIndex];
            }
            
            // Quantum tunneling effect
            if (Math.random() < 0.001 * avgAudio && buffer[y][x] === ' ') {
                buffer[y][x] = '*';
            }
        }
    }
};
