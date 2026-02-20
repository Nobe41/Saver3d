const canvas2d = document.getElementById('canvas-2d');
const ctx2d = canvas2d.getContext('2d');
const view2DContainer = document.getElementById('viewport-2d');

// Variables de la caméra 2D
let cam2D = { x: 0, y: 0, zoom: 0 }; 
let isDragging2D = false;
let lastMouse2D = { x: 0, y: 0 };

const paperFormats = {
    'A4_P': { w: 210, h: 297 },
    'A4_L': { w: 297, h: 210 },
    'A3_P': { w: 297, h: 420 },
    'A3_L': { w: 420, h: 297 }
};

function resizeCanvas2D() {
    if (view2DContainer.clientWidth === 0 || view2DContainer.clientHeight === 0) return;
    canvas2d.width = view2DContainer.clientWidth;
    canvas2d.height = view2DContainer.clientHeight;
    if (cam2D.zoom === 0) centerPaper();
    draw2D();
}

window.addEventListener('resize', () => {
    if (!view2DContainer.classList.contains('hidden')) resizeCanvas2D();
});

const observer2D = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (!view2DContainer.classList.contains('hidden')) {
            setTimeout(resizeCanvas2D, 20); 
        }
    });
});
observer2D.observe(view2DContainer, { attributes: true, attributeFilter: ['class'] });

function centerPaper() {
    if (canvas2d.width === 0 || canvas2d.height === 0) return;
    const format = document.getElementById('paper-format-select').value;
    const paper = paperFormats[format] || paperFormats['A4_P'];
    const scaleX = (canvas2d.width * 0.85) / paper.w;
    const scaleY = (canvas2d.height * 0.85) / paper.h;
    cam2D.zoom = Math.min(scaleX, scaleY);
    cam2D.x = canvas2d.width / 2;
    cam2D.y = canvas2d.height / 2;
}

// ---- COMMANDES DE DÉPLACEMENT ----
canvas2d.addEventListener('mousedown', (e) => {
    isDragging2D = true;
    lastMouse2D = { x: e.clientX, y: e.clientY };
    canvas2d.style.cursor = 'grabbing';
});
canvas2d.addEventListener('mousemove', (e) => {
    if (!isDragging2D) return;
    cam2D.x += e.clientX - lastMouse2D.x;
    cam2D.y += e.clientY - lastMouse2D.y;
    lastMouse2D = { x: e.clientX, y: e.clientY };
    draw2D();
});
window.addEventListener('mouseup', () => {
    isDragging2D = false;
    canvas2d.style.cursor = 'grab';
});
canvas2d.addEventListener('wheel', (e) => {
    e.preventDefault();
    const newZoom = cam2D.zoom * (1 - e.deltaY * 0.001);
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

// ====================================================
// OUTILS DE DESSIN TECHNIQUE (CAO)
// ====================================================
const fText = (v) => Number.isInteger(v) ? v : v.toFixed(1);

function drawCotation(ctx, x1, y1, x2, y2, dimPos, text, isVertical, drawingScale) {
    ctx.save();
    // Noir et trait très fin (type trait d'axe/attache)
    ctx.strokeStyle = '#000000'; 
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 0.15 / drawingScale; 
    
    let dimX1, dimY1, dimX2, dimY2;
    let sign;

    ctx.beginPath();
    if (isVertical) {
        sign = dimPos > Math.max(x1, x2) ? 1 : -1;
        dimX1 = dimPos; dimY1 = y1;
        dimX2 = dimPos; dimY2 = y2;
        
        // Lignes d'attache : partent exactement du point mesuré sur la bouteille
        // Le petit "sign*1" laisse 1mm de blanc réglementaire entre la pièce et le trait de cote
        ctx.moveTo(x1 + sign*1/drawingScale, y1); 
        ctx.lineTo(dimPos + sign*2/drawingScale, y1);
        
        ctx.moveTo(x2 + sign*1/drawingScale, y2); 
        ctx.lineTo(dimPos + sign*2/drawingScale, y2);
    } else {
        sign = dimPos > Math.max(y1, y2) ? 1 : -1;
        dimX1 = x1; dimY1 = dimPos;
        dimX2 = x2; dimY2 = dimPos;
        
        // Lignes d'attache horizontales si décalage
        if (Math.abs(dimPos - y1) > 0.1) {
            ctx.moveTo(x1, y1 + sign*1/drawingScale); 
            ctx.lineTo(x1, dimPos + sign*2/drawingScale);
            ctx.moveTo(x2, y2 + sign*1/drawingScale); 
            ctx.lineTo(x2, dimPos + sign*2/drawingScale);
        }
    }
    
    // Ligne de cote (entre les flèches)
    ctx.moveTo(dimX1, dimY1);
    ctx.lineTo(dimX2, dimY2);
    ctx.stroke();

    // Flèches fines (type architecture/meca)
    const aSize = 2.0 / drawingScale;
    const drawArrow = (ax, ay, angle) => {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - aSize * Math.cos(angle - Math.PI/10), ay - aSize * Math.sin(angle - Math.PI/10));
        ctx.lineTo(ax - aSize * Math.cos(angle + Math.PI/10), ay - aSize * Math.sin(angle + Math.PI/10));
        ctx.fill();
    };

    let angle = Math.atan2(dimY2 - dimY1, dimX2 - dimX1);
    drawArrow(dimX2, dimY2, angle);
    drawArrow(dimX1, dimY1, angle + Math.PI);

    // Texte avec fond blanc pour couper la ligne
    ctx.save();
    ctx.translate((dimX1 + dimX2) / 2, (dimY1 + dimY2) / 2);
    ctx.scale(1, -1); // Remettre à l'endroit
    
    ctx.font = (3 / drawingScale) + 'px Arial'; // Sans gras pour plus de finesse
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (isVertical) ctx.rotate(-Math.PI / 2);
    
    let textWidth = ctx.measureText(text).width;
    let textHeight = 4 / drawingScale;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-textWidth/2 - 0.5/drawingScale, -textHeight/2, textWidth + 1/drawingScale, textHeight);
    
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 0, 0);
    ctx.restore();
    ctx.restore();
}

function drawLeaderLine(ctx, x, y, text, drawingScale) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 0.15 / drawingScale;
    
    // Point d'accroche très fin
    ctx.beginPath();
    ctx.arc(x, y, 0.4/drawingScale, 0, Math.PI*2);
    ctx.fill();
    
    // Ligne oblique et horizontale
    let endX = x - 15/drawingScale;
    let endY = y + 15/drawingScale;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX - 5/drawingScale, endY);
    ctx.stroke();
    
    // Texte fin
    ctx.save();
    ctx.translate(endX - 6/drawingScale, endY);
    ctx.scale(1, -1); 
    ctx.font = (3 / drawingScale) + 'px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText("R" + text, 0, -0.5/drawingScale);
    ctx.restore();
    
    ctx.restore();
}

// ====================================================
// DESSIN DU PLAN
// ====================================================
function draw2D() {
    if (!ctx2d || canvas2d.width === 0) return;

    ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
    ctx2d.fillStyle = '#eef2f5';
    ctx2d.fillRect(0, 0, canvas2d.width, canvas2d.height);

    ctx2d.save();
    ctx2d.translate(cam2D.x, cam2D.y);
    ctx2d.scale(cam2D.zoom, cam2D.zoom);

    // ---- FEUILLE BLANCHE ----
    const format = document.getElementById('paper-format-select').value;
    const paper = paperFormats[format] || paperFormats['A4_P'];
    const paperW = paper.w;
    const paperH = paper.h;
    const startX = -paperW / 2;
    const startY = -paperH / 2;

    ctx2d.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx2d.shadowBlur = 10;
    ctx2d.shadowOffsetX = 5;
    ctx2d.shadowOffsetY = 5;
    ctx2d.fillStyle = '#ffffff';
    ctx2d.fillRect(startX, startY, paperW, paperH);
    ctx2d.shadowColor = 'transparent';

    // ---- CARTOUCHE ----
    const cartoucheW = 120;
    const cartoucheH = 40;
    const cartX = startX + paperW - cartoucheW - 5;
    const cartY = startY + paperH - cartoucheH - 5;

    ctx2d.strokeStyle = '#000000';
    ctx2d.lineWidth = 0.5;
    ctx2d.strokeRect(cartX, cartY, cartoucheW, cartoucheH);
    
    ctx2d.beginPath();
    ctx2d.moveTo(cartX, cartY + 10); ctx2d.lineTo(cartX + cartoucheW, cartY + 10);
    ctx2d.moveTo(cartX, cartY + 20); ctx2d.lineTo(cartX + cartoucheW, cartY + 20);
    ctx2d.moveTo(cartX, cartY + 30); ctx2d.lineTo(cartX + cartoucheW, cartY + 30);
    ctx2d.stroke();

    ctx2d.fillStyle = '#000000';
    ctx2d.font = '4px Arial';
    ctx2d.fillText("Projet: " + document.getElementById('cartouche-title').value, cartX + 2, cartY + 7);
    ctx2d.fillText("Dessinateur: " + document.getElementById('cartouche-drafter').value, cartX + 2, cartY + 17);
    ctx2d.fillText("Vérificateur: " + document.getElementById('cartouche-checker').value, cartX + 2, cartY + 27);
    ctx2d.fillText("Contenance: " + document.getElementById('cartouche-capacity').value, cartX + 2, cartY + 37);
    
    const scaleSelect = document.getElementById('drawing-scale-select');
    const scaleText = scaleSelect.options[scaleSelect.selectedIndex].text;
    ctx2d.fillText("Echelle: " + scaleText, cartX + 70, cartY + 37);

    // ---- DESSIN BOUTEILLE ET COTATIONS ----
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

        const H_base = parseFloat(document.getElementById('height-slider').value) || 320;
        const H_corps_fin = parseFloat(document.getElementById('body-height-slider').value) || 200;
        const H_col_vertical_start = parseFloat(document.getElementById('neck-height-slider').value) || 270;
        const H_finish = parseFloat(document.getElementById('finish-height-input').value) || 15;
        const Y_bague_start = H_base - 15; 
        const H_tot_reel = Y_bague_start + H_finish;

        const D_bas = parseFloat(document.getElementById('diameter-slider').value) || 75;
        const D_epaule = parseFloat(document.getElementById('shoulder-slider').value) || 75;
        const D_bas_col = parseFloat(document.getElementById('neck-bottom-diameter-slider').value) || 30;
        const D_haut_col = parseFloat(document.getElementById('neck-top-diameter-slider').value) || 29;
        const D_finish = parseFloat(document.getElementById('finish-diameter-input').value) || 30;

        const R_pied = parseFloat(document.getElementById('base-radius-slider').value) || 5;
        const r1 = parseFloat(document.getElementById('shoulder-curve-slider').value) || 40; 
        const r2 = parseFloat(document.getElementById('neck-curve-slider').value) || 20;

        const max_R = Math.max(D_bas, D_epaule) / 2;
        const bottleHeight = points[points.length - 1].y;
        
        ctx2d.save();
        ctx2d.translate(0, (bottleHeight * drawingScale) / 2); 
        ctx2d.scale(drawingScale, -drawingScale); // L'axe Y monte (Maths)

        // 1. Axe de symétrie
        ctx2d.beginPath();
        ctx2d.setLineDash([10, 2, 2, 2]);
        ctx2d.moveTo(0, -10);
        ctx2d.lineTo(0, bottleHeight + 20);
        ctx2d.strokeStyle = '#888888';
        ctx2d.lineWidth = 0.3 / drawingScale; 
        ctx2d.stroke();
        ctx2d.setLineDash([]);

        // 2. Tracé du contour principal (Bouteille) = Trait fort
        ctx2d.strokeStyle = '#000000';
        ctx2d.lineWidth = 0.6 / drawingScale; 
        ctx2d.lineJoin = 'round';

        ctx2d.beginPath();
        ctx2d.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx2d.lineTo(points[i].x, points[i].y);
        ctx2d.lineTo(0, points[points.length-1].y);
        ctx2d.stroke();

        ctx2d.beginPath();
        ctx2d.moveTo(-points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx2d.lineTo(-points[i].x, points[i].y);
        ctx2d.lineTo(0, points[points.length-1].y);
        ctx2d.moveTo(points[0].x, points[0].y);
        ctx2d.lineTo(-points[0].x, points[0].y);
        ctx2d.stroke();

        // ====================================================
        // 3. COTATIONS EXACTES
        // ====================================================
        
        // HAUTEURS (Lignes d'attache partent exactement du rayon (x1) de la zone mesurée)
        // drawCotation(ctx, x1, y1, x2, y2, PosX_de_la_ligne, texte, isVertical, scale)
        drawCotation(ctx2d, D_bas/2, 0, D_epaule/2, H_corps_fin, max_R + 15, fText(H_corps_fin), true, drawingScale);
        drawCotation(ctx2d, D_bas/2, 0, D_bas_col/2, H_col_vertical_start, max_R + 30, fText(H_col_vertical_start), true, drawingScale);
        drawCotation(ctx2d, D_bas/2, 0, D_finish/2, H_tot_reel, max_R + 45, fText(H_tot_reel), true, drawingScale);
        drawCotation(ctx2d, D_haut_col/2, Y_bague_start, D_finish/2, H_tot_reel, max_R + 15, fText(H_finish), true, drawingScale);

        // DIAMÈTRES 
        drawCotation(ctx2d, -D_bas/2, 0, D_bas/2, 0, -15, "Ø " + fText(D_bas), false, drawingScale);
        drawCotation(ctx2d, -D_epaule/2, H_corps_fin, D_epaule/2, H_corps_fin, H_corps_fin, "Ø " + fText(D_epaule), false, drawingScale);
        drawCotation(ctx2d, -D_bas_col/2, H_col_vertical_start, D_bas_col/2, H_col_vertical_start, H_col_vertical_start, "Ø " + fText(D_bas_col), false, drawingScale);
        drawCotation(ctx2d, -D_haut_col/2, Y_bague_start, D_haut_col/2, Y_bague_start, Y_bague_start, "Ø " + fText(D_haut_col), false, drawingScale);
        drawCotation(ctx2d, -D_finish/2, H_tot_reel, D_finish/2, H_tot_reel, H_tot_reel + 15, "Ø " + fText(D_finish), false, drawingScale);

        // RAYONS (Lignes de repères)
        drawLeaderLine(ctx2d, -D_bas/2, R_pied, fText(R_pied), drawingScale);
        drawLeaderLine(ctx2d, -D_epaule/2, H_corps_fin, fText(r1), drawingScale);
        drawLeaderLine(ctx2d, -D_bas_col/2, H_col_vertical_start, fText(r2), drawingScale);

        ctx2d.restore(); 
    }
    ctx2d.restore(); 
}

window.addEventListener('load', () => {
    setTimeout(resizeCanvas2D, 100);
});
