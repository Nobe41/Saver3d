import { params } from './state.js';

export function generateBottleProfile() {
    const points = [];
    const segments = 500;

    const H_tot = params.height;
    const D_corps = params.diameter;
    const R_corps = D_corps / 2;
    const R_pied = params.baseRadius;
    const H_corps_fin = params.bodyHeight;
    
    const R_epaule = params.shoulderCurve;
    const H_col_vertical_start = params.neckHeight;
    const R_bas_col = params.neckCurve;
    
    const D_col = params.neckTopDiameter;
    const R_col = D_col / 2;
    
    const H_finish = params.finishHeight;
    const D_finish = params.finishDiameter;
    const R_finish = D_finish / 2;
    
    const Y_bague_start = H_tot - H_finish;

    // CALCUL TANGENTE (Code Mathématique Précis)
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

    let T1y = H_corps_fin, T2y = H_col_vertical_start;
    let T1x = R_corps, T2x = R_col;
    let geometrie_valide = false;

    if (dist > r_sum) {
        geometrie_valide = true;
        const angle_centres = Math.atan2(dy, dx);
        const angle_offset = Math.acos(r_sum / dist);
        const theta1 = angle_centres - angle_offset;
        T1x = cx1 + r1 * Math.cos(theta1);
        T1y = cy1 + r1 * Math.sin(theta1);
        const theta2 = angle_centres - angle_offset + Math.PI;
        T2x = cx2 + r2 * Math.cos(theta2);
        T2y = cy2 + r2 * Math.sin(theta2);
    }

    // Points Clés
    let keyY = [0, R_pied, H_corps_fin, H_col_vertical_start, Y_bague_start, H_tot];
    if (geometrie_valide) {
        keyY.push(T1y, T2y);
    }
    keyY.sort((a, b) => a - b); 

    const finalY = [];
    for (let i = 0; i < keyY.length - 1; i++) {
        const yStart = keyY[i];
        const yEnd = keyY[i+1];
        const dist = yEnd - yStart;
        if (dist < 0.01) continue; 
        
        const steps = Math.ceil(dist * 2); 
        for (let j = 0; j < steps; j++) {
            finalY.push(yStart + (dist * (j / steps)));
        }
    }
    finalY.push(H_tot); 

    for (let y of finalY) {
        let r = R_corps;

        // PIED
        if (y < R_pied) {
            r = (R_corps - R_pied) + Math.sqrt(Math.max(0, R_pied**2 - (y - R_pied)**2));
        }
        // CORPS
        else if (y <= H_corps_fin) {
            r = R_corps;
        }
        // EPAULE
        else if (geometrie_valide && y <= T1y) {
            const dy_local = y - cy1;
            r = cx1 + Math.sqrt(Math.max(0, r1**2 - dy_local**2));
        }
        // DROITE TANGENTE
        else if (geometrie_valide && y <= T2y) {
            const t = (y - T1y) / (T2y - T1y);
            r = T1x + (T2x - T1x) * t;
        }
        // BAS COL
        else if (geometrie_valide && y <= H_col_vertical_start) {
            const dy_local = y - cy2;
            r = cx2 - Math.sqrt(Math.max(0, r2**2 - dy_local**2));
        }
        // SECOURS
        else if (!geometrie_valide && y <= H_col_vertical_start) {
            const t = (y - H_corps_fin) / (H_col_vertical_start - H_corps_fin);
            r = R_corps + (R_col - R_corps) * t;
        }
        // COL
        else if (y <= Y_bague_start) {
            r = R_col;
        }
        // BAGUE
        else {
            r = R_finish;
        }
        // Important pour Three.js : on retourne des Vector2
        points.push(new THREE.Vector2(Math.max(0.1, r), y));
    }
    return points;
}