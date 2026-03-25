// js/ui/gravure.js
// UI du panneau Gravures : ajout/suppression de cartes, fichier PNG, réglages (Y, angle, taille, relief).
// Données exposées : window.getEngravingsData(), window.removeEngraving(), window.engravingImages.

const btnAddEngraving = document.getElementById('btn-add-engraving');
const engravingsContainer = document.getElementById('engravings-container');
let gravureCounter = 0;

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
function updateEngravingTitles() {
    const items = document.querySelectorAll('.gravure-item');
    items.forEach((item, index) => {
        const btn = item.querySelector('.accordion');
        if (btn) {
            btn.textContent = `Gravure ${index + 1}`;
        }
    });
}

// ---------------------------------------------------------------------------
// UI: ajout d'une carte gravure
// ---------------------------------------------------------------------------
btnAddEngraving.addEventListener('click', () => {
    const id = Date.now();
    gravureCounter++;

    const card = document.createElement('div');
    card.className = 'setting-card setting-card--rattachement gravure-item';
    card.id = `gravure-${id}`;
    card.dataset.id = id;
    
    card.innerHTML = `
        <button class="accordion sub-accordion">Gravure ${gravureCounter}</button>
        <div class="panel-controls">

            <div class="control-group">
                <div class="label-row"><label>Fichier image (PNG)</label></div>
                <div class="gravure-file-row">
                    <button type="button" class="gravure-file-btn">Parcourir…</button>
                    <input type="file" id="gravure-file-${id}" class="gravure-file" accept=".png,image/png,image/*" data-id="${id}">
                    <span id="gravure-filename-${id}" class="gravure-filename"></span>
                </div>
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label for="gravure-flip-${id}">Miroir</label>
                    <div class="input-wrapper">
                        <input type="checkbox" class="gravure-flip" id="gravure-flip-${id}">
                    </div>
                </div>
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label for="gravure-invert-${id}">Inverser</label>
                    <div class="input-wrapper">
                        <input type="checkbox" class="gravure-invert" id="gravure-invert-${id}">
                    </div>
                </div>
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Hauteur (Y)</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-y-num-${id}" value="150" min="10" max="350">
                        <span class="unit">mm</span>
                    </div>
                </div>
                <input type="range" class="gravure-y" id="gravure-y-slider-${id}" min="10" max="350" step="1" value="150">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Angle (rotation)</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-angle-num-${id}" value="0" min="0" max="360">
                        <span class="unit">°</span>
                    </div>
                </div>
                <input type="range" class="gravure-angle" id="gravure-angle-slider-${id}" min="0" max="360" step="1" value="0">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Taille</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-largeur-num-${id}" value="50" min="10" max="150">
                        <span class="unit">mm</span>
                    </div>
                </div>
                <input type="range" class="gravure-largeur" id="gravure-largeur-slider-${id}" min="10" max="150" step="1" value="50">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Relief</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-profondeur-num-${id}" value="1.5" min="0.1" max="5" step="0.1">
                        <span class="unit">mm</span>
                    </div>
                </div>
                <input type="range" class="gravure-profondeur" id="gravure-profondeur-slider-${id}" min="0.1" max="5" step="0.1" value="1.5">
            </div>

            <div class="control-group">
                <button type="button" class="btn-remove-gravure" onclick="removeEngraving(${id})">Supprimer la gravure</button>
            </div>

        </div>
    `;

    engravingsContainer.appendChild(card);

    updateEngravingTitles();

    const accBtn = card.querySelector('.accordion');
    accBtn.onclick = function() {
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight && panel.style.maxHeight !== "0px") {
            panel.style.maxHeight = "0px";
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    };

    const fileInput = card.querySelector('.gravure-file');
    const fileBtn = card.querySelector('.gravure-file-btn');
    const fileRow = card.querySelector('.gravure-file-row');
    const fileNameDisplay = card.querySelector(`#gravure-filename-${id}`);

    fileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    const handleSelectedFile = (file) => {
        if (!file) {
            fileNameDisplay.textContent = "";
            return;
        }

        const lowerName = (file.name || "").toLowerCase();
        const isPngMime = file.type === 'image/png';
        const isPngExt = lowerName.endsWith('.png');
        if (!isPngMime && !isPngExt) {
            fileNameDisplay.textContent = "Fichier non PNG";
            fileInput.value = "";
            return;
        }
        
        fileNameDisplay.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                window.engravingImages[id] = img;
                if (typeof updateBouteille === 'function') updateBouteille();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleSelectedFile(file);
    });

    // Fallback macOS/SaaS: autoriser le glisser-déposer du PNG
    fileRow.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileRow.classList.add('drag-over');
    });
    fileRow.addEventListener('dragleave', () => {
        fileRow.classList.remove('drag-over');
    });
    fileRow.addEventListener('drop', (e) => {
        e.preventDefault();
        fileRow.classList.remove('drag-over');
        const file = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null;
        handleSelectedFile(file);
    });

    const syncInputs = (numId, sliderId) => {
        const num = document.getElementById(numId);
        const slider = document.getElementById(sliderId);

        num.addEventListener('input', () => {
            slider.value = num.value;
            if (typeof updateBouteille === 'function') updateBouteille();
        });

        slider.addEventListener('input', () => {
            num.value = slider.value;
            if (typeof updateBouteille === 'function') updateBouteille();
        });
    };

    syncInputs(`gravure-y-num-${id}`, `gravure-y-slider-${id}`);
    syncInputs(`gravure-angle-num-${id}`, `gravure-angle-slider-${id}`);
    syncInputs(`gravure-largeur-num-${id}`, `gravure-largeur-slider-${id}`);
    syncInputs(`gravure-profondeur-num-${id}`, `gravure-profondeur-slider-${id}`);

    const flipCheckbox = document.getElementById(`gravure-flip-${id}`);
    flipCheckbox.addEventListener('change', () => {
        if (typeof updateBouteille === 'function') updateBouteille();
    });

    const invertCheckbox = document.getElementById(`gravure-invert-${id}`);
    invertCheckbox.addEventListener('change', () => {
        if (typeof updateBouteille === 'function') updateBouteille();
    });
});

// ---------------------------------------------------------------------------
// API globale utilisée par le reste de l'app
// ---------------------------------------------------------------------------
window.removeEngraving = function(id) {
    const card = document.getElementById(`gravure-${id}`);
    if (card) {
        card.remove();
        updateEngravingTitles();
    }
    delete window.engravingImages[id];
    if (typeof updateBouteille === 'function') updateBouteille();
};

window.getEngravingsData = function() {
    const items = document.querySelectorAll('.gravure-item');
    const data = [];
    items.forEach(item => {
        const id = item.dataset.id;
        data.push({
            id: id,
            y: parseFloat(item.querySelector('.gravure-y').value),
            angle: parseFloat(item.querySelector('.gravure-angle').value) * Math.PI / 180,
            width: parseFloat(item.querySelector('.gravure-largeur').value),
            depth: parseFloat(item.querySelector('.gravure-profondeur').value),
            flip: item.querySelector('.gravure-flip').checked,
            invert: item.querySelector('.gravure-invert').checked
        });
    });
    return data;
};

// ---------------------------------------------------------------------------
// Rendu 3D des gravures (PNG -> extrusion projetée sur bouteille)
// ---------------------------------------------------------------------------
var Gravure3D = (function () {
    var engravingGroup = null;

    function disposeGroup(group) {
        if (!group) return;
        group.traverse(function (obj) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    for (var i = 0; i < obj.material.length; i++) obj.material[i].dispose();
                } else {
                    obj.material.dispose();
                }
            }
        });
    }

    function getInterpolatedSectionAtY(sections, y) {
        if (!sections || !sections.length) return { a: 1, b: 1 };
        if (sections.length === 1) return { a: Math.max(1, sections[0].a), b: Math.max(1, sections[0].b) };
        if (y <= sections[0].H) return { a: Math.max(1, sections[0].a), b: Math.max(1, sections[0].b) };
        var last = sections[sections.length - 1];
        if (y >= last.H) return { a: Math.max(1, last.a), b: Math.max(1, last.b) };

        for (var i = 0; i < sections.length - 1; i++) {
            var s0 = sections[i];
            var s1 = sections[i + 1];
            if (y < s0.H || y > s1.H) continue;
            var dy = s1.H - s0.H;
            var t = dy > 1e-6 ? ((y - s0.H) / dy) : 0;
            return {
                a: Math.max(1, s0.a + (s1.a - s0.a) * t),
                b: Math.max(1, s0.b + (s1.b - s0.b) * t)
            };
        }
        return { a: Math.max(1, last.a), b: Math.max(1, last.b) };
    }

    function getRadiusAtYTheta(sections, y, theta) {
        var sec = getInterpolatedSectionAtY(sections, y);
        var c = Math.cos(theta);
        var s = Math.sin(theta);
        var denom = Math.sqrt((c * c) / (sec.a * sec.a) + (s * s) / (sec.b * sec.b));
        if (!isFinite(denom) || denom < 1e-9) return Math.max(sec.a, sec.b);
        return 1 / denom;
    }

    function createRadiusSampler(surfaceInput) {
        var sectionsData = null;
        if (Array.isArray(surfaceInput)) {
            sectionsData = { sections: surfaceInput, edgeTypes: [], rhos: [] };
        } else if (surfaceInput && surfaceInput.sections && Array.isArray(surfaceInput.sections)) {
            sectionsData = surfaceInput;
        } else {
            sectionsData = { sections: [] };
        }
        var sections = sectionsData.sections || [];
        var canUseProfile = typeof BottleMaths !== 'undefined' && typeof GeomKernel !== 'undefined'
            && BottleMaths.buildExteriorProfile && GeomKernel.tessellateProfile
            && sectionsData.edgeTypes && sectionsData.rhos;
        var cache = {};

        function radiusFromProfile(y, theta) {
            var key = String(Math.round(theta * 10000) / 10000);
            var profile = cache[key];
            if (!profile) {
                var entities = BottleMaths.buildExteriorProfile(theta, sectionsData);
                profile = GeomKernel.tessellateProfile(entities, 48) || [];
                cache[key] = profile;
            }
            if (!profile.length) return getRadiusAtYTheta(sections, y, theta);

            var nearest = profile[0];
            var nearestDy = Math.abs(nearest.y - y);
            for (var i = 0; i < profile.length - 1; i++) {
                var p0 = profile[i];
                var p1 = profile[i + 1];
                var minY = Math.min(p0.y, p1.y);
                var maxY = Math.max(p0.y, p1.y);
                var d0 = Math.abs(p0.y - y);
                if (d0 < nearestDy) { nearestDy = d0; nearest = p0; }
                if (y < minY || y > maxY) continue;
                var dy = p1.y - p0.y;
                if (Math.abs(dy) < 1e-9) return Math.max(0, p0.x);
                var t = (y - p0.y) / dy;
                return Math.max(0, p0.x + (p1.x - p0.x) * t);
            }
            return Math.max(0, nearest.x);
        }

        return function (y, theta) {
            if (!sections.length) return 1;
            return canUseProfile ? radiusFromProfile(y, theta) : getRadiusAtYTheta(sections, y, theta);
        };
    }

    function getSurfacePoint(radiusAt, y, theta) {
        var r = radiusAt(y, theta);
        return { x: r * Math.cos(theta), y: y, z: r * Math.sin(theta), r: r };
    }

    function buildEngravingsGroup(surfaceInput) {
        if (typeof window === 'undefined' || typeof THREE === 'undefined') return null;
        if (typeof window.getEngravingsData !== 'function') return null;
        var engravings = window.getEngravingsData();
        if (!engravings || !engravings.length) return null;
        var images = window.engravingImages || {};
        var group = new THREE.Group();
        var sections = Array.isArray(surfaceInput) ? surfaceInput : ((surfaceInput && surfaceInput.sections) ? surfaceInput.sections : []);
        var radiusAt = createRadiusSampler(surfaceInput);
        var surfaceInfluences = [];

        function getAccumulatedSurfaceOffset(y, theta) {
            var offset = 0;
            for (var i = 0; i < surfaceInfluences.length; i++) {
                offset += surfaceInfluences[i](y, theta);
            }
            return offset;
        }

        function createInfluenceSampler(meta, mask, gridW, gridH) {
            var thetaSpan = meta.widthMM / Math.max(1e-6, meta.baseRadius);
            var thetaMin = meta.baseAngle - thetaSpan * 0.5;
            var thetaMax = meta.baseAngle + thetaSpan * 0.5;
            var yMin = meta.centerY - meta.heightMM * 0.5;
            var yMax = meta.centerY + meta.heightMM * 0.5;

            return function (y, theta) {
                if (y < yMin || y > yMax || theta < thetaMin || theta > thetaMax) return 0;
                var v = 0.5 - ((y - meta.centerY) / meta.heightMM);
                var xCentered = (theta - meta.baseAngle) * meta.baseRadius;
                var u = (xCentered / meta.widthMM) + 0.5;
                if (meta.flip) u = 1 - u;
                if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

                var ix = Math.max(0, Math.min(gridW - 1, Math.floor(u * gridW)));
                var iy = Math.max(0, Math.min(gridH - 1, Math.floor(v * gridH)));
                if (mask[iy * gridW + ix] !== 1) return 0;
                return meta.invert ? -meta.depthMM : meta.depthMM;
            };
        }

        for (var gi = 0; gi < engravings.length; gi++) {
            var g = engravings[gi];
            var img = images[g.id];
            if (!img || !img.width || !img.height) continue;

            var widthMM = Math.max(1, parseFloat(g.width) || 50);
            var depthMM = Math.max(0.05, parseFloat(g.depth) || 1.5);
            var centerY = parseFloat(g.y);
            if (!isFinite(centerY)) centerY = 150;
            var baseAngle = parseFloat(g.angle);
            if (!isFinite(baseAngle)) baseAngle = 0;
            var flip = !!g.flip;
            var invert = !!g.invert;
            var heightMM = widthMM * (img.height / img.width);
            var baseRadius = Math.max(1, radiusAt(centerY, baseAngle));

            var off = document.createElement('canvas');
            // Qualite: lecture de pixels plus fine + maillage plus dense.
            var gridW = Math.max(64, Math.min(320, Math.ceil(img.width / 2)));
            var gridH = Math.max(64, Math.min(320, Math.ceil(img.height / 2)));
            var srcMax = 1024;
            var srcScale = Math.min(1, srcMax / Math.max(img.width, img.height));
            var srcW = Math.max(1, Math.round(img.width * srcScale));
            var srcH = Math.max(1, Math.round(img.height * srcScale));
            off.width = srcW;
            off.height = srcH;
            var ctx = off.getContext('2d');
            if (!ctx) continue;
            ctx.clearRect(0, 0, off.width, off.height);
            ctx.drawImage(img, 0, 0, srcW, srcH);
            var pixels = ctx.getImageData(0, 0, off.width, off.height).data;

            function alphaAtUV(u, v) {
                var x = Math.max(0, Math.min(srcW - 1, Math.round(u * (srcW - 1))));
                var y = Math.max(0, Math.min(srcH - 1, Math.round(v * (srcH - 1))));
                return pixels[(y * srcW + x) * 4 + 3] / 255;
            }

            var mask = new Uint8Array(gridW * gridH);
            function isSolid(ix, iy) {
                if (ix < 0 || iy < 0 || ix >= gridW || iy >= gridH) return false;
                return mask[iy * gridW + ix] === 1;
            }

            for (var my = 0; my < gridH; my++) {
                for (var mx = 0; mx < gridW; mx++) {
                    var u0 = mx / gridW;
                    var v0 = my / gridH;
                    var du = 1 / gridW;
                    var dv = 1 / gridH;
                    // Super-sampling 4 points pour des contours plus propres.
                    var c1 = alphaAtUV(u0 + du * 0.25, v0 + dv * 0.25);
                    var c2 = alphaAtUV(u0 + du * 0.75, v0 + dv * 0.25);
                    var c3 = alphaAtUV(u0 + du * 0.25, v0 + dv * 0.75);
                    var c4 = alphaAtUV(u0 + du * 0.75, v0 + dv * 0.75);
                    var coverage = (c1 + c2 + c3 + c4) * 0.25;
                    mask[my * gridW + mx] = coverage >= 0.35 ? 1 : 0;
                }
            }

            var vertices = [];
            var indices = [];
            var cutVertices = [];
            var cutIndices = [];

            function pushPoint(uRaw, vRaw, outwardDepth) {
                var uMap = flip ? (1 - uRaw) : uRaw;
                var xCentered = (uMap - 0.5) * widthMM;
                var yMM = centerY + (0.5 - vRaw) * heightMM;
                var dTheta = xCentered / baseRadius;
                var theta = baseAngle + dTheta;
                var surf = getSurfacePoint(radiusAt, yMM, theta);
                var surfaceOffset = getAccumulatedSurfaceOffset(yMM, theta);
                var nx = Math.cos(theta);
                var nz = Math.sin(theta);
                vertices.push(
                    surf.x + nx * (surfaceOffset + outwardDepth),
                    yMM,
                    surf.z + nz * (surfaceOffset + outwardDepth)
                );
                return (vertices.length / 3) - 1;
            }

            function addQuad(a, b, c, d) {
                indices.push(a, b, c);
                indices.push(a, c, d);
            }

            function addCutQuad(a, b, c, d) {
                cutIndices.push(a, b, c);
                cutIndices.push(a, c, d);
            }

            function pushCutPoint(uRaw, vRaw) {
                var uMap = flip ? (1 - uRaw) : uRaw;
                var xCentered = (uMap - 0.5) * widthMM;
                var yMM = centerY + (0.5 - vRaw) * heightMM;
                var dTheta = xCentered / baseRadius;
                var theta = baseAngle + dTheta;
                var surf = getSurfacePoint(radiusAt, yMM, theta);
                var nx = Math.cos(theta);
                var nz = Math.sin(theta);
                var eps = 0.08;
                cutVertices.push(
                    surf.x + nx * eps,
                    yMM,
                    surf.z + nz * eps
                );
                return (cutVertices.length / 3) - 1;
            }

            for (var y = 0; y < gridH; y++) {
                for (var x = 0; x < gridW; x++) {
                    if (!isSolid(x, y)) continue;

                    var u0 = x / gridW;
                    var u1 = (x + 1) / gridW;
                    var v0 = y / gridH;
                    var v1 = (y + 1) / gridH;

                    // Face d'extrémité : en mode inversé, elle sert de "fond" de cavité.
                    var dirDepth = invert ? -depthMM : depthMM;
                    var t00 = pushPoint(u0, v0, dirDepth);
                    var t10 = pushPoint(u1, v0, dirDepth);
                    var t11 = pushPoint(u1, v1, dirDepth);
                    var t01 = pushPoint(u0, v1, dirDepth);
                    addQuad(t00, t10, t11, t01);

                    // Face d'ouverture sur la peau :
                    // - mode normal : fermée à la surface
                    // - mode inversé : découpée via pass depth-only
                    var b00 = pushPoint(u0, v0, 0);
                    var b10 = pushPoint(u1, v0, 0);
                    var b11 = pushPoint(u1, v1, 0);
                    var b01 = pushPoint(u0, v1, 0);
                    if (!invert) {
                        addQuad(b01, b11, b10, b00);
                    } else {
                        var c00 = pushCutPoint(u0, v0);
                        var c10 = pushCutPoint(u1, v0);
                        var c11 = pushCutPoint(u1, v1);
                        var c01 = pushCutPoint(u0, v1);
                        addCutQuad(c01, c11, c10, c00);
                    }

                    // Faces latérales uniquement en bord de masque -> solide fermé sans trous
                    if (!isSolid(x - 1, y)) addQuad(b00, t00, t01, b01); // gauche
                    if (!isSolid(x + 1, y)) addQuad(b11, t11, t10, b10); // droite
                    if (!isSolid(x, y - 1)) addQuad(b10, t10, t00, b00); // haut
                    if (!isSolid(x, y + 1)) addQuad(b01, t01, t11, b11); // bas
                }
            }

            if (!indices.length) continue;
            var geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geom.setIndex(indices);
            geom.computeVertexNormals();

            var mat = (typeof BottleMaterials !== 'undefined' && BottleMaterials.getGlassMaterial)
                ? BottleMaterials.getGlassMaterial(BottleMaterials.DEFAULT_GLASS_COLOR)
                : new THREE.MeshPhongMaterial({ color: 0x99bbdd, side: THREE.DoubleSide });
            if (invert) {
                // Cavité visible avec la même teinte que la bouteille.
                mat = (typeof BottleMaterials !== 'undefined' && BottleMaterials.getGlassMaterial)
                    ? BottleMaterials.getGlassMaterial(BottleMaterials.DEFAULT_GLASS_COLOR)
                    : new THREE.MeshPhongMaterial({ color: 0x99bbdd, side: THREE.DoubleSide });
                mat.depthTest = true;
                mat.depthWrite = true;
                mat.polygonOffset = true;
                mat.polygonOffsetFactor = -2;
                mat.polygonOffsetUnits = -2;
                mat.shininess = 8;
            }
            mat.side = THREE.DoubleSide;
            if (!invert) mat.depthWrite = true;

            var mesh = new THREE.Mesh(geom, mat);
            if (invert) mesh.renderOrder = 0;
            group.add(mesh);

            if (invert) {
                // Contour de cavité pour garder la lecture visuelle, quel que soit l'angle.
                var edgeGeom = new THREE.EdgesGeometry(geom, 35);
                var edgeMat = new THREE.LineBasicMaterial({ color: 0x0f2535 });
                edgeMat.depthTest = true;
                edgeMat.depthWrite = true;
                var edgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
                edgeLines.renderOrder = 1;
                group.add(edgeLines);

                if (cutIndices.length) {
                    var cutGeom = new THREE.BufferGeometry();
                    cutGeom.setAttribute('position', new THREE.Float32BufferAttribute(cutVertices, 3));
                    cutGeom.setIndex(cutIndices);
                    cutGeom.computeVertexNormals();

                    var cutMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
                    cutMat.colorWrite = false;
                    cutMat.depthWrite = true;
                    cutMat.depthTest = true;
                    cutMat.transparent = false;
                    cutMat.blending = THREE.NoBlending;

                    var cutMesh = new THREE.Mesh(cutGeom, cutMat);
                    cutMesh.renderOrder = 10;
                    group.add(cutMesh);
                }
            }

            // Cette gravure modifie la peau pour les gravures suivantes.
            surfaceInfluences.push(createInfluenceSampler({
                widthMM: widthMM,
                heightMM: heightMM,
                depthMM: depthMM,
                centerY: centerY,
                baseAngle: baseAngle,
                baseRadius: baseRadius,
                invert: invert,
                flip: flip
            }, mask, gridW, gridH));
        }

        return group.children.length ? group : null;
    }

    function updateScene(scene, surfaceInput) {
        if (!scene || !surfaceInput) return;
        if (engravingGroup) {
            scene.remove(engravingGroup);
            disposeGroup(engravingGroup);
            engravingGroup = null;
        }
        engravingGroup = buildEngravingsGroup(surfaceInput);
        if (engravingGroup) scene.add(engravingGroup);
    }

    return {
        updateScene: updateScene
    };
})();
