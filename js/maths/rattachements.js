// js/maths/rattachements.js
// Construction des liaisons (segments + arcs) du profil 2D entre sections.
// Types : 'ligne', 'rayon' (congé tangent unique), 'courbeS', 'spline'.

var RattachementsMaths = (function () {
    var K = (typeof GeomKernel !== 'undefined') ? GeomKernel : null;

    function createArcBetweenPoints(P0, P1, R, normalSign) {
        var dx = P1.x - P0.x;
        var dy = P1.y - P0.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1e-6) return null;

        var minR = d * 0.5;
        var usedR = R > 0 ? R : minR;
        if (usedR < minR) usedR = minR * 1.001;

        var mx = (P0.x + P1.x) * 0.5;
        var my = (P0.y + P1.y) * 0.5;
        var nx = -dy / d;
        var ny = dx / d;
        if (normalSign < 0) { nx = -nx; ny = -ny; }

        var halfChord = d * 0.5;
        var h2 = usedR * usedR - halfChord * halfChord;
        if (h2 < 0) h2 = 0;
        var h = Math.sqrt(h2);

        var cx = mx + nx * h;
        var cy = my + ny * h;

        var startAngle = Math.atan2(P0.y - cy, P0.x - cx);
        var endAngle = Math.atan2(P1.y - cy, P1.x - cx);

        return K.ArcSegment(cx, cy, usedR, startAngle, endAngle);
    }

    /**
     * Construit les entités B-Rep du profil.
     * - 'ligne'   : segment droit.
     * - 'rayon'   : congé tangent unique au coin (P0, P1, P2) ; s'affiche seulement si le solveur trouve une solution.
     * - 'courbeS' : deux arcs en S (paramètre rho).
     * - 'spline'  : pour l'instant segment (à implémenter).
     */
    function buildProfileCurves(sectionPoints, data) {
        if (!K) return [];
        var points = sectionPoints || [];
        if (points.length < 2) return [];
        data = data || {};
        var edgeTypes = data.edgeTypes || [];
        var rhos = data.rhos || [];

        var entities = [];
        var lastPoint = { x: points[0].x, y: points[0].y };

        for (var i = 0; i < points.length - 1; i++) {
            var P0 = lastPoint;
            var P1 = points[i + 1];
            var type = edgeTypes[i] || 'ligne';
            var R = rhos[i] || 0;

            if (type === 'rayon') {
                // Rayon = un seul arc entre les deux sections autour du rattachement.
                // Les extrémités de l'arc sont EXACTEMENT les deux sections (P0 et P1),
                // donc le rayon ne dépasse jamais les sections.
                // Il ne s'affiche que lorsque |Δlargeur| ≈ |Δhauteur|.
                var dx = P1.x - P0.x;
                var dy = P1.y - P0.y;
                var diff = Math.abs(Math.abs(dx) - Math.abs(dy));
                var tolDiag = 0.5; // tolérance en mm

                if (diff < tolDiag) {
                    var arcRayon = createArcBetweenPoints(P0, P1, R, 1);
                    if (arcRayon) {
                        entities.push(arcRayon);
                    } else {
                        entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                    }
                } else {
                    // Sections pas « bien positionnées » : pas de rayon, juste une ligne.
                    entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                }
                lastPoint = { x: P1.x, y: P1.y };
            } else if (type === 'courbeS' && R > 0) {
                // Courbe S : deux arcs de rayons opposés (S), tous tangents : aux sections en P0 et P1, et entre eux en M.
                var prevPoint = i > 0 ? { x: points[i - 1].x, y: points[i - 1].y } : null;
                var nextPoint = i + 2 < points.length ? { x: points[i + 2].x, y: points[i + 2].y } : null;
                var Dx = P1.x - P0.x;
                var Dy = P1.y - P0.y;
                var dS = Math.sqrt(Dx * Dx + Dy * Dy);
                if (dS < 1e-6) {
                    entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                    lastPoint = { x: P1.x, y: P1.y };
                } else {
                    var T0x = Dx / dS;
                    var T0y = Dy / dS;
                    if (prevPoint) {
                        var pdx = P0.x - prevPoint.x;
                        var pdy = P0.y - prevPoint.y;
                        var pd = Math.sqrt(pdx * pdx + pdy * pdy);
                        if (pd > 1e-6) { T0x = pdx / pd; T0y = pdy / pd; }
                    }
                    var T1x = Dx / dS;
                    var T1y = Dy / dS;
                    if (nextPoint) {
                        var ndx = nextPoint.x - P1.x;
                        var ndy = nextPoint.y - P1.y;
                        var nd = Math.sqrt(ndx * ndx + ndy * ndy);
                        if (nd > 1e-6) { T1x = ndx / nd; T1y = ndy / nd; }
                    }
                    var n0x = -T0y;
                    var n0y = T0x;
                    var DdotN0 = Dx * n0x + Dy * n0y;
                    if (DdotN0 <= 0) { n0x = -n0x; n0y = -n0y; DdotN0 = -DdotN0; }
                    var n1x = -T1y;
                    var n1y = T1x;
                    var DdotN1 = Dx * n1x + Dy * n1y;
                    if (DdotN1 >= 0) { n1x = -n1x; n1y = -n1y; DdotN1 = -DdotN1; }
                    var Vx = n1x - n0x;
                    var Vy = n1y - n0y;
                    var V2 = Vx * Vx + Vy * Vy;
                    var denom = V2 - 4;
                    var R_eff = null;
                    if (Math.abs(denom) > 1e-9) {
                        var DdotV = Dx * Vx + Dy * Vy;
                        var disc = 4 * DdotV * DdotV + 4 * dS * dS * denom;
                        if (disc >= 0) {
                            var sqrtDisc = Math.sqrt(disc);
                            var R1 = (-2 * DdotV + sqrtDisc) / (2 * denom);
                            var R2 = (-2 * DdotV - sqrtDisc) / (2 * denom);
                            R_eff = R1 > dS * 0.25 && R1 < dS * 0.9 ? R1 : (R2 > dS * 0.25 && R2 < dS * 0.9 ? R2 : null);
                        }
                    }
                    var useFallback = false;
                    if (R_eff == null && Math.abs(DdotN0) > 1e-9) {
                        var R_geom = (dS * dS) / (4 * DdotN0);
                        if (R_geom >= dS * 0.25 && R_geom <= dS * 0.9) {
                            R_eff = R_geom;
                            useFallback = true;
                        }
                    }
                    if (R_eff == null || R_eff < dS * 0.2) {
                        entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                        lastPoint = { x: P1.x, y: P1.y };
                    } else {
                        R_eff = Math.max(dS * 0.25, Math.min(dS * 0.85, R_eff));
                        var C1x = P0.x + R_eff * n0x;
                        var C1y = P0.y + R_eff * n0y;
                        var C2x = useFallback ? P1.x - R_eff * n0x : P1.x + R_eff * n1x;
                        var C2y = useFallback ? P1.y - R_eff * n0y : P1.y + R_eff * n1y;
                        var dxC = C2x - C1x;
                        var dyC = C2y - C1y;
                        var dC = Math.sqrt(dxC * dxC + dyC * dyC);
                        if (dC < 1e-6) {
                            entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                            lastPoint = { x: P1.x, y: P1.y };
                        } else {
                            var Mx = (C1x + C2x) * 0.5;
                            var My = (C1y + C2y) * 0.5;
                            if (Math.min(Mx, Math.min(P0.x, P1.x)) < 1) {
                                entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                                lastPoint = { x: P1.x, y: P1.y };
                            } else {
                                var a1s = Math.atan2(P0.y - C1y, P0.x - C1x);
                                var a1e = Math.atan2(My - C1y, Mx - C1x);
                                var da1 = a1e - a1s;
                                if (da1 > Math.PI) da1 -= 2 * Math.PI;
                                if (da1 < -Math.PI) da1 += 2 * Math.PI;
                                var tangent1AtP0x = da1 > 0 ? -Math.sin(a1s) : Math.sin(a1s);
                                var tangent1AtP0y = da1 > 0 ? Math.cos(a1s) : -Math.cos(a1s);
                                var dot1 = tangent1AtP0x * T0x + tangent1AtP0y * T0y;
                                if (dot1 < 0) {
                                    n0x = -n0x; n0y = -n0y;
                                    n1x = -n1x; n1y = -n1y;
                                    C1x = P0.x + R_eff * n0x;
                                    C1y = P0.y + R_eff * n0y;
                                    C2x = useFallback ? P1.x - R_eff * n0x : P1.x + R_eff * n1x;
                                    C2y = useFallback ? P1.y - R_eff * n0y : P1.y + R_eff * n1y;
                                    Mx = (C1x + C2x) * 0.5;
                                    My = (C1y + C2y) * 0.5;
                                    a1s = Math.atan2(P0.y - C1y, P0.x - C1x);
                                    a1e = Math.atan2(My - C1y, Mx - C1x);
                                }
                                var sweep1 = a1e - a1s;
                                if (sweep1 > Math.PI) a1e -= 2 * Math.PI;
                                if (sweep1 < -Math.PI) a1e += 2 * Math.PI;
                                var a2s = Math.atan2(My - C2y, Mx - C2x);
                                var a2e = Math.atan2(P1.y - C2y, P1.x - C2x);
                                var sweep2 = a2e - a2s;
                                if (sweep2 > Math.PI) a2e -= 2 * Math.PI;
                                if (sweep2 < -Math.PI) a2e += 2 * Math.PI;
                                var arc1 = K.ArcSegment(C1x, C1y, R_eff, a1s, a1e);
                                var arc2 = K.ArcSegment(C2x, C2y, R_eff, a2s, a2e);
                                entities.push(arc1);
                                entities.push(arc2);
                                lastPoint = { x: P1.x, y: P1.y };
                            }
                        }
                    }
                }
            } else if (type === 'spline') {
                // Spline : courbe lisse entre P0 et P1 contrôlée par R (amplitude signée).
                // R > 0 et R < 0 : la courbe va vers l'extérieur ; le signe choisit de quel côté (gauche/droite).
                // On approxime avec une Bézier quadratique discrétisée en segments.
                var dxSp = P1.x - P0.x;
                var dySp = P1.y - P0.y;
                var dSp = Math.sqrt(dxSp * dxSp + dySp * dySp);
                if (dSp < 1e-6 || Math.abs(R) < 1e-3) {
                    // Trop dégénéré ou amplitude quasi nulle : simple segment.
                    entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                    lastPoint = { x: P1.x, y: P1.y };
                } else {
                    // Normale au segment ; on inverse pour R < 0 pour que le négatif aille aussi vers l'extérieur (autre côté).
                    var nxSp = -dySp / dSp;
                    var nySp = dxSp / dSp;
                    if (R < 0) { nxSp = -nxSp; nySp = -nySp; }
                    var amp = Math.abs(R) * 0.3;
                    var midSpX = (P0.x + P1.x) * 0.5 + nxSp * amp;
                    var midSpY = (P0.y + P1.y) * 0.5 + nySp * amp;

                    var prevX = P0.x;
                    var prevY = P0.y;
                    var steps = 48; // discrétisation de la spline (surface plus lisse en 2D/3D)
                    for (var k = 1; k <= steps; k++) {
                        var t = k / steps;
                        var oneMinusT = 1 - t;
                        // Bézier quadratique : B(t) = (1-t)^2 P0 + 2(1-t)t C + t^2 P1
                        var bx = oneMinusT * oneMinusT * P0.x
                            + 2 * oneMinusT * t * midSpX
                            + t * t * P1.x;
                        var by = oneMinusT * oneMinusT * P0.y
                            + 2 * oneMinusT * t * midSpY
                            + t * t * P1.y;
                        entities.push(K.LineSegment(prevX, prevY, bx, by));
                        prevX = bx;
                        prevY = by;
                    }
                    lastPoint = { x: P1.x, y: P1.y };
                }
            } else {
                entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                lastPoint = { x: P1.x, y: P1.y };
            }
        }

        return entities;
    }

    return {
        buildProfileCurves: buildProfileCurves
    };
})();

