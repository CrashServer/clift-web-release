// ============================================
// CATEGORY 21: Organic Giger-Style Cyberpunk (215-224)
// ============================================

// Scene 215: Neural Network Tendrils
CLIFTScenes[215] = function(buffer, width, height, time, params) {
    const complexity = (params.param1 || 0.5) * 4 + 1;
    const pulsation = (params.param2 || 0.5) * 2 + 0.5;
    const organicFlow = (params.param3 || 0.5) * 3 + 1;
    const t = time * 0.001;
    
    // Central neural hub
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Neural core with organic pulse
    const pulseSize = Math.floor(Math.sin(t * pulsation) * 3 + 5);
    for (let y = -pulseSize; y <= pulseSize; y++) {
        for (let x = -pulseSize; x <= pulseSize; x++) {
            const dist = Math.sqrt(x * x + y * y);
            if (dist <= pulseSize) {
                const nx = centerX + x;
                const ny = centerY + y;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const chars = ['◊', '◈', '◉', '●', '○'];
                    const charIdx = Math.floor(dist / pulseSize * chars.length);
                    buffer[ny][nx] = chars[Math.min(charIdx, chars.length - 1)];
                }
            }
        }
    }
    
    // Organic neural tendrils
    const numTendrils = Math.floor(complexity * 8);
    for (let i = 0; i < numTendrils; i++) {
        const angle = (i / numTendrils) * Math.PI * 2;
        const tendrilLength = Math.floor(Math.min(width, height) * 0.4);
        
        let currentX = centerX;
        let currentY = centerY;
        
        for (let j = 0; j < tendrilLength; j++) {
            // Organic curvature
            const curvature = Math.sin(t * organicFlow + i + j * 0.1) * 0.3;
            const flowAngle = angle + curvature + Math.sin(t * 0.5 + i) * 0.2;
            
            currentX += Math.cos(flowAngle) * 0.8;
            currentY += Math.sin(flowAngle) * 0.8;
            
            const x = Math.floor(currentX);
            const y = Math.floor(currentY);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Organic tendril characters
                const tendrilChars = ['─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼'];
                const branchProb = Math.sin(t * 2 + i + j * 0.05) * 0.3 + 0.7;
                
                if (branchProb > 0.8) {
                    buffer[y][x] = '╬'; // Major junction
                } else if (branchProb > 0.6) {
                    buffer[y][x] = '┼'; // Minor junction
                } else {
                    buffer[y][x] = tendrilChars[Math.floor(Math.random() * tendrilChars.length)];
                }
                
                // Organic growth patterns
                if (Math.random() < 0.3) {
                    const branchX = x + Math.floor(Math.sin(flowAngle + Math.PI/2) * 2);
                    const branchY = y + Math.floor(Math.cos(flowAngle + Math.PI/2) * 2);
                    if (branchX >= 0 && branchX < width && branchY >= 0 && branchY < height) {
                        buffer[branchY][branchX] = '╱';
                    }
                }
            }
        }
    }
    
    // Synaptic nodes
    for (let i = 0; i < 15; i++) {
        const nodeX = Math.floor(Math.sin(t * 0.7 + i) * width * 0.4 + centerX);
        const nodeY = Math.floor(Math.cos(t * 0.5 + i) * height * 0.4 + centerY);
        
        if (nodeX >= 0 && nodeX < width && nodeY >= 0 && nodeY < height) {
            const nodeChars = ['⬢', '⬡', '◬', '◭', '◮'];
            buffer[nodeY][nodeX] = nodeChars[i % nodeChars.length];
        }
    }
};

// Scene 216: Biomechanical Spine Matrix
CLIFTScenes[216] = function(buffer, width, height, time, params) {
    const spineCount = Math.floor((params.param1 || 0.5) * 3) + 2;
    const vertebraeSize = (params.param2 || 0.5) * 2 + 1;
    const mechanicalFlow = (params.param3 || 0.5) * 3 + 1;
    const t = time * 0.001;
    
    // Multiple parallel spines
    for (let spine = 0; spine < spineCount; spine++) {
        const spineX = Math.floor((width / (spineCount + 1)) * (spine + 1));
        const spineFlow = Math.sin(t * mechanicalFlow + spine) * 0.5;
        
        // Vertebrae chain
        for (let v = 0; v < height / 3; v++) {
            const vertebraeY = v * 3;
            const curvature = Math.sin(v * 0.3 + t * 2 + spine) * 3;
            const vertebraX = Math.floor(spineX + curvature + spineFlow);
            
            if (vertebraX >= 1 && vertebraX < width - 1 && vertebraeY >= 0 && vertebraeY < height - 2) {
                // Central vertebra
                buffer[vertebraeY][vertebraX] = '◉';
                buffer[vertebraeY + 1][vertebraX] = '║';
                buffer[vertebraeY + 2][vertebraX] = '◉';
                
                // Mechanical extensions
                const extensionSize = Math.floor(vertebraeSize * 2);
                for (let ext = 1; ext <= extensionSize; ext++) {
                    // Left mechanical parts
                    if (vertebraX - ext >= 0) {
                        const mechChar = ext === 1 ? '═' : (ext === 2 ? '╬' : '─');
                        buffer[vertebraeY + 1][vertebraX - ext] = mechChar;
                    }
                    
                    // Right mechanical parts
                    if (vertebraX + ext < width) {
                        const mechChar = ext === 1 ? '═' : (ext === 2 ? '╬' : '─');
                        buffer[vertebraeY + 1][vertebraX + ext] = mechChar;
                    }
                }
                
                // Organic connectors
                if (v > 0) {
                    for (let connector = 1; connector < 3; connector++) {
                        if (vertebraeY - connector >= 0) {
                            const connectorChars = ['╨', '╥', '╫'];
                            buffer[vertebraeY - connector][vertebraX] = connectorChars[connector - 1];
                        }
                    }
                }
                
                // Biomechanical tendrils
                if (Math.sin(t * 3 + v + spine) > 0.5) {
                    const tendrilLength = Math.floor(vertebraeSize * 3);
                    for (let tend = 1; tend <= tendrilLength; tend++) {
                        const tendrilAngle = Math.sin(t + v + spine) * Math.PI / 3;
                        const tendrilX = Math.floor(vertebraX + Math.cos(tendrilAngle) * tend);
                        const tendrilY = vertebraeY + 1 + Math.floor(Math.sin(tendrilAngle) * tend);
                        
                        if (tendrilX >= 0 && tendrilX < width && tendrilY >= 0 && tendrilY < height) {
                            const tendrilChars = ['╱', '╲', '╳', '╬'];
                            buffer[tendrilY][tendrilX] = tendrilChars[tend % tendrilChars.length];
                        }
                    }
                }
            }
        }
    }
    
    // Fluid chambers
    for (let chamber = 0; chamber < 4; chamber++) {
        const chamberX = Math.floor(Math.sin(t * 0.8 + chamber) * width * 0.3 + width / 2);
        const chamberY = Math.floor(Math.cos(t * 0.6 + chamber) * height * 0.3 + height / 2);
        
        if (chamberX >= 2 && chamberX < width - 2 && chamberY >= 2 && chamberY < height - 2) {
            const chamberSize = Math.floor(Math.sin(t * 2 + chamber) * 2 + 3);
            for (let cy = -chamberSize; cy <= chamberSize; cy++) {
                for (let cx = -chamberSize; cx <= chamberSize; cx++) {
                    const dist = Math.sqrt(cx * cx + cy * cy);
                    if (dist <= chamberSize) {
                        const x = chamberX + cx;
                        const y = chamberY + cy;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const fluidChars = ['▓', '▒', '░', '·'];
                            const fluidIdx = Math.floor(dist / chamberSize * fluidChars.length);
                            buffer[y][x] = fluidChars[Math.min(fluidIdx, fluidChars.length - 1)];
                        }
                    }
                }
            }
        }
    }
};

// Scene 217: Cybernetic Membrane
CLIFTScenes[217] = function(buffer, width, height, time, params) {
    const membraneThickness = (params.param1 || 0.5) * 3 + 1;
    const pulsation = (params.param2 || 0.5) * 4 + 1;
    const circuitDensity = (params.param3 || 0.5) * 20 + 10;
    const t = time * 0.001;
    
    // Organic membrane structure
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const waveX = Math.sin(x * 0.1 + t * pulsation) * membraneThickness;
            const waveY = Math.cos(y * 0.08 + t * pulsation * 0.7) * membraneThickness;
            const membrane = waveX + waveY;
            
            if (Math.abs(membrane) < 1.5) {
                // Membrane surface
                const surfaceChars = ['▓', '▒', '░', '·', '∙'];
                const surfaceIdx = Math.floor(Math.abs(membrane) * surfaceChars.length);
                buffer[y][x] = surfaceChars[Math.min(surfaceIdx, surfaceChars.length - 1)];
            } else if (Math.abs(membrane) < 2.5) {
                // Membrane edges
                buffer[y][x] = Math.random() < 0.3 ? '▓' : '▒';
            }
        }
    }
    
    // Cybernetic circuit patterns
    for (let circuit = 0; circuit < circuitDensity; circuit++) {
        const startX = Math.floor(Math.random() * width);
        const startY = Math.floor(Math.random() * height);
        const circuitLength = Math.floor(Math.random() * 15) + 5;
        
        let currentX = startX;
        let currentY = startY;
        let direction = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < circuitLength; i++) {
            if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
                // Circuit path
                const circuitChars = ['═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬'];
                buffer[currentY][currentX] = circuitChars[Math.floor(Math.random() * circuitChars.length)];
                
                // Circuit nodes
                if (i % 3 === 0) {
                    const nodeChars = ['◉', '◎', '⬢', '⬡'];
                    buffer[currentY][currentX] = nodeChars[Math.floor(Math.random() * nodeChars.length)];
                }
            }
            
            // Organic circuit flow
            direction += (Math.random() - 0.5) * 0.5;
            currentX += Math.floor(Math.cos(direction) * 1.5);
            currentY += Math.floor(Math.sin(direction) * 1.5);
        }
    }
    
    // Pulsating nodes
    const numNodes = 8;
    for (let node = 0; node < numNodes; node++) {
        const nodeX = Math.floor(Math.sin(t * 0.7 + node) * width * 0.4 + width / 2);
        const nodeY = Math.floor(Math.cos(t * 0.5 + node) * height * 0.4 + height / 2);
        
        if (nodeX >= 1 && nodeX < width - 1 && nodeY >= 1 && nodeY < height - 1) {
            const pulseSize = Math.floor(Math.sin(t * pulsation + node) * 2 + 3);
            
            // Node core
            buffer[nodeY][nodeX] = '◉';
            
            // Pulse ring
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                const pulseX = nodeX + Math.floor(Math.cos(angle) * pulseSize);
                const pulseY = nodeY + Math.floor(Math.sin(angle) * pulseSize);
                
                if (pulseX >= 0 && pulseX < width && pulseY >= 0 && pulseY < height) {
                    buffer[pulseY][pulseX] = '○';
                }
            }
        }
    }
    
    // Organic tears and openings
    for (let tear = 0; tear < 3; tear++) {
        const tearX = Math.floor(Math.sin(t * 0.3 + tear) * width * 0.6 + width / 2);
        const tearY = Math.floor(Math.cos(t * 0.2 + tear) * height * 0.6 + height / 2);
        const tearSize = Math.floor(Math.sin(t * 2 + tear) * 3 + 5);
        
        for (let ty = -tearSize; ty <= tearSize; ty++) {
            for (let tx = -tearSize; tx <= tearSize; tx++) {
                const dist = Math.sqrt(tx * tx + ty * ty);
                if (dist <= tearSize && dist > tearSize - 2) {
                    const x = tearX + tx;
                    const y = tearY + ty;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const tearChars = ['╱', '╲', '╳', '▓'];
                        buffer[y][x] = tearChars[Math.floor(Math.random() * tearChars.length)];
                    }
                }
            }
        }
    }
};

// Scene 218: Xenomorph Hive Network
CLIFTScenes[218] = function(buffer, width, height, time, params) {
    const hiveComplexity = (params.param1 || 0.5) * 3 + 1;
    const alienActivity = (params.param2 || 0.5) * 4 + 1;
    const biomassGrowth = (params.param3 || 0.5) * 2 + 1;
    const t = time * 0.001;
    
    // Hive structure base
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const hivePattern = Math.sin(x * 0.15 + t * 0.5) * Math.cos(y * 0.12 + t * 0.3);
            const biomass = Math.sin(x * 0.08 + y * 0.1 + t * biomassGrowth) * 2;
            
            if (hivePattern > 0.3 && biomass > 0.5) {
                const hiveChars = ['▓', '▒', '░', '∙', '·'];
                const hiveIdx = Math.floor((hivePattern + biomass) * hiveChars.length / 4);
                buffer[y][x] = hiveChars[Math.min(hiveIdx, hiveChars.length - 1)];
            }
        }
    }
    
    // Alien egg chambers
    const numChambers = Math.floor(hiveComplexity * 5);
    for (let chamber = 0; chamber < numChambers; chamber++) {
        const chamberX = Math.floor(Math.sin(t * 0.4 + chamber) * width * 0.4 + width / 2);
        const chamberY = Math.floor(Math.cos(t * 0.3 + chamber) * height * 0.4 + height / 2);
        
        if (chamberX >= 3 && chamberX < width - 3 && chamberY >= 3 && chamberY < height - 3) {
            const chamberSize = Math.floor(Math.sin(t * 2 + chamber) * 2 + 4);
            
            // Chamber walls
            for (let cy = -chamberSize; cy <= chamberSize; cy++) {
                for (let cx = -chamberSize; cx <= chamberSize; cx++) {
                    const dist = Math.sqrt(cx * cx + cy * cy);
                    if (dist <= chamberSize && dist > chamberSize - 2) {
                        const x = chamberX + cx;
                        const y = chamberY + cy;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            buffer[y][x] = '▓';
                        }
                    }
                }
            }
            
            // Alien eggs
            for (let egg = 0; egg < 3; egg++) {
                const eggAngle = (egg / 3) * Math.PI * 2 + t * 0.5;
                const eggX = chamberX + Math.floor(Math.cos(eggAngle) * (chamberSize - 2));
                const eggY = chamberY + Math.floor(Math.sin(eggAngle) * (chamberSize - 2));
                
                if (eggX >= 0 && eggX < width && eggY >= 0 && eggY < height) {
                    const eggState = Math.sin(t * alienActivity + egg + chamber);
                    if (eggState > 0.7) {
                        buffer[eggY][eggX] = '◉'; // Mature egg
                    } else if (eggState > 0.3) {
                        buffer[eggY][eggX] = '◎'; // Developing egg
                    } else {
                        buffer[eggY][eggX] = '○'; // Young egg
                    }
                }
            }
        }
    }
    
    // Alien movement patterns
    for (let alien = 0; alien < 4; alien++) {
        const pathLength = 20;
        const alienSpeed = alienActivity * 0.5;
        const baseAngle = (alien / 4) * Math.PI * 2;
        
        for (let segment = 0; segment < pathLength; segment++) {
            const segmentT = t * alienSpeed + alien + segment * 0.1;
            const pathX = Math.floor(Math.sin(baseAngle + segmentT * 0.3) * width * 0.3 + width / 2);
            const pathY = Math.floor(Math.cos(baseAngle + segmentT * 0.2) * height * 0.3 + height / 2);
            
            if (pathX >= 0 && pathX < width && pathY >= 0 && pathY < height) {
                const intensity = 1 - (segment / pathLength);
                if (intensity > 0.8) {
                    buffer[pathY][pathX] = '▲'; // Alien head
                } else if (intensity > 0.6) {
                    buffer[pathY][pathX] = '╬'; // Alien body
                } else if (intensity > 0.3) {
                    buffer[pathY][pathX] = '╫'; // Alien tail
                } else {
                    buffer[pathY][pathX] = '·'; // Trail
                }
            }
        }
    }
    
    // Hive tunnels
    for (let tunnel = 0; tunnel < 6; tunnel++) {
        const tunnelAngle = (tunnel / 6) * Math.PI * 2;
        const tunnelLength = Math.floor(Math.min(width, height) * 0.4);
        
        const startX = Math.floor(width / 2 + Math.cos(tunnelAngle) * 5);
        const startY = Math.floor(height / 2 + Math.sin(tunnelAngle) * 5);
        
        for (let seg = 0; seg < tunnelLength; seg++) {
            const curvature = Math.sin(t * 0.5 + tunnel + seg * 0.1) * 0.2;
            const tunnelX = startX + Math.floor(Math.cos(tunnelAngle + curvature) * seg);
            const tunnelY = startY + Math.floor(Math.sin(tunnelAngle + curvature) * seg);
            
            if (tunnelX >= 0 && tunnelX < width && tunnelY >= 0 && tunnelY < height) {
                if (seg % 3 === 0) {
                    buffer[tunnelY][tunnelX] = '╬'; // Tunnel junction
                } else {
                    buffer[tunnelY][tunnelX] = '═'; // Tunnel wall
                }
            }
        }
    }
    
    // Organic secretions
    for (let secretion = 0; secretion < 15; secretion++) {
        const secX = Math.floor(Math.random() * width);
        const secY = Math.floor(Math.random() * height);
        const secSize = Math.floor(Math.sin(t * 3 + secretion) * 2 + 2);
        
        for (let sy = 0; sy < secSize; sy++) {
            if (secY + sy < height) {
                if (Math.random() < 0.7) {
                    buffer[secY + sy][secX] = '▓';
                }
            }
        }
    }
};

// Scene 219: Techno-Organic Fusion
CLIFTScenes[219] = function(buffer, width, height, time, params) {
    const fusionIntensity = (params.param1 || 0.5) * 3 + 1;
    const techFlow = (params.param2 || 0.5) * 4 + 1;
    const organicGrowth = (params.param3 || 0.5) * 2 + 1;
    const t = time * 0.001;
    
    // Base organic substrate
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const organic = Math.sin(x * 0.1 + t * organicGrowth) * Math.cos(y * 0.08 + t * 0.7);
            const tech = Math.sin(x * 0.05 + y * 0.06 + t * techFlow) * 2;
            
            if (organic > 0.4 && tech > 0.3) {
                // Fusion zone
                const fusionChars = ['▓', '▒', '░', '∙', '·'];
                const fusionIdx = Math.floor((organic + tech) * fusionChars.length / 4);
                buffer[y][x] = fusionChars[Math.min(fusionIdx, fusionChars.length - 1)];
            } else if (organic > 0.6) {
                // Pure organic
                buffer[y][x] = Math.random() < 0.5 ? '▒' : '░';
            } else if (tech > 0.8) {
                // Pure tech
                buffer[y][x] = Math.random() < 0.5 ? '█' : '▓';
            }
        }
    }
    
    // Techno-organic hybrid structures
    const numHybrids = Math.floor(fusionIntensity * 4);
    for (let hybrid = 0; hybrid < numHybrids; hybrid++) {
        const hybridX = Math.floor(Math.sin(t * 0.3 + hybrid) * width * 0.4 + width / 2);
        const hybridY = Math.floor(Math.cos(t * 0.2 + hybrid) * height * 0.4 + height / 2);
        
        if (hybridX >= 4 && hybridX < width - 4 && hybridY >= 4 && hybridY < height - 4) {
            const hybridSize = Math.floor(Math.sin(t * 2 + hybrid) * 3 + 5);
            
            // Hybrid core
            for (let hy = -hybridSize; hy <= hybridSize; hy++) {
                for (let hx = -hybridSize; hx <= hybridSize; hx++) {
                    const dist = Math.sqrt(hx * hx + hy * hy);
                    if (dist <= hybridSize) {
                        const x = hybridX + hx;
                        const y = hybridY + hy;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const hybridPhase = Math.sin(t * 3 + hybrid + dist * 0.2);
                            if (hybridPhase > 0.5) {
                                // Tech phase
                                const techChars = ['◉', '◎', '⬢', '⬡', '▲', '▼'];
                                buffer[y][x] = techChars[Math.floor(dist) % techChars.length];
                            } else {
                                // Organic phase
                                const organicChars = ['◊', '◈', '○', '●', '∙', '·'];
                                buffer[y][x] = organicChars[Math.floor(dist) % organicChars.length];
                            }
                        }
                    }
                }
            }
            
            // Hybrid extensions
            for (let ext = 0; ext < 8; ext++) {
                const extAngle = (ext / 8) * Math.PI * 2;
                const extLength = Math.floor(Math.sin(t * 2 + hybrid + ext) * 8 + 10);
                
                for (let seg = 1; seg <= extLength; seg++) {
                    const segX = hybridX + Math.floor(Math.cos(extAngle) * seg);
                    const segY = hybridY + Math.floor(Math.sin(extAngle) * seg);
                    
                    if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                        const segPhase = Math.sin(t * techFlow + seg * 0.1);
                        if (segPhase > 0.3) {
                            // Tech extension
                            const techExtChars = ['═', '║', '╔', '╗', '╚', '╝'];
                            buffer[segY][segX] = techExtChars[seg % techExtChars.length];
                        } else {
                            // Organic extension
                            const organicExtChars = ['╱', '╲', '╳', '▓', '▒'];
                            buffer[segY][segX] = organicExtChars[seg % organicExtChars.length];
                        }
                    }
                }
            }
        }
    }
    
    // Data streams in organic channels
    for (let stream = 0; stream < 6; stream++) {
        const streamPath = Math.floor(t * techFlow * 5 + stream * 10) % (width + height);
        let streamX, streamY;
        
        if (streamPath < width) {
            streamX = streamPath;
            streamY = Math.floor(Math.sin(streamPath * 0.1 + t * 2) * height * 0.3 + height / 2);
        } else {
            streamX = Math.floor(Math.cos((streamPath - width) * 0.1 + t * 2) * width * 0.3 + width / 2);
            streamY = streamPath - width;
        }
        
        if (streamX >= 0 && streamX < width && streamY >= 0 && streamY < height) {
            const streamChars = ['◆', '◇', '◈', '◉', '●', '○'];
            buffer[streamY][streamX] = streamChars[stream % streamChars.length];
            
            // Stream trail
            for (let trail = 1; trail <= 3; trail++) {
                const trailX = streamX - trail;
                const trailY = streamY;
                if (trailX >= 0 && trailX < width && trailY >= 0 && trailY < height) {
                    const trailChars = ['·', '∙', '▫', '▪'];
                    buffer[trailY][trailX] = trailChars[trail % trailChars.length];
                }
            }
        }
    }
    
    // Organic-tech interface nodes
    for (let node = 0; node < 12; node++) {
        const nodeX = Math.floor(Math.sin(t * 0.8 + node) * width * 0.45 + width / 2);
        const nodeY = Math.floor(Math.cos(t * 0.6 + node) * height * 0.45 + height / 2);
        
        if (nodeX >= 1 && nodeX < width - 1 && nodeY >= 1 && nodeY < height - 1) {
            const nodeState = Math.sin(t * 4 + node);
            if (nodeState > 0.7) {
                buffer[nodeY][nodeX] = '◉'; // Active tech node
            } else if (nodeState > 0.3) {
                buffer[nodeY][nodeX] = '◎'; // Hybrid node
            } else {
                buffer[nodeY][nodeX] = '○'; // Organic node
            }
        }
    }
};

// Scene 220: Cyber-Viral Infection
CLIFTScenes[220] = function(buffer, width, height, time, params) {
    const infectionRate = (params.param1 || 0.5) * 3 + 1;
    const viralSpread = (params.param2 || 0.5) * 5 + 1;
    const systemResistance = (params.param3 || 0.5) * 2 + 0.5;
    const t = time * 0.001;
    
    // Base system grid
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            if (Math.random() < 0.3) {
                buffer[y][x] = '▫';
            }
        }
    }
    
    // Viral infection centers
    const numInfections = Math.floor(infectionRate * 5);
    for (let infection = 0; infection < numInfections; infection++) {
        const infectionX = Math.floor(Math.sin(t * 0.3 + infection) * width * 0.4 + width / 2);
        const infectionY = Math.floor(Math.cos(t * 0.2 + infection) * height * 0.4 + height / 2);
        
        if (infectionX >= 2 && infectionX < width - 2 && infectionY >= 2 && infectionY < height - 2) {
            const infectionSize = Math.floor(Math.sin(t * viralSpread + infection) * 8 + 10);
            
            // Viral core
            for (let iy = -infectionSize; iy <= infectionSize; iy++) {
                for (let ix = -infectionSize; ix <= infectionSize; ix++) {
                    const dist = Math.sqrt(ix * ix + iy * iy);
                    if (dist <= infectionSize) {
                        const x = infectionX + ix;
                        const y = infectionY + iy;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const viralIntensity = 1 - (dist / infectionSize);
                            const resistance = Math.sin(t * systemResistance + x * 0.1 + y * 0.1);
                            
                            if (viralIntensity > 0.8 && resistance < 0.5) {
                                buffer[y][x] = '█'; // Full infection
                            } else if (viralIntensity > 0.6 && resistance < 0.3) {
                                buffer[y][x] = '▓'; // Heavy infection
                            } else if (viralIntensity > 0.4 && resistance < 0.1) {
                                buffer[y][x] = '▒'; // Medium infection
                            } else if (viralIntensity > 0.2 && resistance < -0.1) {
                                buffer[y][x] = '░'; // Light infection
                            } else if (resistance > 0.7) {
                                buffer[y][x] = '◉'; // System resistance
                            }
                        }
                    }
                }
            }
            
            // Viral tendrils
            for (let tendril = 0; tendril < 8; tendril++) {
                const tendrilAngle = (tendril / 8) * Math.PI * 2;
                const tendrilLength = Math.floor(Math.sin(t * 2 + infection + tendril) * 15 + 20);
                
                for (let seg = 1; seg <= tendrilLength; seg++) {
                    const curvature = Math.sin(t * 3 + tendril + seg * 0.1) * 0.3;
                    const segX = infectionX + Math.floor(Math.cos(tendrilAngle + curvature) * seg);
                    const segY = infectionY + Math.floor(Math.sin(tendrilAngle + curvature) * seg);
                    
                    if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                        const segIntensity = 1 - (seg / tendrilLength);
                        const localResistance = Math.sin(t * systemResistance + segX * 0.1 + segY * 0.1);
                        
                        if (segIntensity > 0.7 && localResistance < 0.2) {
                            buffer[segY][segX] = '▓'; // Viral tendril
                        } else if (segIntensity > 0.5 && localResistance < 0.0) {
                            buffer[segY][segX] = '▒'; // Weak tendril
                        } else if (segIntensity > 0.3 && localResistance < -0.2) {
                            buffer[segY][segX] = '░'; // Viral trace
                        }
                    }
                }
            }
        }
    }
    
    // System firewall patterns
    for (let firewall = 0; firewall < 4; firewall++) {
        const firewallX = Math.floor((firewall % 2) * width * 0.8 + width * 0.1);
        const firewallY = Math.floor(Math.floor(firewall / 2) * height * 0.8 + height * 0.1);
        
        const firewallSize = Math.floor(Math.sin(t * systemResistance + firewall) * 5 + 8);
        
        for (let fy = -firewallSize; fy <= firewallSize; fy++) {
            for (let fx = -firewallSize; fx <= firewallSize; fx++) {
                const dist = Math.sqrt(fx * fx + fy * fy);
                if (dist <= firewallSize && dist > firewallSize - 2) {
                    const x = firewallX + fx;
                    const y = firewallY + fy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const firewallStrength = Math.sin(t * 4 + firewall + dist * 0.2);
                        if (firewallStrength > 0.5) {
                            buffer[y][x] = '╬'; // Strong firewall
                        } else if (firewallStrength > 0.0) {
                            buffer[y][x] = '┼'; // Medium firewall
                        } else {
                            buffer[y][x] = '┬'; // Weak firewall
                        }
                    }
                }
            }
        }
    }
    
    // Data corruption patterns
    for (let corruption = 0; corruption < 20; corruption++) {
        const corruptX = Math.floor(Math.sin(t * viralSpread + corruption) * width);
        const corruptY = Math.floor(Math.cos(t * viralSpread + corruption * 0.7) * height);
        
        if (corruptX >= 0 && corruptX < width && corruptY >= 0 && corruptY < height) {
            const corruptionLevel = Math.sin(t * 6 + corruption);
            if (corruptionLevel > 0.8) {
                buffer[corruptY][corruptX] = '▓'; // Heavy corruption
            } else if (corruptionLevel > 0.6) {
                buffer[corruptY][corruptX] = '▒'; // Medium corruption
            } else if (corruptionLevel > 0.4) {
                buffer[corruptY][corruptX] = '░'; // Light corruption
            } else if (corruptionLevel > 0.2) {
                buffer[corruptY][corruptX] = '·'; // Trace corruption
            }
        }
    }
    
    // Antiviral response
    for (let antiviral = 0; antiviral < 6; antiviral++) {
        const antiviralX = Math.floor(Math.sin(t * systemResistance * 2 + antiviral) * width * 0.4 + width / 2);
        const antiviralY = Math.floor(Math.cos(t * systemResistance * 2 + antiviral) * height * 0.4 + height / 2);
        
        if (antiviralX >= 1 && antiviralX < width - 1 && antiviralY >= 1 && antiviralY < height - 1) {
            const antiviralState = Math.sin(t * 5 + antiviral);
            if (antiviralState > 0.7) {
                buffer[antiviralY][antiviralX] = '◉'; // Active antiviral
            } else if (antiviralState > 0.3) {
                buffer[antiviralY][antiviralX] = '◎'; // Scanning antiviral
            } else {
                buffer[antiviralY][antiviralX] = '○'; // Dormant antiviral
            }
        }
    }
};

// Scene 221: Neuro-Mechanical Interface
CLIFTScenes[221] = function(buffer, width, height, time, params) {
    const neuralDensity = (params.param1 || 0.5) * 4 + 1;
    const mechanicalPrecision = (params.param2 || 0.5) * 3 + 1;
    const interfaceSync = (params.param3 || 0.5) * 2 + 1;
    const t = time * 0.001;
    
    // Neural network base
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const neuralField = Math.sin(x * 0.1 + t * 2) * Math.cos(y * 0.08 + t * 1.5);
            const mechanicalGrid = Math.sin(x * 0.05 + y * 0.05 + t * mechanicalPrecision) * 2;
            
            if (neuralField > 0.5 && mechanicalGrid > 0.8) {
                buffer[y][x] = '▓'; // Neural-mechanical fusion
            } else if (neuralField > 0.7) {
                buffer[y][x] = '░'; // Neural tissue
            } else if (mechanicalGrid > 1.2) {
                buffer[y][x] = '▒'; // Mechanical structure
            }
        }
    }
    
    // Neural nodes
    const numNodes = Math.floor(neuralDensity * 8);
    for (let node = 0; node < numNodes; node++) {
        const nodeX = Math.floor(Math.sin(t * 0.6 + node) * width * 0.4 + width / 2);
        const nodeY = Math.floor(Math.cos(t * 0.4 + node) * height * 0.4 + height / 2);
        
        if (nodeX >= 2 && nodeX < width - 2 && nodeY >= 2 && nodeY < height - 2) {
            const nodeActivity = Math.sin(t * interfaceSync * 3 + node);
            const nodeSize = Math.floor(Math.abs(nodeActivity) * 3 + 2);
            
            // Neural core
            for (let ny = -nodeSize; ny <= nodeSize; ny++) {
                for (let nx = -nodeSize; nx <= nodeSize; nx++) {
                    const dist = Math.sqrt(nx * nx + ny * ny);
                    if (dist <= nodeSize) {
                        const x = nodeX + nx;
                        const y = nodeY + ny;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            if (dist < 1) {
                                buffer[y][x] = '◉'; // Neural core
                            } else if (dist < 2) {
                                buffer[y][x] = '◎'; // Neural membrane
                            } else {
                                buffer[y][x] = '○'; // Neural field
                            }
                        }
                    }
                }
            }
            
            // Neural connections
            for (let connection = 0; connection < 6; connection++) {
                const connAngle = (connection / 6) * Math.PI * 2;
                const connLength = Math.floor(Math.sin(t * 2 + node + connection) * 10 + 15);
                
                for (let seg = 1; seg <= connLength; seg++) {
                    const segX = nodeX + Math.floor(Math.cos(connAngle) * seg);
                    const segY = nodeY + Math.floor(Math.sin(connAngle) * seg);
                    
                    if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                        const signal = Math.sin(t * interfaceSync * 5 + seg * 0.2);
                        if (signal > 0.7) {
                            buffer[segY][segX] = '─'; // Strong signal
                        } else if (signal > 0.3) {
                            buffer[segY][segX] = '·'; // Weak signal
                        } else if (signal > 0.0) {
                            buffer[segY][segX] = '∙'; // Trace signal
                        }
                    }
                }
            }
        }
    }
    
    // Mechanical components
    for (let component = 0; component < 4; component++) {
        const compX = Math.floor((component % 2) * width * 0.6 + width * 0.2);
        const compY = Math.floor(Math.floor(component / 2) * height * 0.6 + height * 0.2);
        
        const compSize = Math.floor(Math.sin(t * mechanicalPrecision + component) * 4 + 8);
        
        // Mechanical housing
        for (let cy = -compSize; cy <= compSize; cy++) {
            for (let cx = -compSize; cx <= compSize; cx++) {
                const dist = Math.sqrt(cx * cx + cy * cy);
                if (dist <= compSize && dist > compSize - 2) {
                    const x = compX + cx;
                    const y = compY + cy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = '▓'; // Mechanical housing
                    }
                }
            }
        }
        
        // Mechanical internals
        for (let internal = 0; internal < 5; internal++) {
            const intAngle = (internal / 5) * Math.PI * 2 + t * mechanicalPrecision;
            const intRadius = Math.floor(Math.sin(t * 3 + internal) * 3 + 4);
            const intX = compX + Math.floor(Math.cos(intAngle) * intRadius);
            const intY = compY + Math.floor(Math.sin(intAngle) * intRadius);
            
            if (intX >= 0 && intX < width && intY >= 0 && intY < height) {
                const mechanicalChars = ['◉', '◎', '⬢', '⬡', '▲', '▼'];
                buffer[intY][intX] = mechanicalChars[internal % mechanicalChars.length];
            }
        }
    }
    
    // Interface channels
    for (let channel = 0; channel < 8; channel++) {
        const channelAngle = (channel / 8) * Math.PI * 2;
        const channelLength = Math.floor(Math.min(width, height) * 0.4);
        
        const startX = Math.floor(width / 2 + Math.cos(channelAngle) * 5);
        const startY = Math.floor(height / 2 + Math.sin(channelAngle) * 5);
        
        for (let seg = 0; seg < channelLength; seg++) {
            const segX = startX + Math.floor(Math.cos(channelAngle) * seg);
            const segY = startY + Math.floor(Math.sin(channelAngle) * seg);
            
            if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                const dataFlow = Math.sin(t * interfaceSync * 4 + channel + seg * 0.1);
                if (dataFlow > 0.8) {
                    buffer[segY][segX] = '═'; // High data flow
                } else if (dataFlow > 0.5) {
                    buffer[segY][segX] = '─'; // Medium data flow
                } else if (dataFlow > 0.2) {
                    buffer[segY][segX] = '·'; // Low data flow
                }
            }
        }
    }
    
    // Synaptic flashes
    for (let flash = 0; flash < 15; flash++) {
        const flashX = Math.floor(Math.sin(t * 8 + flash) * width * 0.8 + width * 0.1);
        const flashY = Math.floor(Math.cos(t * 6 + flash) * height * 0.8 + height * 0.1);
        
        if (flashX >= 0 && flashX < width && flashY >= 0 && flashY < height) {
            const flashIntensity = Math.sin(t * 10 + flash);
            if (flashIntensity > 0.9) {
                buffer[flashY][flashX] = '★'; // Intense flash
            } else if (flashIntensity > 0.7) {
                buffer[flashY][flashX] = '✦'; // Medium flash
            } else if (flashIntensity > 0.5) {
                buffer[flashY][flashX] = '✧'; // Weak flash
            }
        }
    }
};

// Scene 222: Parasitic Machinery
CLIFTScenes[222] = function(buffer, width, height, time, params) {
    const parasiteActivity = (params.param1 || 0.5) * 4 + 1;
    const hostResistance = (params.param2 || 0.5) * 3 + 1;
    const machineEvolution = (params.param3 || 0.5) * 2 + 1;
    const t = time * 0.001;
    
    // Host tissue base
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const hostPattern = Math.sin(x * 0.08 + t * 0.5) * Math.cos(y * 0.06 + t * 0.3);
            const resistance = Math.sin(x * 0.1 + y * 0.1 + t * hostResistance) * 2;
            
            if (hostPattern > 0.3 && resistance > 0.5) {
                buffer[y][x] = '▒'; // Healthy host tissue
            } else if (hostPattern > 0.1 && resistance < 0.0) {
                buffer[y][x] = '░'; // Weakened host tissue
            }
        }
    }
    
    // Parasitic colonies
    const numColonies = Math.floor(parasiteActivity * 3);
    for (let colony = 0; colony < numColonies; colony++) {
        const colonyX = Math.floor(Math.sin(t * 0.4 + colony) * width * 0.3 + width / 2);
        const colonyY = Math.floor(Math.cos(t * 0.3 + colony) * height * 0.3 + height / 2);
        
        if (colonyX >= 4 && colonyX < width - 4 && colonyY >= 4 && colonyY < height - 4) {
            const colonySize = Math.floor(Math.sin(t * 2 + colony) * 5 + 8);
            
            // Colony core
            for (let cy = -colonySize; cy <= colonySize; cy++) {
                for (let cx = -colonySize; cx <= colonySize; cx++) {
                    const dist = Math.sqrt(cx * cx + cy * cy);
                    if (dist <= colonySize) {
                        const x = colonyX + cx;
                        const y = colonyY + cy;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const parasiteIntensity = 1 - (dist / colonySize);
                            const evolution = Math.sin(t * machineEvolution + colony + dist * 0.1);
                            
                            if (parasiteIntensity > 0.8 && evolution > 0.5) {
                                buffer[y][x] = '█'; // Mature parasite
                            } else if (parasiteIntensity > 0.6 && evolution > 0.2) {
                                buffer[y][x] = '▓'; // Developing parasite
                            } else if (parasiteIntensity > 0.4 && evolution > -0.1) {
                                buffer[y][x] = '▒'; // Young parasite
                            } else if (parasiteIntensity > 0.2) {
                                buffer[y][x] = '░'; // Parasite spawn
                            }
                        }
                    }
                }
            }
            
            // Mechanical conversion
            for (let machine = 0; machine < 6; machine++) {
                const machineAngle = (machine / 6) * Math.PI * 2;
                const machineRadius = Math.floor(Math.sin(t * 3 + colony + machine) * 4 + 6);
                const machineX = colonyX + Math.floor(Math.cos(machineAngle) * machineRadius);
                const machineY = colonyY + Math.floor(Math.sin(machineAngle) * machineRadius);
                
                if (machineX >= 0 && machineX < width && machineY >= 0 && machineY < height) {
                    const machineState = Math.sin(t * machineEvolution * 2 + machine);
                    if (machineState > 0.7) {
                        buffer[machineY][machineX] = '◉'; // Active machine
                    } else if (machineState > 0.3) {
                        buffer[machineY][machineX] = '◎'; // Converting machine
                    } else {
                        buffer[machineY][machineX] = '○'; // Dormant machine
                    }
                }
            }
        }
    }
    
    // Parasitic tendrils
    for (let tendril = 0; tendril < 8; tendril++) {
        const tendrilStartX = Math.floor(Math.sin(t * 0.5 + tendril) * width * 0.4 + width / 2);
        const tendrilStartY = Math.floor(Math.cos(t * 0.4 + tendril) * height * 0.4 + height / 2);
        
        const tendrilLength = Math.floor(Math.sin(t * parasiteActivity + tendril) * 20 + 25);
        const tendrilAngle = (tendril / 8) * Math.PI * 2;
        
        for (let seg = 0; seg < tendrilLength; seg++) {
            const curvature = Math.sin(t * 2 + tendril + seg * 0.1) * 0.3;
            const segX = tendrilStartX + Math.floor(Math.cos(tendrilAngle + curvature) * seg);
            const segY = tendrilStartY + Math.floor(Math.sin(tendrilAngle + curvature) * seg);
            
            if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                const segIntensity = 1 - (seg / tendrilLength);
                const hostFight = Math.sin(t * hostResistance + segX * 0.1 + segY * 0.1);
                
                if (segIntensity > 0.7 && hostFight < 0.2) {
                    buffer[segY][segX] = '╬'; // Strong tendril
                } else if (segIntensity > 0.5 && hostFight < 0.0) {
                    buffer[segY][segX] = '┼'; // Medium tendril
                } else if (segIntensity > 0.3 && hostFight < -0.2) {
                    buffer[segY][segX] = '┬'; // Weak tendril
                } else if (hostFight > 0.8) {
                    buffer[segY][segX] = '▓'; // Host resistance
                }
            }
        }
    }
    
    // Mechanical harvesting points
    for (let harvester = 0; harvester < 5; harvester++) {
        const harvesterX = Math.floor(Math.sin(t * 0.7 + harvester) * width * 0.5 + width / 2);
        const harvesterY = Math.floor(Math.cos(t * 0.5 + harvester) * height * 0.5 + height / 2);
        
        if (harvesterX >= 2 && harvesterX < width - 2 && harvesterY >= 2 && harvesterY < height - 2) {
            const harvesterSize = Math.floor(Math.sin(t * machineEvolution + harvester) * 2 + 3);
            
            // Harvester core
            for (let hy = -harvesterSize; hy <= harvesterSize; hy++) {
                for (let hx = -harvesterSize; hx <= harvesterSize; hx++) {
                    const dist = Math.sqrt(hx * hx + hy * hy);
                    if (dist <= harvesterSize) {
                        const x = harvesterX + hx;
                        const y = harvesterY + hy;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const harvesterChars = ['◉', '◎', '⬢', '⬡'];
                            buffer[y][x] = harvesterChars[Math.floor(dist) % harvesterChars.length];
                        }
                    }
                }
            }
            
            // Harvesting arms
            for (let arm = 0; arm < 4; arm++) {
                const armAngle = (arm / 4) * Math.PI * 2 + t * 2;
                const armLength = Math.floor(Math.sin(t * 3 + harvester + arm) * 5 + 7);
                
                for (let seg = 1; seg <= armLength; seg++) {
                    const segX = harvesterX + Math.floor(Math.cos(armAngle) * seg);
                    const segY = harvesterY + Math.floor(Math.sin(armAngle) * seg);
                    
                    if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                        const armChars = ['═', '║', '╔', '╗', '╚', '╝'];
                        buffer[segY][segX] = armChars[seg % armChars.length];
                    }
                }
            }
        }
    }
    
    // Host immune response
    for (let immune = 0; immune < 10; immune++) {
        const immuneX = Math.floor(Math.sin(t * hostResistance + immune) * width * 0.6 + width * 0.2);
        const immuneY = Math.floor(Math.cos(t * hostResistance + immune) * height * 0.6 + height * 0.2);
        
        if (immuneX >= 0 && immuneX < width && immuneY >= 0 && immuneY < height) {
            const immuneState = Math.sin(t * 5 + immune);
            if (immuneState > 0.8) {
                buffer[immuneY][immuneX] = '◈'; // Strong immune response
            } else if (immuneState > 0.5) {
                buffer[immuneY][immuneX] = '◇'; // Medium immune response
            } else if (immuneState > 0.2) {
                buffer[immuneY][immuneX] = '◊'; // Weak immune response
            }
        }
    }
};

// Scene 223: Digital Flesh Matrix
CLIFTScenes[223] = function(buffer, width, height, time, params) {
    const fleshDensity = (params.param1 || 0.5) * 3 + 1;
    const digitalCorruption = (params.param2 || 0.5) * 4 + 1;
    const matrixPulse = (params.param3 || 0.5) * 2 + 1;
    const t = time * 0.001;
    
    // Digital flesh substrate
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const fleshPattern = Math.sin(x * 0.1 + t * 1.5) * Math.cos(y * 0.08 + t * 1.2);
            const digitalNoise = Math.sin(x * 0.05 + y * 0.07 + t * digitalCorruption) * 2;
            const pulse = Math.sin(t * matrixPulse + x * 0.02 + y * 0.02);
            
            if (fleshPattern > 0.4 && digitalNoise > 0.5) {
                // Digital flesh
                const fleshChars = ['▓', '▒', '░', '∙', '·'];
                const fleshIdx = Math.floor((fleshPattern + digitalNoise + pulse) * fleshChars.length / 6);
                buffer[y][x] = fleshChars[Math.min(fleshIdx, fleshChars.length - 1)];
            } else if (digitalNoise > 1.2) {
                // Digital corruption
                buffer[y][x] = Math.random() < 0.5 ? '▓' : '▒';
            } else if (pulse > 0.8) {
                // Matrix pulse
                buffer[y][x] = '·';
            }
        }
    }
    
    // Flesh nodes
    const numNodes = Math.floor(fleshDensity * 6);
    for (let node = 0; node < numNodes; node++) {
        const nodeX = Math.floor(Math.sin(t * 0.5 + node) * width * 0.4 + width / 2);
        const nodeY = Math.floor(Math.cos(t * 0.4 + node) * height * 0.4 + height / 2);
        
        if (nodeX >= 3 && nodeX < width - 3 && nodeY >= 3 && nodeY < height - 3) {
            const nodeSize = Math.floor(Math.sin(t * 2 + node) * 3 + 5);
            const nodePulse = Math.sin(t * matrixPulse * 2 + node);
            
            // Flesh node core
            for (let ny = -nodeSize; ny <= nodeSize; ny++) {
                for (let nx = -nodeSize; nx <= nodeSize; nx++) {
                    const dist = Math.sqrt(nx * nx + ny * ny);
                    if (dist <= nodeSize) {
                        const x = nodeX + nx;
                        const y = nodeY + ny;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const nodeIntensity = 1 - (dist / nodeSize);
                            const corruption = Math.sin(t * digitalCorruption + node + dist * 0.2);
                            
                            if (nodeIntensity > 0.8 && corruption > 0.5) {
                                buffer[y][x] = '◉'; // Core flesh node
                            } else if (nodeIntensity > 0.6 && corruption > 0.2) {
                                buffer[y][x] = '◎'; // Flesh membrane
                            } else if (nodeIntensity > 0.4 && corruption > -0.1) {
                                buffer[y][x] = '○'; // Flesh boundary
                            } else if (nodeIntensity > 0.2) {
                                buffer[y][x] = '∙'; // Flesh trace
                            }
                        }
                    }
                }
            }
            
            // Digital veins
            for (let vein = 0; vein < 8; vein++) {
                const veinAngle = (vein / 8) * Math.PI * 2;
                const veinLength = Math.floor(Math.sin(t * 3 + node + vein) * 15 + 20);
                
                for (let seg = 1; seg <= veinLength; seg++) {
                    const curvature = Math.sin(t * 2 + vein + seg * 0.1) * 0.2;
                    const segX = nodeX + Math.floor(Math.cos(veinAngle + curvature) * seg);
                    const segY = nodeY + Math.floor(Math.sin(veinAngle + curvature) * seg);
                    
                    if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                        const veinPulse = Math.sin(t * matrixPulse * 3 + seg * 0.2);
                        const veinIntensity = 1 - (seg / veinLength);
                        
                        if (veinIntensity > 0.7 && veinPulse > 0.5) {
                            buffer[segY][segX] = '═'; // Strong vein
                        } else if (veinIntensity > 0.5 && veinPulse > 0.2) {
                            buffer[segY][segX] = '─'; // Medium vein
                        } else if (veinIntensity > 0.3 && veinPulse > -0.1) {
                            buffer[segY][segX] = '·'; // Weak vein
                        } else if (veinPulse > 0.8) {
                            buffer[segY][segX] = '∙'; // Vein pulse
                        }
                    }
                }
            }
        }
    }
    
    // Digital artifacts
    for (let artifact = 0; artifact < 20; artifact++) {
        const artifactX = Math.floor(Math.sin(t * digitalCorruption + artifact) * width);
        const artifactY = Math.floor(Math.cos(t * digitalCorruption + artifact * 0.7) * height);
        
        if (artifactX >= 0 && artifactX < width && artifactY >= 0 && artifactY < height) {
            const artifactType = Math.floor(Math.sin(t * 4 + artifact) * 4 + 4);
            const artifactChars = ['▓', '▒', '░', '·', '∙', '▫', '▪', '■'];
            buffer[artifactY][artifactX] = artifactChars[artifactType % artifactChars.length];
        }
    }
    
    // Matrix code streams
    for (let stream = 0; stream < 8; stream++) {
        const streamX = Math.floor((stream / 8) * width);
        const streamSpeed = Math.floor(t * matrixPulse * 5 + stream * 3) % height;
        
        for (let drop = 0; drop < 10; drop++) {
            const dropY = (streamSpeed + drop * 3) % height;
            
            if (streamX >= 0 && streamX < width && dropY >= 0 && dropY < height) {
                const dropIntensity = 1 - (drop / 10);
                if (dropIntensity > 0.8) {
                    buffer[dropY][streamX] = '█'; // Bright code
                } else if (dropIntensity > 0.6) {
                    buffer[dropY][streamX] = '▓'; // Medium code
                } else if (dropIntensity > 0.4) {
                    buffer[dropY][streamX] = '▒'; // Dim code
                } else if (dropIntensity > 0.2) {
                    buffer[dropY][streamX] = '░'; // Faint code
                }
            }
        }
    }
    
    // Flesh-digital hybrid structures
    for (let hybrid = 0; hybrid < 4; hybrid++) {
        const hybridX = Math.floor((hybrid % 2) * width * 0.7 + width * 0.15);
        const hybridY = Math.floor(Math.floor(hybrid / 2) * height * 0.7 + height * 0.15);
        
        const hybridSize = Math.floor(Math.sin(t * 2 + hybrid) * 4 + 7);
        
        for (let hy = -hybridSize; hy <= hybridSize; hy++) {
            for (let hx = -hybridSize; hx <= hybridSize; hx++) {
                const dist = Math.sqrt(hx * hx + hy * hy);
                if (dist <= hybridSize && dist > hybridSize - 3) {
                    const x = hybridX + hx;
                    const y = hybridY + hy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const hybridPhase = Math.sin(t * 3 + hybrid + dist * 0.3);
                        if (hybridPhase > 0.5) {
                            // Digital phase
                            const digitalChars = ['◉', '◎', '⬢', '⬡', '▲', '▼'];
                            buffer[y][x] = digitalChars[Math.floor(dist) % digitalChars.length];
                        } else {
                            // Flesh phase
                            const fleshChars = ['●', '○', '◊', '◈', '∙', '·'];
                            buffer[y][x] = fleshChars[Math.floor(dist) % fleshChars.length];
                        }
                    }
                }
            }
        }
    }
    
    // Sensory feedback loops
    for (let feedback = 0; feedback < 6; feedback++) {
        const feedbackX = Math.floor(Math.sin(t * 0.8 + feedback) * width * 0.5 + width / 2);
        const feedbackY = Math.floor(Math.cos(t * 0.6 + feedback) * height * 0.5 + height / 2);
        
        if (feedbackX >= 1 && feedbackX < width - 1 && feedbackY >= 1 && feedbackY < height - 1) {
            const feedbackState = Math.sin(t * matrixPulse * 4 + feedback);
            if (feedbackState > 0.8) {
                buffer[feedbackY][feedbackX] = '◈'; // Strong feedback
            } else if (feedbackState > 0.5) {
                buffer[feedbackY][feedbackX] = '◇'; // Medium feedback
            } else if (feedbackState > 0.2) {
                buffer[feedbackY][feedbackX] = '◊'; // Weak feedback
            }
        }
    }
};

// Scene 224: Organic Data Streams
CLIFTScenes[224] = function(buffer, width, height, time, params) {
    const streamVelocity = (params.param1 || 0.5) * 5 + 1;
    const organicComplexity = (params.param2 || 0.5) * 3 + 1;
    const dataIntensity = (params.param3 || 0.5) * 4 + 1;
    const t = time * 0.001;
    
    // Organic substrate
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const organicBase = Math.sin(x * 0.08 + t * 0.8) * Math.cos(y * 0.06 + t * 0.6);
            const dataFlow = Math.sin(x * 0.03 + y * 0.04 + t * streamVelocity) * 2;
            
            if (organicBase > 0.3 && dataFlow > 0.5) {
                // Organic-data fusion
                const fusionChars = ['▓', '▒', '░', '∙', '·'];
                const fusionIdx = Math.floor((organicBase + dataFlow) * fusionChars.length / 4);
                buffer[y][x] = fusionChars[Math.min(fusionIdx, fusionChars.length - 1)];
            } else if (organicBase > 0.5) {
                // Organic base
                buffer[y][x] = Math.random() < 0.3 ? '▒' : '░';
            } else if (dataFlow > 1.0) {
                // Data stream
                buffer[y][x] = '·';
            }
        }
    }
    
    // Primary data streams
    for (let stream = 0; stream < 6; stream++) {
        const streamAngle = (stream / 6) * Math.PI * 2;
        const streamLength = Math.floor(Math.min(width, height) * 0.6);
        
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        for (let seg = 0; seg < streamLength; seg++) {
            const curvature = Math.sin(t * 2 + stream + seg * 0.05) * organicComplexity * 0.1;
            const segX = centerX + Math.floor(Math.cos(streamAngle + curvature) * seg);
            const segY = centerY + Math.floor(Math.sin(streamAngle + curvature) * seg);
            
            if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                const dataPacket = Math.sin(t * streamVelocity * 3 + stream - seg * 0.1);
                const streamIntensity = 1 - (seg / streamLength);
                
                if (dataPacket > 0.8 && streamIntensity > 0.7) {
                    buffer[segY][segX] = '◉'; // High-intensity data
                } else if (dataPacket > 0.5 && streamIntensity > 0.5) {
                    buffer[segY][segX] = '◎'; // Medium-intensity data
                } else if (dataPacket > 0.2 && streamIntensity > 0.3) {
                    buffer[segY][segX] = '○'; // Low-intensity data
                } else if (streamIntensity > 0.1) {
                    buffer[segY][segX] = '·'; // Data trace
                }
            }
        }
    }
    
    // Organic data nodes
    const numNodes = Math.floor(organicComplexity * 8);
    for (let node = 0; node < numNodes; node++) {
        const nodeX = Math.floor(Math.sin(t * 0.6 + node) * width * 0.4 + width / 2);
        const nodeY = Math.floor(Math.cos(t * 0.5 + node) * height * 0.4 + height / 2);
        
        if (nodeX >= 3 && nodeX < width - 3 && nodeY >= 3 && nodeY < height - 3) {
            const nodeSize = Math.floor(Math.sin(t * 3 + node) * 3 + 4);
            const nodeActivity = Math.sin(t * dataIntensity * 2 + node);
            
            // Node core
            for (let ny = -nodeSize; ny <= nodeSize; ny++) {
                for (let nx = -nodeSize; nx <= nodeSize; nx++) {
                    const dist = Math.sqrt(nx * nx + ny * ny);
                    if (dist <= nodeSize) {
                        const x = nodeX + nx;
                        const y = nodeY + ny;
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const nodeIntensity = 1 - (dist / nodeSize);
                            const organicPulse = Math.sin(t * 4 + node + dist * 0.3);
                            
                            if (nodeIntensity > 0.8 && organicPulse > 0.6) {
                                buffer[y][x] = '◉'; // Active node core
                            } else if (nodeIntensity > 0.6 && organicPulse > 0.3) {
                                buffer[y][x] = '◎'; // Node membrane
                            } else if (nodeIntensity > 0.4 && organicPulse > 0.0) {
                                buffer[y][x] = '○'; // Node field
                            } else if (nodeIntensity > 0.2) {
                                buffer[y][x] = '∙'; // Node boundary
                            }
                        }
                    }
                }
            }
            
            // Organic connections
            for (let connection = 0; connection < 6; connection++) {
                const connAngle = (connection / 6) * Math.PI * 2;
                const connLength = Math.floor(Math.sin(t * 2 + node + connection) * 12 + 15);
                
                for (let seg = 1; seg <= connLength; seg++) {
                    const organicCurve = Math.sin(t * 3 + connection + seg * 0.1) * 0.3;
                    const segX = nodeX + Math.floor(Math.cos(connAngle + organicCurve) * seg);
                    const segY = nodeY + Math.floor(Math.sin(connAngle + organicCurve) * seg);
                    
                    if (segX >= 0 && segX < width && segY >= 0 && segY < height) {
                        const dataFlow = Math.sin(t * streamVelocity * 2 + connection - seg * 0.15);
                        const connIntensity = 1 - (seg / connLength);
                        
                        if (dataFlow > 0.7 && connIntensity > 0.6) {
                            buffer[segY][segX] = '═'; // Strong data flow
                        } else if (dataFlow > 0.4 && connIntensity > 0.4) {
                            buffer[segY][segX] = '─'; // Medium data flow
                        } else if (dataFlow > 0.1 && connIntensity > 0.2) {
                            buffer[segY][segX] = '·'; // Weak data flow
                        } else if (connIntensity > 0.1) {
                            buffer[segY][segX] = '∙'; // Connection trace
                        }
                    }
                }
            }
        }
    }
    
    // Flowing data packets
    for (let packet = 0; packet < 15; packet++) {
        const packetPath = Math.floor(t * streamVelocity * 3 + packet * 5) % (width * 2);
        let packetX, packetY;
        
        if (packetPath < width) {
            packetX = packetPath;
            packetY = Math.floor(Math.sin(packetPath * 0.1 + t * 2) * height * 0.4 + height / 2);
        } else {
            packetX = Math.floor(Math.cos((packetPath - width) * 0.1 + t * 2) * width * 0.4 + width / 2);
            packetY = packetPath - width;
        }
        
        if (packetX >= 0 && packetX < width && packetY >= 0 && packetY < height) {
            const packetType = Math.floor(Math.sin(t * 5 + packet) * 4 + 4);
            const packetChars = ['◆', '◇', '◈', '◉', '●', '○', '▲', '▼'];
            buffer[packetY][packetX] = packetChars[packetType % packetChars.length];
            
            // Packet trail
            for (let trail = 1; trail <= 4; trail++) {
                const trailX = packetX - trail;
                const trailY = packetY;
                if (trailX >= 0 && trailX < width && trailY >= 0 && trailY < height) {
                    const trailIntensity = 1 - (trail / 4);
                    if (trailIntensity > 0.7) {
                        buffer[trailY][trailX] = '▓';
                    } else if (trailIntensity > 0.5) {
                        buffer[trailY][trailX] = '▒';
                    } else if (trailIntensity > 0.3) {
                        buffer[trailY][trailX] = '░';
                    } else {
                        buffer[trailY][trailX] = '·';
                    }
                }
            }
        }
    }
    
    // Organic data clusters
    for (let cluster = 0; cluster < 4; cluster++) {
        const clusterX = Math.floor((cluster % 2) * width * 0.6 + width * 0.2);
        const clusterY = Math.floor(Math.floor(cluster / 2) * height * 0.6 + height * 0.2);
        
        const clusterSize = Math.floor(Math.sin(t * 2 + cluster) * 4 + 6);
        const clusterActivity = Math.sin(t * dataIntensity + cluster);
        
        for (let cy = -clusterSize; cy <= clusterSize; cy++) {
            for (let cx = -clusterSize; cx <= clusterSize; cx++) {
                const dist = Math.sqrt(cx * cx + cy * cy);
                if (dist <= clusterSize) {
                    const x = clusterX + cx;
                    const y = clusterY + cy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const clusterIntensity = 1 - (dist / clusterSize);
                        const organicFlow = Math.sin(t * 3 + cluster + dist * 0.2);
                        
                        if (clusterIntensity > 0.8 && organicFlow > 0.5) {
                            buffer[y][x] = '◉'; // Cluster core
                        } else if (clusterIntensity > 0.6 && organicFlow > 0.2) {
                            buffer[y][x] = '◎'; // Cluster body
                        } else if (clusterIntensity > 0.4 && organicFlow > -0.1) {
                            buffer[y][x] = '○'; // Cluster edge
                        } else if (clusterIntensity > 0.2) {
                            buffer[y][x] = '∙'; // Cluster boundary
                        }
                    }
                }
            }
        }
    }
    
    // Synaptic data bursts
    for (let burst = 0; burst < 10; burst++) {
        const burstX = Math.floor(Math.sin(t * 7 + burst) * width * 0.8 + width * 0.1);
        const burstY = Math.floor(Math.cos(t * 5 + burst) * height * 0.8 + height * 0.1);
        
        if (burstX >= 0 && burstX < width && burstY >= 0 && burstY < height) {
            const burstIntensity = Math.sin(t * 8 + burst);
            if (burstIntensity > 0.9) {
                buffer[burstY][burstX] = '★'; // Intense burst
            } else if (burstIntensity > 0.7) {
                buffer[burstY][burstX] = '✦'; // Medium burst
            } else if (burstIntensity > 0.5) {
                buffer[burstY][burstX] = '✧'; // Weak burst
            }
        }
    }
};