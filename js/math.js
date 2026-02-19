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
    // 3. INPUTS : RAYONS DE TANGENCE EXACTE
    // ==========================================
    const R_pied = parseFloat(document.getElementById('base-radius-slider').value) || 5;
    const r1 = parseFloat(document.getElementById('shoulder-curve-slider').value) || 40; 
    const r2 = parseFloat(document.getElementById('neck-curve-slider').value) || 20; 

    // ==========================================
    // 4. MOTEUR GÉOMÉTRIQUE : CALCUL DES TANGENTES
    // ==========================================
    
    // Centres des cercles principaux (Épaule et Col)
    const cx1 = R_epaule_ext - r1; 
    const cy1 = H_corps_fin;       
    const cx2 = R_bas_col_ext + r2; 
    const cy2 = H_col_vertical_start; 

    // --- A. TANGENTE : Corps -> Épaule (Cercle 1) ---
    // Trouver le point exact où le cône du corps touche le cercle de l'épaule
    const dx_body = cx1 - R_bas;
    const dy_body = cy1 - 0;
    const dist_body = Math.sqrt(dx_body*dx_body + dy_body*dy_body);
    let T_body_x = R_epaule_ext;
    let T_body_y = cy1;
    let body_valid = dist_body >= r1;
    
    if (body_valid) {
        const gamma = Math.atan2(dy_body, dx_body);
        const alpha = Math.asin(r1 / dist_body);
        const theta_norm = gamma - alpha - Math.PI / 2; // Normale au point de tangence
        T_body_x = cx1 + r1 * Math.cos(theta_norm);
        T_body_y = cy1 + r1 * Math.sin(theta_norm);
    }

    // --- B. TANGENTE : Base (Pied) -> Corps ---
    // Création du congé (fillet) parfait entre le sol et la ligne inclinée du corps
    let theta_body = Math.atan2(T_body_y - 0, T_body_x - R_bas);
    let d_pied = R_pied / Math.tan(theta_body / 2);
    let cx_pied = R_bas - d_pied;
    let cy_pied = R_pied;
    
    // Points de tangence du pied
    let T_pied_floor_x = cx_pied;
    let T_pied_body_x = R_bas - Math.cos(theta_body) * d_pied;
    let T_pied_body_y = Math.sin(theta_body) * d_pied;

    // --- C. BITANGENTE : Épaule (Cercle 1) -> Bas Col (Cercle 2) ---
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const r_sum = r1 + r2;
    let T1x = R_epaule_ext, T1y = cy1;
    let T2x = R_bas_col_ext, T2y = cy2;
    let bitangent_valid = dist >= r_sum;
    
    if (bitangent_valid) {
        const angle_centres = Math.atan2(dy, dx);
        const angle_offset = Math.acos(r_sum / dist);
        
        const theta1 = angle_centres - angle_offset;
        T1x = cx1 + r1 * Math.cos(theta1);
        T1y = cy1 + r1 * Math.sin(theta1);
        
        const theta2 = angle_centres - angle_offset + Math.PI;
        T2x = cx2 + r2 * Math.cos(theta2);
        T2y = cy2 + r2 * Math.sin(theta2);
    }

    // --- D. TANGENTE : Bas Col (Cercle 2) -> Haut Col ---
    const dx_neck = R_haut_col - cx2;
    const dy_neck = Y_bague_start - cy2;
    const dist_neck = Math.sqrt(dx_neck*dx_neck + dy_neck*dy_neck);
    let T_neck_x = R_bas_col_ext;
    let T_neck_y = cy2;
    let neck_valid = dist_neck >= r2;
    
    if (neck_valid) {
        const gamma_n = Math.atan2(dy_neck, dx_neck);
        const ratio = Math.max(-1, Math.min(1, r2 / dist_neck)); // Sécurité mathématique
        const alpha_n = Math.acos(ratio);
        const theta_norm2 = gamma_n + alpha_n;
        T_neck_x = cx2 + r2 * Math.cos(theta_norm2);
        T_neck_y = cy2 + r2 * Math.sin(theta_norm2);
    }

    // ==========================================
    // 5. CONSTRUCTION DE LA COURBE PAR ZONES
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

        // ZONE 1 : Rayon du Pied (Arc de cercle parfait)
        if (y < T_pied_body_y) {
            r = cx_pied + Math.sqrt(Math.max(0, R_pied**2 - (y - cy_pied)**2));
        }
        // ZONE 2 : Ligne du Corps (Cône incliné parfait)
        else if (y <= T_body_y) {
            const t = (y - T_pied_body_y) / (T_body_y - T_pied_body_y);
            r = T_pied_body_x + t * (T_body_x - T_pied_body_x);
        }
        // ZONE 3 : Rayon d'Épaule (Arc de cercle parfait)
        else if (body_valid && y <= T1y) {
            r = cx1 + Math.sqrt(Math.max(0, r1**2 - (y - cy1)**2));
        }
        // ZONE 4 : Ligne bitangente (Diagonale d'épaule)
        else if (bitangent_valid && y <= T2y) {
            const t = (y - T1y) / (T2y - T1y);
            r = T1x + t * (T2x - T1x);
        }
        // ZONE 5 : Rayon du Bas Col (Arc de cercle parfait inversé)
        else if (bitangent_valid && y <= T_neck_y) {
            r = cx2 - Math.sqrt(Math.max(0, r2**2 - (y - cy2)**2));
        }
        // ZONE 6 : Ligne du Col (Cône incliné parfait)
        else if (y <= Y_bague_start) {
            const t = (y - T_neck_y) / (Y_bague_start - T_neck_y);
            r = T_neck_x + t * (R_haut_col - T_neck_x);
        }
        // ZONE 7 : Bague (Tube Droit)
        else {
            r = R_finish;
        }
        
        // Sécurité contre les erreurs 3D
        points.push(new THREE.Vector2(Math.max(0.1, r), y));
    }
    return points;
}
