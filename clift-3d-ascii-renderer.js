// CLIFT 3D ASCII Renderer
// Real-time 3D graphics rendered using ASCII characters
// Features: perspective projection, mesh rendering, lighting, rotation

window.CLIFT3DRenderer = {
    // Renderer state
    width: 80,
    height: 24,
    buffer: null,
    depthBuffer: null,
    
    // Camera properties
    camera: {
        x: 0, y: 0, z: -10,
        pitch: 0, yaw: 0, roll: 0,
        fov: 60,
        near: 0.1,
        far: 100
    },
    
    // Rendering options
    options: {
        wireframe: false,
        backfaceCulling: true,
        depthTesting: true,
        shading: 'flat', // flat, gouraud, none
        fillChar: '█',
        wireChar: '▓',
        pointChar: '•'
    },
    
    // 3D Objects in the scene
    objects: [],
    
    // Lighting
    lights: [
        { type: 'directional', x: 1, y: 1, z: 1, intensity: 1.0 }
    ],
    
    // ASCII characters for depth/brightness (from darkest to brightest)
    depthChars: [' ', '.', '·', ':', '!', '|', '▒', '▓', '█'],
    
    // Initialize the 3D renderer
    init: function(width, height) {
        this.width = width || 80;
        this.height = height || 24;
        this.createBuffers();
        this.createDefaultScene();
        console.log('3D ASCII Renderer initialized:', this.width + 'x' + this.height);
    },
    
    // Create rendering buffers
    createBuffers: function() {
        // Clean up existing buffers to prevent memory leaks
        this.cleanupBuffers();
        
        this.buffer = [];
        this.depthBuffer = [];
        
        for (let y = 0; y < this.height; y++) {
            this.buffer[y] = new Array(this.width).fill(' ');
            this.depthBuffer[y] = new Array(this.width).fill(Infinity);
        }
    },
    
    // Clean up buffers to prevent memory leaks
    cleanupBuffers: function() {
        if (this.buffer) {
            for (let y = 0; y < this.buffer.length; y++) {
                if (this.buffer[y]) {
                    this.buffer[y].length = 0;
                }
            }
            this.buffer.length = 0;
        }
        
        if (this.depthBuffer) {
            for (let y = 0; y < this.depthBuffer.length; y++) {
                if (this.depthBuffer[y]) {
                    this.depthBuffer[y].length = 0;
                }
            }
            this.depthBuffer.length = 0;
        }
    },
    
    // Clear buffers
    clearBuffers: function() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = ' ';
                this.depthBuffer[y][x] = Infinity;
            }
        }
    },
    
    // Create default 3D scene
    createDefaultScene: function() {
        // Add a rotating cube
        this.objects.push(this.createCube(0, 0, 0, 2));
        
        // Add a pyramid
        this.objects.push(this.createPyramid(-4, 0, 0, 2));
        
        // Add a sphere
        this.objects.push(this.createSphere(4, 0, 0, 1.5));
    },
    
    // Create a cube mesh
    createCube: function(x, y, z, size) {
        const s = size;
        const vertices = [
            // Front face
            [-s, -s,  s], [ s, -s,  s], [ s,  s,  s], [-s,  s,  s],
            // Back face
            [-s, -s, -s], [-s,  s, -s], [ s,  s, -s], [ s, -s, -s],
        ];
        
        const faces = [
            // Front
            [0, 1, 2], [0, 2, 3],
            // Back
            [4, 5, 6], [4, 6, 7],
            // Left
            [4, 0, 3], [4, 3, 5],
            // Right
            [1, 7, 6], [1, 6, 2],
            // Top
            [3, 2, 6], [3, 6, 5],
            // Bottom
            [4, 7, 1], [4, 1, 0]
        ];
        
        return {
            type: 'mesh',
            x: x, y: y, z: z,
            rotX: 0, rotY: 0, rotZ: 0,
            scaleX: 1, scaleY: 1, scaleZ: 1,
            vertices: vertices,
            faces: faces,
            color: '█'
        };
    },
    
    // Create a pyramid mesh
    createPyramid: function(x, y, z, size) {
        const s = size;
        const vertices = [
            // Base
            [-s, -s, -s], [ s, -s, -s], [ s, -s,  s], [-s, -s,  s],
            // Apex
            [ 0,  s,  0]
        ];
        
        const faces = [
            // Base
            [0, 1, 2], [0, 2, 3],
            // Sides
            [0, 4, 1], [1, 4, 2], [2, 4, 3], [3, 4, 0]
        ];
        
        return {
            type: 'mesh',
            x: x, y: y, z: z,
            rotX: 0, rotY: 0, rotZ: 0,
            scaleX: 1, scaleY: 1, scaleZ: 1,
            vertices: vertices,
            faces: faces,
            color: '▓'
        };
    },
    
    // Create a sphere mesh (icosphere approximation)
    createSphere: function(x, y, z, radius) {
        const vertices = [];
        const faces = [];
        
        // Create a simple sphere using latitude/longitude
        const latitudeBands = 8;
        const longitudeBands = 8;
        
        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = lat * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= longitudeBands; lon++) {
                const phi = lon * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                
                vertices.push([x * radius, y * radius, z * radius]);
            }
        }
        
        // Create faces
        for (let lat = 0; lat < latitudeBands; lat++) {
            for (let lon = 0; lon < longitudeBands; lon++) {
                const first = (lat * (longitudeBands + 1)) + lon;
                const second = first + longitudeBands + 1;
                
                faces.push([first, second, first + 1]);
                faces.push([second, second + 1, first + 1]);
            }
        }
        
        return {
            type: 'mesh',
            x: x, y: y, z: z,
            rotX: 0, rotY: 0, rotZ: 0,
            scaleX: 1, scaleY: 1, scaleZ: 1,
            vertices: vertices,
            faces: faces,
            color: '▒'
        };
    },
    
    // Vector math utilities
    vec3: {
        add: function(a, b) {
            return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
        },
        
        subtract: function(a, b) {
            return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        },
        
        cross: function(a, b) {
            return [
                a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]
            ];
        },
        
        dot: function(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        },
        
        normalize: function(v) {
            const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
        },
        
        length: function(v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        }
    },
    
    // Matrix operations
    matrix: {
        multiply: function(a, b) {
            const result = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    for (let k = 0; k < 4; k++) {
                        result[i][j] += a[i][k] * b[k][j];
                    }
                }
            }
            
            return result;
        },
        
        identity: function() {
            return [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        },
        
        translate: function(x, y, z) {
            return [
                [1, 0, 0, x],
                [0, 1, 0, y],
                [0, 0, 1, z],
                [0, 0, 0, 1]
            ];
        },
        
        rotateX: function(angle) {
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            return [
                [1, 0, 0, 0],
                [0, c, -s, 0],
                [0, s, c, 0],
                [0, 0, 0, 1]
            ];
        },
        
        rotateY: function(angle) {
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            return [
                [c, 0, s, 0],
                [0, 1, 0, 0],
                [-s, 0, c, 0],
                [0, 0, 0, 1]
            ];
        },
        
        rotateZ: function(angle) {
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            return [
                [c, -s, 0, 0],
                [s, c, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        },
        
        scale: function(x, y, z) {
            return [
                [x, 0, 0, 0],
                [0, y, 0, 0],
                [0, 0, z, 0],
                [0, 0, 0, 1]
            ];
        },
        
        perspective: function(fov, aspect, near, far) {
            const f = 1.0 / Math.tan(fov * Math.PI / 360);
            const rangeInv = 1 / (near - far);
            
            return [
                [f / aspect, 0, 0, 0],
                [0, f, 0, 0],
                [0, 0, (near + far) * rangeInv, 2 * near * far * rangeInv],
                [0, 0, -1, 0]
            ];
        }
    },
    
    // Transform a vertex by a matrix
    transformVertex: function(vertex, matrix) {
        const x = vertex[0];
        const y = vertex[1];
        const z = vertex[2];
        const w = 1;
        
        const result = [
            matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z + matrix[0][3] * w,
            matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z + matrix[1][3] * w,
            matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z + matrix[2][3] * w,
            matrix[3][0] * x + matrix[3][1] * y + matrix[3][2] * z + matrix[3][3] * w
        ];
        
        // Perspective divide
        if (result[3] !== 0) {
            result[0] /= result[3];
            result[1] /= result[3];
            result[2] /= result[3];
        }
        
        return result;
    },
    
    // Project 3D point to 2D screen coordinates
    projectToScreen: function(vertex) {
        // Simple perspective projection
        const fov = this.camera.fov * Math.PI / 180;
        const aspect = this.width / this.height;
        const distance = this.camera.z;
        
        const x3d = vertex[0] - this.camera.x;
        const y3d = vertex[1] - this.camera.y;
        const z3d = vertex[2] - this.camera.z;
        
        // Perspective division
        const scale = 1 / (z3d * Math.tan(fov / 2));
        
        const x2d = (x3d * scale * this.width / 2) + this.width / 2;
        const y2d = (-y3d * scale * this.height / 2) + this.height / 2;
        
        return {
            x: Math.round(x2d),
            y: Math.round(y2d),
            z: z3d
        };
    },
    
    // Draw a pixel with depth testing
    setPixel: function(x, y, z, char) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        
        if (this.options.depthTesting) {
            if (z < this.depthBuffer[y][x]) {
                this.depthBuffer[y][x] = z;
                this.buffer[y][x] = char;
            }
        } else {
            this.buffer[y][x] = char;
        }
    },
    
    // Draw a line between two points (Bresenham's algorithm)
    drawLine: function(x0, y0, z0, x1, y1, z1, char) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        let x = x0;
        let y = y0;
        
        while (true) {
            const t = Math.abs(x - x0) / (Math.abs(x1 - x0) + 1);
            const z = z0 + t * (z1 - z0);
            
            this.setPixel(x, y, z, char);
            
            if (x === x1 && y === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    },
    
    // Fill a triangle (simple scanline algorithm)
    fillTriangle: function(v0, v1, v2, char) {
        // Sort vertices by Y coordinate
        const vertices = [v0, v1, v2].sort((a, b) => a.y - b.y);
        const [top, mid, bottom] = vertices;
        
        // Fill the triangle
        for (let y = top.y; y <= bottom.y; y++) {
            if (y < 0 || y >= this.height) continue;
            
            let x1, x2, z1, z2;
            
            if (y <= mid.y) {
                // Upper half
                const t1 = (y - top.y) / (mid.y - top.y + 1);
                const t2 = (y - top.y) / (bottom.y - top.y + 1);
                
                x1 = top.x + t1 * (mid.x - top.x);
                x2 = top.x + t2 * (bottom.x - top.x);
                z1 = top.z + t1 * (mid.z - top.z);
                z2 = top.z + t2 * (bottom.z - top.z);
            } else {
                // Lower half
                const t1 = (y - mid.y) / (bottom.y - mid.y + 1);
                const t2 = (y - top.y) / (bottom.y - top.y + 1);
                
                x1 = mid.x + t1 * (bottom.x - mid.x);
                x2 = top.x + t2 * (bottom.x - top.x);
                z1 = mid.z + t1 * (bottom.z - mid.z);
                z2 = top.z + t2 * (bottom.z - top.z);
            }
            
            if (x1 > x2) {
                [x1, x2] = [x2, x1];
                [z1, z2] = [z2, z1];
            }
            
            for (let x = Math.round(x1); x <= Math.round(x2); x++) {
                const t = (x - x1) / (x2 - x1 + 1);
                const z = z1 + t * (z2 - z1);
                this.setPixel(x, y, z, char);
            }
        }
    },
    
    // Render a mesh object
    renderMesh: function(obj) {
        // Create transformation matrix
        let transform = this.matrix.identity();
        
        // Apply transformations
        transform = this.matrix.multiply(transform, this.matrix.translate(obj.x, obj.y, obj.z));
        transform = this.matrix.multiply(transform, this.matrix.rotateX(obj.rotX));
        transform = this.matrix.multiply(transform, this.matrix.rotateY(obj.rotY));
        transform = this.matrix.multiply(transform, this.matrix.rotateZ(obj.rotZ));
        transform = this.matrix.multiply(transform, this.matrix.scale(obj.scaleX, obj.scaleY, obj.scaleZ));
        
        // Transform vertices
        const transformedVertices = obj.vertices.map(v => this.transformVertex(v, transform));
        
        // Project vertices to screen space
        const screenVertices = transformedVertices.map(v => this.projectToScreen(v));
        
        // Render faces
        for (let face of obj.faces) {
            const v0 = screenVertices[face[0]];
            const v1 = screenVertices[face[1]];
            const v2 = screenVertices[face[2]];
            
            // Skip if any vertex is behind the camera
            if (v0.z <= 0 || v1.z <= 0 || v2.z <= 0) continue;
            
            // Backface culling
            if (this.options.backfaceCulling) {
                const normal = this.vec3.cross(
                    [v1.x - v0.x, v1.y - v0.y, v1.z - v0.z],
                    [v2.x - v0.x, v2.y - v0.y, v2.z - v0.z]
                );
                
                if (normal[2] < 0) continue; // Face is pointing away
            }
            
            if (this.options.wireframe) {
                // Draw wireframe
                this.drawLine(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, this.options.wireChar);
                this.drawLine(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, this.options.wireChar);
                this.drawLine(v2.x, v2.y, v2.z, v0.x, v0.y, v0.z, this.options.wireChar);
            } else {
                // Fill triangle
                this.fillTriangle(v0, v1, v2, obj.color);
            }
        }
    },
    
    // Main render function
    render: function(time) {
        time = time || 0;
        
        // Clear buffers
        this.clearBuffers();
        
        // Animate objects
        for (let obj of this.objects) {
            if (obj.type === 'mesh') {
                obj.rotY += 0.02;
                obj.rotX += 0.01;
            }
        }
        
        // Render all objects
        for (let obj of this.objects) {
            if (obj.type === 'mesh') {
                this.renderMesh(obj);
            }
        }
        
        return this.buffer;
    },
    
    // Get the current frame as a string
    getFrameString: function() {
        return this.buffer.map(row => row.join('')).join('\n');
    },
    
    // Add a new object to the scene
    addObject: function(obj) {
        this.objects.push(obj);
    },
    
    // Remove an object from the scene
    removeObject: function(obj) {
        const index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    },
    
    // Clear all objects
    clearScene: function() {
        this.objects = [];
    },
    
    // Set camera position
    setCamera: function(x, y, z, pitch, yaw, roll) {
        this.camera.x = x || this.camera.x;
        this.camera.y = y || this.camera.y;
        this.camera.z = z || this.camera.z;
        this.camera.pitch = pitch || this.camera.pitch;
        this.camera.yaw = yaw || this.camera.yaw;
        this.camera.roll = roll || this.camera.roll;
    },
    
    // Get current buffer for integration with main engine
    getBuffer: function() {
        return this.buffer;
    },
    
    // Cleanup method to prevent memory leaks
    cleanup: function() {
        this.cleanupBuffers();
        this.objects.length = 0;
        this.lights.length = 0;
        this.initialized = false;
        console.log('3D ASCII Renderer cleaned up');
    }
};

// Initialize the 3D renderer
console.log('3D ASCII Renderer loaded');