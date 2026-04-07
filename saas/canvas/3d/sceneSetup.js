// js/3d/sceneSetup.js
// Initialisation de la scène Three.js (caméra ortho, éclairage, grille).
// Assigne scene, camera, renderer, controls aux variables globales (state.js).

var SceneSetup3D = (function () {
    var sceneRules = (typeof Canvas3DRules !== 'undefined' && Canvas3DRules.SCENE) ? Canvas3DRules.SCENE : {};
    var VIEW_SIZE = sceneRules.VIEW_SIZE || 250;
    var NEAR = sceneRules.NEAR || 1;
    var FAR = sceneRules.FAR || 2000;
    var CAMERA_POSITION = sceneRules.CAMERA_POSITION || { x: 400, y: 300, z: 400 };
    var CONTROLS_TARGET_Y = sceneRules.CONTROLS_TARGET_Y || 150;
    var DIRECTIONAL_INTENSITY = sceneRules.DIRECTIONAL_INTENSITY || 0.45;
    var AMBIENT_INTENSITY = sceneRules.AMBIENT_INTENSITY || 0.5;
    var AXES_SIZE = sceneRules.AXES_SIZE || 100;
    var GRID_SIZE = sceneRules.GRID_SIZE || 400;
    var GRID_DIVISIONS = sceneRules.GRID_DIVISIONS || 20;
    var GRID_OPACITY = sceneRules.GRID_OPACITY || 0.6;
    var ACTIVE_BG_SCENE = 'none';
    var backgroundTextures = { scene1: null, scene2: null };
    var axesHelper = null;
    var gridHelper = null;
    var sceneDecor = {
        table: null, tableLegs: [], contactShadow: null, sunLight: null,
        frontLightLeft: null, frontLightRight: null, fillLight: null, baseKeyLight: null, baseRimLight: null,
        defaultLightLeft: null, defaultLightRight: null, defaultAmbient: null
    };

    function makeBackgroundTexture(kind) {
        if (typeof THREE === 'undefined') return null;
        var size = 1024;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        if (!ctx) return null;

        var grad = ctx.createLinearGradient(0, 0, 0, size);
        if (kind === 'scene2') {
            grad.addColorStop(0, '#e7f1ff');
            grad.addColorStop(1, '#cfdff4');
        } else {
            grad.addColorStop(0, '#fff4e7');
            grad.addColorStop(1, '#f1e3cf');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Lignes légères pour donner un vrai "fond image"
        ctx.strokeStyle = kind === 'scene2' ? 'rgba(80,110,150,0.18)' : 'rgba(120,90,60,0.18)';
        ctx.lineWidth = 2;
        for (var i = 0; i < 14; i++) {
            var y = Math.round((i + 1) * size / 15);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }
        for (var j = 0; j < 10; j++) {
            var x = Math.round((j + 1) * size / 11);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }

        var tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    function makeWoodTextureSet() {
        if (typeof THREE === 'undefined') return null;
        var size = 1024;
        function makeCanvas() {
            var c = document.createElement('canvas');
            c.width = size; c.height = size;
            return c;
        }
        var albedoCanvas = makeCanvas();
        var roughCanvas = makeCanvas();
        var bumpCanvas = makeCanvas();
        var aCtx = albedoCanvas.getContext('2d');
        var rCtx = roughCanvas.getContext('2d');
        var bCtx = bumpCanvas.getContext('2d');
        if (!aCtx || !rCtx || !bCtx) return null;

        var grad = aCtx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, '#a87e53');
        grad.addColorStop(1, '#6e4a2b');
        aCtx.fillStyle = grad;
        aCtx.fillRect(0, 0, size, size);
        rCtx.fillStyle = '#8f8f8f';
        rCtx.fillRect(0, 0, size, size);
        bCtx.fillStyle = '#808080';
        bCtx.fillRect(0, 0, size, size);

        // Veines + joints de planches
        for (var i = 0; i < 80; i++) {
            var y = (i / 80) * size + (Math.random() * 8 - 4);
            var tone = i % 2 ? '#5b3f27' : '#c69a6a';
            aCtx.globalAlpha = 0.16 + Math.random() * 0.12;
            aCtx.strokeStyle = tone;
            aCtx.lineWidth = 1.5 + Math.random() * 2.5;
            aCtx.beginPath();
            aCtx.moveTo(0, y);
            for (var x = 0; x <= size; x += 32) {
                var ny = y + Math.sin((x / size) * Math.PI * 7 + i * 0.25) * (3 + Math.random() * 3);
                aCtx.lineTo(x, ny);
            }
            aCtx.stroke();

            rCtx.globalAlpha = 0.08;
            rCtx.strokeStyle = '#222222';
            rCtx.lineWidth = 2;
            rCtx.beginPath();
            rCtx.moveTo(0, y);
            rCtx.lineTo(size, y);
            rCtx.stroke();

            bCtx.globalAlpha = 0.12;
            bCtx.strokeStyle = '#b0b0b0';
            bCtx.lineWidth = 1.5;
            bCtx.beginPath();
            bCtx.moveTo(0, y);
            bCtx.lineTo(size, y);
            bCtx.stroke();
        }
        aCtx.globalAlpha = 1;
        rCtx.globalAlpha = 1;
        bCtx.globalAlpha = 1;

        // Joints de planches verticaux
        for (var j = 1; j < 5; j++) {
            var bx = Math.round((j / 5) * size);
            aCtx.strokeStyle = 'rgba(45,30,18,0.45)';
            aCtx.lineWidth = 3;
            aCtx.beginPath();
            aCtx.moveTo(bx, 0);
            aCtx.lineTo(bx, size);
            aCtx.stroke();

            rCtx.strokeStyle = 'rgba(20,20,20,0.35)';
            rCtx.lineWidth = 4;
            rCtx.beginPath();
            rCtx.moveTo(bx, 0);
            rCtx.lineTo(bx, size);
            rCtx.stroke();
        }

        function toTex(canvas) {
            var tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(3, 3);
            tex.needsUpdate = true;
            return tex;
        }
        return {
            albedo: toTex(albedoCanvas),
            roughness: toTex(roughCanvas),
            bump: toTex(bumpCanvas)
        };
    }

    function ensureBackgroundTexture(kind) {
        if (!backgroundTextures[kind]) backgroundTextures[kind] = makeBackgroundTexture(kind);
        return backgroundTextures[kind];
    }

    function applyBackgroundScene() {
        if (!scene || typeof THREE === 'undefined') return;
        if (ACTIVE_BG_SCENE === 'scene1' || ACTIVE_BG_SCENE === 'scene2') {
            scene.background = ensureBackgroundTexture(ACTIVE_BG_SCENE);
        } else {
            scene.background = new THREE.Color(0xffffff);
        }
    }

    function ensureSceneDecor() {
        if (!scene || typeof THREE === 'undefined') return;
        if (sceneDecor.table && sceneDecor.baseKeyLight) return;

        var woodSet = makeWoodTextureSet();
        var tableMat = new THREE.MeshPhysicalMaterial({
            color: 0x8a6640,
            roughness: 0.65,
            metalness: 0.02,
            map: woodSet ? woodSet.albedo : null,
            roughnessMap: woodSet ? woodSet.roughness : null,
            bumpMap: woodSet ? woodSet.bump : null,
            bumpScale: 0.25,
            clearcoat: 0.1,
            clearcoatRoughness: 0.35
        });

        sceneDecor.table = new THREE.Mesh(new THREE.BoxGeometry(520, 8, 380), tableMat);
        sceneDecor.table.position.set(0, -4, 0);
        sceneDecor.table.receiveShadow = true;
        scene.add(sceneDecor.table);

        var legMat = new THREE.MeshPhysicalMaterial({ color: 0x6b4a2e, roughness: 0.82, metalness: 0.03 });
        var legOffsets = [
            { x: -220, z: -150 }, { x: 220, z: -150 },
            { x: -220, z: 150 }, { x: 220, z: 150 }
        ];
        for (var i = 0; i < legOffsets.length; i++) {
            var leg = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 130, 16), legMat);
            leg.position.set(legOffsets[i].x, -69, legOffsets[i].z);
            leg.castShadow = true;
            leg.receiveShadow = true;
            sceneDecor.tableLegs.push(leg);
            scene.add(leg);
        }

        // Ombre de contact simple sous la bouteille
        var shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 });
        sceneDecor.contactShadow = new THREE.Mesh(new THREE.CircleGeometry(65, 48), shadowMat);
        sceneDecor.contactShadow.rotation.x = -Math.PI / 2;
        sceneDecor.contactShadow.position.set(0, 0.05, 0);
        scene.add(sceneDecor.contactShadow);

        // Lumière "soleil"
        sceneDecor.sunLight = new THREE.DirectionalLight(0xfff4dc, 1.0);
        sceneDecor.sunLight.position.set(320, 460, 180);
        sceneDecor.sunLight.target.position.set(0, 120, 0);
        sceneDecor.sunLight.castShadow = true;
        sceneDecor.sunLight.shadow.mapSize.width = 2048;
        sceneDecor.sunLight.shadow.mapSize.height = 2048;
        sceneDecor.sunLight.shadow.camera.near = 10;
        sceneDecor.sunLight.shadow.camera.far = 1200;
        sceneDecor.sunLight.shadow.camera.left = -350;
        sceneDecor.sunLight.shadow.camera.right = 350;
        sceneDecor.sunLight.shadow.camera.top = 350;
        sceneDecor.sunLight.shadow.camera.bottom = -350;
        sceneDecor.sunLight.shadow.bias = -0.00015;
        scene.add(sceneDecor.sunLight);
        scene.add(sceneDecor.sunLight.target);

        // Eclairage studio activé uniquement en Scène 1.
        sceneDecor.frontLightLeft = new THREE.DirectionalLight(0xffffff, 0.92);
        sceneDecor.frontLightLeft.position.set(-260, 300, 420);
        sceneDecor.frontLightLeft.target.position.set(0, 140, 0);
        scene.add(sceneDecor.frontLightLeft);
        scene.add(sceneDecor.frontLightLeft.target);

        sceneDecor.frontLightRight = new THREE.DirectionalLight(0xffffff, 0.92);
        sceneDecor.frontLightRight.position.set(260, 300, 420);
        sceneDecor.frontLightRight.target.position.set(0, 140, 0);
        scene.add(sceneDecor.frontLightRight);
        scene.add(sceneDecor.frontLightRight.target);

        sceneDecor.fillLight = new THREE.HemisphereLight(0xffffff, 0xeaf2ff, 0.55);
        scene.add(sceneDecor.fillLight);

        // Scène 0: projecteur doux — reflet visible sur le verre sans écraser les ombres.
        sceneDecor.baseKeyLight = new THREE.SpotLight(0xfff8f4, 1.35, 2200, Math.PI / 5, 0.55, 2);
        sceneDecor.baseKeyLight.position.set(240, 300, 480);
        sceneDecor.baseKeyLight.target.position.set(0, 125, 0);
        sceneDecor.baseKeyLight.castShadow = true;
        sceneDecor.baseKeyLight.shadow.mapSize.width = 2048;
        sceneDecor.baseKeyLight.shadow.mapSize.height = 2048;
        sceneDecor.baseKeyLight.shadow.camera.near = 10;
        sceneDecor.baseKeyLight.shadow.camera.far = 1200;
        sceneDecor.baseKeyLight.shadow.camera.left = -300;
        sceneDecor.baseKeyLight.shadow.camera.right = 300;
        sceneDecor.baseKeyLight.shadow.camera.top = 300;
        sceneDecor.baseKeyLight.shadow.camera.bottom = -300;
        sceneDecor.baseKeyLight.shadow.bias = -0.0001;
        scene.add(sceneDecor.baseKeyLight);
        scene.add(sceneDecor.baseKeyLight.target);

        // Très léger contre-jour pour garder du relief sans gommer les ombres de la clé.
        sceneDecor.baseRimLight = new THREE.DirectionalLight(0xe8eef8, 0.12);
        sceneDecor.baseRimLight.position.set(-180, 220, -260);
        sceneDecor.baseRimLight.target.position.set(0, 120, 0);
        scene.add(sceneDecor.baseRimLight);
        scene.add(sceneDecor.baseRimLight.target);
    }

    function applySceneDecor() {
        if (!scene) return;
        ensureSceneDecor();
        var isScene1 = ACTIVE_BG_SCENE === 'scene1';
        var isScene0 = ACTIVE_BG_SCENE === 'scene0';
        var isBaseDefault = ACTIVE_BG_SCENE === 'none';
        if (sceneDecor.table) sceneDecor.table.visible = isScene1;
        if (sceneDecor.contactShadow) sceneDecor.contactShadow.visible = isScene1;
        if (sceneDecor.sunLight) sceneDecor.sunLight.visible = isScene1;
        if (sceneDecor.frontLightLeft) sceneDecor.frontLightLeft.visible = isScene1;
        if (sceneDecor.frontLightRight) sceneDecor.frontLightRight.visible = isScene1;
        if (sceneDecor.fillLight) sceneDecor.fillLight.visible = isScene1;
        if (sceneDecor.baseKeyLight) sceneDecor.baseKeyLight.visible = isScene0;
        if (sceneDecor.baseRimLight) sceneDecor.baseRimLight.visible = isScene0;
        if (sceneDecor.defaultLightLeft) sceneDecor.defaultLightLeft.visible = isBaseDefault;
        if (sceneDecor.defaultLightRight) sceneDecor.defaultLightRight.visible = isBaseDefault;
        if (sceneDecor.defaultAmbient) sceneDecor.defaultAmbient.visible = isBaseDefault;
        for (var i = 0; i < sceneDecor.tableLegs.length; i++) {
            sceneDecor.tableLegs[i].visible = isScene1;
        }
    }

    function applyDisplayOptions() {
        if (!scene) return;
        var opts = (typeof window !== 'undefined' && window.displayOptions) ? window.displayOptions : {};
        if (axesHelper) axesHelper.visible = opts.showAxes !== false;
        if (gridHelper) gridHelper.visible = opts.showGrid !== false;
    }

    /**
     * Tonemapping / couleurs : uniquement en Scène 0 avec mode rendu activé.
     * Sinon retour au pipeline par défaut (vue normale).
     */
    function syncRendererPipeline() {
        if (!renderer || typeof THREE === 'undefined') return;
        var modeToggle = (typeof document !== 'undefined') ? document.getElementById('render-mode-toggle') : null;
        var renderOn = modeToggle && modeToggle.checked;
        var scene0Render = renderOn && ACTIVE_BG_SCENE === 'scene0';
        if (scene0Render) {
            if (renderer.physicallyCorrectLights !== undefined) renderer.physicallyCorrectLights = true;
            if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
            if (renderer.toneMapping !== undefined) renderer.toneMapping = THREE.ACESFilmicToneMapping;
            if (renderer.toneMappingExposure !== undefined) renderer.toneMappingExposure = 1.0;
        } else {
            if (renderer.physicallyCorrectLights !== undefined) renderer.physicallyCorrectLights = false;
            if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.LinearEncoding;
            if (renderer.toneMapping !== undefined) renderer.toneMapping = THREE.LinearToneMapping;
            if (renderer.toneMappingExposure !== undefined) renderer.toneMappingExposure = 1.0;
        }
    }

    function initScene(canvasElement) {
        if (!canvasElement || typeof THREE === 'undefined') return null;

        var w = canvasElement.clientWidth;
        var h = canvasElement.clientHeight;
        if (h < 1) h = 1;
        var aspect = w / h;

        scene = new THREE.Scene();
        applyBackgroundScene();

        camera = new THREE.OrthographicCamera(
            -VIEW_SIZE * aspect, VIEW_SIZE * aspect,
            VIEW_SIZE, -VIEW_SIZE,
            NEAR, FAR
        );
        camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        canvasElement.appendChild(renderer.domElement);

        axesHelper = new THREE.AxesHelper(AXES_SIZE);
        scene.add(axesHelper);
        gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, 0xaaaaaa, 0xcccccc);
        gridHelper.material.opacity = GRID_OPACITY;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
        applyDisplayOptions();
        applySceneDecor();
        syncRendererPipeline();

        scene.add(camera);
        // Eclairage historique de base (actif hors mode rendu).
        sceneDecor.defaultLightLeft = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_INTENSITY);
        sceneDecor.defaultLightLeft.position.set(-3, 0, 1.5);
        camera.add(sceneDecor.defaultLightLeft);
        sceneDecor.defaultLightRight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_INTENSITY);
        sceneDecor.defaultLightRight.position.set(3, 0, 1.5);
        camera.add(sceneDecor.defaultLightRight);
        sceneDecor.defaultAmbient = new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY);
        scene.add(sceneDecor.defaultAmbient);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, CONTROLS_TARGET_Y, 0);

        return { scene: scene, camera: camera, renderer: renderer, controls: controls };
    }

    function resize(width, height) {
        if (!camera || !renderer) return;
        var w = width || (viewport3D ? viewport3D.clientWidth : 0);
        var h = height || (viewport3D ? viewport3D.clientHeight : 0);
        if (!w || !h) return;
        var aspect = w / h;
        camera.left = -VIEW_SIZE * aspect;
        camera.right = VIEW_SIZE * aspect;
        camera.top = VIEW_SIZE;
        camera.bottom = -VIEW_SIZE;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    function disposeScene() {
        if (controls && controls.dispose) controls.dispose();
        if (renderer && renderer.dispose) renderer.dispose();
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        scene = null;
        camera = null;
        controls = null;
        renderer = null;
        axesHelper = null;
        gridHelper = null;
    }

    return {
        initScene: initScene,
        resize: resize,
        disposeScene: disposeScene,
        applyDisplayOptions: applyDisplayOptions,
        setBackgroundScene: function (sceneName) {
            if (sceneName === 'scene0' || sceneName === 'scene1' || sceneName === 'scene2') ACTIVE_BG_SCENE = sceneName;
            else ACTIVE_BG_SCENE = 'none';
            applyBackgroundScene();
            applySceneDecor();
            syncRendererPipeline();
        },
        syncRendererPipeline: syncRendererPipeline
    };
})();
