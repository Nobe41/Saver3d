// Calcul du volume interne de la bouteille (mm3), incluant la piqure et bague fermee.
var CalculeVolumeMath = (function () {
    var THETA_SAMPLES = 360;
    var MERIDIAN_RESOLUTION = 128;
    var EPS = 1e-9;

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }

    function getPanelValue(id, def) {
        if (typeof document === 'undefined') return def;
        var el = document.getElementById(id);
        if (!el) return def;
        var v = parseFloat(el.value);
        return isNaN(v) ? def : v;
    }

    function getPanelSelectValue(id, def) {
        if (typeof document === 'undefined') return def;
        var el = document.getElementById(id);
        if (!el || !el.value) return def;
        return el.value;
    }

    function getShapeArea(section) {
        if (!section) return 0;
        var a = Math.max(0, section.a || 0);
        var b = Math.max(0, section.b || 0);
        if (a <= EPS || b <= EPS) return 0;
        if ((section.shape || 'rond') === 'carre') {
            var carreNiveau = Math.max(0, Math.min(100, section.carreNiveau || 0));
            var r = (1 - carreNiveau / 100) * Math.min(a, b);
            r = Math.max(0, Math.min(r, Math.min(a, b)));
            return (4 * a * b) - ((4 - Math.PI) * r * r);
        }
        return Math.PI * a * b;
    }

    function lerpSection(s0, s1, t) {
        t = clamp01(t);
        return {
            H: (1 - t) * (s0.H || 0) + t * (s1.H || 0),
            a: (1 - t) * (s0.a || 0) + t * (s1.a || 0),
            b: (1 - t) * (s0.b || 0) + t * (s1.b || 0),
            // Blend "carreNiveau" and force square mode if one of the two is square.
            shape: ((s0.shape === 'carre') || (s1.shape === 'carre')) ? 'carre' : 'rond',
            carreNiveau: (1 - t) * (s0.carreNiveau || 0) + t * (s1.carreNiveau || 0)
        };
    }

    function integrateSectionAreaLinear(s0, s1) {
        var y0 = s0.H || 0;
        var y1 = s1.H || 0;
        var dy = y1 - y0;
        if (dy <= EPS) return 0;
        var steps = 160;
        var h = dy / steps;
        var acc = 0;
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var sec = lerpSection(s0, s1, t);
            var A = getShapeArea(sec);
            var w = (i === 0 || i === steps) ? 1 : (i % 2 === 0 ? 2 : 4);
            acc += w * A;
        }
        return (h / 3) * acc;
    }

    function integrateRadiusSquaredOnSegment(x0, y0, x1, y1, yMin, yMax) {
        var dy = y1 - y0;
        if (Math.abs(dy) <= EPS) return 0;

        var ya = Math.max(Math.min(y0, y1), yMin);
        var yb = Math.min(Math.max(y0, y1), yMax);
        if (yb <= ya + EPS) return 0;

        var m = (x1 - x0) / dy;
        var c = x0 - m * y0;
        var intVal = (m * m / 3) * (yb * yb * yb - ya * ya * ya)
            + (m * c) * (yb * yb - ya * ya)
            + (c * c) * (yb - ya);
        return Math.max(0, intVal);
    }

    function integrateMainBodyVolume(sectionsData) {
        if (typeof BottleMaths === 'undefined' || typeof GeomKernel === 'undefined') return 0;
        if (!sectionsData || !sectionsData.sections || sectionsData.sections.length < 2) return 0;

        var yMin = sectionsData.sections[0].H || 0;
        var yMax = sectionsData.sections[sectionsData.sections.length - 1].H || yMin;
        if (yMax <= yMin + EPS) return 0;

        var sumOverTheta = 0;
        for (var ti = 0; ti < THETA_SAMPLES; ti++) {
            var theta = (ti / THETA_SAMPLES) * 2 * Math.PI;
            var entities = BottleMaths.buildExteriorProfile(theta, sectionsData);
            if (!entities || entities.length === 0) continue;
            var pts = GeomKernel.tessellateProfile(entities, MERIDIAN_RESOLUTION);
            if (!pts || pts.length < 2) continue;

            var intR2dy = 0;
            for (var i = 0; i < pts.length - 1; i++) {
                var p0 = pts[i];
                var p1 = pts[i + 1];
                intR2dy += integrateRadiusSquaredOnSegment(
                    Math.max(0, p0.x), p0.y,
                    Math.max(0, p1.x), p1.y,
                    yMin, yMax
                );
            }
            sumOverTheta += intR2dy;
        }

        var dTheta = (2 * Math.PI) / THETA_SAMPLES;
        return 0.5 * dTheta * sumOverTheta;
    }

    function getDynamicPiqureSections() {
        var out = [];
        if (typeof document === 'undefined') return out;
        var inputs = document.querySelectorAll('input[id^="sp"][id$="-h"]');
        var idxs = [];
        for (var i = 0; i < inputs.length; i++) {
            var m = (inputs[i].id || '').match(/^sp(\d+)-h$/);
            if (!m) continue;
            var k = parseInt(m[1], 10);
            if (isFinite(k)) idxs.push(k);
        }
        idxs.sort(function (a, b) { return a - b; });
        var unique = [];
        for (var j = 0; j < idxs.length; j++) {
            if (j === 0 || idxs[j] !== idxs[j - 1]) unique.push(idxs[j]);
        }
        for (var u = 0; u < unique.length; u++) {
            var ksp = unique[u];
            out.push({
                H: Math.max(0, getPanelValue('sp' + ksp + '-h', 0)),
                a: Math.max(0, getPanelValue('sp' + ksp + '-L', 48) / 2),
                b: Math.max(0, getPanelValue('sp' + ksp + '-P', 48) / 2),
                shape: getPanelSelectValue('sp' + ksp + '-forme', 'rond'),
                carreNiveau: Math.max(0, Math.min(100, getPanelValue('sp' + ksp + '-carre-niveau', 0)))
            });
        }
        return out;
    }

    function getDynamicBagueSections() {
        var out = [];
        if (typeof document === 'undefined') return out;
        var inputs = document.querySelectorAll('input[id^="sb"][id$="-h"]');
        var idxs = [];
        for (var i = 0; i < inputs.length; i++) {
            var m = (inputs[i].id || '').match(/^sb(\d+)-h$/);
            if (!m) continue;
            var k = parseInt(m[1], 10);
            if (isFinite(k)) idxs.push(k);
        }
        idxs.sort(function (a, b) { return a - b; });
        var unique = [];
        for (var j = 0; j < idxs.length; j++) {
            if (j === 0 || idxs[j] !== idxs[j - 1]) unique.push(idxs[j]);
        }
        for (var u = 0; u < unique.length; u++) {
            var ksb = unique[u];
            out.push({
                H: Math.max(0, getPanelValue('sb' + ksb + '-h', 0)),
                a: Math.max(0, getPanelValue('sb' + ksb + '-L', 35) / 2),
                b: Math.max(0, getPanelValue('sb' + ksb + '-P', 35) / 2),
                shape: getPanelSelectValue('sb' + ksb + '-forme', 'rond'),
                carreNiveau: Math.max(0, Math.min(100, getPanelValue('sb' + ksb + '-carre-niveau', 0)))
            });
        }
        return out;
    }

    function computePiqureSubtractedVolume(sectionsData) {
        if (!sectionsData || !sectionsData.sections || sectionsData.sections.length < 1) return 0;
        var s1H = sectionsData.sections[0].H || 0;
        var piq = [{
            H: s1H,
            a: Math.max(0, getPanelValue('sp-L', 58) / 2),
            b: Math.max(0, getPanelValue('sp-P', 58) / 2),
            shape: getPanelSelectValue('sp-forme', 'rond'),
            carreNiveau: Math.max(0, Math.min(100, getPanelValue('sp-carre-niveau', 0)))
        }];
        var more = getDynamicPiqureSections();
        for (var i = 0; i < more.length; i++) piq.push(more[i]);
        if (piq.length < 1) return 0;

        for (var k = 1; k < piq.length; k++) {
            if (piq[k].H < piq[k - 1].H) piq[k].H = piq[k - 1].H;
        }

        var v = 0;
        for (var j = 0; j < piq.length - 1; j++) {
            v += integrateSectionAreaLinear(piq[j], piq[j + 1]);
        }

        var last = piq[piq.length - 1];
        var apexH = Math.max(last.H, getPanelValue('rp3-h', 30));
        var dy = apexH - last.H;
        if (dy > EPS) {
            var Alast = getShapeArea(last);
            v += (Alast * dy) / 3;
        }
        return Math.max(0, v);
    }

    function computeBagueAddedVolume(sectionsData) {
        if (!sectionsData || !sectionsData.sections || sectionsData.sections.length < 1) return 0;
        var sTop = sectionsData.sections[sectionsData.sections.length - 1];
        var bague = getDynamicBagueSections();
        if (!bague.length) {
            bague = [
                { H: Math.max(0, getPanelValue('sb1-h', sTop.H || 0)), a: Math.max(0, getPanelValue('sb1-L', 35) / 2), b: Math.max(0, getPanelValue('sb1-P', 35) / 2), shape: 'rond', carreNiveau: 0 },
                { H: Math.max(0, getPanelValue('sb2-h', sTop.H || 0)), a: Math.max(0, getPanelValue('sb2-L', 35) / 2), b: Math.max(0, getPanelValue('sb2-P', 35) / 2), shape: 'rond', carreNiveau: 0 },
                { H: Math.max(0, getPanelValue('sb3-h', sTop.H || 0)), a: Math.max(0, getPanelValue('sb3-L', 33) / 2), b: Math.max(0, getPanelValue('sb3-P', 33) / 2), shape: 'rond', carreNiveau: 0 }
            ];
        }

        for (var i = 0; i < bague.length; i++) {
            if (bague[i].H < sTop.H) bague[i].H = sTop.H;
            if (i > 0 && bague[i].H < bague[i - 1].H) bague[i].H = bague[i - 1].H;
        }

        var v = 0;
        if (bague.length) v += integrateSectionAreaLinear(sTop, bague[0]);
        for (var j = 0; j < bague.length - 1; j++) v += integrateSectionAreaLinear(bague[j], bague[j + 1]);
        return Math.max(0, v);
    }

    function computeTotalInteriorVolumeMm3(sectionsData) {
        var bodyMain = integrateMainBodyVolume(sectionsData);
        var bagueAdd = computeBagueAddedVolume(sectionsData);
        var piqureSubtract = computePiqureSubtractedVolume(sectionsData);
        return Math.max(0, bodyMain + bagueAdd - piqureSubtract);
    }

    return {
        computeTotalInteriorVolumeMm3: computeTotalInteriorVolumeMm3
    };
})();
