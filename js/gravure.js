// ==========================================
// SYSTÈME DE GESTION DES GRAVURES (PIXELS PNG)
// ==========================================

const btnAddEngraving = document.getElementById('btn-add-engraving');
const engravingsContainer = document.getElementById('engravings-container');

// NOUVEAU : Fonction qui renomme proprement "Gravure 1", "Gravure 2", etc.
function updateEngravingTitles() {
    const items = document.querySelectorAll('.gravure-item');
    items.forEach((item, index) => {
        const btn = item.querySelector('.accordion');
        if (btn) {
            btn.textContent = `GRAVURE ${index + 1}`;
        }
    });
}

btnAddEngraving.addEventListener('click', () => {
    const id = Date.now(); 
    
    const card = document.createElement('div');
    card.className = 'sub-block gravure-item';
    card.id = `gravure-${id}`;
    card.dataset.id = id;
    
    card.innerHTML = `
        <button class="accordion sub-accordion active" style="text-transform: uppercase;">GRAVURE</button>
        <div class="panel-controls sub-panel" style="max-height: 2000px;">

            <div class="control-group" style="margin-top: 10px;">
                <label class="label-simple">Fichier Image (PNG)</label>
                <div style="margin-top: 5px; display: flex; align-items: center;">
                    <label for="gravure-file-${id}" style="background: #f5f5f5; border: 1px solid #ccc; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; color: #555; transition: 0.3s;">
                        📁 Parcourir...
                    </label>
                    <input type="file" id="gravure-file-${id}" class="gravure-file" accept="image/png" data-id="${id}" style="display: none;">
                    <span id="gravure-filename-${id}" style="font-size: 0.75rem; color: #0078d4; margin-left: 10px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;"></span>
                </div>
            </div>

            <div class="control-group" style="padding-top: 5px; padding-bottom: 5px;">
                <label style="display:flex; align-items:center; cursor:pointer; font-size: 0.8rem; color: #555; font-weight: bold;">
                    <input type="checkbox" class="gravure-flip" id="gravure-flip-${id}" style="margin-right: 8px; transform: scale(1.2); cursor:pointer;">
                    Effet Miroir (Inverser le sens)
                </label>
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

            <div style="text-align: center; padding: 10px 15px 15px 15px; border-top: 1px solid #eee; margin-top: 10px;">
                <button onclick="removeEngraving(${id})" style="color:#ff3333; background:none; border:1px solid #ff3333; border-radius: 4px; padding: 5px 10px; cursor:pointer; font-weight:bold; font-size: 0.75rem; transition: 0.3s;" onmouseover="this.style.background='#fff0f0'" onmouseout="this.style.background='none'">
                    X SUPPRIMER LA GRAVURE
                </button>
            </div>

        </div>
    `;
    
    engravingsContainer.appendChild(card);
    
    // On met à jour les numéros (Gravure 1, Gravure 2...)
    updateEngravingTitles();
    
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

    const parentPanel = card.parentElement.closest('.panel-controls');
    if (parentPanel) parentPanel.style.maxHeight = "2000px";

    const fileInput = card.querySelector('.gravure-file');
    const fileNameDisplay = card.querySelector(`#gravure-filename-${id}`);
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            fileNameDisplay.textContent = ""; 
            return;
        }
        
        fileNameDisplay.textContent = file.name;
        
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

    const flipCheckbox = document.getElementById(`gravure-flip-${id}`);
    flipCheckbox.addEventListener('change', () => {
        if (typeof updateBouteille === 'function') updateBouteille();
    });
});

window.removeEngraving = function(id) {
    const card = document.getElementById(`gravure-${id}`);
    if (card) {
        card.remove();
        updateEngravingTitles(); // On recompte après suppression !
    }
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
            depth: parseFloat(item.querySelector('.gravure-profondeur').value),
            flip: item.querySelector('.gravure-flip').checked
        });
    });
    return data;
};
