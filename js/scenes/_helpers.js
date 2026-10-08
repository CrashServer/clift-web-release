// CLIFT scene registry + helpers shared by scene files.
// Scenes register as CLIFTScenes[id] = function(buffer, width, height, time, params).

window.CLIFTScenes = window.CLIFTScenes || {};

// Helper function to draw lines
function drawLine(buffer, x0, y0, x1, y1, char) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        if (x0 >= 0 && x0 < buffer[0].length && y0 >= 0 && y0 < buffer.length) {
            buffer[y0][x0] = char;
        }
        
        if (x0 === x1 && y0 === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}
