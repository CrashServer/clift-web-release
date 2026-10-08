// CLIFT scenes - category 6: Retro & Gaming

// Category 6: Retro & Gaming (60-69)

// Scene 60: Pong Game
CLIFTScenes[60] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.5);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.5;
    
    // Initialize game state
    if (!params._pongState) {
        params._pongState = {
            ballX: width / 2,
            ballY: height / 2,
            ballVX: 1,
            ballVY: 0.5,
            paddle1Y: height / 2,
            paddle2Y: height / 2,
            score1: 0,
            score2: 0
        };
    }
    
    const state = params._pongState;
    const paddleHeight = 5;
    const ballSpeed = 0.5 + avgAudio;
    
    // Update paddles (AI controlled by sine waves)
    state.paddle1Y = (height / 2) + Math.sin(t) * (height / 3);
    state.paddle2Y = (height / 2) + Math.sin(t * 1.3) * (height / 3);
    
    // Update ball
    state.ballX += state.ballVX * ballSpeed;
    state.ballY += state.ballVY * ballSpeed;
    
    // Ball collision with top/bottom
    if (state.ballY <= 1 || state.ballY >= height - 2) {
        state.ballVY = -state.ballVY;
    }
    
    // Ball collision with paddles
    if (state.ballX <= 3 && Math.abs(state.ballY - state.paddle1Y) < paddleHeight / 2) {
        state.ballVX = Math.abs(state.ballVX);
        state.ballVY += (state.ballY - state.paddle1Y) * 0.2;
    }
    if (state.ballX >= width - 4 && Math.abs(state.ballY - state.paddle2Y) < paddleHeight / 2) {
        state.ballVX = -Math.abs(state.ballVX);
        state.ballVY += (state.ballY - state.paddle2Y) * 0.2;
    }
    
    // Ball out of bounds
    if (state.ballX < 0 || state.ballX > width) {
        state.ballX = width / 2;
        state.ballY = height / 2;
        state.ballVX = -state.ballVX;
        state.ballVY = (Math.random() - 0.5) * 2;
    }
    
    // Draw field
    for (let y = 0; y < height; y++) {
        // Center line
        if (y % 3 === 0) {
            buffer[y][Math.floor(width / 2)] = '|';
        }
    }
    
    // Draw paddles
    for (let i = -paddleHeight/2; i <= paddleHeight/2; i++) {
        const y1 = Math.floor(state.paddle1Y + i);
        const y2 = Math.floor(state.paddle2Y + i);
        if (y1 >= 0 && y1 < height) buffer[y1][2] = '#';
        if (y2 >= 0 && y2 < height) buffer[y2][width - 3] = '#';
    }
    
    // Draw ball
    const bx = Math.floor(state.ballX);
    const by = Math.floor(state.ballY);
    if (bx >= 0 && bx < width && by >= 0 && by < height) {
        buffer[by][bx] = '@';
    }
    
    // Draw borders
    for (let x = 0; x < width; x++) {
        buffer[0][x] = '=';
        buffer[height - 1][x] = '=';
    }
};

// Scene 61: Space Invaders
CLIFTScenes[61] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Invader patterns
    const invader1 = [
        ' @ @ ',
        '@@@@@',
        '@ @ @',
        ' @ @ '
    ];
    
    const invader2 = [
        '  @  ',
        ' @@@ ',
        '@@@@@',
        '@ @ @'
    ];
    
    // Wave motion
    const waveX = Math.sin(t) * 10;
    const waveY = Math.floor(t * 0.5) % 10;
    
    // Draw invaders grid
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
            const invader = (row + col) % 2 === 0 ? invader1 : invader2;
            const baseX = col * 8 + 5 + waveX;
            const baseY = row * 5 + 2 + waveY;
            
            // Draw invader
            invader.forEach((line, y) => {
                for (let x = 0; x < line.length; x++) {
                    const px = Math.floor(baseX + x);
                    const py = baseY + y;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        if (line[x] !== ' ') {
                            buffer[py][px] = line[x];
                        }
                    }
                }
            });
        }
    }
    
    // Draw player ship
    const shipX = Math.floor(width / 2 + Math.sin(t * 2) * 20);
    const shipY = height - 4;
    const ship = [
        '  A  ',
        ' AAA ',
        'AAAAA'
    ];
    
    ship.forEach((line, y) => {
        for (let x = 0; x < line.length; x++) {
            const px = shipX + x - 2;
            const py = shipY + y;
            if (px >= 0 && px < width && py >= 0 && py < height) {
                if (line[x] !== ' ') {
                    buffer[py][px] = line[x];
                }
            }
        }
    });
    
    // Laser effects (audio reactive)
    if (bassLevel > 0.5) {
        for (let y = shipY - 1; y >= 0; y -= 2) {
            if (Math.random() < 0.3) {
                buffer[y][shipX] = '|';
            }
        }
    }
};

// Scene 62: Tetris Blocks
CLIFTScenes[62] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Tetris pieces
    const pieces = [
        // I piece
        [['#','#','#','#']],
        // O piece
        [['#','#'],['#','#']],
        // T piece
        [[' ','#',' '],['#','#','#']],
        // S piece
        [[' ','#','#'],['#','#',' ']],
        // Z piece
        [['#','#',' '],[' ','#','#']],
        // J piece
        [['#',' ',' '],['#','#','#']],
        // L piece
        [[' ',' ','#'],['#','#','#']]
    ];
    
    // Falling pieces
    const numPieces = 5 + Math.floor(avgAudio * 10);
    for (let i = 0; i < numPieces; i++) {
        const piece = pieces[Math.floor((t * 2 + i * 7) % pieces.length)];
        const x = Math.floor(((t * 10 + i * 17) % 1) * (width - 4));
        const y = Math.floor(((t * 5 + i * 13) % 1) * height);
        const rotation = Math.floor(t + i) % 4;
        
        // Draw piece with rotation
        piece.forEach((row, py) => {
            row.forEach((cell, px) => {
                if (cell === '#') {
                    let dx = px, dy = py;
                    // Simple rotation
                    if (rotation === 1) { dx = py; dy = -px; }
                    else if (rotation === 2) { dx = -px; dy = -py; }
                    else if (rotation === 3) { dx = -py; dy = px; }
                    
                    const fx = x + dx + 2;
                    const fy = y + dy + 2;
                    if (fx >= 0 && fx < width && fy >= 0 && fy < height) {
                        buffer[fy][fx] = '#';
                    }
                }
            });
        });
    }
    
    // Stacked blocks at bottom
    for (let y = height - 5; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.sin(x * 0.5 + y) > 0.3) {
                buffer[y][x] = '█';
            }
        }
    }
};

// Scene 63: Pac-Man Chase
CLIFTScenes[63] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Maze pattern
    const mazePattern = [
        '#################',
        '#...............#',
        '#.###.#####.###.#',
        '#...............#',
        '#.###.##.##.###.#',
        '#.....#...#.....#',
        '#####.#...#.#####',
        '#.....#...#.....#',
        '#.###.#####.###.#',
        '#...............#',
        '#.###.#####.###.#',
        '#...............#',
        '#################'
    ];
    
    // Draw maze (centered and tiled)
    const offsetX = Math.floor((width - 17) / 2);
    const offsetY = Math.floor((height - 13) / 2);
    
    mazePattern.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            const px = offsetX + x;
            const py = offsetY + y;
            if (px >= 0 && px < width && py >= 0 && py < height) {
                if (row[x] === '#') {
                    buffer[py][px] = '█';
                } else if (row[x] === '.') {
                    // Animated dots
                    if (Math.sin(t * 5 + x + y) > 0) {
                        buffer[py][px] = '·';
                    }
                }
            }
        }
    });
    
    // Pac-Man position
    const pacX = offsetX + 8 + Math.sin(t) * 6;
    const pacY = offsetY + 6 + Math.cos(t * 0.7) * 4;
    
    // Draw Pac-Man (changes based on audio)
    const pacChar = avgAudio > 0.5 ? 'C' : 'c';
    if (Math.floor(pacX) >= 0 && Math.floor(pacX) < width && 
        Math.floor(pacY) >= 0 && Math.floor(pacY) < height) {
        buffer[Math.floor(pacY)][Math.floor(pacX)] = pacChar;
    }
    
    // Draw ghosts
    const ghosts = ['M', 'W', 'A', 'V'];
    ghosts.forEach((ghost, i) => {
        const gx = offsetX + 8 + Math.sin(t * 0.8 + i) * 7;
        const gy = offsetY + 6 + Math.cos(t * 0.6 + i) * 5;
        if (Math.floor(gx) >= 0 && Math.floor(gx) < width && 
            Math.floor(gy) >= 0 && Math.floor(gy) < height) {
            buffer[Math.floor(gy)][Math.floor(gx)] = ghost;
        }
    });
};

// Scene 64: ASCII Arcade
CLIFTScenes[64] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Multiple mini-games on screen
    const gameTime = t * 2;
    const currentGame = Math.floor(gameTime / 5) % 4;
    
    // Game borders
    const sections = 4;
    const sectionWidth = Math.floor(width / sections);
    
    for (let s = 0; s < sections; s++) {
        const x0 = s * sectionWidth;
        const x1 = (s + 1) * sectionWidth - 1;
        
        // Vertical dividers
        if (s < sections - 1) {
            for (let y = 0; y < height; y++) {
                buffer[y][x1] = '|';
            }
        }
        
        // Mini game in each section
        const localT = t + s * 0.5;
        const centerX = x0 + sectionWidth / 2;
        
        switch (s % 4) {
            case 0: // Bouncing ball
                const ballY = Math.abs(Math.sin(localT * 3)) * (height - 2) + 1;
                buffer[Math.floor(ballY)][Math.floor(centerX)] = 'O';
                break;
                
            case 1: // Rotating spinner
                const angle = localT * 4;
                const spinChars = ['|', '/', '-', '\\'];
                const spinChar = spinChars[Math.floor(angle) % 4];
                buffer[Math.floor(height / 2)][Math.floor(centerX)] = spinChar;
                break;
                
            case 2: // Jumping character
                const jumpY = height - 3 - Math.abs(Math.sin(localT * 2)) * 5;
                buffer[Math.floor(jumpY)][Math.floor(centerX)] = '@';
                buffer[height - 2][Math.floor(centerX - 2)] = '===';
                buffer[height - 2][Math.floor(centerX - 1)] = '===';
                buffer[height - 2][Math.floor(centerX)] = '===';
                buffer[height - 2][Math.floor(centerX + 1)] = '===';
                buffer[height - 2][Math.floor(centerX + 2)] = '===';
                break;
                
            case 3: // Snake pattern
                for (let i = 0; i < 8; i++) {
                    const sx = centerX + Math.sin(localT + i * 0.3) * 5;
                    const sy = height / 2 + Math.cos(localT + i * 0.3) * 3;
                    if (Math.floor(sx) >= x0 && Math.floor(sx) < x1 && 
                        Math.floor(sy) >= 0 && Math.floor(sy) < height) {
                        buffer[Math.floor(sy)][Math.floor(sx)] = i === 0 ? '@' : '#';
                    }
                }
                break;
        }
    }
    
    // Audio reactive score display
    const score = Math.floor(avgAudio * 9999);
    const scoreStr = `SCORE: ${score}`;
    for (let i = 0; i < scoreStr.length; i++) {
        if (i < width) {
            buffer[0][i] = scoreStr[i];
        }
    }
};

// Scene 65: Missile Command
CLIFTScenes[65] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Cities at bottom
    const cities = [
        { x: width * 0.2, intact: true },
        { x: width * 0.4, intact: true },
        { x: width * 0.6, intact: true },
        { x: width * 0.8, intact: true }
    ];
    
    // Draw cities
    cities.forEach(city => {
        const x = Math.floor(city.x);
        if (city.intact) {
            // City buildings
            buffer[height - 3][x - 1] = '█';
            buffer[height - 3][x] = '█';
            buffer[height - 3][x + 1] = '█';
            buffer[height - 2][x - 2] = '█';
            buffer[height - 2][x - 1] = '█';
            buffer[height - 2][x] = '█';
            buffer[height - 2][x + 1] = '█';
            buffer[height - 2][x + 2] = '█';
        }
    });
    
    // Incoming missiles
    const missileCount = 3 + Math.floor(bassLevel * 5);
    for (let i = 0; i < missileCount; i++) {
        const startX = (Math.sin(t * 0.5 + i * 2) + 1) * width / 2;
        const progress = ((t * 0.2 + i * 0.3) % 1);
        const missileX = startX;
        const missileY = progress * height;
        
        // Draw missile trail
        for (let j = 0; j < 5; j++) {
            const ty = missileY - j;
            if (ty >= 0 && ty < height && missileX >= 0 && missileX < width) {
                const char = j === 0 ? 'v' : '.';
                buffer[Math.floor(ty)][Math.floor(missileX)] = char;
            }
        }
    }
    
    // Defense explosions (audio reactive)
    if (bassLevel > 0.5) {
        const explX = Math.floor(Math.random() * width);
        const explY = Math.floor(Math.random() * height * 0.7);
        const explRadius = 2 + Math.floor(bassLevel * 3);
        
        for (let dy = -explRadius; dy <= explRadius; dy++) {
            for (let dx = -explRadius; dx <= explRadius; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= explRadius) {
                    const x = explX + dx;
                    const y = explY + dy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        buffer[y][x] = dist < explRadius / 2 ? '*' : '+';
                    }
                }
            }
        }
    }
    
    // Ground
    for (let x = 0; x < width; x++) {
        buffer[height - 1][x] = '=';
    }
};

// Scene 66: Asteroids Field
CLIFTScenes[66] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize asteroids
    if (!params._asteroids) {
        params._asteroids = [];
        for (let i = 0; i < 15; i++) {
            params._asteroids.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    // Update and draw asteroids
    params._asteroids.forEach(ast => {
        // Update position
        ast.x += ast.vx + avgAudio * ast.vx;
        ast.y += ast.vy + avgAudio * ast.vy;
        ast.rotation += ast.rotSpeed;
        
        // Wrap around screen
        if (ast.x < 0) ast.x = width;
        if (ast.x > width) ast.x = 0;
        if (ast.y < 0) ast.y = height;
        if (ast.y > height) ast.y = 0;
        
        // Draw asteroid shape
        const shapes = ['O', '0', '@', '*'];
        const shapeIndex = Math.floor(ast.size);
        const shape = shapes[Math.min(shapeIndex, shapes.length - 1)];
        
        // Draw with rotation effect
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const dx = Math.cos(a + ast.rotation) * ast.size;
            const dy = Math.sin(a + ast.rotation) * ast.size * 0.5;
            const px = Math.floor(ast.x + dx);
            const py = Math.floor(ast.y + dy);
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
                buffer[py][px] = shape;
            }
        }
    });
    
    // Player ship in center
    const shipX = width / 2 + Math.sin(t) * 10;
    const shipY = height / 2 + Math.cos(t * 0.7) * 5;
    const shipAngle = t;
    
    // Draw ship
    const shipPoints = [
        { x: 0, y: -2 },
        { x: -1, y: 1 },
        { x: 1, y: 1 }
    ];
    
    shipPoints.forEach(point => {
        const rotX = point.x * Math.cos(shipAngle) - point.y * Math.sin(shipAngle);
        const rotY = point.x * Math.sin(shipAngle) + point.y * Math.cos(shipAngle);
        const px = Math.floor(shipX + rotX);
        const py = Math.floor(shipY + rotY);
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
            buffer[py][px] = 'A';
        }
    });
    
    // Laser shots (audio reactive)
    if (avgAudio > 0.4) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const dist = 5 + avgAudio * 10;
            const lx = Math.floor(shipX + Math.cos(angle) * dist);
            const ly = Math.floor(shipY + Math.sin(angle) * dist);
            
            if (lx >= 0 && lx < width && ly >= 0 && ly < height) {
                buffer[ly][lx] = '-';
            }
        }
    }
};

// Scene 67: Centipede
CLIFTScenes[67] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Centipede segments
    const segmentCount = 20;
    const waveSpeed = 2 + avgAudio * 3;
    
    // Draw mushrooms
    for (let i = 0; i < 30; i++) {
        const mx = Math.floor(Math.sin(i * 7.3) * width / 2 + width / 2);
        const my = Math.floor(Math.sin(i * 5.7) * height / 3 + height / 3);
        if (mx >= 0 && mx < width && my >= 0 && my < height) {
            buffer[my][mx] = 'T';
        }
    }
    
    // Draw centipede
    for (let i = 0; i < segmentCount; i++) {
        const offset = i * 0.3;
        const x = (t * waveSpeed + offset) % (width * 2);
        const row = Math.floor((t * waveSpeed + offset) / (width * 2)) % (height - 5);
        
        // Zigzag pattern
        const actualX = row % 2 === 0 ? x % width : width - (x % width) - 1;
        const y = row + 2;
        
        if (actualX >= 0 && actualX < width && y >= 0 && y < height) {
            // Head is different
            if (i === 0) {
                buffer[y][Math.floor(actualX)] = '@';
            } else {
                buffer[y][Math.floor(actualX)] = 'o';
            }
        }
    }
    
    // Player at bottom
    const playerX = Math.floor(width / 2 + Math.sin(t * 2) * 20);
    if (playerX >= 0 && playerX < width - 2) {
        buffer[height - 2][playerX] = '^';
        buffer[height - 2][playerX - 1] = '<';
        buffer[height - 2][playerX + 1] = '>';
    }
    
    // Shooting (audio reactive)
    if (avgAudio > 0.4) {
        for (let y = height - 3; y >= 0; y -= 2) {
            if (Math.random() < 0.3) {
                buffer[y][playerX] = '|';
            }
        }
    }
};

// Scene 68: Breakout Bricks
CLIFTScenes[68] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const avgAudio = audio.reduce((a, b) => a + b, 0) / audio.length || 0.3;
    
    // Initialize game state
    if (!params._breakoutState) {
        params._breakoutState = {
            bricks: [],
            ballX: width / 2,
            ballY: height - 5,
            ballVX: 1,
            ballVY: -1,
            paddleX: width / 2
        };
        
        // Create bricks
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                params._breakoutState.bricks.push({
                    x: col * 7 + 5,
                    y: row * 2 + 2,
                    width: 6,
                    alive: true,
                    char: row < 2 ? '=' : row < 4 ? '-' : '.'
                });
            }
        }
    }
    
    const state = params._breakoutState;
    const ballSpeed = 0.5 + avgAudio;
    
    // Update ball
    state.ballX += state.ballVX * ballSpeed;
    state.ballY += state.ballVY * ballSpeed;
    
    // Ball collision with walls
    if (state.ballX <= 0 || state.ballX >= width - 1) {
        state.ballVX = -state.ballVX;
    }
    if (state.ballY <= 0) {
        state.ballVY = Math.abs(state.ballVY);
    }
    
    // Ball reset if it goes off bottom
    if (state.ballY > height) {
        state.ballY = height - 5;
        state.ballX = width / 2;
        state.ballVY = -1;
    }
    
    // Paddle movement (follows sine wave)
    state.paddleX = width / 2 + Math.sin(t) * 20;
    
    // Ball collision with paddle
    const paddleWidth = 8;
    if (state.ballY >= height - 3 && state.ballY <= height - 2 &&
        Math.abs(state.ballX - state.paddleX) < paddleWidth / 2) {
        state.ballVY = -Math.abs(state.ballVY);
        state.ballVX += (state.ballX - state.paddleX) * 0.2;
    }
    
    // Draw bricks
    state.bricks.forEach(brick => {
        if (brick.alive) {
            // Check collision with ball
            if (Math.abs(state.ballX - brick.x) < brick.width / 2 &&
                Math.abs(state.ballY - brick.y) < 1) {
                brick.alive = false;
                state.ballVY = -state.ballVY;
            }
            
            // Draw brick
            for (let i = 0; i < brick.width; i++) {
                const bx = Math.floor(brick.x - brick.width / 2 + i);
                if (bx >= 0 && bx < width) {
                    buffer[brick.y][bx] = brick.char;
                }
            }
        }
    });
    
    // Draw paddle
    for (let i = -paddleWidth / 2; i < paddleWidth / 2; i++) {
        const px = Math.floor(state.paddleX + i);
        if (px >= 0 && px < width) {
            buffer[height - 2][px] = '=';
        }
    }
    
    // Draw ball
    const bx = Math.floor(state.ballX);
    const by = Math.floor(state.ballY);
    if (bx >= 0 && bx < width && by >= 0 && by < height) {
        buffer[by][bx] = 'O';
    }
    
    // Revive some bricks occasionally
    if (Math.random() < 0.01) {
        const deadBricks = state.bricks.filter(b => !b.alive);
        if (deadBricks.length > 0) {
            deadBricks[Math.floor(Math.random() * deadBricks.length)].alive = true;
        }
    }
};

// Scene 69: Donkey Kong
CLIFTScenes[69] = function(buffer, width, height, time, params) {
    const t = time * 0.001;
    const audio = params.audio || new Float32Array(64).fill(0.3);
    const bassLevel = (audio[0] + audio[1] + audio[2]) / 3 || 0.3;
    
    // Platform levels
    const platforms = [
        { y: height - 2, slope: 0 },
        { y: height - 6, slope: 0.1 },
        { y: height - 10, slope: -0.1 },
        { y: height - 14, slope: 0.1 },
        { y: height - 18, slope: -0.1 }
    ];
    
    // Draw platforms
    platforms.forEach((platform, level) => {
        for (let x = 0; x < width; x++) {
            const py = Math.floor(platform.y + x * platform.slope);
            if (py >= 0 && py < height) {
                buffer[py][x] = '=';
                // Ladders
                if (x % 15 === 10 && level < platforms.length - 1) {
                    for (let ly = py - 1; ly > platforms[level + 1].y; ly--) {
                        if (ly >= 0) buffer[ly][x] = 'H';
                    }
                }
            }
        }
    });
    
    // Mario position
    const marioLevel = Math.floor(t / 3) % platforms.length;
    const marioX = ((t * 10) % width);
    const marioY = platforms[marioLevel].y - 1 + marioX * platforms[marioLevel].slope;
    
    // Draw Mario
    if (Math.floor(marioX) >= 0 && Math.floor(marioX) < width && 
        Math.floor(marioY) >= 0 && Math.floor(marioY) < height) {
        buffer[Math.floor(marioY)][Math.floor(marioX)] = 'M';
    }
    
    // Barrels (audio reactive)
    const barrelCount = 3 + Math.floor(bassLevel * 5);
    for (let i = 0; i < barrelCount; i++) {
        const barrelProgress = ((t * 0.5 + i * 0.2) % 1);
        const barrelLevel = Math.floor(barrelProgress * platforms.length);
        const platform = platforms[barrelLevel];
        const barrelX = barrelProgress * width;
        const barrelY = platform.y - 1 + barrelX * platform.slope;
        
        if (Math.floor(barrelX) >= 0 && Math.floor(barrelX) < width && 
            Math.floor(barrelY) >= 0 && Math.floor(barrelY) < height) {
            buffer[Math.floor(barrelY)][Math.floor(barrelX)] = 'O';
        }
    }
    
    // DK at top
    const dkX = width / 2;
    const dkY = 2;
    if (dkX - 1 >= 0 && dkX + 1 < width) {
        buffer[dkY][Math.floor(dkX - 1)] = '[';
        buffer[dkY][Math.floor(dkX)] = bassLevel > 0.5 ? 'D' : 'K';
        buffer[dkY][Math.floor(dkX + 1)] = ']';
    }
    
    // Princess at top platform
    buffer[platforms[platforms.length - 1].y - 1][Math.floor(width / 2 + 5)] = 'P';
};
