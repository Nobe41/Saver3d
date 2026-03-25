// js/state/sliderLimits.js
// Limites dynamiques pour les rayons de rattachement (ρ) afin d'éviter les géométries impossibles.
// Idée : pour chaque rattachement entre deux sections (r12, r23, ...),
// on calcule le rayon minimal géométriquement possible (≈ distance(P0,P1) / 2)
// et on remonte cette valeur comme min sur l'input + le slider.

var SliderLimits = (function () {
    // Description des rattachements principaux du corps :
    // r12 : entre section 1 (Pied) et 2 (Corps), etc.
    var MAIN_RATTACHEMENTS = [
        { id: 'r12', fromSection: 1, toSection: 2 },
        { id: 'r23', fromSection: 2, toSection: 3 },
        { id: 'r34', fromSection: 3, toSection: 4 },
        { id: 'r45', fromSection: 4, toSection: 5 }
    ];

    function getNumberValue(id, fallback) {
        var el = document.getElementById(id);
        if (!el) return fallback;
        var v = parseFloat(el.value);
        return isFinite(v) ? v : fallback;
    }

    function getSectionPoint(sectionIndex) {
        // On approxime le rayon par L/2 (largeur), comme dans la vue 3D.
        var H = getNumberValue('s' + sectionIndex + '-h', 0);
        var L = getNumberValue('s' + sectionIndex + '-L', 0);
        var r = Math.max(0, L / 2);
        return { x: r, y: H };
    }

    function computeRadiusBoundsForPair(p0, p1) {
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1e-6) return { min: 0, max: 0 };
        // Pour un arc entre deux points, rayon mini pour rester « bien posé » ≈ d/2.
        var minR = d * 0.5;
        // Pour la courbe S on autorise une plage plus large pour que l'utilisateur
        // puisse augmenter davantage le rayon si désiré.
        // maxR ≈ 3 * minR → S plus souple possible.
        var maxR = minR * 3;
        return { min: minR, max: maxR };
    }

    /**
     * Pour la courbe S, on construit deux arcs (P0->mid, mid->P1) avec un rayon R.
     * Géométriquement, on a besoin d'au moins R >= d/2 (d = distance entre sections).
     * On colore en rouge seulement si, pour la géométrie actuelle, le slider ne permet
     * jamais d'atteindre cette valeur minimale (input.max < d/2).
     */
    function updateCourbeSValidityIndicator() {
        for (var i = 0; i < MAIN_RATTACHEMENTS.length; i++) {
            var cfg = MAIN_RATTACHEMENTS[i];
            var typeSelect = document.getElementById(cfg.id + '-type');
            var isCourbeS = typeSelect && typeSelect.value === 'courbeS';
            var inputEl = document.getElementById(cfg.id + '-rho');
            var card = inputEl ? inputEl.closest('.setting-card') : null;
            if (!card) continue;
            if (!isCourbeS) {
                card.classList.remove('courbe-s-impossible');
                continue;
            }
            var p0 = getSectionPoint(cfg.fromSection);
            var p1 = getSectionPoint(cfg.toSection);
            var d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
            var minR_S = d * 0.5;
            var inputMax = inputEl && isFinite(parseFloat(inputEl.max)) ? parseFloat(inputEl.max) : 0;
            var impossible = inputMax < minR_S;
            if (impossible) {
                card.classList.add('courbe-s-impossible');
            } else {
                card.classList.remove('courbe-s-impossible');
            }
        }
    }

    function applyRhoMinConstraints() {
        for (var i = 0; i < MAIN_RATTACHEMENTS.length; i++) {
            var cfg = MAIN_RATTACHEMENTS[i];
            var typeSelect = document.getElementById(cfg.id + '-type');
            // Courbe S : min/max sont gérés par l'UI (updateCourbeSSliderLimits) selon la géométrie.
            if (!typeSelect || typeSelect.value !== 'courbeS') continue;
            continue; // ne pas modifier les bornes (input.min/max) pour Courbe S

            var p0 = getSectionPoint(cfg.fromSection);
            var p1 = getSectionPoint(cfg.toSection);
            var bounds = computeRadiusBoundsForPair(p0, p1);
            var minR = bounds.min;
            var maxR = bounds.max;

            var inputId = cfg.id + '-rho';
            var sliderId = cfg.id + '-rho-slider';

            var inputEl = document.getElementById(inputId);
            var sliderEl = document.getElementById(sliderId);
            if (!inputEl) continue;

            // Min slider Courbe S : 5 mm minimum (la courbe s'adapte côté maths si R est petit).
            var courbeSMinSlider = 5;
            var configuredMin = parseFloat(inputEl.min);
            if (!isFinite(configuredMin)) configuredMin = courbeSMinSlider;
            var newMin = Math.max(courbeSMinSlider, configuredMin);

            // Lecture de la valeur courante saisie par l'utilisateur.
            var current = parseFloat(inputEl.value);
            var hardCap = 1000;
            if (!isFinite(current)) current = newMin;
            current = Math.max(newMin, Math.min(current, hardCap));

            // Gestion du max :
            // - base : au moins 200 mm sur le slider,
            // - si l'utilisateur entre une valeur jusqu'à 1000, on étend le slider pour la couvrir,
            // - on tient compte aussi du max géométrique maxR et du max HTML initial.
            var configuredMax = parseFloat(inputEl.max);
            if (!isFinite(configuredMax)) configuredMax = 200;
            var newMax = Math.max(200, configuredMax, maxR, current);

            // Cas dégénéré : si newMin dépasse newMax, on les colle pour bloquer le slider.
            if (newMin > newMax) newMax = newMin;

            inputEl.min = newMin;
            inputEl.max = newMax;
            if (sliderEl) sliderEl.min = newMin;
            if (sliderEl) sliderEl.max = newMax;

            // On force simplement la valeur au-dessus du min géométrique,
            // sans la recouper artificiellement au max tant qu'elle est ≤ 1000.
            if (current < newMin) current = newMin;
            inputEl.value = current;
            if (sliderEl) {
                sliderEl.value = current;
            }
        }
        updateCourbeSValidityIndicator();
    }

    return {
        applyRhoMinConstraints: applyRhoMinConstraints,
        updateCourbeSValidityIndicator: updateCourbeSValidityIndicator
    };
})();

