// Keyboard shortcuts. The KEYMAP table is the single source of truth: it drives
// both the key handling and the help dialog.
//
// Each entry matches on `code` (physical key, layout independent: digits, arrows,
// Space...) or `key` (the printed character, case-insensitive). `shift: true`
// entries only fire with Shift held; others fire without it.

(function () {
    const e = () => CLIFT.engine;
    const ui = () => CLIFT.ui;
    const out = () => CLIFT.output;

    function audioToggle() {
        if (CLIFT.audio.live) {
            CLIFT.audio.useDemo();
            ui().toast('Demo audio');
        } else {
            ui().startMic();
        }
    }

    function cycleCrossfader() {
        const engine = e();
        engine.transition = null;
        const c = engine.crossfader;
        engine.setCrossfader(c < 0.25 ? 0.5 : c < 0.75 ? 1 : 0);
    }

    function setXf(v) {
        e().transition = null;
        e().setCrossfader(v);
    }

    function stepGlow(delta) {
        const o = out().options;
        out().set('glow', Math.round(CLIFT.util.clamp(o.glow + delta, 0, 4) * 10) / 10);
        if (!o.enabled) out().set('enabled', true);
    }

    const KEYMAP = [
        { group: 'Scenes', label: '← →', desc: 'Previous / next scene', code: ['ArrowLeft', 'ArrowRight'],
            run: (ev) => e().stepScene(ev.code === 'ArrowLeft' ? -1 : 1) },
        { group: 'Scenes', label: '↑ ↓', desc: 'Previous / next bank', code: ['ArrowUp', 'ArrowDown'],
            run: (ev) => e().stepBank(ev.code === 'ArrowUp' ? -1 : 1) },
        { group: 'Scenes', label: '1 … 0', desc: 'Scene 1-10 of the current bank',
            code: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'], noShift: true,
            run: (ev) => e().sceneInBank((Number(ev.code.slice(5)) + 9) % 10) },
        { group: 'Scenes', label: 'Shift+1 … 8', desc: 'Recall snapshot 1-8', shift: true,
            code: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'],
            run: (ev) => {
                const i = Number(ev.code.slice(5)) - 1;
                if (!CLIFT.snapshots.recall(i)) ui().toast(`Snapshot ${i + 1} is empty - Shift+click its slot to save`);
            } },
        { group: 'Scenes', label: 'Tab', desc: 'Switch edit deck A/B', code: ['Tab'],
            run: () => e().selectDeck(1 - e().activeDeck) },

        { group: 'Mixer', label: 'T', desc: 'Transition to the other deck', key: ['t'], run: () => e().startTransition() },
        { group: 'Mixer', label: 'Z / B / V', desc: 'Crossfader to A / middle / B', key: ['z', 'b', 'v'],
            run: (ev) => setXf({ z: 0, b: 0.5, v: 1 }[ev.key.toLowerCase()]) },
        { group: 'Mixer', label: 'X', desc: 'Cycle crossfader A → mix → B', key: ['x'], run: cycleCrossfader },
        { group: 'Mixer', label: 'Shift+X', desc: 'Next mix pattern', key: ['x'], shift: true,
            run: () => { e().mixMode = (e().mixMode + 1) % e().mixModes.length; CLIFT.events.emit('state'); } },
        { group: 'Mixer', label: 'M', desc: 'Full Auto on/off', key: ['m'], run: () => CLIFT.automation.toggle() },

        { group: 'Effects', label: 'E / Shift+E', desc: 'Next / previous effect', key: ['e'], anyShift: true,
            run: (ev) => e().setEffect(e().currentEffect + (ev.shiftKey ? -1 : 1)) },
        { group: 'Effects', label: 'Backspace', desc: 'Effect off', code: ['Backspace'], run: () => e().setEffect(0) },
        { group: 'Effects', label: 'R / Shift+R', desc: 'Next render mode / back to ASCII', key: ['r'], anyShift: true,
            run: (ev) => e().setRenderMode(ev.shiftKey ? 0 : e().renderMode + 1) },

        { group: 'Color', label: 'N / J', desc: 'Next primary / secondary color', key: ['n', 'j'],
            run: (ev) => e().stepDeckColor(ev.key.toLowerCase() === 'n' ? 'primary' : 'secondary', 1) },
        { group: 'Color', label: 'K', desc: 'Next gradient', key: ['k'], run: () => e().stepGradient(1) },
        { group: 'Color', label: 'C', desc: 'Color on/off', key: ['c'],
            run: () => { e().colorEnabled = !e().colorEnabled; CLIFT.events.emit('state'); } },
        { group: 'Color', label: 'I', desc: 'Invert FG/BG', key: ['i'],
            run: () => { e().invertColors = !e().invertColors; CLIFT.events.emit('state'); } },

        { group: 'Visual FX', label: 'G / Shift+G', desc: 'Next split mode / re-split now', key: ['g'], anyShift: true,
            run: (ev) => ev.shiftKey ? CLIFT.fx.hit('split') : CLIFT.fx.stepSplit(1) },
        { group: 'Visual FX', label: 'Y', desc: 'Feedback trails on/off', key: ['y'], run: () => CLIFT.fx.toggleFeedback() },
        { group: 'Visual FX', label: 'Shift+Y', desc: 'Reset visual FX', key: ['y'], shift: true, run: () => CLIFT.fx.reset() },
        { group: 'Post-FX', label: 'P', desc: 'Post-FX on/off', key: ['p'], run: () => out().toggle() },
        { group: 'Post-FX', label: 'D', desc: 'Next preset', key: ['d'], run: () => out().stepPreset(1) },
        { group: 'Post-FX', label: 'S', desc: 'Next tint', key: ['s'], run: () => out().stepStyle(1) },
        { group: 'Post-FX', label: '- / =', desc: 'Glow down / up', key: ['-', '=', '+'], anyShift: true,
            run: (ev) => stepGlow(ev.key === '-' ? -0.2 : 0.2) },

        { group: 'Audio & tempo', label: 'A', desc: 'Audio input on/off', key: ['a'], run: audioToggle },
        { group: 'Audio & tempo', label: 'Q', desc: 'Tap tempo (also re-syncs the downbeat)', key: ['q'], run: () => e().tap() },

        { group: 'Output', label: 'Space', desc: 'Pause / resume', code: ['Space'], run: () => e().togglePause() },
        { group: 'Output', label: '[ / ]', desc: 'Lower / higher grid resolution', key: ['[', ']'],
            run: (ev) => e().stepResolution(ev.key === '[' ? -1 : 1) },
        { group: 'Output', label: 'O', desc: 'Record video', key: ['o'], run: () => ui().toggleRecording() },
        { group: 'Output', label: 'F', desc: 'Fullscreen', key: ['f'], run: () => ui().toggleFullscreen() },
        { group: 'Output', label: 'Shift+F', desc: 'Projector output window', key: ['f'], shift: true, run: () => ui().toggleOutputWindow() },
        { group: 'Output', label: 'L', desc: 'Text overlay on/off', key: ['l'], run: () => CLIFT.textOverlay.toggle() },
        { group: 'Output', label: 'U', desc: 'Hide / show the interface', key: ['u'], run: () => ui().toggleUI() },
        { group: 'Output', label: 'W', desc: 'Live-coding server connect', key: ['w'], run: () => CLIFT.ws.toggle() },

        { group: 'Help', label: 'H / ?', desc: 'This help', key: ['h', '?'], anyShift: true, run: () => ui().openDialog('help-modal') },
        { group: 'Help', label: 'Esc', desc: 'Close dialog, else stop Full Auto', code: ['Escape'],
            run: () => { if (!ui().closeDialogs()) CLIFT.automation.toggle(false); } }
    ];

    // Key entries need Shift exactly as declared; code entries (arrows, Space...)
    // ignore Shift unless they say `shift` or `noShift`.
    function matches(entry, ev) {
        if (entry.code && !entry.code.includes(ev.code)) return false;
        if (entry.key && !entry.key.includes(ev.key.toLowerCase())) return false;
        if (entry.anyShift) return true;
        if (entry.shift) return ev.shiftKey;
        if (entry.key || entry.noShift) return !ev.shiftKey;
        return true;
    }

    function isTyping(target) {
        if (!target || !target.tagName) return false;
        if (target.isContentEditable) return true;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
        if (target.tagName === 'INPUT') return !['checkbox', 'radio', 'button', 'range'].includes(target.type);
        return false;
    }

    function editorOpen() {
        return (window.CLIFTNodeEditor && CLIFTNodeEditor.isOpen) || (window.CLIFTSceneEditor && CLIFTSceneEditor.isOpen);
    }

    CLIFT.keyboard = {
        KEYMAP,

        groups() {
            const groups = [];
            for (const k of KEYMAP) {
                let g = groups.find(x => x.name === k.group);
                if (!g) groups.push(g = { name: k.group, keys: [] });
                g.keys.push(k);
            }
            return groups;
        },

        handle(ev) {
            if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
            if (isTyping(ev.target) || editorOpen()) return;
            // Range sliders keep their arrow keys.
            if (ev.target.type === 'range' && ev.code.startsWith('Arrow')) return;
            // Inside an open dialog only Esc is handled (by us) - everything else is ignored.
            if (document.querySelector('dialog[open]') && ev.code !== 'Escape') return;

            const entry = KEYMAP.find(k => matches(k, ev));
            if (!entry) return;
            ev.preventDefault();
            entry.run(ev);
        },

        init() {
            document.addEventListener('keydown', (ev) => this.handle(ev));
        }
    };
})();
