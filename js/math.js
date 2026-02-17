function generateBottleProfile() {
    const H_tot = params.height;
    const R_corps = params.diameter / 2;
    const R_pied = params.baseRadius;
    const H_corps_fin = params.bodyHeight;
    const R_epaule = params.shoulderCurve;
    const H_col_vertical_start = params.neckHeight;
    const R_bas_col = params.neckCurve;
    const R_col = params.neckTopDiameter / 2;
    const Y_bague_start = H_tot - params.finishHeight;

    // Calcul Tangente
    const cx1 = R_corps - R_epaule;
    const cy1 = H_corps_fin; 
    const r1 = R_epaule;
    const cx2 = R_col + R_bas_col;
    const cy2 = H_col_vertical_start;
    const r2 = R_bas_col;

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const r_sum = r1 + r2;

    let T1y = H_corps_fin, T1x = R_corps, T2y = H_col_vertical_start, T2x = R_col;
    let geometrie_valide = (dist > r_sum);

    if (geometrie_valide) {
        const angle_centres = Math.atan2(dy, dx);
        const angle_offset = Math.acos(r_sum / dist);
        T1x = cx1 + r1 * Math.cos(angle_centres - angle_offset);
        T1y = cy1 + r1 * Math.sin(angle_centres - angle_offset);
        T2x = cx2 + r2 * Math.cos(angle_centres - angle_offset + Math.PI);
        T2y = cy2 + r2 * Math.sin(angle_centres - angle_offset + Math.PI);
    }

    const points = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
        let y = (i / steps) * H_tot;
        let r = R_corps;

        if (y < R_pied) {
            r = (R_corps - R_pied) + Math.sqrt(Math.max(0, R_pied**2 - (y - R_pied)**2));
        } else if (y <= H_corps_fin) {
            r = R_corps;
        } else if (geometrie_valide && y <= T1y) {
            r = cx1 + Math.sqrt(Math.max(0, r1**2 - (y - cy1)**2));
        } else if (geometrie_valide && y <= T2y) {
            const t = (y - T1y) / (T2y - T1y);
            r = T1x + (T2x - T1x) * t;
        } else if (y <= H_col_vertical_start) {
            r = cx2 - Math.sqrt(Math.max(0, r2**2 - (y - cy2)**2));
        } else if (y <= Y_bague_start) {
            r = R_col;
        } else {
            r = params.finishDiameter / 2;
        }
        points.push(new THREE.Vector2(Math.max(0.1, r), y));
    }
    return points;
}
