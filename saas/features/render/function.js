// Orchestration du mode rendu (matériaux + scène).
var RenderFeature = (function () {
    var RULES = (typeof RenderRules !== 'undefined') ? RenderRules : {};
    var IDS = RULES.IDS || {};

    function applyMaterialMode(mode) {
        if (typeof BottleMaterials !== 'undefined' && BottleMaterials.setRenderMaterialMode) {
            BottleMaterials.setRenderMaterialMode(mode);
        }
        if (typeof updateBouteille === 'function') updateBouteille();
    }

    function applyBackgroundScene(sceneName) {
        if (typeof SceneSetup3D !== 'undefined' && SceneSetup3D.setBackgroundScene) {
            SceneSetup3D.setBackgroundScene(sceneName);
        }
    }

    function initModeRenduControls() {
        var modeToggle = document.getElementById(IDS.modeToggle || 'render-mode-toggle');
        var radioGlass = document.getElementById(IDS.materialGlass || 'render-material-glass');
        var materialCard = radioGlass ? radioGlass.closest('.setting-card') : null;
        var sceneCard = document.getElementById(IDS.sceneCard || 'render-scene-card');
        var sceneBase = document.getElementById(IDS.sceneBase || 'render-scene-base');
        var scene1 = document.getElementById(IDS.scene1 || 'render-scene-1');
        var scene2 = document.getElementById(IDS.scene2 || 'render-scene-2');
        if (!modeToggle || !radioGlass || !sceneBase || !scene1 || !scene2) return;

        function syncSceneAvailability() {
            var enabled = !!modeToggle.checked;
            scene1.disabled = !enabled;
            scene2.disabled = !enabled;
            if (materialCard) materialCard.classList.toggle('is-disabled', !enabled);
            if (sceneCard) sceneCard.classList.toggle('is-disabled', !enabled);
            if (!enabled) sceneBase.checked = true;
        }

        function applySceneFromChecks() {
            var sceneName = RenderMath.sceneFromInputs(
                !!modeToggle.checked,
                !!scene1.checked,
                !!scene2.checked
            );
            applyBackgroundScene(sceneName);
            if (typeof updateBouteille === 'function') updateBouteille();
        }

        function applyMaterialFromMode() {
            var mode = RenderMath.materialModeFromToggle(!!modeToggle.checked);
            applyMaterialMode(mode);
        }

        if (!modeToggle.dataset.bound) {
            modeToggle.dataset.bound = '1';
            modeToggle.addEventListener('change', function () {
                applyMaterialFromMode();
                syncSceneAvailability();
                applySceneFromChecks();
            });
        }
        if (!radioGlass.dataset.bound) {
            radioGlass.dataset.bound = '1';
            radioGlass.addEventListener('change', function () {
                if (radioGlass.checked && modeToggle.checked) applyMaterialMode(RULES.MODE_GLASS || 'glass');
            });
        }
        if (!sceneBase.dataset.bound) {
            sceneBase.dataset.bound = '1';
            sceneBase.addEventListener('change', function () { if (sceneBase.checked) applySceneFromChecks(); });
        }
        if (!scene1.dataset.bound) {
            scene1.dataset.bound = '1';
            scene1.addEventListener('change', applySceneFromChecks);
        }
        if (!scene2.dataset.bound) {
            scene2.dataset.bound = '1';
            scene2.addEventListener('change', applySceneFromChecks);
        }

        // Etat initial
        radioGlass.checked = true;
        modeToggle.checked = false;
        sceneBase.checked = true;
        applyMaterialMode(RULES.MODE_BASE || 'base');
        syncSceneAvailability();
        applySceneFromChecks();
    }

    return {
        initModeRenduControls: initModeRenduControls
    };
})();
