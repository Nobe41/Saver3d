var DisplayShared = (function () {
    function init() {
        var axesToggle = document.getElementById('display-axes-toggle');
        var gridToggle = document.getElementById('display-grid-toggle');
        var ringsToggle = document.getElementById('display-rings-toggle');
        if (!axesToggle || !gridToggle || !ringsToggle) return;

        var opts = (typeof window !== 'undefined' && window.displayOptions) ? window.displayOptions : null;
        if (opts) {
            axesToggle.checked = opts.showAxes !== false;
            gridToggle.checked = opts.showGrid !== false;
            ringsToggle.checked = opts.showSectionRings !== false;
        }

        function applyDisplayOptions() {
            if (opts) {
                opts.showAxes = !!axesToggle.checked;
                opts.showGrid = !!gridToggle.checked;
                opts.showSectionRings = !!ringsToggle.checked;
            }
            if (typeof SceneSetup3D !== 'undefined' && SceneSetup3D.applyDisplayOptions) SceneSetup3D.applyDisplayOptions();
            if (typeof updateBouteille === 'function') updateBouteille();
        }

        if (!axesToggle.dataset.bound) {
            axesToggle.dataset.bound = '1';
            axesToggle.addEventListener('change', applyDisplayOptions);
        }
        if (!gridToggle.dataset.bound) {
            gridToggle.dataset.bound = '1';
            gridToggle.addEventListener('change', applyDisplayOptions);
        }
        if (!ringsToggle.dataset.bound) {
            ringsToggle.dataset.bound = '1';
            ringsToggle.addEventListener('change', applyDisplayOptions);
        }
    }

    return {
        init: init
    };
})();
