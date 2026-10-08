// CLIFT scenes - category 8: Tech & Digital

// Category 8: Tech & Digital (80-89)

// Scene 80: Circuit Board
CLIFTScenes[80] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Circuit traces
    const traces = [];
    for (let i = 0; i < 10; i++) {
        traces.push({
            startX: Math.floor(Math.random() * width),
            startY: Math.floor(Math.random() * height),
            endX: Math.floor(Math.random() * width),
            endY: Math.floor(Math.random() * height),
            active: Math.sin(t + i) > 0
        });
    }
    
    // Draw PCB background
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if ((x + y) % 10 === 0) {
                buffer[y][x] = '·';
            }
        }
    }
    
    // Draw traces
    traces.forEach((trace, i) => {
        const char = trace.active ? '=' : '-';
        // Horizontal segment
        const midY = Math.floor((trace.startY + trace.endY) / 2);
        for (let x = Math.min(trace.startX, trace.endX); x <= Math.max(trace.startX, trace.endX); x++) {
            if (x >= 0 && x < width && midY >= 0 && midY < height) {
                buffer[midY][x] = char;
            }
        }
        // Vertical segments
        for (let y = Math.min(trace.startY, midY); y <= Math.max(trace.startY, midY); y++) {
            if (trace.startX >= 0 && trace.startX < width && y >= 0 && y < height) {
                buffer[y][trace.startX] = char;
            }
        }
        for (let y = Math.min(midY, trace.endY); y <= Math.max(midY, trace.endY); y++) {
            if (trace.endX >= 0 && trace.endX < width && y >= 0 && y < height) {
                buffer[y][trace.endX] = char;
            }
        }
    });
    
    // Draw components
    const componentCount = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < componentCount; i++) {
        const cx = Math.floor(Math.sin(i * 3.7) * width / 2 + width / 2);
        const cy = Math.floor(Math.cos(i * 2.3) * height / 2 + height / 2);
        
        if (cx >= 1 && cx < width - 1 && cy >= 0 && cy < height) {
            // IC chip
            buffer[cy][cx - 1] = '[';
            buffer[cy][cx] = Math.sin(t * 5 + i) > 0 ? '@' : 'O';
            buffer[cy][cx + 1] = ']';
        }
    }
    
    // Animated electrons (audio reactive)
    const electronCount = Math.floor(avgAudio * 20);
    for (let i = 0; i < electronCount; i++) {
        const progress = ((t * 2 + i * 0.1) % 1);
        const traceIndex = i % traces.length;
        const trace = traces[traceIndex];
        
        if (trace.active) {
            const x = trace.startX + (trace.endX - trace.startX) * progress;
            const y = trace.startY + (trace.endY - trace.startY) * progress;
            
            if (Math.floor(x) >= 0 && Math.floor(x) < width && 
                Math.floor(y) >= 0 && Math.floor(y) < height) {
                buffer[Math.floor(y)][Math.floor(x)] = '*';
            }
        }
    }
};

// Scene 81: Binary Matrix
CLIFTScenes[81] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Binary data streams
    for (let x = 0; x < width; x++) {
        const columnSpeed = 0.5 + Math.sin(x * 0.1) * 0.3 + avgAudio;
        const offset = (t * columnSpeed * 10 + x * 2) % (height * 2);
        
        for (let y = 0; y < height; y++) {
            const charPos = (y + offset) % (height * 2);
            
            if (charPos < height) {
                // Binary digits
                const isBright = charPos < 3 || (charPos > height - 5 && charPos < height - 2);
                
                if (Math.random() < 0.9) {
                    if (isBright) {
                        buffer[y][x] = Math.random() > 0.5 ? '1' : '0';
                    } else {
                        const dimChance = 1 - (Math.abs(charPos - height/2) / (height/2));
                        if (Math.random() < dimChance * 0.7) {
                            buffer[y][x] = Math.random() > 0.5 ? '1' : '0';
                        }
                    }
                }
            }
        }
    }
    
    // Glitch blocks (audio reactive)
    if (avgAudio > 0.5) {
        const glitchCount = Math.floor(avgAudio * 5);
        for (let i = 0; i < glitchCount; i++) {
            const gx = Math.floor(Math.random() * width);
            const gy = Math.floor(Math.random() * height);
            const gw = Math.floor(Math.random() * 10 + 5);
            const gh = Math.floor(Math.random() * 3 + 1);
            
            for (let dy = 0; dy < gh; dy++) {
                for (let dx = 0; dx < gw; dx++) {
                    const x = gx + dx;
                    const y = gy + dy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = Math.random() > 0.5 ? '█' : '▓';
                    }
                }
            }
        }
    }
};

// Scene 82: Network Visualization
CLIFTScenes[82] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize network nodes
    if (!params._networkNodes) {
        params._networkNodes = [];
        for (let i = 0; i < 12; i++) {
            params._networkNodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                type: Math.floor(Math.random() * 3),
                connections: []
            });
        }
        
        // Create connections
        params._networkNodes.forEach((node, i) => {
            const numConnections = 2 + Math.floor(Math.random() * 2);
            for (let j = 0; j < numConnections; j++) {
                const target = Math.floor(Math.random() * params._networkNodes.length);
                if (target !== i) {
                    node.connections.push(target);
                }
            }
        });
    }
    
    const nodes = params._networkNodes;
    
    // Update nodes
    nodes.forEach(node => {
        node.x += node.vx + Math.sin(t + node.x * 0.1) * 0.2;
        node.y += node.vy + Math.cos(t + node.y * 0.1) * 0.1;
        
        // Bounce off walls
        if (node.x < 0 || node.x > width) node.vx = -node.vx;
        if (node.y < 0 || node.y > height) node.vy = -node.vy;
        
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
    });
    
    // Draw connections with data packets
    nodes.forEach((node, i) => {
        node.connections.forEach((targetIdx, connIdx) => {
            const target = nodes[targetIdx];
            
            // Draw connection line
            const steps = 20;
            for (let s = 0; s < steps; s++) {
                const t = s / steps;
                const x = Math.floor(node.x + (target.x - node.x) * t);
                const y = Math.floor(node.y + (target.y - node.y) * t);
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    buffer[y][x] = '.';
                }
            }
            
            // Animated data packets
            const packetProgress = ((time * 0.002 + i + connIdx * 0.3) % 1);
            const px = Math.floor(node.x + (target.x - node.x) * packetProgress);
            const py = Math.floor(node.y + (target.y - node.y) * packetProgress);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = avgAudio > 0.5 ? '@' : '*';
            }
        });
    });
    
    // Draw nodes
    const nodeChars = ['[O]', '{#}', '<*>'];
    nodes.forEach(node => {
        const x = Math.floor(node.x);
        const y = Math.floor(node.y);
        const nodeChar = nodeChars[node.type];
        
        for (let i = 0; i < nodeChar.length; i++) {
            if (x - 1 + i >= 0 && x - 1 + i < width && y >= 0 && y < height) {
                buffer[y][x - 1 + i] = nodeChar[i];
            }
        }
    });
};

// Scene 83: Blockchain Visualization
CLIFTScenes[83] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Block dimensions
    const blockWidth = 12;
    const blockHeight = 5;
    const blockSpacing = 3;
    
    // Calculate visible blocks
    const totalBlocks = 10;
    const scrollOffset = (t * 5) % ((blockWidth + blockSpacing) * 2);
    
    // Draw blockchain
    for (let i = 0; i < totalBlocks; i++) {
        const blockX = i * (blockWidth + blockSpacing) - scrollOffset;
        const blockY = height / 2 - blockHeight / 2 + Math.sin(t + i) * 2;
        
        if (blockX + blockWidth > 0 && blockX < width) {
            // Draw block
            for (let y = 0; y < blockHeight; y++) {
                for (let x = 0; x < blockWidth; x++) {
                    const px = Math.floor(blockX + x);
                    const py = Math.floor(blockY + y);
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        // Block border
                        if (y === 0 || y === blockHeight - 1 || x === 0 || x === blockWidth - 1) {
                            buffer[py][px] = '#';
                        } else {
                            // Block content (hash visualization)
                            const hashChar = ((x + y + i) % 3 === 0) ? 
                                (Math.random() > 0.5 ? '1' : '0') : ' ';
                            buffer[py][px] = hashChar;
                        }
                    }
                }
            }
            
            // Draw chain links
            if (i < totalBlocks - 1 && blockX + blockWidth < width) {
                const linkY = Math.floor(blockY + blockHeight / 2);
                for (let lx = blockX + blockWidth; lx < blockX + blockWidth + blockSpacing; lx++) {
                    if (lx >= 0 && lx < width && linkY >= 0 && linkY < height) {
                        buffer[linkY][Math.floor(lx)] = '=';
                    }
                }
            }
        }
    }
    
    // Mining animation (audio reactive)
    if (avgAudio > 0.4) {
        const mineX = Math.floor(width * 0.8);
        const mineY = Math.floor(height * 0.2);
        const mineRadius = 2 + Math.floor(avgAudio * 3);
        
        for (let dy = -mineRadius; dy <= mineRadius; dy++) {
            for (let dx = -mineRadius; dx <= mineRadius; dx++) {
                if (Math.abs(dx) + Math.abs(dy) <= mineRadius) {
                    const px = mineX + dx;
                    const py = mineY + dy;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        buffer[py][px] = Math.random() > 0.5 ? '*' : '+';
                    }
                }
            }
        }
    }
};

// Scene 84: CPU Monitor
CLIFTScenes[84] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize CPU cores
    if (!params._cpuCores) {
        params._cpuCores = [];
        for (let i = 0; i < 8; i++) {
            params._cpuCores.push({
                usage: Math.random(),
                temp: 40 + Math.random() * 30,
                history: new Array(20).fill(0)
            });
        }
    }
    
    const cores = params._cpuCores;
    
    // Update cores
    cores.forEach((core, i) => {
        // Simulate CPU usage
        core.usage = Math.max(0, Math.min(1, 
            core.usage + (Math.random() - 0.5) * 0.2 + avgAudio * 0.3));
        core.temp = 40 + core.usage * 50 + Math.random() * 10;
        
        // Update history
        core.history.shift();
        core.history.push(core.usage);
    });
    
    // Draw CPU grid
    const coreWidth = Math.floor(width / 4) - 2;
    const coreHeight = Math.floor(height / 2) - 2;
    
    cores.forEach((core, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x0 = col * (coreWidth + 2) + 1;
        const y0 = row * (coreHeight + 2) + 1;
        
        // Draw core border
        for (let x = 0; x < coreWidth; x++) {
            if (x0 + x < width) {
                buffer[y0][x0 + x] = '-';
                buffer[y0 + coreHeight - 1][x0 + x] = '-';
            }
        }
        for (let y = 0; y < coreHeight; y++) {
            if (y0 + y < height) {
                buffer[y0 + y][x0] = '|';
                if (x0 + coreWidth - 1 < width) {
                    buffer[y0 + y][x0 + coreWidth - 1] = '|';
                }
            }
        }
        
        // Draw usage bar
        const barHeight = Math.floor(core.usage * (coreHeight - 2));
        for (let y = 0; y < barHeight; y++) {
            for (let x = 2; x < coreWidth - 2; x++) {
                const py = y0 + coreHeight - 2 - y;
                const px = x0 + x;
                if (px < width && py < height) {
                    buffer[py][px] = core.usage > 0.8 ? '#' : 
                                    core.usage > 0.5 ? '=' : 
                                    ':';
                }
            }
        }
        
        // Core label
        const label = `C${i}`;
        if (y0 + 1 < height && x0 + 2 < width) {
            buffer[y0 + 1][x0 + 2] = label[0];
            buffer[y0 + 1][x0 + 3] = label[1];
        }
        
        // Temperature indicator
        if (core.temp > 80) {
            if (y0 + 2 < height && x0 + 2 < width) {
                buffer[y0 + 2][x0 + 2] = '!';
            }
        }
    });
    
    // Overall system load
    const avgUsage = cores.reduce((sum, core) => sum + core.usage, 0) / cores.length;
    const loadStr = `LOAD: ${Math.floor(avgUsage * 100)}%`;
    for (let i = 0; i < loadStr.length && i < width; i++) {
        buffer[height - 1][i] = loadStr[i];
    }
};

// Scene 85: Data Stream
CLIFTScenes[85] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Data channels
    const channels = 5;
    const channelHeight = Math.floor(height / channels);
    
    for (let ch = 0; ch < channels; ch++) {
        const y0 = ch * channelHeight;
        const speed = 1 + ch * 0.5 + avgAudio * 2;
        const offset = (t * speed * 10) % (width * 2);
        
        // Channel separator
        if (ch > 0) {
            for (let x = 0; x < width; x++) {
                buffer[y0][x] = '-';
            }
        }
        
        // Data packets
        for (let x = 0; x < width; x++) {
            const dataX = (x + offset) % (width * 2);
            
            if (dataX < width) {
                // Packet structure
                const packetPhase = Math.floor(dataX / 8) % 4;
                let char = ' ';
                
                switch (packetPhase) {
                    case 0: // Header
                        char = '[';
                        break;
                    case 1: // Data
                        char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                        break;
                    case 2: // More data
                        char = String.fromCharCode(48 + Math.floor(Math.random() * 10));
                        break;
                    case 3: // Footer
                        char = ']';
                        break;
                }
                
                // Draw in channel
                for (let dy = 1; dy < channelHeight && y0 + dy < height; dy++) {
                    if (dy === Math.floor(channelHeight / 2)) {
                        buffer[y0 + dy][x] = char;
                    } else if (Math.random() < 0.1 * avgAudio) {
                        // Noise
                        buffer[y0 + dy][x] = '.';
                    }
                }
            }
        }
        
        // Channel label
        if (y0 + channelHeight / 2 < height) {
            const label = `CH${ch}`;
            for (let i = 0; i < label.length && i < width; i++) {
                buffer[Math.floor(y0 + channelHeight / 2)][i] = label[i];
            }
        }
    }
};

// Scene 86: Server Rack
CLIFTScenes[86] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Server units
    const serverHeight = 3;
    const serverCount = Math.floor(height / (serverHeight + 1));
    
    for (let s = 0; s < serverCount; s++) {
        const y0 = s * (serverHeight + 1);
        const isActive = Math.sin(t + s * 0.5) > -0.5;
        const load = isActive ? 0.3 + avgAudio * 0.7 : 0.1;
        
        // Server chassis
        for (let y = 0; y < serverHeight && y0 + y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y === 0 || y === serverHeight - 1) {
                    buffer[y0 + y][x] = '=';
                } else if (x === 0 || x === width - 1) {
                    buffer[y0 + y][x] = '|';
                } else if (x < 10) {
                    // Front panel
                    if (x === 2 && y === 1) {
                        // Power LED
                        buffer[y0 + y][x] = isActive ? '@' : 'o';
                    } else if (x >= 5 && x <= 8 && y === 1) {
                        // Activity LEDs
                        buffer[y0 + y][x] = Math.random() < load ? '*' : '.';
                    }
                } else if (x > width - 15) {
                    // Ventilation
                    if ((x + y) % 2 === 0) {
                        buffer[y0 + y][x] = '░';
                    }
                } else {
                    // Server label/status
                    const label = `SERVER-${s.toString().padStart(2, '0')} LOAD:${Math.floor(load * 100)}%`;
                    if (y === 1 && x - 12 >= 0 && x - 12 < label.length) {
                        buffer[y0 + y][x] = label[x - 12];
                    }
                }
            }
        }
    }
    
    // Network activity indicator
    const netY = height - 1;
    const netActivity = Math.sin(t * 10) > 0;
    const netStr = netActivity ? 'NET:[>>>>]' : 'NET:[    ]';
    for (let i = 0; i < netStr.length && i < width; i++) {
        buffer[netY][width - netStr.length + i] = netStr[i];
    }
};

// Scene 87: Quantum Computing
CLIFTScenes[87] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Qubit states
    const qubitCount = 8;
    const qubitSpacing = width / (qubitCount + 1);
    
    for (let q = 0; q < qubitCount; q++) {
        const qx = (q + 1) * qubitSpacing;
        const qy = height / 2;
        
        // Qubit superposition visualization
        const phase = t * 2 + q * Math.PI / 4;
        const amplitude = 0.5 + avgAudio * 0.5;
        
        // Bloch sphere representation
        const radius = 5 + amplitude * 3;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const x = Math.floor(qx + Math.cos(angle + phase) * radius);
            const y = Math.floor(qy + Math.sin(angle + phase) * radius * 0.5);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y][x] = Math.random() > 0.5 ? '+' : '-';
            }
        }
        
        // Qubit center
        if (Math.floor(qx) >= 0 && Math.floor(qx) < width && 
            Math.floor(qy) >= 0 && Math.floor(qy) < height) {
            buffer[Math.floor(qy)][Math.floor(qx)] = 'Q';
        }
        
        // Entanglement lines
        if (q < qubitCount - 1) {
            const nextQx = (q + 2) * qubitSpacing;
            const steps = Math.abs(nextQx - qx);
            
            for (let s = 0; s < steps; s += 2) {
                const ex = Math.floor(qx + s);
                const ey = Math.floor(qy + Math.sin(t * 3 + s * 0.1) * 2);
                
                if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                    buffer[ey][ex] = '~';
                }
            }
        }
    }
    
    // Quantum gates
    const gateY = Math.floor(height * 0.8);
    const gates = ['H', 'X', 'Y', 'Z', 'CNOT'];
    gates.forEach((gate, i) => {
        const gx = Math.floor((i + 1) * width / (gates.length + 1));
        
        if (gx - 2 >= 0 && gx + 2 < width && gateY >= 0 && gateY < height) {
            // Gate box
            buffer[gateY][gx - 2] = '[';
            buffer[gateY][gx + 2] = ']';
            
            // Gate name
            for (let c = 0; c < gate.length; c++) {
                if (gx - gate.length/2 + c >= 0 && gx - gate.length/2 + c < width) {
                    buffer[gateY][Math.floor(gx - gate.length/2 + c)] = gate[c];
                }
            }
        }
    });
};

// Scene 88: AI Neural Processor
CLIFTScenes[88] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Neural network layers
    const layers = [4, 6, 8, 6, 4, 2];
    const layerSpacing = width / (layers.length + 1);
    
    // Draw neurons and connections
    let prevLayerNeurons = [];
    
    layers.forEach((neuronCount, layerIndex) => {
        const layerX = (layerIndex + 1) * layerSpacing;
        const neuronSpacing = height / (neuronCount + 1);
        const currentLayerNeurons = [];
        
        // Draw neurons in this layer
        for (let n = 0; n < neuronCount; n++) {
            const nx = layerX;
            const ny = (n + 1) * neuronSpacing;
            currentLayerNeurons.push({ x: nx, y: ny });
            
            // Activation level
            const activation = (Math.sin(t * 3 + layerIndex + n) + 1) / 2 * avgAudio;
            
            // Draw neuron
            if (Math.floor(nx) >= 0 && Math.floor(nx) < width && 
                Math.floor(ny) >= 0 && Math.floor(ny) < height) {
                if (activation > 0.7) {
                    buffer[Math.floor(ny)][Math.floor(nx)] = '@';
                } else if (activation > 0.3) {
                    buffer[Math.floor(ny)][Math.floor(nx)] = 'O';
                } else {
                    buffer[Math.floor(ny)][Math.floor(nx)] = 'o';
                }
            }
            
            // Draw connections to previous layer
            if (layerIndex > 0) {
                prevLayerNeurons.forEach(prevNeuron => {
                    // Connection strength based on audio
                    if (Math.random() < 0.3 + avgAudio * 0.4) {
                        const steps = 10;
                        for (let s = 0; s < steps; s++) {
                            const t = s / steps;
                            const cx = Math.floor(prevNeuron.x + (nx - prevNeuron.x) * t);
                            const cy = Math.floor(prevNeuron.y + (ny - prevNeuron.y) * t);
                            
                            if (cx >= 0 && cx < width && cy >= 0 && cy < height && 
                                buffer[cy][cx] === ' ') {
                                buffer[cy][cx] = activation > 0.5 ? '=' : '-';
                            }
                        }
                    }
                });
            }
        }
        
        prevLayerNeurons = currentLayerNeurons;
    });
    
    // Processing indicator
    const procStr = `PROCESSING: ${Math.floor(avgAudio * 100)}%`;
    for (let i = 0; i < procStr.length && i < width; i++) {
        buffer[0][i] = procStr[i];
    }
};

// Scene 89: Cybersecurity Matrix
CLIFTScenes[89] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Firewall visualization
    const firewallX = Math.floor(width * 0.3);
    for (let y = 0; y < height; y++) {
        if (Math.sin(y * 0.5 + t * 2) > -0.5) {
            buffer[y][firewallX] = '█';
        }
    }
    
    // Incoming threats
    const threatCount = 5 + Math.floor(bassLevel * 10);
    for (let i = 0; i < threatCount; i++) {
        const threatY = Math.floor(Math.sin(t + i * 2) * height / 2 + height / 2);
        const threatX = Math.floor((t * 20 + i * 10) % (firewallX + 10));
        
        if (threatX < firewallX && threatX >= 0 && threatY >= 0 && threatY < height) {
            // Threat visualization
            const threatType = i % 3;
            let threatChar = 'X';
            
            switch (threatType) {
                case 0: threatChar = 'X'; break; // Malware
                case 1: threatChar = '!'; break; // Intrusion
                case 2: threatChar = '#'; break; // DDoS
            }
            
            buffer[threatY][threatX] = threatChar;
            
            // Threat trail
            for (let tx = Math.max(0, threatX - 5); tx < threatX; tx++) {
                if (buffer[threatY][tx] === ' ') {
                    buffer[threatY][tx] = '.';
                }
            }
        }
    }
    
    // Security scan lines
    const scanY = Math.floor((t * 10) % height);
    for (let x = 0; x < width; x++) {
        if (buffer[scanY][x] === ' ') {
            buffer[scanY][x] = '-';
        }
    }
    
    // Protected zone
    for (let y = 0; y < height; y++) {
        for (let x = firewallX + 2; x < width; x++) {
            if ((x + y) % 10 === 0 && buffer[y][x] === ' ') {
                buffer[y][x] = '·';
            }
        }
    }
    
    // Encrypted data packets
    const packetCount = Math.floor(avgAudio * 5);
    for (let i = 0; i < packetCount; i++) {
        const px = firewallX + 5 + Math.floor(Math.random() * (width - firewallX - 10));
        const py = Math.floor(Math.random() * height);
        
        if (px >= 0 && px < width - 3 && py >= 0 && py < height) {
            buffer[py][px] = '[';
            buffer[py][px + 1] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            buffer[py][px + 2] = ']';
        }
    }
    
    // Security status
    const status = bassLevel > 0.7 ? 'ALERT!' : avgAudio > 0.5 ? 'SCANNING' : 'SECURE';
    const statusStr = `SECURITY: ${status}`;
    for (let i = 0; i < statusStr.length && i < width; i++) {
        buffer[height - 1][i] = statusStr[i];
    }
};
