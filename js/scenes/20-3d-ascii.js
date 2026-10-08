// CLIFT scenes - category 20: 3D ASCII

// Scene 200: 3D Rotating Cube
CLIFTScenes[200] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer if not already done
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear the scene and add a single rotating cube
    window.CLIFT3DRenderer.clearScene();
    
    // Create animated cube
    const cube = window.CLIFT3DRenderer.createCube(0, 0, 0, 3);
    cube.rotY = time * 0.02;
    cube.rotX = time * 0.01;
    
    // Add audio reactivity
    if (params.audio) {
        const intensity = params.audio.reduce((a, b) => a + b) / params.audio.length;
        cube.scaleX = cube.scaleY = cube.scaleZ = 1 + intensity;
    }
    
    window.CLIFT3DRenderer.addObject(cube);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};

// Scene 201: 3D Multi-Object Scene
CLIFTScenes[201] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear and set up scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create multiple 3D objects
    const cube = window.CLIFT3DRenderer.createCube(-6, 0, 0, 2);
    cube.rotY = time * 0.03;
    cube.rotX = time * 0.02;
    
    const pyramid = window.CLIFT3DRenderer.createPyramid(0, 0, 0, 2);
    pyramid.rotY = -time * 0.02;
    pyramid.rotZ = time * 0.01;
    
    const sphere = window.CLIFT3DRenderer.createSphere(6, 0, 0, 1.5);
    sphere.rotX = time * 0.04;
    
    // Add audio reactivity
    if (params.audio) {
        const bass = params.audio.slice(0, 16).reduce((a, b) => a + b) / 16;
        const mid = params.audio.slice(16, 32).reduce((a, b) => a + b) / 16;
        const high = params.audio.slice(32, 64).reduce((a, b) => a + b) / 32;
        
        cube.y = bass * 5;
        pyramid.y = mid * 3;
        sphere.y = high * 4;
    }
    
    window.CLIFT3DRenderer.addObject(cube);
    window.CLIFT3DRenderer.addObject(pyramid);
    window.CLIFT3DRenderer.addObject(sphere);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};

// Scene 202: 3D Wireframe Scene
CLIFTScenes[202] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Enable wireframe mode
    window.CLIFT3DRenderer.options.wireframe = true;
    window.CLIFT3DRenderer.options.wireChar = '▓';
    
    // Clear and set up scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create wireframe objects
    const cube = window.CLIFT3DRenderer.createCube(-4, 0, 0, 2);
    cube.rotY = time * 0.02;
    cube.rotX = time * 0.01;
    
    const pyramid = window.CLIFT3DRenderer.createPyramid(4, 0, 0, 2);
    pyramid.rotY = -time * 0.025;
    pyramid.rotZ = time * 0.015;
    
    // Add beat detection
    if (params.beat > 0.5) {
        cube.scaleX = cube.scaleY = cube.scaleZ = 1.5;
        pyramid.scaleX = pyramid.scaleY = pyramid.scaleZ = 1.3;
    }
    
    window.CLIFT3DRenderer.addObject(cube);
    window.CLIFT3DRenderer.addObject(pyramid);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
    
    // Reset wireframe mode
    window.CLIFT3DRenderer.options.wireframe = false;
};

// Scene 203: 3D Spinning Tunnel
CLIFTScenes[203] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create tunnel effect with multiple rings
    for (let i = 0; i < 10; i++) {
        const z = i * 4 - 20;
        const scale = 1 + i * 0.3;
        
        // Create ring of cubes
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2 + time * 0.01;
            const x = Math.cos(angle) * (3 + i * 0.5);
            const y = Math.sin(angle) * (3 + i * 0.5);
            
            const cube = window.CLIFT3DRenderer.createCube(x, y, z, 0.5);
            cube.rotY = time * 0.02 + i * 0.1;
            cube.rotX = time * 0.01 + j * 0.2;
            
            // Different characters for depth
            const chars = ['·', ':', '▒', '█'];
            cube.color = chars[i % chars.length];
            
            window.CLIFT3DRenderer.addObject(cube);
        }
    }
    
    // Move camera forward
    window.CLIFT3DRenderer.setCamera(0, 0, -10 + Math.sin(time * 0.01) * 5);
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};

// Scene 204: 3D Audio Visualizer
CLIFTScenes[204] = function(buffer, width, height, time, params) {
    // Initialize 3D renderer
    if (!window.CLIFT3DRenderer.initialized) {
        window.CLIFT3DRenderer.init(width, height);
        window.CLIFT3DRenderer.initialized = true;
    }
    
    // Clear scene
    window.CLIFT3DRenderer.clearScene();
    
    // Create 3D audio bars
    if (params.audio) {
        const numBars = 16;
        const barWidth = 2;
        
        for (let i = 0; i < numBars; i++) {
            const audioIndex = Math.floor((i / numBars) * params.audio.length);
            const level = params.audio[audioIndex] || 0;
            
            const x = (i - numBars / 2) * barWidth;
            const y = 0;
            const z = 0;
            
            const cube = window.CLIFT3DRenderer.createCube(x, y, z, 0.8);
            cube.scaleY = 1 + level * 10;
            cube.rotY = time * 0.01 + i * 0.1;
            
            // Color based on frequency
            const chars = ['·', ':', '▒', '█'];
            cube.color = chars[Math.floor(level * chars.length) % chars.length];
            
            window.CLIFT3DRenderer.addObject(cube);
        }
    }
    
    // Rotate camera around the scene
    const cameraAngle = time * 0.005;
    window.CLIFT3DRenderer.setCamera(
        Math.cos(cameraAngle) * 15,
        5,
        Math.sin(cameraAngle) * 15
    );
    
    // Render the 3D scene
    const rendered = window.CLIFT3DRenderer.render(time);
    
    // Copy to buffer
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rendered[y] && rendered[y][x]) {
                buffer[y][x] = rendered[y][x];
            }
        }
    }
};
