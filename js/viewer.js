// ==========================================
// VUE 3D — Moteur d'affichage uniquement
// Repère : origine (0,0,0) à la base, axe Y = hauteur, X et Z = plan horizontal. 1 unité = 1 mm.
// Les géométries sont calculées par BottleMaths + GeomKernel (segments et arcs uniquement).
// ==========================================

var sectionRingGroup;
var N_SEGMENTS = 64;
var MERIDIAN_RESOLUTION = 32;

function getPanelValue(id, def) {
    var el = document.getElementById(id);
    if (!el) return def;
    var v = parseFloat(el.value);
    return isNaN(v) ? def : Math.max(0, v);
}

function getPanelSelectValue(id, def) {
    var el = document.getElementById(id);
    if (!el || !el.value) return def;
    return el.value;
}

function getSectionForme(k) {
    return getPanelSelectValue('s' + k + '-forme', 'rond');
}
function getSectionCarreNiveau(k) {
    var v = getPanelValue('s' + k + '-carre-niveau', 0);
    return Math.max(0, Math.min(100, v));
}
function getPiqureSectionFromPanel() {
    var H = getPanelValue('s1-h', 0);
    var a = Math.max(0, getPanelValue('sp-L', 58) / 2);
    var b = Math.max(0, getPanelValue('sp-P', 58) / 2);
    var shape = getPanelSelectValue('sp-forme', 'rond');
    var carreNiveau = Math.max(0, Math.min(100, getPanelValue('sp-carre-niveau', 0)));
    return { H: H, a: a, b: b, shape: shape, carreNiveau: carreNiveau };
}
function getHautPiqureSectionFromPanel() {
    var H = getPanelValue('sp2-h', 4);
    var a = Math.max(0, getPanelValue('sp2-L', 48) / 2);
    var b = Math.max(0, getPanelValue('sp2-P', 48) / 2);
    var shape = getPanelSelectValue('sp2-forme', 'rond');
    var carreNiveau = Math.max(0, Math.min(100, getPanelValue('sp2-carre-niveau', 0)));
    return { H: H, a: a, b: b, shape: shape, carreNiveau: carreNiveau };
}
function getHautPiqure3SectionFromPanel() {
    var H = getPanelValue('sp3-h', 20);
    var a = Math.max(0, getPanelValue('sp3-L', 35) / 2);
    var b = Math.max(0, getPanelValue('sp3-P', 35) / 2);
    var shape = getPanelSelectValue('sp3-forme', 'rond');
    var carreNiveau = Math.max(0, Math.min(100, getPanelValue('sp3-carre-niveau', 0)));
    return { H: H, a: a, b: b, shape: shape, carreNiveau: carreNiveau };
}
function getBague1SectionFromPanel() {
    var H = getPanelValue('sb1-h', 282);
    var a = Math.max(0, getPanelValue('sb1-L', 35) / 2);
    var b = Math.max(0, getPanelValue('sb1-P', 35) / 2);
    return { H: H, a: a, b: b, shape: 'rond', carreNiveau: 0 };
}
function getBague2SectionFromPanel() {
    var H = getPanelValue('sb2-h', 297);
    var a = Math.max(0, getPanelValue('sb2-L', 35) / 2);
    var b = Math.max(0, getPanelValue('sb2-P', 35) / 2);
    return { H: H, a: a, b: b, shape: 'rond', carreNiveau: 0 };
}
function getBague3SectionFromPanel() {
    var H = getPanelValue('sb3-h', 299);
    var a = Math.max(0, getPanelValue('sb3-L', 33) / 2);
    var b = Math.max(0, getPanelValue('sb3-P', 33) / 2);
    return { H: H, a: a, b: b, shape: 'rond', carreNiveau: 0 };
}
function getBague4SectionFromPanel() {
    var H = getPanelValue('sb3-h', 299);
    var a = Math.max(0, getPanelValue('sb4-L', 31) / 2);
    var b = Math.max(0, getPanelValue('sb4-P', 31) / 2);
    return { H: H, a: a, b: b, shape: 'rond', carreNiveau: 0 };
}
function getBague5SectionFromPanel() {
    var H = getPanelValue('sb5-h', 297);
    var a = Math.max(0, getPanelValue('sb5-L', 29) / 2);
    var b = Math.max(0, getPanelValue('sb5-P', 29) / 2);
    return { H: H, a: a, b: b, shape: 'rond', carreNiveau: 0 };
}

function getSectionsDataFromPanel() {
    var H1 = getPanelValue('s1-h', 0);
    var s2hVal = getPanelValue('s2-h', 10);
    var s3hVal = getPanelValue('s3-h', 120);
    var s4hVal = getPanelValue('s4-h', 200);
    var s5hVal = getPanelValue('s5-h', 280);

    s3hVal = Math.max(s3hVal, s2hVal);
    s4hVal = Math.max(s4hVal, s3hVal);
    s5hVal = Math.max(s5hVal, s4hVal);
    s4hVal = Math.min(s4hVal, s5hVal);
    s3hVal = Math.min(s3hVal, s4hVal);
    s2hVal = Math.max(Math.min(s2hVal, s3hVal), H1);

    var H2 = s2hVal, H3 = s3hVal, H4 = s4hVal, H5 = s5hVal;

    var sections = [
        { H: H1, a: Math.max(0, getPanelValue('s1-L', 71) / 2), b: Math.max(0, getPanelValue('s1-P', 71) / 2), shape: getSectionForme(1), carreNiveau: getSectionCarreNiveau(1) },
        { H: H2, a: Math.max(0, getPanelValue('s2-L', 85) / 2), b: Math.max(0, getPanelValue('s2-P', 85) / 2), shape: getSectionForme(2), carreNiveau: getSectionCarreNiveau(2) },
        { H: H3, a: Math.max(0, getPanelValue('s3-L', 85) / 2), b: Math.max(0, getPanelValue('s3-P', 85) / 2), shape: getSectionForme(3), carreNiveau: getSectionCarreNiveau(3) },
        { H: H4, a: Math.max(0, getPanelValue('s4-L', 32) / 2), b: Math.max(0, getPanelValue('s4-P', 32) / 2), shape: getSectionForme(4), carreNiveau: getSectionCarreNiveau(4) },
        { H: H5, a: Math.max(0, getPanelValue('s5-L', 32) / 2), b: Math.max(0, getPanelValue('s5-P', 32) / 2), shape: getSectionForme(5), carreNiveau: getSectionCarreNiveau(5) }
    ];

    var edgeTypes = [
        getPanelSelectValue('r12-type', 'ligne'),
        getPanelSelectValue('r23-type', 'ligne'),
        getPanelSelectValue('r34-type', 'ligne'),
        getPanelSelectValue('r45-type', 'ligne')
    ];
    var rhos = [
        getPanelValue('r12-rho', 5),
        getPanelValue('r23-rho', 40),
        getPanelValue('r34-rho', 20),
        getPanelValue('r45-rho', 15)
    ];

    return { sections: sections, edgeTypes: edgeTypes, rhos: rhos };
}

function clampSectionHeightsFromPanel() {
    var H1 = getPanelValue('s1-h', 0);
    var s2hInput = document.getElementById('s2-h');
    var s2hSlider = document.getElementById('s2-h-slider');
    var s2hVal = getPanelValue('s2-h', 10);
    if (s2hInput) s2hInput.min = H1;
    if (s2hSlider) s2hSlider.min = H1;

    var s3hInput = document.getElementById('s3-h');
    var s3hSlider = document.getElementById('s3-h-slider');
    var s3hVal = getPanelValue('s3-h', 120);
    if (s3hVal < s2hVal) {
        if (s3hInput) s3hInput.value = s2hVal;
        if (s3hSlider) s3hSlider.value = s2hVal;
    }
    s3hVal = Math.max(s2hVal, getPanelValue('s3-h', 120));
    var H3 = s3hVal;

    var s4hInput = document.getElementById('s4-h');
    var s4hSlider = document.getElementById('s4-h-slider');
    var s4hVal = getPanelValue('s4-h', 200);
    if (s4hVal < H3) {
        if (s4hInput) s4hInput.value = H3;
        if (s4hSlider) s4hSlider.value = H3;
    }
    s4hVal = Math.max(H3, s4hVal);
    var H4 = s4hVal;

    var s5hInput = document.getElementById('s5-h');
    var s5hSlider = document.getElementById('s5-h-slider');
    var s5hVal = getPanelValue('s5-h', 280);
    if (s5hVal < H4) {
        if (s5hInput) s5hInput.value = H4;
        if (s5hSlider) s5hSlider.value = H4;
    }
    var H5 = Math.max(H4, s5hVal);

    if (s4hInput) s4hInput.max = H5;
    if (s4hSlider) s4hSlider.max = H5;
    if (s3hInput) s3hInput.max = H4;
    if (s3hSlider) s3hSlider.max = H4;
    if (s2hInput) s2hInput.max = H3;
    if (s2hSlider) s2hSlider.max = H3;
    if (s3hInput) s3hInput.min = s2hVal;
    if (s3hSlider) s3hSlider.min = s2hVal;
    if (s4hInput) s4hInput.min = H3;
    if (s4hSlider) s4hSlider.min = H3;
    if (s5hInput) s5hInput.min = H4;
    if (s5hSlider) s5hSlider.min = H4;
}

// Construit le maillage 3D par révolution du profil méridien (BottleMaths + GeomKernel).
function buildRevolvedMesh(sectionsData) {
    if (typeof GeomKernel === 'undefined' || typeof BottleMaths === 'undefined') return null;

    var nTheta = N_SEGMENTS;
    var meridians = [];
    for (var t = 0; t < nTheta; t++) {
        var theta = (t / nTheta) * 2 * Math.PI;
        var entities = BottleMaths.buildExteriorProfile(theta, sectionsData);
        var points = GeomKernel.tessellateProfile(entities, MERIDIAN_RESOLUTION);
        meridians.push(points);
    }
    var nMeridian = meridians[0].length;
    for (var ti = 1; ti < nTheta; ti++) {
        if (meridians[ti].length < nMeridian) nMeridian = meridians[ti].length;
    }
    var vertices = [];
    var indices = [];

    for (t = 0; t < nTheta; t++) {
        for (var m = 0; m < nMeridian; m++) {
            var p = meridians[t][m];
            var x = p.x * Math.cos((t / nTheta) * 2 * Math.PI);
            var z = p.x * Math.sin((t / nTheta) * 2 * Math.PI);
            vertices.push(x, p.y, z);
        }
    }

    for (t = 0; t < nTheta; t++) {
        var tNext = (t + 1) % nTheta;
        for (m = 0; m < nMeridian - 1; m++) {
            var i0 = t * nMeridian + m;
            var i1 = t * nMeridian + m + 1;
            var i2 = tNext * nMeridian + m;
            var i3 = tNext * nMeridian + m + 1;
            indices.push(i0, i1, i2);
            indices.push(i1, i3, i2);
        }
    }

    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    var mat = new THREE.MeshPhongMaterial({
        color: 0x99bbdd,
        side: THREE.DoubleSide
    });
    return new THREE.Mesh(geom, mat);
}

function buildSectionRingLine(H, points, isHighlight) {
    var pts = points.map(function (p) { return new THREE.Vector3(p[0], H, p[1]); });
    var geom = new THREE.BufferGeometry().setFromPoints(pts);
    var color = isHighlight ? 0x0066cc : 0x000000;
    return new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: color }));
}

function buildPiqurePiedFeuille(s1, piqure, H) {
    var n = N_SEGMENTS;
    var piedPts = BottleMaths.getSectionRingPoints(s1.a, s1.b, s1.shape, s1.carreNiveau, n);
    var piqurePts = BottleMaths.getSectionRingPoints(piqure.a, piqure.b, piqure.shape, piqure.carreNiveau, n);
    var vertices = [];
    var indices = [];
    for (var i = 0; i <= n; i++) {
        var ii = i % (n + 1);
        vertices.push(piqurePts[ii][0], H, piqurePts[ii][1]);
        vertices.push(piedPts[ii][0], H, piedPts[ii][1]);
    }
    for (var j = 0; j < n; j++) {
        var a = j * 2;
        var b = j * 2 + 1;
        var c = (j + 1) * 2 + 1;
        var d = (j + 1) * 2;
        indices.push(a, b, c);
        indices.push(a, c, d);
    }
    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    var mat = new THREE.MeshPhongMaterial({
        color: 0x99bbdd,
        side: THREE.DoubleSide
    });
    return new THREE.Mesh(geom, mat);
}

function buildPiqureBasHautFeuille(piqure, hautPiqure) {
    var n = N_SEGMENTS;
    var bottomPts = BottleMaths.getSectionRingPoints(piqure.a, piqure.b, piqure.shape, piqure.carreNiveau, n);
    var topPts = BottleMaths.getSectionRingPoints(hautPiqure.a, hautPiqure.b, hautPiqure.shape, hautPiqure.carreNiveau, n);
    var vertices = [];
    var indices = [];
    for (var i = 0; i <= n; i++) {
        vertices.push(bottomPts[i][0], piqure.H, bottomPts[i][1]);
    }
    for (var i = 0; i <= n; i++) {
        vertices.push(topPts[i][0], hautPiqure.H, topPts[i][1]);
    }
    var np = n + 1;
    for (var j = 0; j < n; j++) {
        var b0 = j;
        var b1 = j + 1;
        var t0 = np + j;
        var t1 = np + j + 1;
        indices.push(b0, b1, t1);
        indices.push(b0, t1, t0);
    }
    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    var mat = new THREE.MeshPhongMaterial({
        color: 0x99bbdd,
        side: THREE.DoubleSide
    });
    return new THREE.Mesh(geom, mat);
}

function buildPiqureFeuilleVersAxe(section, topH) {
    var n = N_SEGMENTS;
    var bottomPts = BottleMaths.getSectionRingPoints(section.a, section.b, section.shape, section.carreNiveau, n);
    var vertices = [];
    var indices = [];
    for (var i = 0; i <= n; i++) {
        vertices.push(bottomPts[i][0], section.H, bottomPts[i][1]);
    }
    vertices.push(0, topH, 0);
    var centerIdx = n + 1;
    for (var j = 0; j < n; j++) {
        indices.push(j, j + 1, centerIdx);
    }
    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    var mat = new THREE.MeshPhongMaterial({
        color: 0x99bbdd,
        side: THREE.DoubleSide
    });
    return new THREE.Mesh(geom, mat);
}

function updateSectionRings() {
    if (!scene) return;
    if (typeof BottleMaths === 'undefined') return;

    clampSectionHeightsFromPanel();
    var sectionsData = getSectionsDataFromPanel();
    var sections = sectionsData.sections;
    var activeSection = typeof window.activeSectionIndex !== 'undefined' ? window.activeSectionIndex : 0;

    if (sectionRingGroup) scene.remove(sectionRingGroup);
    sectionRingGroup = new THREE.Group();

    var mesh = buildRevolvedMesh(sectionsData);
    if (mesh) { mesh.userData.isPiqure = false; sectionRingGroup.add(mesh); }

    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        var ringPoints = BottleMaths.getSectionRingPoints(s.a, s.b, s.shape, s.carreNiveau, N_SEGMENTS);
        var ring = buildSectionRingLine(s.H, ringPoints, activeSection === i + 1);
        ring.userData.isPiqure = false;
        sectionRingGroup.add(ring);
    }
    var piqure = getPiqureSectionFromPanel();
    var s1 = sections[0];
    var piqureRingPoints = BottleMaths.getSectionRingPoints(piqure.a, piqure.b, piqure.shape, piqure.carreNiveau, N_SEGMENTS);
    var piqureRing = buildSectionRingLine(piqure.H, piqureRingPoints, false);
    piqureRing.userData.isPiqure = true;
    sectionRingGroup.add(piqureRing);
    var hautPiqure = getHautPiqureSectionFromPanel();
    var hautPiqureRingPoints = BottleMaths.getSectionRingPoints(hautPiqure.a, hautPiqure.b, hautPiqure.shape, hautPiqure.carreNiveau, N_SEGMENTS);
    var hautPiqureRing = buildSectionRingLine(hautPiqure.H, hautPiqureRingPoints, false);
    hautPiqureRing.userData.isPiqure = true;
    sectionRingGroup.add(hautPiqureRing);
    var hautPiqure3 = getHautPiqure3SectionFromPanel();
    var hautPiqure3RingPoints = BottleMaths.getSectionRingPoints(hautPiqure3.a, hautPiqure3.b, hautPiqure3.shape, hautPiqure3.carreNiveau, N_SEGMENTS);
    var hautPiqure3Ring = buildSectionRingLine(hautPiqure3.H, hautPiqure3RingPoints, false);
    hautPiqure3Ring.userData.isPiqure = true;
    sectionRingGroup.add(hautPiqure3Ring);
    var feuille = buildPiqurePiedFeuille(s1, piqure, piqure.H);
    feuille.userData.isPiqure = true;
    sectionRingGroup.add(feuille);
    var feuilleBasHaut = buildPiqureBasHautFeuille(piqure, hautPiqure);
    feuilleBasHaut.userData.isPiqure = true;
    sectionRingGroup.add(feuilleBasHaut);
    var feuille2Vers3 = buildPiqureBasHautFeuille(hautPiqure, hautPiqure3);
    feuille2Vers3.userData.isPiqure = true;
    sectionRingGroup.add(feuille2Vers3);
    var rp3H = getPanelValue('rp3-h', 30);
    if (rp3H > hautPiqure3.H) {
        var feuille3VersAxe = buildPiqureFeuilleVersAxe(hautPiqure3, rp3H);
        feuille3VersAxe.userData.isPiqure = true;
        sectionRingGroup.add(feuille3VersAxe);
    }
    var bague1 = getBague1SectionFromPanel();
    var s5 = sections[4];
    var bague1RingPoints = BottleMaths.getSectionRingPoints(bague1.a, bague1.b, bague1.shape, bague1.carreNiveau, N_SEGMENTS);
    var bague1Ring = buildSectionRingLine(bague1.H, bague1RingPoints, false);
    bague1Ring.userData.isPiqure = false;
    sectionRingGroup.add(bague1Ring);
    var feuilleColBague = buildPiqureBasHautFeuille(s5, bague1);
    feuilleColBague.userData.isPiqure = false;
    sectionRingGroup.add(feuilleColBague);
    var bague2 = getBague2SectionFromPanel();
    var bague2RingPoints = BottleMaths.getSectionRingPoints(bague2.a, bague2.b, bague2.shape, bague2.carreNiveau, N_SEGMENTS);
    var bague2Ring = buildSectionRingLine(bague2.H, bague2RingPoints, false);
    bague2Ring.userData.isPiqure = false;
    sectionRingGroup.add(bague2Ring);
    var feuilleBague1Vers2 = buildPiqureBasHautFeuille(bague1, bague2);
    feuilleBague1Vers2.userData.isPiqure = false;
    sectionRingGroup.add(feuilleBague1Vers2);
    var bague3 = getBague3SectionFromPanel();
    var bague3RingPoints = BottleMaths.getSectionRingPoints(bague3.a, bague3.b, bague3.shape, bague3.carreNiveau, N_SEGMENTS);
    var bague3Ring = buildSectionRingLine(bague3.H, bague3RingPoints, false);
    bague3Ring.userData.isPiqure = false;
    sectionRingGroup.add(bague3Ring);
    var feuilleBague2Vers3 = buildPiqureBasHautFeuille(bague2, bague3);
    feuilleBague2Vers3.userData.isPiqure = false;
    sectionRingGroup.add(feuilleBague2Vers3);
    var bague4 = getBague4SectionFromPanel();
    var feuilleBague3Vers4 = buildPiqureBasHautFeuille(bague3, bague4);
    feuilleBague3Vers4.userData.isPiqure = false;
    sectionRingGroup.add(feuilleBague3Vers4);
    var bague4RingPoints = BottleMaths.getSectionRingPoints(bague4.a, bague4.b, bague4.shape, bague4.carreNiveau, N_SEGMENTS);
    var bague4Ring = buildSectionRingLine(bague4.H, bague4RingPoints, false);
    bague4Ring.userData.isPiqure = false;
    sectionRingGroup.add(bague4Ring);
    var bague5 = getBague5SectionFromPanel();
    var feuilleBague4Vers5 = buildPiqureBasHautFeuille(bague5, bague4);
    feuilleBague4Vers5.userData.isPiqure = false;
    sectionRingGroup.add(feuilleBague4Vers5);
    var bague5RingPoints = BottleMaths.getSectionRingPoints(bague5.a, bague5.b, bague5.shape, bague5.carreNiveau, N_SEGMENTS);
    var bague5Ring = buildSectionRingLine(bague5.H, bague5RingPoints, false);
    bague5Ring.userData.isPiqure = false;
    sectionRingGroup.add(bague5Ring);

    var piqurePanel = document.getElementById('panel-content-piqure');
    var isPiqureView = piqurePanel && !piqurePanel.classList.contains('hidden');
    var children = sectionRingGroup.children;
    for (var c = 0; c < children.length; c++) {
        var obj = children[c];
        if (obj.material) {
            obj.material.transparent = true;
            if (isPiqureView) {
                var isPiqure = obj.userData.isPiqure === true;
                obj.material.opacity = isPiqure ? 1 : 0.15;
                obj.material.depthWrite = isPiqure;
            } else {
                obj.material.opacity = 1;
                obj.material.depthWrite = true;
            }
        }
    }

    scene.add(sectionRingGroup);
}

function initLogiciel() {
    if (renderer) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    var w = viewport3D.clientWidth;
    var h = viewport3D.clientHeight;
    var aspect = w / h;
    var vs = 250;
    camera = new THREE.OrthographicCamera(-vs * aspect, vs * aspect, vs, -vs, 1, 2000);
    camera.position.set(400, 300, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    viewport3D.appendChild(renderer.domElement);

    scene.add(new THREE.AxesHelper(100));
    var grid = new THREE.GridHelper(400, 20, 0xaaaaaa, 0xcccccc);
    grid.material.opacity = 0.6;
    grid.material.transparent = true;
    scene.add(grid);

    scene.add(camera);
    var dL1 = new THREE.DirectionalLight(0xffffff, 0.45);
    dL1.position.set(-3, 0, 1.5);
    camera.add(dL1);
    var dL2 = new THREE.DirectionalLight(0xffffff, 0.45);
    dL2.position.set(3, 0, 1.5);
    camera.add(dL2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 150, 0);

    updateSectionRings();
    if (typeof setupListeners === 'function') setupListeners();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function updateBouteille() {
    updateSectionRings();
}
