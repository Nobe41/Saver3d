function generateBottleProfile() {
    // ==========================================
    // 1. INPUTS DES HAUTEURS (Axe Y)
    // ==========================================
    const H_tot = parseFloat(document.getElementById('height-slider').value) || 320;
    const H_corps_fin = parseFloat(document.getElementById('body-height-slider').value) || 200;
    const H_col_vertical_start = parseFloat(document.getElementById('neck-height-slider').value) || 270;
    const H_finish = parseFloat(document.getElementById('finish-height-input').value) || 15;
    const Y_bague_start = H_tot - H_finish;

    // ==========================================
    // 2. INPUTS DES DIAMÈTRES CONIQUES (Axe X)
    // ==========================================
    // Diamètre tout en bas (au-dessus du pied)
    const D_bas = parseFloat(document.getElementById('diameter-slider').value) || 75;
    const R_bas = D_bas / 2;

    // Diamètre à l'épaule (au niveau du centre du rayon épaule)
    const D_epaule = parseFloat(document.getElementById('shoulder-slider').value) || 75;
    const R_epaule_ext = D_epaule / 2;

    // Diamètre au bas du col (au niveau du centre du rayon bas col)
    const D_bas_col = parseFloat(document.getElementById('neck-bottom-diameter-slider').value) || 30;
    const R_bas_col_ext = D_bas_col / 2;

    // Diamètre en haut du col (juste sous la bague)
    const D_haut_col = parseFloat(document.getElementById('neck-top-diameter-slider').value) || 29;
    const R_haut_col = D_haut_col / 2;

    // Diamètre de la bague
    const D_finish = parseFloat(document.getElementById('finish-diameter-input').value) || 30;
    const R_finish = D_finish / 2;

    // ==========================================
    // 3. INPUTS DES RAYONS DE COURBURE
    // ==========================================
    const R_pied = parseFloat(document.getElementById('base-radius-slider').value) || 5;
    const r1 = parseFloat(document.getElementById('shoulder-curve-slider').value) || 40; 
    const r2 = parseFloat(document.getElementById('neck-curve-slider').value) || 20; 

    // ==========================================
    // 4. CALCULS DES CENTRES ET TANGENTES
    // ==========================================
    // Centre du cercle de l'épaule (lié au diamètre épaule)
    const cx1 = R_epaule_ext - r1; 
    const cy1 = H_corps_fin;       
    
    // Centre du cercle du bas col (lié au diamètre bas col)
    const cx2 = R_bas_col_ext + r2; 
    const cy2 = H_col_vertical_start; 

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const r_sum = r1 + r2;

    let T1y = cy1, T2y = cy2;
    let T1x = cx1 + r1, T2x = cx2 - r2;
    let geometrie_valide = false;

    // Calcul trigonométrique de la tangente parfaite
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

    // ==========================================
    // 5. GÉNÉRATION DES POINTS DU PROFIL
    // ==========================================
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

    const points = [];
    for (let y of finalY) {
        let r = R_bas;

        // ZONE A : PIED (Arrondi raccordé au cône)
        if (y < R_pied) {
            // On calcule le rayon théorique du cône à cette hauteur
            const r_cone = R_bas + (R_epaule_ext - R_bas) * (y / H_corps_fin);
            r = (r_cone - R_pied) + Math.sqrt(Math.max(0, R_pied**2 - (y - R_pied)**2));
        }
        
        // ZONE B : CORPS (Équation de Cône linéaire)
        else if (y <= H_corps_fin) {
            r = R_bas + (R_epaule_ext - R_bas) * (y / H_corps_fin);
        }
        
        // ZONE C : ÉPAULE (Arc de cercle 1)
        else if (geometrie_valide && y <= T1y) {
            const dy_local = y - cy1;
            r = cx1 + Math.sqrt(Math.max(0, r1**2 - dy_local**2));
        }
        
        // ZONE D : TANGENTE (Diagonale droite reliant les deux cercles)
        else if (geometrie_valide && y <= T2y) {
            const t = (y - T1y) / (T2y - T1y);
            r = T1x + (T2x - T1x) * t;
        }
        
        // ZONE E : BAS COL (Arc de cercle 2)
        else if (geometrie_valide && y <= H_col_vertical_start) {
            const dy_local = y - cy2;
            r = cx2 - Math.sqrt(Math.max(0, r2**2 - dy_local**2));
        }
        
        // CAS DE SECOURS (Si impossible géométriquement)
        else if (!geometrie_valide && y <= H_col_vertical_start) {
            const t = (y - H_corps_fin) / (H_col_vertical_start - H_corps_fin);
            r = R_epaule_ext + (R_bas_col_ext - R_epaule_ext) * t;
        }
        
        // ZONE F : COL (Équation de Cône linéaire)
        else if (y <= Y_bague_start) {
            // Le "t" calcule l'avancement en % le long du col
            const t = (y - H_col_vertical_start) / (Y_bague_start - H_col_vertical_start);
            r = R_bas_col_ext + (R_haut_col - R_bas_col_ext) * t;
        }
        
        // ZONE G : BAGUE (Cylindre droit)
        else {
            r = R_finish;
        }
        
        points.push(new THREE.Vector2(Math.max(0.1, r), y));
    }
    return points;
}
