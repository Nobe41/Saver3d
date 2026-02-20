const canvas2d = document.getElementById('canvas-2d');
const ctx2d = canvas2d.getContext('2d');
const view2DContainer = document.getElementById('viewport-2d');

// Variables de la caméra 2D
let cam2D = { x: 0, y: 0, zoom: 0 }; // Initialisé à 0 pour forcer le premier centrage
let isDragging2D = false;
let lastMouse2D = { x: 0, y: 0 };

// Tailles des formats papier (en mm)
const paperFormats = {
    'A4_P': { w: 210, h: 297 },
    'A4_L': { w: 297, h: 210 },
    'A3_P': { w: 297, h: 420 },
    'A3_L': { w: 420, h: 297 }
};

// Initialisation et Redimensionnement
function resizeCanvas2D() {
    // Si le conteneur est caché ou a une taille de 0, on annule pour éviter les bugs de taille microscopique
    if (view2DContainer.clientWidth === 0 || view2DContainer.clientHeight === 0) return;
    
    canvas2d.width = view2DContainer.clientWidth;
    canvas2d.height = view2DContainer.clientHeight;
    
    // Si c'est le premier affichage (zoom à 0), on centre la feuille à la bonne taille
    if (cam2D.zoom === 0) {
        centerPaper();
    }
    draw2D();
}

window.addEventListener('resize', () => {
    if (!view2DContainer.classList.contains('hidden')) {
        resizeCanvas2D();
    }
});

// NOUVEAU : Détecteur qui observe quand tu ouvres l'onglet 2D
const observer2D = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (!view2DContainer.classList.contains('hidden')) {
            // Laisse un petit délai au CSS pour s'afficher avant de calculer la taille
            setTimeout(resizeCanvas2D, 20); 
        }
    });
});
observer2D.observe(view2DContainer, { attributes: true, attributeFilter: ['class'] });

function centerPaper() {
    if (canvas2d.width === 0 || canvas2d.height === 0) return;
    
    const format = document.getElementById('paper-format-select').value;
    const paper = paperFormats[format] || paperFormats['A4_P'];
    
    // On calcule un zoom pour que la feuille prenne 85% de l'écran (belle taille)
    const scaleX = (canvas2d.width * 0.85) / paper.w;
    const scaleY = (canvas2d.height * 0.85) / paper.h;
    cam2D.zoom = Math.min(scaleX, scaleY);
    
    // On centre
    cam2D.x = canvas2d.width / 2;
    cam2D.y = canvas2d.height / 2;
}

// ----------------------------------------------------
// COMMANDES : SOURIS (Déplacement & Zoom)
// ----------------------------------------------------
canvas2d.addEventListener('mousedown', (e) => {
    isDragging2D = true;
    lastMouse2D = { x: e.clientX, y: e.clientY };
    canvas2d.style.cursor = 'grabbing';
});

canvas2d.addEventListener('mousemove', (e) => {
    if (!isDragging2D) return;
    const dx = e.clientX - lastMouse2D.x;
    const dy = e.clientY - lastMouse2D.y;
    cam2D.x += dx;
    cam2D.y += dy;
    lastMouse2D = { x: e.clientX, y: e.clientY };
    draw2D();
});

window.addEventListener('mouseup', () => {
    isDragging2D = false;
    canvas2d.style.cursor = 'grab';
});

canvas2d.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomAmount = -e.deltaY * 0.001;
    const newZoom = cam2D.zoom * (1 + zoomAmount);
    
    // On limite le zoom (ni trop petit, ni trop grand)
    if (newZoom > 0.1 && newZoom < 20) {
        const rect = canvas2d.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        cam2D.x = mouseX - (mouseX - cam2D.x) * (newZoom / cam2D.zoom);
        cam2D.y = mouseY - (mouseY - cam2D.y) * (newZoom / cam2D.zoom);
        cam2D.zoom = newZoom;
        draw2D();
    }
});

// ----------------------------------------------------
// DESSIN (Le cœur de la CAO)
// ----------------------------------------------------
function draw2D() {
    if (!ctx2d || canvas2d.width === 0) return;

    // 1. On nettoie tout et on peint le fond du logiciel
    ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
    ctx2d.fillStyle = '#eef2f5';
    ctx2d.fillRect(0, 0, canvas2d.width, canvas2d.height);

    ctx2d.save();
    
    // 2. On applique la position de la caméra et le zoom
    ctx2d.translate(cam2D.x, cam2D.y);
    ctx2d.scale(cam2D.zoom, cam2D.zoom);

    // ---- DESSIN DE LA FEUILLE BLANCHE ----
    const format = document.getElementById('paper-format-select').value;
    const paper = paperFormats[format] || paperFormats['A4_P'];
    const paperW = paper.w;
    const paperH = paper.h;
    
    // L'origine (0,0) de notre caméra est le centre de la feuille
    const startX = -paperW / 2;
    const startY = -paperH / 2;

    // Ombre de la feuille pour le style
    ctx2d.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx2d.shadowBlur = 10;
    ctx2d.shadowOffsetX = 5;
    ctx2d.shadowOffsetY = 5;
    
    ctx2d.fillStyle = '#ffffff';
    ctx2d.fillRect(startX, startY, paperW, paperH);
    
    // On enlève l'ombre pour la suite
    ctx2d.shadowColor = 'transparent';

    // ---- DESSIN DU CARTOUCHE (En bas à droite) ----
    const cartoucheW = 120;
    const cartoucheH = 40;
    const cartX = startX + paperW - cartoucheW - 5;
    const cartY = startY + paperH - cartoucheH - 5;

    ctx2d.strokeStyle = '#000000';
    ctx2d.lineWidth = 0.5;
    ctx2d.strokeRect(cartX, cartY, cartoucheW, cartoucheH);
    
    // Lignes du cartouche
    ctx2d.beginPath();
    ctx2d.moveTo(cartX, cartY + 10); ctx2d.lineTo(cartX + cartoucheW, cartY + 10);
    ctx2d.moveTo(cartX, cartY + 20); ctx2d.lineTo(cartX + cartoucheW, cartY + 20);
    ctx2d.moveTo(cartX, cartY + 30); ctx2d.lineTo(cartX + cartoucheW, cartY + 30);
    ctx2d.stroke();

    // Textes du cartouche
    ctx2d.fillStyle = '#000000';
    ctx2d.font = '4px Arial';
    ctx2d.fillText("Projet: " + document.getElementById('cartouche-title').value, cartX + 2, cartY + 7);
    ctx2d.fillText("Dessinateur: " + document.getElementById('cartouche-drafter').value, cartX + 2, cartY + 17);
    ctx2d.fillText("Vérificateur: " + document.getElementById('cartouche-checker').value, cartX + 2, cartY + 27);
    ctx2d.fillText("Contenance: " + document.getElementById('cartouche-capacity').value, cartX + 2, cartY + 37);
    
    const scaleSelect = document.getElementById('drawing-scale-select');
    const scaleText = scaleSelect.options[scaleSelect.selectedIndex].text;
    ctx2d.fillText("Echelle: " + scaleText, cartX + 70, cartY + 37);

    // ---- DESSIN DE LA BOUTEILLE (Le profil mathématique) ----
    const scaleValue = scaleSelect.value;
    let drawingScale = 1;
    if (scaleValue === "1:2") drawingScale = 0.5;
    if (scaleValue === "1:5") drawingScale = 0.2;
    if (scaleValue === "2:1") drawingScale = 2;

    if (typeof generateBottleProfile === 'function') {
        const points = generateBottleProfile(); 
        if (!points || points.length === 0) {
            ctx2d.restore();
            return;
        }

        const bottleHeight = points[points.length - 1].y;
        
        ctx2d.save();
        // On place la base de la bouteille au centre de la feuille (décalée vers le bas)
        ctx2d.translate(0, (bottleHeight * drawingScale) / 2); 
        ctx2d.scale(drawingScale, -drawingScale); // L'axe Y de l'écran descend, celui des maths monte

        // Axe de symétrie (Trait long, petit espace, trait court)
        ctx2d.beginPath();
        ctx2d.setLineDash([10, 2, 2, 2]);
        ctx2d.moveTo(0, -10);
        ctx2d.lineTo(0, bottleHeight + 20);
        ctx2d.strokeStyle = '#888888';
        ctx2d.lineWidth = 0.3 / drawingScale; 
        ctx2d.stroke();
        ctx2d.setLineDash([]);

        // Tracé du contour principal
        ctx2d.strokeStyle = '#000000';
        ctx2d.lineWidth = 0.8 / drawingScale; 
        ctx2d.lineJoin = 'round';

        // Moitié Droite
        ctx2d.beginPath();
        ctx2d.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx2d.lineTo(points[i].x, points[i].y);
        }
        ctx2d.lineTo(0, points[points.length-1].y);
        ctx2d.stroke();

        // Moitié Gauche (Miroir)
        ctx2d.beginPath();
        ctx2d.moveTo(-points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx2d.lineTo(-points[i].x, points[i].y);
        }
        ctx2d.lineTo(0, points[points.length-1].y);
        ctx2d.moveTo(points[0].x, points[0].y);
        ctx2d.lineTo(-points[0].x, points[0].y);
        ctx2d.stroke();

        ctx2d.restore(); 
    }
    ctx2d.restore(); 
}

// Sécurité au chargement
window.addEventListener('load', () => {
    setTimeout(resizeCanvas2D, 100);
});
