// Full Auto: the Director.
//
// Follows the music instead of rolling dice on a timer:
//  - tracks loudness against the track's own recent average to find sections:
//      break (breakdown) · groove · build · peak, and catches drops
//  - changes things on phrase boundaries (8-64 beats, bar aligned)
//  - picks scenes whose energy (catalog meta) matches the section, never
//    repeating recent ones, and cues them on the off-air deck
//  - chooses the transition, visual FX look, colors and effects per section:
//    long dissolves in breakdowns, quick wipes in builds, hard cuts at peaks
//  - on a drop: instant cut to a high-energy scene with explosion / shockwave /
//    glitch / strobe, and the text overlay if there is a message
//  - frames it all with a 3D camera (macro close-ups, floors, tunnels, corridors,
//    globes, swinging screens) chosen per section, accelerating into drops
//  - every choice goes through CLIFT.variety, which remembers what was used
//    recently and rotates through everything instead of repeating favorites
//  - uses everything else too: deck speed, scene params, color modes, invert,
//    CRT post-FX, render modes, grid size, tiles / split / glitch hits, the text
//    overlay and your saved snapshots. Each can be excluded in the options.
// Intensity (calm .. wild) scales how much FX and how many hits it uses.
// Left to the performer: BPM, audio input / gain, recording, projector, MIDI.

(function () {
    const { pick, clamp } = CLIFT.util;

    // Per section: energy target, lit-screen coverage (before the Fill slider),
    // transition lengths, and weighted menus the variety picker draws from.
    // Looks here are 2D ones; camera shots are chosen separately (cams).
    const SECTIONS = {
        break: { target: 0.2, coverage: 0.1, transition: [16, 8], mix: [[1, 2], [6, 2], [8, 3]],
            looks: [['clean', 3], ['trails', 2], ['liquid', 2], ['melt', 1], ['mirror', 1]],
            cams: [['Flat', 2], ['Macro', 3], ['Globe', 2], ['Screen', 2], ['Floor', 1]],
            masks: ['Circle', 'Ring', 'Band ═', 'Spotlight', 'Lower third', 'Frame', 'Scanner'] },
        groove: { target: 0.5, coverage: 0.25, transition: [8, 4], mix: [[0, 1], [2, 1], [3, 1], [4, 1], [1, 1], [8, 3]],
            looks: [['clean', 3], ['trails', 2], ['mirror', 2], ['panels', 2], ['slicer', 2], ['tiles', 1], ['liquid', 1], ['vortex', 1]],
            cams: [['Flat', 3], ['Floor', 2], ['Screen', 2], ['Macro', 2], ['Globe', 1], ['Corridor', 1]],
            masks: ['Band ═', 'Band ║', 'Box', 'Left', 'Right', 'Scanner', 'Stripes', 'Blocks', 'Diagonal', 'Spotlight'] },
        build: { target: 0.65, coverage: 0.4, transition: [4, 2], mix: [[5, 2], [6, 2], [8, 2], [3, 1]],
            looks: [['vortex', 2], ['slicer', 2], ['glitch', 2], ['liquid', 1], ['melt', 1], ['panels', 1]],
            cams: [['Tunnel', 3], ['Corridor', 3], ['Floor', 2], ['Macro', 1], ['Flat', 1]],
            masks: ['Scanner', 'Blocks', 'Ring', 'Box', 'Band ═'] },
        peak: { target: 0.85, coverage: 0.6, transition: [1, 0], mix: [[7, 2], [2, 1], [8, 2], [5, 1]],
            looks: [['storm', 2], ['panels', 2], ['glitch', 2], ['datamosh', 2], ['acid', 1], ['mosaic', 1], ['tiles', 1], ['shatter', 0.4]],
            cams: [['Flat', 2], ['Tunnel', 2], ['Corridor', 2], ['Macro', 2], ['Globe', 1], ['Screen', 1], ['Floor', 1]],
            masks: ['Blocks', 'Circle', 'Frame', 'Full'] }
    };

    // What happens on a drop (one of these, rotated by the variety picker).
    // The Voronoi explosion is deliberately the rarest.
    const IMPACTS = [
        ['slam', 3, ['slam', 'strobe', 'burst']],
        ['glitchStorm', 3, ['glitch', 'split', 'strobe']],
        ['splitBurst', 2, ['split', 'punch', 'invert']],
        ['strobeInvert', 2, ['strobe', 'invert', 'punch']],
        ['shockwave', 2, ['shock', 'punch', 'burst']],
        ['explode', 1, ['explode', 'shock', 'strobe']]
    ];

    // Color pairs that work together, with a "temperature" (0 cool .. 1 hot).
    const PALETTES = [
        [2, 6, 0.3], [6, 3, 0.1], [3, 7, 0.05], [7, 6, 0.2], [2, 4, 0.5], [6, 5, 0.6],
        [5, 3, 0.55], [4, 1, 0.85], [1, 5, 0.95], [5, 4, 0.8], [1, 7, 0.9], [9, 6, 0.7], [8, 4, 1.0]
    ];

    const RECENT = 16;

    // Hits per section: [kind, weight]. Peaks use everything.
    const HITS = {
        break: [['hueJump', 3], ['burst', 3], ['shock', 1], ['camCut', 2]],
        groove: [['punch', 4], ['hueJump', 3], ['split', 3], ['glitch', 2], ['burst', 2], ['grid', 1], ['invert', 1], ['shock', 1], ['camCut', 2], ['slam', 1]],
        build: [['glitch', 4], ['punch', 3], ['split', 3], ['shock', 2], ['strobe', 1], ['slam', 2], ['camCut', 1]],
        peak: [['shock', 3], ['glitch', 3], ['punch', 3], ['strobe', 2], ['invert', 2], ['split', 3], ['burst', 2], ['grid', 1], ['hueJump', 2],
            ['slam', 3], ['camCut', 2], ['explode', 0.6]]
    };
    // Chance of a hit on the downbeat / on other beats, before intensity.
    const HIT_RATE = {
        break: [0.25, 0],
        groove: [0.6, 0.12],
        build: [0.75, 0.3],
        peak: [0.95, 0.45]
    };

    // FX parameters the Director keeps moving, with the range it may use.
    const MOTION = {
        feedback: [0, 0.92], fbZoom: [-0.04, 0.07], fbRotate: [-0.6, 0.6], fbHue: [0, 0.6],
        glitch: [0, 0.6], shatter: [0, 0.35], displace: [0, 0.6], liquid: [0, 0.7], sliceAmount: [0.1, 0.8],
        bassZoom: [0, 0.8], spin: [-0.3, 0.3], wave: [0, 0.5], hueSpeed: [0, 0.5], pixelate: [0, 0.4],
        camZoom: [0, 1], camTilt: [-0.8, 0.8], camSpin: [-0.8, 0.8], camFog: [0.1, 0.8], camSpeed: [0.05, 0.95]
    };
    // Effects that may fade in on their own (not shatter: it reads as a honeycomb;
    // not the camera: shots are chosen deliberately).
    const EXTRA_KEYS = ['feedback', 'fbZoom', 'fbRotate', 'fbHue', 'glitch', 'displace', 'liquid', 'sliceAmount',
        'bassZoom', 'spin', 'wave', 'hueSpeed', 'pixelate'];
    const CAMERA_KEYS = ['cam', 'camZoom', 'camTilt', 'camSpin', 'camSpeed', 'camFog'];

    const director = {
        enabled: false,
        intensity: 0.6,
        phrase: 16,
        phrases: [8, 16, 32, 64],
        options: {
            scenes: true,
            crossfade: true,
            looks: true,
            hits: true,
            colors: true,
            colorModes: true,
            invert: true,
            effects: true,
            postfx: true,
            renderModes: true,
            resolution: true,
            speed: true,
            params: true,
            text: true,
            snapshots: true,
            space: true,
            camera: true,
            world: true,
            favoritesOnly: false
        },
        fill: 0.4,          // 0 = sparse .. 1 = full screen; scales the coverage targets
        optionLabels: {
            scenes: 'Scenes',
            crossfade: 'Transitions',
            looks: 'Visual FX looks',
            hits: 'Beat hits',
            colors: 'Colors',
            colorModes: 'Color modes',
            invert: 'FG/BG invert',
            effects: 'ASCII effects',
            postfx: 'CRT post-FX',
            renderModes: 'Render modes',
            resolution: 'Grid size',
            speed: 'Deck speed',
            params: 'Scene params',
            text: 'Text overlay',
            snapshots: 'My snapshots',
            space: 'Negative space',
            camera: '3D camera',
            world: '3D world',
            favoritesOnly: 'Favorites only'
        },
        textUntil: 0,       // beat at which the Director hides the text it showed

        section: 'groove',
        fast: 0,
        slow: 0,
        fastBass: 0,
        slowBass: 0,
        bassHistory: [],  // bass peak of each of the last 8 beats
        beatPeak: 0,
        peakAvg: 0.5,     // running average of per-beat bass peaks (kick level)
        candidate: 'groove',
        candidateBeats: 0,
        risingBeats: 0,
        ref: 0.3,
        history: [],
        recent: [],
        lastDrop: -Infinity,

        init(engine) {
            this.engine = engine;
            CLIFT.events.on('clock-beat', (count) => {
                if (this.enabled) this.onBeat(count);
            });
            CLIFT.events.on('beat', (strength) => {
                if (this.enabled && this.options.hits && this.section === 'peak' && strength > 0.6 && Math.random() < this.intensity * 0.5) {
                    CLIFT.fx.hit('punch', strength);
                }
            });
        },

        toggle(force) {
            this.enabled = force === undefined ? !this.enabled : !!force;
            CLIFT.events.emit('state');
            return this.enabled;
        },

        // ---- music tracking (every frame) ---------------------------------------

        // Glide FX parameters toward the targets picked each bar (sliders move).
        animateFx(dt) {
            const settings = CLIFT.fx.settings;
            const k = 1 - Math.exp(-dt / 700);
            for (const [key, target] of Object.entries(this.fxTargets)) {
                settings[key] += (target - settings[key]) * k;
            }
        },

        // How much of the screen should be lit right now.
        get coverageTarget() {
            return clamp(SECTIONS[this.section].coverage * (0.4 + this.fill * 1.4), 0.04, 0.95);
        },

        // Closed loop on density (fine control): scale both decks' density by the
        // ratio target / measured coverage. Density can only remove glyphs, so the
        // target is a ceiling: sparse scenes simply run at full density.
        steerSpace(dt) {
            const e = this.engine;
            if (e.coverage === undefined) return;
            const ratio = this.coverageTarget / Math.max(e.coverage, 0.01);
            const factor = Math.pow(clamp(ratio, 0.25, 4), dt / 1000 * 3);
            for (const deck of e.decks) deck.density = clamp(deck.density * factor, 0.04, 1);
        },

        // Coarse control, once per bar: masks come off when the screen is far too
        // empty and go on when it is far too full.
        steerMasks() {
            const e = this.engine;
            const cov = e.coverage || 0, target = this.coverageTarget;
            const onAir = e.decks[1 - e.offAirDeck];
            if (cov < target * 0.5 && onAir.mask) {
                onAir.mask = 0;
            } else if (cov > target * 1.5 && !onAir.mask && Math.random() < 0.5) {
                this.chooseMask(1 - e.offAirDeck, true);
            }
        },

        update(dt, audio) {
            if (this.enabled && this.options.space) this.steerSpace(dt);
            if (this.enabled && this.options.looks && this.fxTargets) this.animateFx(dt);
            const raw = audio.raw || { volume: audio.volume, bass: audio.bands.bass };
            const level = raw.volume * 0.6 + raw.bass * 0.4;
            const k = (tau) => 1 - Math.exp(-dt / tau);
            this.fast += (level - this.fast) * k(400);
            this.slow += (level - this.slow) * k(8000);
            this.fastBass += (raw.bass - this.fastBass) * k(250);
            this.slowBass += (raw.bass - this.slowBass) * k(6000);
            this.beatPeak = Math.max(this.beatPeak, raw.bass);

            // Drop = the kick coming back after at least 3 beats without it (breakdown,
            // build-up). Checked every frame so the cut lands on the kick. Deliberately
            // independent of the section label, which can flip to "peak" on a loud riser.
            if (this.enabled && this.kickAbsent() && raw.bass > this.peakAvg * 0.8) this.drop();
            // Reference loudness: follows peaks quickly, forgets them over ~30s.
            this.ref = Math.max(this.fast, this.ref - (this.ref - this.slow) * k(30000), 0.02);
        },

        classify() {
            const ratio = this.fast / Math.max(this.slow, 0.02);
            const hist = this.history;
            hist.push(this.fast);
            if (hist.length > 8) hist.shift();
            const rising = hist.length >= 8 && hist[7] > hist[0] * 1.12 && hist[7] > hist[4];
            this.risingBeats = rising ? this.risingBeats + 1 : 0;
            const build = (this.engine.audioFrame.hyperReactive || {}).buildupIntensity || 0;
            const bassHist = this.bassHistory;
            bassHist.push(this.beatPeak);
            if (bassHist.length > 8) bassHist.shift();
            const kickGone = bassHist.length >= 2 && Math.max(...bassHist.slice(-2)) < this.peakAvg * 0.5;

            // Fallback for low frame rates, where update() can miss the first kick:
            // the kick is clearly back this beat after 3 beats without -> drop, one beat late.
            if (this.beatPeak > this.peakAvg * 0.8 && this.kickAbsent(1)) this.drop();
            // Kick reference level: learn only from beats that look like kicks, otherwise
            // drift down very slowly (so quieter tracks still adapt, but a breakdown or a
            // riser doesn't drag the reference down and hide the drop).
            if (this.beatPeak > this.peakAvg * 0.7) this.peakAvg += (this.beatPeak - this.peakAvg) * 0.15;
            else this.peakAvg = Math.max(0.05, this.peakAvg * 0.995);
            this.beatPeak = 0;

            let next;
            if (ratio < 0.75 || kickGone) next = 'break';
            else if (this.fast > this.ref * 0.9) next = 'peak';
            else if (this.risingBeats >= 2 || build > 0.4) next = 'build';
            else next = 'groove';

            // Hysteresis: a new section has to hold for two beats.
            if (next === this.candidate) this.candidateBeats++;
            else { this.candidate = next; this.candidateBeats = 1; }
            const prev = this.section;
            if (next !== prev && this.candidateBeats >= 2) this.section = next;
            return { entered: this.section !== prev ? this.section : null };
        },

        // True when the last 3 beats (ignoring the newest `skip`) had no kick.
        kickAbsent(skip = 0) {
            const h = this.bassHistory;
            if (h.length < 3 + skip) return false;
            const window = h.slice(h.length - 3 - skip, h.length - skip);
            return Math.max(...window) < this.peakAvg * 0.55;
        },

        drop() {
            const count = this.engine.clock.count;
            if (count - this.lastDrop <= 16) return;
            this.lastDrop = count;
            this.dropMoment();
        },

        get energyTarget() {
            return clamp(SECTIONS[this.section].target + (this.intensity - 0.5) * 0.3, 0, 1);
        },

        // ---- decisions (every beat) ------------------------------------------------

        onBeat(count) {
            const { entered } = this.classify();
            const o = this.options;
            const e = this.engine;
            if (this.textUntil && count >= this.textUntil) {
                this.textUntil = 0;
                CLIFT.textOverlay.toggle(false);
            }
            if (this.section === 'peak' && count - this.lastDrop < 2) return; // just dropped

            if (count % this.phrase === 0) {
                this.phraseChange();
                return;
            }

            // A breakdown starting mid-phrase: calm things down now, not at the next phrase.
            if (entered === 'break' && this.phrase - (count % this.phrase) > 4) {
                this.enterBreak();
                return;
            }

            if (count % 4 === 0) this.barChange(count);
            this.maybeHit(count);
        },

        // Hits: likely on downbeats, sometimes on other beats; build-ups get busier
        // toward the end of the phrase.
        maybeHit(count) {
            if (!this.options.hits) return;
            const [down, other] = HIT_RATE[this.section];
            const toEnd = 1 - (this.phrase - (count % this.phrase)) / this.phrase;
            let chance = (count % 4 === 0 ? down : other) * (0.35 + this.intensity * 0.8);
            if (this.section === 'build') chance += toEnd * 0.5 * this.intensity;
            if (Math.random() >= chance) return;
            this.hit(CLIFT.variety.pick('hits', HITS[this.section]), 0.6 + this.intensity * 0.4);
        },

        // Camera hits need a 3D shot; on a flat image they become their 2D cousins.
        // In the 3D world a camera cut jumps somewhere else in the world.
        hit(kind, strength = 1) {
            if (kind === 'camCut' && CLIFT.world.settings.world) { CLIFT.world.cut(); return; }
            const flat = !CLIFT.fx.settings.cam;
            if (flat && kind === 'slam') kind = 'punch';
            if (flat && kind === 'camCut') kind = 'hueJump';
            CLIFT.fx.hit(kind, strength);
        },

        // Every bar: new FX motion targets, small color / split / tint changes.
        barChange(count) {
            const o = this.options;
            const e = this.engine;
            const energy = { break: 0.3, groove: 0.55, build: 0.75, peak: 1 }[this.section] * (0.4 + this.intensity * 0.8);
            if (o.looks) this.newFxTargets(energy);
            if (o.colors && Math.random() < 0.25 + energy * 0.35) {
                const onAir = 1 - e.offAirDeck;
                const r = Math.random();
                if (r < 0.4) e.stepGradient(1, onAir);
                else if (r < 0.75) e.stepDeckColor(Math.random() < 0.5 ? 'primary' : 'secondary', 1 + CLIFT.util.randInt(3), onAir);
                else this.applyPalette(onAir);
            }
            if (o.space) this.steerMasks();
            const sparse = o.space && this.coverageTarget < 0.35;
            if (o.looks && !sparse && CLIFT.fx.settings.split === 0 && Math.random() < energy * 0.15) {
                CLIFT.fx.settings.split = 1 + CLIFT.util.randInt(3); // a split drifts in...
                CLIFT.fx.resplit();
            } else if (o.looks && CLIFT.fx.settings.split > 0 && Math.random() < 0.12) {
                CLIFT.fx.settings.split = 0;                          // ...and out again
            }
            if (o.looks && Math.random() < energy * 0.12) {
                CLIFT.fx.settings.grid = CLIFT.fx.settings.grid || sparse ? 0 : 1 + CLIFT.util.randInt(CLIFT.fx.GRIDS.length - 1);
            }
            if (o.resolution && this.section === 'peak' && Math.random() < 0.1 * this.intensity) this.chooseResolution();
            if (o.postfx && CLIFT.output.options.enabled && Math.random() < 0.2) CLIFT.output.stepStyle(1);
            if (o.renderModes) {
                if (e.renderMode !== 0 && Math.random() < 0.3) {
                    // hop to another render mode, or back to plain ASCII
                    e.setRenderMode(Math.random() < 0.5 ? 0 : this.chooseRenderMode());
                } else if (e.renderMode === 0 && Math.random() < 0.15 * energy) {
                    e.setRenderMode(this.chooseRenderMode());
                }
            }
            CLIFT.events.emit('state');
        },

        // Targets around the current look: its own parameters wander, and one or two
        // extra effects fade in for a while.
        newFxTargets(energy) {
            const base = this.lookBase || CLIFT.fx.settings;
            const targets = {};
            for (const [key, [lo, hi]] of Object.entries(MOTION)) {
                const b = base[key];
                if (b !== 0) {
                    const span = (hi - lo) * 0.35 * energy;
                    targets[key] = clamp(b + (Math.random() * 2 - 1) * span, lo, hi);
                } else {
                    targets[key] = 0;
                }
            }
            const extras = 1 + Math.floor(Math.random() * (1 + energy * 2));
            for (let i = 0; i < extras; i++) {
                const key = CLIFT.variety.pick('motion', EXTRA_KEYS);
                const [lo, hi] = MOTION[key];
                targets[key] = lo + Math.random() * (hi - lo) * Math.min(1, 0.4 + energy * 0.6);
            }
            if (this.section === 'build' && CLIFT.fx.settings.cam) {
                // Build-ups accelerate the camera toward the drop.
                const toEnd = 1 - (this.phrase - (this.engine.clock.count % this.phrase)) / this.phrase;
                targets.camSpeed = clamp(0.35 + toEnd * 0.6, 0.05, 0.95);
            }
            if (this.options.space && this.coverageTarget < 0.35) {
                // Sparse moments: trails would fill the empty space back in.
                targets.feedback = Math.min(targets.feedback || 0, 0.55);
                targets.liquid = Math.min(targets.liquid || 0, 0.3);
            }
            this.fxTargets = targets;
        },

        phraseChange() {
            const e = this.engine;
            const o = this.options;
            const s = SECTIONS[this.section];
            const target = e.offAirDeck;

            // Now and then, bring back one of the performer's own saved looks.
            if (o.snapshots && Math.random() < 0.15) {
                const filled = CLIFT.snapshots.slots.map((x, i) => x ? i : -1).filter(i => i >= 0);
                if (filled.length) {
                    CLIFT.snapshots.recall(pick(filled));
                    return;
                }
            }

            if (o.scenes) {
                e.setScene(this.chooseScene(this.energyTarget), target);
                if (o.colors) this.applyPalette(target);
                this.tuneDeck(target);
            }
            if (o.crossfade) {
                const beats = pick(s.transition);
                e.mixMode = CLIFT.variety.pick('mix', s.mix);
                if (beats === 0) {
                    e.transition = null;
                    e.setCrossfader(target);
                } else {
                    e.transitionBeats = beats;
                    e.startTransition(target);
                }
            } else if (o.scenes) {
                e.setCrossfader(target);
            }
            if (o.looks) this.chooseLook();
            if (o.world) this.chooseWorld();
            if (o.camera) this.chooseCamera();
            if (o.space) this.chooseMask(target);
            if (o.effects) {
                const chance = { break: 0.1, groove: 0.2, build: 0.3, peak: 0.45 }[this.section] * (0.5 + this.intensity);
                e.setEffect(Math.random() < chance ? this.chooseEffect() : 0);
            }
            if (o.renderModes) {
                const chance = { break: 0.6, groove: 0.5, build: 0.5, peak: 0.4 }[this.section];
                e.setRenderMode(Math.random() < chance ? this.chooseRenderMode() : 0);
            }
            if (o.resolution && Math.random() < 0.85) this.chooseResolution();
            if (o.colorModes) {
                const r = Math.random();
                e.colorMode = this.section === 'peak' ? (r < 0.8 ? 0 : 2) : r < 0.6 ? 0 : r < 0.8 ? 1 : 2;
            }
            if (o.invert) {
                const chance = { break: 0.05, groove: 0.1, build: 0.2, peak: 0.25 }[this.section] * (0.5 + this.intensity);
                e.invertColors = Math.random() < chance;
            }
            if (o.postfx && CLIFT.output.supported) this.choosePostFx();
            if (o.text && CLIFT.textOverlay.text && !this.textOwnedByUser() && this.section === 'groove' && Math.random() < 0.2) {
                this.showText('marquee', this.phrase);
            }
            CLIFT.events.emit('state');
        },

        // Grid size by section: coarse and chunky when calm, dense at peaks.
        chooseResolution(section = this.section) {
            const res = {
                break: [[40, 12], [60, 18], [80, 24]],
                groove: [[60, 18], [80, 24], [100, 30], [120, 36]],
                build: [[80, 24], [100, 30], [120, 36], [160, 48]],
                peak: [[100, 30], [120, 36], [160, 48], [200, 60]]
            }[section];
            const e = this.engine;
            let next;
            do { next = pick(res); } while (res.length > 1 && next[0] === e.width);
            e.setResolution(next[0], next[1]);
        },

        // Speed and params for a freshly cued scene.
        tuneDeck(index) {
            const e = this.engine;
            const deck = e.decks[index];
            deck.pulse = clamp(0.15 + this.energyTarget * 0.4, 0, 1);
            if (this.options.speed) {
                const [lo, hi] = { break: [0.3, 0.5], groove: [0.42, 0.6], build: [0.5, 0.68], peak: [0.55, 0.78] }[this.section];
                deck.speed = lo + Math.random() * (hi - lo);
            }
            if (this.options.params && CLIFT.catalog.usesParams(deck.sceneId)) {
                for (const k of ['param1', 'param2', 'param3']) deck.params[k] = 0.15 + Math.random() * 0.8;
            }
        },

        choosePostFx() {
            const out = CLIFT.output;
            const chance = { break: 0.5, groove: 0.35, build: 0.45, peak: 0.6 }[this.section];
            if (Math.random() >= chance) {
                out.set('enabled', false);
                return;
            }
            const presets = { break: ['clean', 'retro', 'amber'], groove: ['clean', 'retro'], build: ['cyberpunk', 'retro'], peak: ['heavy', 'cyberpunk'] }[this.section];
            out.applyPreset(pick(presets));
        },

        // The Director only manages text it switched on itself.
        textOwnedByUser() {
            return CLIFT.textOverlay.enabled && !this.textUntil;
        },

        showText(mode, beats) {
            const t = CLIFT.textOverlay;
            t.set('mode', mode);
            t.set('pulse', mode === 'big');
            t.toggle(true);
            this.textUntil = this.engine.clock.count + beats;
        },

        enterBreak() {
            const e = this.engine;
            const o = this.options;
            if (o.looks) this.chooseLook();
            if (o.camera) this.chooseCamera();
            if (o.scenes) {
                const target = e.offAirDeck;
                e.setScene(this.chooseScene(this.energyTarget), target);
                if (o.colors) this.applyPalette(target);
                this.tuneDeck(target);
                e.mixMode = CLIFT.variety.pick('mix', SECTIONS.break.mix);
                e.transitionBeats = 8;
                e.startTransition(target);
            }
            if (o.effects) e.setEffect(0);
            if (o.invert) e.invertColors = false;
            if (o.postfx && CLIFT.output.supported) this.choosePostFx();
            if (o.resolution) this.chooseResolution('break');
            CLIFT.events.emit('state');
        },

        dropMoment() {
            const e = this.engine;
            const o = this.options;
            this.section = 'peak';
            const target = e.offAirDeck;
            if (o.scenes) {
                e.setScene(this.chooseScene(0.9), target);
                if (o.colors) this.applyPalette(target, 0.9);
                this.tuneDeck(target);
            }
            e.transition = null;
            e.setCrossfader(target);
            if (o.looks) this.chooseLook(0.9);
            if (o.world) this.chooseWorld(true);
            if (o.camera) this.chooseCamera();
            if (o.colorModes) e.colorMode = 0;
            if (o.resolution) this.chooseResolution('peak');
            if (o.postfx && CLIFT.output.supported) this.choosePostFx();
            if (o.text && CLIFT.textOverlay.text && !this.textOwnedByUser()) this.showText('big', 8);
            if (o.hits) {
                const impact = CLIFT.variety.pick('impact', IMPACTS.map(([name, w]) => [name, w]));
                for (const kind of IMPACTS.find(i => i[0] === impact)[2]) this.hit(kind, 1);
                this.lastImpact = impact;
            }
            CLIFT.events.emit('director-drop');
        },

        // Weighted pick: scene energy close to the target, never a recent scene.
        chooseScene(target) {
            const cat = CLIFT.catalog;
            const onAir = this.engine.decks.map(d => d.sceneId);
            let pool = this.options.favoritesOnly && cat.favorites.size ? [...cat.favorites] : cat.uniqueIds();
            pool = pool.filter(id => cat.resolve(id) && !cat.broken.has(id) && !onAir.includes(id));
            const fresh = pool.filter(id => !this.recent.includes(id));
            if (fresh.length) pool = fresh;
            if (!pool.length) return onAir[0];

            // Energy fit x novelty of the scene's bank, so sets travel across scene families.
            const bankOf = id => CLIFT.catalog.bankIndexOf(id);
            const weights = pool.map(id => {
                const [energy, weight] = (cat.meta && cat.meta[id]) || [0.5, 1];
                const d = energy - target;
                const bankUse = CLIFT.variety.score('bank', bankOf(id));
                return (weight * Math.exp(-(d * d) / (2 * 0.15 * 0.15)) + 0.01) / Math.pow(1 + bankUse * 2, 2);
            });
            let r = Math.random() * weights.reduce((a, b) => a + b, 0);
            let id = pool[pool.length - 1];
            for (let i = 0; i < pool.length; i++) {
                r -= weights[i];
                if (r <= 0) { id = pool[i]; break; }
            }
            CLIFT.variety.note('bank', bankOf(id));
            this.recent.push(id);
            if (this.recent.length > RECENT) this.recent.shift();
            return id;
        },

        applyPalette(deckIndex, heat = this.energyTarget) {
            const choice = CLIFT.variety.pick('palette', PALETTES.map((p, i) => [i, Math.exp(-Math.pow(p[2] - heat, 2) / 0.08) + 0.02]));
            const pal = PALETTES[choice];
            const deck = this.engine.decks[deckIndex];
            const flip = Math.random() < 0.5;
            deck.primaryColor = flip ? pal[1] : pal[0];
            deck.secondaryColor = flip ? pal[0] : pal[1];
            deck.gradientType = CLIFT.util.randInt(CLIFT.palette.gradients.length);
        },

        chooseLook(target = this.energyTarget) {
            // Section weights, nudged toward looks whose energy suits the moment
            // (lower intensity favors the gentler ones); the variety picker does the rest.
            const looks = SECTIONS[this.section].looks.map(([name, w]) => {
                const d = CLIFT.fx.LOOKS[name].energy - target * (0.6 + this.intensity * 0.5);
                return [name, w * (0.3 + Math.exp(-(d * d) / 0.08))];
            });
            this.useLook(CLIFT.variety.pick('looks', looks));
        },

        // Apply a 2D look without touching the current camera shot.
        useLook(name) {
            const fx = CLIFT.fx;
            const cam = Object.fromEntries(CAMERA_KEYS.map(k => [k, fx.settings[k]]));
            fx.applyLook(name);
            Object.assign(fx.settings, cam);
            this.lookBase = { ...fx.settings };
            this.fxTargets = null;
        },

        // Sometimes the set goes into the 3D world: which world, how the camera
        // moves, which rendering style - all through the variety picker.
        chooseWorld(drop = false) {
            const w = CLIFT.world;
            if (!CLIFT.output.supported) return;
            const chance = { break: 0.3, groove: 0.3, build: 0.45, peak: 0.4 }[this.section] * (0.6 + this.intensity * 0.6);
            if (!drop && Math.random() >= chance) {
                w.settings.world = 0;
                return;
            }
            const ws = w.settings;
            // The generated Explore world is the main one; drops land in a new one.
            ws.world = w.WORLDS.indexOf(CLIFT.variety.pick('world', w.WORLDS.slice(1).map(n => [n, n === 'Explore' ? 5 : 1])));
            if (ws.world === 1 && (drop || Math.random() < 0.3)) w.newWorld();
            ws.move = w.MOVES.indexOf(CLIFT.variety.pick('worldMove', [['Fly', 3], ['Orbit', 2], ['Crane', 2], ['Drift', 2]]));
            ws.style = w.STYLES.indexOf(CLIFT.variety.pick('worldStyle', [['ASCII', 4], ['Blocks', 1], ['Raw', 2]]));
            const [lo, hi] = { break: [0.05, 0.25], groove: [0.2, 0.45], build: [0.4, 0.75], peak: [0.55, 0.95] }[this.section];
            ws.speed = drop ? 0.9 : lo + Math.random() * (hi - lo);
            ws.altitude = Math.random() * 0.7;
            ws.content = 0.3 + Math.random() * 0.5;
            ws.texScale = 0.15 + Math.random() * 0.6;
            ws.fog = 0.2 + Math.random() * 0.5;
            ws.detail = 0.3 + Math.random() * 0.5;
            w.cut();
        },

        // A camera shot for the section: which 3D surface, how close, how fast.
        // Inside the 3D world the image camera stays flat (the world has its own).
        chooseCamera() {
            const fx = CLIFT.fx;
            const s = fx.settings;
            if (CLIFT.world.settings.world) {
                s.cam = 0;
                this.lookBase = { ...s };
                return;
            }
            const name = CLIFT.variety.pick('camera', SECTIONS[this.section].cams);
            s.cam = Math.max(0, fx.CAMERAS.indexOf(name));
            const r = Math.random;
            const [lo, hi] = { break: [0.08, 0.3], groove: [0.2, 0.45], build: [0.4, 0.7], peak: [0.5, 0.9] }[this.section];
            s.camSpeed = lo + r() * (hi - lo);
            s.camZoom = name === 'Macro' ? 0.2 + r() * 0.7 : r() * 0.5;
            s.camTilt = (r() * 2 - 1) * 0.55;
            s.camSpin = (r() < 0.5 ? -1 : 1) * (0.08 + r() * 0.45) * (0.5 + this.intensity * 0.7);
            s.camFog = 0.2 + r() * 0.45;
            if (s.cam) fx.hit('camCut');
            fx.look = '';
            this.lookBase = { ...s };
            this.fxTargets = null;
        },

        chooseRenderMode() {
            const e = this.engine;
            return CLIFT.variety.pick('render', e.renderModes.map((_, i) => i).slice(1));
        },

        // Used by the "Scene change" beat action.
        cutToNewScene() {
            const e = this.engine;
            const target = e.offAirDeck;
            e.setScene(this.chooseScene(this.energyTarget), target);
            this.applyPalette(target);
            this.tuneDeck(target);
            e.transition = null;
            e.setCrossfader(target);
        },

        // An ASCII effect that respects the negative space we're aiming for.
        chooseEffect() {
            const e = this.engine;
            const target = this.options.space ? this.coverageTarget : 1;
            const allowed = e.effects.map((_, i) => i).filter(i => {
                if (!i) return false;
                const kind = (e.effectFill || [])[i] || 'clean';
                return kind === 'clean' || (kind === 'halo' && target >= 0.3) || (kind === 'flood' && target >= 0.85);
            });
            return allowed.length ? CLIFT.variety.pick('effects', allowed) : 0;
        },

        // Shape the incoming deck: calm sections are often confined to a shape.
        chooseMask(index, force = false) {
            const deck = this.engine.decks[index];
            const chance = { break: 0.7, groove: 0.55, build: 0.4, peak: 0.25 }[this.section] * (1.3 - this.fill * 0.6);
            if (!force && Math.random() >= chance) {
                deck.mask = 0;
                return;
            }
            const name = CLIFT.variety.pick('masks', SECTIONS[this.section].masks.filter(m => !force || m !== 'Full'));
            deck.mask = Math.max(0, CLIFT.masks.findIndex(m => m.name === name));
            deck.maskSize = clamp(0.25 + Math.random() * 0.5 + (this.fill - 0.5) * 0.3, 0.1, 1);
            deck.maskInvert = Math.random() < 0.2;
            deck.maskSeed = Math.random() * 1000 | 0;
        },

        status() {
            return {
                section: this.section,
                energy: this.fast / Math.max(this.ref, 0.02),
                nextIn: this.phrase - (this.engine.clock.count % this.phrase),
                shot: CLIFT.fx.CAMERAS[CLIFT.fx.settings.cam],
                coverage: this.engine.coverage || 0,
                coverageTarget: this.coverageTarget
            };
        },

        getState() {
            return { intensity: this.intensity, fill: this.fill, phrase: this.phrase, options: { ...this.options } };
        },

        setState(state) {
            if (!state) return;
            if (typeof state.intensity === 'number') this.intensity = clamp(state.intensity, 0, 1);
            if (typeof state.fill === 'number') this.fill = clamp(state.fill, 0, 1);
            if (this.phrases.includes(state.phrase)) this.phrase = state.phrase;
            // Options saved before v3.2 (no 'colorModes' key) predate "everything on" -> keep defaults.
            if (!state.options || !('colorModes' in state.options)) return;
            for (const k of Object.keys(this.options)) {
                if (typeof state.options[k] === 'boolean') this.options[k] = state.options[k];
            }
        }
    };

    CLIFT.director = director;
    CLIFT.automation = director; // older name used by the UI, keys and MIDI
})();
