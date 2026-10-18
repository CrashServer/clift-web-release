// Boot: wire the modules together, restore the last session and start rendering.
//
// The boot screen repaints after every step, so if something ever hangs, the
// screen shows where. A start that never reached rendering is remembered: the
// next load skips the saved session and custom scenes (safe mode), so a bad
// saved state can't lock the app. Safe mode on demand: index.html?safe
// (?reset also forgets the saved session).

(function () {
    const fill = document.getElementById('boot-fill');
    const text = document.getElementById('boot-text');
    const BOOT_FLAG = 'clift-booting';
    const params = new URLSearchParams(location.search);

    // Let the browser paint the boot screen between steps.
    const paint = () => new Promise(resolve => setTimeout(resolve, 30));
    const step = async (pct, msg) => {
        fill.style.width = pct + '%';
        text.textContent = msg;
        await paint();
    };

    async function boot() {
        const { storage } = CLIFT.util;
        const lastBootFailed = !!storage.get(BOOT_FLAG);
        const safe = lastBootFailed || params.has('safe') || params.has('reset');
        if (params.has('reset')) CLIFT.session.clearAutosave();
        storage.set(BOOT_FLAG, true);

        await step(20, safe ? 'SAFE MODE - LOADING SCENES...' : 'LOADING SCENES...');
        const restoredCustom = safe ? 0 : CLIFT.custom.load();

        await step(45, 'STARTING OUTPUT...');
        CLIFT.display.init();
        CLIFT.output.init(document.getElementById('stage'));

        await step(60, 'STARTING ENGINE...');
        const engine = new CLIFT.Engine({ container: document.getElementById('stage') });
        CLIFT.engine = engine;
        window.clift = engine; // console / editor access

        CLIFT.director.init(engine);
        CLIFT.beatActions.init();
        CLIFT.fx.init();
        CLIFT.session.init(engine);
        CLIFT.ws.init(engine);
        CLIFT.outputWindow.init();

        await step(80, safe ? 'SAFE MODE - DEFAULT SETTINGS...' : 'RESTORING SESSION...');
        const restored = safe ? false : CLIFT.session.restoreAutosave();

        await step(90, 'STARTING INTERFACE...');
        CLIFT.ui.init(engine);
        CLIFT.keyboard.init();

        await step(95, 'FIRST FRAMES...');
        // The start only counts as good once frames are actually being rendered.
        let frames = 0;
        const off = CLIFT.events.on('frame', () => {
            if (++frames < 30) return;
            off();
            storage.remove(BOOT_FLAG);
        });
        engine.start();

        setTimeout(() => {
            document.getElementById('boot').classList.add('done');
            if (lastBootFailed) {
                CLIFT.ui.toast('The last start did not finish, so this one skipped your saved session and custom scenes. Reload to try them again.', 'error', 9000);
            } else if (safe) {
                CLIFT.ui.toast('Safe mode: default settings, custom scenes not loaded', 'info', 5000);
            }
            if (restored) CLIFT.ui.toast('Restored your last session');
            if (restoredCustom) CLIFT.ui.toast(`${restoredCustom} custom scene${restoredCustom > 1 ? 's' : ''} loaded`);
            CLIFT.ui.toast('Press H for shortcuts');
        }, 350);

        CLIFT.log('booted', { scenes: Object.keys(window.CLIFTScenes).length, safe });
    }

    boot().catch(e => {
        text.textContent = 'BOOT FAILED: ' + e.message + ' - try index.html?safe';
        text.style.color = '#ff0040';
        console.error(e);
    });
})();
