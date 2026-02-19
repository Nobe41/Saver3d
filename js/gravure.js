// ==========================================
// SYSTÈME DE GESTION DES GRAVURES (PIXELS PNG)
// ==========================================

const btnAddEngraving = document.getElementById('btn-add-engraving');
const engravingsContainer = document.getElementById('engravings-container');

btnAddEngraving.addEventListener('click', () => {
    const id = Date.now(); 
    const card = document.createElement('div');
    card.className = 'sub-block gravure-item';
    card.style.padding = '10px';
    card.id = `gravure-${id}`;
    card.dataset.id = id;
    
    card.innerHTML = `
        <div class="label-row" style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
            <label style="font-weight:bold; color:#0078d4;">Gravure</label>
            <button onclick="removeEngraving(${id})" style="color:#ff3333; background:none; border:none; cursor:pointer; font-weight:bold;">X SUPPRIMER</button>
        </div>
        <div class="control-group">
            <label class="label-simple">Fichier Image (PNG avec transparence)</label>
            <input type="file" class="gravure-file" accept="image/png" data-id="${id}" style="font-size: 0.8rem; margin-top:5px;">
        </div>
        <div class="control-group">
            <div class="label-row"><label>Hauteur (Y)</label><span class="unit">mm</span></div>
            <input type="range" class="gravure-y" min="10" max="350" step="1" value="150">
        </div>
        <div class="control-group">
            <div class="label-row"><label>Angle (Rotation)</label><span class="unit">°</span></div>
            <input type="range" class="gravure-angle" min="0" max="360" step="1" value="0">
        </div>
        <div class="control-group">
            <div class="label-row"><label>Largeur de la gravure</label><span class="unit">mm</span></div>
            <input type="range" class="gravure-largeur" min="10" max="150" step="1" value="50">
        </div>
        <div class="control-group">
            <div class="label-row"><label>Profondeur du Relief</label><span class="unit">mm</span></div>
            <input type="range" class="gravure-profondeur" min="0.5" max="5" step="0.1" value="1.5">
        </div>
    `;
    
    engravingsContainer.appendChild(card);
    
    const parentPanel = card.parentElement.closest('.panel-controls');
    if (parentPanel) parentPanel.style.maxHeight = "2000px";

    // Gestion du chargement de l'image
    const fileInput = card.querySelector('.gravure-file');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                window.engravingImages[id] = img; // On stocke l'image chargée dans la mémoire globale
                if (typeof updateBouteille === 'function') updateBouteille();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const inputs = card.querySelectorAll('input[type=range]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (typeof updateBouteille === 'function') updateBouteille();
        });
    });
});

window.removeEngraving = function(id) {
    const card = document.getElementById(`gravure-${id}`);
    if (card) card.remove();
    delete window.engravingImages[id]; // On nettoie la mémoire
    if (typeof updateBouteille === 'function') updateBouteille();
};

// Fonction pour récupérer les données de l'interface
window.getEngravingsData = function() {
    const items = document.querySelectorAll('.gravure-item');
    const data = [];
    items.forEach(item => {
        const id = item.dataset.id;
        data.push({
            id: id,
            y: parseFloat(item.querySelector('.gravure-y').value),
            angle: parseFloat(item.querySelector('.gravure-angle').value) * Math.PI / 180, 
            width: parseFloat(item.querySelector('.gravure-largeur').value),
            depth: parseFloat(item.querySelector('.gravure-profondeur').value)
        });
    });
    return data;
};
