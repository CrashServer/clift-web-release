// CLIFT Node-based Visual Scene Editor
// Create scenes by connecting visual nodes instead of writing code

window.CLIFTNodeEditor = {
    isOpen: false,
    canvas: null,
    ctx: null,
    previewCanvas: null,
    previewCtx: null,
    
    // Node system
    nodes: [],
    connections: [],
    selectedNode: null,
    dragging: false,
    dragOffset: { x: 0, y: 0 },
    panOffset: { x: 0, y: 0 },
    zoom: 1.0,
    
    // Mouse state
    mousePos: { x: 0, y: 0 },
    lastMousePos: { x: 0, y: 0 },
    
    // Connection state
    connecting: false,
    connectionStart: null,
    
    // Preview state
    previewRunning: false,
    previewTime: 0,
    
    // Node types definition
    nodeTypes: {
        // Input nodes
        'time': {
            title: 'Time',
            color: '#4CAF50',
            inputs: [],
            outputs: ['time'],
            size: { width: 80, height: 60 },
            func: (inputs, time, params) => ({ time: time * 0.001 }),
            generateCode: (node, connections) => {
                return `    const time_${node.id} = time * 0.001;`;
            }
        },
        
        'audio': {
            title: 'Audio',
            color: '#FF9800',
            inputs: [],
            outputs: ['intensity', 'bass', 'mid', 'high'],
            size: { width: 80, height: 80 },
            func: (inputs, time, params) => {
                // Try to get audio data from the global audio system
                let audio = params.audio;
                if (!audio && window.clift && window.clift.audioData) {
                    audio = window.clift.audioData;
                }
                if (!audio) {
                    audio = new Float32Array(64).fill(0.3);
                }
                
                const intensity = audio.reduce((a, b) => a + b) / audio.length;
                const bass = audio.slice(0, 16).reduce((a, b) => a + b) / 16;
                const mid = audio.slice(16, 32).reduce((a, b) => a + b) / 16;
                const high = audio.slice(32, 64).reduce((a, b) => a + b) / 32;
                return { intensity, bass, mid, high };
            },
            generateCode: (node, connections) => {
                return `    // Audio input from global audio system
    let audio = params.audio;
    if (!audio && window.clift && window.clift.audioData) {
        audio = window.clift.audioData;
    }
    if (!audio) {
        audio = new Float32Array(64).fill(0.3);
    }
    const intensity_${node.id} = audio.reduce((a, b) => a + b) / audio.length;
    const bass_${node.id} = audio.slice(0, 16).reduce((a, b) => a + b) / 16;
    const mid_${node.id} = audio.slice(16, 32).reduce((a, b) => a + b) / 16;
    const high_${node.id} = audio.slice(32, 64).reduce((a, b) => a + b) / 32;`;
            }
        },
        
        'position': {
            title: 'Position',
            color: '#2196F3',
            inputs: [],
            outputs: ['x', 'y', 'centerX', 'centerY'],
            size: { width: 80, height: 80 },
            func: (inputs, time, params) => ({
                x: params.x || 0,
                y: params.y || 0,
                centerX: params.width / 2,
                centerY: params.height / 2
            }),
            generateCode: (node, connections) => {
                return `    const x_${node.id} = params.x || 0;
    const y_${node.id} = params.y || 0;
    const centerX_${node.id} = width / 2;
    const centerY_${node.id} = height / 2;`;
            }
        },
        
        'constant': {
            title: 'Constant',
            color: '#607D8B',
            inputs: [],
            outputs: ['value'],
            size: { width: 70, height: 50 },
            properties: { value: 10 },
            func: (inputs, time, params, node) => ({
                value: node.properties.value || 0
            })
        },
        
        // Math nodes
        'add': {
            title: 'Add',
            color: '#9C27B0',
            inputs: ['a', 'b'],
            outputs: ['result'],
            size: { width: 60, height: 60 },
            func: (inputs) => ({ result: (inputs.a || 0) + (inputs.b || 0) }),
            generateCode: (node, connections) => {
                const aConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'a');
                const bConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'b');
                const aVal = aConn ? `${aConn.fromOutput}_${aConn.fromNodeId}` : '0';
                const bVal = bConn ? `${bConn.fromOutput}_${bConn.fromNodeId}` : '0';
                return `    const result_${node.id} = ${aVal} + ${bVal};`;
            }
        },
        
        'multiply': {
            title: 'Multiply',
            color: '#9C27B0',
            inputs: ['a', 'b'],
            outputs: ['result'],
            size: { width: 60, height: 60 },
            func: (inputs) => ({ result: (inputs.a || 0) * (inputs.b || 0) }),
            generateCode: (node, connections) => {
                const aConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'a');
                const bConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'b');
                const aVal = aConn ? `${aConn.fromOutput}_${aConn.fromNodeId}` : '0';
                const bVal = bConn ? `${bConn.fromOutput}_${bConn.fromNodeId}` : '0';
                return `    const result_${node.id} = ${aVal} * ${bVal};`;
            }
        },
        
        'sin': {
            title: 'Sin',
            color: '#9C27B0',
            inputs: ['value'],
            outputs: ['result'],
            size: { width: 60, height: 60 },
            func: (inputs) => ({ result: Math.sin(inputs.value || 0) }),
            generateCode: (node, connections) => {
                const valueConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'value');
                const valueVal = valueConn ? `${valueConn.fromOutput}_${valueConn.fromNodeId}` : '0';
                return `    const result_${node.id} = Math.sin(${valueVal});`;
            }
        },
        
        'cos': {
            title: 'Cos',
            color: '#9C27B0',
            inputs: ['value'],
            outputs: ['result'],
            size: { width: 60, height: 60 },
            func: (inputs) => ({ result: Math.cos(inputs.value || 0) }),
            generateCode: (node, connections) => {
                const valueConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'value');
                const valueVal = valueConn ? `${valueConn.fromOutput}_${valueConn.fromNodeId}` : '0';
                return `    const result_${node.id} = Math.cos(${valueVal});`;
            }
        },
        
        'distance': {
            title: 'Distance',
            color: '#9C27B0',
            inputs: ['x1', 'y1', 'x2', 'y2'],
            outputs: ['result'],
            size: { width: 80, height: 80 },
            func: (inputs) => {
                const dx = (inputs.x1 || 0) - (inputs.x2 || 0);
                const dy = (inputs.y1 || 0) - (inputs.y2 || 0);
                return { result: Math.sqrt(dx * dx + dy * dy) };
            }
        },
        
        'constant': {
            title: 'Constant',
            color: '#607D8B',
            inputs: [],
            outputs: ['value'],
            size: { width: 80, height: 60 },
            properties: { value: 10.0 },
            func: (inputs, time, params, node) => {
                const value = node.properties.value !== undefined ? node.properties.value : 10.0;
                console.log(`Constant: ${value}`);
                return { value: value };
            },
            generateCode: (node, connections) => {
                const value = node.properties.value !== undefined ? node.properties.value : 10.0;
                return `    const value_${node.id} = ${value};`;
            }
        },
        
        // Logic nodes
        'compare': {
            title: 'Compare',
            color: '#FF5722',
            inputs: ['a', 'b', 'threshold'],
            outputs: ['greater', 'less', 'equal'],
            size: { width: 80, height: 80 },
            func: (inputs) => {
                const a = inputs.a || 0;
                const b = inputs.b || 0;
                const threshold = inputs.threshold || 0.01;
                return {
                    greater: a > b ? 1 : 0,
                    less: a < b ? 1 : 0,
                    equal: Math.abs(a - b) < threshold ? 1 : 0
                };
            }
        },
        
        // Output nodes
        'character': {
            title: 'Character',
            color: '#F44336',
            inputs: ['x', 'y', 'char', 'condition'],
            outputs: [],
            size: { width: 80, height: 80 },
            properties: { char: '*' },
            func: (inputs, time, params, node) => {
                const x = Math.floor(inputs.x || 0);
                const y = Math.floor(inputs.y || 0);
                const condition = inputs.condition !== undefined ? inputs.condition : 1;
                const char = node.properties.char || '*';
                
                if (condition > 0 && x >= 0 && x < params.width && y >= 0 && y < params.height) {
                    params.buffer[y][x] = char;
                }
                return {};
            },
            generateCode: (node, connections) => {
                const xConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'x');
                const yConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'y');
                const condConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'condition');
                const xVal = xConn ? `${xConn.fromOutput}_${xConn.fromNodeId}` : '0';
                const yVal = yConn ? `${yConn.fromOutput}_${yConn.fromNodeId}` : '0';
                const condVal = condConn ? `${condConn.fromOutput}_${condConn.fromNodeId}` : '1';
                const char = node.properties.char || '*';
                return `    // Character output
    const x_${node.id} = Math.floor(${xVal});
    const y_${node.id} = Math.floor(${yVal});
    const condition_${node.id} = ${condVal};
    if (condition_${node.id} > 0 && x_${node.id} >= 0 && x_${node.id} < width && y_${node.id} >= 0 && y_${node.id} < height) {
        buffer[y_${node.id}][x_${node.id}] = '${char}';
    }`;
            }
        },
        
        'circle': {
            title: 'Circle',
            color: '#F44336',
            inputs: ['centerX', 'centerY', 'radius'],
            outputs: [],
            size: { width: 80, height: 80 },
            properties: { char: '*' },
            func: (inputs, time, params, node) => {
                const centerX = inputs.centerX !== undefined ? inputs.centerX : params.width / 2;
                const centerY = inputs.centerY !== undefined ? inputs.centerY : params.height / 2;
                const radius = Math.max(1, inputs.radius !== undefined ? inputs.radius : 5);
                const char = node.properties.char || '*';
                
                console.log(`Circle: center(${centerX}, ${centerY}), radius=${radius}, char=${char}`);
                
                for (let y = 0; y < params.height; y++) {
                    for (let x = 0; x < params.width; x++) {
                        const dx = x - centerX;
                        const dy = y - centerY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist <= radius) {
                            params.buffer[y][x] = char;
                        }
                    }
                }
                return {};
            },
            generateCode: (node, connections) => {
                const centerXConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'centerX');
                const centerYConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'centerY');
                const radiusConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'radius');
                const centerXVal = centerXConn ? `${centerXConn.fromOutput}_${centerXConn.fromNodeId}` : 'width / 2';
                const centerYVal = centerYConn ? `${centerYConn.fromOutput}_${centerYConn.fromNodeId}` : 'height / 2';
                const radiusVal = radiusConn ? `${radiusConn.fromOutput}_${radiusConn.fromNodeId}` : '5';
                const char = node.properties.char || '*';
                return `    // Circle output
    const centerX_${node.id} = ${centerXVal};
    const centerY_${node.id} = ${centerYVal};
    const radius_${node.id} = Math.max(1, ${radiusVal});
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX_${node.id};
            const dy = y - centerY_${node.id};
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius_${node.id}) {
                buffer[y][x] = '${char}';
            }
        }
    }`;
            }
        },
        
        'line': {
            title: 'Line',
            color: '#F44336',
            inputs: ['x1', 'y1', 'x2', 'y2', 'char'],
            outputs: [],
            size: { width: 80, height: 80 },
            properties: { char: '*' },
            func: (inputs, time, params, node) => {
                const x1 = Math.floor(inputs.x1 || 0);
                const y1 = Math.floor(inputs.y1 || 0);
                const x2 = Math.floor(inputs.x2 || params.width);
                const y2 = Math.floor(inputs.y2 || params.height);
                const char = node.properties.char || '*';
                
                // Simple line drawing (Bresenham's algorithm simplified)
                const dx = Math.abs(x2 - x1);
                const dy = Math.abs(y2 - y1);
                const sx = x1 < x2 ? 1 : -1;
                const sy = y1 < y2 ? 1 : -1;
                let err = dx - dy;
                
                let currentX = x1;
                let currentY = y1;
                
                while (true) {
                    if (currentX >= 0 && currentX < params.width && 
                        currentY >= 0 && currentY < params.height) {
                        params.buffer[currentY][currentX] = char;
                    }
                    
                    if (currentX === x2 && currentY === y2) break;
                    
                    const e2 = 2 * err;
                    if (e2 > -dy) {
                        err -= dy;
                        currentX += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        currentY += sy;
                    }
                }
                return {};
            }
        },
        
        // 3D Nodes
        'cube3d': {
            title: '3D Cube',
            color: '#FF6B6B',
            inputs: ['x', 'y', 'z', 'rotX', 'rotY', 'rotZ', 'scale'],
            outputs: [],
            size: { width: 80, height: 100 },
            properties: { char: '█' },
            func: (inputs, time, params, node) => {
                if (!window.CLIFT3DRenderer) return {};
                
                const x = inputs.x || 0;
                const y = inputs.y || 0;
                const z = inputs.z || 0;
                const rotX = inputs.rotX || 0;
                const rotY = inputs.rotY || 0;
                const rotZ = inputs.rotZ || 0;
                const scale = inputs.scale || 1;
                
                const cube = window.CLIFT3DRenderer.createCube(x, y, z, scale);
                cube.rotX = rotX;
                cube.rotY = rotY;
                cube.rotZ = rotZ;
                cube.color = node.properties.char || '█';
                
                // Add to 3D scene (will be rendered later)
                if (!params.objects3d) params.objects3d = [];
                params.objects3d.push(cube);
                
                return {};
            },
            generateCode: (node, connections) => {
                const xConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'x');
                const yConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'y');
                const zConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'z');
                const rotXConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'rotX');
                const rotYConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'rotY');
                const rotZConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'rotZ');
                const scaleConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'scale');
                
                const xVal = xConn ? `${xConn.fromOutput}_${xConn.fromNodeId}` : '0';
                const yVal = yConn ? `${yConn.fromOutput}_${yConn.fromNodeId}` : '0';
                const zVal = zConn ? `${zConn.fromOutput}_${zConn.fromNodeId}` : '0';
                const rotXVal = rotXConn ? `${rotXConn.fromOutput}_${rotXConn.fromNodeId}` : '0';
                const rotYVal = rotYConn ? `${rotYConn.fromOutput}_${rotYConn.fromNodeId}` : '0';
                const rotZVal = rotZConn ? `${rotZConn.fromOutput}_${rotZConn.fromNodeId}` : '0';
                const scaleVal = scaleConn ? `${scaleConn.fromOutput}_${scaleConn.fromNodeId}` : '1';
                const char = node.properties.char || '█';
                
                return `    // 3D Cube
    if (window.CLIFT3DRenderer) {
        if (!window.CLIFT3DRenderer.initialized) {
            window.CLIFT3DRenderer.init(width, height);
            window.CLIFT3DRenderer.initialized = true;
        }
        const cube_${node.id} = window.CLIFT3DRenderer.createCube(${xVal}, ${yVal}, ${zVal}, ${scaleVal});
        cube_${node.id}.rotX = ${rotXVal};
        cube_${node.id}.rotY = ${rotYVal};
        cube_${node.id}.rotZ = ${rotZVal};
        cube_${node.id}.color = '${char}';
        window.CLIFT3DRenderer.addObject(cube_${node.id});
    }`;
            }
        },
        
        'sphere3d': {
            title: '3D Sphere',
            color: '#4ECDC4',
            inputs: ['x', 'y', 'z', 'rotX', 'rotY', 'rotZ', 'radius'],
            outputs: [],
            size: { width: 80, height: 100 },
            properties: { char: '▒' },
            func: (inputs, time, params, node) => {
                if (!window.CLIFT3DRenderer) return {};
                
                const x = inputs.x || 0;
                const y = inputs.y || 0;
                const z = inputs.z || 0;
                const rotX = inputs.rotX || 0;
                const rotY = inputs.rotY || 0;
                const rotZ = inputs.rotZ || 0;
                const radius = inputs.radius || 1;
                
                const sphere = window.CLIFT3DRenderer.createSphere(x, y, z, radius);
                sphere.rotX = rotX;
                sphere.rotY = rotY;
                sphere.rotZ = rotZ;
                sphere.color = node.properties.char || '▒';
                
                // Add to 3D scene
                if (!params.objects3d) params.objects3d = [];
                params.objects3d.push(sphere);
                
                return {};
            },
            generateCode: (node, connections) => {
                const xConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'x');
                const yConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'y');
                const zConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'z');
                const rotXConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'rotX');
                const rotYConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'rotY');
                const rotZConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'rotZ');
                const radiusConn = connections.find(c => c.toNodeId === node.id && c.toInput === 'radius');
                
                const xVal = xConn ? `${xConn.fromOutput}_${xConn.fromNodeId}` : '0';
                const yVal = yConn ? `${yConn.fromOutput}_${yConn.fromNodeId}` : '0';
                const zVal = zConn ? `${zConn.fromOutput}_${zConn.fromNodeId}` : '0';
                const rotXVal = rotXConn ? `${rotXConn.fromOutput}_${rotXConn.fromNodeId}` : '0';
                const rotYVal = rotYConn ? `${rotYConn.fromOutput}_${rotYConn.fromNodeId}` : '0';
                const rotZVal = rotZConn ? `${rotZConn.fromOutput}_${rotZConn.fromNodeId}` : '0';
                const radiusVal = radiusConn ? `${radiusConn.fromOutput}_${radiusConn.fromNodeId}` : '1';
                const char = node.properties.char || '▒';
                
                return `    // 3D Sphere
    if (window.CLIFT3DRenderer) {
        if (!window.CLIFT3DRenderer.initialized) {
            window.CLIFT3DRenderer.init(width, height);
            window.CLIFT3DRenderer.initialized = true;
        }
        const sphere_${node.id} = window.CLIFT3DRenderer.createSphere(${xVal}, ${yVal}, ${zVal}, ${radiusVal});
        sphere_${node.id}.rotX = ${rotXVal};
        sphere_${node.id}.rotY = ${rotYVal};
        sphere_${node.id}.rotZ = ${rotZVal};
        sphere_${node.id}.color = '${char}';
        window.CLIFT3DRenderer.addObject(sphere_${node.id});
    }`;
            }
        },
        
        'render3d': {
            title: '3D Render',
            color: '#FF4081',
            inputs: [],
            outputs: [],
            size: { width: 80, height: 60 },
            properties: {},
            func: (inputs, time, params, node) => {
                if (!window.CLIFT3DRenderer || !params.objects3d) return {};
                
                // Initialize renderer
                if (!window.CLIFT3DRenderer.initialized) {
                    window.CLIFT3DRenderer.init(params.width, params.height);
                    window.CLIFT3DRenderer.initialized = true;
                }
                
                // Clear and add all 3D objects
                window.CLIFT3DRenderer.clearScene();
                for (let obj of params.objects3d) {
                    window.CLIFT3DRenderer.addObject(obj);
                }
                
                // Render 3D scene
                const rendered = window.CLIFT3DRenderer.render(time);
                
                // Copy to buffer
                for (let y = 0; y < params.height; y++) {
                    for (let x = 0; x < params.width; x++) {
                        if (rendered[y] && rendered[y][x] && rendered[y][x] !== ' ') {
                            params.buffer[y][x] = rendered[y][x];
                        }
                    }
                }
                
                return {};
            },
            generateCode: (node, connections) => {
                return `    // 3D Render
    if (window.CLIFT3DRenderer) {
        if (!window.CLIFT3DRenderer.initialized) {
            window.CLIFT3DRenderer.init(width, height);
            window.CLIFT3DRenderer.initialized = true;
        }
        const rendered_${node.id} = window.CLIFT3DRenderer.render(time);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (rendered_${node.id}[y] && rendered_${node.id}[y][x] && rendered_${node.id}[y][x] !== ' ') {
                    buffer[y][x] = rendered_${node.id}[y][x];
                }
            }
        }
    }`;
            }
        }
    },
    
    // Initialize the node editor
    init: function() {
        console.log('Starting node editor initialization...');
        
        try {
            this.createCustomScenesStorage();
            console.log('Custom scenes storage created');
            
            this.createEditorHTML();
            console.log('Editor HTML created');
            
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                console.log('Setting up node editor components after DOM ready...');
                
                try {
                    this.setupCanvas();
                    console.log('Main canvas setup complete');
                    
                    this.setupPreviewCanvas();
                    console.log('Preview canvas setup complete');
                    
                    this.setupEventListeners();
                    console.log('Event listeners setup complete');
                    
                    this.setupCodeSync();
                    console.log('Code sync setup complete');
                    
                    // Start the render loop
                    this.render();
                    console.log('Render loop started');
                    
                    console.log('Node editor initialization complete successfully');
                } catch (setupError) {
                    console.error('Error during node editor component setup:', setupError);
                }
            }, 100);
        } catch (initError) {
            console.error('Error during node editor initialization:', initError);
        }
    },
    
    // Create custom scenes storage
    createCustomScenesStorage: function() {
        if (!window.CLIFTCustomScenes) {
            window.CLIFTCustomScenes = {};
        }
    },
    
    // Create the editor HTML
    createEditorHTML: function() {
        const editorHTML = `
            <div id="node-editor-overlay" class="node-editor-overlay" style="display: none;">
                <div class="node-editor-container">
                    <div class="node-editor-header">
                        <h2>CLIFT Scene Editor - Visual & Code</h2>
                        <div class="editor-mode-info">
                            <span>Unified Node & Code Editor</span>
                        </div>
                        <div class="node-editor-controls">
                            <button id="node-editor-close" class="btn">×</button>
                        </div>
                    </div>
                    
                    <div class="node-editor-content">
                        <!-- Unified Node + Code Editor Layout -->
                        <div class="unified-editor-layout">
                            <!-- Left Panel: Node Editor -->
                            <div class="node-editor-section">
                                <div class="node-editor-sidebar">
                                    <div class="node-palette">
                                        <h3>Node Palette</h3>
                                        <div class="node-categories">
                                            <div class="node-category">
                                                <h4>Inputs</h4>
                                                <button class="node-type-btn" data-type="time">Time</button>
                                                <button class="node-type-btn" data-type="audio">Audio</button>
                                                <button class="node-type-btn" data-type="position">Position</button>
                                                <button class="node-type-btn" data-type="constant">Constant</button>
                                            </div>
                                            <div class="node-category">
                                                <h4>Math</h4>
                                                <button class="node-type-btn" data-type="add">Add</button>
                                                <button class="node-type-btn" data-type="multiply">Multiply</button>
                                                <button class="node-type-btn" data-type="sin">Sin</button>
                                                <button class="node-type-btn" data-type="cos">Cos</button>
                                                <button class="node-type-btn" data-type="distance">Distance</button>
                                            </div>
                                            <div class="node-category">
                                                <h4>Logic</h4>
                                                <button class="node-type-btn" data-type="compare">Compare</button>
                                            </div>
                                            <div class="node-category">
                                                <h4>Output</h4>
                                                <button class="node-type-btn" data-type="character">Character</button>
                                                <button class="node-type-btn" data-type="circle">Circle</button>
                                                <button class="node-type-btn" data-type="line">Line</button>
                                            </div>
                                            <div class="node-category">
                                                <h4>3D Objects</h4>
                                                <button class="node-type-btn" data-type="cube3d">3D Cube</button>
                                                <button class="node-type-btn" data-type="sphere3d">3D Sphere</button>
                                                <button class="node-type-btn" data-type="render3d">3D Render</button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="node-templates">
                                        <h4>Templates</h4>
                                        <button class="node-template-btn" data-template="circle">Circle</button>
                                        <button class="node-template-btn" data-template="tunnel">Tunnel</button>
                                        <button class="node-template-btn" data-template="plasma">Plasma</button>
                                    </div>
                                    
                                    <div class="node-actions">
                                        <button id="node-clear-all" class="btn">Clear</button>
                                        <button id="node-test-scene" class="btn btn-primary">Test</button>
                                        <button id="node-save-scene" class="btn btn-success">Save</button>
                                    </div>
                                </div>
                                
                                <div class="node-graph-main">
                                    <div class="graph-section">
                                        <h3>Visual Node Graph</h3>
                                        <canvas id="node-graph-canvas" width="600" height="350"></canvas>
                                        <div class="graph-controls">
                                            <span>Zoom: <span id="zoom-level">100%</span></span>
                                            <button id="zoom-reset" class="btn">Reset</button>
                                            <span id="node-help">Right-click to add nodes, drag to connect</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Right Panel: Code Editor -->
                            <div class="code-editor-section">
                                <div class="code-editor-header">
                                    <h3>Generated JavaScript Code</h3>
                                    <div class="code-sync-indicator">
                                        <span id="code-sync-status">🔄 Auto-sync ON</span>
                                    </div>
                                </div>
                                
                                <div class="code-editor-main">
                                    <textarea id="scene-code" class="code-textarea" placeholder="Generated code will appear here..."></textarea>
                                </div>
                                
                                <div class="code-editor-controls">
                                    <div class="scene-info-inline">
                                        <label>ID: <input type="number" id="code-scene-id" min="200" value="200" style="width: 60px;"></label>
                                        <label>Name: <input type="text" id="code-scene-name" placeholder="Node Scene" style="width: 120px;"></label>
                                    </div>
                                    <div class="code-actions">
                                        <button id="code-test-scene" class="btn">Test Code</button>
                                        <button id="code-save-scene" class="btn btn-success">Save Code</button>
                                        <button id="code-clear" class="btn">Clear</button>
                                    </div>
                                </div>
                                
                                <div class="code-preview-section">
                                    <h4>Code Preview</h4>
                                    <canvas id="code-preview-canvas" width="300" height="120"></canvas>
                                    <div class="code-preview-controls">
                                        <button id="code-preview-play" class="btn">Play</button>
                                        <button id="code-preview-pause" class="btn">Pause</button>
                                        <button id="code-preview-reset" class="btn">Reset</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bottom Panel: Shared Preview -->
                            <div class="shared-preview-section">
                                <div class="preview-section">
                                    <h3>Live Preview</h3>
                                            <div class="preview-container">
                                                <canvas id="node-preview" width="400" height="150"></canvas>
                                                <div class="preview-controls">
                                                    <button id="node-preview-play" class="btn">Play</button>
                                                    <button id="node-preview-pause" class="btn">Pause</button>
                                                    <button id="node-preview-reset" class="btn">Reset</button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="properties-section">
                                            <h3>Properties</h3>
                                            <div id="node-properties">
                                                <p>Select a node to edit its properties</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Code Editor Tab Content -->
                        <div class="editor-tab-content" id="code-editor-tab">
                            <div class="code-editor-sidebar">
                                <div class="code-scene-info">
                                    <h3>Scene Info</h3>
                                    <label>Scene ID: <input type="number" id="code-scene-id" min="200" value="200"></label>
                                    <label>Name: <input type="text" id="code-scene-name" placeholder="My Custom Scene"></label>
                                </div>
                                
                                <div class="code-templates">
                                    <h4>Templates</h4>
                                    <button class="code-template-btn" data-template="basic">Basic Scene</button>
                                    <button class="code-template-btn" data-template="audio-reactive">Audio Reactive</button>
                                    <button class="code-template-btn" data-template="tunnel">3D Tunnel</button>
                                    <button class="code-template-btn" data-template="plasma">Plasma Effect</button>
                                    <button class="code-template-btn" data-template="mandelbrot">Mandelbrot</button>
                                </div>
                                
                                <div class="code-actions">
                                    <button id="code-test-scene" class="btn btn-primary">Test Scene</button>
                                    <button id="code-save-scene" class="btn btn-success">Save Scene</button>
                                    <button id="code-clear" class="btn">Clear Code</button>
                                </div>
                            </div>
                            
                            <div class="code-editor-main">
                                <div class="code-editor-layout">
                                    <div class="code-area">
                                        <h3>Scene Code</h3>
                                        <textarea id="scene-code" placeholder="Write your scene function here..."></textarea>
                                    </div>
                                    
                                    <div class="code-preview-section">
                                        <h3>Preview</h3>
                                        <div class="preview-container">
                                            <canvas id="code-preview" width="400" height="150"></canvas>
                                            <div class="preview-controls">
                                                <button id="code-preview-play" class="btn">Play</button>
                                                <button id="code-preview-pause" class="btn">Pause</button>
                                                <button id="code-preview-reset" class="btn">Reset</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS styles
        const editorCSS = `
            <style>
                .node-editor-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .node-editor-container {
                    width: 95vw;
                    height: 95vh;
                    background: #111;
                    border: 2px solid #0f0;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Courier New', monospace;
                }
                
                .node-editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background: #222;
                    border-bottom: 1px solid #0f0;
                }
                
                .node-editor-header h2 {
                    color: #0f0;
                    margin: 0;
                    font-size: 18px;
                }
                
                .editor-mode-tabs {
                    display: flex;
                    gap: 5px;
                }
                
                .editor-tab {
                    padding: 8px 16px;
                    background: #333;
                    border: 1px solid #555;
                    color: #ccc;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    transition: all 0.2s;
                }
                
                .editor-tab:hover {
                    background: #444;
                    color: #fff;
                }
                
                .editor-tab.active {
                    background: #0a5a0a;
                    border-color: #0f0;
                    color: #0f0;
                }
                
                .node-editor-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                    position: relative;
                }
                
                /* Unified Editor Layout */
                .unified-editor-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr auto;
                    gap: 10px;
                    width: 100%;
                    height: 100%;
                }
                
                .node-editor-section {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #444;
                    border-radius: 4px;
                    padding: 10px;
                    background: #1a1a1a;
                }
                
                .code-editor-section {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #444;
                    border-radius: 4px;
                    padding: 10px;
                    background: #1a1a1a;
                }
                
                .shared-preview-section {
                    grid-column: 1 / -1;
                    border: 1px solid #444;
                    border-radius: 4px;
                    padding: 10px;
                    background: #1a1a1a;
                    max-height: 200px;
                }
                
                .code-editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .code-sync-indicator {
                    font-size: 12px;
                    color: #0f0;
                }
                
                .code-textarea {
                    width: 100%;
                    height: 250px;
                    background: #000;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    border: 1px solid #444;
                    padding: 10px;
                    resize: vertical;
                }
                
                .code-editor-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                    gap: 10px;
                }
                
                .scene-info-inline {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .scene-info-inline label {
                    font-size: 12px;
                    color: #ccc;
                }
                
                .scene-info-inline input {
                    background: #333;
                    color: #fff;
                    border: 1px solid #555;
                    padding: 2px 5px;
                    font-size: 11px;
                }
                
                .code-actions {
                    display: flex;
                    gap: 5px;
                }
                
                .code-preview-section {
                    margin-top: 10px;
                    border-top: 1px solid #444;
                    padding-top: 10px;
                }
                
                .code-preview-controls {
                    display: flex;
                    gap: 5px;
                    margin-top: 5px;
                }
                
                .node-graph-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .editor-tab-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: none;
                    overflow: hidden;
                }
                
                .editor-tab-content.active {
                    display: flex;
                }
                
                .node-editor-sidebar {
                    width: 250px;
                    background: #1a1a1a;
                    padding: 20px;
                    border-right: 1px solid #333;
                    overflow-y: auto;
                }
                
                .node-editor-sidebar h3, .node-editor-sidebar h4 {
                    color: #0f0;
                    margin: 0 0 10px 0;
                    font-size: 14px;
                }
                
                .node-category {
                    margin-bottom: 15px;
                }
                
                .node-type-btn {
                    display: block;
                    width: 100%;
                    margin: 2px 0;
                    padding: 5px;
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                }
                
                .node-type-btn:hover {
                    background: #444;
                }
                
                .node-scene-info {
                    margin: 20px 0;
                }
                
                .node-scene-info label {
                    display: block;
                    color: #ccc;
                    font-size: 12px;
                    margin: 5px 0;
                }
                
                .node-scene-info input {
                    width: 100%;
                    padding: 5px;
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                }
                
                .node-templates {
                    margin: 20px 0;
                }
                
                .node-template-btn {
                    display: block;
                    width: 100%;
                    margin: 3px 0;
                    padding: 6px;
                    background: #1a5c1a;
                    border: 1px solid #2d7d2d;
                    color: #cfc;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                }
                
                .node-template-btn:hover {
                    background: #2d7d2d;
                }
                
                .node-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .node-editor-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .node-editor-layout {
                    flex: 1;
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                }
                
                .main-graph-area {
                    flex: 2;
                    display: flex;
                    flex-direction: column;
                }
                
                .side-panels {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    min-width: 400px;
                }
                
                .graph-section, .preview-section, .properties-section {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .graph-section {
                    flex: 1;
                }
                
                .preview-section {
                    flex: 0 0 auto;
                }
                
                .properties-section {
                    flex: 1;
                    min-height: 200px;
                }
                
                .graph-section h3, .preview-section h3, .properties-section h3 {
                    margin: 0;
                    padding: 10px 15px;
                    background: #222;
                    border-bottom: 1px solid #333;
                    color: #0f0;
                    font-size: 14px;
                }
                
                .preview-container {
                    padding: 15px;
                    text-align: center;
                }
                
                .preview-controls {
                    margin-top: 10px;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                
                #node-graph-canvas {
                    background: #0a0a0a;
                    border: 1px solid #333;
                    cursor: grab;
                }
                
                #node-graph-canvas:active {
                    cursor: grabbing;
                }
                
                .graph-controls {
                    padding: 10px;
                    background: #1a1a1a;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #ccc;
                    font-size: 12px;
                }
                
                #node-preview {
                    background: #000;
                    border: 2px solid #0f0;
                    font-family: 'Courier New', monospace;
                }
                
                #node-properties {
                    padding: 20px;
                    color: #ccc;
                }
                
                .property-input {
                    width: 100%;
                    padding: 5px;
                    margin: 5px 0;
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                }
                
                /* Code Editor Styles */
                .code-editor-sidebar {
                    width: 250px;
                    background: #1a1a1a;
                    padding: 20px;
                    border-right: 1px solid #333;
                    overflow-y: auto;
                }
                
                .code-editor-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .code-editor-layout {
                    flex: 1;
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                }
                
                .code-area {
                    flex: 2;
                    display: flex;
                    flex-direction: column;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .code-area h3 {
                    margin: 0;
                    padding: 10px 15px;
                    background: #222;
                    border-bottom: 1px solid #333;
                    color: #0f0;
                    font-size: 14px;
                }
                
                #scene-code {
                    flex: 1;
                    background: #0a0a0a;
                    border: none;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 15px;
                    resize: none;
                    outline: none;
                    line-height: 1.4;
                    min-height: 400px;
                }
                
                .code-preview-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    overflow: hidden;
                    min-width: 400px;
                }
                
                .code-preview-section h3 {
                    margin: 0;
                    padding: 10px 15px;
                    background: #222;
                    border-bottom: 1px solid #333;
                    color: #0f0;
                    font-size: 14px;
                }
                
                .code-scene-info {
                    margin-bottom: 20px;
                }
                
                .code-scene-info label {
                    display: block;
                    color: #ccc;
                    font-size: 12px;
                    margin: 5px 0;
                }
                
                .code-scene-info input {
                    width: 100%;
                    padding: 5px;
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                }
                
                .code-templates {
                    margin: 20px 0;
                }
                
                .code-templates h4 {
                    color: #0f0;
                    margin: 0 0 10px 0;
                    font-size: 14px;
                }
                
                .code-template-btn {
                    display: block;
                    width: 100%;
                    margin: 3px 0;
                    padding: 6px;
                    background: #1a5c1a;
                    border: 1px solid #2d7d2d;
                    color: #cfc;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                }
                
                .code-template-btn:hover {
                    background: #2d7d2d;
                }
                
                .code-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                #code-preview {
                    background: #000;
                    border: 2px solid #0f0;
                    font-family: 'Courier New', monospace;
                }
            </style>
        `;
        
        // Add to document
        document.head.insertAdjacentHTML('beforeend', editorCSS);
        document.body.insertAdjacentHTML('beforeend', editorHTML);
    },
    
    // Setup canvas
    setupCanvas: function() {
        this.canvas = document.getElementById('node-graph-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
    },
    
    // Setup preview canvas
    setupPreviewCanvas: function() {
        this.previewCanvas = document.getElementById('node-preview');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // Set canvas size explicitly
        this.previewCanvas.width = 400;
        this.previewCanvas.height = 150;
        
        // Use font size that's visible but fits the character grid
        this.previewCtx.font = '10px "Courier New", monospace';
        this.previewCtx.textBaseline = 'top';
        this.previewCtx.fillStyle = '#0f0';
        
        console.log('Preview canvas setup:', {
            width: this.previewCanvas.width,
            height: this.previewCanvas.height,
            canvas: this.previewCanvas,
            ctx: this.previewCtx
        });
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        const elements = {
            overlay: document.getElementById('node-editor-overlay'),
            closeBtn: document.getElementById('node-editor-close'),
            clearBtn: document.getElementById('node-clear-all'),
            testBtn: document.getElementById('node-test-scene'),
            saveBtn: document.getElementById('node-save-scene'),
            sceneId: document.getElementById('node-scene-id'),
            sceneName: document.getElementById('node-scene-name'),
            previewPlay: document.getElementById('node-preview-play'),
            previewPause: document.getElementById('node-preview-pause'),
            previewReset: document.getElementById('node-preview-reset'),
            zoomReset: document.getElementById('zoom-reset'),
            // Code editor elements
            codeTestBtn: document.getElementById('code-test-scene'),
            codeSaveBtn: document.getElementById('code-save-scene'),
            codeClearBtn: document.getElementById('code-clear'),
            codeSceneId: document.getElementById('code-scene-id'),
            codeSceneName: document.getElementById('code-scene-name'),
            sceneCodeTextarea: document.getElementById('scene-code'),
            codePreviewPlay: document.getElementById('code-preview-play'),
            codePreviewPause: document.getElementById('code-preview-pause'),
            codePreviewReset: document.getElementById('code-preview-reset')
        };
        
        // Close editor
        elements.closeBtn.onclick = () => this.close();
        elements.overlay.onclick = (e) => {
            if (e.target === elements.overlay) this.close();
        };
        
        // Tab switching
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.onclick = () => this.switchEditorTab(tab.dataset.editor);
        });
        
        // Node type buttons
        document.querySelectorAll('.node-type-btn').forEach(btn => {
            btn.onclick = () => this.addNode(btn.dataset.type, 100, 100);
        });
        
        // Node template buttons
        document.querySelectorAll('.node-template-btn').forEach(btn => {
            btn.onclick = () => this.loadTemplate(btn.dataset.template);
        });
        
        // Code template buttons
        document.querySelectorAll('.code-template-btn').forEach(btn => {
            btn.onclick = () => this.loadCodeTemplate(btn.dataset.template);
        });
        
        // Node editor actions
        elements.clearBtn.onclick = () => this.clearAllNodes();
        elements.testBtn.onclick = () => this.testScene();
        elements.saveBtn.onclick = () => this.saveScene();
        elements.zoomReset.onclick = () => this.resetView();
        
        // Code editor actions - Use more robust element selection with delayed setup
        setTimeout(() => {
            const codeTestBtn = document.getElementById('code-test-scene');
            const codeSaveBtn = document.getElementById('code-save-scene');
            const codeClearBtn = document.getElementById('code-clear');
            const codePreviewPlay = document.getElementById('code-preview-play');
            const codePreviewPause = document.getElementById('code-preview-pause');
            const codePreviewReset = document.getElementById('code-preview-reset');
            
            if (codeTestBtn) {
                codeTestBtn.onclick = () => this.testCodeScene();
                console.log('Code test button connected');
            } else {
                console.warn('Code test button not found');
            }
            
            if (codeSaveBtn) {
                codeSaveBtn.onclick = () => this.saveCodeScene();
                console.log('Code save button connected');
            } else {
                console.warn('Code save button not found');
            }
            
            if (codeClearBtn) {
                codeClearBtn.onclick = () => this.clearCode();
                console.log('Code clear button connected');
            } else {
                console.warn('Code clear button not found');
            }
            
            // Code preview controls
            if (codePreviewPlay) {
                codePreviewPlay.onclick = () => this.startCodePreview();
                console.log('Code preview play button connected');
            } else {
                console.warn('Code preview play button not found');
            }
            
            if (codePreviewPause) {
                codePreviewPause.onclick = () => this.pauseCodePreview();
                console.log('Code preview pause button connected');
            } else {
                console.warn('Code preview pause button not found');
            }
            
            if (codePreviewReset) {
                codePreviewReset.onclick = () => this.resetCodePreview();
                console.log('Code preview reset button connected');
            } else {
                console.warn('Code preview reset button not found');
            }
            
            // Code preview controls - moved inside setTimeout to access variables
            if (codePreviewPlay) {
                codePreviewPlay.onclick = () => {
                    console.log('Code preview play button clicked');
                    const success = this.startCodePreview();
                    if (!success) {
                        console.error('Failed to start code preview from button click');
                    }
                };
            } else {
                console.warn('Code preview play button not found');
            }
            
            if (codePreviewPause) {
                codePreviewPause.onclick = () => {
                    console.log('Code preview pause button clicked');
                    this.pauseCodePreview();
                };
            } else {
                console.warn('Code preview pause button not found');
            }
            
            if (codePreviewReset) {
                codePreviewReset.onclick = () => {
                    console.log('Code preview reset button clicked');
                    this.resetCodePreview();
                };
            } else {
                console.warn('Code preview reset button not found');
            }
        }, 200);
        
        // Node preview controls
        if (elements.previewPlay) {
            elements.previewPlay.onclick = () => this.startPreview();
        } else {
            console.warn('Node preview play button not found');
        }
        
        if (elements.previewPause) {
            elements.previewPause.onclick = () => this.pausePreview();
        } else {
            console.warn('Node preview pause button not found');
        }
        
        if (elements.previewReset) {
            elements.previewReset.onclick = () => this.resetPreview();
        } else {
            console.warn('Node preview reset button not found');
        }
        
        // Canvas events
        this.canvas.onmousedown = (e) => this.onMouseDown(e);
        this.canvas.onmousemove = (e) => this.onMouseMove(e);
        this.canvas.onmouseup = (e) => this.onMouseUp(e);
        this.canvas.onwheel = (e) => this.onWheel(e);
        
        // Start render loop
        this.render();
    },
    
    // Open the editor
    open: function() {
        this.isOpen = true;
        document.getElementById('node-editor-overlay').style.display = 'flex';
        
        // Ensure preview canvas is set up
        this.setupPreviewCanvas();
        
        this.createDefaultScene();
        
        // Auto-start preview with a small delay
        setTimeout(() => {
            this.startPreview();
        }, 500);
    },
    
    // Close the editor
    close: function() {
        this.isOpen = false;
        document.getElementById('node-editor-overlay').style.display = 'none';
        this.pausePreview();
    },
    
    
    // Create a default scene with example nodes
    createDefaultScene: function() {
        this.clearAllNodes();
        
        console.log('Creating default scene...');
        
        // Create a simple animated circle that works
        const timeNode = this.addNode('time', 50, 100);
        const sinNode = this.addNode('sin', 200, 100);
        const addNode = this.addNode('add', 350, 150);
        const constNode = this.addNode('constant', 200, 200);
        const posNode = this.addNode('position', 50, 250);
        const circleNode = this.addNode('circle', 500, 200);
        
        // Set properties
        if (constNode) constNode.properties.value = 5;
        if (circleNode) circleNode.properties.char = 'O';
        
        // Connect for animated radius: time -> sin -> add(+5) -> circle.radius
        if (timeNode && sinNode) {
            this.addConnection(timeNode.id, 'time', sinNode.id, 'value');
        }
        if (sinNode && addNode) {
            this.addConnection(sinNode.id, 'result', addNode.id, 'a');
        }
        if (constNode && addNode) {
            this.addConnection(constNode.id, 'value', addNode.id, 'b');
        }
        if (addNode && circleNode) {
            this.addConnection(addNode.id, 'result', circleNode.id, 'radius');
        }
        
        // Connect position for center
        if (posNode && circleNode) {
            this.addConnection(posNode.id, 'centerX', circleNode.id, 'centerX');
            this.addConnection(posNode.id, 'centerY', circleNode.id, 'centerY');
        }
        
        console.log('Default scene created with', this.nodes.length, 'nodes and', this.connections.length, 'connections');
        console.log('Nodes:', this.nodes.map(n => n.type));
        console.log('Connections:', this.connections);
    },
    
    // Load a template scene
    loadTemplate: function(templateName) {
        this.clearAllNodes();
        console.log('Loading template:', templateName);
        
        switch (templateName) {
            case 'circle':
                this.createCircleTemplate();
                break;
            case 'tunnel':
                this.createTunnelTemplate();
                break;
            case 'plasma':
                this.createPlasmaTemplate();
                break;
            case 'text':
                this.createTextTemplate();
                break;
            default:
                console.error('Unknown template:', templateName);
        }
        
        // Always start preview after loading template
        this.pausePreview();
        setTimeout(() => {
            // Ensure preview canvas is ready
            this.setupPreviewCanvas();
            this.startPreview();
        }, 100);
    },
    
    createCircleTemplate: function() {
        // Animated circle with sine wave radius
        const timeNode = this.addNode('time', 50, 100);
        const sinNode = this.addNode('sin', 200, 100);
        const multiplyNode = this.addNode('multiply', 350, 100);
        const addNode = this.addNode('add', 500, 100);
        const posNode = this.addNode('position', 50, 250);
        const circleNode = this.addNode('circle', 650, 175);
        
        // Set properties
        if (multiplyNode) multiplyNode.properties = { a: 3, b: 0 }; // Scale sine wave
        if (addNode) addNode.properties = { a: 0, b: 8 }; // Base radius
        if (circleNode) circleNode.properties.char = 'O';
        
        // Connections: time -> sin -> multiply(3) -> add(8) -> circle.radius
        if (timeNode && sinNode) this.addConnection(timeNode.id, 'time', sinNode.id, 'value');
        if (sinNode && multiplyNode) this.addConnection(sinNode.id, 'result', multiplyNode.id, 'a');
        if (multiplyNode && addNode) this.addConnection(multiplyNode.id, 'result', addNode.id, 'a');
        if (addNode && circleNode) this.addConnection(addNode.id, 'result', circleNode.id, 'radius');
        
        // Position
        if (posNode && circleNode) {
            this.addConnection(posNode.id, 'centerX', circleNode.id, 'centerX');
            this.addConnection(posNode.id, 'centerY', circleNode.id, 'centerY');
        }
    },
    
    createTunnelTemplate: function() {
        // Simple tunnel effect with distance calculation
        const posNode = this.addNode('position', 50, 100);
        const timeNode = this.addNode('time', 50, 200);
        const circleNode1 = this.addNode('circle', 400, 100);
        const circleNode2 = this.addNode('circle', 400, 200);
        const circleNode3 = this.addNode('circle', 400, 300);
        
        // Set different radii and characters
        if (circleNode1) { circleNode1.properties.char = '.'; }
        if (circleNode2) { circleNode2.properties.char = '*'; }
        if (circleNode3) { circleNode3.properties.char = '#'; }
        
        // Create constants for different radii
        const const1 = this.addNode('constant', 250, 100);
        const const2 = this.addNode('constant', 250, 200);
        const const3 = this.addNode('constant', 250, 300);
        
        if (const1) const1.properties.value = 5;
        if (const2) const2.properties.value = 8;
        if (const3) const3.properties.value = 12;
        
        // Connect all circles to position
        [circleNode1, circleNode2, circleNode3].forEach(circle => {
            if (posNode && circle) {
                this.addConnection(posNode.id, 'centerX', circle.id, 'centerX');
                this.addConnection(posNode.id, 'centerY', circle.id, 'centerY');
            }
        });
        
        // Connect constants to radii
        if (const1 && circleNode1) this.addConnection(const1.id, 'value', circleNode1.id, 'radius');
        if (const2 && circleNode2) this.addConnection(const2.id, 'value', circleNode2.id, 'radius');
        if (const3 && circleNode3) this.addConnection(const3.id, 'value', circleNode3.id, 'radius');
    },
    
    createPlasmaTemplate: function() {
        // Create multiple sine waves for plasma effect
        const timeNode = this.addNode('time', 50, 100);
        const sin1 = this.addNode('sin', 200, 50);
        const sin2 = this.addNode('sin', 200, 150);
        const sin3 = this.addNode('sin', 200, 250);
        
        const mult1 = this.addNode('multiply', 350, 50);
        const mult2 = this.addNode('multiply', 350, 150);
        const mult3 = this.addNode('multiply', 350, 250);
        
        const add1 = this.addNode('add', 500, 100);
        const add2 = this.addNode('add', 500, 200);
        
        const posNode = this.addNode('position', 50, 300);
        const circleNode = this.addNode('circle', 650, 200);
        
        // Set multipliers
        if (mult1) mult1.properties = { a: 0, b: 2 };
        if (mult2) mult2.properties = { a: 0, b: 1.5 };
        if (mult3) mult3.properties = { a: 0, b: 3 };
        
        if (circleNode) circleNode.properties.char = '█';
        
        // Connections for plasma calculation
        if (timeNode) {
            [sin1, sin2, sin3].forEach(sin => {
                if (sin) this.addConnection(timeNode.id, 'time', sin.id, 'value');
            });
        }
        
        if (sin1 && mult1) this.addConnection(sin1.id, 'result', mult1.id, 'a');
        if (sin2 && mult2) this.addConnection(sin2.id, 'result', mult2.id, 'a');
        if (sin3 && mult3) this.addConnection(sin3.id, 'result', mult3.id, 'a');
        
        if (mult1 && add1) this.addConnection(mult1.id, 'result', add1.id, 'a');
        if (mult2 && add1) this.addConnection(mult2.id, 'result', add1.id, 'b');
        if (add1 && add2) this.addConnection(add1.id, 'result', add2.id, 'a');
        if (mult3 && add2) this.addConnection(mult3.id, 'result', add2.id, 'b');
        if (add2 && circleNode) this.addConnection(add2.id, 'result', circleNode.id, 'radius');
        
        // Position
        if (posNode && circleNode) {
            this.addConnection(posNode.id, 'centerX', circleNode.id, 'centerX');
            this.addConnection(posNode.id, 'centerY', circleNode.id, 'centerY');
        }
    },
    
    createTextTemplate: function() {
        // Moving text display
        console.log('Text template - would need a text node type');
        // For now, create a simple moving circle
        this.createCircleTemplate();
    },
    
    // Add a new node
    addNode: function(type, x, y) {
        const nodeType = this.nodeTypes[type];
        if (!nodeType) return null;
        
        const node = {
            id: Date.now() + Math.random(),
            type: type,
            title: nodeType.title,
            x: x - this.panOffset.x,
            y: y - this.panOffset.y,
            inputs: [...nodeType.inputs],
            outputs: [...nodeType.outputs],
            color: nodeType.color,
            size: { ...nodeType.size },
            properties: nodeType.properties ? { ...nodeType.properties } : {},
            values: {}
        };
        
        this.nodes.push(node);
        
        // Auto-save session when nodes are modified
        setTimeout(() => this.saveNodeSession(), 500);
        
        // Update code editor when node is added
        this.updateCodeEditor();
        
        // Auto-start audio if audio node is added
        if (type === 'audio' && window.clift && !window.clift.audioEnabled) {
            console.log('Audio node added - consider enabling audio in the control panel');
            // Don't auto-start audio as it requires user interaction
        }
        
        return node;
    },
    
    // Add connection between nodes
    addConnection: function(fromNodeId, fromOutput, toNodeId, toInput) {
        // Remove existing connection to this input
        this.connections = this.connections.filter(conn => 
            !(conn.toNodeId === toNodeId && conn.toInput === toInput)
        );
        
        this.connections.push({
            fromNodeId,
            fromOutput,
            toNodeId,
            toInput
        });
        
        // Auto-save session when connections are modified
        setTimeout(() => this.saveNodeSession(), 500);
        
        // Update code editor
        this.updateCodeEditor();
    },
    
    // Remove connection
    removeConnection: function(connection) {
        this.connections = this.connections.filter(conn => 
            !(conn.fromNodeId === connection.fromNodeId && 
              conn.fromOutput === connection.fromOutput && 
              conn.toNodeId === connection.toNodeId && 
              conn.toInput === connection.toInput)
        );
        
        // Auto-save session when connections are modified
        setTimeout(() => this.saveNodeSession(), 500);
        
        // Update code editor
        this.updateCodeEditor();
    },
    
    // Find connection at position
    findConnectionAt: function(x, y) {
        const tolerance = 10;
        
        for (let conn of this.connections) {
            const fromNode = this.nodes.find(n => n.id === conn.fromNodeId);
            const toNode = this.nodes.find(n => n.id === conn.toNodeId);
            
            if (fromNode && toNode) {
                const fromIndex = fromNode.outputs.indexOf(conn.fromOutput);
                const toIndex = toNode.inputs.indexOf(conn.toInput);
                
                const fromX = fromNode.x + fromNode.size.width;
                const fromY = fromNode.y + 25 + fromIndex * 15 + 6;
                const toX = toNode.x;
                const toY = toNode.y + 25 + toIndex * 15 + 6;
                
                // Check if point is near the connection line
                const dist = this.pointToLineDistance(x, y, fromX, fromY, toX, toY);
                if (dist < tolerance) {
                    return conn;
                }
            }
        }
        return null;
    },
    
    // Calculate distance from point to line
    pointToLineDistance: function(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
    },
    
    // Context menu for connections
    showConnectionContextMenu: function(e, connection) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: #222;
            border: 1px solid #0f0;
            padding: 5px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        const deleteItem = document.createElement('div');
        deleteItem.textContent = 'Delete Connection';
        deleteItem.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
            color: #0f0;
        `;
        deleteItem.onmouseover = () => deleteItem.style.background = '#333';
        deleteItem.onmouseout = () => deleteItem.style.background = 'transparent';
        deleteItem.onclick = () => {
            this.removeConnection(connection);
            document.body.removeChild(menu);
        };
        
        menu.appendChild(deleteItem);
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                if (menu.parentNode) {
                    document.body.removeChild(menu);
                }
            }, { once: true });
        }, 10);
    },
    
    // Context menu for nodes
    showNodeContextMenu: function(e, node) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: #222;
            border: 1px solid #0f0;
            padding: 5px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        const deleteItem = document.createElement('div');
        deleteItem.textContent = 'Delete Node';
        deleteItem.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
            color: #f00;
        `;
        deleteItem.onmouseover = () => deleteItem.style.background = '#333';
        deleteItem.onmouseout = () => deleteItem.style.background = 'transparent';
        deleteItem.onclick = () => {
            this.removeNode(node);
            document.body.removeChild(menu);
        };
        
        menu.appendChild(deleteItem);
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                if (menu.parentNode) {
                    document.body.removeChild(menu);
                }
            }, { once: true });
        }, 10);
    },
    
    // Context menu for canvas
    showCanvasContextMenu: function(e) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: #222;
            border: 1px solid #0f0;
            padding: 5px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        // Add node types
        const nodeTypes = ['time', 'audio', 'position', 'constant', 'add', 'multiply', 'sin', 'cos', 'character', 'circle'];
        nodeTypes.forEach(type => {
            const item = document.createElement('div');
            item.textContent = `Add ${type}`;
            item.style.cssText = `
                padding: 5px 10px;
                cursor: pointer;
                color: #0f0;
            `;
            item.onmouseover = () => item.style.background = '#333';
            item.onmouseout = () => item.style.background = 'transparent';
            item.onclick = () => {
                this.addNode(type, this.mousePos.x, this.mousePos.y);
                document.body.removeChild(menu);
            };
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                if (menu.parentNode) {
                    document.body.removeChild(menu);
                }
            }, { once: true });
        }, 10);
    },
    
    // Remove node and its connections
    removeNode: function(node) {
        // Remove all connections to/from this node
        this.connections = this.connections.filter(conn => 
            conn.fromNodeId !== node.id && conn.toNodeId !== node.id
        );
        
        // Remove the node
        this.nodes = this.nodes.filter(n => n.id !== node.id);
        
        // Update selected node
        if (this.selectedNode === node) {
            this.selectedNode = null;
        }
        
        // Auto-save and update code
        setTimeout(() => this.saveNodeSession(), 500);
        this.updateCodeEditor();
        this.updateLiveScene();
    },
    
    // Generate JavaScript code from node graph
    generateCode: function() {
        if (this.nodes.length === 0) {
            return `function(buffer, width, height, time, params) {
    // Empty scene - add nodes to generate code
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            buffer[y][x] = ' ';
        }
    }
}`;
        }
        
        let code = `function(buffer, width, height, time, params) {
    // Generated from node graph
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Node calculations
`;
        
        // Sort nodes by dependency order
        const sortedNodes = this.topologicalSort();
        
        // Generate code for each node
        for (let node of sortedNodes) {
            const nodeType = this.nodeTypes[node.type];
            if (nodeType && nodeType.generateCode) {
                code += `    // ${node.title} (${node.type})\n`;
                code += nodeType.generateCode(node, this.connections);
                code += '\n';
            }
        }
        
        code += `}`;
        return code;
    },
    
    // Topological sort of nodes for code generation
    topologicalSort: function() {
        const visited = new Set();
        const result = [];
        
        const visit = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            
            // Visit dependencies first
            const dependentConnections = this.connections.filter(conn => conn.toNodeId === nodeId);
            for (let conn of dependentConnections) {
                visit(conn.fromNodeId);
            }
            
            const node = this.nodes.find(n => n.id === nodeId);
            if (node) result.push(node);
        };
        
        for (let node of this.nodes) {
            visit(node.id);
        }
        
        return result;
    },
    
    // Update code editor with generated code
    updateCodeEditor: function() {
        const codeTextarea = document.getElementById('scene-code');
        if (codeTextarea) {
            const generatedCode = this.generateCode();
            
            // Only update if different to avoid overwriting manual edits
            if (codeTextarea.value !== generatedCode) {
                codeTextarea.value = generatedCode;
                
                // Update sync indicator
                const syncStatus = document.getElementById('code-sync-status');
                if (syncStatus) {
                    syncStatus.textContent = '🔄 Synced';
                    syncStatus.style.color = '#0f0';
                }
            }
            
            // Update scene name if empty
            const sceneNameInput = document.getElementById('code-scene-name');
            if (sceneNameInput && !sceneNameInput.value) {
                sceneNameInput.value = 'Node Graph Scene';
            }
            
            console.log('Code editor updated with generated code');
        }
        
        // Also update live scene
        this.updateLiveScene();
    },
    
    // Setup bidirectional sync between code and nodes
    setupCodeSync: function() {
        const codeTextarea = document.getElementById('scene-code');
        const syncStatus = document.getElementById('code-sync-status');
        
        if (codeTextarea && syncStatus) {
            // Track manual edits
            codeTextarea.addEventListener('input', () => {
                syncStatus.textContent = '✏️ Manual Edit';
                syncStatus.style.color = '#ff0';
                
                // Debounce the code-to-nodes sync
                clearTimeout(this.codeSyncTimeout);
                this.codeSyncTimeout = setTimeout(() => {
                    this.tryParseCodeToNodes();
                }, 2000);
            });
            
            // Update live scene when code changes
            codeTextarea.addEventListener('change', () => {
                this.updateLiveSceneFromCode();
            });
        }
    },
    
    // Try to parse code changes back to nodes (basic implementation)
    tryParseCodeToNodes: function() {
        console.log('Attempting to parse code changes back to nodes...');
        // This is a simplified version - could be enhanced with full parsing
        const syncStatus = document.getElementById('code-sync-status');
        if (syncStatus) {
            syncStatus.textContent = '🔄 Code Modified';
            syncStatus.style.color = '#f80';
        }
    },
    
    // Update live scene directly from code editor
    updateLiveSceneFromCode: function() {
        const codeTextarea = document.getElementById('scene-code');
        if (codeTextarea && window.CLIFTEngine) {
            try {
                const sceneFunction = eval(`(${codeTextarea.value})`);
                
                if (!window.CLIFTCustomScenes) {
                    window.CLIFTCustomScenes = {};
                }
                window.CLIFTCustomScenes[999] = sceneFunction;
                
                console.log('Live scene updated from code editor');
                
                const syncStatus = document.getElementById('code-sync-status');
                if (syncStatus) {
                    syncStatus.textContent = '✅ Code Active';
                    syncStatus.style.color = '#0f0';
                }
            } catch (e) {
                console.log('Could not update live scene from code:', e.message);
                
                const syncStatus = document.getElementById('code-sync-status');
                if (syncStatus) {
                    syncStatus.textContent = '❌ Code Error';
                    syncStatus.style.color = '#f00';
                }
            }
        }
    },
    
    // Update live scene in real-time
    updateLiveScene: function() {
        if (window.CLIFTEngine) {
            try {
                const sceneFunction = eval(`(${this.generateCode()})`);
                
                // Update the engine's custom scene if it has that capability
                if (window.CLIFTEngine.updateCustomScene) {
                    window.CLIFTEngine.updateCustomScene(999, sceneFunction);
                } else {
                    // Fallback: directly update custom scenes
                    if (!window.CLIFTCustomScenes) {
                        window.CLIFTCustomScenes = {};
                    }
                    window.CLIFTCustomScenes[999] = sceneFunction;
                }
                
                console.log('Live scene updated from nodes');
            } catch (e) {
                console.log('Could not update live scene:', e.message);
            }
        }
    },
    
    // Clear all nodes
    clearAllNodes: function() {
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        
        // Auto-save session when cleared
        setTimeout(() => this.saveNodeSession(), 500);
        
        // Update code editor
        this.updateCodeEditor();
    },
    
    // Reset view
    resetView: function() {
        this.panOffset = { x: 0, y: 0 };
        this.zoom = 1.0;
        document.getElementById('zoom-level').textContent = '100%';
    },
    
    // Mouse event handlers
    onMouseDown: function(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = (e.clientX - rect.left) / this.zoom - this.panOffset.x;
        this.mousePos.y = (e.clientY - rect.top) / this.zoom - this.panOffset.y;
        this.lastMousePos = { ...this.mousePos };
        
        // Right click for context menu / disconnect
        if (e.button === 2) {
            e.preventDefault();
            
            // Check if right-clicking on a connection
            const connection = this.findConnectionAt(this.mousePos.x, this.mousePos.y);
            if (connection) {
                this.showConnectionContextMenu(e, connection);
                return;
            }
            
            // Check if right-clicking on a node
            const clickedNode = this.getNodeAtPosition(this.mousePos.x, this.mousePos.y);
            if (clickedNode) {
                this.showNodeContextMenu(e, clickedNode);
                return;
            }
            
            // Right-click on empty space
            this.showCanvasContextMenu(e);
            return;
        }
        
        // Left click handling
        if (e.button === 0) {
            // Check if clicking on a node
            const clickedNode = this.getNodeAtPosition(this.mousePos.x, this.mousePos.y);
            
            if (clickedNode) {
                // Check if clicking on an output (for connections)
                const output = this.getOutputAtPosition(clickedNode, this.mousePos.x, this.mousePos.y);
                if (output) {
                    this.connecting = true;
                    this.connectionStart = { nodeId: clickedNode.id, output: output };
                    return;
                }
                
                // Otherwise, start dragging the node
                this.selectedNode = clickedNode;
                this.dragging = true;
                this.dragOffset.x = this.mousePos.x - clickedNode.x;
                this.dragOffset.y = this.mousePos.y - clickedNode.y;
                
                this.updatePropertiesPanel();
            } else {
                this.selectedNode = null;
                this.updatePropertiesPanel();
            }
        }
    },
    
    onMouseMove: function(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = (e.clientX - rect.left) / this.zoom - this.panOffset.x;
        this.mousePos.y = (e.clientY - rect.top) / this.zoom - this.panOffset.y;
        
        if (this.dragging && this.selectedNode) {
            this.selectedNode.x = this.mousePos.x - this.dragOffset.x;
            this.selectedNode.y = this.mousePos.y - this.dragOffset.y;
        } else if (!this.connecting && !this.dragging) {
            // Pan the view
            if (e.buttons === 1) {
                const dx = (this.mousePos.x - this.lastMousePos.x);
                const dy = (this.mousePos.y - this.lastMousePos.y);
                this.panOffset.x += dx;
                this.panOffset.y += dy;
            }
        }
        
        this.lastMousePos = { ...this.mousePos };
    },
    
    onMouseUp: function(e) {
        if (this.connecting) {
            // Check if we're over an input
            const targetNode = this.getNodeAtPosition(this.mousePos.x, this.mousePos.y);
            if (targetNode && targetNode.id !== this.connectionStart.nodeId) {
                const input = this.getInputAtPosition(targetNode, this.mousePos.x, this.mousePos.y);
                if (input) {
                    this.addConnection(
                        this.connectionStart.nodeId,
                        this.connectionStart.output,
                        targetNode.id,
                        input
                    );
                }
            }
            this.connecting = false;
            this.connectionStart = null;
        }
        
        this.dragging = false;
    },
    
    onWheel: function(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.3, Math.min(3.0, this.zoom * zoomFactor));
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    },
    
    // Helper functions
    getNodeAtPosition: function(x, y) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (x >= node.x && x <= node.x + node.size.width &&
                y >= node.y && y <= node.y + node.size.height) {
                return node;
            }
        }
        return null;
    },
    
    getOutputAtPosition: function(node, x, y) {
        const outputHeight = 15;
        const startY = node.y + 25;
        
        for (let i = 0; i < node.outputs.length; i++) {
            const outputY = startY + i * outputHeight;
            if (x >= node.x + node.size.width - 15 && x <= node.x + node.size.width &&
                y >= outputY && y <= outputY + 12) {
                return node.outputs[i];
            }
        }
        return null;
    },
    
    getInputAtPosition: function(node, x, y) {
        const inputHeight = 15;
        const startY = node.y + 25;
        
        for (let i = 0; i < node.inputs.length; i++) {
            const inputY = startY + i * inputHeight;
            if (x >= node.x && x <= node.x + 15 &&
                y >= inputY && y <= inputY + 12) {
                return node.inputs[i];
            }
        }
        return null;
    },
    
    // Update properties panel
    updatePropertiesPanel: function() {
        const panel = document.getElementById('node-properties');
        
        if (!this.selectedNode) {
            panel.innerHTML = '<p>Select a node to edit its properties</p>';
            return;
        }
        
        const node = this.selectedNode;
        let html = `<h3>${node.title} Properties</h3>`;
        
        if (node.properties) {
            for (const [key, value] of Object.entries(node.properties)) {
                html += `
                    <label>${key}:</label>
                    <input type="text" class="property-input" 
                           data-node="${node.id}" data-property="${key}" 
                           value="${value}">
                `;
            }
        }
        
        panel.innerHTML = html;
        
        // Add event listeners for property inputs
        panel.querySelectorAll('.property-input').forEach(input => {
            input.onchange = (e) => {
                const nodeId = e.target.dataset.node;
                const property = e.target.dataset.property;
                const foundNode = this.nodes.find(n => n.id == nodeId);
                if (foundNode) {
                    // Try to parse as number first
                    const value = isNaN(e.target.value) ? e.target.value : parseFloat(e.target.value);
                    foundNode.properties[property] = value;
                }
            };
        });
    },
    
    // Execute the node graph
    executeGraph: function(width, height, time, params) {
        // Performance optimized - only log occasionally
        if (time % 1000 === 0) {
            console.log('Executing graph with', this.nodes.length, 'nodes and', this.connections.length, 'connections');
        }
        
        const buffer = [];
        for (let y = 0; y < height; y++) {
            buffer[y] = new Array(width).fill(' ');
        }
        
        // Create execution context
        const context = {
            buffer,
            width,
            height,
            time,
            params: { ...params, buffer, width, height }
        };
        
        // Reset all node values
        this.nodes.forEach(node => {
            node.values = {};
        });
        
        // Execute nodes in topological order
        const executed = new Set();
        const execute = (node) => {
            if (executed.has(node.id)) return;
            
            console.log(`Executing node: ${node.type} (${node.title})`);
            
            // Execute dependencies first
            this.connections.forEach(conn => {
                if (conn.toNodeId === node.id) {
                    const inputNode = this.nodes.find(n => n.id === conn.fromNodeId);
                    if (inputNode) {
                        execute(inputNode);
                    }
                }
            });
            
            // Collect inputs
            const inputs = {};
            this.connections.forEach(conn => {
                if (conn.toNodeId === node.id) {
                    const inputNode = this.nodes.find(n => n.id === conn.fromNodeId);
                    if (inputNode && inputNode.values[conn.fromOutput] !== undefined) {
                        inputs[conn.toInput] = inputNode.values[conn.fromOutput];
                        console.log(`  Input ${conn.toInput} = ${inputNode.values[conn.fromOutput]} from ${inputNode.type}`);
                    }
                }
            });
            
            // Execute node function
            const nodeType = this.nodeTypes[node.type];
            if (nodeType && nodeType.func) {
                try {
                    const outputs = nodeType.func(inputs, time, context.params, node);
                    node.values = { ...node.values, ...outputs };
                    console.log(`  Outputs:`, outputs);
                } catch (e) {
                    console.error(`Error executing node ${node.type}:`, e);
                }
            }
            
            executed.add(node.id);
        };
        
        // Execute all nodes
        this.nodes.forEach(execute);
        
        console.log('Graph execution complete. Buffer has content:', 
                   buffer.some(row => row.some(char => char !== ' ')));
        
        return buffer;
    },
    
    // Test scene
    testScene: function() {
        const sceneId = parseInt(document.getElementById('node-scene-id').value);
        
        // Generate scene function from node graph
        const sceneFunction = (buffer, width, height, time, params) => {
            const result = this.executeGraph(width, height, time, params);
            
            // Copy result to buffer
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = result[y][x];
                }
            }
        };
        
        // Test the scene
        if (window.clift) {
            const originalScene = window.CLIFTCustomScenes[sceneId];
            window.CLIFTCustomScenes[sceneId] = sceneFunction;
            
            // Switch to test scene
            window.clift.selectCategory(Math.floor(sceneId / 10));
            window.clift.selectDeck(0);
            window.clift.decks[0].scene = sceneId % 10;
            
            console.log(`Testing custom scene ${sceneId}`);
            
            // Restore after 10 seconds
            setTimeout(() => {
                if (originalScene) {
                    window.CLIFTCustomScenes[sceneId] = originalScene;
                } else {
                    delete window.CLIFTCustomScenes[sceneId];
                }
            }, 10000);
        }
    },
    
    // Save scene
    saveScene: function() {
        const sceneId = parseInt(document.getElementById('node-scene-id').value);
        const sceneName = document.getElementById('node-scene-name').value || `Custom Scene ${sceneId}`;
        
        // Generate scene function from node graph
        const sceneFunction = (buffer, width, height, time, params) => {
            const result = this.executeGraph(width, height, time, params);
            
            // Copy result to buffer
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    buffer[y][x] = result[y][x];
                }
            }
        };
        
        // Save to custom scenes
        window.CLIFTCustomScenes[sceneId] = sceneFunction;
        
        // Save the node graph for later editing
        if (!window.CLIFTCustomSceneGraphs) {
            window.CLIFTCustomSceneGraphs = {};
        }
        window.CLIFTCustomSceneGraphs[sceneId] = {
            nodes: JSON.parse(JSON.stringify(this.nodes)),
            connections: JSON.parse(JSON.stringify(this.connections)),
            name: sceneName
        };
        
        // Save to localStorage using the same format as the code editor
        const savedScenes = JSON.parse(localStorage.getItem('clift-custom-scenes') || '{}');
        savedScenes[sceneId] = {
            name: sceneName,
            nodes: JSON.parse(JSON.stringify(this.nodes)),
            connections: JSON.parse(JSON.stringify(this.connections)),
            type: 'node'
        };
        localStorage.setItem('clift-custom-scenes', JSON.stringify(savedScenes));
        
        console.log(`Custom scene ${sceneId} saved: ${sceneName}`);
    },
    
    // Preview functions
    startPreview: function() {
        console.log('Starting preview with nodes:', this.nodes.map(n => n.type));
        console.log('Connections:', this.connections);
        
        // Always ensure preview canvas is properly set up
        if (!this.previewCanvas || !this.previewCtx) {
            console.log('Setting up preview canvas...');
            this.setupPreviewCanvas();
        }
        
        // Double-check canvas is available
        if (!this.previewCanvas || !this.previewCtx) {
            console.error('Failed to setup preview canvas');
            return;
        }
        
        this.previewRunning = true;
        this.previewTime = 0;
        this.runPreview();
    },
    
    pausePreview: function() {
        this.previewRunning = false;
    },
    
    resetPreview: function() {
        this.previewTime = 0;
        this.previewRunning = false;
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    },
    
    runPreview: function() {
        if (!this.previewRunning) return;
        
        try {
            const width = 50;
            const height = 15;
            
            // Debug logging reduced to avoid performance issues
            if (this.previewTime % 1000 === 0) {
                console.log('Preview status - nodes:', this.nodes.length, 'connections:', this.connections.length);
            }
            
            let buffer;
            
            if (this.nodes.length === 0) {
                // Fallback: create a test pattern if no nodes
                console.log('No nodes, creating test pattern');
                buffer = [];
                for (let y = 0; y < height; y++) {
                    buffer[y] = new Array(width).fill(' ');
                }
                
                // Enhanced test pattern
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = 5 + Math.sin(this.previewTime * 0.01) * 2;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const dx = x - centerX;
                        const dy = y - centerY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist <= radius) {
                            buffer[y][x] = '*';
                        }
                    }
                }
                
                // Add text
                const text = 'ADD NODES';
                const startX = Math.floor((width - text.length) / 2);
                if (startX >= 0 && Math.floor(height / 4) >= 0) {
                    for (let i = 0; i < text.length && startX + i < width; i++) {
                        buffer[Math.floor(height / 4)][startX + i] = text[i];
                    }
                }
            } else {
                buffer = this.executeGraph(width, height, this.previewTime, {
                    audio: new Float32Array(64).fill(0.3),
                    beat: (this.previewTime * 0.002) % 1,
                    bpm: 120,
                    frame: Math.floor(this.previewTime * 0.06)
                });
            }
            
            // Render to canvas
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
            this.previewCtx.fillStyle = '#0f0';
            
            const charWidth = this.previewCanvas.width / width;
            const charHeight = this.previewCanvas.height / height;
            
            let charCount = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = buffer[y][x];
                    if (char !== ' ') {
                        // Add small offset to center characters in their cells
                        this.previewCtx.fillText(char, x * charWidth + 1, y * charHeight + 1);
                        charCount++;
                    }
                }
            }
            
            // Only log occasionally to avoid performance issues
            if (this.previewTime % 1000 === 0) {
                console.log(`Rendered ${charCount} characters to preview`);
            }
            
            this.previewTime += 50;
            
            // Use requestAnimationFrame for smoother animation
            if (this.previewRunning) {
                requestAnimationFrame(() => {
                    setTimeout(() => this.runPreview(), 50);
                });
            }
        } catch (e) {
            console.error('Preview error:', e);
            this.previewRunning = false;
        }
    },
    
    // Render the node graph
    render: function() {
        if (!this.isOpen) {
            requestAnimationFrame(() => this.render());
            return;
        }
        
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.panOffset.x, this.panOffset.y);
        
        // Draw connections
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        this.connections.forEach(conn => {
            const fromNode = this.nodes.find(n => n.id === conn.fromNodeId);
            const toNode = this.nodes.find(n => n.id === conn.toNodeId);
            
            if (fromNode && toNode) {
                const fromIndex = fromNode.outputs.indexOf(conn.fromOutput);
                const toIndex = toNode.inputs.indexOf(conn.toInput);
                
                const fromX = fromNode.x + fromNode.size.width;
                const fromY = fromNode.y + 25 + fromIndex * 15 + 6;
                const toX = toNode.x;
                const toY = toNode.y + 25 + toIndex * 15 + 6;
                
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                
                // Curved connection
                const midX = (fromX + toX) / 2;
                ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY);
                ctx.stroke();
            }
        });
        
        // Draw temporary connection
        if (this.connecting && this.connectionStart) {
            const fromNode = this.nodes.find(n => n.id === this.connectionStart.nodeId);
            if (fromNode) {
                const fromIndex = fromNode.outputs.indexOf(this.connectionStart.output);
                const fromX = fromNode.x + fromNode.size.width;
                const fromY = fromNode.y + 25 + fromIndex * 15 + 6;
                
                ctx.strokeStyle = '#0f0';
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(this.mousePos.x, this.mousePos.y);
                ctx.stroke();
            }
        }
        
        // Draw nodes
        this.nodes.forEach(node => {
            // Node background
            ctx.fillStyle = node === this.selectedNode ? '#333' : '#222';
            ctx.fillRect(node.x, node.y, node.size.width, node.size.height);
            
            // Node border
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(node.x, node.y, node.size.width, node.size.height);
            
            // Node title
            ctx.fillStyle = '#fff';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(node.title, node.x + node.size.width / 2, node.y + 15);
            
            // Input ports
            ctx.fillStyle = '#666';
            node.inputs.forEach((input, i) => {
                const y = node.y + 25 + i * 15;
                ctx.fillRect(node.x, y, 12, 12);
                
                ctx.fillStyle = '#fff';
                ctx.font = '8px Courier New';
                ctx.textAlign = 'left';
                ctx.fillText(input, node.x + 15, y + 9);
                ctx.fillStyle = '#666';
            });
            
            // Output ports
            ctx.fillStyle = node.color;
            node.outputs.forEach((output, i) => {
                const y = node.y + 25 + i * 15;
                ctx.fillRect(node.x + node.size.width - 12, y, 12, 12);
                
                ctx.fillStyle = '#fff';
                ctx.font = '8px Courier New';
                ctx.textAlign = 'right';
                ctx.fillText(output, node.x + node.size.width - 15, y + 9);
                ctx.fillStyle = node.color;
            });
        });
        
        ctx.restore();
        requestAnimationFrame(() => this.render());
    },
    
    // Tab switching functionality
    switchEditorTab: function(tabName) {
        // Update tab buttons
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-editor="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.editor-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-editor-tab`).classList.add('active');
        
        // Setup canvases for the active tab
        if (tabName === 'node') {
            setTimeout(() => {
                this.setupCanvas();
                this.setupPreviewCanvas();
                // Restart preview if there are nodes to preview
                if (this.nodes.length > 0) {
                    this.startPreview();
                }
            }, 100);
        } else if (tabName === 'code') {
            setTimeout(() => {
                console.log('Switching to code tab, setting up canvas...');
                const setupSuccess = this.setupCodePreviewCanvas();
                if (!setupSuccess) {
                    console.error('Failed to setup code preview canvas when switching to code tab');
                    // Try again after a longer delay
                    setTimeout(() => {
                        console.log('Retrying code preview canvas setup...');
                        this.setupCodePreviewCanvas();
                    }, 500);
                }
            }, 100);
        }
    },
    
    // Code editor canvas setup
    setupCodePreviewCanvas: function() {
        console.log('Setting up code preview canvas...');
        
        // Check if the code editor tab is currently active
        const codeEditorTab = document.getElementById('code-editor-tab');
        const isCodeTabActive = codeEditorTab && codeEditorTab.classList.contains('active');
        console.log('Code tab active:', isCodeTabActive);
        
        // Try to get the canvas element
        this.codePreviewCanvas = document.getElementById('code-preview');
        
        if (!this.codePreviewCanvas) {
            console.error('Code preview canvas element not found! DOM element missing.');
            console.log('Available canvas elements:', 
                Array.from(document.querySelectorAll('canvas')).map(c => c.id));
            return false;
        }
        
        console.log('Code preview canvas found:', {
            id: this.codePreviewCanvas.id,
            offsetWidth: this.codePreviewCanvas.offsetWidth,
            offsetHeight: this.codePreviewCanvas.offsetHeight,
            clientWidth: this.codePreviewCanvas.clientWidth,
            clientHeight: this.codePreviewCanvas.clientHeight,
            style: this.codePreviewCanvas.style.cssText,
            display: window.getComputedStyle(this.codePreviewCanvas).display
        });
        
        try {
            this.codePreviewCtx = this.codePreviewCanvas.getContext('2d');
            
            if (!this.codePreviewCtx) {
                console.error('Failed to get 2D rendering context for code preview canvas');
                return false;
            }
            
            console.log('2D context obtained successfully');
            
            // Set canvas dimensions
            this.codePreviewCanvas.width = 400;
            this.codePreviewCanvas.height = 150;
            
            console.log('Canvas dimensions set:', {
                width: this.codePreviewCanvas.width,
                height: this.codePreviewCanvas.height
            });
            
            // Configure rendering properties
            this.codePreviewCtx.font = '10px "Courier New", monospace';
            this.codePreviewCtx.textBaseline = 'top';
            this.codePreviewCtx.fillStyle = '#0f0';
            
            console.log('Canvas rendering properties configured:', {
                font: this.codePreviewCtx.font,
                textBaseline: this.codePreviewCtx.textBaseline,
                fillStyle: this.codePreviewCtx.fillStyle
            });
            
            // Test rendering to verify canvas is working
            try {
                this.codePreviewCtx.clearRect(0, 0, this.codePreviewCanvas.width, this.codePreviewCanvas.height);
                this.codePreviewCtx.fillText('CANVAS READY', 10, 10);
                console.log('Test render successful - canvas is working properly');
            } catch (renderError) {
                console.error('Canvas test render failed:', renderError);
                return false;
            }
            
            console.log('Code preview canvas setup completed successfully');
            return true;
            
        } catch (error) {
            console.error('Error during code preview canvas setup:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return false;
        }
    },
    
    // Code template loading
    codeTemplates: {
        'basic': `// Basic Scene Template
function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    // Your scene code here
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 10 + Math.sin(t * 2) * 5) {
                buffer[y][x] = '*';
            }
        }
    }
}`,
        'audio-reactive': `// Audio Reactive Scene Template
function(buffer, width, height, time, params) {
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    // Use audio data for reactive visuals
    const audioIntensity = audio.reduce((a, b) => a + b) / audio.length;
    const radius = 10 + audioIntensity * 20;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < radius) {
                const intensity = 1 - (dist / radius);
                const char = intensity > 0.7 ? '#' : intensity > 0.4 ? '*' : '.';
                buffer[y][x] = char;
            }
        }
    }
}`,
        'tunnel': `// 3D Tunnel Effect
function(buffer, width, height, time, params) {
    const centerX = width / 2;
    const centerY = height / 2;
    const t = time * 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            const tunnel = Math.sin(dist * 0.5 - t * 5) + Math.sin(angle * 8 + t * 3);
            
            if (tunnel > 0) {
                buffer[y][x] = tunnel > 0.5 ? '#' : '*';
            }
        }
    }
}`,
        'plasma': `// Plasma Effect
function(buffer, width, height, time, params) {
    const t = time * 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const v1 = Math.sin(x * 0.5 + t);
            const v2 = Math.sin(y * 0.3 + t * 1.5);
            const v3 = Math.sin((x + y) * 0.2 + t * 2);
            const v4 = Math.sin(Math.sqrt(x * x + y * y) * 0.3 + t * 3);
            
            const plasma = (v1 + v2 + v3 + v4) / 4;
            
            if (plasma > 0.3) {
                const chars = '.:-=+*#%@';
                const index = Math.floor((plasma + 1) * chars.length / 2);
                buffer[y][x] = chars[Math.min(index, chars.length - 1)];
            }
        }
    }
}`,
        'mandelbrot': `// Mandelbrot Set
function(buffer, width, height, time, params) {
    const zoom = 1 + Math.sin(time * 0.001) * 0.5;
    const offsetX = -0.5;
    const offsetY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cx = (x - width / 2) / (width / 4) / zoom + offsetX;
            const cy = (y - height / 2) / (height / 4) / zoom + offsetY;
            
            let zx = 0, zy = 0;
            let iterations = 0;
            const maxIterations = 50;
            
            while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
                const tmp = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = tmp;
                iterations++;
            }
            
            if (iterations < maxIterations) {
                const chars = '.:-=+*#%@';
                const index = iterations % chars.length;
                buffer[y][x] = chars[index];
            }
        }
    }
}`
    },
    
    loadCodeTemplate: function(templateName) {
        console.log('Loading code template:', templateName);
        const template = this.codeTemplates[templateName];
        if (template) {
            const sceneCodeElement = document.getElementById('scene-code');
            if (sceneCodeElement) {
                sceneCodeElement.value = template;
                console.log('Template loaded successfully');
            } else {
                console.error('Scene code textarea not found');
            }
        } else {
            console.error('Template not found:', templateName);
        }
    },
    
    clearCode: function() {
        document.getElementById('scene-code').value = '';
    },
    
    // Code preview functionality
    codePreviewRunning: false,
    codePreviewTime: 0,
    
    startCodePreview: function() {
        console.log('Starting code preview...');
        
        // Check if canvas and context exist
        if (!this.codePreviewCanvas || !this.codePreviewCtx) {
            console.log('Canvas or context missing, attempting setup...');
            const setupSuccess = this.setupCodePreviewCanvas();
            
            if (!setupSuccess) {
                console.error('Cannot start code preview - canvas setup failed');
                return false;
            }
        }
        
        // Verify canvas is still accessible and valid
        if (!this.codePreviewCanvas || !this.codePreviewCtx) {
            console.error('Canvas or context still missing after setup attempt');
            return false;
        }
        
        // Check if canvas is visible/accessible
        const canvasStyle = window.getComputedStyle(this.codePreviewCanvas);
        if (canvasStyle.display === 'none') {
            console.warn('Code preview canvas is hidden (display: none)');
        }
        
        console.log('Canvas ready, starting preview with:', {
            canvas: !!this.codePreviewCanvas,
            context: !!this.codePreviewCtx,
            width: this.codePreviewCanvas.width,
            height: this.codePreviewCanvas.height,
            visible: canvasStyle.display !== 'none'
        });
        
        this.codePreviewRunning = true;
        this.codePreviewTime = 0;
        this.runCodePreview();
        return true;
    },
    
    pauseCodePreview: function() {
        this.codePreviewRunning = false;
    },
    
    resetCodePreview: function() {
        this.codePreviewRunning = false;
        this.codePreviewTime = 0;
        if (this.codePreviewCtx) {
            this.codePreviewCtx.clearRect(0, 0, this.codePreviewCanvas.width, this.codePreviewCanvas.height);
        }
    },
    
    runCodePreview: function() {
        if (!this.codePreviewRunning) {
            console.log('Code preview stopped or not running');
            return;
        }
        
        // Verify canvas and context are still available
        if (!this.codePreviewCanvas || !this.codePreviewCtx) {
            console.error('Canvas or context lost during preview execution');
            this.codePreviewRunning = false;
            return;
        }
        
        try {
            const width = 50;
            const height = 15;
            const codeTextarea = document.getElementById('scene-code');
            
            if (!codeTextarea) {
                console.error('Scene code textarea not found');
                setTimeout(() => this.runCodePreview(), 50);
                return;
            }
            
            const code = codeTextarea.value;
            
            if (!code.trim()) {
                // Show "NO CODE" message when empty
                this.codePreviewCtx.clearRect(0, 0, this.codePreviewCanvas.width, this.codePreviewCanvas.height);
                this.codePreviewCtx.fillStyle = '#666';
                this.codePreviewCtx.fillText('NO CODE', 10, 10);
                setTimeout(() => this.runCodePreview(), 50);
                return;
            }
            
            // Create buffer
            const buffer = [];
            for (let y = 0; y < height; y++) {
                buffer[y] = new Array(width).fill(' ');
            }
            
            // Execute user code
            let executionError = null;
            try {
                const sceneFunction = eval(`(${code})`);
                
                if (typeof sceneFunction !== 'function') {
                    throw new Error('Code must evaluate to a function');
                }
                
                sceneFunction(buffer, width, height, this.codePreviewTime, {
                    audio: new Float32Array(64).fill(0.3),
                    beat: (this.codePreviewTime * 0.002) % 1,
                    bpm: 120,
                    frame: Math.floor(this.codePreviewTime * 0.06)
                });
                
                // Log success occasionally to avoid spam
                if (this.codePreviewTime % 1000 === 0) {
                    console.log('Code execution successful at time:', this.codePreviewTime);
                }
                
            } catch (e) {
                executionError = e;
                console.error('Code execution error:', {
                    message: e.message,
                    stack: e.stack,
                    name: e.name,
                    time: this.codePreviewTime
                });
                
                // Show error in preview
                const errorMsg = `ERROR: ${e.message.substring(0, 40)}`;
                for (let i = 0; i < Math.min(errorMsg.length, width); i++) {
                    if (i < width) buffer[0][i] = errorMsg[i];
                }
                
                // Add error type on second line if space
                if (height > 1) {
                    const errorType = e.name || 'Unknown';
                    for (let i = 0; i < Math.min(errorType.length, width); i++) {
                        if (i < width) buffer[1][i] = errorType[i];
                    }
                }
            }
            
            // Render to canvas
            try {
                this.codePreviewCtx.clearRect(0, 0, this.codePreviewCanvas.width, this.codePreviewCanvas.height);
                this.codePreviewCtx.fillStyle = executionError ? '#f44' : '#0f0';
                
                const charWidth = this.codePreviewCanvas.width / width;
                const charHeight = this.codePreviewCanvas.height / height;
                
                let renderedChars = 0;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const char = buffer[y][x];
                        if (char !== ' ') {
                            try {
                                this.codePreviewCtx.fillText(char, x * charWidth + 1, y * charHeight + 1);
                                renderedChars++;
                            } catch (renderError) {
                                console.error('Character render error:', renderError, 'for char:', char);
                            }
                        }
                    }
                }
                
                // Log rendering stats occasionally
                if (this.codePreviewTime % 1000 === 0) {
                    console.log(`Rendered ${renderedChars} characters to code preview canvas`);
                }
                
            } catch (renderError) {
                console.error('Canvas rendering error:', renderError);
                this.codePreviewRunning = false;
                return;
            }
            
            this.codePreviewTime += 50;
            
            if (this.codePreviewRunning) {
                requestAnimationFrame(() => {
                    setTimeout(() => this.runCodePreview(), 50);
                });
            }
        } catch (e) {
            console.error('Unexpected code preview error:', {
                message: e.message,
                stack: e.stack,
                name: e.name,
                time: this.codePreviewTime
            });
            this.codePreviewRunning = false;
        }
    },
    
    testCodeScene: function() {
        console.log('Testing code scene...');
        
        // Validate CLIFT system
        if (!window.clift) {
            console.error('CLIFT not loaded');
            alert('CLIFT system not available. Please ensure the main application is loaded.');
            return;
        }
        
        const sceneIdElement = document.getElementById('code-scene-id');
        const sceneNameElement = document.getElementById('code-scene-name');
        const sceneCodeElement = document.getElementById('scene-code');
        
        if (!sceneIdElement || !sceneNameElement || !sceneCodeElement) {
            console.error('Code editor elements not found');
            alert('Code editor interface not properly loaded');
            return;
        }
        
        const sceneId = parseInt(sceneIdElement.value);
        const sceneName = sceneNameElement.value || `Custom Scene ${sceneId}`;
        const code = sceneCodeElement.value;
        
        if (!code.trim()) {
            alert('Please enter scene code before testing');
            return;
        }
        
        if (isNaN(sceneId) || sceneId < 200) {
            alert('Please enter a valid scene ID (200 or higher)');
            return;
        }
        
        try {
            // Test the code by running it once
            console.log('Evaluating user code...');
            const sceneFunction = eval(`(${code})`);
            
            // Validate that we got a function
            if (typeof sceneFunction !== 'function') {
                throw new Error('Code must be a function that takes (buffer, width, height, time, params) as parameters');
            }
            
            const testBuffer = [];
            for (let y = 0; y < 15; y++) {
                testBuffer[y] = new Array(50).fill(' ');
            }
            
            console.log('Testing function execution...');
            sceneFunction(testBuffer, 50, 15, 0, {});
            
            // Initialize customScenes if it doesn't exist
            if (!window.clift.customScenes) {
                window.clift.customScenes = {};
            }
            
            // If successful, add to CLIFT and test
            window.clift.customScenes[sceneId] = {
                name: sceneName,
                func: sceneFunction
            };
            
            if (typeof window.clift.setScene === 'function') {
                window.clift.setScene(sceneId);
                console.log(`Testing code scene: ${sceneName} (ID: ${sceneId})`);
                alert(`Scene "${sceneName}" loaded and is now running!`);
            } else {
                console.warn('window.clift.setScene not available');
                alert(`Scene "${sceneName}" code validated successfully!`);
            }
        } catch (e) {
            console.error('Code execution error:', e);
            alert(`Code error: ${e.message}\n\nPlease check your function syntax and try again.`);
        }
    },
    
    // Session management for node editor
    saveNodeSession: function() {
        try {
            const nodeSession = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                nodes: this.nodes.map(node => ({ ...node })),
                connections: this.connections.map(conn => ({ ...conn })),
                panOffset: { ...this.panOffset },
                zoom: this.zoom,
                previewSettings: {
                    running: this.previewRunning,
                    time: this.previewTime
                }
            };
            
            localStorage.setItem('clift-node-session', JSON.stringify(nodeSession));
            console.log('Node editor session saved');
            return nodeSession;
        } catch (error) {
            console.error('Failed to save node session:', error);
            throw error;
        }
    },

    loadNodeSession: function() {
        try {
            const sessionData = localStorage.getItem('clift-node-session');
            if (!sessionData) return false;
            
            const nodeSession = JSON.parse(sessionData);
            
            this.nodes = nodeSession.nodes || [];
            this.connections = nodeSession.connections || [];
            this.panOffset = nodeSession.panOffset || { x: 0, y: 0 };
            this.zoom = nodeSession.zoom || 1.0;
            
            if (nodeSession.previewSettings) {
                this.previewTime = nodeSession.previewSettings.time || 0;
            }
            
            console.log('Node editor session loaded from:', nodeSession.timestamp);
            return true;
        } catch (error) {
            console.error('Failed to load node session:', error);
            return false;
        }
    },

    // Remove a connection
    removeConnection: function(connection) {
        this.connections = this.connections.filter(conn => conn !== connection);
        this.updateCodeEditor();
        setTimeout(() => this.saveNodeSession(), 500);
    },
    
    // Find connection at position for right-click disconnect
    findConnectionAt: function(x, y) {
        for (let conn of this.connections) {
            const fromNode = this.nodes.find(n => n.id === conn.fromNodeId);
            const toNode = this.nodes.find(n => n.id === conn.toNodeId);
            
            if (fromNode && toNode) {
                const fromIndex = fromNode.outputs.indexOf(conn.fromOutput);
                const toIndex = toNode.inputs.indexOf(conn.toInput);
                
                const fromX = fromNode.x + fromNode.size.width;
                const fromY = fromNode.y + 25 + fromIndex * 15 + 6;
                const toX = toNode.x;
                const toY = toNode.y + 25 + toIndex * 15 + 6;
                
                // Check if point is near the connection line
                const distance = this.pointToLineDistance(x, y, fromX, fromY, toX, toY);
                if (distance < 10) {
                    return conn;
                }
            }
        }
        return null;
    },
    
    // Calculate distance from point to line
    pointToLineDistance: function(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    },
    
    // Context menu for connection disconnect
    showConnectionContextMenu: function(e, connection) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: #222;
            border: 1px solid #0f0;
            padding: 5px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        const disconnectItem = document.createElement('div');
        disconnectItem.textContent = 'Disconnect';
        disconnectItem.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
            color: #f00;
        `;
        disconnectItem.onmouseover = () => disconnectItem.style.background = '#333';
        disconnectItem.onmouseout = () => disconnectItem.style.background = 'transparent';
        disconnectItem.onclick = () => {
            this.removeConnection(connection);
            document.body.removeChild(menu);
        };
        
        menu.appendChild(disconnectItem);
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                if (menu.parentNode) {
                    document.body.removeChild(menu);
                }
            }, { once: true });
        }, 10);
    },

    saveCodeScene: function() {
        console.log('Saving code scene...');
        
        const sceneIdElement = document.getElementById('code-scene-id');
        const sceneNameElement = document.getElementById('code-scene-name');
        const sceneCodeElement = document.getElementById('scene-code');
        
        if (!sceneIdElement || !sceneNameElement || !sceneCodeElement) {
            console.error('Code editor elements not found');
            alert('Code editor interface not properly loaded');
            return;
        }
        
        const sceneId = parseInt(sceneIdElement.value);
        const sceneName = sceneNameElement.value || `Custom Scene ${sceneId}`;
        const code = sceneCodeElement.value;
        
        if (!code.trim()) {
            alert('Please enter scene code before saving');
            return;
        }
        
        if (isNaN(sceneId) || sceneId < 200) {
            alert('Please enter a valid scene ID (200 or higher)');
            return;
        }
        
        try {
            // Test the code before saving
            console.log('Validating code before saving...');
            const sceneFunction = eval(`(${code})`);
            
            // Validate that we got a function
            if (typeof sceneFunction !== 'function') {
                throw new Error('Code must be a function that takes (buffer, width, height, time, params) as parameters');
            }
            
            const testBuffer = [];
            for (let y = 0; y < 15; y++) {
                testBuffer[y] = new Array(50).fill(' ');
            }
            sceneFunction(testBuffer, 50, 15, 0, {});
            
            // Save to localStorage
            console.log('Saving to localStorage...');
            const savedScenes = JSON.parse(localStorage.getItem('clift-custom-scenes') || '{}');
            savedScenes[sceneId] = {
                name: sceneName,
                code: code,
                type: 'code'
            };
            localStorage.setItem('clift-custom-scenes', JSON.stringify(savedScenes));
            
            // Add to CLIFT runtime if available
            if (window.clift) {
                if (!window.clift.customScenes) {
                    window.clift.customScenes = {};
                }
                
                window.clift.customScenes[sceneId] = {
                    name: sceneName,
                    func: sceneFunction
                };
                console.log(`Code scene saved to runtime: ${sceneName} (ID: ${sceneId})`);
            } else {
                console.warn('CLIFT runtime not available, scene saved to localStorage only');
            }
            
            console.log(`Code scene saved: ${sceneName} (ID: ${sceneId})`);
            alert(`Scene "${sceneName}" saved successfully!\n\nIt will be available in the custom scenes menu.`);
        } catch (e) {
            console.error('Save failed:', e);
            alert(`Cannot save - code error: ${e.message}\n\nPlease fix the errors and try again.`);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    CLIFTNodeEditor.init();
    
    // Load node session on startup
    setTimeout(() => {
        if (CLIFTNodeEditor.loadNodeSession()) {
            console.log('Node editor session restored');
        }
    }, 1000);
});

console.log('CLIFT Node Editor loaded');