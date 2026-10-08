// CLIFT scenes - category 11: Interactive & Responsive

// ============================================
// CATEGORY 11: Interactive & Responsive (110-119)
// ============================================

// Scene 110: Cursor Trails
CLIFTScenes[110] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate cursor movement (in real implementation, would track actual cursor)
    const cursorX = Math.floor(width / 2 + Math.sin(t) * width / 3);
    const cursorY = Math.floor(height / 2 + Math.cos(t * 0.7) * height / 3);
    
    // Trail particles
    const trailLength = 20 + audio[0] * 30;
    const trailChars = '·∙•○◉●◎◐◑◒◓';
    
    for (let i = 0; i < trailLength; i++) {
        const trailT = t - i * 0.05;
        const tx = Math.floor(width / 2 + Math.sin(trailT) * width / 3);
        const ty = Math.floor(height / 2 + Math.cos(trailT * 0.7) * height / 3);
        
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            const charIndex = Math.floor((i / trailLength) * (trailChars.length - 1));
            buffer[ty][tx] = trailChars[trailChars.length - 1 - charIndex];
            
            // Particle effects around trail
            if (audio[i % audio.length] > 0.6) {
                for (let p = 0; p < 3; p++) {
                    const px = tx + Math.floor((Math.random() - 0.5) * 5);
                    const py = ty + Math.floor((Math.random() - 0.5) * 3);
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = '°';
                    }
                }
            }
        }
    }
    
    // Cursor representation
    if (cursorX >= 0 && cursorX < width && cursorY >= 0 && cursorY < height) {
        buffer[cursorY][cursorX] = '⊕';
        
        // Cursor aura
        const auraSize = 2 + Math.floor(audio[32] * 3);
        for (let dy = -auraSize; dy <= auraSize; dy++) {
            for (let dx = -auraSize; dx <= auraSize; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 1 && dist <= auraSize) {
                    const ax = cursorX + dx;
                    const ay = cursorY + dy;
                    
                    if (ax >= 0 && ax < width && ay >= 0 && ay < height && buffer[ay][ax] === ' ') {
                        const auraChars = '░▒▓';
                        const auraIndex = Math.floor((dist / auraSize) * (auraChars.length - 1));
                        buffer[ay][ax] = auraChars[auraChars.length - 1 - auraIndex];
                    }
                }
            }
        }
    }
};

// Scene 111: Touch Ripples
CLIFTScenes[111] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const bass = params.audio ? params.audio[0] : 0.5;
    
    // Simulate touch points
    const touches = [];
    for (let i = 0; i < 3 + Math.floor(bass * 2); i++) {
        touches.push({
            x: Math.floor(width / 2 + Math.sin(t * (i + 1) * 0.3) * width / 3),
            y: Math.floor(height / 2 + Math.cos(t * (i + 1) * 0.4) * height / 3),
            age: (t * (i + 1)) % 3
        });
    }
    
    // Create ripples from each touch
    touches.forEach(touch => {
        const maxRadius = 15;
        
        for (let radius = 0; radius < maxRadius; radius++) {
            const waveOffset = touch.age * 5;
            const currentRadius = (waveOffset + radius) % maxRadius;
            
            if (currentRadius > 0) {
                // Draw circle
                for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                    const x = Math.floor(touch.x + Math.cos(angle) * currentRadius);
                    const y = Math.floor(touch.y + Math.sin(angle) * currentRadius * 0.5); // Elliptical
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const intensity = 1 - (currentRadius / maxRadius);
                        const waveChars = ' .·:;≈~～';
                        const charIndex = Math.floor(intensity * (waveChars.length - 1));
                        
                        if (buffer[y][x] === ' ' || charIndex > 3) {
                            buffer[y][x] = waveChars[charIndex];
                        }
                    }
                }
            }
        }
        
        // Touch point center
        if (touch.x >= 0 && touch.x < width && touch.y >= 0 && touch.y < height) {
            buffer[touch.y][touch.x] = '◉';
        }
    });
    
    // Interference patterns where ripples meet
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let waveSum = 0;
            
            touches.forEach(touch => {
                const dist = Math.sqrt((x - touch.x) ** 2 + (y - touch.y) ** 2);
                const wave = Math.sin(dist * 0.5 - touch.age * 5) * Math.exp(-dist * 0.1);
                waveSum += wave;
            });
            
            if (Math.abs(waveSum) > 1.5) {
                buffer[y][x] = '▓';
            }
        }
    }
};

// Scene 112: Gesture Recognition
CLIFTScenes[112] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate different gestures
    const gestureType = Math.floor(t / 3) % 5;
    const gestureProgress = (t % 3) / 3;
    
    // Clear with background pattern
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.02) {
                buffer[y][x] = '·';
            }
        }
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    switch (gestureType) {
        case 0: // Swipe right
            for (let i = 0; i < 30; i++) {
                const x = Math.floor(gestureProgress * width + i - 30);
                const y = Math.floor(centerY + Math.sin(i * 0.3) * 2);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const chars = '→═══▶';
                    const charIndex = Math.floor(i / 30 * (chars.length - 1));
                    buffer[y][x] = chars[charIndex];
                }
            }
            
            // Gesture name
            const swipeText = "SWIPE →";
            for (let i = 0; i < swipeText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = swipeText[i];
                }
            }
            break;
            
        case 1: // Pinch
            const pinchRadius = 10 * (1 - gestureProgress);
            
            // Two points moving together
            const p1x = Math.floor(centerX - pinchRadius);
            const p1y = Math.floor(centerY);
            const p2x = Math.floor(centerX + pinchRadius);
            const p2y = Math.floor(centerY);
            
            // Draw pinch points
            if (p1x >= 0 && p1x < width && p1y >= 0 && p1y < height) {
                buffer[p1y][p1x] = '◄';
            }
            if (p2x >= 0 && p2x < width && p2y >= 0 && p2y < height) {
                buffer[p2y][p2x] = '►';
            }
            
            // Connection lines
            for (let x = p1x + 1; x < p2x; x++) {
                if (x >= 0 && x < width) {
                    buffer[centerY][x] = '─';
                }
            }
            
            const pinchText = "PINCH ◄►";
            for (let i = 0; i < pinchText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = pinchText[i];
                }
            }
            break;
            
        case 2: // Rotate
            const rotateAngle = gestureProgress * Math.PI * 2;
            const rotateRadius = 8;
            
            // Draw rotating arrows
            for (let i = 0; i < 8; i++) {
                const angle = rotateAngle + (i / 8) * Math.PI * 2;
                const x = Math.floor(centerX + Math.cos(angle) * rotateRadius);
                const y = Math.floor(centerY + Math.sin(angle) * rotateRadius);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const arrowChars = '↑↗→↘↓↙←↖';
                    buffer[y][x] = arrowChars[i % arrowChars.length];
                }
            }
            
            // Center pivot
            buffer[Math.floor(centerY)][Math.floor(centerX)] = '⊕';
            
            const rotateText = "ROTATE ↻";
            for (let i = 0; i < rotateText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = rotateText[i];
                }
            }
            break;
            
        case 3: // Tap
            const tapScale = Math.sin(gestureProgress * Math.PI);
            const tapRadius = Math.floor(tapScale * 5);
            
            // Expanding circles
            for (let r = 0; r <= tapRadius; r++) {
                for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                    const x = Math.floor(centerX + Math.cos(angle) * r);
                    const y = Math.floor(centerY + Math.sin(angle) * r);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = r === tapRadius ? '○' : '·';
                    }
                }
            }
            
            // Tap center
            buffer[Math.floor(centerY)][Math.floor(centerX)] = '⊙';
            
            const tapText = "TAP ⊙";
            for (let i = 0; i < tapText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = tapText[i];
                }
            }
            break;
            
        case 4: // Hold
            const holdTime = gestureProgress;
            const holdIntensity = Math.floor(holdTime * 5);
            
            // Pulsing center
            for (let r = 0; r <= holdIntensity; r++) {
                for (let y = -r; y <= r; y++) {
                    for (let x = -r; x <= r; x++) {
                        if (x * x + y * y <= r * r) {
                            const px = Math.floor(centerX) + x;
                            const py = Math.floor(centerY) + y;
                            
                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                const intensityChars = ' ░▒▓█';
                                const charIndex = Math.min(r, intensityChars.length - 1);
                                buffer[py][px] = intensityChars[charIndex];
                            }
                        }
                    }
                }
            }
            
            const holdText = "HOLD ◉";
            for (let i = 0; i < holdText.length; i++) {
                if (i < width) {
                    buffer[1][i + 1] = holdText[i];
                }
            }
            break;
    }
    
    // Audio reactivity overlay
    const audioLevel = audio[0];
    if (audioLevel > 0.7) {
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            buffer[y][x] = '✦';
        }
    }
};

// Scene 113: Voice Waveform
CLIFTScenes[113] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Main waveform
    const waveHeight = height * 0.6;
    const centerY = height / 2;
    
    for (let x = 0; x < width; x++) {
        // Get audio sample
        const audioIndex = Math.floor((x / width) * audio.length);
        const amplitude = audio[audioIndex];
        
        // Create thick waveform
        const waveY = centerY + Math.sin(x * 0.1 + t) * amplitude * waveHeight / 2;
        
        // Draw waveform with thickness
        for (let thickness = -1; thickness <= 1; thickness++) {
            const y = Math.floor(waveY + thickness);
            
            if (y >= 0 && y < height) {
                const waveChars = '─═━';
                const charIndex = Math.abs(thickness);
                buffer[y][x] = waveChars[charIndex];
            }
        }
        
        // Vertical lines for high amplitude
        if (amplitude > 0.7) {
            const topY = Math.floor(waveY - amplitude * 5);
            const bottomY = Math.floor(waveY + amplitude * 5);
            
            for (let y = topY; y <= bottomY; y++) {
                if (y >= 0 && y < height && y !== Math.floor(waveY)) {
                    buffer[y][x] = '│';
                }
            }
        }
    }
    
    // Frequency bands visualization
    const bands = 8;
    const bandWidth = Math.floor(width / bands);
    
    for (let band = 0; band < bands; band++) {
        const startX = band * bandWidth;
        const bandAudio = audio[Math.min(band * 8, audio.length - 1)] || 0.5;
        
        // Band indicator at top
        const bandHeight = Math.floor(bandAudio * 5);
        for (let h = 0; h < bandHeight; h++) {
            for (let x = startX; x < startX + bandWidth - 1 && x < width; x++) {
                if (h < height) {
                    buffer[h][x] = '▄';
                }
            }
        }
    }
    
    // Voice activity indicator
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length;
    if (avgAudio > 0.3) {
        const indicator = "◉ VOICE ACTIVE";
        for (let i = 0; i < indicator.length && i < width - 2; i++) {
            buffer[height - 2][i + 2] = indicator[i];
        }
    }
    
    // dB meter on the right
    const dbLevels = 10;
    for (let level = 0; level < dbLevels; level++) {
        const y = height - 1 - level;
        const threshold = level / dbLevels;
        
        if (y >= 0 && avgAudio > threshold) {
            const meterChars = '▁▂▃▄▅▆▇█';
            const charIndex = Math.floor((level / dbLevels) * (meterChars.length - 1));
            
            if (width - 3 >= 0) {
                buffer[y][width - 3] = meterChars[charIndex];
                buffer[y][width - 2] = meterChars[charIndex];
            }
        }
    }
};

// Scene 114: Beat Matcher
CLIFTScenes[114] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const beat = params.beat || 0;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Beat grid
    const gridSize = 4;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    
    // Draw grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;
            
            // Grid borders
            for (let dx = 0; dx < cellWidth; dx++) {
                if (x + dx < width) {
                    if (row < gridSize - 1 && y + cellHeight < height) {
                        buffer[y + cellHeight][x + dx] = '─';
                    }
                }
            }
            for (let dy = 0; dy < cellHeight; dy++) {
                if (y + dy < height) {
                    if (col < gridSize - 1 && x + cellWidth < width) {
                        buffer[y + dy][x + cellWidth] = '│';
                    }
                }
            }
            
            // Cell activation based on beat
            const cellIndex = row * gridSize + col;
            const isActive = Math.floor(beat * 16) % 16 === cellIndex;
            
            if (isActive) {
                // Fill active cell
                for (let dy = 1; dy < cellHeight; dy++) {
                    for (let dx = 1; dx < cellWidth; dx++) {
                        if (x + dx < width && y + dy < height) {
                            buffer[y + dy][x + dx] = '█';
                        }
                    }
                }
            }
            
            // Beat number in cell
            const beatNum = cellIndex + 1;
            const numStr = beatNum.toString();
            const numX = x + Math.floor((cellWidth - numStr.length) / 2);
            const numY = y + Math.floor(cellHeight / 2);
            
            for (let i = 0; i < numStr.length; i++) {
                if (numX + i < width && numY < height) {
                    if (!isActive) {
                        buffer[numY][numX + i] = numStr[i];
                    }
                }
            }
        }
    }
    
    // Beat indicator bar
    const barY = height - 3;
    const beatPosition = Math.floor(beat * width);
    
    for (let x = 0; x < width; x++) {
        if (barY >= 0) {
            buffer[barY][x] = '─';
            
            if (x === beatPosition) {
                buffer[barY][x] = '●';
                if (barY - 1 >= 0) buffer[barY - 1][x] = '│';
                if (barY + 1 < height) buffer[barY + 1][x] = '│';
            }
        }
    }
    
    // BPM display
    const bpmText = `BPM: ${params.bpm || 120}`;
    for (let i = 0; i < bpmText.length && i < width; i++) {
        buffer[0][i] = bpmText[i];
    }
    
    // Audio level visualization around active cells
    const bass = audio[0];
    if (bass > 0.6) {
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            
            if (buffer[y][x] === ' ') {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 115: Motion Tracker
CLIFTScenes[115] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate motion detection zones
    const zones = [];
    for (let i = 0; i < 5; i++) {
        zones.push({
            x: Math.floor(width / 6 * (i + 1)),
            y: Math.floor(height / 2 + Math.sin(t + i) * height / 3),
            activity: audio[i * 10] || 0.5,
            id: i
        });
    }
    
    // Draw detection grid
    const gridStep = 3;
    for (let y = 0; y < height; y += gridStep) {
        for (let x = 0; x < width; x += gridStep) {
            buffer[y][x] = '·';
        }
    }
    
    // Draw active zones
    zones.forEach(zone => {
        if (zone.activity > 0.3) {
            const radius = Math.floor(zone.activity * 10);
            
            // Zone circle
            for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                const cx = Math.floor(zone.x + Math.cos(angle) * radius);
                const cy = Math.floor(zone.y + Math.sin(angle) * radius);
                
                if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                    buffer[cy][cx] = '○';
                }
            }
            
            // Motion vectors
            const vectorLength = Math.floor(zone.activity * 5);
            const vectorAngle = t + zone.id;
            
            for (let i = 0; i < vectorLength; i++) {
                const vx = Math.floor(zone.x + Math.cos(vectorAngle) * i);
                const vy = Math.floor(zone.y + Math.sin(vectorAngle) * i);
                
                if (vx >= 0 && vx < width && vy >= 0 && vy < height) {
                    buffer[vy][vx] = i === vectorLength - 1 ? '►' : '─';
                }
            }
            
            // Zone ID
            if (zone.x >= 0 && zone.x < width && zone.y >= 0 && zone.y < height) {
                buffer[zone.y][zone.x] = (zone.id + 1).toString();
            }
        }
    });
    
    // Motion trails
    const trailCount = Math.floor(audio[32] * 10);
    for (let i = 0; i < trailCount; i++) {
        const trailX = Math.floor(Math.random() * width);
        const trailY = Math.floor(Math.random() * height);
        const trailLength = Math.floor(Math.random() * 5 + 2);
        
        for (let j = 0; j < trailLength; j++) {
            const tx = trailX + j;
            if (tx < width && buffer[trailY][tx] === ' ') {
                buffer[trailY][tx] = '·';
            }
        }
    }
    
    // Status bar
    const statusText = "MOTION TRACKING ACTIVE";
    for (let i = 0; i < statusText.length && i < width; i++) {
        buffer[0][i] = statusText[i];
    }
    
    // Activity meter
    const avgActivity = zones.reduce((sum, z) => sum + z.activity, 0) / zones.length;
    const meterWidth = Math.floor(avgActivity * 20);
    
    for (let i = 0; i < meterWidth && i < width - 10; i++) {
        buffer[height - 1][i + 5] = '█';
    }
};

// Scene 116: Proximity Sensor
CLIFTScenes[116] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate proximity reading
    const proximity = (Math.sin(t) + 1) / 2;
    const objectDistance = proximity * 20; // Distance in units
    
    // Radar sweep
    const sweepAngle = (t * 2) % (Math.PI * 2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const maxRadius = Math.min(width, height) / 2 - 2;
    
    // Draw radar circles
    for (let r = 5; r < maxRadius; r += 5) {
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const x = Math.floor(centerX + Math.cos(angle) * r);
            const y = Math.floor(centerY + Math.sin(angle) * r);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = '·';
            }
        }
    }
    
    // Radar sweep line
    for (let r = 0; r < maxRadius; r++) {
        const x = Math.floor(centerX + Math.cos(sweepAngle) * r);
        const y = Math.floor(centerY + Math.sin(sweepAngle) * r);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '═';
        }
    }
    
    // Detected object
    if (objectDistance < maxRadius) {
        const objAngle = sweepAngle - 0.5;
        const objX = Math.floor(centerX + Math.cos(objAngle) * objectDistance);
        const objY = Math.floor(centerY + Math.sin(objAngle) * objectDistance);
        
        // Object representation
        if (objX >= 1 && objX < width - 1 && objY >= 1 && objY < height - 1) {
            buffer[objY][objX] = '◉';
            buffer[objY - 1][objX] = '│';
            buffer[objY + 1][objX] = '│';
            buffer[objY][objX - 1] = '─';
            buffer[objY][objX + 1] = '─';
            
            // Distance indicator
            const distText = Math.floor(objectDistance).toString() + 'm';
            for (let i = 0; i < distText.length; i++) {
                if (objX + i + 2 < width) {
                    buffer[objY][objX + i + 2] = distText[i];
                }
            }
        }
    }
    
    // Proximity waves
    const waveCount = Math.floor((1 - proximity) * 5);
    for (let w = 0; w < waveCount; w++) {
        const waveRadius = w * 3 + (t * 10) % 15;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            const x = Math.floor(centerX + Math.cos(angle) * waveRadius);
            const y = Math.floor(centerY + Math.sin(angle) * waveRadius);
            
            if (x >= 0 && x < width && y >= 0 && y < height && buffer[y][x] === ' ') {
                buffer[y][x] = '»';
            }
        }
    }
    
    // Status display
    const statusText = `PROXIMITY: ${Math.floor(objectDistance)}m`;
    for (let i = 0; i < statusText.length && i < width; i++) {
        buffer[0][i] = statusText[i];
    }
    
    // Warning if too close
    if (proximity < 0.2) {
        const warning = "! WARNING: OBJECT NEAR !";
        const warnX = Math.floor((width - warning.length) / 2);
        
        for (let i = 0; i < warning.length; i++) {
            if (warnX + i >= 0 && warnX + i < width) {
                buffer[height - 2][warnX + i] = warning[i];
            }
        }
    }
};

// Scene 117: Rhythm Game
CLIFTScenes[117] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const beat = params.beat || 0;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Game lanes
    const lanes = 4;
    const laneWidth = Math.floor(width / lanes);
    
    // Draw lanes
    for (let lane = 0; lane < lanes; lane++) {
        const x = lane * laneWidth;
        
        // Lane dividers
        for (let y = 0; y < height; y++) {
            if (x > 0) {
                buffer[y][x] = '│';
            }
        }
        
        // Hit zone at bottom
        const hitZoneY = height - 5;
        for (let dx = 1; dx < laneWidth && x + dx < width; dx++) {
            buffer[hitZoneY][x + dx] = '═';
            buffer[hitZoneY + 1][x + dx] = '─';
        }
    }
    
    // Falling notes
    const noteSpeed = 10;
    const notes = [];
    
    // Generate notes based on audio
    for (let lane = 0; lane < lanes; lane++) {
        const audioIndex = lane * 16;
        if (audio[audioIndex] > 0.6 && Math.random() > 0.7) {
            notes.push({
                lane: lane,
                y: 0,
                hit: false
            });
        }
    }
    
    // Simulate existing notes
    for (let i = 0; i < 8; i++) {
        notes.push({
            lane: Math.floor(Math.random() * lanes),
            y: Math.floor(Math.random() * height * 0.7),
            hit: false
        });
    }
    
    // Draw and update notes
    notes.forEach(note => {
        const x = note.lane * laneWidth + Math.floor(laneWidth / 2);
        const y = Math.floor(note.y);
        
        if (y >= 0 && y < height && x >= 0 && x < width) {
            // Note representation
            if (y < height - 5) {
                buffer[y][x] = '▼';
                if (y > 0) buffer[y - 1][x] = '│';
            } else if (y === height - 5) {
                // Hit zone
                buffer[y][x] = '◉';
                note.hit = true;
            }
        }
        
        // Hit effect
        if (note.hit && y === height - 5) {
            const effectChars = '✦*+×';
            for (let i = 0; i < 3; i++) {
                const ex = x + Math.floor((Math.random() - 0.5) * 4);
                const ey = y + Math.floor((Math.random() - 0.5) * 2);
                
                if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                    buffer[ey][ex] = effectChars[Math.floor(Math.random() * effectChars.length)];
                }
            }
        }
    });
    
    // Score and combo
    const score = Math.floor(t * 100);
    const combo = Math.floor(beat * 16) % 100;
    
    const scoreText = `SCORE: ${score}`;
    const comboText = `COMBO: ${combo}x`;
    
    for (let i = 0; i < scoreText.length && i < width / 2; i++) {
        buffer[0][i] = scoreText[i];
    }
    
    for (let i = 0; i < comboText.length && i + width / 2 < width; i++) {
        buffer[0][i + Math.floor(width / 2)] = comboText[i];
    }
    
    // Perfect/Good/Miss indicators
    const hitQuality = audio[0] > 0.8 ? "PERFECT!" : audio[0] > 0.5 ? "GOOD!" : "MISS";
    const qualityX = Math.floor((width - hitQuality.length) / 2);
    
    if (Math.random() > 0.7) {
        for (let i = 0; i < hitQuality.length; i++) {
            if (qualityX + i >= 0 && qualityX + i < width) {
                buffer[height - 3][qualityX + i] = hitQuality[i];
            }
        }
    }
};

// Scene 118: Eye Tracking
CLIFTScenes[118] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate eye position
    const eyeX = Math.floor(width / 2 + Math.sin(t * 0.7) * width / 3);
    const eyeY = Math.floor(height / 2 + Math.cos(t * 0.5) * height / 3);
    
    // Draw eye representation
    const eyeRadius = 4;
    
    // Outer eye
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(eyeX + Math.cos(angle) * eyeRadius);
        const y = Math.floor(eyeY + Math.sin(angle) * eyeRadius * 0.6);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = '○';
        }
    }
    
    // Pupil (follows audio)
    const pupilOffset = audio[0] * 2 - 1;
    const pupilX = Math.floor(eyeX + pupilOffset * 2);
    const pupilY = Math.floor(eyeY);
    
    if (pupilX >= 0 && pupilX < width && pupilY >= 0 && pupilY < height) {
        buffer[pupilY][pupilX] = '●';
    }
    
    // Gaze trail
    const trailLength = 20;
    for (let i = 0; i < trailLength; i++) {
        const trailT = t - i * 0.05;
        const tx = Math.floor(width / 2 + Math.sin(trailT * 0.7) * width / 3);
        const ty = Math.floor(height / 2 + Math.cos(trailT * 0.5) * height / 3);
        
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            const intensity = 1 - (i / trailLength);
            const trailChars = '·:;=';
            const charIndex = Math.floor(intensity * (trailChars.length - 1));
            buffer[ty][tx] = trailChars[charIndex];
        }
    }
    
    // Focus indicators
    const focusPoints = [];
    for (let i = 0; i < 5; i++) {
        focusPoints.push({
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            importance: Math.random()
        });
    }
    
    focusPoints.forEach(point => {
        const dist = Math.sqrt((point.x - eyeX) ** 2 + (point.y - eyeY) ** 2);
        const isFocused = dist < 10;
        
        if (point.x >= 0 && point.x < width && point.y >= 0 && point.y < height) {
            buffer[point.y][point.x] = isFocused ? '⊕' : '⊙';
            
            // Focus connection
            if (isFocused) {
                const steps = Math.floor(dist);
                for (let s = 0; s < steps; s++) {
                    const sx = Math.floor(eyeX + (point.x - eyeX) * s / steps);
                    const sy = Math.floor(eyeY + (point.y - eyeY) * s / steps);
                    
                    if (sx >= 0 && sx < width && sy >= 0 && sy < height && buffer[sy][sx] === ' ') {
                        buffer[sy][sx] = '·';
                    }
                }
            }
        }
    });
    
    // Heatmap overlay
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt((x - eyeX) ** 2 + (y - eyeY) ** 2);
            
            if (dist < 15 && dist > 5 && Math.random() > 0.8) {
                const heatChars = ' ░▒';
                const heatIndex = Math.floor((1 - dist / 15) * (heatChars.length - 1));
                
                if (buffer[y][x] === ' ') {
                    buffer[y][x] = heatChars[heatIndex];
                }
            }
        }
    }
    
    // Status
    const statusText = "EYE TRACKING ACTIVE";
    for (let i = 0; i < statusText.length && i < width; i++) {
        buffer[0][i] = statusText[i];
    }
};

// Scene 119: Biometric Display
CLIFTScenes[119] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    
    // Simulate biometric data
    const heartRate = 60 + Math.sin(t) * 20 + audio[0] * 40;
    const breathing = Math.sin(t * 0.3) * 0.5 + 0.5;
    const stress = audio.reduce((a, b) => a + b, 0) / audio.length;
    
    // Heart rate monitor
    const hrY = Math.floor(height * 0.3);
    const hrText = `♥ HR: ${Math.floor(heartRate)} BPM`;
    
    for (let i = 0; i < hrText.length && i < width; i++) {
        buffer[hrY][i] = hrText[i];
    }
    
    // ECG wave
    for (let x = 0; x < width; x++) {
        const ecgPhase = (x / width + t) * Math.PI * 4;
        let ecgValue = 0;
        
        // Simulate QRS complex
        if (ecgPhase % (Math.PI * 2) < 0.2) {
            ecgValue = Math.sin(ecgPhase * 20) * 3;
        } else {
            ecgValue = Math.sin(ecgPhase) * 0.5;
        }
        
        const ecgY = Math.floor(hrY + 2 + ecgValue);
        
        if (ecgY >= 0 && ecgY < height) {
            buffer[ecgY][x] = '─';
            
            // Heart beat effect
            if (Math.abs(ecgValue) > 2) {
                if (ecgY - 1 >= 0) buffer[ecgY - 1][x] = '│';
                if (ecgY + 1 < height) buffer[ecgY + 1][x] = '│';
            }
        }
    }
    
    // Breathing wave
    const breathY = Math.floor(height * 0.5);
    const breathText = `◊ RESP: ${Math.floor(breathing * 20 + 10)}/min`;
    
    for (let i = 0; i < breathText.length && i < width; i++) {
        buffer[breathY][i] = breathText[i];
    }
    
    // Breathing visualization
    for (let x = 0; x < width; x++) {
        const breathWave = Math.sin((x / width) * Math.PI * 2 + t * 0.3) * breathing * 3;
        const waveY = Math.floor(breathY + 2 + breathWave);
        
        if (waveY >= 0 && waveY < height) {
            buffer[waveY][x] = '~';
        }
    }
    
    // Stress level meter
    const stressY = Math.floor(height * 0.7);
    const stressText = `▣ STRESS: ${Math.floor(stress * 100)}%`;
    
    for (let i = 0; i < stressText.length && i < width; i++) {
        buffer[stressY][i] = stressText[i];
    }
    
    // Stress bar
    const stressBarWidth = Math.floor(stress * (width - 20));
    for (let i = 0; i < stressBarWidth; i++) {
        const barX = i + 15;
        if (barX < width) {
            const barChar = stress > 0.7 ? '█' : stress > 0.4 ? '▓' : '▒';
            buffer[stressY + 1][barX] = barChar;
        }
    }
    
    // Overall status
    const status = stress > 0.7 ? "ALERT" : stress > 0.4 ? "ACTIVE" : "CALM";
    const statusColor = stress > 0.7 ? "!" : stress > 0.4 ? "*" : "+";
    
    const statusText = `${statusColor} STATUS: ${status} ${statusColor}`;
    const statusX = Math.floor((width - statusText.length) / 2);
    
    for (let i = 0; i < statusText.length; i++) {
        if (statusX + i >= 0 && statusX + i < width) {
            buffer[height - 2][statusX + i] = statusText[i];
        }
    }
    
    // Biometric particles
    const particleCount = Math.floor(stress * 20);
    for (let i = 0; i < particleCount; i++) {
        const px = Math.floor(Math.random() * width);
        const py = Math.floor(Math.random() * height);
        
        if (buffer[py][px] === ' ') {
            const particleChars = '°∙·';
            buffer[py][px] = particleChars[Math.floor(Math.random() * particleChars.length)];
        }
    }
};
