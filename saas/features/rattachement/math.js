// Calculs géométriques des liaisons du profil 2D.
var RattachementMath = (function () {
    var K = (typeof GeomKernel !== 'undefined') ? GeomKernel : null;
    var TOL_DIAG = (typeof RattachementRules !== 'undefined' && RattachementRules.QUARTER_ARC_TOLERANCE_MM) || 0.5;
    var SPLINE_STEPS = (typeof RattachementRules !== 'undefined' && RattachementRules.SPLINE_STEPS) || 48;
    var MIN_SAFE_X = (typeof RattachementRules !== 'undefined' && RattachementRules.MIN_SAFE_X) || 1;
    var DEFAULT_EDGE_TYPE = (typeof RattachementRules !== 'undefined' && RattachementRules.DEFAULT_EDGE_TYPE) || 'ligne';
    var DEFAULT_RHO = (typeof RattachementRules !== 'undefined' && RattachementRules.DEFAULT_RHO) || 0;

    function createQuarterArcIfPossible(P0, P1, tolDiag) {
        var dx = P1.x - P0.x;
        var dy = P1.y - P0.y;
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        if (Math.abs(adx - ady) > (tolDiag || TOL_DIAG)) return null;
        var R = (adx + ady) * 0.5;
        if (R < 1e-6) return null;

        var minX = Math.min(P0.x, P1.x), maxX = Math.max(P0.x, P1.x);
        var minY = Math.min(P0.y, P1.y), maxY = Math.max(P0.y, P1.y);

        function buildArcForCenter(C) {
            var a0 = Math.atan2(P0.y - C.y, P0.x - C.x);
            var a1 = Math.atan2(P1.y - C.y, P1.x - C.x);
            var da = a1 - a0;
            while (da > Math.PI) da -= 2 * Math.PI;
            while (da < -Math.PI) da += 2 * Math.PI;
            var end = a0 + da;
            var amid = (a0 + end) * 0.5;
            var pmx = C.x + Math.cos(amid) * R;
            var pmy = C.y + Math.sin(amid) * R;
            var insideRect = (pmx >= minX - 1e-6 && pmx <= maxX + 1e-6 && pmy >= minY - 1e-6 && pmy <= maxY + 1e-6);
            if (pmx < -1e-6) return null;
            return {
                arc: K.ArcSegment(C.x, C.y, R, a0, end),
                score: (insideRect ? 0 : 1) + Math.abs(Math.abs(da) - (Math.PI / 2)) * 0.01
            };
        }

        var cand1 = buildArcForCenter({ x: P0.x, y: P1.y });
        var cand2 = buildArcForCenter({ x: P1.x, y: P0.y });
        if (!cand1 && !cand2) return null;
        if (cand1 && !cand2) return cand1.arc;
        if (!cand1 && cand2) return cand2.arc;
        return (cand1.score <= cand2.score) ? cand1.arc : cand2.arc;
    }

    function buildProfileCurves(profilePoints, data) {
        if (!K) return [];
        var points = profilePoints || [];
        if (points.length < 2) return [];
        data = data || {};
        var edgeTypes = data.edgeTypes || [];
        var rhos = data.rhos || [];

        var entities = [];
        var lastPoint = { x: points[0].x, y: points[0].y };

        for (var i = 0; i < points.length - 1; i++) {
            var P0 = lastPoint;
            var P1 = points[i + 1];
            var type = edgeTypes[i] || DEFAULT_EDGE_TYPE;
            var R = rhos[i] || DEFAULT_RHO;

            if (type === 'rayon') {
                var dxR = P1.x - P0.x;
                var dyR = P1.y - P0.y;
                var diff = Math.abs(Math.abs(dxR) - Math.abs(dyR));
                if (diff < TOL_DIAG) {
                    var arcQuarter = createQuarterArcIfPossible(P0, P1, TOL_DIAG);
                    entities.push(arcQuarter || K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                } else {
                    entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                }
                lastPoint = { x: P1.x, y: P1.y };
            } else if (type === 'courbeS' && R > 0) {
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
                            if (Math.min(Mx, Math.min(P0.x, P1.x)) < MIN_SAFE_X) {
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
                                entities.push(K.ArcSegment(C1x, C1y, R_eff, a1s, a1e));
                                entities.push(K.ArcSegment(C2x, C2y, R_eff, a2s, a2e));
                                lastPoint = { x: P1.x, y: P1.y };
                            }
                        }
                    }
                }
            } else if (type === 'spline') {
                var dxSp = P1.x - P0.x;
                var dySp = P1.y - P0.y;
                var dSp = Math.sqrt(dxSp * dxSp + dySp * dySp);
                if (dSp < 1e-6 || Math.abs(R) < 1e-3) {
                    entities.push(K.LineSegment(P0.x, P0.y, P1.x, P1.y));
                    lastPoint = { x: P1.x, y: P1.y };
                } else {
                    var nxSp = -dySp / dSp;
                    var nySp = dxSp / dSp;
                    if (R < 0) { nxSp = -nxSp; nySp = -nySp; }
                    var amp = Math.abs(R) * 0.3;
                    var midSpX = (P0.x + P1.x) * 0.5 + nxSp * amp;
                    var midSpY = (P0.y + P1.y) * 0.5 + nySp * amp;
                    var prevX = P0.x;
                    var prevY = P0.y;
                    for (var k = 1; k <= SPLINE_STEPS; k++) {
                        var t = k / SPLINE_STEPS;
                        var oneMinusT = 1 - t;
                        var bx = oneMinusT * oneMinusT * P0.x + 2 * oneMinusT * t * midSpX + t * t * P1.x;
                        var by = oneMinusT * oneMinusT * P0.y + 2 * oneMinusT * t * midSpY + t * t * P1.y;
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
