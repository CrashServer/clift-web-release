// MIDI controller support with "MIDI learn".
//
// Targets are things a control can drive: continuous ones (crossfader, knobs)
// take a 0..1 value, triggers fire when a pad/button is pressed. Learning binds
// the next incoming CC / note / pitch-bend to the armed target. Bindings are
// saved in localStorage.
//
// Optional MIDI clock sync follows an external tempo (24 ticks per beat) and
// re-aligns the downbeat on Start.

(function () {
    const STORAGE_KEY = 'clift-midi-map';
    const CLOCK_KEY = 'clift-midi-clock';
    const e = () => CLIFT.engine;

    function range(id, label, apply) { return { id, label, type: 'range', apply }; }
    function trigger(id, label, fire) { return { id, label, type: 'trigger', fire }; }

    function setDeckParam(name, v) {
        e().deck().params[name] = Math.max(0.01, v);
        CLIFT.events.emit('state');
    }

    const TARGETS = [
        range('crossfader', 'Crossfader', v => { e().transition = null; e().setCrossfader(v); }),
        range('param1', 'Param 1 (edit deck)', v => setDeckParam('param1', v)),
        range('param2', 'Param 2 (edit deck)', v => setDeckParam('param2', v)),
        range('param3', 'Param 3 (edit deck)', v => setDeckParam('param3', v)),
        range('speedA', 'Speed deck A', v => e().setDeckSpeed && e().setDeckSpeed(0, v)),
        range('speedB', 'Speed deck B', v => e().setDeckSpeed && e().setDeckSpeed(1, v)),
        range('pulseA', 'Pulse deck A', v => e().setDeckPulse && e().setDeckPulse(0, v)),
        range('pulseB', 'Pulse deck B', v => e().setDeckPulse && e().setDeckPulse(1, v)),
        range('glow', 'Post-FX glow', v => CLIFT.output.set('glow', Math.round(v * 40) / 10)),
        range('gain', 'Audio gain', v => CLIFT.audio.setGain(Math.round((0.1 + v * v * 7.9) * 10) / 10)),

        trigger('transition', 'Transition', () => e().startTransition()),
        trigger('cutA', 'Cut to A', () => { e().transition = null; e().setCrossfader(0); }),
        trigger('cutB', 'Cut to B', () => { e().transition = null; e().setCrossfader(1); }),
        trigger('sceneNextA', 'Next scene A', () => e().stepScene(1, 0)),
        trigger('scenePrevA', 'Previous scene A', () => e().stepScene(-1, 0)),
        trigger('sceneNextB', 'Next scene B', () => e().stepScene(1, 1)),
        trigger('scenePrevB', 'Previous scene B', () => e().stepScene(-1, 1)),
        trigger('sceneNext', 'Next scene (edit deck)', () => e().stepScene(1)),
        trigger('scenePrev', 'Previous scene (edit deck)', () => e().stepScene(-1)),
        trigger('bankNext', 'Next bank (edit deck)', () => e().stepBank(1)),
        trigger('bankPrev', 'Previous bank (edit deck)', () => e().stepBank(-1)),
        trigger('editDeck', 'Switch edit deck', () => e().selectDeck(1 - e().activeDeck)),
        trigger('effectNext', 'Next effect', () => e().setEffect(e().currentEffect + 1)),
        trigger('effectPrev', 'Previous effect', () => e().setEffect(e().currentEffect - 1)),
        trigger('effectOff', 'Effect off', () => e().setEffect(0)),
        trigger('renderNext', 'Next render mode', () => e().setRenderMode(e().renderMode + 1)),
        trigger('postfx', 'Post-FX on/off', () => CLIFT.output.toggle()),
        trigger('presetNext', 'Next post-FX preset', () => CLIFT.output.stepPreset(1)),
        trigger('invert', 'Invert FG/BG', () => { e().invertColors = !e().invertColors; CLIFT.events.emit('state'); }),
        trigger('auto', 'Full Auto on/off', () => CLIFT.automation.toggle()),
        trigger('tap', 'Tap tempo', () => e().tap()),
        trigger('text', 'Text overlay on/off', () => CLIFT.textOverlay && CLIFT.textOverlay.toggle()),
        ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => trigger(`snap${n}`, `Snapshot ${n}`, () => CLIFT.snapshots && CLIFT.snapshots.recall(n - 1)))
    ];

    const midi = {
        TARGETS,
        access: null,
        enabled: false,
        error: '',
        inputs: [],
        bindings: CLIFT.util.storage.get(STORAGE_KEY, {}), // messageKey -> targetId
        learning: null,
        lastMessage: '',
        clockSync: !!CLIFT.util.storage.get(CLOCK_KEY, false),
        lastValues: {},
        clockTicks: [],
        tickCount: 0,

        target(id) {
            return TARGETS.find(t => t.id === id);
        },

        bindingFor(targetId) {
            return Object.keys(this.bindings).find(k => this.bindings[k] === targetId) || '';
        },

        describe(key) {
            if (!key) return '';
            const [type, ch, num] = key.split(':');
            const chan = `ch${Number(ch) + 1}`;
            if (type === 'cc') return `CC ${num} ${chan}`;
            if (type === 'note') return `Note ${num} ${chan}`;
            return `Pitch bend ${chan}`;
        },

        async enable() {
            if (!navigator.requestMIDIAccess) {
                throw new Error('Web MIDI is not available in this browser (Chrome / Edge / Opera support it)');
            }
            this.access = await navigator.requestMIDIAccess({ sysex: false });
            this.enabled = true;
            this.error = '';
            this.access.onstatechange = () => this.attach();
            this.attach();
        },

        attach() {
            this.inputs = [];
            for (const input of this.access.inputs.values()) {
                input.onmidimessage = (msg) => this.onMessage(msg.data);
                this.inputs.push(input.name || 'MIDI input');
            }
            CLIFT.events.emit('midi');
        },

        learn(targetId) {
            this.learning = this.learning === targetId ? null : targetId;
            CLIFT.events.emit('midi');
        },

        unbind(targetId) {
            for (const k of Object.keys(this.bindings)) if (this.bindings[k] === targetId) delete this.bindings[k];
            this.save();
        },

        clearAll() {
            this.bindings = {};
            this.save();
        },

        save() {
            CLIFT.util.storage.set(STORAGE_KEY, this.bindings);
            CLIFT.events.emit('midi');
        },

        setClockSync(on) {
            this.clockSync = !!on;
            this.clockTicks = [];
            CLIFT.util.storage.set(CLOCK_KEY, this.clockSync);
            CLIFT.events.emit('midi');
        },

        onMessage(data) {
            const status = data[0];
            if (status >= 0xF8) {
                this.onRealtime(status);
                return;
            }
            const type = status & 0xF0;
            const ch = status & 0x0F;
            let key, value;
            if (type === 0xB0) {
                key = `cc:${ch}:${data[1]}`;
                value = data[2] / 127;
            } else if (type === 0x90 || type === 0x80) {
                key = `note:${ch}:${data[1]}`;
                value = type === 0x90 && data[2] > 0 ? 1 : 0;
            } else if (type === 0xE0) {
                key = `pb:${ch}`;
                value = ((data[2] << 7) | data[1]) / 16383;
            } else {
                return;
            }

            this.lastMessage = this.describe(key);
            if (this.learning) {
                if (value === 0 && key.startsWith('note')) return; // bind on press, not release
                this.unbind(this.learning);
                this.bindings[key] = this.learning;
                this.learning = null;
                this.save();
                return;
            }

            const target = this.target(this.bindings[key]);
            const last = this.lastValues[key] || 0;
            this.lastValues[key] = value;
            if (!target) {
                CLIFT.events.emit('midi-activity');
                return;
            }
            if (target.type === 'range') target.apply(value);
            else if (value >= 0.5 && last < 0.5) target.fire();
            CLIFT.events.emit('midi-activity');
        },

        // MIDI clock: 24 ticks per quarter note.
        onRealtime(status) {
            if (!this.clockSync) return;
            const engine = e();
            if (status === 0xFA) { // Start
                this.tickCount = 0;
                engine.syncDownbeat();
                return;
            }
            if (status !== 0xF8) return;
            const now = performance.now();
            const ticks = this.clockTicks;
            ticks.push(now);
            if (ticks.length > 49) ticks.shift();
            if (ticks.length >= 25) {
                const bpm = 60000 / ((ticks[ticks.length - 1] - ticks[0]) / (ticks.length - 1) * 24);
                if (Math.abs(bpm - engine.bpm) >= 0.75) engine.setBPM(bpm);
            }
            this.tickCount = (this.tickCount + 1) % 24;
            if (this.tickCount === 0) engine.syncDownbeat();
        }
    };

    CLIFT.midi = midi;
})();
