// js/3d/bottleView.js
// Vue 3D bouteille : panel → sections → maillages (corps, piqûre, bague). Pipeline CAO.

var BottleView3D = (function () {
    /* Tessellation fine : courbes et surfaces lisses en viewport et à l’export (STL = maillage uniquement). */
    var N_SEGMENTS = 128;
    var N_FEUILLE_V = 32;
    var MERIDIAN_RESOLUTION = 64;
    var RING_COLOR_NORMAL = 0x000000;
    var RING_COLOR_HIGHLIGHT = 0x0066cc;
    window.N_SEGMENTS = N_SEGMENTS;
    window.N_FEUILLE_V = N_FEUILLE_V;
    window.MERIDIAN_RESOLUTION = MERIDIAN_RESOLUTION;

    var sectionRingGroup = null;
    var bottleInnerGlassMesh = null;

    function enableMeshShadows(obj) {
        if (!obj || typeof THREE === 'undefined') return;
        obj.traverse(function (node) {
            if (node && node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
    }

    var PIQURE_CONFIG = [
        { h: 's1-h', L: 'sp-L', P: 'sp-P', formKey: 'sp-forme', carreKey: 'sp-carre-niveau', defaultL: 58, defaultP: 58 },
        { h: 'sp2-h', L: 'sp2-L', P: 'sp2-P', formKey: 'sp2-forme', carreKey: 'sp2-carre-niveau', defaultL: 48, defaultP: 48 },
        { h: 'sp3-h', L: 'sp3-L', P: 'sp3-P', formKey: 'sp3-forme', carreKey: 'sp3-carre-niveau', defaultL: 35, defaultP: 35 }
    ];
    var BAGUE_CONFIG = [
        { h: 'sb1-h', L: 'sb1-L', P: 'sb1-P', defaultL: 35, defaultP: 35 },
        { h: 'sb2-h', L: 'sb2-L', P: 'sb2-P', defaultL: 35, defaultP: 35 },
        { h: 'sb3-h', L: 'sb3-L', P: 'sb3-P', defaultL: 33, defaultP: 33 },
        { h: 'sb4-h', L: 'sb4-L', P: 'sb4-P', defaultL: 31, defaultP: 31 },
        { h: 'sb5-h', L: 'sb5-L', P: 'sb5-P', defaultL: 29, defaultP: 29 }
    ];

    function getPanelValue(id, def) {
        var el = document.getElementById(id);
        if (!el) return def;
        var v = parseFloat(el.value);
        return isNaN(v) ? def : Math.max(0, v);
    }
    /** Pour les champs qui acceptent des négatifs (ex. spline rho). */
    function getPanelValueSigned(id, def) {
        var el = document.getElementById(id);
        if (!el) return def;
        var v = parseFloat(el.value);
        return isNaN(v) ? def : v;
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

    function getMainSectionIndicesFromDOM() {
        var inputs = document.querySelectorAll('input[id^="s"][id$="-h"]');
        var idxs = [];
        for (var i = 0; i < inputs.length; i++) {
            var id = inputs[i].id || '';
            var m = id.match(/^s(\d+)-h$/);
            if (!m) continue;
            var k = parseInt(m[1], 10);
            if (isFinite(k)) idxs.push(k);
        }
        idxs.sort(function (a, b) { return a - b; });
        // Dédupliquer
        var out = [];
        for (var j = 0; j < idxs.length; j++) {
            if (j === 0 || idxs[j] !== idxs[j - 1]) out.push(idxs[j]);
        }
        return out;
    }

    function getSectionFromPanel(cfg) {
        var H = getPanelValue(cfg.h, 0);
        var a = Math.max(0, getPanelValue(cfg.L, cfg.defaultL) / 2);
        var b = Math.max(0, getPanelValue(cfg.P, cfg.defaultP) / 2);
        var shape = cfg.shape !== undefined ? cfg.shape : getPanelSelectValue(cfg.formKey, 'rond');
        var carreNiveau = cfg.carreNiveau !== undefined ? cfg.carreNiveau : Math.max(0, Math.min(100, getPanelValue(cfg.carreKey, 0)));
        return { H: H, a: a, b: b, shape: shape, carreNiveau: carreNiveau };
    }

    function getPiqureSectionFromPanel() { return getSectionFromPanel(PIQURE_CONFIG[0]); }
    function getHautPiqureSectionFromPanel() { return getSectionFromPanel(PIQURE_CONFIG[1]); }
    function getHautPiqure3SectionFromPanel() { return getSectionFromPanel(PIQURE_CONFIG[2]); }
    function getBague1SectionFromPanel() { return getSectionFromPanel(BAGUE_CONFIG[0]); }
    function getBague2SectionFromPanel() { return getSectionFromPanel(BAGUE_CONFIG[1]); }
    function getBague3SectionFromPanel() { return getSectionFromPanel(BAGUE_CONFIG[2]); }
    function getBague4SectionFromPanel() { return getSectionFromPanel(BAGUE_CONFIG[3]); }
    function getBague5SectionFromPanel() { return getSectionFromPanel(BAGUE_CONFIG[4]); }

    function getSectionsDataFromPanel() {
        var idxs = getMainSectionIndicesFromDOM();
        if (!idxs || idxs.length < 2) {
            // fallback historique (au cas où l’inspecteur n’est pas rendu)
            idxs = [1, 2, 3, 4, 5];
        }

        var sections = [];
        for (var ii = 0; ii < idxs.length; ii++) {
            var k = idxs[ii];
            var defaultL = (k === 1) ? 71 : (k <= 3 ? 85 : 32);
            var defaultP = defaultL;
            var Hraw = getPanelValue('s' + k + '-h', 0);
            var a = Math.max(0, getPanelValue('s' + k + '-L', defaultL) / 2);
            var b = Math.max(0, getPanelValue('s' + k + '-P', defaultP) / 2);
            sections.push({ H: Hraw, a: a, b: b, shape: getSectionForme(k), carreNiveau: getSectionCarreNiveau(k) });
        }

        // Assurer des hauteurs monotones (Y(k+1) >= Y(k))
        for (var j = 1; j < sections.length; j++) {
            if (sections[j].H < sections[j - 1].H) sections[j].H = sections[j - 1].H;
        }

        var edgeTypes = [];
        var rhos = [];
        for (var e = 0; e < sections.length - 1; e++) {
            var from = e + 1;
            var to = e + 2;
            var rid = 'r' + from + to;
            edgeTypes.push(getPanelSelectValue(rid + '-type', 'ligne'));
            rhos.push(getPanelValueSigned(rid + '-rho', 10));
        }

        return { sections: sections, edgeTypes: edgeTypes, rhos: rhos };
    }

    function buildSectionRingLine(H, points, isHighlight) {
        var pts = points.map(function (p) { return new THREE.Vector3(p[0], H, p[1]); });
        var geom = new THREE.BufferGeometry().setFromPoints(pts);
        var color = isHighlight ? RING_COLOR_HIGHLIGHT : RING_COLOR_NORMAL;
        return new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: color }));
    }

    function addSectionRing(group, section, isHighlight, isPiqure) {
        if (typeof window !== 'undefined' && window.displayOptions && window.displayOptions.showSectionRings === false) return;
        var pts = BottleMaths.getSectionRingPoints(section.a, section.b, section.shape, section.carreNiveau, N_SEGMENTS);
        var ring = buildSectionRingLine(section.H, pts, isHighlight);
        ring.userData.isPiqure = isPiqure;
        group.add(ring);
    }

    function applyViewOpacity(group) {
        var isPiqureView = false;
        var piqurePanel = document.getElementById('panel-content-piqure');
        if (piqurePanel && !piqurePanel.classList.contains('hidden')) isPiqureView = true;
        for (var c = 0; c < group.children.length; c++) {
            var obj = group.children[c];
            if (!obj.material) continue;
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

    function addRuledSurfaceIndicesClosedU(indices, nu, nv, rowStride) {
        for (var i = 0; i < nu; i++) {
            var iNext = (i + 1) % nu;
            for (var j = 0; j < nv; j++) {
                var a = i * rowStride + j;
                var b = iNext * rowStride + j;
                var c = iNext * rowStride + j + 1;
                var d = i * rowStride + j + 1;
                indices.push(a, d, c);
                indices.push(a, c, b);
            }
        }
    }

    function buildPiqurePiedFeuille(s1, piqure, H) {
        var nu = N_SEGMENTS;
        var nv = N_FEUILLE_V;
        var vertices = [];
        var indices = [];
        for (var i = 0; i < nu; i++) {
            var u = (i / nu) * 2 * Math.PI;
            for (var j = 0; j <= nv; j++) {
                var v = j / nv;
                var p = BottleMaths.getRadialBandPoint(s1, piqure, H, u, v);
                vertices.push(p.x, p.y, p.z);
            }
        }
        addRuledSurfaceIndicesClosedU(indices, nu, nv, nv + 1);
        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.setIndex(indices);
        geom.computeVertexNormals();
        var mat = BottleMaterials.getGlassMaterial();
        return new THREE.Mesh(geom, mat);
    }

    function buildPiqureBasHautFeuille(piqure, hautPiqure) {
        var nu = N_SEGMENTS;
        var nv = N_FEUILLE_V;
        var vertices = [];
        var indices = [];
        for (var i = 0; i < nu; i++) {
            var u = (i / nu) * 2 * Math.PI;
            for (var j = 0; j <= nv; j++) {
                var v = j / nv;
                var p = BottleMaths.getRuledSurfacePoint(piqure, hautPiqure, u, v);
                vertices.push(p.x, p.y, p.z);
            }
        }
        addRuledSurfaceIndicesClosedU(indices, nu, nv, nv + 1);
        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.setIndex(indices);
        geom.computeVertexNormals();
        var mat = BottleMaterials.getGlassMaterial();
        return new THREE.Mesh(geom, mat);
    }

    function buildPiqureFeuilleVersAxe(section, topH) {
        var nu = N_SEGMENTS;
        var nv = N_FEUILLE_V;
        var vertices = [];
        var indices = [];
        for (var i = 0; i < nu; i++) {
            var u = (i / nu) * 2 * Math.PI;
            for (var j = 0; j <= nv; j++) {
                var v = j / nv;
                var p = BottleMaths.getConeToApexPoint(section, topH, u, v);
                vertices.push(p.x, p.y, p.z);
            }
        }
        addRuledSurfaceIndicesClosedU(indices, nu, nv, nv + 1);
        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.setIndex(indices);
        geom.computeVertexNormals();
        var mat = BottleMaterials.getGlassMaterial();
        return new THREE.Mesh(geom, mat);
    }

    function buildRuledSurfaceStrip(sections, color) {
        if (!sections || sections.length < 2) return null;
        var nu = N_SEGMENTS;
        var nv = N_FEUILLE_V;
        var K = sections.length;
        var totalRows = (K - 1) * nv + 1;
        var vertices = [];
        var indices = [];
        for (var i = 0; i < nu; i++) {
            var u = (i / nu) * 2 * Math.PI;
            for (var r = 0; r < totalRows; r++) {
                var k = Math.floor(r / nv);
                var v = (r === (K - 1) * nv) ? 1 : (r - k * nv) / nv;
                if (k >= K - 1) k = K - 2;
                var p = BottleMaths.getRuledSurfacePoint(sections[k], sections[k + 1], u, v);
                vertices.push(p.x, p.y, p.z);
            }
        }
        for (var band = 0; band < K - 1; band++) {
            for (var i = 0; i < nu; i++) {
                var iNext = (i + 1) % nu;
                for (var j = 0; j < nv; j++) {
                    var r0 = band * nv + j;
                    var r1 = band * nv + j + 1;
                    var a = i * totalRows + r0;
                    var b = iNext * totalRows + r0;
                    var c = iNext * totalRows + r1;
                    var d = i * totalRows + r1;
                    indices.push(a, d, c);
                    indices.push(a, c, b);
                }
            }
        }
        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.setIndex(indices);
        geom.computeVertexNormals();
        var mat = BottleMaterials.getGlassMaterial(color);
        return new THREE.Mesh(geom, mat);
    }


    function updateView() {
        if (!scene || typeof BottleMesh3D === 'undefined') return;
        if (typeof Validator !== 'undefined' && Validator.applyAllUserConstraints) Validator.applyAllUserConstraints();
        var sectionsData = getSectionsDataFromPanel();
        var sections = sectionsData.sections;
        var activeSection = typeof window.activeSectionIndex !== 'undefined' ? window.activeSectionIndex : 0;

        if (sectionRingGroup) scene.remove(sectionRingGroup);
        sectionRingGroup = new THREE.Group();

        if (!bottleGroup) {
            var baseMat = (typeof BottleMaterials !== 'undefined' && BottleMaterials.getBottleBodyMaterial)
                ? BottleMaterials.getBottleBodyMaterial()
                : null;
            bottleGroup = BottleMesh3D.createBottleMesh(sectionsData, baseMat);
            if (bottleGroup) {
                bottleGroup.userData = bottleGroup.userData || {};
                bottleGroup.userData.materialMode = (typeof BottleMaterials !== 'undefined' && BottleMaterials.getRenderMaterialMode)
                    ? BottleMaterials.getRenderMaterialMode()
                    : 'base';
            }
        } else {
            if (typeof BottleMaterials !== 'undefined' && BottleMaterials.getRenderMaterialMode && BottleMaterials.getBottleBodyMaterial) {
                var targetMode = BottleMaterials.getRenderMaterialMode();
                if (!bottleGroup.userData || bottleGroup.userData.materialMode !== targetMode) {
                    if (bottleGroup.material && bottleGroup.material.dispose) bottleGroup.material.dispose();
                    bottleGroup.material = BottleMaterials.getBottleBodyMaterial();
                    bottleGroup.userData = bottleGroup.userData || {};
                    bottleGroup.userData.materialMode = targetMode;
                }
            }
            BottleMesh3D.updateBottleMesh(bottleGroup, sectionsData);
        }
        if (bottleGroup) {
            bottleGroup.userData.isPiqure = false;
            enableMeshShadows(bottleGroup);
            sectionRingGroup.add(bottleGroup);
        }

        // Verre réaliste : ajouter une peau intérieure pour donner une épaisseur lisible.
        if (bottleInnerGlassMesh) {
            if (bottleInnerGlassMesh.geometry) bottleInnerGlassMesh.geometry.dispose();
            if (bottleInnerGlassMesh.material && bottleInnerGlassMesh.material.dispose) bottleInnerGlassMesh.material.dispose();
            bottleInnerGlassMesh = null;
        }
        var renderMode = (typeof BottleMaterials !== 'undefined' && BottleMaterials.getRenderMaterialMode)
            ? BottleMaterials.getRenderMaterialMode()
            : 'base';
        if (renderMode === 'glass' && bottleGroup && bottleGroup.geometry && typeof THREE !== 'undefined') {
            var innerGeom = bottleGroup.geometry.clone();
            var innerMat = (typeof BottleMaterials !== 'undefined' && BottleMaterials.getInnerGlassMaterial)
                ? BottleMaterials.getInnerGlassMaterial(BottleMaterials.DEFAULT_GLASS_COLOR)
                : BottleMaterials.getGlassMaterial(BottleMaterials.DEFAULT_GLASS_COLOR);
            bottleInnerGlassMesh = new THREE.Mesh(innerGeom, innerMat);
            bottleInnerGlassMesh.scale.set(0.955, 0.995, 0.955);
            bottleInnerGlassMesh.position.copy(bottleGroup.position);
            bottleInnerGlassMesh.rotation.copy(bottleGroup.rotation);
            bottleInnerGlassMesh.userData.isPiqure = false;
            bottleInnerGlassMesh.castShadow = false;
            bottleInnerGlassMesh.receiveShadow = true;
            sectionRingGroup.add(bottleInnerGlassMesh);
        }

        for (var i = 0; i < sections.length; i++) {
            addSectionRing(sectionRingGroup, sections[i], activeSection === i + 1, false);
        }

        // ---------- PIQÛRE (dynamique : sp + sp2..spN) ----------
        var piqure = getPiqureSectionFromPanel();
        var s1 = sections[0];
        addSectionRing(sectionRingGroup, piqure, false, true);
        var piqSections = [piqure];
        // sections sp2..spN
        var spInputs = document.querySelectorAll('input[id^="sp"][id$="-h"]');
        var spIdxs = [];
        for (var spi = 0; spi < spInputs.length; spi++) {
            var mm = (spInputs[spi].id || '').match(/^sp(\d+)-h$/);
            if (!mm) continue;
            var kk = parseInt(mm[1], 10);
            if (isFinite(kk)) spIdxs.push(kk);
        }
        spIdxs.sort(function (a, b) { return a - b; });
        // dédupe
        var spClean = [];
        for (var sck = 0; sck < spIdxs.length; sck++) if (sck === 0 || spIdxs[sck] !== spIdxs[sck - 1]) spClean.push(spIdxs[sck]);
        for (var ssi = 0; ssi < spClean.length; ssi++) {
            var ksp = spClean[ssi];
            var sec = getSectionFromPanel({ h: 'sp' + ksp + '-h', L: 'sp' + ksp + '-L', P: 'sp' + ksp + '-P', formKey: 'sp' + ksp + '-forme', carreKey: 'sp' + ksp + '-carre-niveau', defaultL: 48, defaultP: 48 });
            piqSections.push(sec);
            addSectionRing(sectionRingGroup, sec, false, true);
        }
        var feuille = buildPiqurePiedFeuille(s1, piqure, piqure.H);
        feuille.userData.isPiqure = true;
        enableMeshShadows(feuille);
        sectionRingGroup.add(feuille);
        var feuillePiqureStrip = buildRuledSurfaceStrip(piqSections, BottleMaterials.DEFAULT_GLASS_COLOR);
        if (feuillePiqureStrip) { feuillePiqureStrip.userData.isPiqure = true; enableMeshShadows(feuillePiqureStrip); sectionRingGroup.add(feuillePiqureStrip); }
        var lastP = piqSections[piqSections.length - 1];
        var rp3H = getPanelValue('rp3-h', 30);
        if (lastP && rp3H > lastP.H) {
            var feuilleVersAxe = buildPiqureFeuilleVersAxe(lastP, rp3H);
            feuilleVersAxe.userData.isPiqure = true;
            enableMeshShadows(feuilleVersAxe);
            sectionRingGroup.add(feuilleVersAxe);
        }

        // ---------- BAGUE (dynamique : sb1..sbN) ----------
        // Récupérer toutes les sections sbX-h existantes
        var sbInputs = document.querySelectorAll('input[id^="sb"][id$="-h"]');
        var sbIdxs = [];
        for (var sbi = 0; sbi < sbInputs.length; sbi++) {
            var mb = (sbInputs[sbi].id || '').match(/^sb(\d+)-h$/);
            if (!mb) continue;
            var kb = parseInt(mb[1], 10);
            if (isFinite(kb)) sbIdxs.push(kb);
        }
        sbIdxs.sort(function (a, b) { return a - b; });
        var sbClean = [];
        for (var sbc = 0; sbc < sbIdxs.length; sbc++) if (sbc === 0 || sbIdxs[sbc] !== sbIdxs[sbc - 1]) sbClean.push(sbIdxs[sbc]);
        var bagueSections = [];
        for (var bsi = 0; bsi < sbClean.length; bsi++) {
            var ksb2 = sbClean[bsi];
            var bsec = getSectionFromPanel({ h: 'sb' + ksb2 + '-h', L: 'sb' + ksb2 + '-L', P: 'sb' + ksb2 + '-P', defaultL: 35, defaultP: 35 });
            bagueSections.push(bsec);
            addSectionRing(sectionRingGroup, bsec, false, false);
        }
        var bague1 = bagueSections.length ? bagueSections[0] : getBague1SectionFromPanel();
        var sTop = sections && sections.length ? sections[sections.length - 1] : null;
        // bague1 ring déjà ajouté dans la boucle si présent
        if (sTop) {
            var feuilleColBague = buildPiqureBasHautFeuille(sTop, bague1);
            feuilleColBague.userData.isPiqure = false;
            enableMeshShadows(feuilleColBague);
            sectionRingGroup.add(feuilleColBague);
        }
        var feuilleBagueStrip = buildRuledSurfaceStrip(bagueSections.length ? bagueSections : [getBague1SectionFromPanel(), getBague2SectionFromPanel(), getBague3SectionFromPanel(), getBague4SectionFromPanel(), getBague5SectionFromPanel()], BottleMaterials.DEFAULT_GLASS_COLOR);
        if (feuilleBagueStrip) { feuilleBagueStrip.userData.isPiqure = false; enableMeshShadows(feuilleBagueStrip); sectionRingGroup.add(feuilleBagueStrip); }

        applyViewOpacity(sectionRingGroup);
        scene.add(sectionRingGroup);

        if (typeof Gravure3D !== 'undefined' && Gravure3D && Gravure3D.updateScene) {
            Gravure3D.updateScene(scene, sectionsData);
        }
    }

    /**
     * Retourne les points du profil 2D (méridien face) pour la vue plan.
     * Utilisé par viewer2d.js pour dessiner le profil avec cotations.
     */
    function getProfilePointsFor2D() {
        var sectionsData = getSectionsDataFromPanel();
        if (!sectionsData || !sectionsData.sections || sectionsData.sections.length < 2) return [];
        var entities = (typeof BottleMaths !== 'undefined' && BottleMaths.buildExteriorProfile)
            ? BottleMaths.buildExteriorProfile(0, sectionsData)
            : [];
        if (!entities || entities.length === 0) return [];
        return (typeof GeomKernel !== 'undefined' && GeomKernel.tessellateProfile)
            ? GeomKernel.tessellateProfile(entities, 32)
            : [];
    }

    return {
        updateView: updateView,
        getProfilePointsFor2D: getProfilePointsFor2D
    };
})();

window.getBottleProfileFromData = function () {
    return (typeof BottleView3D !== 'undefined' && BottleView3D.getProfilePointsFor2D)
        ? BottleView3D.getProfilePointsFor2D()
        : [];
};

