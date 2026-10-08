// CLIFT scenes - category 1: Geometric Patterns

// ============================================
// CATEGORY 1: Geometric Patterns (10-19)
// ============================================

// Scene 10: HYPER-REACTIVE GEOMETRIC CUBE - Musical Structure Visualizer
CLIFTScenes[10] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const audioInfo = params.audioInfo;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.3, lowMid: 0.3, mid: 0.3, highMid: 0.3, treble: 0.3 };
    const advanced = audioInfo?.advanced || {};
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const energyMomentum = hyperReactive.energyMomentum || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const dropIntensity = hyperReactive.dropIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const rhythmicComplexity = hyperReactive.rhythmicComplexity || 0;
    const grooveStrength = hyperReactive.grooveStrength || 0;
    const harmonicStability = hyperReactive.harmonicStability || 0;
    const spectralEvolution = hyperReactive.spectralEvolution || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // ADAPTIVE CUBE PARAMETERS
    const baseSize = Math.min(width, height) / 4;
    const reactiveSize = baseSize * (1 + (bands.overall * 1.5) + (buildupIntensity * 2));
    const size = Math.min(baseSize * 3, reactiveSize);
    
    // Multi-axis rotation with audio reactivity
    const baseRotationX = time * 0.001;
    const baseRotationY = time * 0.0007;
    const baseRotationZ = time * 0.0005;
    
    // Energy momentum affects rotation speed
    const momentumMultiplier = 1 + (energyMomentum * 3);
    const complexityMultiplier = 1 + (rhythmicComplexity * 2);
    const grooveMultiplier = 1 + (grooveStrength * 1.5);
    
    const angleX = baseRotationX * momentumMultiplier * complexityMultiplier;
    const angleY = baseRotationY * momentumMultiplier * grooveMultiplier;
    const angleZ = baseRotationZ * (1 + spectralEvolution * 4);
    
    // Onset-driven rotation bursts
    const onsetRotationBoost = onsetStrength > 0.5 ? onsetStrength * Math.PI * 0.25 : 0;
    const finalAngleX = angleX + onsetRotationBoost;
    const finalAngleY = angleY + (onsetRotationBoost * 0.7);
    const finalAngleZ = angleZ + (onsetRotationBoost * 0.5);
    
    // Multi-cube system based on musical complexity
    const cubeCount = Math.max(1, Math.floor(1 + (rhythmicComplexity * 3) + (buildupIntensity * 2)));
    
    for (let cubeIndex = 0; cubeIndex < cubeCount; cubeIndex++) {
        const cubeOffset = cubeIndex * 0.3;
        const cubeSizeMultiplier = 1 - (cubeIndex * 0.2);
        const currentSize = size * cubeSizeMultiplier;
        
        // Frequency-specific cube positioning
        const positionOffset = cubeIndex * (bands.overall * 10);
        const cubeX = centerX + Math.sin(time * 0.002 + cubeOffset) * positionOffset;
        const cubeY = centerY + Math.cos(time * 0.002 + cubeOffset) * positionOffset * 0.6;
        
        // Define cube vertices with audio-reactive scaling
        const baseVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        
        // Audio-reactive vertex distortion
        const vertices = baseVertices.map((v, index) => {
            const audioIndex = Math.floor((index / 8) * audio.length);
            const localAudio = audio[audioIndex];
            const distortion = localAudio * 0.3 + (onsetStrength * 0.5);
            
            return [
                v[0] * (1 + distortion * Math.sin(time * 0.003 + index)),
                v[1] * (1 + distortion * Math.cos(time * 0.003 + index)),
                v[2] * (1 + distortion * Math.sin(time * 0.004 + index))
            ];
        });
        
        // Define edges with audio-reactive emphasis
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Front face
            [4, 5], [5, 6], [6, 7], [7, 4], // Back face
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
        ];
        
        // Enhanced rotation with all three axes
        const projected = vertices.map(v => {
            let [x, y, z] = v;
            
            // Rotate around X axis
            let tempY = y * Math.cos(finalAngleX) - z * Math.sin(finalAngleX);
            let tempZ = y * Math.sin(finalAngleX) + z * Math.cos(finalAngleX);
            y = tempY;
            z = tempZ;
            
            // Rotate around Y axis
            let tempX = x * Math.cos(finalAngleY) + z * Math.sin(finalAngleY);
            tempZ = -x * Math.sin(finalAngleY) + z * Math.cos(finalAngleY);
            x = tempX;
            z = tempZ;
            
            // Rotate around Z axis (spectral evolution)
            tempX = x * Math.cos(finalAngleZ) - y * Math.sin(finalAngleZ);
            tempY = x * Math.sin(finalAngleZ) + y * Math.cos(finalAngleZ);
            x = tempX;
            y = tempY;
            
            // Project to 2D with audio-reactive perspective
            const perspective = 3 + (harmonicStability * 2);
            const scale = currentSize / (z + perspective);
            
            return [
                Math.floor(cubeX + x * scale),
                Math.floor(cubeY + y * scale),
                z // Keep Z for depth sorting
            ];
        });
        
        // Sort edges by depth for proper rendering
        const edgesWithDepth = edges.map(edge => {
            const [i, j] = edge;
            const avgZ = (projected[i][2] + projected[j][2]) / 2;
            return { edge, depth: avgZ };
        });
        edgesWithDepth.sort((a, b) => a.depth - b.depth);
        
        // Draw edges with audio-reactive styling
        edgesWithDepth.forEach(({ edge }, edgeIndex) => {
            const [i, j] = edge;
            const edgeIntensity = (edgeIndex / edges.length) + (bands.overall * 0.5);
            
            let edgeChar;
            if (onsetType === 'percussive' && beat.detected) {
                edgeChar = ['█', '▉', '▊', '▋'][Math.floor(Math.random() * 4)];
            } else if (onsetType === 'harmonic' && harmonicStability > 0.7) {
                edgeChar = ['═', '║', '╬', '╪'][Math.floor(edgeIntensity * 4)];
            } else if (climaxProbability > 0.8) {
                edgeChar = ['⚡', '※', '⁂', '✦'][Math.floor(Math.random() * 4)];
            } else if (buildupIntensity > 0.6) {
                edgeChar = ['╱', '╲', '╳', '╫'][Math.floor(edgeIntensity * 4)];
            } else if (dropIntensity > 0.5) {
                edgeChar = ['▼', '▽', '⯇', '⊽'][Math.floor(Math.random() * 4)];
            } else {
                // Standard edge characters with intensity
                if (edgeIntensity > 0.8) edgeChar = '█';
                else if (edgeIntensity > 0.6) edgeChar = '▓';
                else if (edgeIntensity > 0.4) edgeChar = '▒';
                else if (edgeIntensity > 0.2) edgeChar = '░';
                else edgeChar = cubeIndex === 0 ? '#' : ':';
            }
            
            drawLine(buffer, projected[i][0], projected[i][1], 
                    projected[j][0], projected[j][1], edgeChar);
        });
        
        // Draw vertices with enhanced audio reactivity
        projected.forEach((p, vertexIndex) => {
            if (p[0] >= 0 && p[0] < width && p[1] >= 0 && p[1] < height) {
                const audioIndex = Math.floor((vertexIndex / 8) * audio.length);
                const vertexIntensity = audio[audioIndex] + (bands.overall * 0.3);
                
                let vertexChar;
                if (beat.detected && beat.intensity > 0.7) {
                    vertexChar = ['●', '◉', '⚫', '⚪'][Math.floor(Math.random() * 4)];
                } else if (onsetStrength > 0.6) {
                    vertexChar = ['◆', '◇', '⬢', '⬣'][Math.floor(vertexIntensity * 4)];
                } else if (vertexIntensity > 0.7) {
                    vertexChar = '@';
                } else if (vertexIntensity > 0.5) {
                    vertexChar = '●';
                } else if (vertexIntensity > 0.3) {
                    vertexChar = '○';
                } else {
                    vertexChar = cubeIndex === 0 ? '@' : '·';
                }
                
                buffer[p[1]][p[0]] = vertexChar;
            }
        });
    }
    
    // Musical structure visualization overlay
    // Buildup: ascending triangular indicators
    if (buildupIntensity > 0.4) {
        const buildupHeight = Math.floor(buildupIntensity * height * 0.3);
        for (let i = 0; i < buildupHeight; i++) {
            const x = Math.floor(centerX + (i - buildupHeight/2));
            const y = height - 1 - i;
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '▲';
            }
        }
    }
    
    // Drop: explosive burst from center
    if (dropIntensity > 0.5) {
        const burstRadius = Math.floor(dropIntensity * 15);
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            for (let r = 0; r < burstRadius; r += 2) {
                const x = Math.floor(centerX + Math.cos(angle) * r);
                const y = Math.floor(centerY + Math.sin(angle) * r * 0.6);
                if (x >= 0 && x < width && y >= 0 && y < height && Math.random() < dropIntensity) {
                    buffer[y][x] = ['*', '✦', '⚡', '※'][Math.floor(Math.random() * 4)];
                }
            }
        }
    }
    
    // Climax: screen-wide energy field
    if (climaxProbability > 0.8) {
        const fieldDensity = (climaxProbability - 0.7) * 50;
        for (let i = 0; i < fieldDensity; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (buffer[y][x] === ' ') {
                const climaxChars = ['✧', '⋆', '✱', '※', '⁂'];
                buffer[y][x] = climaxChars[Math.floor(Math.random() * climaxChars.length)];
            }
        }
    }
};

// Scene 11: Fractal Tree
CLIFTScenes[11] = function(buffer, width, height, time, params) {
    const t = time * 0.0005;
    
    function drawBranch(x, y, angle, length, depth) {
        if (depth <= 0 || length < 1) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        drawLine(buffer, Math.floor(x), Math.floor(y), 
                Math.floor(endX), Math.floor(endY), 
                depth > 3 ? '#' : (depth > 1 ? '+' : '.'));
        
        // Recursive branches
        const angleVariation = Math.sin(t + depth) * 0.5;
        drawBranch(endX, endY, angle - 0.4 + angleVariation, length * 0.7, depth - 1);
        drawBranch(endX, endY, angle + 0.4 + angleVariation, length * 0.7, depth - 1);
    }
    
    // Draw tree
    const startX = width / 2;
    const startY = height - 1;
    drawBranch(startX, startY, -Math.PI / 2, height / 3, 8);
};

// Scene 12: Plasma Effect
CLIFTScenes[12] = function(buffer, width, height, time, params) {
    const chars = ' .:-=+*#%@';
    const t = time * 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = 
                Math.sin(x / 10.0 + t) +
                Math.sin(y / 8.0 + t * 1.5) +
                Math.sin((x + y) / 12.0 + t * 0.5) +
                Math.sin(Math.sqrt(x * x + y * y) / 8.0);
                
            const index = Math.floor((value + 4) / 8 * chars.length);
            buffer[y][x] = chars[Math.max(0, Math.min(chars.length - 1, index))];
        }
    }
};

// Scene 13: Spirograph
CLIFTScenes[13] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    const R = Math.min(width, height) / 3;
    const r = R / 3;
    const d = R / 2;
    
    for (let angle = 0; angle < Math.PI * 20; angle += 0.05) {
        const x = (R - r) * Math.cos(angle + t) + d * Math.cos((R - r) / r * angle + t);
        const y = (R - r) * Math.sin(angle + t) - d * Math.sin((R - r) / r * angle + t);
        
        const px = Math.floor(centerX + x);
        const py = Math.floor(centerY + y * 0.5);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = '#';
        }
    }
};

// Scene 14: Grid Deformation
CLIFTScenes[14] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const gridSize = 4;
    
    for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
            // Calculate deformation
            const dx = Math.sin(y * 0.1 + t) * 3;
            const dy = Math.cos(x * 0.1 + t) * 2;
            
            const newX = Math.floor(x + dx);
            const newY = Math.floor(y + dy);
            
            // Draw grid point
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                buffer[newY][newX] = '+';
                
                // Connect to neighbors
                if (x + gridSize < width) {
                    const nextX = Math.floor(x + gridSize + Math.sin(y * 0.1 + t) * 3);
                    const nextY = Math.floor(y + Math.cos((x + gridSize) * 0.1 + t) * 2);
                    drawLine(buffer, newX, newY, nextX, nextY, '-');
                }
                if (y + gridSize < height) {
                    const nextX = Math.floor(x + Math.sin((y + gridSize) * 0.1 + t) * 3);
                    const nextY = Math.floor(y + gridSize + Math.cos(x * 0.1 + t) * 2);
                    drawLine(buffer, newX, newY, nextX, nextY, '|');
                }
            }
        }
    }
};

// Scene 15: HYPER-REACTIVE SIERPINSKI TRIANGLE - Fractal Music Visualizer
CLIFTScenes[15] = function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const audioInfo = params.audioInfo;
    
    // Extract hyper-reactive features
    const bands = audioInfo?.bands || { bass: 0.3, lowMid: 0.3, mid: 0.3, highMid: 0.3, treble: 0.3 };
    const hyperReactive = audioInfo?.hyperReactive || {};
    const beat = audioInfo?.beat || { detected: false, intensity: 0 };
    
    // HYPER-REACTIVE PARAMETERS
    const rhythmicComplexity = hyperReactive.rhythmicComplexity || 0;
    const harmonicStability = hyperReactive.harmonicStability || 0;
    const buildupIntensity = hyperReactive.buildupIntensity || 0;
    const climaxProbability = hyperReactive.climaxProbability || 0;
    const complexityIndex = hyperReactive.complexityIndex || 0;
    const onsetStrength = hyperReactive.onsetStrength || 0;
    const spectralEvolution = hyperReactive.spectralEvolution || 0;
    const onsetType = hyperReactive.onsetType || 'unknown';
    
    // ADAPTIVE FRACTAL PARAMETERS
    const baseSize = Math.min(width, height) - 4;
    const reactiveSize = baseSize * (1 + (bands.overall * 0.5) + (buildupIntensity * 0.8));
    const size = Math.min(baseSize * 1.5, Math.floor(reactiveSize));
    const offsetX = (width - size) / 2;
    const offsetY = 2;
    
    // Multi-scale fractal system based on complexity
    const fractalLevels = Math.max(1, Math.floor(1 + (complexityIndex * 3) + (rhythmicComplexity * 2)));
    
    for (let level = 0; level < fractalLevels; level++) {
        const levelSize = size * (1 - level * 0.2);
        const levelOffsetX = offsetX + (level * 5);
        const levelOffsetY = offsetY + (level * 3);
        
        // Frequency-band specific scaling for each level
        const bandIndex = level % 5;
        const bandValues = [bands.bass, bands.lowMid, bands.mid, bands.highMid, bands.treble];
        const levelIntensity = bandValues[bandIndex];
        
        // Dynamic iteration depth based on audio complexity
        const maxIterations = Math.floor(levelSize * (0.5 + levelIntensity + (complexityIndex * 0.5)));
        
        for (let y = 0; y < maxIterations && y < height - levelOffsetY; y++) {
            for (let x = 0; x <= y && x < levelSize; x++) {
                // Enhanced Sierpinski condition with audio modulation
                const sierpinskiCondition = (x & y) === x;
                const audioMod = y < audio.length ? audio[y] : audio[y % audio.length];
                const audioCondition = audioMod > (0.3 - levelIntensity * 0.2);
                
                if (sierpinskiCondition && audioCondition) {
                    const px = Math.floor(levelOffsetX + (levelSize / 2) - y / 2 + x);
                    const py = levelOffsetY + y;
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        let char;
                        
                        // Character selection based on musical characteristics
                        const position = (x + y) / Math.max(1, levelSize + y);
                        const audioIntensity = audioMod + levelIntensity;
                        
                        if (climaxProbability > 0.8 && Math.random() < climaxProbability - 0.7) {
                            // Climax explosion characters
                            const climaxChars = ['⚡', '✦', '※', '⁂', '⋆'];
                            char = climaxChars[Math.floor(Math.random() * climaxChars.length)];
                        } else if (onsetType === 'percussive' && beat.detected) {
                            // Percussive beat characters
                            const percChars = ['█', '▉', '▊', '▋', '■', '●'];
                            char = percChars[Math.floor(audioIntensity * (percChars.length - 1))];
                        } else if (onsetType === 'harmonic' && harmonicStability > 0.7) {
                            // Harmonic structure characters
                            const harmChars = ['◆', '◇', '⬢', '⬣', '♦', '♢'];
                            char = harmChars[Math.floor(position * (harmChars.length - 1))];
                        } else if (buildupIntensity > 0.5) {
                            // Buildup intensity scaling
                            const buildupChars = ['▲', '△', '⯅', '▴', '▵'];
                            char = buildupChars[Math.floor(buildupIntensity * (buildupChars.length - 1))];
                        } else if (rhythmicComplexity > 0.6) {
                            // Complex rhythmic patterns
                            const complexChars = ['╱', '╲', '╳', '╫', '╪', '╬'];
                            char = complexChars[Math.floor((x * y + level) % complexChars.length)];
                        } else {
                            // Standard intensity-based characters
                            if (audioIntensity > 0.8) char = '█';
                            else if (audioIntensity > 0.6) char = '▓';
                            else if (audioIntensity > 0.4) char = '▒';
                            else if (audioIntensity > 0.2) char = '░';
                            else char = level === 0 ? '#' : ':';
                        }
                        
                        // Spectral evolution effects
                        if (spectralEvolution > 0.5 && Math.random() < spectralEvolution - 0.4) {
                            const evolutionChars = ['~', '≈', '≋', '∼', '⩰'];
                            char = evolutionChars[Math.floor(Math.random() * evolutionChars.length)];
                        }
                        
                        buffer[py][px] = char;
                        
                        // Onset-triggered particle emissions
                        if (onsetStrength > 0.6 && Math.random() < (onsetStrength - 0.5) * 2) {
                            const particleOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]];
                            const offset = particleOffsets[Math.floor(Math.random() * particleOffsets.length)];
                            const particleX = px + offset[0];
                            const particleY = py + offset[1];
                            
                            if (particleX >= 0 && particleX < width && particleY >= 0 && particleY < height) {
                                const particleChars = ['·', '◦', '∘', '⚬', '⚭'];
                                buffer[particleY][particleX] = particleChars[Math.floor(Math.random() * particleChars.length)];
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Musical structure overlays
    // Harmonic resonance field
    if (harmonicStability > 0.8) {
        const resonanceLines = Math.floor((harmonicStability - 0.7) * 20);
        for (let i = 0; i < resonanceLines; i++) {
            const lineY = Math.floor((i / resonanceLines) * height);
            for (let x = 0; x < width; x += 3) {
                if (buffer[lineY] && buffer[lineY][x] === ' ') {
                    buffer[lineY][x] = '─';
                }
            }
        }
    }
    
    // Complexity explosion overlay
    if (complexityIndex > 0.8) {
        const explosionCount = Math.floor((complexityIndex - 0.7) * 15);
        for (let i = 0; i < explosionCount; i++) {
            const centerX = Math.floor(Math.random() * width);
            const centerY = Math.floor(Math.random() * height);
            const radius = Math.floor(complexityIndex * 6);
            
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                for (let r = 1; r <= radius; r++) {
                    const x = Math.floor(centerX + Math.cos(angle) * r);
                    const y = Math.floor(centerY + Math.sin(angle) * r * 0.6);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height && 
                        buffer[y][x] === ' ' && Math.random() < complexityIndex - 0.7) {
                        const explosionChars = ['*', '×', '+', '⋆', '✦'];
                        buffer[y][x] = explosionChars[Math.floor(Math.random() * explosionChars.length)];
                    }
                }
            }
        }
    }
    
    // Beat pulse borders
    if (beat.detected && beat.intensity > 0.5) {
        const pulseIntensity = beat.intensity;
        const borderChar = pulseIntensity > 0.8 ? '═' : '─';
        
        // Top and bottom borders
        for (let x = 0; x < width; x += 2) {
            if (Math.random() < pulseIntensity) {
                if (buffer[0]) buffer[0][x] = borderChar;
                if (buffer[height - 1]) buffer[height - 1][x] = borderChar;
            }
        }
        
        // Left and right borders
        for (let y = 0; y < height; y += 2) {
            if (Math.random() < pulseIntensity) {
                if (buffer[y]) {
                    buffer[y][0] = '║';
                    buffer[y][width - 1] = '║';
                }
            }
        }
    }
};

// Scene 16: Lissajous Curves
CLIFTScenes[16] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    const a = 3 + Math.sin(t * 0.1);
    const b = 4 + Math.cos(t * 0.1);
    const delta = t;
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
        const x = Math.sin(a * angle + delta) * (width / 2 - 2);
        const y = Math.sin(b * angle) * (height / 2 - 2);
        
        const px = Math.floor(centerX + x);
        const py = Math.floor(centerY + y);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = '@';
        }
    }
};

// Scene 17: Pentagon Star
CLIFTScenes[17] = function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 2;
    const t = time * 0.001;
    
    // Draw multiple rotating pentagons
    for (let p = 0; p < 5; p++) {
        const offset = (p / 5) * Math.PI * 2;
        const points = [];
        
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + t + offset;
            const r = radius * (0.3 + p * 0.15);
            points.push([
                Math.floor(centerX + Math.cos(angle) * r),
                Math.floor(centerY + Math.sin(angle) * r * 0.8)
            ]);
        }
        
        // Connect points to form star
        for (let i = 0; i < 5; i++) {
            drawLine(buffer, points[i][0], points[i][1], 
                    points[(i + 2) % 5][0], points[(i + 2) % 5][1], 
                    p === 0 ? '@' : (p < 3 ? '#' : '+'));
        }
    }
};

// Scene 18: Hexagonal Grid
CLIFTScenes[18] = function(buffer, width, height, time, params) {
    const hexSize = 4;
    const t = time * 0.001;
    
    for (let row = 0; row < height / (hexSize * 1.5); row++) {
        for (let col = 0; col < width / (hexSize * 2); col++) {
            const x = col * hexSize * 2 + (row % 2) * hexSize;
            const y = row * hexSize * 1.5;
            
            // Pulsing based on distance from center
            const dx = x - width / 2;
            const dy = y - height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pulse = Math.sin(dist * 0.1 - t * 3) > 0;
            
            if (pulse) {
                // Draw hexagon
                const angles = [0, 60, 120, 180, 240, 300].map(a => a * Math.PI / 180);
                for (let i = 0; i < 6; i++) {
                    const x1 = Math.floor(x + Math.cos(angles[i]) * hexSize);
                    const y1 = Math.floor(y + Math.sin(angles[i]) * hexSize * 0.6);
                    const x2 = Math.floor(x + Math.cos(angles[(i + 1) % 6]) * hexSize);
                    const y2 = Math.floor(y + Math.sin(angles[(i + 1) % 6]) * hexSize * 0.6);
                    
                    drawLine(buffer, x1, y1, x2, y2, '#');
                }
            }
        }
    }
};

// Scene 19: Moire Pattern
CLIFTScenes[19] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const chars = ' .:-=+*#%@';
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Two overlapping circular patterns
            const dist1 = Math.sqrt(Math.pow(x - width / 3, 2) + Math.pow(y - height / 2, 2));
            const dist2 = Math.sqrt(Math.pow(x - width * 2 / 3, 2) + Math.pow(y - height / 2, 2));
            
            const wave1 = Math.sin(dist1 * 0.5 - t) * 0.5 + 0.5;
            const wave2 = Math.sin(dist2 * 0.5 + t) * 0.5 + 0.5;
            
            const combined = (wave1 + wave2) / 2;
            const charIndex = Math.floor(combined * (chars.length - 1));
            
            buffer[y][x] = chars[charIndex];
        }
    }
};
