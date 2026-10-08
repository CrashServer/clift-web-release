// Session state: snapshot / restore, JSON file export / import, and a local
// autosave so a reload comes back to the same setup.

(function () {
    const AUTOSAVE_KEY = 'clift-session';
    const VERSION = 3;

    function num(v, fallback) {
        return typeof v === 'number' && isFinite(v) ? v : fallback;
    }

    CLIFT.session = {
        snapshot() {
            const e = this.engine;
            return {
                app: 'clift-web',
                version: VERSION,
                savedAt: new Date().toISOString(),
                bpm: e.bpm,
                crossfader: e.crossfader,
                activeDeck: e.activeDeck,
                mixMode: e.mixMode,
                effect: e.currentEffect,
                renderMode: e.renderMode,
                colorEnabled: e.colorEnabled,
                invertColors: e.invertColors,
                colorMode: e.colorMode,
                resolution: [e.width, e.height],
                transitionBeats: e.transitionBeats,
                decks: e.decks.map(d => ({
                    sceneId: d.sceneId,
                    primaryColor: d.primaryColor,
                    secondaryColor: d.secondaryColor,
                    gradientType: d.gradientType,
                    params: Object.assign({}, d.params),
                    speed: d.speed,
                    pulse: d.pulse
                })),
                postfx: CLIFT.output.getOptions(),
                auto: CLIFT.director.getState(),
                fx: CLIFT.fx.getState(),
                beatActions: CLIFT.beatActions.getState(),
                audioGain: CLIFT.audio.gain,
                snapshots: CLIFT.snapshots.slots,
                text: {
                    text: CLIFT.textOverlay.text,
                    mode: CLIFT.textOverlay.mode,
                    color: CLIFT.textOverlay.color,
                    pulse: CLIFT.textOverlay.pulse
                }
            };
        },

        // Accepts v3 snapshots and the v1/v2 files written by older CLIFT Web builds.
        restore(data) {
            if (!data || typeof data !== 'object') throw new Error('Not a CLIFT session');
            const e = this.engine;
            const settings = data.settings || data;

            e.bpm = CLIFT.util.clamp(num(settings.bpm, e.bpm), 40, 240);
            e.crossfader = CLIFT.util.clamp(num(settings.crossfader, e.crossfader), 0, 1);
            e.activeDeck = settings.activeDeck === 1 ? 1 : 0;
            e.currentEffect = CLIFT.util.clamp(num(data.effect ?? settings.currentEffect, 0), 0, e.effects.length - 1);
            e.colorMode = CLIFT.util.clamp(num(settings.colorMode, 0), 0, e.colorModes.length - 1);
            e.invertColors = !!settings.invertColors;
            if (typeof data.colorEnabled === 'boolean') e.colorEnabled = data.colorEnabled;
            if (data.mixMode !== undefined) e.mixMode = CLIFT.util.clamp(num(data.mixMode, 0), 0, e.mixModes.length - 1);
            if (data.renderMode !== undefined) e.renderMode = CLIFT.util.clamp(num(data.renderMode, 0), 0, e.renderModes.length - 1);
            if (e.transitionBeatOptions.includes(data.transitionBeats)) e.transitionBeats = data.transitionBeats;
            if (Array.isArray(data.resolution)) e.setResolution(num(data.resolution[0], 80), num(data.resolution[1], 24));

            const decks = Array.isArray(data.decks) ? data.decks : data.decks ? [data.decks.A, data.decks.B] : [];
            decks.forEach((d, i) => {
                if (!d || i > 1) return;
                const deck = e.decks[i];
                const id = d.sceneId !== undefined ? d.sceneId
                    : d.category !== undefined ? d.category * 10 + (d.scene || 0) : deck.sceneId;
                if (CLIFT.catalog.resolve(id)) deck.sceneId = id;
                deck.primaryColor = CLIFT.util.clamp(num(d.primaryColor, deck.primaryColor), 1, CLIFT.palette.count);
                deck.secondaryColor = CLIFT.util.clamp(num(d.secondaryColor, deck.secondaryColor), 1, CLIFT.palette.count);
                deck.gradientType = CLIFT.util.clamp(num(d.gradientType, deck.gradientType), 0, CLIFT.palette.gradients.length - 1);
                if (typeof d.speed === 'number') deck.speed = CLIFT.util.clamp(d.speed, 0, 1);
                if (typeof d.pulse === 'number') deck.pulse = CLIFT.util.clamp(d.pulse, 0, 1);
                if (d.params) {
                    for (const k of ['param1', 'param2', 'param3']) deck.params[k] = CLIFT.util.clamp(num(d.params[k], 0.5), 0, 1);
                }
            });

            if (data.postfx) CLIFT.output.setOptions(data.postfx);
            if (data.auto) CLIFT.director.setState(data.auto);
            if (data.fx) CLIFT.fx.setState(data.fx);
            if (data.beatActions) CLIFT.beatActions.setState(data.beatActions);
            if (typeof data.audioGain === 'number') CLIFT.audio.setGain(CLIFT.util.clamp(data.audioGain, 0.1, 8));
            if (data.snapshots) CLIFT.snapshots.setAll(data.snapshots);
            if (data.text) {
                const t = CLIFT.textOverlay;
                if (typeof data.text.text === 'string') t.text = data.text.text.slice(0, 200);
                if (t.modes.includes(data.text.mode)) t.mode = data.text.mode;
                t.color = CLIFT.util.clamp(num(data.text.color, 7), 1, CLIFT.palette.count);
                t.pulse = !!data.text.pulse;
                t.cache = null;
            }

            CLIFT.events.emit('state');
            CLIFT.events.emit('crossfader', e.crossfader);
        },

        exportFile(name) {
            const safe = (name || 'session').replace(/[^a-zA-Z0-9_-]+/g, '-');
            CLIFT.util.download(`clift-${safe}-${CLIFT.util.timestamp()}.json`, JSON.stringify(this.snapshot(), null, 2));
        },

        importFile(file) {
            return file.text().then(text => this.restore(JSON.parse(text)));
        },

        autosave() {
            if (!this.autosaveDisabled) CLIFT.util.storage.set(AUTOSAVE_KEY, this.snapshot());
        },

        // Forget the saved state and reload with defaults.
        reset() {
            this.autosaveDisabled = true;
            this.clearAutosave();
            location.reload();
        },

        restoreAutosave() {
            const data = CLIFT.util.storage.get(AUTOSAVE_KEY);
            if (!data || data.version !== VERSION) return false;
            try {
                this.restore(data);
                return true;
            } catch (e) {
                CLIFT.warn('ignoring broken autosave:', e.message);
                return false;
            }
        },

        clearAutosave() {
            CLIFT.util.storage.remove(AUTOSAVE_KEY);
        },

        init(engine) {
            this.engine = engine;
            let timer = null;
            const schedule = () => {
                clearTimeout(timer);
                timer = setTimeout(() => this.autosave(), 1000);
            };
            CLIFT.events.on('state', schedule);
            CLIFT.events.on('crossfader', schedule);
            window.addEventListener('beforeunload', () => this.autosave());
        }
    };
})();
