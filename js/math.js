function generateBottleProfile() {
    // ==========================================
    // 1. INPUTS : HAUTEURS (Axe Y)
    // ==========================================
    const H_tot = parseFloat(document.getElementById('height-slider').value) || 320;
    const H_corps_fin = parseFloat(document.getElementById('body-height-slider').value) || 200;
    const H_col_vertical_start = parseFloat(document.getElementById('neck-height-slider').value) || 270;
    const H_finish = parseFloat(document.getElementById('finish-height-input').value) || 15;
    const Y_bague_start = H_tot - H_finish;

    // ==========================================
    // 2. INPUTS : DIAMÈTRES CONIQUES (Axe X)
    // ==========================================
    const R_bas = (parseFloat(document.getElementById('diameter-slider').value) || 75) / 2;
    const R_epaule_ext = (parseFloat(document.getElementById('shoulder-slider').value) || 75) / 2;
    const R_bas_col_ext = (parseFloat(document.getElementById('neck-bottom-diameter-slider').value) || 30) / 2;
    const R_haut_col = (parseFloat(document.getElementById('neck-top-diameter-slider').value) || 29) / 2;
    const R_finish = (parseFloat(document.getElementById('finish-diameter-input').value) || 30) / 2;

    // ==========================================
    // 3. INPUTS : RAYONS (Congés de raccordement)
    // ==========================================
    const R_pied = parseFloat(document.getElementById('base-radius-slider').value) || 5;
    const r1 = parseFloat(document.getElementById('shoulder-curve-slider').value) || 40; 
    const r2 = parseFloat(document.getElementById('neck-curve-slider').value) || 20; 

    // ==========================================
    // 4. MOTEUR OPTION B : TANGENCES PERPENDICULAIRES
    // ==========================================
    
    // --- A. CÔNE DU CORPS ET SON RAYON D'ÉPAULE ---
    // On calcule la pente du corps
    const dx_body = R_epaule_ext - R_bas;
    const dy_body = H_corps_fin - 0;
    const theta_body = Math.atan2(dy_body, dx_body);
    // On trouve l'axe perpendiculaire vers l'intérieur (+ 90 degrés)
    const theta_body_norm = theta_body + Math.PI / 2; 

    // Le centre du cercle d'épaule "glisse" sur cet axe perpendiculaire
    const cx1 = R_epaule_ext + r1 * Math.cos(theta_body_norm);
    const cy1 = H_corps_fin + r1 * Math.sin(theta_body_norm);
    
    // Le point de tangence exact est le sommet du cône
    const T_body_x = R_epaule_ext;
    const T_body_y = H_corps_fin;

    // --- B. CÔNE DU COL ET SON RAYON BAS COL ---
    // On calcule la pente du col
    const dx_neck = R_haut_col - R_bas_col_ext;
    const dy_neck = Y_bague_start - H_col_vertical_start;
    const theta_neck = Math.atan2(dy_neck, dx_neck);
    // On trouve l'axe perpendiculaire vers l'extérieur (- 90 degrés)
    const theta_neck_norm = theta_neck - Math.PI / 2;

    // Le centre du cercle du bas col "glisse" sur cet axe perpendiculaire
    const cx2 = R_bas_col_ext + r2 * Math.cos(theta_neck_norm);
    const cy2 = H_col_vertical_start + r2 * Math.sin(theta_neck_norm);
    
    // Le point de tangence exact est la base du cône du col
    const T_neck_x = R_bas_col_ext;
    const T_neck_y = H_col_vertical_start;

    // --- C. RAYON DU PIED ---
    // Calcul précis du congé entre le sol horizontal et le cône du corps
    let d_pied = R_pied / Math.tan(theta_body / 2); 
    let cx_pied = R_bas - d_pied;
    let cy_pied = R_pied;
    let T_pied_body_x = R_bas + d_pied * Math.cos(theta_body);
    let T_pied_body_y = d_pied * Math.sin(theta_body);

    // --- D. BITANGENTE (Ligne d'épaule entre les deux cercles) ---
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

    // ==========================================
    // 5. GÉNÉRATION DES POINTS DU PROFIL
    // ==========================================
    let keyY = [0, T_pied_body_y, T_body_y, T1y, T2y, T_neck_y, Y_bague_start, H_tot];
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

    const points = [];
    for (let y of finalY) {
        let r = R_bas;

        if (y < T_pied_body_y) {
            // Zone 1: Rayon du Pied
            r = cx_pied + Math.sqrt(Math.max(0, R_pied**2 - (y - cy_pied)**2));
        } else if (y <= T_body_y) {
            // Zone 2: Cône du corps (Le Maître absolu)
            r = R_bas + (y - 0) * (R_epaule_ext - R_bas) / (H_corps_fin - 0);
        } else if (bitangent_valid && y <= T1y) {
            // Zone 3: Rayon de l'épaule
            r = cx1 + Math.sqrt(Math.max(0, r1**2 - (y - cy1)**2));
        } else if (bitangent_valid && y <= T2y) {
            // Zone 4: Diagonale d'épaule
            const t = (y - T1y) / (T2y - T1y);
            r = T1x + t * (T2x - T1x);
        } else if (bitangent_valid && y <= T_neck_y) {
            // Zone 5: Rayon Bas Col
            r = cx2 - Math.sqrt(Math.max(0, r2**2 - (y - cy2)**2));
        } else if (!bitangent_valid && y <= T_neck_y) {
            // Sécurité si la géométrie est physiquement impossible
            const t = (y - T_body_y) / (T_neck_y - T_body_y);
            r = T_body_x + t * (T_neck_x - T_body_x);
        } else if (y <= Y_bague_start) {
            // Zone 6: Cône du col (Le Maître absolu)
            const t = (y - H_col_vertical_start) / (Y_bague_start - H_col_vertical_start);
            r = R_bas_col_ext + t * (R_haut_col - R_bas_col_ext);
        } else {
            // Zone 7: Bague
            r = R_finish;
        }
        
        points.push(new THREE.Vector2(Math.max(0.1, r), y));
    }
    return points;
}
