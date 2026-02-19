// ==========================================
// SYSTÈME DE GESTION DES GRAVURES (PIXELS PNG)
// ==========================================

const btnAddEngraving = document.getElementById('btn-add-engraving');
const engravingsContainer = document.getElementById('engravings-container');
let gravureCounter = 0; // Compteur pour nommer "Gravure 1", "Gravure 2"...

btnAddEngraving.addEventListener('click', () => {
    const id = Date.now(); 
    gravureCounter++; // On incrémente le numéro
    
    const card = document.createElement('div');
    card.className = 'sub-block gravure-item';
    card.id = `gravure-${id}`;
    card.dataset.id = id;
    
    // Exactement la même structure HTML que les autres menus (Accordéon, label-row, input-wrapper)
    card.innerHTML = `
        <button class="accordion sub-accordion active" style="text-transform: uppercase;">Gravure ${gravureCounter}</button>
        <div class="panel-controls sub-panel" style="max-height: 2000px;">
            <div style="text-align: right; padding: 5px 15px;">
                <button onclick="removeEngraving(${id})" style="color:#ff3333; background:none; border:none; cursor:pointer; font-weight:bold; font-size: 0.75rem;">X SUPPRIMER</button>
            </div>

            <div class="control-group">
                <label class="label-simple">Fichier Image (PNG)</label>
                <input type="file" class="gravure-file input-text" accept="image/png" data-id="${id}" style="font-size: 0.8rem; margin-top:5px; padding: 5px;">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Hauteur (Y)</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-y-num-${id}" value="150" min="10" max="350">
                        <span class="unit">mm</span>
                    </div>
                </div>
                <input type="range" class="gravure-y" id="gravure-y-slider-${id}" min="10" max="350" step="1" value="150">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Angle (Rotation)</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-angle-num-${id}" value="0" min="0" max="360">
                        <span class="unit">°</span>
                    </div>
                </div>
                <input type="range" class="gravure-angle" id="gravure-angle-slider-${id}" min="0" max="360" step="1" value="0">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Largeur de la gravure</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-largeur-num-${id}" value="50" min="10" max="150">
                        <span class="unit">mm</span>
                    </div>
                </div>
                <input type="range" class="gravure-largeur" id="gravure-largeur-slider-${id}" min="10" max="150" step="1" value="50">
            </div>

            <div class="control-group">
                <div class="label-row">
                    <label>Profondeur du Relief</label>
                    <div class="input-wrapper">
                        <input type="number" id="gravure-profondeur-num-${id}" value="1.5" min="0.1" max="5" step="0.1">
                        <span class="unit">mm</span>
                    </div>
                </div>
                <input type="range" class="gravure-profondeur" id="gravure-profondeur-slider-${id}" min="0.1" max="5" step="0.1" value="1.5">
            </div>
        </div>
    `;
    
    engravingsContainer.appendChild(card);
    
    // Logique de l'accordéon pour ce nouveau bloc
    const accBtn = card.querySelector('.accordion');
    accBtn.onclick = function() {
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight && panel.style.maxHeight !== "0px") {
            panel.style.maxHeight = "0px";
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
            const parentPanel = this.parentElement.closest('.panel-controls');
            if (parentPanel) parentPanel.style.maxHeight = "2000px";
        }
    };

    // Ajuste la taille du parent global
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
                window.engravingImages[id] = img; 
                if (typeof updateBouteille === 'function') updateBouteille();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Synchronisation bidirectionnelle entre le champ texte et le slider
    const syncInputs = (numId, sliderId) => {
        const num = document.getElementById(numId);
        const slider = document.getElementById(sliderId);
        
        num.addEventListener('input', () => { 
            slider.value = num.value; 
            if (typeof updateBouteille === 'function') updateBouteille(); 
        });
        
        slider.addEventListener('input', () => { 
            num.value = slider.value; 
            if (typeof updateBouteille === 'function') updateBouteille(); 
        });
    };

    syncInputs(`gravure-y-num-${id}`, `gravure-y-slider-${id}`);
    syncInputs(`gravure-angle-num-${id}`, `gravure-angle-slider-${id}`);
    syncInputs(`gravure-largeur-num-${id}`, `gravure-largeur-slider-${id}`);
    syncInputs(`gravure-profondeur-num-${id}`, `gravure-profondeur-slider-${id}`);
});

window.removeEngraving = function(id) {
    const card = document.getElementById(`gravure-${id}`);
    if (card) card.remove();
    delete window.engravingImages[id]; 
    if (typeof updateBouteille === 'function') updateBouteille();
};

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
