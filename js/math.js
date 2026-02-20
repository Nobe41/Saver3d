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
    // MOTEUR GÉOMÉTRIQUE - CORRECTION DE LA TANGENCE DU PIED
    // ==================================================================================
    
    // 1. Définition de la ligne droite du corps (de la base théorique à l'épaule)
    const dx_body = R_epaule_ext - R_bas;
    const dy_body = H_corps_fin - 0;
    // Angle de cette ligne par rapport à l'horizontale
    const theta_body_horiz = Math.atan2(dy_body, dx_body);

    // 2. CALCUL DU CENTRE DU CERCLE TANGENT (Méthode de la bissectrice)
    // Le centre d'un cercle tangent à deux droites se trouve sur leur bissectrice.
    // L'angle de la bissectrice avec l'horizontale est la moitié de l'angle du corps.
    const angle_bisector = theta_body_horiz / 2;

    // Le centre Y est toujours à une distance R_pied du fond plat (y=0)
    const cy_pied = R_pied; 
    
    // Calcul du centre X :
    let cx_pied = R_bas - R_pied; // Cas par défaut (mur vertical)
    // Si le mur est incliné, on utilise la trigonométrie dans le triangle formé par le sommet, le centre et sa projection.
    // tan(angle_bisector) = côté_opposé / côté_adjacent = R_pied / (R_bas - cx_pied)
    if (Math.abs(dx_body) > 0.0001) { // Protection contre la division par zéro
        cx_pied = R_bas - R_pied / Math.tan(angle_bisector);
    }

    // 3. CALCUL DU POINT DE TANGENCE EXACT (T) SUR LA LIGNE DU CORPS
    // Le rayon allant du centre au point de tangence est perpendiculaire à la ligne du corps.
    // L'angle de ce rayon est donc (theta_body_horiz - 90°).
    // T.x = cx + R * cos(angle_rayon)
    // T.y = cy + R * sin(angle_rayon)
    // En utilisant les identités cos(a-PI/2)=sin(a) et sin(a-PI/2)=-cos(a) :
    const T_pied_body_x = cx_pied + R_pied * Math.sin(theta_body_horiz);
    const T_pied_body_y = cy_pied - R_pied * Math.cos(theta_body_horiz);

    // ==================================================================================
    // Suite des calculs pour le haut de la bouteille (inchangés)
    // ==================================================================================
    const theta_body = Math.atan2(dy_body, dx_body); // Angle avec la verticale pour la suite
    const theta_body_norm = theta_body + Math.PI / 2; 

    const cx1 = R_epaule_ext + r1 * Math.cos(theta_body_norm);
    const cy1 = H_corps_fin + r1 * Math.sin(theta_body_norm);
    const T_body_y = H_corps_fin;

    const dx_neck = R_haut_col - R_bas_col_ext;
    const dy_neck = Y_bague_start - H_col_vertical_start;
    const theta_neck = Math.atan2(dy_neck, dx_neck);
    const theta_neck_norm = theta_neck - Math.PI / 2;

    const cx2 = R_bas_col_ext + r2 * Math.cos(theta_neck_norm);
    const cy2 = H_col_vertical_start + r2 * Math.sin(theta_neck_norm);
    const T_neck_y = H_col_vertical_start;

    const dx_c = cx2 - cx1;
    const dy_c = cy2 - cy1;
    const dist_c = Math.sqrt(dx_c*dx_c + dy_c*dy_c);
    const r_sum = r1 + r2;
    let T1y = cy1 + r1; 
    let T2y = cy2 - r2;
    let bitangent_valid = dist_c >= r_sum;
    
    if (bitangent_valid) {
        const angle_centres = Math.atan2(dy_c, dx_c);
        const angle_offset = Math.acos(r_sum / dist_c);
        const theta1 = angle_centres - angle_offset;
        T1y = cy1 + r1 * Math.sin(theta1);
        const theta2 = angle_centres - angle_offset + Math.PI;
        T2y = cy2 + r2 * Math.sin(theta2);
    }

    // On insère notre nouveau point de tangence exact dans la liste des points clés
    let keyY = [0, T_pied_body_y, T_body_y, T1y, T2y, T_neck_y, Y_bague_start, H_tot_reel];
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
    finalY.push(H_tot_reel); 

    const points = [];
    // Génération des points du profil
    for (let y of finalY) {
        // 1. Zone du Pied (Arc de cercle exact)
        if (y < T_pied_body_y) {
            // Équation du cercle : (x - cx)^2 + (y - cy)^2 = R^2
            // Donc x = cx + sqrt(R^2 - (y - cy)^2)
            let r_sq = R_pied * R_pied - (y - cy_pied) * (y - cy_pied);
            // Math.max(0, ...) est une sécurité contre les erreurs d'arrondi minuscules
            let r = cx_pied + Math.sqrt(Math.max(0, r_sq));
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
            
        // 2. Ligne droite du corps (Tangence parfaite)
        } else if (y <= T_body_y) {
            // On trace une ligne droite qui part EXACTEMENT du point de tangence T
            // jusqu'au point de l'épaule.
            // Formule d'interpolation linéaire : r(y) = x_départ + (y - y_départ) * pente
            let r = T_pied_body_x + (y - T_pied_body_y) * (R_epaule_ext - T_pied_body_x) / (H_corps_fin - T_pied_body_y);
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
            
        // 3. Reste du profil (Inchangé)
        } else if (bitangent_valid && y <= T1y) {
            let r = cx1 + Math.sqrt(Math.max(0, r1**2 - (y - cy1)**2));
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
        } else if (bitangent_valid && y <= T2y) {
            const t = (y - T1y) / (T2y - T1y);
            let r = cx1 + r1 * Math.cos(Math.atan2(cy2-cy1, cx2-cx1) - Math.acos((r1+r2)/Math.sqrt((cx2-cx1)**2+(cy2-cy1)**2))) + t * (cx2 + r2 * Math.cos(Math.atan2(cy2-cy1, cx2-cx1) - Math.acos((r1+r2)/Math.sqrt((cx2-cx1)**2+(cy2-cy1)**2)) + Math.PI) - (cx1 + r1 * Math.cos(Math.atan2(cy2-cy1, cx2-cx1) - Math.acos((r1+r2)/Math.sqrt((cx2-cx1)**2+(cy2-cy1)**2)))));
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
        } else if (bitangent_valid && y <= T_neck_y) {
            let r = cx2 - Math.sqrt(Math.max(0, r2**2 - (y - cy2)**2));
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
        } else if (!bitangent_valid && y <= T_neck_y) {
             let r = R_epaule_ext + (y - H_corps_fin) * (R_bas_col_ext - R_epaule_ext) / (H_col_vertical_start - H_corps_fin);
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
        } else if (y < Y_bague_start - 0.001) {
            const t = (y - H_col_vertical_start) / (Y_bague_start - H_col_vertical_start);
            let r = R_bas_col_ext + t * (R_haut_col - R_bas_col_ext);
            points.push(new THREE.Vector2(Math.max(0.1, r), y));
        } else if (Math.abs(y - Y_bague_start) <= 0.001) {
            points.push(new THREE.Vector2(Math.max(0.1, R_haut_col), Y_bague_start));
            points.push(new THREE.Vector2(Math.max(0.1, R_finish), Y_bague_start));
        } else {
            points.push(new THREE.Vector2(Math.max(0.1, R_finish), y));
        }
    }
    return points;
}

// Outil indispensable pour le plaquage des gravures
function getRadiusAtHeight(targetY, profilPoints) {
    if (targetY <= profilPoints[0].y) return profilPoints[0].x;
    if (targetY >= profilPoints[profilPoints.length - 1].y) return profilPoints[profilPoints.length - 1].x;
    
    for (let i = 0; i < profilPoints.length - 1; i++) {
        if (targetY >= profilPoints[i].y && targetY <= profilPoints[i+1].y) {
            const t = (targetY - profilPoints[i].y) / (profilPoints[i+1].y - profilPoints[i].y);
            return profilPoints[i].x + t * (profilPoints[i+1].x - profilPoints[i].x);
        }
    }
    return 30; 
}
