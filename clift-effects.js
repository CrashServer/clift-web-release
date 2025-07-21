// CLIFT Web Effects - Post-processing effects for ASCII art

window.CLIFTEffects = {};

// Invert effect - inverts characters
CLIFTEffects.Invert = function(buffer, width, height, params) {
    const charMap = {
        ' ': '@', '@': ' ',
        '.': '#', '#': '.',
        '-': '=', '=': '-',
        ':': '*', '*': ':',
        '+': '-', '█': ' '
    };
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = buffer[y][x];
            buffer[y][x] = charMap[char] || char;
        }
    }
};

// Mirror effect - horizontal mirror
CLIFTEffects.Mirror = function(buffer, width, height, params) {
    for (let y = 0; y < height; y++) {
        const row = buffer[y].slice();
        for (let x = 0; x < width; x++) {
            buffer[y][x] = row[width - 1 - x];
        }
    }
};

// Rotate effect - 90 degree rotation
CLIFTEffects.Rotate = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    // Simple rotation (may distort on non-square canvas)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcX = Math.floor((y / height) * width);
            const srcY = Math.floor((1 - x / width) * height);
            
            if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
                buffer[y][x] = temp[srcY][srcX];
            }
        }
    }
};

// Zoom effect - magnifies center
CLIFTEffects.Zoom = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    const zoom = 1.5 + Math.sin(params.frame * 0.05) * 0.5;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = (x - centerX) / zoom;
            const dy = (y - centerY) / zoom;
            
            const srcX = Math.floor(centerX + dx);
            const srcY = Math.floor(centerY + dy);
            
            if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                buffer[y][x] = temp[srcY][srcX];
            } else {
                buffer[y][x] = ' ';
            }
        }
    }
};

// Pixelate effect - reduces resolution
CLIFTEffects.Pixelate = function(buffer, width, height, params) {
    const blockSize = 3;
    
    for (let by = 0; by < height; by += blockSize) {
        for (let bx = 0; bx < width; bx += blockSize) {
            // Find most common character in block
            const chars = {};
            let maxChar = ' ';
            let maxCount = 0;
            
            for (let y = by; y < Math.min(by + blockSize, height); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                    const char = buffer[y][x];
                    chars[char] = (chars[char] || 0) + 1;
                    if (chars[char] > maxCount) {
                        maxCount = chars[char];
                        maxChar = char;
                    }
                }
            }
            
            // Fill block with most common character
            for (let y = by; y < Math.min(by + blockSize, height); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                    buffer[y][x] = maxChar;
                }
            }
        }
    }
};

// Wave effect - sine wave distortion
CLIFTEffects.Wave = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const amplitude = 3;
    const frequency = 0.1;
    const phase = params.frame * 0.05;
    
    for (let y = 0; y < height; y++) {
        const offset = Math.floor(Math.sin(y * frequency + phase) * amplitude);
        
        for (let x = 0; x < width; x++) {
            const srcX = x - offset;
            
            if (srcX >= 0 && srcX < width) {
                buffer[y][x] = temp[y][srcX];
            } else {
                buffer[y][x] = ' ';
            }
        }
    }
};

// Ripple effect - circular waves from center
CLIFTEffects.Ripple = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    const time = params.frame * 0.1;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const offset = Math.sin(dist * 0.3 - time) * 2;
            const angle = Math.atan2(dy, dx);
            
            const srcX = Math.floor(centerX + (dist + offset) * Math.cos(angle));
            const srcY = Math.floor(centerY + (dist + offset) * Math.sin(angle));
            
            if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                buffer[y][x] = temp[srcY][srcX];
            } else {
                buffer[y][x] = ' ';
            }
        }
    }
};

// Glitch effect - random corruption
CLIFTEffects.Glitch = function(buffer, width, height, params) {
    const glitchChars = '▓▒░█▄▀■□▪▫◊○●◐◑';
    
    // Random horizontal tears
    if (Math.random() < 0.1) {
        const tearY = Math.floor(Math.random() * height);
        const tearHeight = Math.floor(Math.random() * 3) + 1;
        const shift = Math.floor(Math.random() * 10) - 5;
        
        for (let y = tearY; y < Math.min(tearY + tearHeight, height); y++) {
            const row = buffer[y].slice();
            for (let x = 0; x < width; x++) {
                const srcX = (x + shift + width) % width;
                buffer[y][x] = row[srcX];
            }
        }
    }
    
    // Random character corruption
    const corruptionRate = Math.sin(params.frame * 0.1) > 0.8 ? 0.05 : 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < corruptionRate) {
                buffer[y][x] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
        }
    }
};

// RGB Shift effect - simulates color channel separation
CLIFTEffects['RGB Shift'] = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const shift = Math.floor(Math.sin(params.frame * 0.05) * 2) + 2;
    const chars = ' .+#';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Simulate RGB channels with different characters
            let intensity = 0;
            
            // "Red" channel
            if (x - shift >= 0 && temp[y][x - shift] !== ' ') intensity++;
            
            // "Green" channel  
            if (temp[y][x] !== ' ') intensity++;
            
            // "Blue" channel
            if (x + shift < width && temp[y][x + shift] !== ' ') intensity++;
            
            buffer[y][x] = chars[Math.min(intensity, chars.length - 1)];
        }
    }
};

// Blur effect - simple box blur
CLIFTEffects.Blur = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const chars = ' .:-=+*#%@';
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let count = 0;
            let filled = 0;
            
            // Sample 3x3 kernel
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    count++;
                    if (temp[y + dy][x + dx] !== ' ') {
                        filled++;
                    }
                }
            }
            
            const intensity = filled / count;
            const charIndex = Math.floor(intensity * (chars.length - 1));
            buffer[y][x] = chars[charIndex];
        }
    }
};

// Edge detection effect
CLIFTEffects.Edge = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const center = temp[y][x] !== ' ' ? 1 : 0;
            
            // Check neighbors
            let edges = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const neighbor = temp[y + dy][x + dx] !== ' ' ? 1 : 0;
                    if (neighbor !== center) edges++;
                }
            }
            
            buffer[y][x] = edges > 0 ? '#' : ' ';
        }
    }
};

// RGB Shift effect - chromatic aberration simulation
CLIFTEffects['RGB Shift'] = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const shift = Math.floor(params.frame * 0.1) % 3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcX = Math.max(0, Math.min(width - 1, x + shift));
            if (shift === 0) {
                buffer[y][x] = temp[y][srcX];
            } else if (shift === 1) {
                buffer[y][x] = temp[y][Math.max(0, x - 1)];
            } else {
                buffer[y][x] = temp[y][Math.min(width - 1, x + 1)];
            }
        }
    }
};

// Glow effect - creates glowing character effect
CLIFTEffects.Glow = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const glowChars = {
        ' ': ' ',
        '·': '.',
        '░': '▒',
        '▒': '▓',
        '▓': '█',
        '█': '█'
    };
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = temp[y][x];
            
            // Apply glow to surrounding pixels
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        if (char !== ' ' && buffer[ny][nx] === ' ') {
                            buffer[ny][nx] = '·';
                        } else if (char !== ' ' && buffer[ny][nx] === '·') {
                            buffer[ny][nx] = '░';
                        }
                    }
                }
            }
            
            // Enhance original character
            buffer[y][x] = glowChars[char] || char;
        }
    }
};

// ASCII Gradient effect - converts characters to gradient
CLIFTEffects['ASCII Gradient'] = function(buffer, width, height, params) {
    const gradient = ' ·░▒▓█';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = buffer[y][x];
            let intensity = 0;
            
            // Map character to intensity
            switch (char) {
                case ' ': intensity = 0; break;
                case '·': case '.': intensity = 1; break;
                case '░': case '-': intensity = 2; break;
                case '▒': case '=': intensity = 3; break;
                case '▓': case '#': intensity = 4; break;
                case '█': case '@': intensity = 5; break;
                default: intensity = 2;
            }
            
            // Add position-based variation
            const positionFactor = Math.sin(x * 0.1 + y * 0.1 + params.frame * 0.05) * 0.5 + 0.5;
            intensity = Math.floor(intensity * positionFactor);
            intensity = Math.max(0, Math.min(5, intensity));
            
            buffer[y][x] = gradient[intensity];
        }
    }
};

// Scanlines effect - adds retro TV scanlines
CLIFTEffects.Scanlines = function(buffer, width, height, params) {
    const scanlineIntensity = Math.sin(params.frame * 0.1) * 0.3 + 0.7;
    
    for (let y = 0; y < height; y++) {
        if (y % 2 === 0) {
            // Even lines - apply scanline effect
            for (let x = 0; x < width; x++) {
                const char = buffer[y][x];
                if (char !== ' ') {
                    // Darken characters on scanlines
                    const darkChars = {
                        '█': '▓',
                        '▓': '▒',
                        '▒': '░',
                        '░': '·',
                        '·': ' '
                    };
                    
                    if (Math.random() < scanlineIntensity) {
                        buffer[y][x] = darkChars[char] || char;
                    }
                }
            }
        } else {
            // Odd lines - add horizontal line pattern
            for (let x = 0; x < width; x += 4) {
                if (x < width && buffer[y][x] === ' ') {
                    buffer[y][x] = '─';
                }
            }
        }
    }
};

// Chromatic effect - color separation simulation
CLIFTEffects.Chromatic = function(buffer, width, height, params) {
    const temp = [];
    for (let y = 0; y < height; y++) {
        temp[y] = buffer[y].slice();
    }
    
    const aberration = Math.floor(Math.sin(params.frame * 0.05) * 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Red channel (left shift)
            const redX = Math.max(0, x - aberration);
            // Green channel (no shift)
            const greenX = x;
            // Blue channel (right shift)
            const blueX = Math.min(width - 1, x + aberration);
            
            // Combine channels using character mixing
            const redChar = temp[y][redX];
            const greenChar = temp[y][greenX];
            const blueChar = temp[y][blueX];
            
            // Choose dominant character
            if (redChar !== ' ' && redChar !== greenChar) {
                buffer[y][x] = redChar;
            } else if (blueChar !== ' ' && blueChar !== greenChar) {
                buffer[y][x] = blueChar;
            } else {
                buffer[y][x] = greenChar;
            }
        }
    }
};

// Character Emission effect - characters emit particles
CLIFTEffects['Character Emission'] = function(buffer, width, height, params) {
    const emissionChars = ['·', '°', '˚', '∘', '○', '◦'];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = buffer[y][x];
            
            if (char !== ' ') {
                // Emit particles around non-space characters
                const emissionStrength = Math.sin(params.frame * 0.1 + x * 0.1 + y * 0.1) * 0.5 + 0.5;
                
                if (Math.random() < emissionStrength * 0.3) {
                    // Add emission particle nearby
                    const emitX = x + Math.floor(Math.random() * 6 - 3);
                    const emitY = y + Math.floor(Math.random() * 4 - 2);
                    
                    if (emitX >= 0 && emitX < width && emitY >= 0 && emitY < height) {
                        if (buffer[emitY][emitX] === ' ') {
                            const emitChar = emissionChars[Math.floor(Math.random() * emissionChars.length)];
                            buffer[emitY][emitX] = emitChar;
                        }
                    }
                }
            }
        }
    }
};