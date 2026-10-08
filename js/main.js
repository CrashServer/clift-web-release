// Boot: wire the modules together, restore the last session and start rendering.

(function () {
    const fill = document.getElementById('boot-fill');
    const text = document.getElementById('boot-text');
    const step = (pct, msg) => { fill.style.width = pct + '%'; text.textContent = msg; };

    function boot() {
        step(20, 'LOADING SCENES...');
        const restoredCustom = CLIFT.custom.load();

        step(45, 'STARTING OUTPUT...');
        CLIFT.display.init();
        CLIFT.output.init(document.getElementById('stage'));

        step(60, 'STARTING ENGINE...');
        const engine = new CLIFT.Engine({ container: document.getElementById('stage') });
        CLIFT.engine = engine;
        window.clift = engine; // console / editor access

        CLIFT.automation.init(engine);
        CLIFT.session.init(engine);
        CLIFT.ws.init(engine);
        CLIFT.outputWindow.init();

        step(80, 'RESTORING SESSION...');
        const restored = CLIFT.session.restoreAutosave();

        step(95, 'READY');
        CLIFT.ui.init(engine);
        CLIFT.keyboard.init();
        engine.start();

        setTimeout(() => {
            document.getElementById('boot').classList.add('done');
            if (restored) CLIFT.ui.toast('Restored your last session');
            if (restoredCustom) CLIFT.ui.toast(`${restoredCustom} custom scene${restoredCustom > 1 ? 's' : ''} loaded`);
            CLIFT.ui.toast('Press H for shortcuts');
        }, 350);

        CLIFT.log('booted', { scenes: Object.keys(window.CLIFTScenes).length });
    }

    try {
        boot();
    } catch (e) {
        text.textContent = 'BOOT FAILED: ' + e.message;
        text.style.color = '#ff0040';
        throw e;
    }
})();
