// js/ui/inspector.js
// Génération du panneau gauche : sections (Pied → Bas col), piqûre, bague. Données → HTML.

var UIInspector = (function () {
    var CONTAINER_SECTIONS = 'panel-content-sections';
    var CONTAINER_PIQURE = 'panel-content-piqure';
    var CONTAINER_BAGUE = 'panel-content-bague';

    var SELECT_PROFIL_OPTIONS = ''
        + '<option value="ligne">Ligne</option>'
        + '<option value="courbeS">Courbe S</option>'
        + '<option value="rayon">Rayon</option>'
        + '<option value="spline">Spline</option>';
    var SELECT_FORME_OPTIONS = '<option value="rond">Rond (actuel)</option><option value="carre">Carré</option>';

    // Sections corps : index, label, hauteur (val, min, max, step), L/P (val, min, max), step dimension
    var SECTIONS_MAIN = [
        { label: 'Pied', h: 0, hMin: 0, hMax: 80, L: 71, P: 71, LMin: 40, LMax: 120, step: 0.5, hStep: 0.5 },
        { label: 'Corps', h: 10, hMin: 0, hMax: 350, L: 85, P: 85, LMin: 40, LMax: 120, step: 0.5, hStep: 1 },
        { label: 'Épaule', h: 120, hMin: 0, hMax: 350, L: 85, P: 85, LMin: 20, LMax: 120, step: 0.5, hStep: 0.5 },
        { label: 'Col', h: 200, hMin: 20, hMax: 250, L: 32, P: 32, LMin: 20, LMax: 70, step: 0.5, hStep: 1 },
        { label: 'Bas col', h: 280, hMin: 0, hMax: 350, L: 32, P: 32, LMin: 20, LMax: 50, step: 0.1, hStep: 0.5 }
    ];

    // Rattachements entre sections : id (r12, r23, r34, r45), rho (val, min, max, step)
    var RATTACHEMENTS_MAIN = [
        { rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { rho: 40, rhoMin: 5, rhoMax: 400, rhoStep: 1 },
        { rho: 0, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { rho: 20, rhoMin: 5, rhoMax: 400, rhoStep: 1 }
    ];

    // Piqûre (fond) : section de base "sp" + sections "sp2..spN"
    var PIQURE_SECTIONS = [
        { key: 'sp', label: 'Piqûre', hasHeight: false, L: 58, P: 58, LMin: 10, LMax: 71, step: 0.5 },
        { key: 'sp2', label: 'Bas piqûre', hasHeight: true, h: 4, hMin: 0, hMax: 80, hStep: 0.5, L: 48, P: 48, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sp3', label: 'Haut piqûre', hasHeight: true, h: 20, hMin: 0, hMax: 80, hStep: 0.5, L: 35, P: 35, LMin: 10, LMax: 120, step: 0.5 }
    ];
    var PIQURE_RATTACHEMENTS = [
        { id: 'rp1', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { id: 'rp2', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 }
    ];

    // Bague : sections sb1..sbN
    var BAGUE_SECTIONS = [
        { key: 'sb1', label: 'Bas bague', h: 282, hMin: 0, hMax: 400, hStep: 0.5, L: 35, P: 35, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sb2', label: 'Haut bague', h: 297, hMin: 0, hMax: 400, hStep: 0.5, L: 35, P: 35, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sb3', label: 'Haut bague', h: 299, hMin: 0, hMax: 400, hStep: 0.5, L: 33, P: 33, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sb4', label: 'Plat bague', h: 299, hMin: 0, hMax: 400, hStep: 0.5, L: 31, P: 31, LMin: 10, LMax: 120, step: 0.5 },
        { key: 'sb5', label: 'Bas plat bague', h: 297, hMin: 0, hMax: 400, hStep: 0.5, L: 29, P: 29, LMin: 10, LMax: 120, step: 0.5 }
    ];
    var BAGUE_RATTACHEMENTS = [
        { id: 'rb1', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { id: 'rb2', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { id: 'rb3', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 },
        { id: 'rb4', rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 }
    ];

    function buildSectionCard(s, idx) {
        var i = idx + 1;
        var pre = 's' + i + '-';
        return '<div class="setting-card">' +
            '<button class="accordion main-accordion">' + i + ' — ' + (s.label || ('Section ' + i)) + '</button>' +
            '<div class="panel-controls">' +
            '<div class="control-group">' +
            '<div class="label-row"><label>Hauteur (mm)</label><div class="input-wrapper"><input type="number" id="' + pre + 'h" value="' + s.h + '" min="' + s.hMin + '" max="' + s.hMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + pre + 'h-slider" min="' + s.hMin + '" max="' + s.hMax + '" step="' + s.hStep + '" value="' + s.h + '">' +
            '</div>' +
            '<div class="control-group">' +
            '<div class="label-row"><label>Largeur (mm)</label><div class="input-wrapper"><input type="number" id="' + pre + 'L" value="' + s.L + '" min="' + s.LMin + '" max="' + s.LMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + pre + 'L-slider" min="' + s.LMin + '" max="' + s.LMax + '" step="' + s.step + '" value="' + s.L + '">' +
            '</div>' +
            '<div class="control-group">' +
            '<div class="label-row"><label>Profondeur (mm)</label><div class="input-wrapper"><input type="number" id="' + pre + 'P" value="' + s.P + '" min="' + s.LMin + '" max="' + s.LMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + pre + 'P-slider" min="' + s.LMin + '" max="' + s.LMax + '" step="' + s.step + '" value="' + s.P + '">' +
            '</div>' +
            '<div class="control-group">' +
            '<div class="label-row"><label>Forme</label><div class="input-wrapper"><select id="' + pre + 'forme">' + SELECT_FORME_OPTIONS + '</select></div></div>' +
            '</div>' +
            '<div class="control-group js-carre-niveau" data-section="' + i + '" style="display: none;">' +
            '<div class="label-row"><label>Niveau de carré</label><span class="carre-niveau-value">0 %</span></div>' +
            '<input type="range" id="' + pre + 'carre-niveau" min="0" max="100" value="0">' +
            '</div>' +
            '</div></div>';
    }

    function buildRattachementCard(r, idx) {
        var from = idx + 1;
        var to = idx + 2;
        var id = 'r' + from + to;
        return '<div class="setting-card setting-card--rattachement">' +
            '<button class="accordion sub-accordion">Rattachement ' + (idx + 1) + '</button>' +
            '<div class="panel-controls">' +
            '<div class="control-group">' +
            '<div class="label-row"><label>Profil</label><div class="input-wrapper"><select id="' + id + '-type">' + SELECT_PROFIL_OPTIONS + '</select></div></div>' +
            '</div>' +
            '<div class="control-group js-rho-group">' +
            '<div class="label-row"><label>Rayon</label><div class="input-wrapper"><input type="number" id="' + id + '-rho" value="' + r.rho + '" min="' + r.rhoMin + '" max="' + r.rhoMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + id + '-rho-slider" min="' + r.rhoMin + '" max="' + r.rhoMax + '" step="' + r.rhoStep + '" value="' + r.rho + '">' +
            '</div>' +
            '</div></div>';
    }

    function buildAddSectionFooter() {
        // Détecter la "page" active (Sections / Piqûre / Bague) pour réutiliser le même bouton
        var contentSections = document.getElementById(CONTAINER_SECTIONS);
        var contentPiqure = document.getElementById(CONTAINER_PIQURE);
        var contentBague = document.getElementById(CONTAINER_BAGUE);
        var mode = 'main';
        if (contentPiqure && !contentPiqure.classList.contains('hidden')) mode = 'piqure';
        else if (contentBague && !contentBague.classList.contains('hidden')) mode = 'bague';

        var n = mode === 'piqure' ? PIQURE_SECTIONS.length : (mode === 'bague' ? BAGUE_SECTIONS.length : SECTIONS_MAIN.length);
        if (n < 2) return '';
        var options = '';
        for (var i = 1; i <= n - 1; i++) {
            options += '<option value="' + i + '">Entre section ' + i + ' et ' + (i + 1) + '</option>';
        }
        return [
            '<div class="inspector-add-section-bar" id="inspector-add-section-bar">',
            '  <input type="hidden" id="add-section-mode" value="' + mode + '">',
            '  <div class="control-group" style="width:100%; margin: 0;">',
            '    <div class="input-wrapper" style="width:100%;">',
            '      <select id="add-section-between" class="input-select" style="width:100%;">' + options + '</select>',
            '    </div>',
            '  </div>',
            '  <button type="button" id="btn-add-section" class="btn-add-section">Ajouter une section</button>',
            '</div>'
        ].join('');
    }

    function renderMainSections(container) {
        if (!container) return;
        var html = '';
        for (var i = 0; i < SECTIONS_MAIN.length; i++) {
            html += buildSectionCard(SECTIONS_MAIN[i], i);
            if (i < SECTIONS_MAIN.length - 1) {
                // S'assurer qu'on a un rattachement pour chaque intervalle.
                if (!RATTACHEMENTS_MAIN[i]) {
                    RATTACHEMENTS_MAIN[i] = { rho: 10, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                }
                html += buildRattachementCard(RATTACHEMENTS_MAIN[i], i);
            }
        }
        container.innerHTML = html;
    }

    function mountAddSectionFooter() {
        // On insère le bloc (select + bouton) tout en bas de l'inspector, en dehors de la zone scrollable
        var host = document.getElementById('inspector');
        if (!host) return;

        var existing = document.getElementById('inspector-add-section-bar');
        var html = buildAddSectionFooter();
        if (!html) {
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
            return;
        }
        if (!existing) {
            host.insertAdjacentHTML('beforeend', html);
        } else {
            // Mettre à jour les options si le nombre de sections change
            existing.outerHTML = html;
        }
    }

    function buildPiqureSectionCard(s, idx) {
        var title = (idx + 1) + ' — ' + s.label;
        var key = s.key;
        var html = '<div class="setting-card">' +
            '<button class="accordion main-accordion">' + title + '</button>' +
            '<div class="panel-controls">';
        if (s.hasHeight) {
            html += '<div class="control-group"><div class="label-row"><label>Hauteur (mm)</label><div class="input-wrapper"><input type="number" id="' + key + '-h" value="' + s.h + '" min="' + s.hMin + '" max="' + s.hMax + '"><span class="unit">mm</span></div></div>' +
                '<input type="range" id="' + key + '-h-slider" min="' + s.hMin + '" max="' + s.hMax + '" step="' + s.hStep + '" value="' + s.h + '"></div>';
        }
        html += '<div class="control-group"><div class="label-row"><label>Largeur (mm)</label><div class="input-wrapper"><input type="number" id="' + key + '-L" value="' + s.L + '" min="' + s.LMin + '" max="' + s.LMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + key + '-L-slider" min="' + s.LMin + '" max="' + s.LMax + '" step="' + s.step + '" value="' + s.L + '"></div>' +
            '<div class="control-group"><div class="label-row"><label>Profondeur (mm)</label><div class="input-wrapper"><input type="number" id="' + key + '-P" value="' + s.P + '" min="' + s.LMin + '" max="' + s.LMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + key + '-P-slider" min="' + s.LMin + '" max="' + s.LMax + '" step="' + s.step + '" value="' + s.P + '"></div>' +
            '<div class="control-group"><div class="label-row"><label>Forme</label><div class="input-wrapper"><select id="' + key + '-forme">' + SELECT_FORME_OPTIONS + '</select></div></div></div>' +
            '<div class="control-group js-carre-niveau" data-section="' + key + '" style="display: none;"><div class="label-row"><label>Niveau de carré</label><span class="carre-niveau-value">0 %</span></div><input type="range" id="' + key + '-carre-niveau" min="0" max="100" value="0"></div>' +
            '</div></div>';
        return html;
    }

    function buildSimpleRattachementCard(id, num, rhoObj) {
        return '<div class="setting-card setting-card--rattachement">' +
            '<button class="accordion sub-accordion">Rattachement ' + num + '</button>' +
            '<div class="panel-controls">' +
            '<div class="control-group"><div class="label-row"><label>Profil</label><div class="input-wrapper"><select id="' + id + '-type">' + SELECT_PROFIL_OPTIONS + '</select></div></div></div>' +
            '<div class="control-group js-rho-group"><div class="label-row"><label>Rayon</label><div class="input-wrapper"><input type="number" id="' + id + '-rho" value="' + rhoObj.rho + '" min="' + rhoObj.rhoMin + '" max="' + rhoObj.rhoMax + '"><span class="unit">mm</span></div></div>' +
            '<input type="range" id="' + id + '-rho-slider" min="' + rhoObj.rhoMin + '" max="' + rhoObj.rhoMax + '" step="' + rhoObj.rhoStep + '" value="' + rhoObj.rho + '"></div>' +
            '</div></div>';
    }

    function renderPiqure(container) {
        if (!container) return;
        var html = '';
        for (var i = 0; i < PIQURE_SECTIONS.length; i++) {
            html += buildPiqureSectionCard(PIQURE_SECTIONS[i], i);
            if (i < PIQURE_SECTIONS.length - 1) {
                var r = PIQURE_RATTACHEMENTS[i] || { id: 'rp' + (i + 1), rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                PIQURE_RATTACHEMENTS[i] = r;
                html += buildSimpleRattachementCard(r.id, i + 1, r);
            }
        }
        // Apex (historique) : garder l'ID rp3-h
        html += '<div class="setting-card setting-card--rattachement"><button class="accordion sub-accordion">Rattachement ' + (PIQURE_SECTIONS.length) + '</button><div class="panel-controls">' +
            '<div class="control-group"><div class="label-row"><label>Hauteur (mm)</label><div class="input-wrapper"><input type="number" id="rp3-h" value="30" min="0" max="100"><span class="unit">mm</span></div></div><input type="range" id="rp3-h-slider" min="0" max="100" step="0.5" value="30"></div>' +
            '</div></div>';
        container.innerHTML = html;
    }

    function buildBagueSectionCard(s, idx) {
        var key = s.key;
        return '<div class="setting-card">' +
            '<button class="accordion main-accordion">' + (idx + 1) + ' — ' + s.label + '</button>' +
            '<div class="panel-controls">' +
            '<div class="control-group"><div class="label-row"><label>Hauteur (mm)</label><div class="input-wrapper"><input type="number" id="' + key + '-h" value="' + s.h + '" min="' + s.hMin + '" max="' + s.hMax + '"><span class="unit">mm</span></div></div><input type="range" id="' + key + '-h-slider" min="' + s.hMin + '" max="' + s.hMax + '" step="' + s.hStep + '" value="' + s.h + '"></div>' +
            '<div class="control-group"><div class="label-row"><label>Largeur (mm)</label><div class="input-wrapper"><input type="number" id="' + key + '-L" value="' + s.L + '" min="' + s.LMin + '" max="' + s.LMax + '"><span class="unit">mm</span></div></div><input type="range" id="' + key + '-L-slider" min="' + s.LMin + '" max="' + s.LMax + '" step="' + s.step + '" value="' + s.L + '"></div>' +
            '<div class="control-group"><div class="label-row"><label>Profondeur (mm)</label><div class="input-wrapper"><input type="number" id="' + key + '-P" value="' + s.P + '" min="' + s.LMin + '" max="' + s.LMax + '"><span class="unit">mm</span></div></div><input type="range" id="' + key + '-P-slider" min="' + s.LMin + '" max="' + s.LMax + '" step="' + s.step + '" value="' + s.P + '"></div>' +
            '</div></div>';
    }

    function renderBague(container) {
        if (!container) return;
        var html = '';
        for (var i = 0; i < BAGUE_SECTIONS.length; i++) {
            html += buildBagueSectionCard(BAGUE_SECTIONS[i], i);
            if (i < BAGUE_SECTIONS.length - 1) {
                var r = BAGUE_RATTACHEMENTS[i] || { id: 'rb' + (i + 1), rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                BAGUE_RATTACHEMENTS[i] = r;
                html += buildSimpleRattachementCard(r.id, i + 1, r);
            }
        }
        container.innerHTML = html;
    }

    function wireAddSectionButton() {
        var btn = document.getElementById('btn-add-section');
        var sel = document.getElementById('add-section-between');
        if (btn && sel && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', function () {
                function getNum(id, fallback) {
                    var el = document.getElementById(id);
                    if (!el) return fallback;
                    var v = parseFloat(el.value);
                    return isFinite(v) ? v : fallback;
                }
                function getStr(id, fallback) {
                    var el = document.getElementById(id);
                    if (!el) return fallback;
                    return (el.value != null) ? String(el.value) : fallback;
                }

                // 1) Synchroniser les tableaux à partir de l'UI actuelle
                // (garantit qu'un re-render ne change strictement rien à la forme)
                var currentCount = 0;
                var hInputs = document.querySelectorAll('input[id^="s"][id$="-h"]');
                for (var hi = 0; hi < hInputs.length; hi++) {
                    var m = (hInputs[hi].id || '').match(/^s(\d+)-h$/);
                    if (!m) continue;
                    var k = parseInt(m[1], 10);
                    if (isFinite(k) && k > currentCount) currentCount = k;
                }
                if (!currentCount) currentCount = SECTIONS_MAIN.length;

                var newSections = [];
                for (var k2 = 1; k2 <= currentCount; k2++) {
                    // fallback : reprendre les bornes/steps existantes si déjà présentes
                    var base = SECTIONS_MAIN[k2 - 1] || { label: 'Section', hMin: 0, hMax: 350, LMin: 10, LMax: 120, step: 0.5, hStep: 0.5 };
                    var obj = {
                        label: base.label || 'Section',
                        h: getNum('s' + k2 + '-h', base.h || 0),
                        hMin: base.hMin,
                        hMax: base.hMax,
                        L: getNum('s' + k2 + '-L', base.L || 0),
                        P: getNum('s' + k2 + '-P', base.P || 0),
                        LMin: base.LMin,
                        LMax: base.LMax,
                        step: base.step,
                        hStep: base.hStep
                    };
                    newSections.push(obj);
                }
                SECTIONS_MAIN = newSections;

                var newRatts = [];
                for (var r = 1; r < currentCount; r++) {
                    var rid = 'r' + r + (r + 1);
                    var baseR = RATTACHEMENTS_MAIN[r - 1] || { rho: 10, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                    newRatts.push({
                        rho: getNum(rid + '-rho', baseR.rho),
                        rhoMin: baseR.rhoMin,
                        rhoMax: baseR.rhoMax,
                        rhoStep: baseR.rhoStep
                    });
                }
                RATTACHEMENTS_MAIN = newRatts;

                // Snapshot des valeurs actuelles (pour ne rien casser à l'ajout)
                var snapshot = {};
                var els = document.querySelectorAll('#Panel-gauche input, #Panel-gauche select');
                for (var si = 0; si < els.length; si++) {
                    var el = els[si];
                    if (!el.id) continue;
                    if (el.type === 'checkbox') snapshot[el.id] = !!el.checked;
                    else snapshot[el.id] = el.value;
                }

                // Déterminer dynamiquement sur quelle page on se trouve au moment du clic
                var contentSections = document.getElementById(CONTAINER_SECTIONS);
                var contentPiqure = document.getElementById(CONTAINER_PIQURE);
                var contentBague = document.getElementById(CONTAINER_BAGUE);
                var mode = 'main';
                if (contentPiqure && !contentPiqure.classList.contains('hidden')) mode = 'piqure';
                else if (contentBague && !contentBague.classList.contains('hidden')) mode = 'bague';
                var between = parseInt(sel.value, 10); // entre (between) et (between+1)
                if (!isFinite(between) || between < 1) between = 1;

                if (mode === 'bague') {
                    if (between > BAGUE_SECTIONS.length - 1) between = BAGUE_SECTIONS.length - 1;
                    var Ab = BAGUE_SECTIONS[between - 1];
                    var Bb = BAGUE_SECTIONS[between];
                    var newKey = 'sb' + (BAGUE_SECTIONS.length + 1);
                    var newB = {
                        key: newKey,
                        label: 'Bague',
                        h: Math.round(((Ab.h + Bb.h) * 0.5) * 10) / 10,
                        hMin: Math.min(Ab.hMin, Bb.hMin),
                        hMax: Math.max(Ab.hMax, Bb.hMax),
                        hStep: Math.min(Ab.hStep, Bb.hStep),
                        L: Math.round(((Ab.L + Bb.L) * 0.5) * 10) / 10,
                        P: Math.round(((Ab.P + Bb.P) * 0.5) * 10) / 10,
                        LMin: Math.min(Ab.LMin, Bb.LMin),
                        LMax: Math.max(Ab.LMax, Bb.LMax),
                        step: Math.min(Ab.step, Bb.step)
                    };
                    BAGUE_SECTIONS.splice(between, 0, newB);
                    var baseRb = BAGUE_RATTACHEMENTS[between - 1] || { id: 'rb' + between, rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                    var rb1 = { id: 'rb' + (BAGUE_RATTACHEMENTS.length + 1), rho: baseRb.rho, rhoMin: baseRb.rhoMin, rhoMax: baseRb.rhoMax, rhoStep: baseRb.rhoStep };
                    var rb2 = { id: 'rb' + (BAGUE_RATTACHEMENTS.length + 2), rho: baseRb.rho, rhoMin: baseRb.rhoMin, rhoMax: baseRb.rhoMax, rhoStep: baseRb.rhoStep };
                    BAGUE_RATTACHEMENTS.splice(between - 1, 1, rb1, rb2);
                } else if (mode === 'piqure') {
                    if (between > PIQURE_SECTIONS.length - 1) between = PIQURE_SECTIONS.length - 1;
                    var Ap = PIQURE_SECTIONS[between - 1];
                    var Bp = PIQURE_SECTIONS[between];
                    // Nouvelle section piqure : sp{N}
                    var nextIdx = 2;
                    for (var pi = 0; pi < PIQURE_SECTIONS.length; pi++) {
                        var mk = (PIQURE_SECTIONS[pi].key || '').match(/^sp(\d+)$/);
                        if (mk) nextIdx = Math.max(nextIdx, parseInt(mk[1], 10) + 1);
                    }
                    var newKeyP = 'sp' + nextIdx;
                    var newP = {
                        key: newKeyP,
                        label: 'Piqûre',
                        hasHeight: true,
                        h: Math.round((((Ap.h || 0) + (Bp.h || 0)) * 0.5) * 10) / 10,
                        hMin: Math.min(Ap.hMin || 0, Bp.hMin || 0),
                        hMax: Math.max(Ap.hMax || 80, Bp.hMax || 80),
                        hStep: Math.min(Ap.hStep || 0.5, Bp.hStep || 0.5),
                        L: Math.round(((Ap.L + Bp.L) * 0.5) * 10) / 10,
                        P: Math.round(((Ap.P + Bp.P) * 0.5) * 10) / 10,
                        LMin: Math.min(Ap.LMin, Bp.LMin),
                        LMax: Math.max(Ap.LMax, Bp.LMax),
                        step: Math.min(Ap.step, Bp.step)
                    };
                    PIQURE_SECTIONS.splice(between, 0, newP);
                    // Id rattachement : rp1/rp2 existants, puis rpp3, rpp4...
                    function newPiqureRattId(n) { return n <= 2 ? ('rp' + n) : ('rpp' + n); }
                    var baseRp = PIQURE_RATTACHEMENTS[between - 1] || { id: newPiqureRattId(between), rho: 5, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                    var seg1 = { id: newPiqureRattId(PIQURE_RATTACHEMENTS.length + 1), rho: baseRp.rho, rhoMin: baseRp.rhoMin, rhoMax: baseRp.rhoMax, rhoStep: baseRp.rhoStep };
                    var seg2 = { id: newPiqureRattId(PIQURE_RATTACHEMENTS.length + 2), rho: baseRp.rho, rhoMin: baseRp.rhoMin, rhoMax: baseRp.rhoMax, rhoStep: baseRp.rhoStep };
                    PIQURE_RATTACHEMENTS.splice(between - 1, 1, seg1, seg2);
                } else {
                    if (between > SECTIONS_MAIN.length - 1) between = SECTIONS_MAIN.length - 1;
                    // Valeurs par défaut : interpolation entre les deux sections voisines.
                    var A = SECTIONS_MAIN[between - 1];
                    var B = SECTIONS_MAIN[between];
                    var newS = {
                        label: 'Section',
                        h: Math.round(((A.h + B.h) * 0.5) * 10) / 10,
                        hMin: Math.min(A.hMin, B.hMin),
                        hMax: Math.max(A.hMax, B.hMax),
                        L: Math.round(((A.L + B.L) * 0.5) * 10) / 10,
                        P: Math.round(((A.P + B.P) * 0.5) * 10) / 10,
                        LMin: Math.min(A.LMin, B.LMin),
                        LMax: Math.max(A.LMax, B.LMax),
                        step: Math.min(A.step, B.step),
                        hStep: Math.min(A.hStep, B.hStep)
                    };
                    SECTIONS_MAIN.splice(between, 0, newS);
                    var baseR = RATTACHEMENTS_MAIN[between - 1] || { rho: 10, rhoMin: 0, rhoMax: 400, rhoStep: 0.5 };
                    var r1 = { rho: baseR.rho, rhoMin: baseR.rhoMin, rhoMax: baseR.rhoMax, rhoStep: baseR.rhoStep };
                    var r2 = { rho: baseR.rho, rhoMin: baseR.rhoMin, rhoMax: baseR.rhoMax, rhoStep: baseR.rhoStep };
                    RATTACHEMENTS_MAIN.splice(between - 1, 1, r1, r2);
                }

                // Re-render + relancer listeners et vues
                renderSections();
                if (typeof setupListeners === 'function') setupListeners();

                // Restaurer les valeurs (avec remap des IDs décalés par insertion)
                function remapId(oldId) {
                    if (mode === 'bague') {
                        var msb = oldId.match(/^sb(\d+)-(h|L|P)(-slider)?$/);
                        if (msb) {
                            var ksb = parseInt(msb[1], 10);
                            var tailSb = '-' + msb[2] + (msb[3] || '');
                            if (ksb > between) ksb = ksb + 1;
                            return 'sb' + ksb + tailSb;
                        }
                        var mrb = oldId.match(/^rb(\d+)-(type|rho)(-slider)?$/);
                        if (mrb) {
                            var irb = parseInt(mrb[1], 10);
                            var tailRb = '-' + mrb[2] + (mrb[3] || '');
                            if (irb > between) irb = irb + 1;
                            return 'rb' + irb + tailRb;
                        }
                        return oldId;
                    }
                    if (mode === 'piqure') {
                        if (oldId === 'rp3-h' || oldId === 'rp3-h-slider') return oldId;
                        var msp = oldId.match(/^sp(\d+)-(h|L|P|forme|carre-niveau)(-slider)?$/);
                        if (msp) {
                            var ksp = parseInt(msp[1], 10);
                            var tailSp = '-' + msp[2] + (msp[3] || '');
                            if (ksp > between + 1) ksp = ksp + 1;
                            return 'sp' + ksp + tailSp;
                        }
                        var mrp = oldId.match(/^(rp\d+|rpp\d+)-(type|rho)(-slider)?$/);
                        if (mrp) {
                            // on laisse les ids, ils ne sont pas strictement indexés comme main
                            return oldId;
                        }
                        return oldId;
                    }
                    // Main sections : sX-... avec X > between -> X+1
                    var ms = oldId.match(/^s(\d+)-(h|L|P|forme|carre-niveau)(-slider)?$/);
                    if (ms) {
                        var k = parseInt(ms[1], 10);
                        var tail = '-' + ms[2] + (ms[3] || '');
                        if (k > between) k = k + 1;
                        return 's' + k + tail;
                    }
                    // Rattachements : rAB-... avec A,B ; si A>between -> +1, si B>between+1 -> +1
                    var mr = oldId.match(/^r(\d+)(\d+)-(type|rho)(-slider)?$/);
                    if (mr) {
                        var a = parseInt(mr[1], 10);
                        var b = parseInt(mr[2], 10);
                        var tailR = '-' + mr[3] + (mr[4] || '');
                        // cas spécial : l'ancien rattachement "between->between+1" est dupliqué sur les 2 nouveaux
                        if (a === between && b === between + 1) return ['r' + between + (between + 1) + tailR, 'r' + (between + 1) + (between + 2) + tailR];
                        if (a > between) a = a + 1;
                        if (b > between + 1) b = b + 1;
                        return 'r' + a + b + tailR;
                    }
                    return oldId;
                }

                for (var key in snapshot) {
                    if (!snapshot.hasOwnProperty(key)) continue;
                    var mapped = remapId(key);
                    if (Array.isArray(mapped)) {
                        for (var mi = 0; mi < mapped.length; mi++) {
                            var el2 = document.getElementById(mapped[mi]);
                            if (!el2) continue;
                            if (el2.type === 'checkbox') el2.checked = !!snapshot[key];
                            else el2.value = snapshot[key];
                        }
                    } else {
                        var el3 = document.getElementById(mapped);
                        if (!el3) continue;
                        if (el3.type === 'checkbox') el3.checked = !!snapshot[key];
                        else el3.value = snapshot[key];
                    }
                }

                if (typeof Validator !== 'undefined' && Validator.applyAllUserConstraints) Validator.applyAllUserConstraints();
                if (typeof updateBouteille === 'function') updateBouteille();
                if (typeof draw2D === 'function') draw2D();
            });
        }
    }

    function renderSections() {
        renderMainSections(document.getElementById(CONTAINER_SECTIONS));
        renderPiqure(document.getElementById(CONTAINER_PIQURE));
        renderBague(document.getElementById(CONTAINER_BAGUE));
        mountAddSectionFooter();
        wireAddSectionButton();
    }

    function refreshAddSectionFooter() {
        mountAddSectionFooter();
        wireAddSectionButton();
    }

    return {
        renderSections: renderSections,
        refreshAddSectionFooter: refreshAddSectionFooter
    };
})();
