// ==========================================
// BOTTLE MATHS — Constructeur de profil bouteille (métier)
// Utilise GeomKernel pour générer contours en segments et arcs uniquement.
// Aucune dépendance Three.js.
// ==========================================

var BottleMaths = (function () {
    var K = typeof GeomKernel !== 'undefined' ? GeomKernel : null;

    // -------------------------------------------------------------------------
    // RAYON D'UNE SECTION À UN ANGLE (plan horizontal : ellipse ou rectangle arrondi)
    // -------------------------------------------------------------------------

    function getEllipseRadiusAtAngle(a, b, theta) {
        var c = Math.cos(theta), s = Math.sin(theta);
        var x = a * c, z = b * s;
        return Math.sqrt(x * x + z * z);
    }

    function getRoundedRectRadius(a, b, r, theta) {
        r = Math.max(0, Math.min(r, Math.min(a, b)));
        var c = Math.cos(theta), s = Math.sin(theta);
        var x = Math.abs(c), z = Math.abs(s);
        if (x < 1e-10) return b;
        if (z < 1e-10) return a;
        var tRight = a / x;
        var tTop = b / z;
        var hitRight = (a * z / x <= b - r);
        var hitTop = (b * x / z <= a - r);
        if (r < 1e-10) {
            return hitRight && (!hitTop || tRight <= tTop) ? tRight : tTop;
        }
        var Cx = a - r, Cz = b - r;
        var CdotD = Cx * x + Cz * z;
        var C2 = Cx * Cx + Cz * Cz;
        var disc = CdotD * CdotD - (C2 - r * r);
        var tArc = Infinity;
        if (disc >= 0) {
            tArc = CdotD + Math.sqrt(disc);
            var px = tArc * x, pz = tArc * z;
            if (px >= Cx - 1e-6 && pz >= Cz - 1e-6) { } else tArc = Infinity;
        }
        var out = Infinity;
        if (hitRight && tRight < out) out = tRight;
        if (hitTop && tTop < out) out = tTop;
        if (tArc !== Infinity && tArc < out) out = tArc;
        return out === Infinity ? Math.min(tRight, tTop) : out;
    }

    function getSectionRadiusAtAngle(a, b, shape, carreNiveau, theta) {
        if (shape === 'carre') {
            var r = (1 - (carreNiveau || 0) / 100) * Math.min(a, b);
            return getRoundedRectRadius(a, b, r, theta);
        }
        return getEllipseRadiusAtAngle(a, b, theta);
    }

    // -------------------------------------------------------------------------
    // POINTS DU CONTOUR D'UNE SECTION (anneau horizontal) : [[x, z], ...]
    // Pour l'affichage des cercles/ellipses de section.
    // -------------------------------------------------------------------------
    function getSectionRingPoints(a, b, shape, carreNiveau, n) {
        var pts = [];
        var i, theta, R;
        if (shape === 'carre') {
            var r = (1 - (carreNiveau || 0) / 100) * Math.min(a, b);
            for (i = 0; i <= n; i++) {
                theta = (i / n) * 2 * Math.PI;
                R = getRoundedRectRadius(a, b, r, theta);
                pts.push([R * Math.cos(theta), R * Math.sin(theta)]);
            }
        } else {
            for (i = 0; i <= n; i++) {
                theta = (i / n) * 2 * Math.PI;
                pts.push([a * Math.cos(theta), b * Math.sin(theta)]);
            }
        }
        return pts;
    }

    // -------------------------------------------------------------------------
    // PROFIL MÉRIDIEN : points (x = rayon, y = hauteur) pour un angle theta
    // sectionsData.sections = [{ H, a, b, shape, carreNiveau }, ...]
    // -------------------------------------------------------------------------
    function getMeridianSectionPoints(theta, sectionsData) {
        var sections = sectionsData.sections || [];
        var points = [];
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            var r = getSectionRadiusAtAngle(s.a, s.b, s.shape || 'rond', s.carreNiveau || 0, theta);
            points.push({ x: Math.max(0.1, r), y: s.H });
        }
        return points;
    }

    /**
     * Contour extérieur : entités B-Rep (segments et arcs) pour un méridien à l'angle theta.
     * sectionsData = { sections: [...], edgeTypes: ['ligne'|'courbe', ...], rhos: [R12, R23, ...] }
     * courbe = 1 arc tangent (congé) avec le rayon rho.
     */
    function buildExteriorProfile(theta, sectionsData) {
        if (!K) return [];
        var points = getMeridianSectionPoints(theta, sectionsData);
        if (points.length < 2) return [];
        var edgeTypes = sectionsData.edgeTypes || [];
        var rhos = sectionsData.rhos || [];
        var edgeFilletRadii = [];
        for (var i = 0; i < points.length - 1; i++) {
            edgeFilletRadii.push((edgeTypes[i] === 'courbe' && rhos[i] > 0) ? rhos[i] : 0);
        }
        return K.buildProfileFromPolyline(points, edgeFilletRadii);
    }

    /**
     * Profil de la piqûre (fond). Utilise le kernel. Pour l'instant vide.
     */
    function buildPuntProfile(puntData) {
        if (!K) return [];
        // TODO: construire entités (segments + arcs) à partir de puntData
        return [];
    }

    /**
     * Profil intérieur (épaisseur de paroi). Utilise le kernel. Pour l'instant vide.
     */
    function buildInteriorProfile(thickness, exteriorData) {
        if (!K) return [];
        // TODO: déduire contour intérieur à partir de exteriorData et thickness
        return [];
    }

    return {
        getSectionRadiusAtAngle: getSectionRadiusAtAngle,
        getSectionRingPoints: getSectionRingPoints,
        getMeridianSectionPoints: getMeridianSectionPoints,
        buildExteriorProfile: buildExteriorProfile,
        buildPuntProfile: buildPuntProfile,
        buildInteriorProfile: buildInteriorProfile
    };
})();
