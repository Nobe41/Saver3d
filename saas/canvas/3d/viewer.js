// js/3d/viewer.js
// Manager 3D : init scène (SceneSetup3D), vue bouteille (BottleView3D), boucle de rendu.
// API globale : initLogiciel(), updateBouteille() — utilisées par main, ui, storage, gravure.

var Canvas3DLifecycle = (function () {
    var viewPortId = (typeof Canvas3DRules !== 'undefined' && Canvas3DRules.VIEWPORT_ID) ? Canvas3DRules.VIEWPORT_ID : 'viewport-3d';
    var rafId = 0;
    var isBound = false;

    function renderLoop() {
        rafId = requestAnimationFrame(renderLoop);
        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function handleResize() {
        if (!viewport3D || viewport3D.classList.contains('hidden')) return;
        if (typeof SceneSetup3D !== 'undefined' && SceneSetup3D.resize) {
            SceneSetup3D.resize(viewport3D.clientWidth, viewport3D.clientHeight);
        }
    }

    function init() {
        if (renderer) return;
        viewport3D = document.getElementById(viewPortId);
        if (!viewport3D || typeof SceneSetup3D === 'undefined') return;
        SceneSetup3D.initScene(viewport3D);
        if (typeof BottleView3D !== 'undefined' && BottleView3D.updateView) BottleView3D.updateView();
        if (typeof setupListeners === 'function') setupListeners();
        if (!isBound) {
            isBound = true;
            window.addEventListener('resize', handleResize);
        }
        renderLoop();
    }

    function update() {
        if (typeof BottleView3D !== 'undefined' && BottleView3D.updateView) BottleView3D.updateView();
    }

    function dispose() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        if (typeof BottleView3D !== 'undefined' && BottleView3D.dispose) BottleView3D.dispose();
        if (typeof SceneSetup3D !== 'undefined' && SceneSetup3D.disposeScene) SceneSetup3D.disposeScene();
        if (isBound) {
            window.removeEventListener('resize', handleResize);
            isBound = false;
        }
    }

    return {
        init: init,
        update: update,
        resize: handleResize,
        dispose: dispose
    };
})();

function initLogiciel() { Canvas3DLifecycle.init(); }
function updateBouteille() { Canvas3DLifecycle.update(); }
