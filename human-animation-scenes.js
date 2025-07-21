// ============================================
// CATEGORY 20: Human Animation Scenes (205-214)
// ============================================

// Scene 205: Human Walker
CLIFTScenes[205] = function(buffer, width, height, time, params) {
    const walkSpeed = (params.param1 || 0.5) * 5 + 1.0;
    const strideLength = (params.param2 || 0.5) * 2 + 0.5;
    const t = time * 0.001 * walkSpeed;
    
    const figureX = Math.floor((t * 10) % width);
    const figureY = Math.floor(height * 0.7);
    
    // Animated walking figure
    const walkCycle = Math.sin(t * 8) * strideLength;
    const headBob = Math.sin(t * 16) * 0.5;
    
    // Head
    if (figureY - 4 + headBob >= 0 && figureY - 4 + headBob < height) {
        buffer[Math.floor(figureY - 4 + headBob)][figureX] = 'O';
    }
    
    // Body
    for (let i = 1; i <= 3; i++) {
        if (figureY - 4 + i >= 0 && figureY - 4 + i < height) {
            buffer[figureY - 4 + i][figureX] = '|';
        }
    }
    
    // Arms
    const armSwing = Math.sin(t * 8) * 2;
    if (figureY - 2 >= 0 && figureY - 2 < height) {
        if (figureX - 1 + armSwing >= 0 && figureX - 1 + armSwing < width) {
            buffer[figureY - 2][Math.floor(figureX - 1 + armSwing)] = '/';
        }
        if (figureX + 1 - armSwing >= 0 && figureX + 1 - armSwing < width) {
            buffer[figureY - 2][Math.floor(figureX + 1 - armSwing)] = '\\';
        }
    }
    
    // Legs
    const leftLeg = Math.sin(t * 8) * walkCycle;
    const rightLeg = Math.sin(t * 8 + Math.PI) * walkCycle;
    
    if (figureY >= 0 && figureY < height) {
        if (figureX - 1 + leftLeg >= 0 && figureX - 1 + leftLeg < width) {
            buffer[figureY][Math.floor(figureX - 1 + leftLeg)] = '/';
        }
        if (figureX + 1 + rightLeg >= 0 && figureX + 1 + rightLeg < width) {
            buffer[figureY][Math.floor(figureX + 1 + rightLeg)] = '\\';
        }
    }
    
    // Footprints
    for (let i = 0; i < 10; i++) {
        const footX = figureX - i * 3;
        if (footX >= 0 && footX < width && figureY + 1 < height) {
            buffer[figureY + 1][footX] = '.';
        }
    }
};

// Scene 206: Dance Party
CLIFTScenes[206] = function(buffer, width, height, time, params) {
    const numDancers = Math.floor((params.param1 || 0.5) * 4) + 1;
    const energy = (params.param2 || 0.5) * 2 + 0.5;
    const sync = params.param3 || 0.5;
    const t = time * 0.001 * energy;
    
    for (let d = 0; d < numDancers; d++) {
        const baseX = Math.floor((width / (numDancers + 1)) * (d + 1));
        const baseY = Math.floor(height * 0.7);
        const phase = sync > 0.5 ? 0 : d * Math.PI / 4;
        
        // Dancing motion
        const danceX = Math.sin(t * 4 + phase) * 3;
        const danceY = Math.sin(t * 8 + phase) * 2;
        const figureX = Math.floor(baseX + danceX);
        const figureY = Math.floor(baseY + danceY);
        
        // Head with movement
        if (figureY - 4 >= 0 && figureY - 4 < height && figureX >= 0 && figureX < width) {
            buffer[figureY - 4][figureX] = 'O';
        }
        
        // Body
        for (let i = 1; i <= 3; i++) {
            if (figureY - 4 + i >= 0 && figureY - 4 + i < height && figureX >= 0 && figureX < width) {
                buffer[figureY - 4 + i][figureX] = '|';
            }
        }
        
        // Dancing arms
        const armAngle = Math.sin(t * 6 + phase) * Math.PI / 2;
        const armX1 = Math.floor(figureX + Math.cos(armAngle) * 2);
        const armY1 = figureY - 2;
        const armX2 = Math.floor(figureX + Math.cos(armAngle + Math.PI) * 2);
        const armY2 = figureY - 2;
        
        if (armY1 >= 0 && armY1 < height) {
            if (armX1 >= 0 && armX1 < width) buffer[armY1][armX1] = '/';
            if (armX2 >= 0 && armX2 < width) buffer[armY2][armX2] = '\\';
        }
        
        // Dancing legs
        const legAngle = Math.sin(t * 10 + phase) * Math.PI / 4;
        if (figureY >= 0 && figureY < height) {
            const legX1 = Math.floor(figureX + Math.sin(legAngle));
            const legX2 = Math.floor(figureX - Math.sin(legAngle));
            if (legX1 >= 0 && legX1 < width) buffer[figureY][legX1] = '/';
            if (legX2 >= 0 && legX2 < width) buffer[figureY][legX2] = '\\';
        }
    }
    
    // Dance floor effects
    for (let x = 0; x < width; x += 4) {
        for (let y = height - 3; y < height; y++) {
            if (Math.sin(t * 5 + x * 0.1) > 0.5) {
                buffer[y][x] = '·';
            }
        }
    }
};

// Scene 207: Martial Arts
CLIFTScenes[207] = function(buffer, width, height, time, params) {
    const moveSpeed = (params.param1 || 0.5) * 3 + 0.5;
    const kickHeight = (params.param2 || 0.5) * 2 + 1;
    const stanceWidth = (params.param3 || 0.5) * 2 + 1;
    const t = time * 0.001 * moveSpeed;
    
    const fighter1X = Math.floor(width * 0.3);
    const fighter2X = Math.floor(width * 0.7);
    const fighterY = Math.floor(height * 0.7);
    
    // Fighter 1 (left)
    const kick1 = Math.sin(t * 3) > 0.7 ? kickHeight : 0;
    const stance1 = Math.sin(t * 2) * stanceWidth;
    
    // Head
    if (fighterY - 4 >= 0 && fighterY - 4 < height) {
        buffer[fighterY - 4][fighter1X] = 'O';
    }
    
    // Body
    for (let i = 1; i <= 3; i++) {
        if (fighterY - 4 + i >= 0 && fighterY - 4 + i < height) {
            buffer[fighterY - 4 + i][fighter1X] = '|';
        }
    }
    
    // Fighting stance arms
    if (fighterY - 2 >= 0 && fighterY - 2 < height) {
        if (fighter1X - 2 >= 0) buffer[fighterY - 2][fighter1X - 2] = '[';
        if (fighter1X + 2 < width) buffer[fighterY - 2][fighter1X + 2] = ']';
    }
    
    // Kicking leg
    if (kick1 > 0) {
        const kickX = Math.floor(fighter1X + 3);
        const kickY = Math.floor(fighterY - kick1);
        if (kickX < width && kickY >= 0 && kickY < height) {
            buffer[kickY][kickX] = '>';
        }
    }
    
    // Regular legs
    if (fighterY >= 0 && fighterY < height) {
        const legSpread = stance1;
        if (fighter1X - 1 + legSpread >= 0) buffer[fighterY][Math.floor(fighter1X - 1 + legSpread)] = '/';
        if (fighter1X + 1 - legSpread < width) buffer[fighterY][Math.floor(fighter1X + 1 - legSpread)] = '\\';
    }
    
    // Fighter 2 (right) - mirror movements
    const kick2 = Math.sin(t * 3 + Math.PI) > 0.7 ? kickHeight : 0;
    const stance2 = Math.sin(t * 2 + Math.PI) * stanceWidth;
    
    // Head
    if (fighterY - 4 >= 0 && fighterY - 4 < height) {
        buffer[fighterY - 4][fighter2X] = 'O';
    }
    
    // Body
    for (let i = 1; i <= 3; i++) {
        if (fighterY - 4 + i >= 0 && fighterY - 4 + i < height) {
            buffer[fighterY - 4 + i][fighter2X] = '|';
        }
    }
    
    // Fighting stance arms
    if (fighterY - 2 >= 0 && fighterY - 2 < height) {
        if (fighter2X - 2 >= 0) buffer[fighterY - 2][fighter2X - 2] = '[';
        if (fighter2X + 2 < width) buffer[fighterY - 2][fighter2X + 2] = ']';
    }
    
    // Kicking leg
    if (kick2 > 0) {
        const kickX = Math.floor(fighter2X - 3);
        const kickY = Math.floor(fighterY - kick2);
        if (kickX >= 0 && kickY >= 0 && kickY < height) {
            buffer[kickY][kickX] = '<';
        }
    }
    
    // Impact effects
    if (kick1 > 0 || kick2 > 0) {
        const centerX = Math.floor((fighter1X + fighter2X) / 2);
        if (fighterY - 2 >= 0 && fighterY - 2 < height) {
            buffer[fighterY - 2][centerX] = '*';
        }
    }
};

// Scene 208: Human Pyramid
CLIFTScenes[208] = function(buffer, width, height, time, params) {
    const pyramidSize = Math.floor((params.param1 || 0.5) * 3) + 2;
    const stability = params.param2 || 0.5;
    const wobble = (1 - stability) * Math.sin(time * 0.003) * 2;
    
    const baseY = Math.floor(height * 0.8);
    const centerX = Math.floor(width / 2);
    
    for (let level = 0; level < pyramidSize; level++) {
        const peopleInLevel = pyramidSize - level;
        const levelY = baseY - level * 4;
        const levelWobble = wobble * (level + 1) * 0.5;
        
        for (let person = 0; person < peopleInLevel; person++) {
            const spacing = 6;
            const startX = centerX - ((peopleInLevel - 1) * spacing) / 2;
            const personX = Math.floor(startX + person * spacing + levelWobble);
            
            if (personX >= 1 && personX < width - 1 && levelY >= 4 && levelY < height) {
                // Head
                buffer[levelY - 4][personX] = 'O';
                
                // Body
                for (let i = 1; i <= 3; i++) {
                    if (levelY - 4 + i < height) {
                        buffer[levelY - 4 + i][personX] = '|';
                    }
                }
                
                // Arms spread for support
                if (levelY - 2 < height) {
                    if (personX - 1 >= 0) buffer[levelY - 2][personX - 1] = '-';
                    if (personX + 1 < width) buffer[levelY - 2][personX + 1] = '-';
                }
                
                // Legs
                if (levelY < height) {
                    if (personX - 1 >= 0) buffer[levelY][personX - 1] = '/';
                    if (personX + 1 < width) buffer[levelY][personX + 1] = '\\';
                }
            }
        }
    }
    
    // Base support lines
    for (let x = centerX - pyramidSize * 3; x <= centerX + pyramidSize * 3; x++) {
        if (x >= 0 && x < width && baseY + 1 < height) {
            buffer[baseY + 1][x] = '=';
        }
    }
};

// Scene 209: Yoga Flow
CLIFTScenes[209] = function(buffer, width, height, time, params) {
    const flowSpeed = (params.param1 || 0.5) * 2 + 0.3;
    const flexibility = (params.param2 || 0.5) * 2 + 0.5;
    const balance = params.param3 || 0.5;
    const t = time * 0.001 * flowSpeed;
    
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height * 0.7);
    
    // Yoga pose cycle
    const posePhase = (t % 12) / 12; // 12 second cycle
    const balanceWobble = (1 - balance) * Math.sin(t * 5) * 0.5;
    
    let headX = centerX;
    let headY = centerY - 4;
    let bodyAngle = 0;
    let armAngle1 = 0;
    let armAngle2 = 0;
    let legAngle1 = 0;
    let legAngle2 = 0;
    
    // Different poses based on phase
    if (posePhase < 0.25) { // Warrior I
        armAngle1 = -Math.PI / 2;
        armAngle2 = -Math.PI / 2;
        legAngle1 = -Math.PI / 6;
        legAngle2 = Math.PI / 6;
    } else if (posePhase < 0.5) { // Tree pose
        armAngle1 = -Math.PI / 3;
        armAngle2 = -Math.PI / 3;
        legAngle1 = -Math.PI / 2;
        legAngle2 = 0;
    } else if (posePhase < 0.75) { // Downward dog
        headY = centerY - 1;
        bodyAngle = Math.PI / 4;
        armAngle1 = -Math.PI / 3;
        armAngle2 = -Math.PI / 3;
        legAngle1 = Math.PI / 4;
        legAngle2 = Math.PI / 4;
    } else { // Mountain pose
        armAngle1 = 0;
        armAngle2 = 0;
        legAngle1 = 0;
        legAngle2 = 0;
    }
    
    // Apply balance wobble
    headX += balanceWobble;
    
    // Draw figure
    if (headY >= 0 && headY < height && headX >= 0 && headX < width) {
        buffer[headY][headX] = 'O';
    }
    
    // Body
    const bodyLength = 3 * flexibility;
    for (let i = 1; i <= bodyLength; i++) {
        const bodyX = Math.floor(headX + Math.sin(bodyAngle) * i);
        const bodyY = Math.floor(headY + Math.cos(bodyAngle) * i);
        if (bodyX >= 0 && bodyX < width && bodyY >= 0 && bodyY < height) {
            buffer[bodyY][bodyX] = '|';
        }
    }
    
    // Arms
    const armLength = 2 * flexibility;
    const arm1X = Math.floor(headX + Math.cos(armAngle1) * armLength);
    const arm1Y = Math.floor(headY + 1 + Math.sin(armAngle1) * armLength);
    const arm2X = Math.floor(headX + Math.cos(armAngle2) * armLength);
    const arm2Y = Math.floor(headY + 1 + Math.sin(armAngle2) * armLength);
    
    if (arm1X >= 0 && arm1X < width && arm1Y >= 0 && arm1Y < height) {
        buffer[arm1Y][arm1X] = '/';
    }
    if (arm2X >= 0 && arm2X < width && arm2Y >= 0 && arm2Y < height) {
        buffer[arm2Y][arm2X] = '\\';
    }
    
    // Legs
    const legLength = 2;
    const leg1X = Math.floor(headX + Math.cos(legAngle1) * legLength);
    const leg1Y = Math.floor(centerY + Math.sin(legAngle1) * legLength);
    const leg2X = Math.floor(headX + Math.cos(legAngle2) * legLength);
    const leg2Y = Math.floor(centerY + Math.sin(legAngle2) * legLength);
    
    if (leg1X >= 0 && leg1X < width && leg1Y >= 0 && leg1Y < height) {
        buffer[leg1Y][leg1X] = '/';
    }
    if (leg2X >= 0 && leg2X < width && leg2Y >= 0 && leg2Y < height) {
        buffer[leg2Y][leg2X] = '\\';
    }
    
    // Yoga mat
    for (let x = centerX - 8; x <= centerX + 8; x++) {
        if (x >= 0 && x < width && centerY + 2 < height) {
            buffer[centerY + 2][x] = '_';
        }
    }
};

// Scene 210: Sports Stadium
CLIFTScenes[210] = function(buffer, width, height, time, params) {
    const gameSpeed = (params.param1 || 0.5) * 3 + 1;
    const numPlayers = Math.floor((params.param2 || 0.5) * 4) + 2;
    const ballHeight = (params.param3 || 0.5) * 5 + 2;
    const t = time * 0.001 * gameSpeed;
    
    // Field dimensions
    const fieldY = Math.floor(height * 0.8);
    
    // Draw field
    for (let x = 0; x < width; x++) {
        if (fieldY < height) buffer[fieldY][x] = '=';
        if (fieldY - 10 >= 0) buffer[fieldY - 10][x] = '-';
    }
    
    // Goal posts
    if (fieldY - 5 >= 0 && fieldY - 5 < height) {
        buffer[fieldY - 5][0] = '|';
        buffer[fieldY - 5][width - 1] = '|';
    }
    if (fieldY - 8 >= 0 && fieldY - 8 < height) {
        buffer[fieldY - 8][0] = '|';
        buffer[fieldY - 8][width - 1] = '|';
    }
    
    // Players
    for (let p = 0; p < numPlayers; p++) {
        const playerX = Math.floor((width / (numPlayers + 1)) * (p + 1) + Math.sin(t + p) * 3);
        const playerY = fieldY - 4;
        const running = Math.sin(t * 4 + p) * 0.5;
        
        // Head
        if (playerY >= 0 && playerY < height && playerX >= 0 && playerX < width) {
            buffer[playerY][playerX] = 'O';
        }
        
        // Body
        if (playerY + 1 >= 0 && playerY + 1 < height && playerX >= 0 && playerX < width) {
            buffer[playerY + 1][playerX] = '|';
        }
        if (playerY + 2 >= 0 && playerY + 2 < height && playerX >= 0 && playerX < width) {
            buffer[playerY + 2][playerX] = '|';
        }
        
        // Running arms
        const armSwing = running;
        if (playerY + 1 >= 0 && playerY + 1 < height) {
            if (playerX - 1 + armSwing >= 0 && playerX - 1 + armSwing < width) {
                buffer[playerY + 1][Math.floor(playerX - 1 + armSwing)] = '/';
            }
            if (playerX + 1 - armSwing >= 0 && playerX + 1 - armSwing < width) {
                buffer[playerY + 1][Math.floor(playerX + 1 - armSwing)] = '\\';
            }
        }
        
        // Running legs
        if (playerY + 3 >= 0 && playerY + 3 < height) {
            if (playerX - 1 - armSwing >= 0 && playerX - 1 - armSwing < width) {
                buffer[playerY + 3][Math.floor(playerX - 1 - armSwing)] = '/';
            }
            if (playerX + 1 + armSwing >= 0 && playerX + 1 + armSwing < width) {
                buffer[playerY + 3][Math.floor(playerX + 1 + armSwing)] = '\\';
            }
        }
    }
    
    // Ball
    const ballX = Math.floor((Math.sin(t * 2) + 1) * width / 2);
    const ballY = Math.floor(fieldY - ballHeight - Math.abs(Math.sin(t * 6)) * 3);
    
    if (ballX >= 0 && ballX < width && ballY >= 0 && ballY < height) {
        buffer[ballY][ballX] = 'o';
    }
    
    // Ball trail
    for (let i = 1; i <= 3; i++) {
        const trailX = ballX - i * 2;
        const trailY = ballY + i;
        if (trailX >= 0 && trailX < width && trailY >= 0 && trailY < height) {
            buffer[trailY][trailX] = '·';
        }
    }
};

// Scene 211: Robot Dance
CLIFTScenes[211] = function(buffer, width, height, time, params) {
    const robotSpeed = (params.param1 || 0.5) * 4 + 1;
    const stiffness = params.param2 || 0.5;
    const numRobots = Math.floor((params.param3 || 0.5) * 3) + 1;
    const t = time * 0.001 * robotSpeed;
    
    for (let r = 0; r < numRobots; r++) {
        const baseX = Math.floor((width / (numRobots + 1)) * (r + 1));
        const baseY = Math.floor(height * 0.7);
        const phase = r * Math.PI / 2;
        
        // Robotic movements (step-wise, not smooth)
        const stepTime = Math.floor(t * 4 + phase) / 4;
        const moveX = Math.floor(Math.sin(stepTime * 4) * 2);
        const moveY = Math.floor(Math.cos(stepTime * 6) * 1);
        
        const robotX = baseX + moveX;
        const robotY = baseY + moveY;
        
        // Robot head (square)
        if (robotY - 4 >= 0 && robotY - 4 < height && robotX >= 0 && robotX < width) {
            buffer[robotY - 4][robotX] = '□';
        }
        
        // Robot body
        for (let i = 1; i <= 3; i++) {
            if (robotY - 4 + i >= 0 && robotY - 4 + i < height && robotX >= 0 && robotX < width) {
                buffer[robotY - 4 + i][robotX] = '█';
            }
        }
        
        // Robotic arms (angular movements)
        const armPhase = Math.floor(stepTime * 2) % 4;
        let arm1X = robotX - 2, arm1Y = robotY - 2;
        let arm2X = robotX + 2, arm2Y = robotY - 2;
        
        switch (armPhase) {
            case 0: arm1Y--; arm2Y--; break;
            case 1: arm1X--; arm2X++; break;
            case 2: arm1Y++; arm2Y++; break;
            case 3: arm1X++; arm2X--; break;
        }
        
        if (arm1X >= 0 && arm1X < width && arm1Y >= 0 && arm1Y < height) {
            buffer[arm1Y][arm1X] = '├';
        }
        if (arm2X >= 0 && arm2X < width && arm2Y >= 0 && arm2Y < height) {
            buffer[arm2Y][arm2X] = '┤';
        }
        
        // Robotic legs
        const legPhase = Math.floor(stepTime * 3) % 2;
        if (robotY >= 0 && robotY < height) {
            if (legPhase === 0) {
                if (robotX - 1 >= 0) buffer[robotY][robotX - 1] = '┘';
                if (robotX + 1 < width) buffer[robotY][robotX + 1] = '└';
            } else {
                if (robotX - 1 >= 0) buffer[robotY][robotX - 1] = '└';
                if (robotX + 1 < width) buffer[robotY][robotX + 1] = '┘';
            }
        }
        
        // Robot effects
        if (Math.floor(stepTime * 8) % 2 === 0) {
            if (robotY - 5 >= 0 && robotY - 5 < height && robotX >= 0 && robotX < width) {
                buffer[robotY - 5][robotX] = '!';
            }
        }
    }
};

// Scene 212: Crowd Wave
CLIFTScenes[212] = function(buffer, width, height, time, params) {
    const waveSpeed = (params.param1 || 0.5) * 3 + 0.5;
    const waveHeight = (params.param2 || 0.5) * 2 + 0.5;
    const crowdDensity = Math.floor((params.param3 || 0.5) * 20) + 10;
    const t = time * 0.001 * waveSpeed;
    
    const rows = 4;
    const rowHeight = Math.floor(height / rows);
    
    for (let row = 0; row < rows; row++) {
        const baseY = height - (row + 1) * rowHeight;
        const spacing = Math.floor(width / crowdDensity);
        
        for (let person = 0; person < crowdDensity; person++) {
            const personX = person * spacing + spacing / 2;
            const wavePhase = (personX / width * 2 * Math.PI) - (t * 4);
            const isWaving = Math.sin(wavePhase) > 0.3;
            const waveOffset = isWaving ? Math.floor(Math.sin(wavePhase) * waveHeight * 3) : 0;
            
            const figureY = baseY - waveOffset;
            
            // Only draw if within bounds
            if (personX >= 0 && personX < width && figureY >= 3 && figureY < height) {
                // Head
                buffer[figureY - 3][personX] = 'o';
                
                // Body
                buffer[figureY - 2][personX] = '|';
                buffer[figureY - 1][personX] = '|';
                
                // Arms - raised if waving
                if (isWaving) {
                    if (personX - 1 >= 0) buffer[figureY - 3][personX - 1] = '\\';
                    if (personX + 1 < width) buffer[figureY - 3][personX + 1] = '/';
                } else {
                    if (personX - 1 >= 0) buffer[figureY - 2][personX - 1] = '-';
                    if (personX + 1 < width) buffer[figureY - 2][personX + 1] = '-';
                }
                
                // Legs
                if (personX - 1 >= 0) buffer[figureY][personX - 1] = '/';
                if (personX + 1 < width) buffer[figureY][personX + 1] = '\\';
            }
        }
    }
    
    // Stadium structure
    for (let x = 0; x < width; x++) {
        for (let row = 0; row < rows; row++) {
            const y = height - (row + 1) * rowHeight - 1;
            if (y >= 0 && y < height) {
                buffer[y][x] = '=';
            }
        }
    }
};

// Scene 213: Mirror Dance
CLIFTScenes[213] = function(buffer, width, height, time, params) {
    const complexity = (params.param1 || 0.5) * 3 + 1;
    const mirrorDelay = (params.param2 || 0.5) * 0.5;
    const mirrorDistance = Math.floor((params.param3 || 0.5) * 5) + 3;
    const t = time * 0.001;
    
    const centerX = Math.floor(width / 2);
    const dancer1X = centerX - mirrorDistance;
    const dancer2X = centerX + mirrorDistance;
    const dancerY = Math.floor(height * 0.7);
    
    // Dancer 1 (original)
    const dance1X = Math.sin(t * complexity) * 3;
    const dance1Y = Math.cos(t * complexity * 1.5) * 2;
    const armAngle1 = Math.sin(t * complexity * 2) * Math.PI / 2;
    
    const fig1X = Math.floor(dancer1X + dance1X);
    const fig1Y = Math.floor(dancerY + dance1Y);
    
    // Draw dancer 1
    if (fig1Y - 4 >= 0 && fig1Y - 4 < height && fig1X >= 0 && fig1X < width) {
        buffer[fig1Y - 4][fig1X] = 'O';
    }
    
    for (let i = 1; i <= 3; i++) {
        if (fig1Y - 4 + i >= 0 && fig1Y - 4 + i < height && fig1X >= 0 && fig1X < width) {
            buffer[fig1Y - 4 + i][fig1X] = '|';
        }
    }
    
    // Arms for dancer 1
    const arm1X1 = Math.floor(fig1X + Math.cos(armAngle1) * 2);
    const arm1Y1 = Math.floor(fig1Y - 2 + Math.sin(armAngle1) * 2);
    const arm1X2 = Math.floor(fig1X - Math.cos(armAngle1) * 2);
    const arm1Y2 = Math.floor(fig1Y - 2 - Math.sin(armAngle1) * 2);
    
    if (arm1X1 >= 0 && arm1X1 < width && arm1Y1 >= 0 && arm1Y1 < height) {
        buffer[arm1Y1][arm1X1] = '/';
    }
    if (arm1X2 >= 0 && arm1X2 < width && arm1Y2 >= 0 && arm1Y2 < height) {
        buffer[arm1Y2][arm1X2] = '\\';
    }
    
    // Legs for dancer 1
    if (fig1Y >= 0 && fig1Y < height) {
        if (fig1X - 1 >= 0) buffer[fig1Y][fig1X - 1] = '/';
        if (fig1X + 1 < width) buffer[fig1Y][fig1X + 1] = '\\';
    }
    
    // Dancer 2 (mirrored with delay)
    const delayedT = t - mirrorDelay;
    const dance2X = -Math.sin(delayedT * complexity) * 3; // Mirrored X
    const dance2Y = Math.cos(delayedT * complexity * 1.5) * 2;
    const armAngle2 = -Math.sin(delayedT * complexity * 2) * Math.PI / 2; // Mirrored angle
    
    const fig2X = Math.floor(dancer2X + dance2X);
    const fig2Y = Math.floor(dancerY + dance2Y);
    
    // Draw dancer 2
    if (fig2Y - 4 >= 0 && fig2Y - 4 < height && fig2X >= 0 && fig2X < width) {
        buffer[fig2Y - 4][fig2X] = 'O';
    }
    
    for (let i = 1; i <= 3; i++) {
        if (fig2Y - 4 + i >= 0 && fig2Y - 4 + i < height && fig2X >= 0 && fig2X < width) {
            buffer[fig2Y - 4 + i][fig2X] = '|';
        }
    }
    
    // Arms for dancer 2 (mirrored)
    const arm2X1 = Math.floor(fig2X + Math.cos(armAngle2) * 2);
    const arm2Y1 = Math.floor(fig2Y - 2 + Math.sin(armAngle2) * 2);
    const arm2X2 = Math.floor(fig2X - Math.cos(armAngle2) * 2);
    const arm2Y2 = Math.floor(fig2Y - 2 - Math.sin(armAngle2) * 2);
    
    if (arm2X1 >= 0 && arm2X1 < width && arm2Y1 >= 0 && arm2Y1 < height) {
        buffer[arm2Y1][arm2X1] = '/';
    }
    if (arm2X2 >= 0 && arm2X2 < width && arm2Y2 >= 0 && arm2Y2 < height) {
        buffer[arm2Y2][arm2X2] = '\\';
    }
    
    // Legs for dancer 2
    if (fig2Y >= 0 && fig2Y < height) {
        if (fig2X - 1 >= 0) buffer[fig2Y][fig2X - 1] = '/';
        if (fig2X + 1 < width) buffer[fig2Y][fig2X + 1] = '\\';
    }
    
    // Mirror line
    for (let y = 0; y < height; y++) {
        if (centerX >= 0 && centerX < width) {
            buffer[y][centerX] = '|';
        }
    }
};

// Scene 214: Human Evolution
CLIFTScenes[214] = function(buffer, width, height, time, params) {
    const evolutionSpeed = (params.param1 || 0.5) * 2 + 0.5;
    const numStages = Math.floor((params.param2 || 0.5) * 4) + 3;
    const morphSmoothness = params.param3 || 0.5;
    const t = time * 0.001 * evolutionSpeed;
    
    const baseY = Math.floor(height * 0.8);
    const spacing = Math.floor(width / numStages);
    
    // Evolution stages
    const stages = [
        { name: 'Ape', height: 2, posture: 0.8, arms: 0.2 },
        { name: 'Early Human', height: 3, posture: 0.6, arms: 0.4 },
        { name: 'Homo Erectus', height: 4, posture: 0.3, arms: 0.6 },
        { name: 'Neanderthal', height: 4, posture: 0.2, arms: 0.7 },
        { name: 'Modern Human', height: 5, posture: 0.0, arms: 1.0 },
        { name: 'Future Human', height: 6, posture: -0.1, arms: 1.2 },
        { name: 'Cyborg', height: 6, posture: -0.1, arms: 1.3 }
    ];
    
    // Animation cycle through evolution
    const cycleProgress = (t % 10) / 10; // 10 second cycle
    const morphPhase = Math.sin(cycleProgress * Math.PI * 2) * morphSmoothness;
    
    for (let stage = 0; stage < Math.min(numStages, stages.length); stage++) {
        const stageData = stages[stage];
        const stageX = spacing * stage + spacing / 2;
        const figureY = baseY - Math.floor(stageData.height * 2);
        
        // Morphing effect
        const morphOffset = Math.sin(t + stage) * morphPhase;
        const finalX = Math.floor(stageX + morphOffset);
        const finalY = Math.floor(figureY + morphOffset * 0.5);
        
        // Head
        if (finalY >= 0 && finalY < height && finalX >= 0 && finalX < width) {
            if (stage >= 6) {
                buffer[finalY][finalX] = '◊'; // Cyborg head
            } else {
                buffer[finalY][finalX] = 'O';
            }
        }
        
        // Body
        const bodyHeight = Math.floor(stageData.height);
        for (let i = 1; i <= bodyHeight; i++) {
            const bodyY = finalY + i;
            if (bodyY >= 0 && bodyY < height && finalX >= 0 && finalX < width) {
                if (stage >= 6) {
                    buffer[bodyY][finalX] = '║'; // Cyborg body
                } else {
                    buffer[bodyY][finalX] = '|';
                }
            }
        }
        
        // Posture and arms
        const postureOffset = Math.floor(stageData.posture * 2);
        const armLength = Math.floor(stageData.arms * 2);
        const armY = finalY + 1 + postureOffset;
        
        if (armY >= 0 && armY < height) {
            // Left arm
            for (let a = 1; a <= armLength; a++) {
                const armX = finalX - a;
                if (armX >= 0 && armX < width) {
                    if (stage >= 6) {
                        buffer[armY][armX] = '═'; // Cyborg arm
                    } else {
                        buffer[armY][armX] = stage < 2 ? '\\' : '-';
                    }
                }
            }
            
            // Right arm
            for (let a = 1; a <= armLength; a++) {
                const armX = finalX + a;
                if (armX >= 0 && armX < width) {
                    if (stage >= 6) {
                        buffer[armY][armX] = '═'; // Cyborg arm
                    } else {
                        buffer[armY][armX] = stage < 2 ? '/' : '-';
                    }
                }
            }
        }
        
        // Legs with posture
        const legY = finalY + bodyHeight + 1;
        if (legY >= 0 && legY < height) {
            const legSpread = stage < 2 ? 0 : 1;
            if (finalX - legSpread >= 0) {
                buffer[legY][finalX - legSpread] = stage >= 6 ? '╱' : '/';
            }
            if (finalX + legSpread < width) {
                buffer[legY][finalX + legSpread] = stage >= 6 ? '╲' : '\\';
            }
        }
        
        // Stage label
        const labelY = baseY + 2;
        if (labelY < height) {
            const label = stageData.name.substring(0, 3);
            for (let c = 0; c < label.length; c++) {
                const labelX = finalX - 1 + c;
                if (labelX >= 0 && labelX < width) {
                    buffer[labelY][labelX] = label[c];
                }
            }
        }
    }
    
    // Evolution timeline
    for (let x = 0; x < width; x++) {
        if (baseY + 1 < height) {
            buffer[baseY + 1][x] = '─';
        }
    }
    
    // Time arrows
    const arrowPhase = Math.floor(t) % 3;
    for (let a = 0; a < numStages - 1; a++) {
        const arrowX = spacing * (a + 1);
        if (arrowX < width && baseY + 1 < height && arrowPhase === a % 3) {
            buffer[baseY + 1][arrowX] = '>';
        }
    }
};