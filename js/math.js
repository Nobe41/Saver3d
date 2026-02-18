// FONCTION DE CALCUL DU PROFIL DE LA BOUTEILLE
function generateBottleProfile() {
    const points = [];
    
    // Récupération des valeurs
    const H = params.height;
    const Rb = params.diameter / 2; // Rayon Corps
    const Rn = params.neckDiameter / 2; // Rayon Col
    const Hb = params.bodyHeight; // Fin du corps droit
    const Hn = params.neckHeight; // Début du col droit
    const Rs = params.shoulderCurve; // Rayon épaule fictif
    
    // On divise la hauteur en 200 tranches pour dessiner
    const steps = 200;

    for (let i = 0; i <= steps; i++) {
        const y = (i / steps) * H;
        let r = Rb;

        // 1. LE PIED (Arrondi bas)
        if (y < params.baseRadius) {
            // Formule de quart de cercle
            const h_local = params.baseRadius - y;
            const retrait = params.baseRadius - Math.sqrt(Math.max(0, params.baseRadius**2 - h_local**2));
            r = Rb - retrait;
        }
        // 2. LE CORPS (Droit)
        else if (y <= Hb) {
            r = Rb;
        }
        // 3. L'ÉPAULE (Transition courbe)
        else if (y <= Hn) {
            // Interpolation simple (Sigmoïde) pour faire une jolie courbe
            const t = (y - Hb) / (Hn - Hb); // t va de 0 à 1
            // Formule cosine pour une courbe douce
            const factor = (1 - Math.cos(t * Math.PI)) / 2; 
            r = Rb + (Rn - Rb) * factor;
        }
        // 4. LE COL (Droit)
        else if (y <= H - params.finishHeight) {
            r = Rn;
        }
        // 5. LA BAGUE (Un peu plus large)
        else {
            r = Rn + 1.5; // Bague standard
        }

        // On évite les rayons négatifs (bug 3D)
        if (r < 0.1) r = 0.1;
        
        // On ajoute le point (X = Rayon, Y = Hauteur)
        points.push(new THREE.Vector2(r, y));
    }

    return points;
}
