// CLIFT 3D ASCII Effects System
// Simplified and fixed 3D transformations for ASCII art

window.CLIFT3D = {
    // Character sets for different depths
    depthChars: {
        // From near to far
        getChar: (depth, originalChar) => {
            if (originalChar === ' ') return ' ';
            
            // Depth-based character intensity
            const chars = ' .:-=+*#%@█';
            const normalizedDepth = Math.max(0, Math.min(1, depth));
            const index = Math.floor(normalizedDepth * (chars.length - 1));
            return chars[index];
        }
    },
    
    // 3D effect processors
    effects: {
        // 3D Perspective effect
        perspective: function(buffer, width, height, params = {}) {
            const { rotationY = 0, rotationX = 0, translateZ = -2, time = 0 } = params;
            
            const newBuffer = [];
            for (let y = 0; y < height; y++) {
                newBuffer[y] = new Array(width).fill(' ');
            }
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = buffer[y][x];
                    if (char === ' ') continue;
                    
                    // Convert to 3D coordinates
                    let worldX = (x - centerX) / centerX;
                    let worldY = (y - centerY) / centerY;
                    let worldZ = 0;
                    
                    // Apply Y rotation
                    const cosY = Math.cos(rotationY);
                    const sinY = Math.sin(rotationY);
                    const newX = worldX * cosY - worldZ * sinY;
                    const newZ = worldX * sinY + worldZ * cosY;
                    worldX = newX;
                    worldZ = newZ;
                    
                    // Apply X rotation
                    const cosX = Math.cos(rotationX);
                    const sinX = Math.sin(rotationX);
                    const newY = worldY * cosX - worldZ * sinX;
                    worldZ = worldY * sinX + worldZ * cosX;
                    worldY = newY;
                    
                    // Apply translation
                    worldZ += translateZ;
                    
                    // Perspective projection
                    const distance = Math.max(0.1, Math.abs(worldZ));
                    const perspective = 2.0 / distance;
                    
                    const screenX = Math.floor(worldX * perspective * centerX + centerX);
                    const screenY = Math.floor(worldY * perspective * centerY + centerY);
                    
                    // Depth-based character
                    const depth = Math.max(0, Math.min(1, (worldZ + 3) / 6));
                    const depthChar = CLIFT3D.depthChars.getChar(1 - depth, char);
                    
                    if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
                        newBuffer[screenY][screenX] = depthChar;
                    }
                }
            }
            
            // Copy back
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = newBuffer[y][x];
                }
            }
        },
        
        // 3D Cylinder effect
        cylindrical: function(buffer, width, height, params = {}) {
            const { radius = 0.5, angle = 0, time = 0 } = params;
            
            const newBuffer = [];
            for (let y = 0; y < height; y++) {
                newBuffer[y] = new Array(width).fill(' ');
            }
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = buffer[y][x];
                    if (char === ' ') continue;
                    
                    // Map to cylinder coordinates
                    const u = ((x / width) * Math.PI * 2) + angle;
                    const v = (y - centerY) / centerY;
                    
                    // Calculate 3D position on cylinder
                    const worldX = Math.cos(u) * radius;
                    const worldY = v;
                    const worldZ = Math.sin(u) * radius;
                    
                    // Simple perspective
                    const distance = 2;
                    const perspective = distance / (distance + worldZ + 1);
                    
                    const screenX = Math.floor(worldX * perspective * centerX + centerX);
                    const screenY = Math.floor(worldY * perspective * centerY + centerY);
                    
                    // Depth character
                    const depth = (worldZ + radius) / (radius * 2);
                    const depthChar = CLIFT3D.depthChars.getChar(depth, char);
                    
                    if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
                        newBuffer[screenY][screenX] = depthChar;
                    }
                }
            }
            
            // Copy back
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = newBuffer[y][x];
                }
            }
        },
        
        // 3D Sphere effect
        spherical: function(buffer, width, height, params = {}) {
            const { radius = 0.8, rotationY = 0, rotationX = 0, time = 0 } = params;
            
            const newBuffer = [];
            for (let y = 0; y < height; y++) {
                newBuffer[y] = new Array(width).fill(' ');
            }
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = buffer[y][x];
                    if (char === ' ') continue;
                    
                    // Map to sphere coordinates
                    const u = ((x / width) * Math.PI * 2) + rotationY;
                    const v = ((y / height) * Math.PI) + rotationX;
                    
                    // Calculate 3D position on sphere
                    const worldX = Math.cos(u) * Math.sin(v) * radius;
                    const worldY = Math.cos(v) * radius;
                    const worldZ = Math.sin(u) * Math.sin(v) * radius;
                    
                    // Perspective projection
                    const distance = 2;
                    const perspective = distance / (distance + worldZ + 1);
                    
                    const screenX = Math.floor(worldX * perspective * centerX + centerX);
                    const screenY = Math.floor(worldY * perspective * centerY + centerY);
                    
                    // Depth character
                    const depth = (worldZ + radius) / (radius * 2);
                    const depthChar = CLIFT3D.depthChars.getChar(depth, char);
                    
                    if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
                        newBuffer[screenY][screenX] = depthChar;
                    }
                }
            }
            
            // Copy back
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = newBuffer[y][x];
                }
            }
        },
        
        // 3D Tunnel effect
        tunnel: function(buffer, width, height, params = {}) {
            const { depth = 3, twist = 0, time = 0 } = params;
            
            const newBuffer = [];
            for (let y = 0; y < height; y++) {
                newBuffer[y] = new Array(width).fill(' ');
            }
            
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.min(centerX, centerY);
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = buffer[y][x];
                    if (char === ' ') continue;
                    
                    // Calculate distance from center
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    
                    // Avoid division by zero
                    if (dist < 0.1) {
                        newBuffer[y][x] = char;
                        continue;
                    }
                    
                    // Tunnel transformation
                    const tunnelRadius = depth / dist;
                    const tunnelAngle = angle + twist * tunnelRadius;
                    
                    // Map to new position with stronger effect
                    const newDist = dist * (1 + tunnelRadius * 0.5);
                    const newX = Math.floor(centerX + Math.cos(tunnelAngle) * newDist);
                    const newY = Math.floor(centerY + Math.sin(tunnelAngle) * newDist);
                    
                    // Depth-based character (closer to center = brighter)
                    const depthFactor = Math.max(0, Math.min(1, tunnelRadius));
                    const depthChar = CLIFT3D.depthChars.getChar(depthFactor, char);
                    
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        newBuffer[newY][newX] = depthChar;
                    }
                }
            }
            
            // Copy back
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = newBuffer[y][x];
                }
            }
        }
    }
};

// Add 3D effects to the main effects system
if (typeof window.CLIFTEffects === 'undefined') {
    window.CLIFTEffects = {};
}

// Register 3D effects with stronger parameters
CLIFTEffects['3D Perspective'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFT3D.effects.perspective(buffer, width, height, {
        rotationY: time * 0.8 + audioIntensity * 3,
        rotationX: Math.sin(time * 0.4) * 0.8 + audioIntensity * 0.8,
        translateZ: -1.5 - audioIntensity * 1.5,
        time: time
    });
};

CLIFTEffects['3D Cylinder'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFT3D.effects.cylindrical(buffer, width, height, {
        radius: 0.8 + audioIntensity * 0.4,
        angle: time * 0.5,
        time: time
    });
};

CLIFTEffects['3D Sphere'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFT3D.effects.spherical(buffer, width, height, {
        radius: 1.0 + audioIntensity * 0.3,
        rotationY: time * 0.6,
        rotationX: Math.sin(time * 0.3) * 0.5,
        time: time
    });
};

CLIFTEffects['3D Tunnel'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFT3D.effects.tunnel(buffer, width, height, {
        depth: 8 + audioIntensity * 15,
        twist: time * 0.3 + audioIntensity * 3,
        time: time
    });
};

console.log('CLIFT 3D Effects loaded - 4 new effects available (fixed)');