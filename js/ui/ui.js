const pageMenu = document.getElementById('Page-menu');
const pageBouteille = document.getElementById('Page-Bouteille');
const btnNewProject = document.getElementById('btn-new-project');

viewport3D = document.getElementById('viewport-3d');

// ==========================================
// PANNEAU GAUCHE — Menu gauche (Sections | Gravure) ; barre (Sections actuelles | Piqûre)
// ==========================================
function setupPanelTabs() {
    const tabSections = document.getElementById('panel-tab-sections');
    const tabGravure = document.getElementById('panel-tab-gravure');
    const tabInformation = document.getElementById('panel-tab-information');
    const sectionsArea = document.getElementById('panel-sections-area');
    const contentGravure = document.getElementById('panel-content-gravure');
    const contentInformation = document.getElementById('panel-content-information');
    const contentSections = document.getElementById('panel-content-sections');
    const contentPiqure = document.getElementById('panel-content-piqure');
    const contentBague = document.getElementById('panel-content-bague');
    const barTabSections = document.getElementById('panel-bar-tab-sections');
    const barTabPiqure = document.getElementById('panel-bar-tab-piqure');
    const barTabBague = document.getElementById('panel-bar-tab-bague');
    if (!sectionsArea || !contentGravure || !contentInformation || !contentSections || !contentPiqure || !contentBague) return;

    function addTabInteraction(el, handler) {
        if (!el || !handler) return;
        el.addEventListener('click', handler);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
    }

    /* Seules les icônes de la colonne logo (🥃 / ✏️) contrôlent l’affichage Sections / Gravure. */
    function showLeftSections() {
        sectionsArea.classList.remove('hidden');
        contentGravure.classList.add('hidden');
        contentInformation.classList.add('hidden');
        if (tabSections) tabSections.classList.add('active');
        if (tabGravure) tabGravure.classList.remove('active');
        if (tabInformation) tabInformation.classList.remove('active');
    }
    function showLeftGravure() {
        sectionsArea.classList.add('hidden');
        contentGravure.classList.remove('hidden');
        contentInformation.classList.add('hidden');
        if (tabSections) tabSections.classList.remove('active');
        if (tabGravure) tabGravure.classList.add('active');
        if (tabInformation) tabInformation.classList.remove('active');
    }
    function showLeftInformation() {
        sectionsArea.classList.add('hidden');
        contentGravure.classList.add('hidden');
        contentInformation.classList.remove('hidden');
        if (tabSections) tabSections.classList.remove('active');
        if (tabGravure) tabGravure.classList.remove('active');
        if (tabInformation) tabInformation.classList.add('active');
    }
    function showBarSections() {
        contentSections.classList.remove('hidden');
        contentPiqure.classList.add('hidden');
        contentBague.classList.add('hidden');
        if (barTabSections) barTabSections.classList.add('active');
        if (barTabPiqure) barTabPiqure.classList.remove('active');
        if (barTabBague) barTabBague.classList.remove('active');
        if (typeof updateBouteille === 'function') updateBouteille();
    }
    function showBarPiqure() {
        contentSections.classList.add('hidden');
        contentPiqure.classList.remove('hidden');
        contentBague.classList.add('hidden');
        if (barTabSections) barTabSections.classList.remove('active');
        if (barTabPiqure) barTabPiqure.classList.add('active');
        if (barTabBague) barTabBague.classList.remove('active');
        if (typeof updateBouteille === 'function') updateBouteille();
    }
    function showBarBague() {
        contentSections.classList.add('hidden');
        contentPiqure.classList.add('hidden');
        contentBague.classList.remove('hidden');
        if (barTabSections) barTabSections.classList.remove('active');
        if (barTabPiqure) barTabPiqure.classList.remove('active');
        if (barTabBague) barTabBague.classList.add('active');
        if (typeof updateBouteille === 'function') updateBouteille();
    }

    addTabInteraction(tabSections, showLeftSections);
    addTabInteraction(tabGravure, showLeftGravure);
    addTabInteraction(tabInformation, showLeftInformation);
    addTabInteraction(barTabSections, showBarSections);
    addTabInteraction(barTabPiqure, showBarPiqure);
    addTabInteraction(barTabBague, showBarBague);

    showLeftSections();
    showBarSections();

    /* Les deux icônes au-dessus des blocs n’ont aucun lien avec le menu à gauche : pas de listener, pas d’action sur le contenu. */
}

// ==========================================
// NAVIGATION GLOBALE (MENU)
// ==========================================

if (btnNewProject && pageMenu && pageBouteille) {
    btnNewProject.addEventListener('click', () => {
        currentFileHandle = null;
        pageMenu.classList.add('hidden');
        pageBouteille.classList.remove('hidden');
        setTimeout(() => {
            if (typeof initLogiciel === 'function' && !isLogicielInit) {
                initLogiciel();
                isLogicielInit = true;
            }
            if (typeof updateBouteille === 'function') updateBouteille();
        }, 50);
    });
}

// Retour au site web depuis le menu "Fichier"
const btnBackMenu = document.getElementById('btn-back-menu');
if (btnBackMenu) {
    btnBackMenu.addEventListener('click', () => {
        document.getElementById('fichier-dropdown').classList.add('hidden');
        window.location.href = 'index.html';
    });
}

// ==========================================
// GESTION DU MENU DÉROULANT "FICHIER"
// ==========================================

const btnFichierMenu = document.getElementById('btn-fichier-menu');
const fichierDropdown = document.getElementById('fichier-dropdown');

if (btnFichierMenu && fichierDropdown) {
    btnFichierMenu.addEventListener('click', (e) => {
        e.stopPropagation(); 
        fichierDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!fichierDropdown.contains(e.target) && e.target !== btnFichierMenu) {
            fichierDropdown.classList.add('hidden');
        }
    });
}

// ==========================================
// NAVIGATION ONGLETS (3D / 2D)
// ==========================================

const btn3D = document.getElementById('btn-view-3d');
const btn2D = document.getElementById('btn-view-2d');
const view3D = document.getElementById('viewport-3d');
const view2D = document.getElementById('viewport-2d');

function switchView(activeBtn, activeView) {
    if (!btn3D || !btn2D || !view3D || !view2D) return;
    btn3D.classList.remove('active');
    btn2D.classList.remove('active');
    view3D.classList.add('hidden');
    view2D.classList.add('hidden');
    
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');

    if (activeBtn === btn2D) {
        if (typeof resizeCanvas2D === 'function') resizeCanvas2D();
        if (typeof draw2D === 'function') draw2D();
    }
}

if (btn3D && btn2D && view3D && view2D) {
    btn3D.addEventListener('click', () => switchView(btn3D, view3D));
    btn2D.addEventListener('click', () => switchView(btn2D, view2D));
}

// ==========================================
// GESTION DES INPUTS ET ACCORDEONS
// ==========================================

let updateTimer;

// Les règles de clamp utilisateur sont centralisées dans js/state/validator.js

function setupListeners() {
    const MAIN_RATTACHEMENTS = [
        { id: 'r12', fromSection: 1, toSection: 2 },
        { id: 'r23', fromSection: 2, toSection: 3 },
        { id: 'r34', fromSection: 3, toSection: 4 },
        { id: 'r45', fromSection: 4, toSection: 5 }
    ];

    /** Pour la spline (Bézier quadratique, amp = R * 0.3), retourne le max R dans [0, 250] tel que la courbe reste à au moins 10 mm de l'axe (x >= 10). */
    var SPLINE_MARGIN_AXIS_MM = 5;
    function computeSplineMaxR(p0, p1) {
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1e-6) return 250;
        var nx = -dy / d;
        var ny = dx / d;
        var x0 = p0.x;
        var x1 = p1.x;
        var xMinAllowed = SPLINE_MARGIN_AXIS_MM;
        var low = 0;
        var high = 250;
        var steps = 24;
        for (var i = 0; i < steps; i++) {
            var R = (low + high) * 0.5;
            var amp = R * 0.3;
            var cx = (x0 + x1) * 0.5 + nx * amp;
            var minX = Math.min(x0, x1);
            var denom = 2 * cx - x0 - x1;
            if (Math.abs(denom) > 1e-9) {
                var t = (cx - x0) / denom;
                if (t > 0 && t < 1) {
                    var oneMinusT = 1 - t;
                    var xT = oneMinusT * oneMinusT * x0 + 2 * oneMinusT * t * cx + t * t * x1;
                    minX = Math.min(minX, xT);
                }
            }
            if (minX >= xMinAllowed) low = R; else high = R;
        }
        return Math.max(0, (low + high) * 0.5);
    }

    const inputs = document.querySelectorAll('input[type=range], input[type=number], select, input[type=checkbox]');
    
    inputs.forEach(input => {
        if (input.classList.contains('gravure-y') || input.classList.contains('gravure-angle') || input.classList.contains('gravure-largeur') || input.classList.contains('gravure-profondeur')) return;

        const onUpdate = () => {
            const controlGroup = input.closest('.control-group');
            if (controlGroup) {
                if (input.type === 'range') {
                    const num = controlGroup.querySelector('input[type=number]');
                    if (num && num !== input) num.value = input.value;
                    const valSpan = controlGroup.querySelector('.carre-niveau-value');
                    if (valSpan) valSpan.textContent = input.value + ' %';
                } else if (input.type === 'number') {
                    const rng = controlGroup.querySelector('input[type=range]');
                    if (rng && rng !== input) rng.value = input.value;
                }
            }

            // Validation globale des hauteurs de sections (1 à 5) via Validator
            if (typeof Validator !== 'undefined') {
                const id = input.id || '';

                if (Validator.validateSectionHeights) {
                    // IDs possibles : s1-h, s1-h-slider, ..., s5-h, s5-h-slider
                    const match = id.match(/^s([1-5])-h(?:-slider)?$/);
                    if (match) {
                        const sectionIndex = parseInt(match[1], 10);
                        const rawValue = parseFloat(input.value);
                        if (isFinite(rawValue)) {
                            const corrected = Validator.validateSectionHeights(sectionIndex, rawValue);
                            if (corrected !== rawValue) {
                                const isRange = input.type === 'range';
                                if (isRange) {
                                    input.value = corrected;
                                    const num = controlGroup && controlGroup.querySelector('input[type=number]');
                                    if (num) num.value = corrected;
                                } else {
                                    input.value = corrected;
                                    const rng = controlGroup && controlGroup.querySelector('input[type=range]');
                                    if (rng) rng.value = corrected;
                                }
                            }
                        }
                    }
                }

                if (Validator.validatePiqureHeight) {
                    // Hauteurs de piqûre : sp2-h, sp3-h, rp3-h (+ leurs sliders)
                    if (/^(sp[23]-h|rp3-h)(?:-slider)?$/.test(id)) {
                        const rawValue = parseFloat(input.value);
                        if (isFinite(rawValue)) {
                            const corrected = Validator.validatePiqureHeight(rawValue);
                            if (corrected !== rawValue) {
                                const isRange = input.type === 'range';
                                if (isRange) {
                                    input.value = corrected;
                                    const num = controlGroup && controlGroup.querySelector('input[type=number]');
                                    if (num) num.value = corrected;
                                } else {
                                    input.value = corrected;
                                    const rng = controlGroup && controlGroup.querySelector('input[type=range]');
                                    if (rng) rng.value = corrected;
                                }
                            }
                        }
                    }
                }
            }
            if (typeof Validator !== 'undefined' && Validator.applyAllUserConstraints) {
                Validator.applyAllUserConstraints();
            }
            // Section corps (s1..s5) : hauteur ou L/P modifiés -> bornes Courbe S puis adapter les ρ.
            var id = input.id || '';
            if (/^s[1-5]-(h|L|P)(?:-slider)?$/.test(id)) {
                updateCourbeSSliderLimits();
                updateCourbeSRhosFromDistance();
            }
            // Utilisateur a changé le ρ d'un rattachement en Courbe S -> enregistrer le rapport ρ/d.
            var rhoMatch = id.match(/^(r12|r23|r34|r45)-rho(?:-slider)?$/);
            if (rhoMatch) {
                var rattId = rhoMatch[1];
                var typeSelect = document.getElementById(rattId + '-type');
                if (typeSelect && typeSelect.value === 'courbeS') {
                    var cfg = MAIN_RATTACHEMENTS.find(function (c) { return c.id === rattId; });
                    if (cfg) {
                        var d = getDistanceForRattachement(cfg);
                        var rhoVal = parseFloat(input.value);
                        if (isFinite(rhoVal) && d >= 1e-6) storeCourbeSRatio(rattId, rhoVal, d);
                    }
                }
            }
            // Les modifications de sections peuvent rendre un rayon possible/impossible
            // ou changer sa valeur géométrique, et la limite max spline (surfaces qui se touchent).
            updateRayonAutoValues();
            updateSplineMaxLimits();
            clearTimeout(updateTimer);
            updateTimer = setTimeout(() => {
                if (typeof updateBouteille === 'function') updateBouteille();
                if (typeof draw2D === 'function' && view2D && !view2D.classList.contains('hidden')) draw2D();
            }, 20);
        };
        input.addEventListener('input', onUpdate);
        if (input.tagName === 'SELECT') input.addEventListener('change', onUpdate);
    });

    function toggleCarreNiveauVisibility() {
        document.querySelectorAll('.js-carre-niveau').forEach(cg => {
            const card = cg.closest('.setting-card');
            const formeSelect = card && card.querySelector('select[id$="-forme"]');
            const isCarre = formeSelect && formeSelect.value === 'carre';
            cg.style.display = isCarre ? 'block' : 'none';
            const rng = cg.querySelector('input[type="range"]');
            const valSpan = cg.querySelector('.carre-niveau-value');
            if (rng && valSpan) valSpan.textContent = rng.value + ' %';
        });
        // Réouvrir la hauteur du panneau dépliant pour afficher le slider si visible
        document.querySelectorAll('.panel-controls').forEach(panel => {
            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    }
    function toggleRhoVisibility() {
        document.querySelectorAll('select[id$="-type"]').forEach(sel => {
            const card = sel.closest('.setting-card--rattachement');
            if (!card) return;
            const rhoGroup = card.querySelector('.js-rho-group');
            if (!rhoGroup) return;
            const numberInput = rhoGroup.querySelector('input[type="number"]');
            const rangeInput = rhoGroup.querySelector('input[type="range"]');
            const type = (sel.value || '').trim();

            if (type === 'courbeS') {
                // Courbe S : afficher le groupe Rayon (slider 5 à 400).
                var courbeSMin = 5;
                rhoGroup.style.display = 'block';
                rhoGroup.style.visibility = 'visible';
                if (rangeInput) {
                    rangeInput.style.display = 'block';
                    rangeInput.style.visibility = 'visible';
                }
                if (numberInput) {
                    numberInput.readOnly = false;
                    numberInput.min = courbeSMin;
                    numberInput.max = 400;
                    var v = parseFloat(numberInput.value);
                    if (!isFinite(v) || v < courbeSMin) { numberInput.value = courbeSMin; if (rangeInput) rangeInput.value = courbeSMin; }
                }
                if (rangeInput) {
                    rangeInput.min = courbeSMin;
                    rangeInput.max = 400;
                }
            } else if (type === 'spline') {
                // Spline : curseur au milieu (0), gauche = négatif (-250), droite = positif (+250 max, ou moins si surfaces se touchent).
                rhoGroup.style.display = 'block';
                if (rangeInput) rangeInput.style.display = 'block';
                if (numberInput) numberInput.readOnly = false;
                var splineMin = -250;
                var splineMaxBase = 250;
                var rattId = sel.id ? sel.id.replace(/-type$/, '') : '';
                var cfg = MAIN_RATTACHEMENTS.find(function (c) { return c.id === rattId; });
                var splineMax = splineMaxBase;
                if (cfg) {
                    var p0 = getSectionPointForRayon(cfg.fromSection);
                    var p1 = getSectionPointForRayon(cfg.toSection);
                    var maxR = computeSplineMaxR(p0, p1);
                    splineMax = Math.min(splineMaxBase, Math.max(0, maxR));
                }
                if (numberInput) {
                    numberInput.min = splineMin;
                    numberInput.max = splineMax;
                }
                if (rangeInput) {
                    rangeInput.min = splineMin;
                    rangeInput.max = splineMax;
                }
                // Clamper la valeur si hors plage (ex. après changement de sections ou ancienne valeur courbeS).
                var v = numberInput ? parseFloat(numberInput.value) : NaN;
                if (!isFinite(v) || v < splineMin) v = 0;
                else if (v > splineMax) v = splineMax;
                if (numberInput) numberInput.value = v;
                if (rangeInput) rangeInput.value = v;
            } else if (type === 'rayon') {
                // Cas rayon : pas de slider utilisateur, juste une valeur affichée (readonly).
                rhoGroup.style.display = 'block';
                if (rangeInput) rangeInput.style.display = 'none';
                if (numberInput) {
                    numberInput.readOnly = true;
                }
            } else {
                // Cas ligne (ou autres) : pas de contrôle de rayon du tout.
                rhoGroup.style.display = 'none';
            }
        });
        updateCourbeSSliderLimits();
        // Recalculer la hauteur des panneaux ouverts pour que le groupe Rayon (ex. Courbe S) ne soit pas coupé.
        document.querySelectorAll('.panel-controls').forEach(panel => {
            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
        requestAnimationFrame(function () {
            document.querySelectorAll('.panel-controls').forEach(panel => {
                if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });
    }
    // --- Mise à jour auto des valeurs de rayon (mode "rayon") sur le corps principal ---
    function getNumberValue(id, fallback) {
        const el = document.getElementById(id);
        if (!el) return fallback;
        const v = parseFloat(el.value);
        return isFinite(v) ? v : fallback;
    }

    function getSectionPointForRayon(sectionIndex) {
        const H = getNumberValue('s' + sectionIndex + '-h', 0);
        const L = getNumberValue('s' + sectionIndex + '-L', 0);
        const r = Math.max(0, L / 2);
        return { x: r, y: H };
    }

    function getDistanceForRattachement(cfg) {
        var p0 = getSectionPointForRayon(cfg.fromSection);
        var p1 = getSectionPointForRayon(cfg.toSection);
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Rapport ρ/d stocké par rattachement pour maintenir la forme de la Courbe S quand la distance change. */
    var courbeSRatios = {};

    /** Quand l'utilisateur change le ρ en mode Courbe S, on enregistre le rapport ρ/d pour mise à jour ultérieure. */
    function storeCourbeSRatio(rattId, rho, d) {
        if (!rattId || d < 1e-6) return;
        courbeSRatios[rattId] = rho / d;
    }

    /** Calcule le min et max R valides pour la Courbe S entre deux points (même logique que rattachements.js). */
    function getCourbeSRange(p0, p1) {
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var dSMax = 280;
        if (d < 1e-6 || d > dSMax) return null;
        var minRS = d * 0.5;
        var maxRS = minRS * 3;
        var minRSNoBoudin = minRS * 1.15;
        var midX = (p0.x + p1.x) * 0.5;
        var halfChord = d * 0.25;
        var R_maxAxis = 2 * Math.sqrt(halfChord * halfChord + midX * midX);
        var sliderMin = Math.max(5, minRSNoBoudin);
        var sliderMax = Math.min(400, maxRS, R_maxAxis);
        if (d > 150) sliderMax = Math.min(sliderMax, 120);
        if (sliderMax < sliderMin) sliderMax = sliderMin;
        return { min: Math.round(sliderMin * 10) / 10, max: Math.round(sliderMax * 10) / 10 };
    }

    /** Met à jour les min/max du slider Courbe S pour qu'ils correspondent à la plage valide (géométrie actuelle). */
    function updateCourbeSSliderLimits() {
        MAIN_RATTACHEMENTS.forEach(function (cfg) {
            var typeSelect = document.getElementById(cfg.id + '-type');
            if (!typeSelect || typeSelect.value !== 'courbeS') return;
            var p0 = getSectionPointForRayon(cfg.fromSection);
            var p1 = getSectionPointForRayon(cfg.toSection);
            var range = getCourbeSRange(p0, p1);
            var numberInput = document.getElementById(cfg.id + '-rho');
            var rangeInput = document.getElementById(cfg.id + '-rho-slider');
            if (!numberInput) return;
            var sliderMin = 5;
            var sliderMax = 400;
            if (range) {
                sliderMin = range.min;
                sliderMax = range.max;
            }
            numberInput.min = sliderMin;
            numberInput.max = sliderMax;
            if (rangeInput) {
                rangeInput.min = sliderMin;
                rangeInput.max = sliderMax;
            }
            var v = parseFloat(numberInput.value);
            if (isFinite(v)) {
                if (v < sliderMin) {
                    numberInput.value = sliderMin;
                    if (rangeInput) rangeInput.value = sliderMin;
                } else if (v > sliderMax) {
                    numberInput.value = sliderMax;
                    if (rangeInput) rangeInput.value = sliderMax;
                }
            }
        });
    }

    /** Quand les sections bougent, mettre à jour les ρ en Courbe S pour garder le même rapport ρ/d (même forme de courbe). */
    function updateCourbeSRhosFromDistance() {
        MAIN_RATTACHEMENTS.forEach(function (cfg) {
            var typeSelect = document.getElementById(cfg.id + '-type');
            if (!typeSelect || typeSelect.value !== 'courbeS') return;
            var d = getDistanceForRattachement(cfg);
            if (d < 1e-6) return;
            var numberInput = document.getElementById(cfg.id + '-rho');
            var rangeInput = document.getElementById(cfg.id + '-rho-slider');
            if (!numberInput) return;
            var currentRho = parseFloat(numberInput.value);
            if (!isFinite(currentRho)) currentRho = d * 0.6;
            var ratio = courbeSRatios[cfg.id];
            if (ratio === undefined) {
                ratio = currentRho / d;
                courbeSRatios[cfg.id] = ratio;
            }
            var rhoNew = Math.round(ratio * d * 10) / 10;
            var minR = parseFloat(numberInput.min);
            var maxR = parseFloat(numberInput.max);
            if (!isFinite(minR)) minR = 5;
            if (!isFinite(maxR)) maxR = 400;
            rhoNew = Math.max(minR, Math.min(maxR, rhoNew));
            numberInput.value = rhoNew;
            if (rangeInput) rangeInput.value = rhoNew;
        });
    }

    /** Met à jour le max du slider ρ pour les rattachements en mode spline (limite quand les surfaces se touchent). */
    function updateSplineMaxLimits() {
        MAIN_RATTACHEMENTS.forEach(function (cfg) {
            var typeSelect = document.getElementById(cfg.id + '-type');
            if (!typeSelect || typeSelect.value !== 'spline') return;
            var p0 = getSectionPointForRayon(cfg.fromSection);
            var p1 = getSectionPointForRayon(cfg.toSection);
            var maxR = computeSplineMaxR(p0, p1);
            var splineMax = Math.min(250, Math.max(0, maxR));
            var numberInput = document.getElementById(cfg.id + '-rho');
            var rangeInput = document.getElementById(cfg.id + '-rho-slider');
            if (numberInput) {
                numberInput.min = -250;
                numberInput.max = splineMax;
                var v = parseFloat(numberInput.value);
                if (isFinite(v) && v > splineMax) {
                    numberInput.value = splineMax;
                    if (rangeInput) rangeInput.value = splineMax;
                }
            }
            if (rangeInput) {
                rangeInput.min = -250;
                rangeInput.max = splineMax;
            }
        });
    }

    function updateRayonAutoValues() {
        const tolDiag = 0.5; // même tolérance que dans les maths (mm)

        MAIN_RATTACHEMENTS.forEach(cfg => {
            const typeSelect = document.getElementById(cfg.id + '-type');
            if (!typeSelect || typeSelect.value !== 'rayon') return;

            const p0 = getSectionPointForRayon(cfg.fromSection);
            const p1 = getSectionPointForRayon(cfg.toSection);
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const diff = Math.abs(Math.abs(dx) - Math.abs(dy));
            const card = document.getElementById(cfg.id + '-rho')?.closest('.setting-card');

            const inputEl = document.getElementById(cfg.id + '-rho');
            const sliderEl = document.getElementById(cfg.id + '-rho-slider');

            if (!inputEl) return;

            if (diff < tolDiag) {
                const d = Math.sqrt(dx * dx + dy * dy);
                const minR = d * 0.5;
                const val = Math.round(minR * 10) / 10; // arrondi 0.1 mm
                inputEl.value = val;
                if (sliderEl) sliderEl.value = val;
                if (card) card.classList.remove('rayon-impossible');
            } else {
                // Rayon impossible géométriquement pour la config actuelle.
                inputEl.value = '';
                if (sliderEl) sliderEl.value = '';
                if (card) card.classList.add('rayon-impossible');
            }
        });
    }

    toggleCarreNiveauVisibility();
    toggleRhoVisibility();
    updateRayonAutoValues();
    document.querySelectorAll('select[id$="-forme"]').forEach(sel => {
        sel.addEventListener('change', () => {
            toggleCarreNiveauVisibility();
            updateRayonAutoValues();
        });
    });
    document.querySelectorAll('select[id$="-type"]').forEach(sel => {
        sel.addEventListener('change', () => {
            if (sel.value === 'spline') {
                var card = sel.closest('.setting-card');
                var rhoGroup = card && card.querySelector('.js-rho-group');
                var num = rhoGroup && rhoGroup.querySelector('input[type="number"]');
                var rng = rhoGroup && rhoGroup.querySelector('input[type="range"]');
                if (num) num.value = 0;
                if (rng) rng.value = 0;
            }
            toggleRhoVisibility();
            updateRayonAutoValues();
        });
    });
    if (typeof Validator !== 'undefined' && Validator.applyAllUserConstraints) {
        Validator.applyAllUserConstraints();
    }
    var s5H = document.getElementById('s5-h');
    var sb1H = document.getElementById('sb1-h');
    var sb1HSlider = document.getElementById('sb1-h-slider');
    if (s5H && sb1H && sb1HSlider) {
        var h0 = (parseFloat(s5H.value) || 280) + 2;
        sb1H.value = h0;
        sb1HSlider.value = h0;
    }
    var sb2H = document.getElementById('sb2-h');
    var sb2HSlider = document.getElementById('sb2-h-slider');
    if (sb1H && sb2H && sb2HSlider) {
        var h2 = (parseFloat(sb1H.value) || 282) + 15;
        sb2H.value = h2;
        sb2HSlider.value = h2;
    }
    var sb3H = document.getElementById('sb3-h');
    var sb3HSlider = document.getElementById('sb3-h-slider');
    var sb3L = document.getElementById('sb3-L');
    var sb3LSlider = document.getElementById('sb3-L-slider');
    var sb3P = document.getElementById('sb3-P');
    var sb3PSlider = document.getElementById('sb3-P-slider');
    if (sb2H && sb3H && sb3HSlider) {
        var h3 = (parseFloat(sb2H.value) || 297) + 2;
        sb3H.value = h3;
        sb3HSlider.value = h3;
    }
    if (sb3L && sb3LSlider) { sb3L.value = 33; sb3LSlider.value = 33; }
    if (sb3P && sb3PSlider) { sb3P.value = 33; sb3PSlider.value = 33; }
    var sb5H = document.getElementById('sb5-h');
    var sb5HSlider = document.getElementById('sb5-h-slider');
    if (sb3H && sb5H && sb5HSlider) {
        var h5 = Math.max(0, (parseFloat(sb3H.value) || 299) - 2);
        sb5H.value = h5;
        sb5HSlider.value = h5;
    }

    const allAccordions = document.getElementsByClassName("accordion");
    const mainAccordions = document.querySelectorAll(".accordion.main-accordion");
    const subAccordions = document.querySelectorAll(".accordion.sub-accordion");

    function closeMainAccordions() {
        mainAccordions.forEach(btn => {
            btn.classList.remove("active");
            const panel = btn.nextElementSibling;
            if (panel && panel.classList.contains("panel-controls")) {
                panel.style.maxHeight = "0px";
            }
        });
    }

    function closeSubAccordions() {
        subAccordions.forEach(btn => {
            btn.classList.remove("active");
            const panel = btn.nextElementSibling;
            if (panel && panel.classList.contains("panel-controls")) {
                panel.style.maxHeight = "0px";
            }
        });
    }

    function getMainAccordionIndex(btn) {
        if (!btn.classList.contains("main-accordion")) return 0;
        for (let i = 0; i < mainAccordions.length; i++) {
            if (mainAccordions[i] === btn) return i + 1;
        }
        return 0;
    }

    for (let i = 0; i < allAccordions.length; i++) {
        allAccordions[i].onclick = function () {
            const panel = this.nextElementSibling;
            const isOpen = panel && panel.style.maxHeight && panel.style.maxHeight !== "0px";
            const isMain = this.classList.contains("main-accordion");
            const isSub = this.classList.contains("sub-accordion");

            if (isMain) {
                // Fermer uniquement les autres sections principales.
                closeMainAccordions();
                if (!isOpen) {
                    this.classList.add("active");
                    if (panel && panel.classList.contains("panel-controls")) {
                        panel.style.maxHeight = panel.scrollHeight + "px";
                    }
                    const sectionIndex = getMainAccordionIndex(this);
                    window.activeSectionIndex = sectionIndex;
                } else {
                    window.activeSectionIndex = 0;
                }
            } else if (isSub) {
                // Fermer uniquement les autres rattachements.
                closeSubAccordions();
                if (!isOpen) {
                    this.classList.add("active");
                    if (panel && panel.classList.contains("panel-controls")) {
                        panel.style.maxHeight = panel.scrollHeight + "px";
                    }
                }
            }

            if (typeof updateBouteille === 'function') updateBouteille();
        };
    }
}

if (typeof UIInspector !== 'undefined' && UIInspector.renderSections) {
    UIInspector.renderSections();
}
setupPanelTabs();
if (typeof UIEvents !== 'undefined' && UIEvents.init) UIEvents.init();
