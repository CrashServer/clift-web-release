// 3D ASCII world.
//
// Ray-marched structures (signed distance fields, repeated so the world never
// ends) that the camera flies through. Every surface wears the live mixed decks
// as a texture (triplanar projection), lit and tinted with the deck colors,
// fading to black with distance.
//
// Rendering is two GPU passes:
//   1. march: one ray per character cell into a small target (color + brightness)
//   2. ascii: draws each cell as a glyph picked by brightness from a glyph ramp
//      ('ascii'), as a flat colored cell ('blocks'), or the march result smoothly
//      upscaled at a finer resolution ('raw').
// The result then goes through the visual FX / post-FX like any other source.

(function () {
    const WORLDS = ['Off', 'Explore', 'City', 'Monoliths', 'Temple', 'Cubes', 'Terrain', 'Rings', 'Lattice'];
    const MOVES = ['Fly', 'Orbit', 'Crane', 'Drift'];
    const STYLES = ['ASCII', 'Blocks', 'Raw'];
    const RAMP = ' .,:;-=+*x#%@&█';

    const QUAD_VS = `
        attribute vec2 a_position;
        varying vec2 v_uv; // (0,0) = top-left of the screen
        void main() {
            v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;

    const MARCH_FS = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform sampler2D u_content;
        uniform bool u_contentFlip;
        uniform sampler2D u_spectrum;   // 64 x 1
        uniform float u_world;
        uniform vec2 u_screenAspect;    // (width / height, 1)
        uniform vec3 u_camPos;
        uniform vec3 u_camTarget;
        uniform float u_camRoll;
        uniform float u_fov;
        uniform float u_time;
        uniform float u_bass;
        uniform float u_react;
        uniform float u_contentAmt;
        uniform float u_fog;
        uniform float u_texScale;
        uniform float u_seed;
        uniform float u_maxDist;
        uniform float u_fogScale;       // open worlds see much further
        uniform vec3 u_colA;
        uniform vec3 u_colB;
        varying vec2 v_uv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float spec(float x) { return texture2D(u_spectrum, vec2((floor(mod(x, 64.0)) + 0.5) / 64.0, 0.5)).r; }
        float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
        float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }

        float matId; // 0 floor/ground, 1 structure

        // ---- Explore: a generated world (terrain + landmarks), mirrored in JS ----
        // Keep in sync with the JS functions h12 / vn / groundH / cellInfo below.
        const float CELL = 36.0;
        float h12(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }
        float vn(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), f.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        float groundH(vec2 p) {
            vec2 q = p * 0.012 + u_seed;
            float h = (vn(q) + vn(q * 2.1 + 5.2) * 0.5 + vn(q * 4.3 + 1.7) * 0.25) / 1.75;
            float amp = mix(3.0, 24.0, vn(p * 0.002 + u_seed * 0.7 + 11.0));
            return (h - 0.35) * amp;
        }
        // Landmark of a cell: type 0 none, 1 tower, 2 spire, 3 gate, 4 ruins,
        // 5 monolith, 6 orb, 7 rocks. Biomes decide which types appear where.
        void cellInfo(vec2 c, out vec2 ctr, out float type, out float H, out float R, out float ang) {
            float r1 = h12(c + u_seed * 13.1), r2 = h12(c * 1.7 + 3.3 + u_seed), r3 = h12(c * 2.3 + 7.7 + u_seed), r4 = h12(c * 3.1 + 1.1 + u_seed);
            ctr = (c + 0.5) * CELL + (vec2(r2, r3) - 0.5) * CELL * 0.45;
            float biome = floor(vn(ctr * 0.004 + u_seed * 1.3 + 3.0) * 5.99);
            ang = r4 * 6.2831853;
            if (biome < 0.5) type = r1 < 0.25 ? 0.0 : r1 < 0.75 ? 1.0 : r1 < 0.9 ? 5.0 : 4.0;
            else if (biome < 1.5) type = r1 < 0.3 ? 0.0 : r1 < 0.85 ? 2.0 : 7.0;
            else if (biome < 2.5) type = r1 < 0.3 ? 0.0 : r1 < 0.7 ? 4.0 : r1 < 0.9 ? 3.0 : 5.0;
            else if (biome < 3.5) type = r1 < 0.4 ? 0.0 : r1 < 0.85 ? 6.0 : 3.0;
            else if (biome < 4.5) type = r1 < 0.35 ? 0.0 : r1 < 0.8 ? 5.0 : 7.0;
            else type = r1 < 0.45 ? 0.0 : r1 < 0.85 ? 3.0 : 2.0;
            H = 10.0 + r2 * 30.0;
            R = 3.0 + r3 * 5.0;
            if (type == 2.0) { H = 22.0 + r2 * 35.0; R = 2.0 + r3 * 3.0; }
            if (type == 3.0) { R = 7.0 + r3 * 6.0; H = R * 2.0; }
            if (type == 5.0) H = 10.0 + r2 * 18.0;
            if (type == 6.0) { H = 10.0 + r2 * 14.0; R = 4.0 + r3 * 4.0; }
            if (type == 7.0) H = 4.0 + r2 * 6.0;
        }
        float landmark(vec3 p, vec2 c) {
            vec2 ctr; float type, H, R, ang;
            cellInfo(c, ctr, type, H, R, ang);
            if (type < 0.5) return 1e3;
            float bound = length(p.xz - ctr) - R - 3.0;
            if (bound > 4.0) return bound;               // far from this landmark: cheap bound
            // Structures rise out of the ground as the camera approaches.
            float grow = clamp((150.0 - length(u_camPos.xz - ctr)) / 80.0, 0.1, 1.0);
            float pulse = 1.0 + u_bass * u_react * 0.25;
            float h = H * grow * pulse;
            vec3 q = p - vec3(ctr.x, groundH(ctr), ctr.y);
            q.xz = rot(ang) * q.xz;
            if (type == 1.0) {      // tower: three stacked, twisting blocks
                float d = 1e3;
                for (int i = 0; i < 3; i++) {
                    float fi = float(i);
                    vec3 sp = q - vec3(0.0, h * (fi + 0.5) / 3.0, 0.0);
                    sp.xz = rot(fi * 0.35) * sp.xz;
                    float w = R * (1.0 - fi * 0.25);
                    d = min(d, sdBox(sp, vec3(w, h / 6.0, w)));
                }
                return d;
            }
            if (type == 2.0) {      // spire
                float y = clamp(q.y / max(h, 0.01), 0.0, 1.0);
                return max(length(q.xz) - R * (1.0 - y) - 0.15, max(-q.y, q.y - h)) * 0.6;
            }
            if (type == 3.0) {      // standing ring gate
                float rr = R * grow;
                return length(vec2(length(vec2(q.x, q.y - rr)) - rr, q.z)) - 0.9;
            }
            if (type == 4.0) {      // ruins: four broken pillars
                float d = 1e3;
                for (int k = 0; k < 4; k++) {
                    float fk = float(k);
                    vec2 o = vec2(cos(fk * 1.5708), sin(fk * 1.5708)) * R;
                    float hk = h * (0.3 + 0.7 * h12(c + fk * 7.1 + u_seed));
                    d = min(d, sdBox(q - vec3(o.x, hk * 0.5, o.y), vec3(0.9, hk * 0.5, 0.9)));
                }
                return d;
            }
            if (type == 5.0) return sdBox(q - vec3(0.0, h * 0.5, 0.0), vec3(0.7, h * 0.5, R * 0.6)); // monolith
            if (type == 6.0) {      // floating orb on a thin stem
                float orb = length(q - vec3(0.0, h, 0.0)) - R * (0.6 + 0.4 * grow) * pulse;
                return min(orb, max(length(q.xz) - 0.35, max(-q.y, q.y - h)));
            }
            float d = sdBox(q - vec3(0.0, h * 0.4, 0.0), vec3(R * 0.6, h * 0.4, R * 0.5)); // rocks
            d = min(d, sdBox(q - vec3(R * 0.7, h * 0.25, R * 0.4), vec3(R * 0.4, h * 0.25, R * 0.45)));
            return min(d, sdBox(q - vec3(-R * 0.5, h * 0.2, -R * 0.6), vec3(R * 0.35, h * 0.2, R * 0.3)));
        }

        float map(vec3 p) {
            int w = int(u_world + 0.5);
            matId = 1.0;
            if (w == 1) { // Explore: generated terrain + landmarks (3x3 cells around p)
                float ground = (p.y - groundH(p.xz)) * 0.5;
                vec2 c = floor(p.xz / CELL);
                float d = 1e3;
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) d = min(d, landmark(p, c + vec2(float(i), float(j))));
                }
                if (ground < d) { matId = 0.0; return ground; }
                return d;
            }
            if (w == 2) { // City: blocks of buildings, avenues every third column
                vec2 id = floor(p.xz / 4.0);
                vec2 q = mod(p.xz, 4.0) - 2.0;
                float h = 1.0 + hash(id) * 7.0 + spec(hash(id + 3.1) * 64.0) * 6.0 * u_react;
                float b = mod(id.x, 3.0) < 0.5 ? 1e3 : sdBox(vec3(q.x, p.y - h * 0.5, q.y), vec3(1.5, h * 0.5, 1.5));
                if (p.y < b) { matId = 0.0; return p.y; }
                return b;
            }
            if (w == 3) { // Monoliths: slabs scattered over a plain
                vec2 id = floor(p.xz / 10.0);
                vec2 q = mod(p.xz, 10.0) - 5.0;
                float r = hash(id);
                float h = 3.0 + r * 8.0 + u_bass * 3.0 * u_react;
                vec3 s = vec3(q.x, p.y - h * 0.5, q.y);
                s.xz = rot(r * 6.28) * s.xz;
                float b = (r > 0.45 && abs(id.x) > 0.5) ? sdBox(s, vec3(0.5, h * 0.5, 1.8)) : 1e3;
                if (p.y < b) { matId = 0.0; return p.y; }
                return b;
            }
            if (w == 4) { // Temple: colonnade between floor and ceiling
                vec2 q = mod(p.xz, 4.0) - 2.0;
                float pillar = length(q) - (0.45 + u_bass * 0.15 * u_react);
                float roof = 8.0 - p.y;
                float d = min(pillar, roof);
                if (p.y < d) { matId = 0.0; return p.y; }
                return d;
            }
            if (w == 5) { // Cubes: floating spinning cubes in a 3D lattice
                vec3 id = floor(p / 5.0);
                vec3 q = mod(p, 5.0) - 2.5;
                float r = hash3(id);
                q.xy = rot(u_time * (r - 0.5) * 2.0) * q.xy;
                q.yz = rot(u_time * (r - 0.3)) * q.yz;
                float size = 0.6 + r * 0.6 + u_bass * 0.5 * u_react;
                return r > 0.35 ? sdBox(q, vec3(size)) : 2.0;
            }
            if (w == 6) { // Terrain: rolling noise landscape (not an exact SDF -> step scaled)
                float h = noise(p.xz * 0.12) * 6.0 + noise(p.xz * 0.37) * 1.8 + spec(floor(p.x * 0.3) + 8.0) * 3.0 * u_react;
                matId = 0.0;
                return (p.y - h) * 0.45;
            }
            if (w == 7) { // Rings: tunnel of rotating rings
                float id = floor(p.z / 6.0);
                vec3 q = vec3(p.x, p.y, mod(p.z, 6.0) - 3.0);
                q.xy = rot(id * 0.7 + u_time * 0.3) * q.xy;
                vec2 t = vec2(length(q.xy) - 4.0, q.z);
                float ring = max(length(t) - (0.35 + u_bass * 0.4 * u_react), -sdBox(q, vec3(0.6, 9.0, 1.0)));
                return ring;
            }
            // Lattice: spheres joined by bars
            vec3 q = mod(p, 4.0) - 2.0;
            float sphere = length(q) - (0.5 + u_bass * 0.45 * u_react);
            float bars = min(min(length(q.xy), length(q.yz)), length(q.xz)) - 0.07;
            return min(sphere, bars);
        }

        vec3 normalAt(vec3 p) {
            vec2 e = vec2(0.01, -0.01);
            return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
        }

        vec3 content(vec2 c) {
            vec2 uv = fract(c * u_texScale / u_screenAspect);
            return texture2D(u_content, u_contentFlip ? vec2(uv.x, 1.0 - uv.y) : uv).rgb;
        }

        void main() {
            vec2 p = (v_uv - 0.5) * u_screenAspect * vec2(1.0, -1.0);
            vec3 fw = normalize(u_camTarget - u_camPos);
            vec3 right = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
            vec3 up = cross(right, fw);
            vec2 pr = rot(u_camRoll) * p;
            vec3 rd = normalize(fw * u_fov + right * pr.x + up * pr.y);

            float t = 0.05;
            float hit = 0.0;
            float steps = 0.0;
            for (int i = 0; i < 120; i++) {
                float d = map(u_camPos + rd * t);
                if (d < 0.002 * t) { hit = 1.0; break; }
                t += d;
                steps += 1.0;
                if (t > u_maxDist) break;
            }
            if (hit < 0.5) {
                // Explore has a sky: sparse stars above the horizon.
                // Explore has a sky: a glow on the horizon and sparse stars.
                float star = 0.0, haze = 0.0;
                if (int(u_world + 0.5) == 1) {
                    haze = exp(-abs(rd.y) * 9.0) * (0.22 + u_bass * u_react * 0.15);
                    vec2 sky = rd.xz / (max(rd.y, 0.0) + 0.25) * 40.0;
                    star = step(0.985, h12(floor(sky) + u_seed)) * smoothstep(0.0, 0.25, rd.y) * 0.45;
                }
                gl_FragColor = vec4(vec3(star) * mix(u_colA, vec3(1.0), 0.5) + u_colB * haze, max(star, haze));
                return;
            }

            vec3 pos = u_camPos + rd * t;
            float mat = matId;
            vec3 n = normalAt(pos);
            vec3 light = normalize(vec3(0.45, 0.8, -0.35));
            float diff = max(dot(n, light), 0.0);
            float ao = 1.0 - steps / 120.0;
            // The live decks projected onto the surface from all three axes.
            vec3 w = abs(n);
            w /= (w.x + w.y + w.z);
            vec3 tex = content(pos.zy) * w.x + content(pos.xz) * w.y + content(pos.xy) * w.z;
            // Shape brightness (light, occlusion, material, fog) decides the glyph in
            // ASCII style; the content mostly decides the colors.
            float fogF = exp(-t * (0.015 + u_fog * 0.07) * u_fogScale);
            float shape = (0.12 + 0.88 * diff) * (0.35 + 0.65 * ao) * (mat < 0.5 ? 0.45 : 1.0) * fogF;
            if (u_fogScale < 0.99) { // Explore: dim ground with contour lines, structures stay readable
                float contour = smoothstep(0.82, 1.0, abs(fract(pos.y * 0.33) * 2.0 - 1.0));
                shape = mat < 0.5 ? max(shape - 0.25, 0.0) * 0.5 + contour * 0.45 * fogF : max(shape, 0.22 * fogF);
            }
            vec3 base = mix(u_colA, u_colB, clamp(pos.y * 0.08 + mat * 0.3, 0.0, 1.0));
            vec3 color = (base * (0.15 + 0.85 * diff) * (0.4 + 0.6 * ao) * (mat < 0.5 ? 0.45 : 0.8) * (1.0 - u_contentAmt * 0.55)
                + tex * u_contentAmt * 2.2) * fogF;
            float glow = dot(tex, vec3(0.333)) * u_contentAmt * fogF; // bright content lifts the glyph a little
            float lit = shape + glow * 0.6;
            if (u_fogScale < 0.99) { // far things melt into the horizon haze instead of black
                float hz = (1.0 - fogF) * 0.22;
                color += u_colB * hz;
                // open ground stays sparse: contours, a little content, mostly space
                lit = mat < 0.5 ? shape + max(glow - 0.25, 0.0) * 0.5 + hz * 0.3 : max(lit, hz);
            }
            gl_FragColor = vec4(color, clamp(lit, 0.0, 1.0));
        }`;

    const ASCII_FS = `
        precision mediump float;
        uniform sampler2D u_march;   // framebuffer (bottom-up)
        uniform sampler2D u_ramp;    // glyph ramp, one row
        uniform vec2 u_grid;
        uniform float u_rampN;
        uniform float u_style;       // 0 ascii, 1 blocks, 2 raw
        varying vec2 v_uv;

        void main() {
            if (u_style > 1.5) {
                gl_FragColor = vec4(texture2D(u_march, vec2(v_uv.x, 1.0 - v_uv.y)).rgb, 1.0);
                return;
            }
            vec2 cellPos = v_uv * u_grid;
            vec2 cell = floor(cellPos);
            vec4 m = texture2D(u_march, vec2((cell.x + 0.5) / u_grid.x, 1.0 - (cell.y + 0.5) / u_grid.y));
            if (u_style > 0.5) { gl_FragColor = vec4(m.rgb, 1.0); return; }
            float lum = clamp(pow(m.a, 0.85) * 1.25, 0.0, 1.0);
            float idx = floor(lum * (u_rampN - 1.0) + 0.5);
            if (idx < 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
            float a = texture2D(u_ramp, (vec2(idx, 0.0) + fract(cellPos)) / vec2(u_rampN, 1.0)).a;
            // Full-brightness hue of the cell (deck colors / content), glyph carries the shading.
            vec3 hue = m.rgb / max(max(m.r, max(m.g, m.b)), 0.001);
            gl_FragColor = vec4(hue * a * (0.55 + 0.45 * lum), 1.0);
        }`;


    // ---- Explore world, JS mirror of the shader's terrain and landmarks ----
    // Same math in float32 (Math.fround) so the camera knows where the ground and
    // the landmarks really are.
    const CELL = 36;
    const f = Math.fround;
    const fract = x => f(x - Math.floor(x));
    function h12(x, y) {
        let a = fract(f(x * 0.1031)), b = fract(f(y * 0.1031)), c = fract(f(x * 0.1031));
        const d = f(f(f(a * f(b + 33.33)) + f(b * f(c + 33.33))) + f(c * f(a + 33.33)));
        a = f(a + d); b = f(b + d); c = f(c + d);
        return fract(f(f(a + b) * c));
    }
    function vn(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        let fx = x - ix, fy = y - iy;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        const a = h12(ix, iy), b = h12(ix + 1, iy), c = h12(ix, iy + 1), d = h12(ix + 1, iy + 1);
        return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    }
    function groundH(x, z, seed) {
        const qx = x * 0.012 + seed, qy = z * 0.012 + seed;
        const h = (vn(qx, qy) + vn(qx * 2.1 + 5.2, qy * 2.1 + 5.2) * 0.5 + vn(qx * 4.3 + 1.7, qy * 4.3 + 1.7) * 0.25) / 1.75;
        const amp = 3 + 21 * vn(x * 0.002 + seed * 0.7 + 11, z * 0.002 + seed * 0.7 + 11);
        return (h - 0.35) * amp;
    }
    function cellInfo(cx, cy, seed) {
        const r1 = h12(cx + seed * 13.1, cy + seed * 13.1);
        const r2 = h12(cx * 1.7 + 3.3 + seed, cy * 1.7 + 3.3 + seed);
        const r3 = h12(cx * 2.3 + 7.7 + seed, cy * 2.3 + 7.7 + seed);
        const x = (cx + 0.5) * CELL + (r2 - 0.5) * CELL * 0.45;
        const z = (cy + 0.5) * CELL + (r3 - 0.5) * CELL * 0.45;
        const biome = Math.floor(vn(x * 0.004 + seed * 1.3 + 3, z * 0.004 + seed * 1.3 + 3) * 5.99);
        const T = [
            r1 < 0.25 ? 0 : r1 < 0.75 ? 1 : r1 < 0.9 ? 5 : 4,
            r1 < 0.3 ? 0 : r1 < 0.85 ? 2 : 7,
            r1 < 0.3 ? 0 : r1 < 0.7 ? 4 : r1 < 0.9 ? 3 : 5,
            r1 < 0.4 ? 0 : r1 < 0.85 ? 6 : 3,
            r1 < 0.35 ? 0 : r1 < 0.8 ? 5 : 7,
            r1 < 0.45 ? 0 : r1 < 0.85 ? 3 : 2
        ];
        const type = T[Math.min(5, biome)];
        let H = 10 + r2 * 30, R = 3 + r3 * 5;
        if (type === 2) { H = 22 + r2 * 35; R = 2 + r3 * 3; }
        if (type === 3) { R = 7 + r3 * 6; H = R * 2; }
        if (type === 5) H = 10 + r2 * 18;
        if (type === 6) { H = 10 + r2 * 14; R = 4 + r3 * 4; }
        if (type === 7) H = 4 + r2 * 6;
        return { cx, cy, x, z, type, H, R, y: groundH(x, z, seed) };
    }
    const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
    const damp = (cur, target, rate, sec) => cur + (target - cur) * (1 - Math.exp(-rate * sec));

    const DEFAULTS = {
        world: 0,        // index into WORLDS
        move: 0,         // index into MOVES
        style: 0,        // index into STYLES
        speed: 0.35,     // travel speed (pushed by the bass)
        altitude: 0.2,   // camera height
        detail: 0.5,     // grid resolution relative to the deck grid
        content: 0.55,   // how much the live decks show on the surfaces
        fog: 0.4,
        react: 0.6,      // how much audio moves the structures
        texScale: 0.35,  // size of the content projected on surfaces
        seed: 1          // Explore: which generated world
    };

    const world = {
        WORLDS, MOVES, STYLES,
        settings: { ...DEFAULTS },
        travel: 0,
        orbit: 0,
        roll: 0,
        cam: { pos: [0, 2, 0], target: [0, 2, 5] },

        get active() {
            return this.settings.world > 0 && !!(CLIFT.output && CLIFT.output.gl);
        },

        set(key, value) {
            this.settings[key] = value;
            CLIFT.events.emit('state');
        },

        step(key, list, dir = 1) {
            this.set(key, CLIFT.util.wrap(this.settings[key] + dir, list.length));
        },

        // New flight: jump somewhere else along the path (Explore: elsewhere in the world).
        cut() {
            this.travel += 30 + Math.random() * 200;
            this.orbit = Math.random() * Math.PI * 2;
            if (this.ex) {
                const a = Math.random() * Math.PI * 2, d = 250 + Math.random() * 600;
                const home = Math.hypot(this.ex.x, this.ex.z) > 2000;
                this.ex.x = home ? 0 : this.ex.x + Math.cos(a) * d;
                this.ex.z = home ? 0 : this.ex.z + Math.sin(a) * d;
                this.ex.heading = Math.random() * Math.PI * 2;
                this.ex.target = null;
                this.ex.snap = true;
            }
        },

        // Explore: a brand-new generated world.
        newWorld() {
            this.settings.seed = Math.round(Math.random() * 9000) / 100 + 1;
            this.ex = null;
            CLIFT.events.emit('state');
        },

        // ---- Explore camera ----------------------------------------------------
        // Flies from landmark to landmark: picks one it hasn't seen yet, travels there
        // with inertia and banking (keeping above ground and anything in the way),
        // circles it for a while, then moves on.

        exploreTarget(ex) {
            const seed = this.settings.seed;
            const ccx = Math.floor(ex.x / CELL), ccy = Math.floor(ex.z / CELL);
            const far = Math.hypot(ex.x, ex.z) > 1200;
            let best = null, bestScore = -Infinity;
            for (let j = -5; j <= 5; j++) {
                for (let i = -5; i <= 5; i++) {
                    const ring = Math.max(Math.abs(i), Math.abs(j));
                    if (ring < 2) continue;
                    const c = cellInfo(ccx + i, ccy + j, seed);
                    if (!c.type || ex.visited.has(`${c.cx},${c.cy}`)) continue;
                    const dir = Math.atan2(c.z - ex.z, c.x - ex.x);
                    let score = Math.cos(angDiff(ex.heading, dir)) * 1.5 + Math.random() * 1.2 + c.H / 60;
                    if (far) score += Math.cos(angDiff(Math.atan2(-ex.z, -ex.x), dir)) * 2;
                    if (score > bestScore) { bestScore = score; best = c; }
                }
            }
            return best;
        },

        // Highest thing (ground or landmark) near a point, for clearance.
        exploreObstacle(x, z) {
            const seed = this.settings.seed;
            let top = groundH(x, z, seed);
            const ccx = Math.floor(x / CELL), ccy = Math.floor(z / CELL);
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const c = cellInfo(ccx + i, ccy + j, seed);
                    if (c.type && Math.hypot(x - c.x, z - c.z) < c.R + 8) top = Math.max(top, c.y + c.H * 1.3 + (c.type === 3 ? c.R : 0));
                }
            }
            return top;
        },

        updateExplore(sec, bass) {
            const s = this.settings, m = MOVES[s.move];
            let ex = this.ex;
            if (!ex || ex.seed !== s.seed) {
                ex = this.ex = { seed: s.seed, x: 0, z: 0, heading: Math.random() * Math.PI * 2, turn: 0,
                    mode: 'travel', target: null, timer: 0, angle: 0, visited: new Set(), snap: true,
                    pos: [0, 0, 0], look: [0, 0, 0], roll: 0 };
            }
            if (!ex.target) { ex.target = this.exploreTarget(ex); ex.mode = 'travel'; }
            const t = ex.target;
            const speed = (4 + s.speed * 26) * (1 + bass * 0.6 * s.react);
            const clearance = m === 'Crane' ? 22 + s.altitude * 30 : m === 'Drift' ? 2.5 + s.altitude * 4 : 5 + s.altitude * 14;
            let pos, look, roll = 0;

            if (!t) { // nothing around (shouldn't happen): just cruise
                ex.x += Math.cos(ex.heading) * speed * sec;
                ex.z += Math.sin(ex.heading) * speed * sec;
                const y = this.exploreObstacle(ex.x, ex.z) + clearance;
                pos = [ex.x, y, ex.z];
                look = [ex.x + Math.cos(ex.heading) * 10, y - 2, ex.z + Math.sin(ex.heading) * 10];
            } else if (ex.mode === 'travel') {
                const dist = Math.hypot(t.x - ex.x, t.z - ex.z);
                const want = Math.atan2(t.z - ex.z, t.x - ex.x);
                const turn = CLIFT.util.clamp(angDiff(ex.heading, want) * 1.5, -0.9, 0.9);
                ex.turn = damp(ex.turn, turn, 2, sec);
                ex.heading += ex.turn * sec;
                ex.x += Math.cos(ex.heading) * speed * sec;
                ex.z += Math.sin(ex.heading) * speed * sec;
                // Clear the ground and whatever stands here or just ahead.
                const ax = ex.x + Math.cos(ex.heading) * 14, az = ex.z + Math.sin(ex.heading) * 14;
                const y = Math.max(this.exploreObstacle(ex.x, ex.z), this.exploreObstacle(ax, az) - 2) + clearance;
                pos = [ex.x, y, ex.z];
                // Look ahead, turning towards the landmark as it gets close.
                const near = CLIFT.util.clamp(1 - (dist - 20) / 60, 0, 1);
                const fx = ex.x + Math.cos(ex.heading) * 30, fz = ex.z + Math.sin(ex.heading) * 30;
                const fy = y - 2 - clearance * 0.15;
                look = [fx + (t.x - fx) * near, fy + (t.y + t.H * 0.5 - fy) * near, fz + (t.z - fz) * near];
                roll = -ex.turn * 0.45 + (m === 'Drift' ? Math.sin(this.time * 0.6) * 0.15 : 0);
                if (dist < t.R + 16 + clearance * 0.3) {
                    ex.mode = 'orbit';
                    ex.angle = Math.atan2(ex.z - t.z, ex.x - t.x);
                    ex.dir = ex.turn >= 0 ? 1 : -1;
                    ex.timer = (m === 'Orbit' ? 14 : 5) + Math.random() * (m === 'Orbit' ? 10 : 6);
                }
            } else { // orbit the landmark, rising slowly along it
                ex.timer -= sec;
                const r = t.R + 14 + s.altitude * 10;
                ex.angle += ex.dir * sec * speed / r * 0.6;
                ex.x = t.x + Math.cos(ex.angle) * r;
                ex.z = t.z + Math.sin(ex.angle) * r;
                const rise = (Math.sin(this.time * 0.2) * 0.5 + 0.5) * t.H * 0.8;
                const y = Math.max(groundH(ex.x, ex.z, s.seed) + clearance * 0.6, t.y + 3 + rise + (m === 'Crane' ? 20 : 0));
                pos = [ex.x, y, ex.z];
                look = [t.x, t.y + t.H * 0.45, t.z];
                ex.heading = ex.angle + ex.dir * Math.PI / 2;
                ex.turn = ex.dir * speed / r * 0.6;
                roll = -ex.dir * 0.12;
                if (ex.timer <= 0) {
                    ex.visited.add(`${t.cx},${t.cy}`);
                    if (ex.visited.size > 400) ex.visited.clear();
                    ex.target = null;
                }
            }
            // Smooth everything, so switching between travel and orbit is a glide.
            if (ex.snap) {
                ex.pos = pos.slice(); ex.look = look.slice(); ex.roll = roll; ex.snap = false;
            } else {
                for (let i = 0; i < 3; i++) {
                    ex.pos[i] = damp(ex.pos[i], pos[i], i === 1 ? 2.5 : 4, sec);
                    ex.look[i] = damp(ex.look[i], look[i], 2.2, sec);
                }
                // Never sink into the ground while smoothing.
                ex.pos[1] = Math.max(ex.pos[1], groundH(ex.pos[0], ex.pos[2], s.seed) + 1.2);
                ex.roll = damp(ex.roll, roll, 2, sec);
            }
            this.cam = { pos: ex.pos.slice(), target: ex.look.slice() };
            this.roll = ex.roll;
        },

        update(dt, audio) {
            if (!this.settings.world) return;
            const s = this.settings;
            const sec = dt / 1000;
            const bass = audio ? audio.bands.bass : 0;
            this.bass = bass;
            this.travel += sec * (0.6 + s.speed * 9) * (1 + bass * 0.8 * s.react);
            this.orbit += sec * (0.1 + s.speed * 0.6);
            this.time = (this.time || 0) + sec;
            if (WORLDS[s.world] === 'Explore') this.updateExplore(Math.min(sec, 0.1), bass);
            else this.computeCamera();
        },

        // Camera position / look-at per world and move. Paths keep to open space:
        // avenues in the city, lanes between pillars, the axis of the rings...
        computeCamera() {
            const s = this.settings, w = WORLDS[s.world], m = MOVES[s.move];
            const z = this.travel, a = this.orbit, alt = s.altitude;
            let lane = 0, baseY = 1.5 + alt * 6;
            if (w === 'City') { lane = 2; baseY = 1.2 + alt * 14; }
            if (w === 'Temple') { lane = 0; baseY = 1.2 + alt * 5; }
            if (w === 'Monoliths') { lane = 5; baseY = 1.2 + alt * 9; }
            if (w === 'Terrain') { lane = 0; baseY = 7 + alt * 12; }
            if (w === 'Rings' || w === 'Cubes') { lane = 0; baseY = alt * 2; }
            if (w === 'Lattice') { lane = 0; baseY = 0; }

            let pos, target, roll = 0;
            if (m === 'Orbit') {
                const c = [lane, baseY, z * 0.15];
                const r = 6 + alt * 10;
                pos = [c[0] + Math.cos(a) * r, c[1] + 2 + alt * 4, c[2] + Math.sin(a) * r];
                target = c;
            } else if (m === 'Crane') {
                const y = baseY + (Math.sin(this.time * 0.25) * 0.5 + 0.5) * (4 + alt * 10);
                pos = [lane, y, z * 0.4];
                target = [lane + Math.sin(this.time * 0.1) * 3, baseY * 0.5, z * 0.4 + 8];
            } else if (m === 'Drift') {
                pos = [lane + Math.sin(z * 0.05) * 1.2, baseY + Math.sin(z * 0.07) * 0.6, z * 0.5];
                target = [pos[0] + Math.sin(z * 0.03) * 4, pos[1] - 0.3, pos[2] + 6];
                roll = Math.sin(z * 0.04) * 0.35;
            } else { // Fly
                pos = [lane + Math.sin(z * 0.06) * 0.6, baseY, z];
                target = [lane + Math.sin(z * 0.06 + 0.6) * 1.5, baseY - 0.4 - alt * 1.5, z + 7];
            }
            this.cam = { pos, target };
            this.roll = roll;
        },

        // ---- GL ---------------------------------------------------------------

        setupGL(out) {
            const gl = out.gl;
            const compile = (type, src) => {
                const sh = gl.createShader(type);
                gl.shaderSource(sh, src);
                gl.compileShader(sh);
                if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                    CLIFT.error('world shader compile failed:', gl.getShaderInfoLog(sh));
                    return null;
                }
                return sh;
            };
            const program = (fs) => {
                const v = compile(gl.VERTEX_SHADER, QUAD_VS), f = compile(gl.FRAGMENT_SHADER, fs);
                if (!v || !f) return null;
                const p = gl.createProgram();
                gl.attachShader(p, v);
                gl.attachShader(p, f);
                gl.bindAttribLocation(p, 0, 'a_position');
                gl.linkProgram(p);
                if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                    CLIFT.error('world shader link failed:', gl.getProgramInfoLog(p));
                    return null;
                }
                const u = {};
                const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < n; i++) {
                    const name = gl.getActiveUniform(p, i).name;
                    u[name] = gl.getUniformLocation(p, name);
                }
                return { program: p, u };
            };
            this.march = program(MARCH_FS);
            this.ascii = program(ASCII_FS);
            const texture = (filter) => {
                const t = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, t);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
                return t;
            };
            this.tex = { spectrum: texture(gl.NEAREST), ramp: texture(gl.LINEAR) };
            this.targets = {
                march: { tex: texture(gl.NEAREST), fb: gl.createFramebuffer(), key: '' },
                out: { tex: texture(gl.LINEAR), fb: gl.createFramebuffer(), key: '' }
            };
            this.rampCanvas = document.createElement('canvas');
            this.ready = !!(this.march && this.ascii);
            return this.ready;
        },

        bindSized(gl, t, w, h, filter) {
            const key = `${w}x${h}@${filter}`;
            if (t.key !== key) {
                t.key = key;
                // Scratch unit, so (re)allocating never leaves the target bound where a
                // sampler reads (that would be a framebuffer feedback loop).
                gl.activeTexture(gl.TEXTURE7);
                gl.bindTexture(gl.TEXTURE_2D, t.tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
            }
            gl.viewport(0, 0, w, h);
        },

        // Glyph ramp texture, sized to the on-screen cell (capped like the main atlas).
        ensureRamp(gl, cellW, cellH) {
            const scale = Math.min(1, 96 / cellH);
            const w = Math.max(2, Math.ceil(cellW * scale)), h = Math.max(2, Math.ceil(cellH * scale));
            const key = `${w}x${h}`;
            if (this.rampKey === key) return;
            this.rampKey = key;
            const c = this.rampCanvas;
            c.width = w * RAMP.length;
            c.height = h;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${Math.max(4, Math.min(h * 0.92, w / 0.6))}px "Courier New", Courier, monospace`;
            for (let i = 0; i < RAMP.length; i++) ctx.fillText(RAMP[i], (i + 0.5) * w, h / 2);
            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.ramp);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
        },

        // Render the world from the content texture; returns the full-size result.
        render(out, contentTex, contentFlip) {
            const gl = out.gl;
            if (!this.ready && !this.setupGL(out)) return null;
            const s = this.settings;
            const engine = CLIFT.engine;
            const W = out.canvas.width, H = out.canvas.height;

            // Grid: the deck grid scaled by Detail (Raw renders finer and smooths).
            const factor = s.style === 2 ? 2.5 + s.detail * 3 : 0.6 + s.detail * 1.2;
            const cols = Math.max(16, Math.round(engine.width * factor));
            const rows = Math.max(8, Math.round(engine.height * factor));

            // Spectrum for audio-reactive structures.
            const spec = engine.audioFrame ? engine.audioFrame.spectrum : new Float32Array(64);
            const bytes = this.specBytes || (this.specBytes = new Uint8Array(64));
            for (let i = 0; i < 64; i++) bytes[i] = Math.min(255, spec[i] * 255);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.spectrum);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 64, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);

            // Pass 1: march one ray per cell.
            this.bindSized(gl, this.targets.march, cols, rows, s.style === 2 ? gl.LINEAR : gl.NEAREST);
            const { program, u } = this.march;
            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, contentTex);
            gl.uniform1i(u.u_content, 0);
            gl.uniform1i(u.u_contentFlip, contentFlip ? 1 : 0);
            gl.uniform1i(u.u_spectrum, 2);
            gl.uniform1f(u.u_world, s.world);
            gl.uniform2f(u.u_screenAspect, W / H, 1);
            gl.uniform3fv(u.u_camPos, this.cam.pos);
            gl.uniform3fv(u.u_camTarget, this.cam.target);
            gl.uniform1f(u.u_camRoll, this.roll);
            gl.uniform1f(u.u_fov, 1.3);
            gl.uniform1f(u.u_time, this.time || 0);
            gl.uniform1f(u.u_bass, this.bass || 0);
            gl.uniform1f(u.u_react, s.react);
            gl.uniform1f(u.u_contentAmt, s.content);
            gl.uniform1f(u.u_fog, s.fog);
            gl.uniform1f(u.u_texScale, s.texScale);
            gl.uniform1f(u.u_seed, s.seed);
            gl.uniform1f(u.u_maxDist, s.world === 1 ? 260 : 70);
            gl.uniform1f(u.u_fogScale, s.world === 1 ? 0.3 : 1);
            const deck = engine.decks[engine.crossfader < 0.5 ? 0 : 1];
            gl.uniform3fv(u.u_colA, CLIFT.palette.rgb(deck.primaryColor).map(v => v / 255));
            gl.uniform3fv(u.u_colB, CLIFT.palette.rgb(deck.secondaryColor).map(v => v / 255));
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Pass 2: glyphs / blocks / smooth at full size.
            this.ensureRamp(gl, W / cols, H / rows);
            this.bindSized(gl, this.targets.out, W, H, gl.LINEAR);
            const a = this.ascii;
            gl.useProgram(a.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.targets.march.tex);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.tex.ramp);
            gl.uniform1i(a.u.u_march, 0);
            gl.uniform1i(a.u.u_ramp, 1);
            gl.uniform2f(a.u.u_grid, cols, rows);
            gl.uniform1f(a.u.u_rampN, RAMP.length);
            gl.uniform1f(a.u.u_style, s.style);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            return this.targets.out.tex;
        },

        getState() {
            return { ...this.settings, v: 2 };
        },

        setState(state) {
            if (!state) return;
            // v1 states had no Explore world: their world indexes are one lower.
            if (!state.v && state.world > 0) state = { ...state, world: state.world + 1 };
            for (const k of Object.keys(DEFAULTS)) if (typeof state[k] === 'number') this.settings[k] = state[k];
            this.settings.world = CLIFT.util.clamp(this.settings.world | 0, 0, WORLDS.length - 1);
            this.settings.move = CLIFT.util.clamp(this.settings.move | 0, 0, MOVES.length - 1);
            this.settings.style = CLIFT.util.clamp(this.settings.style | 0, 0, STYLES.length - 1);
            CLIFT.events.emit('state');
        }
    };

    CLIFT.world = world;
})();
