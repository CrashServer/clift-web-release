// CLIFT Shader-like Effects System
// Provides edge detection, emboss, motion blur, and other shader-like effects for ASCII art

window.CLIFTShaderEffects = {
    // Motion blur history buffer
    motionBlurHistory: [],
    maxHistoryFrames: 5,
    
    // Edge detection kernels
    kernels: {
        // Sobel edge detection
        sobelX: [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ],
        sobelY: [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ],
        
        // Laplacian edge detection
        laplacian: [
            [0, -1, 0],
            [-1, 4, -1],
            [0, -1, 0]
        ],
        
        // Emboss kernels
        embossNE: [
            [-2, -1, 0],
            [-1, 1, 1],
            [0, 1, 2]
        ],
        embossNW: [
            [0, -1, -2],
            [1, 1, -1],
            [2, 1, 0]
        ],
        
        // Blur kernel
        blur: [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ]
    },
    
    // Character sets for different intensities
    intensityChars: {
        // From darkest to brightest
        gradient: ' .:-=+*#%@',
        edges: ' .,;:clodxkO0KXN',
        emboss: ' ._-=+*#%@',
        blur: ' .:-=+*#%@█▓▒░'  // More visible blur characters
    },
    
    // Apply convolution kernel to buffer
    applyKernel: function(buffer, width, height, kernel, intensityMap = 'gradient') {
        const result = [];
        for (let y = 0; y < height; y++) {
            result[y] = new Array(width).fill(' ');
        }
        
        const kernelSize = kernel.length;
        const kernelOffset = Math.floor(kernelSize / 2);
        
        // Calculate kernel sum for normalization
        let kernelSum = 0;
        for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
                kernelSum += Math.abs(kernel[ky][kx]);
            }
        }
        if (kernelSum === 0) kernelSum = 1;
        
        const chars = this.intensityChars[intensityMap];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let value = 0;
                
                // Apply kernel
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const sourceY = y + ky - kernelOffset;
                        const sourceX = x + kx - kernelOffset;
                        
                        // Clamp to buffer bounds
                        const clampedY = Math.max(0, Math.min(height - 1, sourceY));
                        const clampedX = Math.max(0, Math.min(width - 1, sourceX));
                        
                        const char = buffer[clampedY][clampedX];
                        const intensity = this.charToIntensity(char);
                        
                        value += intensity * kernel[ky][kx];
                    }
                }
                
                // Normalize and map to character
                value = Math.abs(value) / kernelSum;
                value = Math.max(0, Math.min(1, value));
                
                const charIndex = Math.floor(value * (chars.length - 1));
                result[y][x] = chars[charIndex];
            }
        }
        
        return result;
    },
    
    // Convert character to intensity value (0-1)
    charToIntensity: function(char) {
        if (char === ' ') return 0;
        
        // ASCII value mapping
        const ascii = char.charCodeAt(0);
        
        // Special characters have higher intensity
        const specialChars = '█▓▒░#%@*+=:;.,-_';
        const specialIndex = specialChars.indexOf(char);
        if (specialIndex !== -1) {
            return (specialIndex + 1) / specialChars.length;
        }
        
        // Regular ASCII mapping
        return Math.min(1, (ascii - 32) / 95); // ASCII 32-127 range
    },
    
    // Store frame in motion blur history
    storeFrame: function(buffer, width, height) {
        // Create a copy of the buffer
        const frame = [];
        for (let y = 0; y < height; y++) {
            frame[y] = [...buffer[y]];
        }
        
        this.motionBlurHistory.push(frame);
        
        // Keep only recent frames
        if (this.motionBlurHistory.length > this.maxHistoryFrames) {
            this.motionBlurHistory.shift();
        }
    },
    
    // Shader-like effect implementations
    effects: {
        // Edge detection using Sobel operator
        edgeDetection: function(buffer, width, height, params = {}) {
            const { threshold = 0.3, style = 'sobel' } = params;
            
            let result;
            if (style === 'sobel') {
                // Apply Sobel X and Y kernels
                const edgeX = CLIFTShaderEffects.applyKernel(
                    buffer, width, height, CLIFTShaderEffects.kernels.sobelX, 'edges'
                );
                const edgeY = CLIFTShaderEffects.applyKernel(
                    buffer, width, height, CLIFTShaderEffects.kernels.sobelY, 'edges'
                );
                
                // Combine X and Y edges
                result = [];
                for (let y = 0; y < height; y++) {
                    result[y] = new Array(width);
                    for (let x = 0; x < width; x++) {
                        const intensityX = CLIFTShaderEffects.charToIntensity(edgeX[y][x]);
                        const intensityY = CLIFTShaderEffects.charToIntensity(edgeY[y][x]);
                        const combined = Math.sqrt(intensityX * intensityX + intensityY * intensityY);
                        
                        if (combined > threshold) {
                            const charIndex = Math.floor(combined * (CLIFTShaderEffects.intensityChars.edges.length - 1));
                            result[y][x] = CLIFTShaderEffects.intensityChars.edges[charIndex];
                        } else {
                            result[y][x] = ' ';
                        }
                    }
                }
            } else {
                // Laplacian edge detection
                result = CLIFTShaderEffects.applyKernel(
                    buffer, width, height, CLIFTShaderEffects.kernels.laplacian, 'edges'
                );
            }
            
            // Copy result back to buffer
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = result[y][x];
                }
            }
        },
        
        // Emboss effect
        emboss: function(buffer, width, height, params = {}) {
            const { direction = 'ne', strength = 1.0 } = params;
            
            let kernel;
            switch (direction) {
                case 'ne': kernel = CLIFTShaderEffects.kernels.embossNE; break;
                case 'nw': kernel = CLIFTShaderEffects.kernels.embossNW; break;
                default: kernel = CLIFTShaderEffects.kernels.embossNE; break;
            }
            
            const result = CLIFTShaderEffects.applyKernel(
                buffer, width, height, kernel, 'emboss'
            );
            
            // Apply strength and copy back
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let char = result[y][x];
                    if (char !== ' ' && strength !== 1.0) {
                        const intensity = CLIFTShaderEffects.charToIntensity(char) * strength;
                        const charIndex = Math.floor(intensity * (CLIFTShaderEffects.intensityChars.emboss.length - 1));
                        char = CLIFTShaderEffects.intensityChars.emboss[charIndex];
                    }
                    buffer[y][x] = char;
                }
            }
        },
        
        // Motion blur effect
        motionBlur: function(buffer, width, height, params = {}) {
            const { intensity = 0.7, trailLength = 3 } = params;
            
            // Store current frame
            CLIFTShaderEffects.storeFrame(buffer, width, height);
            
            // If we don't have enough history, just return
            if (CLIFTShaderEffects.motionBlurHistory.length < 2) {
                return;
            }
            
            // Blend recent frames
            const numFrames = Math.min(trailLength, CLIFTShaderEffects.motionBlurHistory.length);
            const chars = CLIFTShaderEffects.intensityChars.blur;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let totalIntensity = 0;
                    let maxIntensity = 0;
                    
                    // Sample from recent frames with decreasing weight
                    for (let i = 0; i < numFrames; i++) {
                        const frameIndex = CLIFTShaderEffects.motionBlurHistory.length - 1 - i;
                        const frame = CLIFTShaderEffects.motionBlurHistory[frameIndex];
                        const char = frame[y][x];
                        const frameIntensity = CLIFTShaderEffects.charToIntensity(char);
                        
                        // Exponential decay for older frames
                        const weight = Math.pow(intensity, i);
                        const weightedIntensity = frameIntensity * weight;
                        
                        totalIntensity += weightedIntensity;
                        maxIntensity = Math.max(maxIntensity, weightedIntensity);
                    }
                    
                    // Use the stronger of blended or max intensity
                    const finalIntensity = Math.max(totalIntensity / numFrames, maxIntensity);
                    
                    if (finalIntensity > 0.1) {
                        const charIndex = Math.floor(finalIntensity * (chars.length - 1));
                        buffer[y][x] = chars[charIndex];
                    } else {
                        buffer[y][x] = ' ';
                    }
                }
            }
        },
        
        // Sharpen effect
        sharpen: function(buffer, width, height, params = {}) {
            const { strength = 1.0 } = params;
            
            const sharpenKernel = [
                [0, -strength, 0],
                [-strength, 1 + 4 * strength, -strength],
                [0, -strength, 0]
            ];
            
            const result = CLIFTShaderEffects.applyKernel(
                buffer, width, height, sharpenKernel, 'gradient'
            );
            
            // Copy result back
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = result[y][x];
                }
            }
        },
        
        // Strong Gaussian blur approximation
        blur: function(buffer, width, height, params = {}) {
            const { amount = 3.0 } = params;
            
            // Create a stronger blur kernel
            const strongBlurKernel = [
                [1, 2, 3, 2, 1],
                [2, 4, 6, 4, 2],
                [3, 6, 9, 6, 3],
                [2, 4, 6, 4, 2],
                [1, 2, 3, 2, 1]
            ];
            
            // Apply multiple passes for stronger blur
            const passes = Math.floor(amount);
            let workingBuffer = buffer;
            
            for (let pass = 0; pass < passes; pass++) {
                // Normalize kernel
                const kernelSum = strongBlurKernel.reduce((sum, row) => 
                    sum + row.reduce((rowSum, val) => rowSum + val, 0), 0);
                
                const normalizedKernel = strongBlurKernel.map(row => 
                    row.map(val => val / kernelSum)
                );
                
                // Apply kernel with 5x5 convolution
                const result = [];
                for (let y = 0; y < height; y++) {
                    result[y] = new Array(width).fill(' ');
                }
                
                const kernelSize = normalizedKernel.length;
                const kernelOffset = Math.floor(kernelSize / 2);
                const chars = CLIFTShaderEffects.intensityChars.blur;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let totalIntensity = 0;
                        let totalWeight = 0;
                        
                        // Apply 5x5 kernel
                        for (let ky = 0; ky < kernelSize; ky++) {
                            for (let kx = 0; kx < kernelSize; kx++) {
                                const sourceY = y + ky - kernelOffset;
                                const sourceX = x + kx - kernelOffset;
                                
                                // Clamp to buffer bounds
                                const clampedY = Math.max(0, Math.min(height - 1, sourceY));
                                const clampedX = Math.max(0, Math.min(width - 1, sourceX));
                                
                                const char = workingBuffer[clampedY][clampedX];
                                const intensity = CLIFTShaderEffects.charToIntensity(char);
                                const weight = normalizedKernel[ky][kx];
                                
                                totalIntensity += intensity * weight;
                                totalWeight += weight;
                            }
                        }
                        
                        // Normalize and apply
                        let finalIntensity = totalWeight > 0 ? totalIntensity / totalWeight : 0;
                        
                        // Amplify the blur effect
                        finalIntensity = Math.pow(finalIntensity, 0.7); // Gamma correction for visibility
                        
                        const charIndex = Math.floor(finalIntensity * (chars.length - 1));
                        result[y][x] = chars[charIndex];
                    }
                }
                
                // Copy result back for next pass
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        workingBuffer[y][x] = result[y][x];
                    }
                }
            }
            
            // Copy final result back to original buffer
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = workingBuffer[y][x];
                }
            }
        },
        
        // Dither effect
        dither: function(buffer, width, height, params = {}) {
            const { threshold = 0.5, pattern = 'bayer' } = params;
            
            // Simple 2x2 Bayer dithering pattern
            const bayerMatrix = [
                [0, 2],
                [3, 1]
            ];
            
            const chars = CLIFTShaderEffects.intensityChars.gradient;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = buffer[y][x];
                    if (char === ' ') continue;
                    
                    let intensity = CLIFTShaderEffects.charToIntensity(char);
                    
                    // Apply dithering
                    if (pattern === 'bayer') {
                        const ditherValue = bayerMatrix[y % 2][x % 2] / 4.0;
                        intensity += (ditherValue - 0.5) * 0.2;
                    }
                    
                    // Threshold
                    intensity = intensity > threshold ? 1.0 : 0.0;
                    
                    const charIndex = Math.floor(intensity * (chars.length - 1));
                    buffer[y][x] = chars[charIndex];
                }
            }
        }
    }
};

// Add shader effects to the main effects system
if (typeof window.CLIFTEffects === 'undefined') {
    window.CLIFTEffects = {};
}

// Register shader effects
CLIFTEffects['Edge Detection'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFTShaderEffects.effects.edgeDetection(buffer, width, height, {
        threshold: 0.2 + audioIntensity * 0.3,
        style: Math.sin(time * 0.1) > 0 ? 'sobel' : 'laplacian'
    });
};

CLIFTEffects['Emboss'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFTShaderEffects.effects.emboss(buffer, width, height, {
        direction: Math.sin(time * 0.2) > 0 ? 'ne' : 'nw',
        strength: 0.8 + audioIntensity * 0.4
    });
};

CLIFTEffects['Motion Blur'] = function(buffer, width, height, params) {
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFTShaderEffects.effects.motionBlur(buffer, width, height, {
        intensity: 0.6 + audioIntensity * 0.3,
        trailLength: 4
    });
};

CLIFTEffects['Sharpen'] = function(buffer, width, height, params) {
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFTShaderEffects.effects.sharpen(buffer, width, height, {
        strength: 0.3 + audioIntensity * 0.2
    });
};

CLIFTEffects['ASCII Blur'] = function(buffer, width, height, params) {
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFTShaderEffects.effects.blur(buffer, width, height, {
        amount: 3.0 + audioIntensity * 2.0  // Much stronger blur
    });
};

CLIFTEffects['Dither'] = function(buffer, width, height, params) {
    const time = params.frame * 0.1;
    const audioIntensity = params.audio ? (params.audio.reduce((a, b) => a + b, 0) / params.audio.length) : 0.3;
    
    CLIFTShaderEffects.effects.dither(buffer, width, height, {
        threshold: 0.5 + Math.sin(time * 0.1) * 0.2 + audioIntensity * 0.1,
        pattern: 'bayer'
    });
};

console.log('CLIFT Shader Effects loaded - 6 new effects available');