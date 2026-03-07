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
    const sectionsArea = document.getElementById('panel-sections-area');
    const contentGravure = document.getElementById('panel-content-gravure');
    const contentSections = document.getElementById('panel-content-sections');
    const contentPiqure = document.getElementById('panel-content-piqure');
    const contentBague = document.getElementById('panel-content-bague');
    const barTabSections = document.getElementById('panel-bar-tab-sections');
    const barTabPiqure = document.getElementById('panel-bar-tab-piqure');
    const barTabBague = document.getElementById('panel-bar-tab-bague');
    if (!sectionsArea || !contentGravure || !contentSections || !contentPiqure || !contentBague) return;

    /* Seules les icônes de la colonne logo (🥃 / ✏️) contrôlent l’affichage Sections / Gravure. */
    function showLeftSections() {
        sectionsArea.classList.remove('hidden');
        contentGravure.classList.add('hidden');
        if (tabSections) tabSections.classList.add('active');
        if (tabGravure) tabGravure.classList.remove('active');
    }
    function showLeftGravure() {
        sectionsArea.classList.add('hidden');
        contentGravure.classList.remove('hidden');
        if (tabSections) tabSections.classList.remove('active');
        if (tabGravure) tabGravure.classList.add('active');
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

    if (tabSections) { tabSections.addEventListener('click', showLeftSections); tabSections.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showLeftSections(); } }); }
    if (tabGravure) { tabGravure.addEventListener('click', showLeftGravure); tabGravure.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showLeftGravure(); } }); }
    if (barTabSections) { barTabSections.addEventListener('click', showBarSections); barTabSections.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showBarSections(); } }); }
    if (barTabPiqure) { barTabPiqure.addEventListener('click', showBarPiqure); barTabPiqure.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showBarPiqure(); } }); }
    if (barTabBague) { barTabBague.addEventListener('click', showBarBague); barTabBague.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showBarBague(); } }); }

    showLeftSections();
    showBarSections();

    /* Les deux icônes au-dessus des blocs n’ont aucun lien avec le menu à gauche : pas de listener, pas d’action sur le contenu. */
}

// ==========================================
// NAVIGATION GLOBALE (MENU)
// ==========================================

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
// NAVIGATION ONGLETS (3D / 2D / OUTILLAGE)
// ==========================================

const btn3D = document.getElementById('btn-view-3d');
const btn2D = document.getElementById('btn-view-2d');
const btnOutillage = document.getElementById('btn-outillage');
const view3D = document.getElementById('viewport-3d');
const view2D = document.getElementById('viewport-2d');
const viewOutillage = document.getElementById('viewport-outillage');

function switchView(activeBtn, activeView) {
    btn3D.classList.remove('active');
    btn2D.classList.remove('active');
    btnOutillage.classList.remove('active');
    view3D.classList.add('hidden');
    view2D.classList.add('hidden');
    viewOutillage.classList.add('hidden');
    
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');

    if (activeBtn === btn2D) {
        if (typeof resizeCanvas2D === 'function') resizeCanvas2D();
        if (typeof draw2D === 'function') draw2D();
    }
}

btn3D.addEventListener('click', () => switchView(btn3D, view3D));
btn2D.addEventListener('click', () => switchView(btn2D, view2D));
btnOutillage.addEventListener('click', () => switchView(btnOutillage, viewOutillage));

// ==========================================
// GESTION DES INPUTS ET ACCORDEONS
// ==========================================

let updateTimer;

function clampPiqureToPied() {
    const s1LEl = document.getElementById('s1-L');
    const s1PEl = document.getElementById('s1-P');
    const spL = document.getElementById('sp-L');
    const spLSlider = document.getElementById('sp-L-slider');
    const spP = document.getElementById('sp-P');
    const spPSlider = document.getElementById('sp-P-slider');
    if (!s1LEl || !s1PEl || !spL || !spP) return;
    const s1L = Math.max(10, parseFloat(s1LEl.value) || 71);
    const s1P = Math.max(10, parseFloat(s1PEl.value) || 71);
    spL.max = s1L;
    if (spLSlider) spLSlider.max = s1L;
    spP.max = s1P;
    if (spPSlider) spPSlider.max = s1P;
    const vL = parseFloat(spL.value) || 0;
    const vP = parseFloat(spP.value) || 0;
    if (vL > s1L) { spL.value = s1L; if (spLSlider) spLSlider.value = s1L; }
    if (vP > s1P) { spP.value = s1P; if (spPSlider) spPSlider.value = s1P; }
}

function clampHautPiqureToBasPiqure() {
    const spL = document.getElementById('sp-L');
    const spP = document.getElementById('sp-P');
    const sp2L = document.getElementById('sp2-L');
    const sp2LSlider = document.getElementById('sp2-L-slider');
    const sp2P = document.getElementById('sp2-P');
    const sp2PSlider = document.getElementById('sp2-P-slider');
    if (!spL || !spP || !sp2L || !sp2P) return;
    const maxL = Math.max(10, parseFloat(spL.value) || 58);
    const maxP = Math.max(10, parseFloat(spP.value) || 58);
    sp2L.max = maxL;
    if (sp2LSlider) sp2LSlider.max = maxL;
    sp2P.max = maxP;
    if (sp2PSlider) sp2PSlider.max = maxP;
    const vL = parseFloat(sp2L.value) || 0;
    const vP = parseFloat(sp2P.value) || 0;
    if (vL > maxL) { sp2L.value = maxL; if (sp2LSlider) sp2LSlider.value = maxL; }
    if (vP > maxP) { sp2P.value = maxP; if (sp2PSlider) sp2PSlider.value = maxP; }
}

function clampSp2HeightToSp1() {
    const s1H = document.getElementById('s1-h');
    const sp2H = document.getElementById('sp2-h');
    const sp2HSlider = document.getElementById('sp2-h-slider');
    if (!s1H || !sp2H || !sp2HSlider) return;
    const minH = Math.max(0, parseFloat(s1H.value) || 0);
    sp2H.min = minH;
    sp2HSlider.min = minH;
    const v = parseFloat(sp2H.value) || 0;
    if (v < minH) { sp2H.value = minH; sp2HSlider.value = minH; }
}

function clampSp2HeightToSp3() {
    const sp3H = document.getElementById('sp3-h');
    const sp2H = document.getElementById('sp2-h');
    const sp2HSlider = document.getElementById('sp2-h-slider');
    if (!sp3H || !sp2H || !sp2HSlider) return;
    const minH = parseFloat(sp2H.min) || 0;
    const maxH = Math.max(minH, parseFloat(sp3H.value) || 20);
    sp2H.max = maxH;
    sp2HSlider.max = maxH;
    const v = parseFloat(sp2H.value) || 0;
    if (v > maxH) { sp2H.value = maxH; sp2HSlider.value = maxH; }
}

function clampSp3HeightToSp2AndRp3() {
    const sp2H = document.getElementById('sp2-h');
    const rp3H = document.getElementById('rp3-h');
    const sp3H = document.getElementById('sp3-h');
    const sp3HSlider = document.getElementById('sp3-h-slider');
    if (!sp2H || !rp3H || !sp3H || !sp3HSlider) return;
    const minH = Math.max(0, parseFloat(sp2H.value) || 4);
    const maxH = Math.max(minH, parseFloat(rp3H.value) || 30);
    sp3H.min = minH;
    sp3HSlider.min = minH;
    sp3H.max = maxH;
    sp3HSlider.max = maxH;
    const v = parseFloat(sp3H.value) || 0;
    if (v < minH) { sp3H.value = minH; sp3HSlider.value = minH; }
    else if (v > maxH) { sp3H.value = maxH; sp3HSlider.value = maxH; }
}

function clampRp3HeightToSp3() {
    const sp3H = document.getElementById('sp3-h');
    const rp3H = document.getElementById('rp3-h');
    const rp3HSlider = document.getElementById('rp3-h-slider');
    if (!sp3H || !rp3H || !rp3HSlider) return;
    const minH = Math.max(0, parseFloat(sp3H.value) || 20);
    rp3H.min = minH;
    rp3HSlider.min = minH;
    const v = parseFloat(rp3H.value) || 0;
    if (v < minH) { rp3H.value = minH; rp3HSlider.value = minH; }
}

function clampSb1HeightToS5() {
    const s5H = document.getElementById('s5-h');
    const sb1H = document.getElementById('sb1-h');
    const sb1HSlider = document.getElementById('sb1-h-slider');
    if (!s5H || !sb1H || !sb1HSlider) return;
    const minH = Math.max(0, parseFloat(s5H.value) || 280);
    sb1H.min = minH;
    sb1HSlider.min = minH;
    const v = parseFloat(sb1H.value) || 0;
    if (v < minH) { sb1H.value = minH; sb1HSlider.value = minH; }
}

function clampSb1HeightToSb2() {
    const sb2H = document.getElementById('sb2-h');
    const sb1H = document.getElementById('sb1-h');
    const sb1HSlider = document.getElementById('sb1-h-slider');
    if (!sb2H || !sb1H || !sb1HSlider) return;
    const maxH = Math.max(parseFloat(sb1H.min) || 0, parseFloat(sb2H.value) || 297);
    sb1H.max = maxH;
    sb1HSlider.max = maxH;
    const v = parseFloat(sb1H.value) || 0;
    if (v > maxH) { sb1H.value = maxH; sb1HSlider.value = maxH; }
}

function clampSb2HeightToSb1() {
    const sb1H = document.getElementById('sb1-h');
    const sb2H = document.getElementById('sb2-h');
    const sb2HSlider = document.getElementById('sb2-h-slider');
    if (!sb1H || !sb2H || !sb2HSlider) return;
    const minH = Math.max(0, parseFloat(sb1H.value) || 282);
    sb2H.min = minH;
    sb2HSlider.min = minH;
    const v = parseFloat(sb2H.value) || 0;
    if (v < minH) { sb2H.value = minH; sb2HSlider.value = minH; }
}

function clampSb3HeightToSb2() {
    const sb2H = document.getElementById('sb2-h');
    const sb3H = document.getElementById('sb3-h');
    const sb3HSlider = document.getElementById('sb3-h-slider');
    if (!sb2H || !sb3H || !sb3HSlider) return;
    const minH = Math.max(0, parseFloat(sb2H.value) || 297);
    sb3H.min = minH;
    sb3HSlider.min = minH;
    const v = parseFloat(sb3H.value) || 0;
    if (v < minH) { sb3H.value = minH; sb3HSlider.value = minH; }
}

function clampSb3DimensionsToSb2() {
    const sb2L = document.getElementById('sb2-L');
    const sb2P = document.getElementById('sb2-P');
    const sb3L = document.getElementById('sb3-L');
    const sb3LSlider = document.getElementById('sb3-L-slider');
    const sb3P = document.getElementById('sb3-P');
    const sb3PSlider = document.getElementById('sb3-P-slider');
    if (!sb2L || !sb2P || !sb3L || !sb3P) return;
    const maxL = Math.max(10, parseFloat(sb2L.value) || 35);
    const maxP = Math.max(10, parseFloat(sb2P.value) || 35);
    sb3L.max = maxL;
    if (sb3LSlider) sb3LSlider.max = maxL;
    sb3P.max = maxP;
    if (sb3PSlider) sb3PSlider.max = maxP;
    const vL = parseFloat(sb3L.value) || 0;
    const vP = parseFloat(sb3P.value) || 0;
    if (vL > maxL) { sb3L.value = maxL; if (sb3LSlider) sb3LSlider.value = maxL; }
    if (vP > maxP) { sb3P.value = maxP; if (sb3PSlider) sb3PSlider.value = maxP; }
}

function clampSb4HeightToSb3() {
    const sb3H = document.getElementById('sb3-h');
    const sb4H = document.getElementById('sb4-h');
    const sb4HSlider = document.getElementById('sb4-h-slider');
    if (!sb3H || !sb4H || !sb4HSlider) return;
    const h3 = Math.max(0, parseFloat(sb3H.value) || 299);
    sb4H.value = h3;
    sb4HSlider.value = h3;
    sb4H.max = h3;
    sb4HSlider.max = h3;
}

function clampSb4DimensionsToSb3() {
    const sb3L = document.getElementById('sb3-L');
    const sb3P = document.getElementById('sb3-P');
    const sb4L = document.getElementById('sb4-L');
    const sb4LSlider = document.getElementById('sb4-L-slider');
    const sb4P = document.getElementById('sb4-P');
    const sb4PSlider = document.getElementById('sb4-P-slider');
    if (!sb3L || !sb3P || !sb4L || !sb4P) return;
    const maxL = Math.max(10, parseFloat(sb3L.value) || 33);
    const maxP = Math.max(10, parseFloat(sb3P.value) || 33);
    sb4L.max = maxL;
    if (sb4LSlider) sb4LSlider.max = maxL;
    sb4P.max = maxP;
    if (sb4PSlider) sb4PSlider.max = maxP;
    const vL = parseFloat(sb4L.value) || 0;
    const vP = parseFloat(sb4P.value) || 0;
    if (vL > maxL) { sb4L.value = maxL; if (sb4LSlider) sb4LSlider.value = maxL; }
    if (vP > maxP) { sb4P.value = maxP; if (sb4PSlider) sb4PSlider.value = maxP; }
}

function clampSb5HeightToSb4() {
    const sb3H = document.getElementById('sb3-h');
    const sb5H = document.getElementById('sb5-h');
    const sb5HSlider = document.getElementById('sb5-h-slider');
    if (!sb3H || !sb5H || !sb5HSlider) return;
    const maxH = Math.max(0, parseFloat(sb3H.value) || 299);
    sb5H.max = maxH;
    sb5HSlider.max = maxH;
    const v = parseFloat(sb5H.value) || 0;
    if (v > maxH) { sb5H.value = maxH; sb5HSlider.value = maxH; }
}

function clampSb5DimensionsToSb4() {
    const sb4L = document.getElementById('sb4-L');
    const sb4P = document.getElementById('sb4-P');
    const sb5L = document.getElementById('sb5-L');
    const sb5LSlider = document.getElementById('sb5-L-slider');
    const sb5P = document.getElementById('sb5-P');
    const sb5PSlider = document.getElementById('sb5-P-slider');
    if (!sb4L || !sb4P || !sb5L || !sb5P) return;
    const maxL = Math.max(10, parseFloat(sb4L.value) || 31);
    const maxP = Math.max(10, parseFloat(sb4P.value) || 31);
    sb5L.max = maxL;
    if (sb5LSlider) sb5LSlider.max = maxL;
    sb5P.max = maxP;
    if (sb5PSlider) sb5PSlider.max = maxP;
    const vL = parseFloat(sb5L.value) || 0;
    const vP = parseFloat(sb5P.value) || 0;
    if (vL > maxL) { sb5L.value = maxL; if (sb5LSlider) sb5LSlider.value = maxL; }
    if (vP > maxP) { sb5P.value = maxP; if (sb5PSlider) sb5PSlider.value = maxP; }
}

function clampSp3DimensionsToSp2() {
    const sp2L = document.getElementById('sp2-L');
    const sp2P = document.getElementById('sp2-P');
    const sp3L = document.getElementById('sp3-L');
    const sp3LSlider = document.getElementById('sp3-L-slider');
    const sp3P = document.getElementById('sp3-P');
    const sp3PSlider = document.getElementById('sp3-P-slider');
    if (!sp2L || !sp2P || !sp3L || !sp3P) return;
    const maxL = Math.max(10, parseFloat(sp2L.value) || 48);
    const maxP = Math.max(10, parseFloat(sp2P.value) || 48);
    sp3L.max = maxL;
    if (sp3LSlider) sp3LSlider.max = maxL;
    sp3P.max = maxP;
    if (sp3PSlider) sp3PSlider.max = maxP;
    const vL = parseFloat(sp3L.value) || 0;
    const vP = parseFloat(sp3P.value) || 0;
    if (vL > maxL) { sp3L.value = maxL; if (sp3LSlider) sp3LSlider.value = maxL; }
    if (vP > maxP) { sp3P.value = maxP; if (sp3PSlider) sp3PSlider.value = maxP; }
}

function setupListeners() {
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
            clampPiqureToPied();
            clampHautPiqureToBasPiqure();
            clampSp2HeightToSp1();
            clampSp2HeightToSp3();
            clampSp3HeightToSp2AndRp3();
            clampRp3HeightToSp3();
            clampSp3DimensionsToSp2();
            clampSb1HeightToS5();
            clampSb1HeightToSb2();
            clampSb2HeightToSb1();
            clampSb3HeightToSb2();
            clampSb3DimensionsToSb2();
            clampSb4HeightToSb3();
            clampSb4DimensionsToSb3();
            clampSb5HeightToSb4();
            clampSb5DimensionsToSb4();
            clearTimeout(updateTimer);
            updateTimer = setTimeout(() => {
                if (typeof updateBouteille === 'function') updateBouteille();
                if (typeof draw2D === 'function' && !document.getElementById('viewport-2d').classList.contains('hidden')) draw2D();
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
    toggleCarreNiveauVisibility();
    document.querySelectorAll('select[id$="-forme"]').forEach(sel => {
        sel.addEventListener('change', toggleCarreNiveauVisibility);
    });
    clampPiqureToPied();
    clampHautPiqureToBasPiqure();
    clampSp2HeightToSp1();
    clampSp2HeightToSp3();
    clampSp3HeightToSp2AndRp3();
    clampRp3HeightToSp3();
    clampSp3DimensionsToSp2();
    clampSb1HeightToS5();
    clampSb1HeightToSb2();
    clampSb2HeightToSb1();
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
    clampSb3HeightToSb2();
    clampSb3DimensionsToSb2();
    clampSb4HeightToSb3();
    clampSb4DimensionsToSb3();
    clampSb5HeightToSb4();
    clampSb5DimensionsToSb4();
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
    clampSb4HeightToSb3();
    var sb5H = document.getElementById('sb5-h');
    var sb5HSlider = document.getElementById('sb5-h-slider');
    if (sb3H && sb5H && sb5HSlider) {
        var h5 = Math.max(0, (parseFloat(sb3H.value) || 299) - 2);
        sb5H.value = h5;
        sb5HSlider.value = h5;
    }

    const allAccordions = document.getElementsByClassName("accordion");
    const mainAccordions = document.querySelectorAll(".accordion.main-accordion");

    function closeAllAccordions() {
        for (let i = 0; i < allAccordions.length; i++) {
            allAccordions[i].classList.remove("active");
            const panel = allAccordions[i].nextElementSibling;
            if (panel && panel.classList.contains("panel-controls")) {
                panel.style.maxHeight = "0px";
            }
        }
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

            closeAllAccordions();

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

            if (typeof updateBouteille === 'function') updateBouteille();
        };
    }
}

setupPanelTabs();
