function generateBottleProfile() {
    const H_base = parseFloat(document.getElementById('height-slider').value) || 320;
    const H_corps_fin = parseFloat(document.getElementById('body-height-slider').value) || 200;
    const H_col_vertical_start = parseFloat(document.getElementById('neck-height-slider').value) || 270;
    const H_finish = parseFloat(document.getElementById('finish-height-input').value) || 15;
    const Y_bague_start = H_base - 15; 
    const H_tot_reel = Y_bague_start + H_finish;

    const R_bas = (parseFloat(document.getElementById('diameter-slider').value) || 75) / 2;
    const R_epaule_ext = (parseFloat(document.getElementById('shoulder-slider').value) || 75) / 2;
    const R_bas_col_ext = (parseFloat(document.getElementById('neck-bottom-diameter-slider').value) || 30) / 2;
    const R_haut_col = (parseFloat(document.getElementById('neck-top-diameter-slider').value) || 29) / 2;
    const R_finish = (parseFloat(document.getElementById('finish-diameter-input').value) || 30) / 2;

    const R_pied = parseFloat(document.getElementById('base-radius-slider').value) || 5;
    const r1 = parseFloat(document.getElementById('shoulder-curve-slider').value) || 40; 
    const r2 = parseFloat(document.getElementById('neck-curve-slider').value) || 20; 

    // ==================================================================================
    // 1. GÉOMÉTRIE EXACTE DU PIED (Cercle tangent au fond Y=0 et à la droite du corps)
    // ==================================================================================
    const dx_body = R_epaule_ext - R_bas;
    const dy_body = H_corps_fin; 
    const L_body = Math.sqrt(dx_body * dx_body + dy_body * dy_body);

    // Centre de l'arc de cercle (Cy = R_pied garantit la tangence parfaite avec le fond plat)
    const cy_pied = R_pied;
    // Formule analytique exacte de la distance du centre pour être tangent à la pente
    const cx_pied = R_bas + R_pied * (dx_body - L_body) / dy_body;

    // Calcul du point de jonction exact T(x, y) entre l'arc et la droite du corps
    const T_pied_body_x = cx_pied + R_pied * (dy_body / L_body);
    const T_pied_body_y = cy_pied - R_pied * (dx_body / L_body);
    
    // ==================================================================================
    // 2. ÉPAULE ET COL (Conservé de ton code d'origine fonctionnel)
    // ==================================================================================
    const theta_body = Math.atan2(dy_body, dx_body);
    const theta_body_norm = theta_body + Math.PI / 2; 

    const cx1 = R_epaule_ext + r1 * Math.cos(theta_body_norm);
    const cy1 = H_corps_fin + r1 * Math.sin(theta_body_norm);
    const T_body_y = H_corps_fin;
    const T_body_x = R_epaule_ext;

    const dx_neck = R_haut_col - R_bas_col_ext;
    const dy_neck = Y_bague_start - H_col_vertical_start;
    const theta_neck = Math.atan2(dy_neck, dx_neck);
    const theta_neck_norm = theta_neck - Math.PI / 2;

    const cx2 = R_bas_col_ext + r2 * Math.cos(theta_neck_norm);
    const cy2 = H_col_vertical_start + r2 * Math.sin(theta_neck_norm);
    const T_neck_x = R_bas_col_ext;
    const T_neck_y = H_col_vertical_start;

    const dx_c = cx2 - cx1;
    const dy_c = cy2 - cy1;
    const dist_c = Math.sqrt(dx_c*dx_c + dy_c*dy_c);
    const r_sum = r1 + r2;
    let T1x = cx1, T1y = cy1 + r1; 
    let T2x = cx2, T2y = cy2 - r2;
    let bitangent_valid = dist_c >= r_sum;
    
    if (bitangent_valid) {
        const angle_centres = Math.atan2(dy_c, dx_c);
        const angle_offset = Math.acos(r_sum / dist_c);
        const theta1 = angle_centres - angle_offset;
        T1x = cx1 + r1 * Math.cos(theta1);
        T1y = cy1 + r1 * Math.sin(theta1);
        const theta2 = angle_centres - angle_offset + Math.PI;
        T2x = cx2 + r2 * Math.cos(theta2);
        T2y = cy2 + r2 * Math.sin(theta2);
    }

    // ==================================================================================
    // 3. CONSTRUCTION DE L'AXE Y (Avec sécurité anti-trous)
    // ==================================================================================
    let keyY = [0, T_pied_body_y, T_body_y, T1y, T2y, T_neck_y, Y_bague_start, H_tot_reel];
    keyY.sort((a, b) => a - b); 

    const finalY = [];
    for (let i = 0; i < keyY.length - 1; i++) {
        const yStart = keyY[i];
        const yEnd = keyY[i+1];
        const dist = yEnd - yStart;
        if (dist < 0.01) continue; 
        const steps = Math.ceil(dist * 3); 
        for (let j = 0; j <= steps; j++) {
            const valY = yStart + (dist * (j / steps));
            // Ajoute uniquement si la valeur n'existe pas déjà (évite les doublons)
            if (finalY.length === 0 || Math.abs(finalY[finalY.length-1] - valY) > 0.001) {
                finalY.push(valY);
            }
        }
    }
    if (Math.abs(finalY[finalY.length-1] - H_tot_reel) > 0.001) finalY.push(H_tot_reel);

    // ==================================================================================
    // 4. RÉSOLUTION DES COORDONNÉES X
    // ==================================================================================
    const points = [];
    for (let y of finalY) {
        if (y < T_pied_body_y) {
            // ARC DU PIED TANGENT
            let r_sq = R_pied * R_pied - (y - cy_pied) * (y - cy_pied);
            let r = cx_pied + Math.sqrt(Math.max(0, r_sq));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (y <= T_body_y) {
            // CORPS DROIT TANGENT (Parfaitement raccordé au point T_pied_body)
            let r = T_pied_body_x + (y - T_pied_body_y) * (R_epaule_ext - T_pied_body_x) / (H_corps_fin - T_pied_body_y);
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (bitangent_valid && y <= T1y) {
            let r = cx1 + Math.sqrt(Math.max(0, r1**2 - (y - cy1)**2));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (bitangent_valid && y <= T2y) {
            const t = (y - T1y) / (T2y - T1y);
            let r = T1x + t * (T2x - T1x);
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (bitangent_valid && y <= T_neck_y) {
            let r = cx2 - Math.sqrt(Math.max(0, r2**2 - (y - cy2)**2));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (!bitangent_valid && y <= T_neck_y) {
            const t = (y - T_body_y) / (T_neck_y - T_body_y);
            let r = T_body_x + t * (T_neck_x - T_body_x);
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (y < Y_bague_start - 0.001) {
            const t = (y - H_col_vertical_start) / (Y_bague_start - H_col_vertical_start);
            let r = R_bas_col_ext + t * (R_haut_col - R_bas_col_ext);
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (Math.abs(y - Y_bague_start) <= 0.001) {
            points.push(new THREE.Vector2(Math.max(0.01, R_haut_col), Y_bague_start));
            points.push(new THREE.Vector2(Math.max(0.01, R_finish), Y_bague_start));
        } else {
            points.push(new THREE.Vector2(Math.max(0.01, R_finish), y));
        }
    }
    return points;
}

// Outil indispensable pour le plaquage des gravures
function getRadiusAtHeight(targetY, profilPoints) {
    if (!profilPoints || profilPoints.length === 0) return 30;
    if (targetY <= profilPoints[0].y) return profilPoints[0].x;
    if (targetY >= profilPoints[profilPoints.length - 1].y) return profilPoints[profilPoints.length - 1].x;
    
    for (let i = 0; i < profilPoints.length - 1; i++) {
        if (targetY >= profilPoints[i].y && targetY <= profilPoints[i+1].y) {
            if (Math.abs(profilPoints[i+1].y - profilPoints[i].y) < 0.0001) return profilPoints[i].x; 
            const t = (targetY - profilPoints[i].y) / (profilPoints[i+1].y - profilPoints[i].y);
            return profilPoints[i].x + t * (profilPoints[i+1].x - profilPoints[i].x);
        }
    }
    return profilPoints[profilPoints.length - 1].x; 
}
