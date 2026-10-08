// CLIFT scenes - category 18: Audio Reactive Pro

// ============================================
// CATEGORY 18: Audio Reactive (180-189)
// ============================================

// Scene 180: Audio 3D Cubes
CLIFTScenes[180] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Cubes that react to audio frequencies
    for (let cube = 0; cube < 6; cube++) {
        const cubeX = Math.floor(width * cube / 6) + 4;
        const cubeY = Math.floor(height / 2);
        const audioMod = audio[cube * 10 % audio.length] || 0;
        const cubeSize = Math.floor(2 + audioMod * 4);
        
        // Draw cube wireframe
        for (let face = 0; face < 2; face++) {
            const offset = face * 2;
            
            // Top and bottom lines
            for (let i = 0; i < cubeSize; i++) {
                if (cubeX + i + offset >= 0 && cubeX + i + offset < width) {
                    if (cubeY - cubeSize + offset >= 0 && cubeY - cubeSize + offset < height) {
                        buffer[cubeY - cubeSize + offset][cubeX + i + offset] = '─';
                    }
                    if (cubeY + cubeSize + offset >= 0 && cubeY + cubeSize + offset < height) {
                        buffer[cubeY + cubeSize + offset][cubeX + i + offset] = '─';
                    }
                }
            }
            
            // Side lines
            for (let i = 0; i < cubeSize * 2; i++) {
                if (cubeY - cubeSize + i + offset >= 0 && cubeY - cubeSize + i + offset < height) {
                    if (cubeX + offset >= 0 && cubeX + offset < width) {
                        buffer[cubeY - cubeSize + i + offset][cubeX + offset] = '│';
                    }
                    if (cubeX + cubeSize + offset >= 0 && cubeX + cubeSize + offset < width) {
                        buffer[cubeY - cubeSize + i + offset][cubeX + cubeSize + offset] = '│';
                    }
                }
            }
        }
        
        // Connection lines
        for (let i = 0; i < cubeSize; i++) {
            if (cubeX + i >= 0 && cubeX + i < width) {
                if (cubeY - cubeSize >= 0 && cubeY - cubeSize < height) {
                    buffer[cubeY - cubeSize][cubeX + i] = audioMod > 0.5 ? '╱' : '╲';
                }
                if (cubeY + cubeSize >= 0 && cubeY + cubeSize < height) {
                    buffer[cubeY + cubeSize][cubeX + i] = audioMod > 0.5 ? '╱' : '╲';
                }
            }
        }
    }
};

// Scene 181: Audio Strobes
CLIFTScenes[181] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    
    // Strobe effects synchronized to beats
    const strobeIntensity = beat * 0.5 + 0.5;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const audioMod = audio[x % audio.length] || 0;
            const strobe = Math.sin(t * 20 + x * 0.1 + y * 0.1) * 0.5 + 0.5;
            const combined = (strobe + audioMod + strobeIntensity) / 3;
            
            if (combined > 0.8) {
                buffer[y][x] = '█';
            } else if (combined > 0.6) {
                buffer[y][x] = '▓';
            } else if (combined > 0.4) {
                buffer[y][x] = '▒';
            } else if (combined > 0.2) {
                buffer[y][x] = '░';
            }
        }
    }
};

// Scene 182: Audio Explosions
CLIFTScenes[182] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Explosive effects triggered by audio
    for (let explosion = 0; explosion < 4; explosion++) {
        const audioMod = audio[explosion * 16 % audio.length] || 0;
        
        if (audioMod > 0.6) {
            const expX = Math.floor(width * (explosion + 1) / 5);
            const expY = Math.floor(height * 0.5);
            const radius = Math.floor(audioMod * 8);
            
            for (let angle = 0; angle < 16; angle++) {
                const radians = (angle / 16) * Math.PI * 2;
                const x = expX + Math.floor(Math.cos(radians) * radius);
                const y = expY + Math.floor(Math.sin(radians) * radius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '*';
                }
            }
            
            // Center blast
            if (expX >= 0 && expX < width && expY >= 0 && expY < height) {
                buffer[expY][expX] = audioMod > 0.8 ? '◉' : '○';
            }
        }
    }
};

// Scene 183: Audio Wave Tunnel
CLIFTScenes[183] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Tunnels that pulse with music
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            const audioIndex = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * audio.length);
            const audioMod = audio[audioIndex] || 0;
            
            const tunnelWave = Math.sin(distance * 0.5 - t * 5 + audioMod * 10) * 0.5 + 0.5;
            
            if (tunnelWave > 0.7) {
                buffer[y][x] = '█';
            } else if (tunnelWave > 0.5) {
                buffer[y][x] = '▓';
            } else if (tunnelWave > 0.3) {
                buffer[y][x] = '▒';
            } else if (tunnelWave > 0.1) {
                buffer[y][x] = '░';
            }
        }
    }
};

// Scene 184: Audio Spectrum 3D
CLIFTScenes[184] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // 3D frequency spectrum visualizations
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const depth = Math.sin(x * 0.1 + t) * 0.3 + 0.7;
        const barHeight = Math.floor(audioMod * height * depth);
        
        for (let y = 0; y < barHeight; y++) {
            const charY = height - 1 - y;
            const intensity = (y / barHeight) * depth;
            
            if (charY >= 0 && charY < height) {
                if (intensity > 0.8) {
                    buffer[charY][x] = '█';
                } else if (intensity > 0.6) {
                    buffer[charY][x] = '▓';
                } else if (intensity > 0.4) {
                    buffer[charY][x] = '▒';
                } else if (intensity > 0.2) {
                    buffer[charY][x] = '░';
                } else {
                    buffer[charY][x] = '·';
                }
            }
        }
        
        // 3D perspective lines
        if (x % 4 === 0) {
            const perspectiveY = Math.floor(height * 0.8 + Math.sin(x * 0.2 + t) * 2);
            if (perspectiveY >= 0 && perspectiveY < height) {
                buffer[perspectiveY][x] = '/';
            }
        }
    }
};

// Scene 185: Audio Particles
CLIFTScenes[185] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Particle systems driven by audio
    for (let particle = 0; particle < 50; particle++) {
        const audioMod = audio[particle % audio.length] || 0;
        
        if (audioMod > 0.2) {
            const particleAge = (t * 2 + particle * 0.1) % 10;
            const startX = Math.floor(width / 2);
            const startY = Math.floor(height / 2);
            
            const velocity = audioMod * 15;
            const angle = (particle / 50) * Math.PI * 2;
            
            const x = startX + Math.floor(Math.cos(angle) * velocity * particleAge);
            const y = startY + Math.floor(Math.sin(angle) * velocity * particleAge);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const life = 1 - (particleAge / 10);
                if (life > 0.7) {
                    buffer[y][x] = '●';
                } else if (life > 0.4) {
                    buffer[y][x] = '○';
                } else if (life > 0.1) {
                    buffer[y][x] = '·';
                }
            }
        }
    }
};

// Scene 186: Audio Pulse Rings
CLIFTScenes[186] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    const beat = params.beat;
    
    // Concentric rings pulsing to beats
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const maxRadius = Math.min(width, height) / 2;
    
    for (let ring = 0; ring < 8; ring++) {
        const audioMod = audio[ring * 8 % audio.length] || 0;
        const ringTime = t * 2 + ring * 0.5;
        const radius = (ringTime % 5) * maxRadius / 5;
        const intensity = audioMod * beat * (1 - (ringTime % 5) / 5);
        
        if (intensity > 0.2) {
            // Draw ring
            for (let angle = 0; angle < 32; angle++) {
                const radians = (angle / 32) * Math.PI * 2;
                const x = centerX + Math.floor(Math.cos(radians) * radius);
                const y = centerY + Math.floor(Math.sin(radians) * radius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (intensity > 0.6) {
                        buffer[y][x] = '○';
                    } else if (intensity > 0.4) {
                        buffer[y][x] = '◦';
                    } else {
                        buffer[y][x] = '·';
                    }
                }
            }
        }
    }
};

// Scene 187: Audio Waveform 3D
CLIFTScenes[187] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // 3D waveform representations
    for (let x = 0; x < width; x++) {
        const audioMod = audio[x % audio.length] || 0;
        const waveform = Math.sin(x * 0.2 + t * 3) * audioMod;
        const y = Math.floor(height / 2 + waveform * height * 0.3);
        
        if (y >= 0 && y < height) {
            buffer[y][x] = '~';
        }
        
        // 3D depth layers
        for (let depth = 1; depth <= 3; depth++) {
            const depthY = y + depth;
            const depthAudio = audioMod * (1 - depth * 0.2);
            
            if (depthY >= 0 && depthY < height && depthAudio > 0.3) {
                buffer[depthY][x] = depth === 1 ? '▒' : (depth === 2 ? '░' : '·');
            }
        }
    }
};

// Scene 188: Audio Matrix Grid
CLIFTScenes[188] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Grid patterns responding to audio
    for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 6) {
            const gridCell = Math.floor(x / 6) + Math.floor(y / 3);
            const audioMod = audio[gridCell % audio.length] || 0;
            
            if (audioMod > 0.3) {
                // Grid cell activation
                for (let dy = 0; dy < 3 && y + dy < height; dy++) {
                    for (let dx = 0; dx < 6 && x + dx < width; dx++) {
                        const cellIntensity = audioMod * (1 - (dx + dy) * 0.1);
                        
                        if (cellIntensity > 0.7) {
                            buffer[y + dy][x + dx] = '█';
                        } else if (cellIntensity > 0.5) {
                            buffer[y + dy][x + dx] = '▓';
                        } else if (cellIntensity > 0.3) {
                            buffer[y + dy][x + dx] = '▒';
                        }
                    }
                }
            }
            
            // Grid lines
            if (audioMod > 0.2) {
                for (let i = 0; i < 6 && x + i < width; i++) {
                    buffer[y][x + i] = '─';
                }
                for (let i = 0; i < 3 && y + i < height; i++) {
                    buffer[y + i][x] = '│';
                }
            }
        }
    }
};

// Scene 189: Audio Fractals
CLIFTScenes[189] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.2);
    
    // Fractal patterns driven by music
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = (x - centerX) * 0.1;
            const dy = (y - centerY) * 0.1;
            
            let zx = 0;
            let zy = 0;
            let iteration = 0;
            const maxIterations = 20;
            
            // Audio-modulated fractal parameters
            const audioIndex = Math.floor(((x + y) * 0.5) % audio.length);
            const audioMod = audio[audioIndex] || 0;
            const fractalTime = t * 0.5 + audioMod * 2;
            
            while (iteration < maxIterations && zx * zx + zy * zy < 4) {
                const tempX = zx * zx - zy * zy + dx + Math.sin(fractalTime) * 0.1;
                zy = 2 * zx * zy + dy + Math.cos(fractalTime) * 0.1;
                zx = tempX;
                iteration++;
            }
            
            const fractalValue = iteration / maxIterations;
            const audioFractal = fractalValue * (1 + audioMod);
            
            if (audioFractal > 0.8) {
                buffer[y][x] = '█';
            } else if (audioFractal > 0.6) {
                buffer[y][x] = '▓';
            } else if (audioFractal > 0.4) {
                buffer[y][x] = '▒';
            } else if (audioFractal > 0.2) {
                buffer[y][x] = '░';
            }
        }
    }
};
