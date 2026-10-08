// Control panel, mixer bar and status bar. All DOM state is derived from the
// engine in sync() (on 'state' events) and onFrame() (meters, previews).

(function () {
    const $ = (id) => document.getElementById(id);
    const { storage } = CLIFT.util;

    function option(value, label) {
        const o = document.createElement('option');
        o.value = value;
        o.textContent = label;
        return o;
    }

    function fillSelect(select, items) {
        select.replaceChildren(...items.map(([value, label]) => option(value, label)));
    }

    function setToggle(el, on, onLabel, offLabel) {
        el.classList.toggle('on', !!on);
        if (onLabel) el.textContent = on ? onLabel : offLabel;
    }

    const ui = {
        init(engine) {
            this.e = engine;
            this.browseBank = CLIFT.catalog.bankIndexOf(engine.deck().sceneId);
            this.listKey = '';

            this.buildStatic();
            this.bindTopbar();
            this.bindScenes();
            this.bindDeck();
            this.bindFx();
            this.bindPostFx();
            this.bindAudio();
            this.bindTempo();
            this.bindAuto();
            this.bindOutput();
            this.bindSession();
            this.bindMixer();
            this.bindDialogs();
            this.bindDragDrop();
            this.bindSnapshots();
            this.bindText();
            this.bindMidi();
            this.bindVfx();
            this.bindBeats();

            // Mouse-clicked buttons keep focus, so a later Space/Enter would
            // "click" them again on top of the shortcut. Drop focus after clicks.
            document.addEventListener('click', (ev) => {
                const btn = ev.target.closest('button');
                if (btn && ev.detail > 0) btn.blur();
            });

            CLIFT.events.on('state', () => this.sync());
            CLIFT.events.on('crossfader', (v) => this.syncCrossfader(v));
            CLIFT.events.on('catalog-changed', () => { this.buildBanks(); this.listKey = ''; this.sync(); });
            CLIFT.events.on('frame', () => this.onFrame());
            CLIFT.events.on('audio-source', () => this.syncAudio());
            CLIFT.events.on('ws-status', (s) => this.syncWs(s));
            CLIFT.events.on('midi', () => this.syncMidi());
            CLIFT.events.on('midi-activity', () => this.midiActivity());
            CLIFT.events.on('scene-error', ({ id }) => {
                this.toast(`Scene ${id} "${CLIFT.catalog.name(id)}" crashed and was skipped`, 'error');
                this.listKey = '';
                this.renderSceneList();
            });

            for (const el of document.querySelectorAll('.section[data-section]')) {
                const saved = storage.get('clift-ui-' + el.dataset.section);
                if (saved !== null) el.open = saved;
                el.addEventListener('toggle', () => storage.set('clift-ui-' + el.dataset.section, el.open));
            }
            if (storage.get('clift-ui-panel-closed')) document.body.classList.add('panel-closed');

            this.sync();
            this.syncCrossfader(engine.crossfader);
            this.syncAudio();
            this.syncWs(CLIFT.ws.status);
            this.syncMidi();
        },

        // ---- helpers --------------------------------------------------------------

        toast(message, kind = 'info', ms = 2600) {
            const el = document.createElement('div');
            el.className = 'toast' + (kind === 'error' ? ' error' : '');
            el.textContent = message;
            $('toasts').appendChild(el);
            setTimeout(() => el.classList.add('out'), ms);
            setTimeout(() => el.remove(), ms + 400);
        },

        toggleUI() {
            document.body.classList.toggle('hide-ui');
        },

        togglePanel() {
            const closed = document.body.classList.toggle('panel-closed');
            storage.set('clift-ui-panel-closed', closed);
        },

        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => this.toast('Fullscreen was blocked', 'error'));
            } else {
                document.exitFullscreen();
            }
        },

        toggleOutputWindow() {
            try {
                const open = CLIFT.outputWindow.toggle();
                if (open) this.toast('Projector window open: drag it to the projector, double-click for fullscreen', 'info', 4500);
            } catch (err) {
                this.toast(err.message, 'error', 4500);
            }
        },

        openDialog(id) {
            const d = $(id);
            if (!d.open) d.showModal();
        },

        closeDialogs() {
            let closed = false;
            for (const d of document.querySelectorAll('dialog[open]')) {
                d.close();
                closed = true;
            }
            return closed;
        },

        // ---- static content ---------------------------------------------------------

        buildStatic() {
            const e = this.e;
            this.buildBanks();
            fillSelect($('gradient-select'), CLIFT.palette.gradients.map((g, i) => [i, g]));
            fillSelect($('effect-select'), e.effects.map((n, i) => [i, n]));
            fillSelect($('render-select'), e.renderModes.map((n, i) => [i, n]));
            fillSelect($('color-mode-select'), e.colorModes.map((n, i) => [i, n]));
            fillSelect($('mix-select'), e.mixModes.map((n, i) => [i, n]));
            fillSelect($('transition-beats'), e.transitionBeatOptions.map(b => [b, `${b} beat${b > 1 ? 's' : ''}`]));
            fillSelect($('res-select'), e.resolutions.map(([w, h], i) => [i, `${w} × ${h}`]));
            fillSelect($('postfx-style'), CLIFT.output.styleNames.map(n => [n, n]));
            fillSelect($('auto-phrase'), CLIFT.director.phrases.map(b => [b, `${b} beats`]));

            for (const which of ['primary', 'secondary']) {
                const box = $(`${which}-swatches`);
                for (let id = 1; id <= CLIFT.palette.count; id++) {
                    const pair = CLIFT.palette.pair(id);
                    const b = document.createElement('button');
                    b.className = 'swatch';
                    b.dataset.color = id;
                    b.title = pair.name;
                    b.style.background = pair.fg === '#000000' ? pair.bg : pair.fg;
                    if (pair.fg === '#000000') {
                        b.textContent = 'A';
                        b.style.color = '#000';
                        b.style.fontSize = '10px';
                        b.style.fontWeight = 'bold';
                    }
                    box.appendChild(b);
                }
            }

            const presets = $('postfx-presets');
            for (const name of CLIFT.output.presetNames) {
                const b = document.createElement('button');
                b.textContent = name;
                b.dataset.preset = name;
                presets.appendChild(b);
            }

            const opts = $('auto-options');
            for (const [key, label] of Object.entries(CLIFT.automation.optionLabels)) {
                const l = document.createElement('label');
                const c = document.createElement('input');
                c.type = 'checkbox';
                c.dataset.opt = key;
                l.append(c, label);
                opts.appendChild(l);
            }

            $('about-version').textContent = 'v' + CLIFT.version;
            $('about-counts').textContent = `${Object.keys(window.CLIFTScenes).length} scenes, ` +
                `${e.effects.length - 1} effects, ${e.renderModes.length - 1} experimental render modes.`;
        },

        buildBanks() {
            const banks = CLIFT.catalog.allBanks();
            fillSelect($('bank-select'), banks.map((b, i) => [i, `${String(i).padStart(2, '0')} ${b.name}`]));
            this.browseBank = Math.min(this.browseBank, banks.length - 1);
        },

        // ---- bindings ------------------------------------------------------------------

        bindTopbar() {
            $('panel-toggle').onclick = () => this.togglePanel();
            $('help-btn').onclick = () => this.openDialog('help-modal');
            $('fullscreen-btn').onclick = () => this.toggleFullscreen();
        },

        bindScenes() {
            $('bank-select').onchange = (ev) => {
                this.browseBank = Number(ev.target.value);
                $('scene-search').value = '';
                this.renderSceneList();
            };
            $('scene-search').oninput = () => this.renderSceneList();
            $('scene-search').onkeydown = (ev) => {
                if (ev.key === 'Enter') {
                    const first = $('scene-list').querySelector('.scene-item');
                    if (first) this.e.setScene(Number(first.dataset.id));
                } else if (ev.key === 'Escape') {
                    ev.target.value = '';
                    ev.target.blur();
                    this.renderSceneList();
                }
            };
            $('scene-list').onclick = (ev) => {
                const item = ev.target.closest('.scene-item');
                if (!item) return;
                if (ev.target.closest('.fav')) {
                    CLIFT.catalog.toggleFavorite(Number(item.dataset.id));
                    return;
                }
                const deck = ev.shiftKey ? 1 - this.e.activeDeck : this.e.activeDeck;
                this.e.setScene(Number(item.dataset.id), deck);
            };
        },

        bindDeck() {
            $('edit-deck-seg').onclick = (ev) => {
                const b = ev.target.closest('button');
                if (b) this.e.selectDeck(Number(b.dataset.deck));
            };
            for (const which of ['primary', 'secondary']) {
                $(`${which}-swatches`).onclick = (ev) => {
                    const b = ev.target.closest('.swatch');
                    if (b) this.e.setDeckColor(which, Number(b.dataset.color));
                };
            }
            $('gradient-select').onchange = (ev) => {
                this.e.deck().gradientType = Number(ev.target.value);
                CLIFT.events.emit('state');
            };
            $('random-colors').onclick = () => this.e.randomizeColors();
            for (const [id, setter] of [['deck-speed', 'setDeckSpeed'], ['deck-pulse', 'setDeckPulse']]) {
                $(id).oninput = (ev) => {
                    this.e.decks[this.e.activeDeck][id === 'deck-speed' ? 'speed' : 'pulse'] = Number(ev.target.value);
                    this.syncDeckKnobs();
                };
                $(id).onchange = (ev) => this.e[setter](this.e.activeDeck, Number(ev.target.value));
            }
            for (const p of ['param1', 'param2', 'param3']) {
                $(p).oninput = (ev) => {
                    this.e.deck().params[p] = Number(ev.target.value);
                    $(`${p}-val`).textContent = Number(ev.target.value).toFixed(2);
                };
                $(p).onchange = () => CLIFT.events.emit('state');
            }
        },

        bindFx() {
            const e = this.e;
            $('effect-select').onchange = (ev) => e.setEffect(Number(ev.target.value));
            $('effect-prev').onclick = () => e.setEffect(e.currentEffect - 1);
            $('effect-next').onclick = () => e.setEffect(e.currentEffect + 1);
            $('render-select').onchange = (ev) => e.setRenderMode(Number(ev.target.value));
            $('color-mode-select').onchange = (ev) => { e.colorMode = Number(ev.target.value); CLIFT.events.emit('state'); };
            $('color-toggle').onclick = () => { e.colorEnabled = !e.colorEnabled; CLIFT.events.emit('state'); };
            $('invert-toggle').onclick = () => { e.invertColors = !e.invertColors; CLIFT.events.emit('state'); };
        },

        bindPostFx() {
            const out = CLIFT.output;
            if (!out.supported) {
                $('postfx-unsupported').hidden = false;
                for (const el of $('panel').querySelectorAll('[data-section="postfx"] button, [data-section="postfx"] input, [data-section="postfx"] select')) {
                    el.disabled = true;
                }
                return;
            }
            $('postfx-toggle').onclick = () => out.toggle();
            $('postfx-presets').onclick = (ev) => {
                const b = ev.target.closest('button');
                if (b) out.applyPreset(b.dataset.preset);
            };
            $('postfx-style').onchange = (ev) => out.set('style', ev.target.value);
            for (const key of ['glow', 'glowSize', 'scanlines', 'vignette', 'chroma']) {
                const input = $(`fx-${key}`);
                input.oninput = () => {
                    out.options[key] = Number(input.value);
                    out.preset = '';
                    input.nextElementSibling.textContent = Number(input.value).toFixed(1);
                };
                input.onchange = () => {
                    if (!out.options.enabled) out.set('enabled', true);
                    CLIFT.events.emit('state');
                };
            }
        },

        bindAudio() {
            const audio = CLIFT.audio;
            $('audio-source-seg').onclick = async (ev) => {
                const b = ev.target.closest('button');
                if (!b) return;
                if (b.dataset.source === 'demo') audio.useDemo();
                else if (b.dataset.source === 'mic') await this.startMic();
                else $('audio-file').click();
            };
            $('audio-file').onchange = (ev) => {
                const file = ev.target.files[0];
                if (file) this.startAudioFile(file);
                ev.target.value = '';
            };
            $('audio-device').onchange = (ev) => this.startMic(ev.target.value);
            const gain = $('audio-gain');
            gain.oninput = () => {
                audio.setGain(Number(gain.value));
                gain.nextElementSibling.textContent = Number(gain.value).toFixed(1);
            };
            gain.onchange = () => CLIFT.events.emit('state');
            $('auto-level').onchange = (ev) => audio.setAutoLevel(ev.target.checked);
            this.meterBars = Array.from($('meters').querySelectorAll('.meter i'));
        },

        async startMic(deviceId) {
            const err = $('audio-error');
            try {
                await CLIFT.audio.startMic(deviceId);
                err.hidden = true;
                const inputs = await CLIFT.audio.listInputs();
                const select = $('audio-device');
                fillSelect(select, inputs.map(d => [d.id, d.label]));
                const current = CLIFT.audio.stream && CLIFT.audio.stream.getAudioTracks()[0];
                const settings = current && current.getSettings ? current.getSettings() : {};
                if (settings.deviceId) select.value = settings.deviceId;
                select.hidden = inputs.length < 2;
                this.toast('Audio input live');
            } catch (e) {
                const msg = e.name === 'NotAllowedError' ? 'Microphone permission was denied in the browser'
                    : e.name === 'NotFoundError' ? 'No audio input device found' : e.message;
                err.textContent = msg;
                err.hidden = false;
                this.toast(msg, 'error', 4000);
                CLIFT.audio.useDemo();
            }
        },

        async startAudioFile(file) {
            try {
                await CLIFT.audio.startFile(file);
                $('audio-error').hidden = true;
                this.toast(`Playing ${file.name}`);
            } catch (e) {
                this.toast(`Could not play ${file.name}: ${e.message}`, 'error', 4000);
                CLIFT.audio.useDemo();
            }
        },

        bindTempo() {
            const e = this.e;
            $('bpm-input').onchange = (ev) => e.setBPM(Number(ev.target.value) || e.bpm);
            $('tap-btn').onclick = () => e.tap();
            $('bpm-sync').onclick = () => {
                if (CLIFT.audio.detectedBPM) e.setBPM(CLIFT.audio.detectedBPM);
                else this.toast('No tempo detected yet');
            };
        },

        bindAuto() {
            const auto = CLIFT.director;
            $('auto-toggle').onclick = () => auto.toggle();
            $('auto-phrase').onchange = (ev) => { auto.phrase = Number(ev.target.value); CLIFT.events.emit('state'); };
            const intensity = $('auto-intensity');
            intensity.oninput = () => {
                auto.intensity = Number(intensity.value);
                intensity.nextElementSibling.textContent = this.intensityLabel(auto.intensity);
            };
            intensity.onchange = () => CLIFT.events.emit('state');
            $('auto-options').onchange = (ev) => {
                const key = ev.target.dataset.opt;
                if (key) { auto.options[key] = ev.target.checked; CLIFT.events.emit('state'); }
            };
        },

        bindOutput() {
            const e = this.e;
            $('res-select').onchange = (ev) => {
                const [w, h] = e.resolutions[Number(ev.target.value)];
                e.setResolution(w, h);
            };
            $('output-window-btn').onclick = () => this.toggleOutputWindow();
            $('renderer-select').onchange = (ev) => CLIFT.output.setRenderer(ev.target.value);
            if (!CLIFT.output.supported) $('renderer-select').disabled = true;
            $('pause-toggle').onclick = () => e.togglePause();
            $('record-toggle').onclick = () => this.toggleRecording();
        },

        toggleRecording() {
            try {
                const on = CLIFT.recorder.toggle();
                this.toast(on ? 'Recording…' : 'Recording saved to downloads');
            } catch (err) {
                this.toast(err.message, 'error');
            }
        },

        bindSession() {
            $('session-save').onclick = () => {
                CLIFT.session.exportFile('session');
                this.toast('Session file downloaded');
            };
            $('session-load').onclick = () => $('session-file').click();
            $('session-file').onchange = (ev) => {
                const file = ev.target.files[0];
                if (file) this.loadSessionFile(file);
                ev.target.value = '';
            };
            $('session-reset').onclick = () => {
                if (!confirm('Reset CLIFT to its default settings?')) return;
                CLIFT.session.reset();
            };
            $('node-editor-btn').onclick = () => this.openEditor('node');
            $('code-editor-btn').onclick = () => this.openEditor('code');
            $('ws-url').value = CLIFT.ws.url;
            $('ws-url').onchange = (ev) => CLIFT.ws.setUrl(ev.target.value);
            $('ws-toggle').onclick = () => CLIFT.ws.toggle();
            $('about-btn').onclick = () => this.openDialog('about-modal');
        },

        loadSessionFile(file) {
            CLIFT.session.importFile(file)
                .then(() => this.toast(`Loaded ${file.name}`))
                .catch(err => this.toast(`Could not load ${file.name}: ${err.message}`, 'error', 4000));
        },

        openEditor(kind) {
            const editor = kind === 'node' ? window.CLIFTNodeEditor : window.CLIFTSceneEditor;
            if (editor && editor.open) {
                this.closeDialogs();
                // The code editor opens the edit deck's scene (built-ins as an editable copy).
                if (kind === 'code') editor.open(this.e.deck().sceneId);
                else editor.open();
            } else {
                this.toast('Editor failed to load - see console', 'error');
            }
        },

        bindMixer() {
            const e = this.e;
            for (const i of [0, 1]) {
                const card = $(`deck-card-${i}`);
                card.onclick = (ev) => {
                    const step = ev.target.closest('[data-step]');
                    if (step) e.stepScene(Number(step.dataset.step), i);
                    else e.selectDeck(i);
                };
            }
            const xf = $('crossfader');
            xf.oninput = () => {
                e.transition = null;
                e.setCrossfader(Number(xf.value) / 1000);
            };
            $('xf-a').onclick = () => { e.transition = null; e.setCrossfader(0); };
            $('xf-b').onclick = () => { e.transition = null; e.setCrossfader(1); };
            $('mix-select').onchange = (ev) => { e.mixMode = Number(ev.target.value); CLIFT.events.emit('state'); };
            $('transition-btn').onclick = () => e.startTransition();
            $('transition-beats').onchange = (ev) => { e.transitionBeats = Number(ev.target.value); CLIFT.events.emit('state'); };
            this.previewCtx = [0, 1].map(i => $(`deck-preview-${i}`).getContext('2d'));
        },

        bindSnapshots() {
            const box = $('snapshot-slots');
            for (let i = 0; i < CLIFT.snapshots.SLOTS; i++) {
                const b = document.createElement('button');
                b.className = 'snap';
                b.dataset.slot = i;
                b.textContent = i + 1;
                box.appendChild(b);
            }
            const flash = (b) => { b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 180); };
            box.onclick = (ev) => {
                const b = ev.target.closest('.snap');
                if (!b) return;
                const i = Number(b.dataset.slot);
                if (ev.shiftKey || !CLIFT.snapshots.slots[i]) {
                    CLIFT.snapshots.save(i);
                    this.toast(`Saved snapshot ${i + 1}`);
                } else {
                    CLIFT.snapshots.recall(i);
                }
                flash(b);
            };
            box.oncontextmenu = (ev) => {
                const b = ev.target.closest('.snap');
                if (!b) return;
                ev.preventDefault();
                CLIFT.snapshots.clear(Number(b.dataset.slot));
            };
        },

        bindText() {
            const t = CLIFT.textOverlay;
            fillSelect($('text-mode'), t.modes.map(m => [m, m]));
            fillSelect($('text-color'), CLIFT.palette.pairs.slice(1).map((p, i) => [i + 1, p.name]));
            const input = $('text-input');
            input.value = t.text;
            input.oninput = () => t.set('text', input.value);
            input.onkeydown = (ev) => {
                if (ev.key === 'Enter') { t.toggle(true); input.blur(); }
                if (ev.key === 'Escape') input.blur();
            };
            $('text-toggle').onclick = () => t.toggle();
            $('text-mode').onchange = (ev) => t.set('mode', ev.target.value);
            $('text-color').onchange = (ev) => t.set('color', Number(ev.target.value));
            $('text-pulse').onchange = (ev) => t.set('pulse', ev.target.checked);
        },

        bindMidi() {
            const midi = CLIFT.midi;
            $('midi-enable').onclick = async () => {
                try {
                    await midi.enable();
                    this.toast(midi.inputs.length ? `MIDI: ${midi.inputs.join(', ')}` : 'MIDI enabled - no device connected yet');
                } catch (err) {
                    midi.error = err.message;
                    this.toast(err.message, 'error', 4500);
                    this.syncMidi();
                }
            };
            $('midi-map-btn').onclick = () => {
                this.renderMidiTable();
                this.openDialog('midi-modal');
            };
            $('midi-modal').addEventListener('close', () => { if (midi.learning) midi.learn(null); });
            $('midi-clock').onchange = (ev) => midi.setClockSync(ev.target.checked);
            $('midi-clear').onclick = () => {
                if (confirm('Remove all MIDI mappings?')) midi.clearAll();
            };
            $('midi-table').onclick = (ev) => {
                const b = ev.target.closest('button');
                if (!b) return;
                if (b.dataset.learn) midi.learn(b.dataset.learn);
                else if (b.dataset.unbind) midi.unbind(b.dataset.unbind);
            };
        },

        renderMidiTable() {
            const midi = CLIFT.midi;
            const rows = [];
            let lastType = '';
            for (const t of midi.TARGETS) {
                if (t.type !== lastType) {
                    lastType = t.type;
                    const h = document.createElement('div');
                    h.className = 'midi-head';
                    h.textContent = t.type === 'range' ? 'Knobs & faders' : 'Pads & buttons';
                    rows.push(h);
                }
                const name = document.createElement('span');
                name.textContent = t.label;
                const key = midi.bindingFor(t.id);
                const bind = document.createElement('span');
                bind.className = 'bind' + (key ? '' : ' none');
                bind.textContent = key ? midi.describe(key) : '-';
                const learn = document.createElement('button');
                learn.dataset.learn = t.id;
                learn.textContent = midi.learning === t.id ? 'Waiting…' : 'Learn';
                learn.classList.toggle('learning', midi.learning === t.id);
                learn.disabled = !midi.enabled;
                const del = document.createElement('button');
                del.dataset.unbind = t.id;
                del.textContent = '✕';
                del.title = 'Remove mapping';
                del.disabled = !key;
                rows.push(name, bind, learn, del);
            }
            $('midi-table').replaceChildren(...rows);
        },

        syncMidi() {
            const midi = CLIFT.midi;
            const mapped = Object.keys(midi.bindings).length;
            $('midi-state').textContent = midi.enabled ? `${midi.inputs.length} in` : 'off';
            $('midi-state').classList.toggle('on', midi.enabled);
            $('midi-enable').textContent = midi.enabled ? 'MIDI on' : 'Enable MIDI';
            $('midi-enable').classList.toggle('on', midi.enabled);
            $('midi-info').textContent = midi.error ? midi.error
                : midi.enabled ? `${midi.inputs.length ? midi.inputs.join(', ') : 'No device connected'} · ${mapped} mapping${mapped === 1 ? '' : 's'}`
                    : `${mapped} saved mapping${mapped === 1 ? '' : 's'}. Enable to use a controller.`;
            $('midi-clock').checked = midi.clockSync;
            if ($('midi-modal').open) this.renderMidiTable();
        },

        midiActivity() {
            const state = $('midi-state');
            state.classList.add('activity');
            clearTimeout(this.midiTimer);
            this.midiTimer = setTimeout(() => state.classList.remove('activity'), 120);
            if ($('midi-modal').open) $('midi-last').textContent = `Last: ${CLIFT.midi.lastMessage}`;
        },

        intensityLabel(v) {
            return v < 0.25 ? 'calm' : v < 0.5 ? 'easy' : v < 0.75 ? 'lively' : 'wild';
        },

        syncAutoStatus() {
            const auto = CLIFT.director;
            const el = $('auto-status');
            if (!auto.enabled) {
                $('auto-state').textContent = 'off';
                el.textContent = 'Follows the music: sections, phrases and drops.';
                return;
            }
            const st = auto.status();
            $('auto-state').textContent = st.section;
            el.replaceChildren();
            const sec = document.createElement('span');
            sec.className = 'sec ' + st.section;
            sec.textContent = st.section;
            const bar = document.createElement('span');
            bar.className = 'bar';
            bar.title = 'Energy against the track\'s recent peak';
            const fill = document.createElement('i');
            fill.style.width = `${Math.round(Math.min(1, st.energy) * 100)}%`;
            bar.appendChild(fill);
            const next = document.createElement('span');
            next.textContent = `next in ${st.nextIn}`;
            el.append(sec, bar, next);
        },

        // ---- visual FX ------------------------------------------------------------

        bindVfx() {
            const fx = CLIFT.fx;
            const looks = $('vfx-looks');
            for (const name of fx.lookNames) {
                const b = document.createElement('button');
                b.textContent = name;
                b.dataset.look = name;
                looks.appendChild(b);
            }
            looks.onclick = (ev) => {
                const b = ev.target.closest('button');
                if (b) fx.applyLook(b.dataset.look);
            };
            fillSelect($('vfx-grid'), fx.GRIDS.map((g, i) => [i, g.name]));
            $('vfx-grid').onchange = (ev) => fx.set('grid', Number(ev.target.value));
            fillSelect($('vfx-split'), fx.SPLITS.map((n, i) => [i, n]));
            $('vfx-split').onchange = (ev) => { fx.set('split', Number(ev.target.value)); fx.resplit(); };
            fillSelect($('vfx-split-every'), fx.SPLIT_EVERY.map(n => [n, n ? `every ${n}` : 'on hits']));
            $('vfx-split-every').onchange = (ev) => fx.set('splitEvery', Number(ev.target.value));

            const SLIDERS = [
                ['sliceAmount', 'Slice shift', 0, 1, 0.05],
                ['glitch', 'Glitch', 0, 1, 0.05],
                ['shatter', 'Shatter', 0, 1, 0.05],
                ['displace', 'Displace', 0, 1, 0.05],
                ['liquid', 'Liquid', 0, 1, 0.05],
                ['feedback', 'Feedback', 0, 0.97, 0.01],
                ['fbZoom', 'Trail zoom', -0.1, 0.1, 0.005],
                ['fbRotate', 'Trail spin', -1, 1, 0.05],
                ['fbHue', 'Trail hue', 0, 1, 0.05],
                ['fbLevel', 'Trail by level', 0, 1, 0.05],
                ['bassZoom', 'Bass zoom', 0, 1, 0.05],
                ['spin', 'Spin', -1, 1, 0.05],
                ['wave', 'Wave', 0, 1, 0.05],
                ['pixelate', 'Pixelate', 0, 1, 0.05],
                ['hueSpeed', 'Hue cycle', 0, 1, 0.05],
                ['posterize', 'Posterize', 0, 1, 0.05]
            ];
            const box = $('vfx-sliders');
            this.vfxInputs = {};
            for (const [key, label, min, max, step] of SLIDERS) {
                const l = document.createElement('label');
                l.className = 'slider';
                const span = document.createElement('span');
                span.textContent = label;
                const input = document.createElement('input');
                Object.assign(input, { type: 'range', min, max, step });
                const out = document.createElement('output');
                l.append(span, input, out);
                box.appendChild(l);
                input.oninput = () => {
                    fx.settings[key] = Number(input.value);
                    fx.look = '';
                    out.textContent = Number(input.value).toFixed(2);
                };
                input.onchange = () => CLIFT.events.emit('state');
                this.vfxInputs[key] = input;
            }

            const hits = $('vfx-hits');
            for (const [kind, label] of [['explode', 'explode'], ['shock', 'shock'], ['glitch', 'glitch'], ['split', 'split'],
                ['strobe', 'strobe'], ['invert', 'invert'], ['punch', 'punch'], ['hueJump', 'hue'], ['burst', 'burst']]) {
                const b = document.createElement('button');
                b.textContent = label;
                b.dataset.hit = kind;
                hits.appendChild(b);
            }
            hits.onclick = (ev) => {
                const b = ev.target.closest('button');
                if (b) fx.hit(b.dataset.hit);
            };
            $('vfx-reset').onclick = () => fx.reset();

            if (!CLIFT.output.supported) {
                $('vfx-unsupported').hidden = false;
                for (const el of $('panel').querySelectorAll('[data-section="vfx"] button, [data-section="vfx"] input, [data-section="vfx"] select')) el.disabled = true;
            }
        },

        syncVfx() {
            const fx = CLIFT.fx;
            for (const b of $('vfx-looks').children) b.classList.toggle('on', b.dataset.look === fx.look);
            $('vfx-grid').value = fx.settings.grid;
            $('vfx-split').value = fx.settings.split;
            $('vfx-split-every').value = fx.settings.splitEvery;
            for (const [key, input] of Object.entries(this.vfxInputs)) {
                input.value = fx.settings[key];
                input.nextElementSibling.textContent = Number(fx.settings[key]).toFixed(2);
            }
            const on = fx.active;
            $('vfx-state').textContent = on ? (fx.look || 'custom') : 'off';
            $('vfx-state').classList.toggle('on', on);
        },

        // ---- beat actions --------------------------------------------------------

        bindBeats() {
            const ba = CLIFT.beatActions;
            const box = $('beat-actions');
            for (const a of ba.ACTIONS) {
                const l = document.createElement('label');
                const c = document.createElement('input');
                c.type = 'checkbox';
                c.dataset.action = a.id;
                l.append(c, a.label);
                const sel = document.createElement('select');
                sel.dataset.every = a.id;
                fillSelect(sel, ba.EVERY.map(n => [n, n === 1 ? 'every beat' : `every ${n}`]));
                box.append(l, sel);
            }
            box.onchange = (ev) => {
                const t = ev.target;
                if (t.dataset.action) ba.set(t.dataset.action, 'on', t.checked);
                if (t.dataset.every) ba.set(t.dataset.every, 'every', Number(t.value));
            };
            $('beats-source').onchange = (ev) => ba.setSource(ev.target.value);
            $('beats-off').onclick = () => ba.allOff();
        },

        syncBeats() {
            const ba = CLIFT.beatActions;
            $('beats-source').value = ba.source;
            for (const c of $('beat-actions').querySelectorAll('input')) c.checked = ba.config[c.dataset.action].on;
            for (const sel of $('beat-actions').querySelectorAll('select')) sel.value = ba.config[sel.dataset.every].every;
            const n = ba.ACTIONS.filter(a => ba.config[a.id].on).length;
            $('beats-state').textContent = n ? `${n} on` : 'off';
            $('beats-state').classList.toggle('on', n > 0);
        },

        bindDialogs() {
            for (const d of document.querySelectorAll('dialog')) {
                d.addEventListener('click', (ev) => {
                    if (ev.target === d || ev.target.closest('[data-close]')) d.close();
                });
            }
            const table = $('keys-table');
            for (const group of CLIFT.keyboard.groups()) {
                const g = document.createElement('div');
                g.className = 'key-group';
                const h = document.createElement('h3');
                h.textContent = group.name;
                g.appendChild(h);
                for (const k of group.keys) {
                    const row = document.createElement('div');
                    row.className = 'key-row';
                    const kbd = document.createElement('kbd');
                    kbd.textContent = k.label;
                    const span = document.createElement('span');
                    span.textContent = k.desc;
                    row.append(kbd, span);
                    g.appendChild(row);
                }
                table.appendChild(g);
            }
        },

        // Drop an audio file to play it, or a .json session to load it.
        bindDragDrop() {
            window.addEventListener('dragover', (ev) => ev.preventDefault());
            window.addEventListener('drop', (ev) => {
                ev.preventDefault();
                const file = ev.dataTransfer.files[0];
                if (!file) return;
                if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(file.name)) {
                    this.startAudioFile(file);
                } else if (file.name.endsWith('.json')) {
                    this.loadSessionFile(file);
                } else {
                    this.toast(`Don't know what to do with ${file.name}`, 'error');
                }
            });
        },

        // ---- sync -------------------------------------------------------------------

        sync() {
            const e = this.e;
            const deck = e.deck();
            const deckLetter = e.activeDeck ? 'B' : 'A';

            // scene browser follows the edit deck's bank
            const bank = CLIFT.catalog.bankIndexOf(deck.sceneId);
            if (bank !== this.lastDeckBank || e.activeDeck !== this.lastActiveDeck) {
                this.browseBank = bank;
                this.lastDeckBank = bank;
                this.lastActiveDeck = e.activeDeck;
            }
            $('bank-select').value = this.browseBank;
            this.renderSceneList();

            $('edit-deck-label').textContent = deckLetter;
            for (const b of $('edit-deck-seg').children) b.classList.toggle('on', Number(b.dataset.deck) === e.activeDeck);
            for (const which of ['primary', 'secondary']) {
                const current = which === 'primary' ? deck.primaryColor : deck.secondaryColor;
                for (const b of $(`${which}-swatches`).children) b.classList.toggle('on', Number(b.dataset.color) === current);
            }
            $('gradient-select').value = deck.gradientType;
            this.syncDeckKnobs();
            for (const p of ['param1', 'param2', 'param3']) {
                $(p).value = deck.params[p];
                $(`${p}-val`).textContent = deck.params[p].toFixed(2);
            }
            const usesParams = CLIFT.catalog.usesParams(deck.sceneId);
            $('param-sliders').hidden = !usesParams;
            $('param-hint').textContent = usesParams
                ? 'Params 1-3 tune this scene (speed, density, shape…).'
                : 'Speed and Pulse work on every scene. This one has no extra params.';
            $('auto-level').checked = CLIFT.audio.autoLevel;

            $('effect-select').value = e.currentEffect;
            $('render-select').value = e.renderMode;
            $('color-mode-select').value = e.colorMode;
            setToggle($('color-toggle'), e.colorEnabled);
            setToggle($('invert-toggle'), e.invertColors);

            const out = CLIFT.output;
            setToggle($('postfx-toggle'), out.options.enabled, 'Enabled', 'Enable');
            $('postfx-state').textContent = out.options.enabled ? (out.preset || 'custom') : 'off';
            $('postfx-state').classList.toggle('on', out.options.enabled);
            for (const b of $('postfx-presets').children) b.classList.toggle('on', b.dataset.preset === out.preset && out.options.enabled);
            $('postfx-style').value = out.options.style;
            for (const key of ['glow', 'glowSize', 'scanlines', 'vignette', 'chroma']) {
                const input = $(`fx-${key}`);
                input.value = out.options[key];
                input.nextElementSibling.textContent = Number(out.options[key]).toFixed(1);
            }

            $('audio-gain').value = CLIFT.audio.gain;
            $('audio-gain').nextElementSibling.textContent = CLIFT.audio.gain.toFixed(1);

            if (document.activeElement !== $('bpm-input')) $('bpm-input').value = e.bpm;
            $('stat-bpm').textContent = e.bpm;

            const auto = CLIFT.director;
            setToggle($('auto-toggle'), auto.enabled, 'Auto ON', 'Full Auto');
            $('auto-state').classList.toggle('on', auto.enabled);
            $('badge-auto').hidden = !auto.enabled;
            $('auto-phrase').value = auto.phrase;
            $('auto-intensity').value = auto.intensity;
            $('auto-intensity').nextElementSibling.textContent = this.intensityLabel(auto.intensity);
            this.syncAutoStatus();
            this.syncVfx();
            this.syncBeats();
            for (const c of $('auto-options').querySelectorAll('input')) c.checked = !!auto.options[c.dataset.opt];

            const snaps = CLIFT.snapshots;
            for (const b of $('snapshot-slots').children) {
                const i = Number(b.dataset.slot);
                b.classList.toggle('filled', !!snaps.slots[i]);
                b.title = snaps.label(i);
            }

            const t = CLIFT.textOverlay;
            setToggle($('text-toggle'), t.enabled, 'Showing', 'Show');
            $('text-state').textContent = t.enabled ? t.mode : 'off';
            $('text-state').classList.toggle('on', t.enabled);
            $('text-mode').value = t.mode;
            $('text-color').value = t.color;
            $('text-pulse').checked = t.pulse;
            if (document.activeElement !== $('text-input')) $('text-input').value = t.text;

            setToggle($('output-window-btn'), CLIFT.outputWindow.isOpen, 'Close projector window', 'Projector window');

            const resIndex = e.resolutions.findIndex(([w, h]) => w === e.width && h === e.height);
            $('res-select').value = resIndex;
            $('stat-res').textContent = `${e.width}×${e.height}`;
            $('renderer-select').value = CLIFT.output.rendererPref;
            $('renderer-select').title = `Currently drawing with ${CLIFT.output.gpuText ? 'WebGL' : 'canvas 2D'}` +
                (CLIFT.output.softwareGL ? ' (WebGL is software-only here)' : '');
            setToggle($('pause-toggle'), e.paused, 'Paused', 'Pause');
            $('badge-pause').hidden = !e.paused;
            setToggle($('record-toggle'), CLIFT.recorder.recording, 'Stop rec', 'Record');
            $('badge-rec').hidden = !CLIFT.recorder.recording;

            $('mix-select').value = e.mixMode;
            $('transition-beats').value = e.transitionBeats;
            for (const i of [0, 1]) {
                const d = e.decks[i];
                $(`deck-name-${i}`).textContent = CLIFT.catalog.name(d.sceneId);
                $(`deck-bank-${i}`).textContent = CLIFT.catalog.allBanks()[CLIFT.catalog.bankIndexOf(d.sceneId)].name;
                $(`deck-card-${i}`).classList.toggle('editing', i === e.activeDeck);
            }
        },

        syncDeckKnobs() {
            const deck = this.e.deck();
            $('deck-speed').value = deck.speed;
            $('deck-speed-val').textContent = `${Math.pow(2, (deck.speed - 0.5) * 4).toFixed(2)}x`;
            $('deck-pulse').value = deck.pulse;
            $('deck-pulse-val').textContent = deck.pulse.toFixed(2);
        },

        renderSceneList() {
            const e = this.e;
            const query = $('scene-search').value;
            const ids = query.trim() ? CLIFT.catalog.search(query)
                : CLIFT.catalog.allBanks()[this.browseBank].ids;
            const key = `${query}|${this.browseBank}|${ids.length}`;
            const list = $('scene-list');

            if (key !== this.listKey) {
                this.listKey = key;
                const searching = !!query.trim();
                list.replaceChildren(...ids.map((id, i) => {
                    const b = document.createElement('button');
                    b.className = 'scene-item';
                    b.dataset.id = id;
                    const num = document.createElement('span');
                    num.className = 'num';
                    num.textContent = searching ? id : i + 1;
                    const nm = document.createElement('span');
                    nm.className = 'nm';
                    nm.textContent = CLIFT.catalog.name(id);
                    const fav = document.createElement('span');
                    fav.className = 'fav';
                    fav.textContent = '★';
                    fav.title = 'Favorite';
                    b.append(fav, num, nm);
                    if (searching) {
                        const hint = document.createElement('span');
                        hint.className = 'bank-hint';
                        hint.textContent = CLIFT.catalog.allBanks()[CLIFT.catalog.bankIndexOf(id)].name;
                        b.appendChild(hint);
                    }
                    b.title = `#${id} - ${i < 10 && !searching ? `key ${(i + 1) % 10}, ` : ''}shift+click for the other deck`;
                    return b;
                }));
            }

            for (const item of list.children) {
                const id = Number(item.dataset.id);
                item.classList.toggle('broken', CLIFT.catalog.broken.has(id));
                item.querySelector('.fav').classList.toggle('on', CLIFT.catalog.favorites.has(id));
                for (const [i, cls] of [[0, 'tag-a'], [1, 'tag-b']]) {
                    let tag = item.querySelector('.' + cls);
                    const on = e.decks[i].sceneId === id;
                    if (on && !tag) {
                        tag = document.createElement('span');
                        tag.className = 'tag ' + cls;
                        tag.textContent = i ? 'B' : 'A';
                        item.insertBefore(tag, item.querySelector('.bank-hint'));
                    } else if (!on && tag) {
                        tag.remove();
                    }
                }
            }
        },

        syncCrossfader(v) {
            const xf = $('crossfader');
            if (document.activeElement !== xf) xf.value = Math.round(v * 1000);
            $('deck-card-0').classList.toggle('on-air', v < 1);
            $('deck-card-1').classList.toggle('on-air', v > 0);
        },

        syncAudio() {
            const audio = CLIFT.audio;
            for (const b of $('audio-source-seg').children) b.classList.toggle('on', b.dataset.source === audio.source);
            $('audio-state').textContent = audio.source === 'mic' ? 'live' : audio.source;
            $('audio-state').classList.toggle('on', audio.live);
            $('stat-audio').textContent = audio.describe();
            if (audio.source !== 'mic') $('audio-device').hidden = true;
        },

        syncWs(status) {
            const btn = $('ws-toggle');
            btn.textContent = status === 'online' ? 'Online' : status === 'connecting' ? 'Connecting…' : 'Connect';
            btn.classList.toggle('on', status === 'online');
        },

        // ---- per-frame --------------------------------------------------------------

        onFrame() {
            const e = this.e;
            if (document.body.classList.contains('hide-ui')) return;
            const a = e.audioFrame;
            if (a) {
                const b = a.bands;
                const levels = [b.bass, b.lowMid, b.mid, b.highMid, b.treble, a.beat.intensity];
                for (let i = 0; i < 6; i++) {
                    this.meterBars[i].style.transform = `scaleY(${Math.max(0.03, Math.min(1, levels[i]))})`;
                }
            }

            const dots = $('beat-dots').children;
            const beatIndex = e.clock.count % 4;
            const lit = e.clock.phase < 0.25;
            for (let i = 0; i < 4; i++) dots[i].classList.toggle('on', lit && i === beatIndex);

            if (e.frameCount % 2 === 0) {
                this.drawPreview(0, e.bufferA, e.colorBufferA);
                this.drawPreview(1, e.bufferB, e.colorBufferB);
            }

            if (e.frameCount % 10 === 0) {
                if (CLIFT.director.enabled) {
                    this.syncAutoStatus();
                    this.syncVfx(); // the Director keeps moving the FX sliders
                }
            }
            if (e.frameCount % 15 === 0) {
                $('stat-fps').textContent = `${e.fps} fps`;
                $('detected-bpm').textContent = CLIFT.audio.detectedBPM || '--';
                if (CLIFT.recorder.recording) {
                    const s = Math.floor(CLIFT.recorder.elapsed);
                    $('rec-time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
                }
            }
        },

        drawPreview(i, buffer, colors) {
            const ctx = this.previewCtx[i];
            const cw = ctx.canvas.width / this.e.width;
            const ch = ctx.canvas.height / this.e.height;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            let lastColor = -1;
            for (let y = 0; y < this.e.height; y++) {
                const row = buffer[y], crow = colors[y];
                for (let x = 0; x < this.e.width; x++) {
                    const c = row[x];
                    if (!c || c === ' ') continue;
                    if (crow[x] !== lastColor) {
                        lastColor = crow[x];
                        const pair = CLIFT.palette.pair(lastColor);
                        ctx.fillStyle = pair.fg === '#000000' ? pair.bg : pair.fg;
                    }
                    ctx.fillRect(x * cw, y * ch, Math.max(1, cw - 0.4), Math.max(1, ch - 0.6));
                }
            }
        }
    };

    CLIFT.ui = ui;
})();
