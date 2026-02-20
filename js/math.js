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
    // MOTEUR GÉOMÉTRIQUE - CORRECTION TANGENCE PARFAITE DU PIED
    // ==================================================================================
    
    // 1. Paramètres de la ligne du corps
    const dx_body = R_epaule_ext - R_bas;
    const dy_body = H_corps_fin; // La pente part de Y=0 théorique

    // 2. Calcul du Centre du cercle de pied (Cy, Cx)
    // IMPÉRATIF POUR TANGENCE AU FOND : Le centre Y doit être à R_pied du sol.
    const cy_pied = R_pied; 

    // Calcul de Cx pour être tangent aussi à la pente du corps :
    // On utilise l'angle de la pente par rapport à la verticale.
    const angle_corps_vert = Math.atan2(dx_body, dy_body);
    
    // Distance horizontale entre le coin théorique (R_bas) et le centre du cercle.
    // Formule trigonométrique basée sur la bissectrice de l'angle du coin.
    // L'angle du coin avec l'horizontale est (PI/2 - angle_corps_vert).
    // L'angle intérieur est PI + (PI/2 - angle_corps_vert) = 3*PI/2 - angle_corps_vert.
    // La bissectrice est à (3*PI/4 - angle_corps_vert/2).
    // tan(bissectrice) = R_pied / offset_x
    const angle_coin_horiz = Math.PI/2 - angle_corps_vert;
    // On évite les cas pathologiques (murs horizontaux ou rentrants extrêmes)
    const safe_angle = Math.max(0.1, Math.PI - angle_coin_horiz); 
    const tan_half_angle = Math.tan(safe_angle / 2);
    let offset_x = R_pied / tan_half_angle;
    
    if (dx_body < -0.001) { 
        // Cas bouteille conique inversée (le bas est plus large)
        offset_x = - R_pied / Math.tan((angle_coin_horiz)/2);
    }
    
    const cx_pied = R_bas - offset_x;

    // 3. Calcul du point de transition EXACT (T) sur la pente
    // Le point de tangence se trouve là où la normale a le même angle que la pente.
    // Ty = Cy - R * cos(angle_vert)
    // Tx = Cx + R * sin(angle_vert)
    const T_pied_body_y = cy_pied - R_pied * Math.cos(angle_corps_vert);
    const T_pied_body_x = cx_pied + R_pied * Math.sin(angle_corps_vert);

    // Sécurité pour éviter que le point de tangence ne dépasse la hauteur du corps
    const T_final_y = Math.min(T_pied_body_y, H_corps_fin - 0.1);

    // ==================================================================================
    // Suite des calculs (Haut de bouteille - Inchangé)
    // ==================================================================================
    const theta_body = Math.atan2(dy_body, dx_body); 
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

    // Génération des points clés Y
    let keyY = [0, T_final_y, T_body_y, T1y, T2y, T_neck_y, Y_bague_start, H_tot_reel];
    keyY.sort((a, b) => a - b); 

    const finalY = [];
    // On force le point 0 pour garantir le départ au fond
    if (keyY[0] > 0.001) finalY.push(0);
    
    for (let i = 0; i < keyY.length - 1; i++) {
        const yStart = keyY[i];
        const yEnd = keyY[i+1];
        const dist = yEnd - yStart;
        if (dist < 0.01) continue; 
        const steps = Math.ceil(dist * 3); // Un peu plus de points pour la précision
        for (let j = 0; j <= steps; j++) { // <= pour inclure le point final du segment
             finalY.push(yStart + (dist * (j / steps)));
        }
    }
    // Nettoyage des doublons éventuels proches
    const uniqueY = [finalY[0]];
    for(let i=1; i<finalY.length; i++) {
        if(finalY[i] - uniqueY[uniqueY.length-1] > 0.001) {
            uniqueY.push(finalY[i]);
        }
    }


    const points = [];
    // Génération des rayons X pour chaque Y
    for (let y of uniqueY) {
        // 1. Arc du Pied (Tangence parfaite)
        if (y < T_final_y - 0.001) {
            // Équation du cercle exact : x = cx + sqrt(R^2 - (y-cy)^2)
            // À y=0, y-cy = -R_pied, donc sqrt(R^2 - R^2) = 0. Donc x = cx. Tangente horizontale.
            let r_sq = R_pied * R_pied - (y - cy_pied) * (y - cy_pied);
            let r = cx_pied + Math.sqrt(Math.max(0, r_sq));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
            
        // 2. Ligne droite du corps (Interpolation depuis le point de tangence exact)
        } else if (y <= T_body_y + 0.001) {
            // Si le corps est vertical, on évite la division par zéro
            if (Math.abs(H_corps_fin - T_final_y) < 0.001) {
                 points.push(new THREE.Vector2(Math.max(0.01, R_bas), y));
            } else {
                // Interpolation linéaire entre T_pied et l'épaule
                let r = T_pied_body_x + (y - T_final_y) * (R_epaule_ext - T_pied_body_x) / (H_corps_fin - T_final_y);
                points.push(new THREE.Vector2(Math.max(0.01, r), y));
            }
            
        // 3. Reste du profil (Inchangé)
        } else if (bitangent_valid && y <= T1y + 0.001) {
            let r = cx1 + Math.sqrt(Math.max(0, r1**2 - (y - cy1)**2));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (bitangent_valid && y <= T2y + 0.001) {
            const t = (y - T1y) / (T2y - T1y);
            let r = cx1 + r1 * Math.cos(Math.atan2(cy2-cy1, cx2-cx1) - Math.acos((r1+r2)/Math.sqrt((cx2-cx1)**2+(cy2-cy1)**2))) + t * (cx2 + r2 * Math.cos(Math.atan2(cy2-cy1, cx2-cx1) - Math.acos((r1+r2)/Math.sqrt((cx2-cx1)**2+(cy2-cy1)**2)) + Math.PI) - (cx1 + r1 * Math.cos(Math.atan2(cy2-cy1, cx2-cx1) - Math.acos((r1+r2)/Math.sqrt((cx2-cx1)**2+(cy2-cy1)**2)))));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (bitangent_valid && y <= T_neck_y + 0.001) {
            let r = cx2 - Math.sqrt(Math.max(0, r2**2 - (y - cy2)**2));
            points.push(new THREE.Vector2(Math.max(0.01, r), y));
        } else if (!bitangent_valid && y <= T_neck_y + 0.001) {
             let r = R_epaule_ext + (y - H_corps_fin) * (R_bas_col_ext - R_epaule_ext) / (H_col_vertical_start - H_corps_fin);
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
    
    // Force le dernier point pour fermer proprement
    if (points.length > 0 && points[points.length-1].y < H_tot_reel) {
         points.push(new THREE.Vector2(Math.max(0.01, R_finish), H_tot_reel));
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
            if (Math.abs(profilPoints[i+1].y - profilPoints[i].y) < 0.0001) return profilPoints[i].x; // Évite div/0
            const t = (targetY - profilPoints[i].y) / (profilPoints[i+1].y - profilPoints[i].y);
            return profilPoints[i].x + t * (profilPoints[i+1].x - profilPoints[i].x);
        }
    }
    return profilPoints[profilPoints.length - 1].x; 
}
