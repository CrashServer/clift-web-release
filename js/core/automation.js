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
//  - on a drop: instant cut to a high-energy scene with strobe / invert / burst
// Intensity (calm .. wild) scales how much FX and how many hits it uses.

(function () {
    const { pick, clamp } = CLIFT.util;

    const SECTIONS = {
        break: { target: 0.2, transition: [16, 8], mix: [1, 6], looks: ['clean', 'trails', 'liquid', 'melt'] },
        groove: { target: 0.5, transition: [8, 4], mix: [0, 2, 3, 4], looks: ['clean', 'trails', 'mirror', 'panels', 'slicer', 'tiles'] },
        build: { target: 0.65, transition: [4, 2], mix: [5, 6], looks: ['tunnel', 'slicer', 'glitch', 'liquid', 'melt'] },
        peak: { target: 0.85, transition: [1, 0], mix: [7, 2], looks: ['storm', 'panels', 'glitch', 'shatter', 'datamosh', 'acid', 'mosaic'] }
    };

    // Color pairs that work together, with a "temperature" (0 cool .. 1 hot).
    const PALETTES = [
        [2, 6, 0.3], [6, 3, 0.1], [3, 7, 0.05], [7, 6, 0.2], [2, 4, 0.5], [6, 5, 0.6],
        [5, 3, 0.55], [4, 1, 0.85], [1, 5, 0.95], [5, 4, 0.8], [1, 7, 0.9], [9, 6, 0.7], [8, 4, 1.0]
    ];

    const RECENT = 16;

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
            effects: true,
            renderModes: false,
            resolution: false,
            favoritesOnly: false
        },
        optionLabels: {
            scenes: 'Scenes',
            crossfade: 'Transitions',
            looks: 'Visual FX looks',
            hits: 'Beat hits',
            colors: 'Colors',
            effects: 'ASCII effects',
            renderModes: 'Render modes',
            resolution: 'Grid size',
            favoritesOnly: 'Favorites only'
        },

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
        },

        toggle(force) {
            this.enabled = force === undefined ? !this.enabled : !!force;
            CLIFT.events.emit('state');
            return this.enabled;
        },

        // ---- music tracking (every frame) ---------------------------------------

        update(dt, audio) {
            const raw = audio.raw || { volume: audio.volume, bass: audio.bands.bass };
            const level = raw.volume * 0.6 + raw.bass * 0.4;
            const k = (tau) => 1 - Math.exp(-dt / tau);
            this.fast += (level - this.fast) * k(400);
            this.slow += (level - this.slow) * k(8000);
            this.fastBass += (raw.bass - this.fastBass) * k(250);
            this.slowBass += (raw.bass - this.slowBass) * k(6000);
            this.beatPeak = Math.max(this.beatPeak, raw.bass);

            // Drop = the kick coming back after a breakdown / build-up. Checked every
            // frame so the cut lands on the kick, not a beat later.
            const hist = this.bassHistory;
            if (this.enabled && (this.section === 'break' || this.section === 'build') && hist.length >= 4) {
                const recent = Math.max(...hist.slice(-2));
                const count = this.engine.clock.count;
                if (recent < this.peakAvg * 0.6 && raw.bass > this.peakAvg * 0.8 && count - this.lastDrop > 16) {
                    this.lastDrop = count;
                    this.dropMoment();
                }
            }
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
            // the kick is clearly back this beat after low beats -> drop, one beat late.
            const count = this.engine.clock.count;
            if ((this.section === 'break' || this.section === 'build') && bassHist.length >= 4 &&
                Math.max(...bassHist.slice(-3, -1)) < this.peakAvg * 0.6 && this.beatPeak > this.peakAvg * 0.8 &&
                count - this.lastDrop > 16) {
                this.lastDrop = count;
                this.dropMoment();
            }
            // Only beats with a kick teach us the kick level.
            if (!kickGone) this.peakAvg += (this.beatPeak - this.peakAvg) * 0.15;
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

        get energyTarget() {
            return clamp(SECTIONS[this.section].target + (this.intensity - 0.5) * 0.3, 0, 1);
        },

        // ---- decisions (every beat) ------------------------------------------------

        onBeat(count) {
            const { entered } = this.classify();
            const o = this.options;
            const e = this.engine;
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

            // Bar-level variation, more of it with higher intensity and energy.
            const busy = this.intensity * (this.section === 'peak' ? 1 : this.section === 'build' ? 0.6 : 0.25);
            if (count % 4 === 0 && Math.random() < busy * 0.6) {
                if (o.hits && Math.random() < 0.6) CLIFT.fx.hit(pick(['hueJump', 'burst', 'glitch', 'split', 'shock']));
                else if (o.looks && Math.random() < 0.4) CLIFT.fx.hit('split');
                else if (o.colors) e.stepDeckColor(Math.random() < 0.5 ? 'primary' : 'secondary', 1, 1 - e.offAirDeck);
            }
            if (o.hits && this.section === 'peak' && Math.random() < this.intensity * 0.35) {
                CLIFT.fx.hit('punch', 0.6 + this.intensity * 0.4);
            }
            if (o.hits && this.section === 'peak' && count % 8 === 0 && Math.random() < this.intensity * 0.4) {
                CLIFT.fx.hit('explode', 0.6 + this.intensity * 0.4);
            }
            if (o.hits && this.section === 'build' && count % 4 >= 2 && Math.random() < this.intensity * 0.5) {
                // Build-ups get more and more glitchy toward the drop.
                CLIFT.fx.hit(Math.random() < 0.5 ? 'punch' : 'glitch', 0.5);
            }
        },

        phraseChange() {
            const e = this.engine;
            const o = this.options;
            const s = SECTIONS[this.section];
            const target = e.offAirDeck;

            if (o.scenes) {
                e.setScene(this.chooseScene(this.energyTarget), target);
                if (o.colors) this.applyPalette(target);
                e.decks[target].pulse = clamp(0.15 + this.energyTarget * 0.4, 0, 1);
            }
            if (o.crossfade) {
                const beats = pick(s.transition);
                e.mixMode = pick(s.mix);
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
            if (o.effects) {
                const chance = { break: 0.1, groove: 0.2, build: 0.3, peak: 0.45 }[this.section] * (0.5 + this.intensity);
                e.setEffect(Math.random() < chance ? 1 + CLIFT.util.randInt(e.effects.length - 1) : 0);
            }
            if (o.renderModes) {
                e.setRenderMode(Math.random() < (this.section === 'break' ? 0.25 : 0.1) ? 1 + CLIFT.util.randInt(e.renderModes.length - 1) : 0);
            }
            if (o.resolution) {
                const res = this.section === 'break' ? [[60, 18], [80, 24]] : this.section === 'peak' ? [[120, 36], [160, 48]] : [[80, 24], [100, 30], [120, 36]];
                const [w, h] = pick(res);
                e.setResolution(w, h);
            }
            CLIFT.events.emit('state');
        },

        enterBreak() {
            const e = this.engine;
            const o = this.options;
            if (o.looks) this.chooseLook();
            if (o.scenes) {
                const target = e.offAirDeck;
                e.setScene(this.chooseScene(this.energyTarget), target);
                if (o.colors) this.applyPalette(target);
                e.mixMode = pick(SECTIONS.break.mix);
                e.transitionBeats = 8;
                e.startTransition(target);
            }
            if (o.effects) e.setEffect(0);
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
            }
            e.transition = null;
            e.setCrossfader(target);
            if (o.looks) this.chooseLook(0.9);
            if (o.hits) {
                CLIFT.fx.hit('strobe');
                CLIFT.fx.hit('explode');
                CLIFT.fx.hit('shock');
                CLIFT.fx.hit('glitch');
                CLIFT.fx.hit('burst');
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

            const weights = pool.map(id => {
                const [energy, weight] = (cat.meta && cat.meta[id]) || [0.5, 1];
                const d = energy - target;
                return weight * Math.exp(-(d * d) / (2 * 0.15 * 0.15)) + 0.01;
            });
            let r = Math.random() * weights.reduce((a, b) => a + b, 0);
            let id = pool[pool.length - 1];
            for (let i = 0; i < pool.length; i++) {
                r -= weights[i];
                if (r <= 0) { id = pool[i]; break; }
            }
            this.recent.push(id);
            if (this.recent.length > RECENT) this.recent.shift();
            return id;
        },

        applyPalette(deckIndex, heat = this.energyTarget) {
            const weights = PALETTES.map(p => Math.exp(-Math.pow(p[2] - heat, 2) / 0.08));
            let r = Math.random() * weights.reduce((a, b) => a + b, 0);
            let pal = PALETTES[0];
            for (let i = 0; i < PALETTES.length; i++) { r -= weights[i]; if (r <= 0) { pal = PALETTES[i]; break; } }
            const deck = this.engine.decks[deckIndex];
            const flip = Math.random() < 0.5;
            deck.primaryColor = flip ? pal[1] : pal[0];
            deck.secondaryColor = flip ? pal[0] : pal[1];
            deck.gradientType = CLIFT.util.randInt(CLIFT.palette.gradients.length);
        },

        chooseLook(target = this.energyTarget) {
            const looks = SECTIONS[this.section].looks;
            // Lower intensity favors the gentler looks of the section.
            const scored = looks.map(name => {
                const d = CLIFT.fx.LOOKS[name].energy - target * (0.6 + this.intensity * 0.5);
                return [name, Math.exp(-(d * d) / 0.05)];
            });
            let r = Math.random() * scored.reduce((a, [, w]) => a + w, 0);
            for (const [name, w] of scored) {
                r -= w;
                if (r <= 0) { CLIFT.fx.applyLook(name); return; }
            }
            CLIFT.fx.applyLook(looks[0]);
        },

        // Used by the "Scene change" beat action.
        cutToNewScene() {
            const e = this.engine;
            const target = e.offAirDeck;
            e.setScene(this.chooseScene(this.energyTarget), target);
            this.applyPalette(target);
            e.transition = null;
            e.setCrossfader(target);
        },

        status() {
            return {
                section: this.section,
                energy: this.fast / Math.max(this.ref, 0.02),
                nextIn: this.phrase - (this.engine.clock.count % this.phrase)
            };
        },

        getState() {
            return { intensity: this.intensity, phrase: this.phrase, options: { ...this.options } };
        },

        setState(state) {
            if (!state) return;
            if (typeof state.intensity === 'number') this.intensity = clamp(state.intensity, 0, 1);
            if (this.phrases.includes(state.phrase)) this.phrase = state.phrase;
            for (const k of Object.keys(this.options)) {
                if (state.options && typeof state.options[k] === 'boolean') this.options[k] = state.options[k];
            }
        }
    };

    CLIFT.director = director;
    CLIFT.automation = director; // older name used by the UI, keys and MIDI
})();
