// On-beat actions: things that happen every N beats, counted on the BPM clock
// (steady, follows tap / MIDI clock) or on beats detected in the audio.

(function () {
    const STORAGE_KEY = 'clift-beat-actions';
    const e = () => CLIFT.engine;

    const ACTIONS = [
        { id: 'invert', label: 'Invert flash', run: () => CLIFT.fx.hit('invert') },
        { id: 'strobe', label: 'Strobe', run: () => CLIFT.fx.hit('strobe') },
        { id: 'punch', label: 'Zoom punch', run: () => CLIFT.fx.hit('punch') },
        { id: 'hueJump', label: 'Hue jump', run: () => CLIFT.fx.hit('hueJump') },
        { id: 'burst', label: 'Feedback burst', run: () => CLIFT.fx.hit('burst') },
        { id: 'grid', label: 'Grid shuffle', run: () => CLIFT.fx.hit('grid') },
        { id: 'colors', label: 'Color change', run: () => { e().randomizeColors(0); e().randomizeColors(1); } },
        { id: 'effect', label: 'Effect change', run: () => e().setEffect(Math.random() < 0.35 ? 0 : 1 + CLIFT.util.randInt(e().effects.length - 1)) },
        { id: 'scene', label: 'Scene change', run: () => CLIFT.director.cutToNewScene() }
    ];

    const EVERY = [1, 2, 4, 8, 16, 32];

    const defaults = () => Object.fromEntries(ACTIONS.map(a => [a.id, { on: false, every: a.id === 'scene' ? 16 : a.id === 'colors' || a.id === 'grid' ? 8 : 4 }]));

    const beats = {
        ACTIONS,
        EVERY,
        source: 'clock', // 'clock' | 'audio'
        config: defaults(),
        audioCount: 0,

        load() {
            const saved = CLIFT.util.storage.get(STORAGE_KEY);
            if (saved) this.setState(saved);
        },

        save() {
            CLIFT.util.storage.set(STORAGE_KEY, this.getState());
            CLIFT.events.emit('state');
        },

        set(id, key, value) {
            this.config[id][key] = value;
            this.save();
        },

        setSource(source) {
            this.source = source === 'audio' ? 'audio' : 'clock';
            this.save();
        },

        allOff() {
            for (const a of ACTIONS) this.config[a.id].on = false;
            this.save();
        },

        anyOn() {
            return ACTIONS.some(a => this.config[a.id].on);
        },

        fire(count) {
            for (const a of ACTIONS) {
                const c = this.config[a.id];
                if (c.on && count % c.every === 0) a.run();
            }
        },

        getState() {
            return { source: this.source, config: JSON.parse(JSON.stringify(this.config)) };
        },

        setState(state) {
            if (!state) return;
            this.source = state.source === 'audio' ? 'audio' : 'clock';
            const base = defaults();
            for (const a of ACTIONS) {
                const c = state.config && state.config[a.id];
                base[a.id] = c ? { on: !!c.on, every: EVERY.includes(c.every) ? c.every : base[a.id].every } : base[a.id];
            }
            this.config = base;
            CLIFT.events.emit('state');
        },

        init() {
            this.load();
            CLIFT.events.on('clock-beat', (count) => {
                if (this.source === 'clock') this.fire(count);
            });
            CLIFT.events.on('beat', () => {
                if (this.source === 'audio') this.fire(++this.audioCount);
            });
        }
    };

    CLIFT.beatActions = beats;
})();
