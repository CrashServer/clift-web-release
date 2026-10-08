// CLIFT scenes - category 9: Cinematic & Animation

// Category 9: Cinematic & Animation (90-99)

// Scene 90: Film Reel
CLIFTScenes[90] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Film strip parameters
    const frameWidth = 12;
    const frameHeight = 8;
    const sprocketSize = 2;
    const scrollSpeed = 2 + avgAudio * 3;
    const scrollOffset = (t * scrollSpeed) % (frameHeight + 4);
    
    // Draw film strips on sides
    for (let y = 0; y < height; y++) {
        const frameY = (y + scrollOffset) % (frameHeight + 4);
        
        // Left sprocket holes
        if (frameY < sprocketSize || frameY >= frameHeight + 2) {
            for (let x = 0; x < 3; x++) {
                buffer[y][x] = 'O';
            }
        }
        
        // Right sprocket holes
        if (frameY < sprocketSize || frameY >= frameHeight + 2) {
            for (let x = width - 3; x < width; x++) {
                buffer[y][x] = 'O';
            }
        }
        
        // Film edges
        buffer[y][3] = '|';
        buffer[y][width - 4] = '|';
    }
    
    // Draw frames
    const centerX = width / 2;
    for (let y = -frameHeight; y < height + frameHeight; y++) {
        const frameY = (y + scrollOffset);
        const frameIndex = Math.floor(frameY / (frameHeight + 4));
        const localY = frameY % (frameHeight + 4);
        
        if (localY >= 0 && localY < frameHeight) {
            // Frame border
            for (let x = -frameWidth/2; x <= frameWidth/2; x++) {
                const px = Math.floor(centerX + x);
                const py = y;
                
                if (px >= 4 && px < width - 4 && py >= 0 && py < height) {
                    if (localY === 0 || localY === frameHeight - 1 || 
                        x === -frameWidth/2 || x === frameWidth/2) {
                        buffer[py][px] = '#';
                    } else {
                        // Frame content - different for each frame
                        const sceneType = Math.abs(frameIndex) % 4;
                        switch (sceneType) {
                            case 0: // Action scene
                                if (Math.abs(x) + Math.abs(localY - frameHeight/2) < 4) {
                                    buffer[py][px] = '*';
                                }
                                break;
                            case 1: // Dialog scene
                                if (localY === frameHeight/2 && Math.abs(x) < 3) {
                                    buffer[py][px] = '"';
                                }
                                break;
                            case 2: // Landscape
                                if (localY > frameHeight/2 + Math.sin(x * 0.5) * 2) {
                                    buffer[py][px] = '=';
                                }
                                break;
                            case 3: // Close-up
                                if (Math.sqrt(x*x + (localY-frameHeight/2)*(localY-frameHeight/2)) < 3) {
                                    buffer[py][px] = '@';
                                }
                                break;
                        }
                    }
                }
            }
            
            // Frame number
            if (localY === 1 && Math.floor(centerX - 2) >= 4 && 
                Math.floor(centerX + 2) < width - 4) {
                const numStr = frameIndex.toString().padStart(3, '0');
                for (let i = 0; i < numStr.length; i++) {
                    buffer[y][Math.floor(centerX - 1 + i)] = numStr[i];
                }
            }
        }
    }
};

// Scene 91: Stop Motion Animation
CLIFTScenes[91] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Animation frames (4 fps effect)
    const frameRate = 4 + avgAudio * 8;
    const currentFrame = Math.floor(t * frameRate);
    
    // Character animation states
    const walkCycle = [
        { body: 'O', leftLeg: '/', rightLeg: '\\', leftArm: '\\', rightArm: '/' },
        { body: 'O', leftLeg: '|', rightLeg: '|', leftArm: '-', rightArm: '-' },
        { body: 'O', leftLeg: '\\', rightLeg: '/', leftArm: '/', rightArm: '\\' },
        { body: 'O', leftLeg: '|', rightLeg: '|', leftArm: '-', rightArm: '-' }
    ];
    
    // Character position
    const charX = ((currentFrame * 2) % (width + 10)) - 5;
    const charY = height - 8;
    const pose = walkCycle[currentFrame % walkCycle.length];
    
    // Draw character
    if (charX >= 0 && charX < width && charY >= 0 && charY < height) {
        // Head
        buffer[charY][charX] = pose.body;
        
        // Body
        if (charY + 1 < height) buffer[charY + 1][charX] = '|';
        if (charY + 2 < height) buffer[charY + 2][charX] = '|';
        
        // Arms
        if (charX - 1 >= 0 && charY + 1 < height) 
            buffer[charY + 1][charX - 1] = pose.leftArm;
        if (charX + 1 < width && charY + 1 < height) 
            buffer[charY + 1][charX + 1] = pose.rightArm;
        
        // Legs
        if (charX - 1 >= 0 && charY + 3 < height) 
            buffer[charY + 3][charX - 1] = pose.leftLeg;
        if (charX + 1 < width && charY + 3 < height) 
            buffer[charY + 3][charX + 1] = pose.rightLeg;
    }
    
    // Scenery (moving background)
    const bgOffset = Math.floor(currentFrame * 0.5) % 20;
    
    // Trees
    for (let i = 0; i < 5; i++) {
        const treeX = (i * 20 - bgOffset + width) % width;
        const treeHeight = 5 + (i % 3) * 2;
        
        for (let h = 0; h < treeHeight; h++) {
            const ty = height - 5 - h;
            if (treeX >= 0 && treeX < width && ty >= 0) {
                buffer[ty][treeX] = '|';
            }
        }
        
        // Tree top
        const topY = height - 5 - treeHeight;
        if (topY >= 0 && treeX >= 1 && treeX < width - 1) {
            buffer[topY][treeX - 1] = '/';
            buffer[topY][treeX] = '^';
            buffer[topY][treeX + 1] = '\\';
        }
    }
    
    // Ground
    for (let x = 0; x < width; x++) {
        buffer[height - 2][x] = '_';
        buffer[height - 1][x] = '#';
    }
    
    // Frame counter (film style)
    const frameStr = `FRAME: ${currentFrame.toString().padStart(5, '0')}`;
    for (let i = 0; i < frameStr.length && i < width; i++) {
        buffer[0][i] = frameStr[i];
    }
};

// Scene 92: Camera Dolly
CLIFTScenes[92] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Camera movement
    const dollyPosition = Math.sin(t * 0.5) * 30;
    const zoomLevel = 1 + Math.sin(t * 0.3) * 0.5 + avgAudio * 0.5;
    
    // Scene elements with parallax
    const layers = [
        { depth: 3, elements: ['*', '.', '*'], speed: 0.1 },  // Stars
        { depth: 2, elements: ['^', 'A', '^'], speed: 0.3 },  // Mountains
        { depth: 1, elements: ['|', 'T', '|'], speed: 0.6 },  // Trees
        { depth: 0, elements: ['#', '=', '#'], speed: 1.0 }   // Foreground
    ];
    
    // Draw layers back to front
    layers.forEach((layer, layerIndex) => {
        const parallaxOffset = dollyPosition * layer.speed;
        const layerY = height - (layerIndex + 1) * 5;
        
        for (let i = 0; i < 20; i++) {
            const elementX = (i * 10 + parallaxOffset + width * 2) % width;
            const elementType = layer.elements[i % layer.elements.length];
            
            // Apply zoom
            const scaledX = width / 2 + (elementX - width / 2) / zoomLevel;
            
            if (scaledX >= 0 && scaledX < width && layerY >= 0 && layerY < height) {
                // Draw element with depth-based size
                const size = Math.floor((3 - layer.depth) * zoomLevel);
                
                for (let s = 0; s < size; s++) {
                    const px = Math.floor(scaledX + s - size / 2);
                    const py = layerY - s;
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = elementType;
                    }
                }
            }
        }
    });
    
    // Camera frame overlay
    const frameSize = 5;
    // Top and bottom
    for (let x = frameSize; x < width - frameSize; x++) {
        buffer[frameSize][x] = '-';
        buffer[height - frameSize - 1][x] = '-';
    }
    // Left and right
    for (let y = frameSize; y < height - frameSize; y++) {
        buffer[y][frameSize] = '|';
        buffer[y][width - frameSize - 1] = '|';
    }
    // Corners
    buffer[frameSize][frameSize] = '+';
    buffer[frameSize][width - frameSize - 1] = '+';
    buffer[height - frameSize - 1][frameSize] = '+';
    buffer[height - frameSize - 1][width - frameSize - 1] = '+';
    
    // Camera info
    const info = `DOLLY: ${Math.floor(dollyPosition)} ZOOM: ${zoomLevel.toFixed(1)}x`;
    for (let i = 0; i < info.length && i < width; i++) {
        buffer[0][i] = info[i];
    }
};

// Scene 93: Storyboard Panels
CLIFTScenes[93] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Panel layout
    const panelWidth = Math.floor(width / 3) - 2;
    const panelHeight = Math.floor(height / 2) - 2;
    const panels = 6;
    
    // Current active panel (animated)
    const activePanel = Math.floor(t + avgAudio * 2) % panels;
    
    for (let p = 0; p < panels; p++) {
        const row = Math.floor(p / 3);
        const col = p % 3;
        const x0 = col * (panelWidth + 2) + 1;
        const y0 = row * (panelHeight + 2) + 1;
        
        // Draw panel border
        const borderChar = p === activePanel ? '#' : '-';
        for (let x = 0; x < panelWidth; x++) {
            if (x0 + x < width) {
                buffer[y0][x0 + x] = borderChar;
                if (y0 + panelHeight - 1 < height) {
                    buffer[y0 + panelHeight - 1][x0 + x] = borderChar;
                }
            }
        }
        for (let y = 0; y < panelHeight; y++) {
            if (y0 + y < height) {
                buffer[y0 + y][x0] = borderChar;
                if (x0 + panelWidth - 1 < width) {
                    buffer[y0 + y][x0 + panelWidth - 1] = borderChar;
                }
            }
        }
        
        // Panel content
        if (p === activePanel) {
            // Detailed scene
            const sceneType = Math.floor(t / 3) % 4;
            
            switch (sceneType) {
                case 0: // Wide shot
                    for (let x = 2; x < panelWidth - 2; x++) {
                        const mountainY = y0 + panelHeight / 2 + Math.sin(x * 0.3) * 2;
                        if (mountainY < y0 + panelHeight - 1) {
                            buffer[Math.floor(mountainY)][x0 + x] = '^';
                        }
                    }
                    break;
                    
                case 1: // Close-up
                    const centerX = x0 + panelWidth / 2;
                    const centerY = y0 + panelHeight / 2;
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            if (Math.abs(dx) + Math.abs(dy) <= 2) {
                                const px = Math.floor(centerX + dx);
                                const py = Math.floor(centerY + dy);
                                if (px > x0 && px < x0 + panelWidth - 1 && 
                                    py > y0 && py < y0 + panelHeight - 1) {
                                    buffer[py][px] = '@';
                                }
                            }
                        }
                    }
                    break;
                    
                case 2: // Action
                    for (let i = 0; i < 5; i++) {
                        const ax = x0 + 2 + i * 2;
                        const ay = y0 + 2 + Math.floor(Math.sin(t * 5 + i) * 2);
                        if (ax < x0 + panelWidth - 1 && ay < y0 + panelHeight - 1) {
                            buffer[ay][ax] = '*';
                        }
                    }
                    break;
                    
                case 3: // Dialog
                    const text = "...";
                    const textY = y0 + panelHeight - 3;
                    for (let i = 0; i < text.length; i++) {
                        if (x0 + 2 + i < x0 + panelWidth - 1) {
                            buffer[textY][x0 + 2 + i] = text[i];
                        }
                    }
                    break;
            }
        } else {
            // Sketched content
            const sketchDensity = 0.1;
            for (let y = 2; y < panelHeight - 2; y++) {
                for (let x = 2; x < panelWidth - 2; x++) {
                    if (Math.random() < sketchDensity) {
                        buffer[y0 + y][x0 + x] = '.';
                    }
                }
            }
        }
        
        // Panel number
        if (y0 + 1 < height && x0 + 1 < width) {
            buffer[y0 + 1][x0 + 1] = (p + 1).toString();
        }
    }
};

// Scene 94: Time-lapse Photography
CLIFTScenes[94] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Time acceleration
    const timeSpeed = 50 + avgAudio * 100;
    const dayTime = (t * timeSpeed) % 100;
    const isDay = dayTime < 50;
    
    // Sky gradient
    for (let y = 0; y < height / 2; y++) {
        for (let x = 0; x < width; x++) {
            if (isDay) {
                // Day sky
                if (y < 2) buffer[y][x] = '.';
                else if (Math.random() < 0.001) buffer[y][x] = '*'; // Birds
            } else {
                // Night sky
                if (Math.random() < 0.01) buffer[y][x] = '.'; // Stars
                else if (Math.random() < 0.001) buffer[y][x] = '*'; // Bright stars
            }
        }
    }
    
    // Sun/Moon
    const celestialX = Math.floor((dayTime / 100) * width);
    const celestialY = Math.floor(5 + Math.sin((dayTime / 100) * Math.PI) * -10);
    
    if (celestialX >= 0 && celestialX < width && celestialY >= 0 && celestialY < height) {
        if (isDay) {
            // Sun
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (dx*dx + dy*dy <= 4) {
                        const px = celestialX + dx;
                        const py = celestialY + dy;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            buffer[py][px] = '@';
                        }
                    }
                }
            }
        } else {
            // Moon
            buffer[celestialY][celestialX] = 'O';
        }
    }
    
    // City skyline
    const buildings = [];
    for (let i = 0; i < 10; i++) {
        buildings.push({
            x: Math.floor(i * width / 10 + width / 20),
            height: 5 + Math.floor(Math.sin(i * 2.3) * 3),
            width: 3 + Math.floor(Math.sin(i * 1.7) * 2)
        });
    }
    
    // Draw buildings
    buildings.forEach(building => {
        for (let y = height - building.height; y < height; y++) {
            for (let x = 0; x < building.width; x++) {
                const px = building.x + x;
                if (px >= 0 && px < width) {
                    buffer[y][px] = '#';
                    
                    // Windows (lit at night)
                    if (!isDay && y < height - 1 && x > 0 && x < building.width - 1) {
                        if ((y - (height - building.height)) % 2 === 0 && x % 2 === 1) {
                            buffer[y][px] = Math.random() > 0.3 ? '*' : '#';
                        }
                    }
                }
            }
        }
    });
    
    // Traffic (more at certain times)
    const trafficDensity = Math.sin(dayTime * 0.1) * 0.5 + 0.5;
    const carCount = Math.floor(5 * trafficDensity);
    
    for (let i = 0; i < carCount; i++) {
        const carX = Math.floor((t * 10 + i * 20) % width);
        const carY = height - 2;
        
        if (carX >= 0 && carX < width - 2) {
            buffer[carY][carX] = '[';
            buffer[carY][carX + 1] = isDay ? '=' : '*';
            buffer[carY][carX + 2] = ']';
        }
    }
    
    // Time indicator
    const timeStr = `TIME: ${Math.floor(dayTime).toString().padStart(2, '0')}:00`;
    for (let i = 0; i < timeStr.length && i < width; i++) {
        buffer[0][i] = timeStr[i];
    }
};

// Scene 95: Rotoscope Effect
CLIFTScenes[95] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Animated figure
    const figureX = width / 2 + Math.sin(t) * 20;
    const figureY = height / 2;
    
    // Motion trail
    const trailLength = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < trailLength; i++) {
        const trailT = t - i * 0.1;
        const trailX = width / 2 + Math.sin(trailT) * 20;
        const trailY = height / 2;
        const alpha = 1 - i / trailLength;
        
        // Draw fading figure
        if (alpha > 0.3) {
            const char = alpha > 0.7 ? '@' : alpha > 0.5 ? 'o' : '.';
            
            // Head
            if (Math.floor(trailX) >= 0 && Math.floor(trailX) < width && 
                Math.floor(trailY - 3) >= 0) {
                buffer[Math.floor(trailY - 3)][Math.floor(trailX)] = char;
            }
            
            // Body outline
            for (let by = -2; by <= 2; by++) {
                const bx = Math.sin(by * 0.5 + trailT * 3) * 2;
                const px = Math.floor(trailX + bx);
                const py = Math.floor(trailY + by);
                
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    buffer[py][px] = char;
                }
            }
        }
    }
    
    // Current frame outline
    // Head
    const headX = Math.floor(figureX);
    const headY = Math.floor(figureY - 3);
    if (headX >= 0 && headX < width && headY >= 0) {
        buffer[headY][headX] = 'O';
    }
    
    // Arms (animated)
    const armAngle = Math.sin(t * 3) * 0.5;
    const leftArmX = Math.floor(figureX - 3 - Math.sin(armAngle) * 2);
    const rightArmX = Math.floor(figureX + 3 + Math.sin(armAngle) * 2);
    const armY = Math.floor(figureY - 1);
    
    if (leftArmX >= 0 && leftArmX < width && armY >= 0 && armY < height) {
        buffer[armY][leftArmX] = '\\';
    }
    if (rightArmX >= 0 && rightArmX < width && armY >= 0 && armY < height) {
        buffer[armY][rightArmX] = '/';
    }
    
    // Torso
    for (let ty = -2; ty <= 2; ty++) {
        const tx = Math.floor(figureX);
        const py = Math.floor(figureY + ty);
        
        if (tx >= 0 && tx < width && py >= 0 && py < height) {
            buffer[py][tx] = '|';
        }
    }
    
    // Legs (walking animation)
    const walkPhase = Math.sin(t * 4);
    const leftLegX = Math.floor(figureX - 1 - walkPhase);
    const rightLegX = Math.floor(figureX + 1 + walkPhase);
    const legY = Math.floor(figureY + 3);
    
    if (leftLegX >= 0 && leftLegX < width && legY >= 0 && legY < height) {
        buffer[legY][leftLegX] = '/';
    }
    if (rightLegX >= 0 && rightLegX < width && legY >= 0 && legY < height) {
        buffer[legY][rightLegX] = '\\';
    }
    
    // Background grid (rotoscope reference)
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
            if (buffer[y][x] === ' ') {
                buffer[y][x] = '+';
            }
        }
    }
};

// Scene 96: Zoetrope Animation
CLIFTScenes[96] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Zoetrope wheel
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 2;
    const rotation = t * (1 + avgAudio * 2);
    const slotCount = 12;
    
    // Draw outer ring
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = 'O';
        }
    }
    
    // Draw slots and animation frames
    for (let slot = 0; slot < slotCount; slot++) {
        const slotAngle = (slot / slotCount) * Math.PI * 2 + rotation;
        const slotX = centerX + Math.cos(slotAngle) * (radius - 5);
        const slotY = centerY + Math.sin(slotAngle) * (radius - 5) * 0.5;
        
        // Animation frame in slot
        const frameIndex = slot % 4;
        const frames = ['\\o/', '|o|', '/o\\', '|o|'];
        const frame = frames[frameIndex];
        
        // Draw frame if visible (front half of wheel)
        if (Math.cos(slotAngle) > 0) {
            for (let i = 0; i < frame.length; i++) {
                const fx = Math.floor(slotX - frame.length/2 + i);
                const fy = Math.floor(slotY);
                
                if (fx >= 0 && fx < width && fy >= 0 && fy < height) {
                    buffer[fy][fx] = frame[i];
                }
            }
        }
        
        // Slot dividers
        const dividerX = Math.floor(centerX + Math.cos(slotAngle) * radius);
        const dividerY = Math.floor(centerY + Math.sin(slotAngle) * radius * 0.5);
        
        if (dividerX >= 0 && dividerX < width && dividerY >= 0 && dividerY < height) {
            buffer[dividerY][dividerX] = '|';
        }
    }
    
    // Center spindle
    if (Math.floor(centerX) >= 0 && Math.floor(centerX) < width && 
        Math.floor(centerY) >= 0 && Math.floor(centerY) < height) {
        buffer[Math.floor(centerY)][Math.floor(centerX)] = '@';
    }
    
    // Viewing window
    const windowX = Math.floor(centerX);
    const windowY = Math.floor(centerY - radius * 0.5 - 3);
    
    if (windowY >= 0 && windowX - 2 >= 0 && windowX + 2 < width) {
        buffer[windowY][windowX - 2] = '[';
        buffer[windowY][windowX + 2] = ']';
        buffer[windowY][windowX] = 'V';
    }
};

// Scene 97: Motion Blur
CLIFTScenes[97] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Moving objects with trails
    const objects = [
        { x: width * 0.2, y: height * 0.3, vx: 3, vy: 0.5, char: '@' },
        { x: width * 0.8, y: height * 0.6, vx: -2, vy: -0.3, char: '#' },
        { x: width * 0.5, y: height * 0.8, vx: 1.5, vy: -1, char: '*' }
    ];
    
    objects.forEach((obj, index) => {
        // Update position
        const speed = 1 + avgAudio * 2;
        const currentX = (obj.x + t * obj.vx * speed * 10) % width;
        const currentY = (obj.y + t * obj.vy * speed * 10 + height) % height;
        
        // Motion blur trail
        const blurLength = 5 + Math.floor(avgAudio * 15);
        const blurChars = ['#', '=', '-', '.', ' '];
        
        for (let i = 0; i < blurLength; i++) {
            const blurT = t - i * 0.02;
            const blurX = Math.floor((obj.x + blurT * obj.vx * speed * 10) % width);
            const blurY = Math.floor((obj.y + blurT * obj.vy * speed * 10 + height) % height);
            
            if (blurX >= 0 && blurX < width && blurY >= 0 && blurY < height) {
                const charIndex = Math.min(i, blurChars.length - 1);
                if (buffer[blurY][blurX] === ' ') {
                    buffer[blurY][blurX] = blurChars[charIndex];
                }
            }
        }
        
        // Current position
        if (Math.floor(currentX) >= 0 && Math.floor(currentX) < width && 
            Math.floor(currentY) >= 0 && Math.floor(currentY) < height) {
            buffer[Math.floor(currentY)][Math.floor(currentX)] = obj.char;
        }
    });
    
    // Speed lines
    if (avgAudio > 0.5) {
        const lineCount = Math.floor(avgAudio * 10);
        for (let i = 0; i < lineCount; i++) {
            const lineY = Math.floor(Math.random() * height);
            const lineLength = 10 + Math.floor(Math.random() * 20);
            const lineStart = Math.floor(Math.random() * width);
            
            for (let x = 0; x < lineLength; x++) {
                const px = (lineStart + x) % width;
                if (buffer[lineY][px] === ' ') {
                    buffer[lineY][px] = '-';
                }
            }
        }
    }
};

// Scene 98: Claymation Style
CLIFTScenes[98] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Clay figure morphing
    const morphPhase = (t * 0.5) % 1;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Base clay blob
    const blobRadius = 8 + Math.sin(t) * 3 + avgAudio * 5;
    const blobHeight = blobRadius * 0.6;
    
    for (let y = -blobHeight; y <= blobHeight; y++) {
        for (let x = -blobRadius; x <= blobRadius; x++) {
            const dist = Math.sqrt((x / blobRadius) * (x / blobRadius) + 
                                  (y / blobHeight) * (y / blobHeight));
            
            if (dist <= 1) {
                const px = Math.floor(centerX + x);
                const py = Math.floor(centerY + y);
                
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    // Clay texture
                    const texture = dist < 0.3 ? '@' : 
                                  dist < 0.6 ? '#' : 
                                  dist < 0.9 ? '=' : 
                                  '-';
                    buffer[py][px] = texture;
                }
            }
        }
    }
    
    // Morphing features
    if (morphPhase < 0.33) {
        // Eyes appearing
        const eyeProgress = morphPhase * 3;
        const eyeY = Math.floor(centerY - 2);
        const leftEyeX = Math.floor(centerX - 3);
        const rightEyeX = Math.floor(centerX + 3);
        
        if (eyeProgress > 0.5) {
            if (leftEyeX >= 0 && leftEyeX < width && eyeY >= 0 && eyeY < height) {
                buffer[eyeY][leftEyeX] = 'O';
            }
            if (rightEyeX >= 0 && rightEyeX < width && eyeY >= 0 && eyeY < height) {
                buffer[eyeY][rightEyeX] = 'O';
            }
        }
    } else if (morphPhase < 0.66) {
        // Smile forming
        const smileProgress = (morphPhase - 0.33) * 3;
        const smileY = Math.floor(centerY + 2);
        const smileWidth = Math.floor(smileProgress * 5);
        
        for (let x = -smileWidth; x <= smileWidth; x++) {
            const px = Math.floor(centerX + x);
            if (px >= 0 && px < width && smileY >= 0 && smileY < height) {
                buffer[smileY][px] = '-';
            }
        }
    } else {
        // Arms extending
        const armProgress = (morphPhase - 0.66) * 3;
        const armLength = Math.floor(armProgress * 5);
        
        // Left arm
        for (let i = 0; i < armLength; i++) {
            const ax = Math.floor(centerX - blobRadius + 2 - i);
            const ay = Math.floor(centerY);
            if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
                buffer[ay][ax] = '=';
            }
        }
        
        // Right arm
        for (let i = 0; i < armLength; i++) {
            const ax = Math.floor(centerX + blobRadius - 2 + i);
            const ay = Math.floor(centerY);
            if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
                buffer[ay][ax] = '=';
            }
        }
    }
    
    // Clay drips (audio reactive)
    if (avgAudio > 0.4) {
        const dripCount = Math.floor(avgAudio * 5);
        for (let i = 0; i < dripCount; i++) {
            const dripX = Math.floor(centerX + (Math.random() - 0.5) * blobRadius * 2);
            const dripY = Math.floor(centerY + blobHeight + 1 + i);
            
            if (dripX >= 0 && dripX < width && dripY >= 0 && dripY < height) {
                buffer[dripY][dripX] = '.';
            }
        }
    }
};

// Scene 99: Director's Cut
CLIFTScenes[99] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Film production elements
    const scene = Math.floor(t / 5) % 4;
    
    // Clapperboard at scene changes
    if ((t % 5) < 0.5) {
        const clapX = width / 2 - 10;
        const clapY = height / 2 - 4;
        
        // Clapper
        const clapper = [
            '┌────────────────────┐',
            '│ SCENE ' + (scene + 1).toString().padStart(2, '0') + '  TAKE 01 │',
            '├────────────────────┤',
            '│ CLIFT PRODUCTION   │',
            '│ DIR: ASCII MASTER  │',
            '│ CAM: TERMINAL      │',
            '└────────────────────┘'
        ];
        
        clapper.forEach((line, y) => {
            for (let x = 0; x < line.length; x++) {
                const px = Math.floor(clapX + x);
                const py = Math.floor(clapY + y);
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    buffer[py][px] = line[x];
                }
            }
        });
        
        // Clap sticks (animated)
        const clapAngle = Math.sin(t * 20) * 0.3;
        const stickY = clapY - 1;
        for (let x = 0; x < 20; x++) {
            const px = Math.floor(clapX + x);
            const py = Math.floor(stickY - x * clapAngle);
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = '=';
            }
        }
    } else {
        // Scene content
        switch (scene) {
            case 0: // Action scene
                const explosionX = Math.floor(Math.random() * width);
                const explosionY = Math.floor(Math.random() * height);
                const explosionRadius = 3 + Math.floor(avgAudio * 5);
                
                for (let dy = -explosionRadius; dy <= explosionRadius; dy++) {
                    for (let dx = -explosionRadius; dx <= explosionRadius; dx++) {
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist <= explosionRadius) {
                            const px = explosionX + dx;
                            const py = explosionY + dy;
                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                buffer[py][px] = dist < explosionRadius/2 ? '*' : '+';
                            }
                        }
                    }
                }
                break;
                
            case 1: // Dramatic close-up
                const eyeX = width / 2;
                const eyeY = height / 2;
                
                // Large eye
                for (let x = -8; x <= 8; x++) {
                    const y = Math.floor(Math.sqrt(64 - x*x) * 0.5);
                    const topY = Math.floor(eyeY - y);
                    const botY = Math.floor(eyeY + y);
                    const px = Math.floor(eyeX + x);
                    
                    if (px >= 0 && px < width) {
                        if (topY >= 0 && topY < height) buffer[topY][px] = '-';
                        if (botY >= 0 && botY < height) buffer[botY][px] = '-';
                    }
                }
                
                // Iris
                for (let dy = -3; dy <= 3; dy++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        if (dx*dx + dy*dy <= 9) {
                            const px = Math.floor(eyeX + dx);
                            const py = Math.floor(eyeY + dy);
                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                buffer[py][px] = dx*dx + dy*dy <= 4 ? '@' : 'O';
                            }
                        }
                    }
                }
                break;
                
            case 2: // Chase scene
                for (let i = 0; i < 3; i++) {
                    const carX = Math.floor((t * 20 + i * 15) % width);
                    const carY = height - 5 + i;
                    
                    if (carX >= 0 && carX < width - 3 && carY >= 0 && carY < height) {
                        buffer[carY][carX] = '<';
                        buffer[carY][carX + 1] = '=';
                        buffer[carY][carX + 2] = '>';
                    }
                }
                break;
                
            case 3: // Credits roll
                const credits = [
                    'DIRECTED BY',
                    'ASCII MASTER',
                    '',
                    'PRODUCED BY',
                    'TERMINAL STUDIOS',
                    '',
                    'STARRING',
                    'THE CHARACTERS'
                ];
                
                const scrollY = Math.floor(t * 5) % (height + credits.length * 2);
                
                credits.forEach((line, i) => {
                    const lineY = height - scrollY + i * 2;
                    if (lineY >= 0 && lineY < height) {
                        const lineX = Math.floor((width - line.length) / 2);
                        for (let c = 0; c < line.length; c++) {
                            if (lineX + c >= 0 && lineX + c < width) {
                                buffer[lineY][lineX + c] = line[c];
                            }
                        }
                    }
                });
                break;
        }
    }
    
    // Director viewfinder overlay
    const viewfinderSize = 3;
    // Corners
    for (let i = 0; i < viewfinderSize; i++) {
        // Top-left
        if (i < width) buffer[0][i] = '─';
        if (i < height) buffer[i][0] = '│';
        // Top-right
        if (width - 1 - i >= 0) buffer[0][width - 1 - i] = '─';
        if (i < height) buffer[i][width - 1] = '│';
        // Bottom-left
        if (i < width) buffer[height - 1][i] = '─';
        if (height - 1 - i >= 0) buffer[height - 1 - i][0] = '│';
        // Bottom-right
        if (width - 1 - i >= 0) buffer[height - 1][width - 1 - i] = '─';
        if (height - 1 - i >= 0) buffer[height - 1 - i][width - 1] = '│';
    }
    
    // Recording indicator
    if (Math.sin(t * 4) > 0) {
        const recStr = '● REC';
        for (let i = 0; i < recStr.length && i + 5 < width; i++) {
            buffer[2][i + 5] = recStr[i];
        }
    }
};
