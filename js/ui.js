const pageLogin = document.getElementById('Page-login');
const pageMenu = document.getElementById('Page-menu');
const pageBouteille = document.getElementById('Page-Bouteille');
const passwordInput = document.getElementById('password-input');
const btnNewProject = document.getElementById('btn-new-project');
const btnBackMenu = document.getElementById('btn-back-menu');

viewport3D = document.getElementById('viewport-3d');

let currentFileHandle = null;
let isLogicielInit = false; 

passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (passwordInput.value.trim().toLowerCase() === 'axel') {
            pageLogin.classList.add('hidden');
            pageMenu.classList.remove('hidden');
        } else {
            passwordInput.style.borderColor = "#ff3333";
            setTimeout(() => { passwordInput.style.borderColor = "#333"; }, 500);
        }
    }
});

btnNewProject.addEventListener('click', () => {
    currentFileHandle = null; 
    pageMenu.classList.add('hidden');
    pageBouteille.classList.remove('hidden');
    setTimeout(() => { 
        if (typeof initLogiciel === 'function' && !isLogicielInit) {
            initLogiciel(); 
            isLogicielInit = true;
        }
        if (typeof updateBouteille === 'function') updateBouteille();
    }, 50);
});

btnBackMenu.addEventListener('click', () => {
    pageBouteille.classList.add('hidden');
    pageMenu.classList.remove('hidden');
});

// ==========================================
// SYSTEME DE SAUVEGARDE ET CHARGEMENT
// ==========================================

const btnOpenProject = document.getElementById('btn-open-project');
const fileLoader = document.getElementById('file-loader');

function loadProjectData(jsonString) {
    try {
        const savedData = JSON.parse(jsonString);
        
        for (const id in savedData) {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = savedData[id];
                } else {
                    element.value = savedData[id];
                }
            }
        }

        pageMenu.classList.add('hidden');
        pageBouteille.classList.remove('hidden');
        
        setTimeout(() => {
            if (typeof initLogiciel === 'function' && !isLogicielInit) {
                initLogiciel(); 
                isLogicielInit = true;
            }
            if (typeof updateBouteille === 'function') updateBouteille();
            if (typeof draw2D === 'function' && !document.getElementById('viewport-2d').classList.contains('hidden')) draw2D();
        }, 50);

    } catch (err) {
        alert("Erreur : Le fichier de sauvegarde n'est pas valide.");
        console.error(err);
    }
}

btnOpenProject.addEventListener('click', async () => {
    if ('showOpenFilePicker' in window) {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Fichier Bouteille JSON',
                    accept: {'application/json': ['.json']},
                }],
            });
            currentFileHandle = fileHandle; 
            const file = await fileHandle.getFile();
            const text = await file.text();
            loadProjectData(text);
        } catch (err) {
            console.log("Ouverture annulée", err);
        }
    } else {
        fileLoader.click(); 
    }
});

fileLoader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    currentFileHandle = null; 
    const reader = new FileReader();
    reader.onload = function(e) {
        loadProjectData(e.target.result);
        fileLoader.value = "";
    };
    reader.readAsText(file);
});


// Enregistrer le projet
const btnSaveMenu = document.getElementById('btn-save-menu');
const saveDropdown = document.getElementById('save-dropdown');
const btnSave = document.getElementById('btn-save');
const btnSaveAs = document.getElementById('btn-save-as');

btnSaveMenu.addEventListener('click', (e) => {
    e.stopPropagation(); 
    saveDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!saveDropdown.contains(e.target) && e.target !== btnSaveMenu) {
        saveDropdown.classList.add('hidden');
    }
});

async function saveProject(isSaveAs = false) {
    saveDropdown.classList.add('hidden');

    const inputs = document.querySelectorAll('#Panel-gauche input, #Panel-gauche select');
    const projectData = {};
    inputs.forEach(input => {
        if (input.id) projectData[input.id] = input.type === 'checkbox' ? input.checked : input.value;
    });

    const titleInput = document.getElementById('cartouche-title');
    let fileName = titleInput && titleInput.value.trim() !== "" ? titleInput.value.trim() : "Bouteille_SansNom";
    const jsonString = JSON.stringify(projectData, null, 2);

    if ('showSaveFilePicker' in window) {
        try {
            if (isSaveAs || !currentFileHandle) {
                currentFileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName + '.json',
                    types: [{
                        description: 'Fichier Bouteille JSON',
                        accept: {'application/json': ['.json']},
                    }],
                });
            }
            
            const writable = await currentFileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            
            btnSaveMenu.innerText = "SAUVEGARDÉ ✓";
            setTimeout(() => { btnSaveMenu.innerText = "ENREGISTRER ▼"; }, 1500);

        } catch (err) {
            console.log("Sauvegarde annulée", err);
        }
    } else {
        if (isSaveAs || !currentFileHandle) {
            const userFileName = prompt("Entrez le nom de la sauvegarde :", fileName);
            if (!userFileName) return; 
            fileName = userFileName;
        }
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        currentFileHandle = true; 
    }
}

btnSave.addEventListener('click', () => saveProject(false)); 
btnSaveAs.addEventListener('click', () => saveProject(true)); 


// ==========================================
// NAVIGATION ONGLETS ET EXPORTS
// ==========================================

const btn3D = document.getElementById('btn-view-3d');
const btn2D = document.getElementById('btn-view-2d');
const btnOutillage = document.getElementById('btn-outillage');
const view3D = document.getElementById('viewport-3d');
const view2D = document.getElementById('viewport-2d');
const viewOutillage = document.getElementById('viewport-outillage');

// Boutons d'exportation
const btnExport3D = document.getElementById('btn-export-3d');
const btnExport2D = document.getElementById('btn-export-2d');

function switchView(activeBtn, activeView) {
    btn3D.classList.remove('active');
    btn2D.classList.remove('active');
    btnOutillage.classList.remove('active');
    view3D.classList.add('hidden');
    view2D.classList.add('hidden');
    viewOutillage.classList.add('hidden');
    
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');

    // Visibilité des boutons d'export
    if (activeBtn === btn3D) {
        btnExport3D.classList.remove('hidden');
        btnExport2D.classList.add('hidden');
    } else if (activeBtn === btn2D) {
        btnExport3D.classList.add('hidden');
        btnExport2D.classList.remove('hidden');
        if (typeof resizeCanvas2D === 'function') resizeCanvas2D();
        if (typeof draw2D === 'function') draw2D();
    } else {
        btnExport3D.classList.add('hidden');
        btnExport2D.classList.add('hidden');
    }
}

btn3D.addEventListener('click', () => switchView(btn3D, view3D));
btn2D.addEventListener('click', () => switchView(btn2D, view2D));
btnOutillage.addEventListener('click', () => switchView(btnOutillage, viewOutillage));

// --- LOGIQUE EXPORT STL ---
btnExport3D.addEventListener('click', () => {
    if (typeof THREE === 'undefined' || typeof THREE.STLExporter === 'undefined') {
        alert("La librairie d'exportation STL n'est pas chargée.");
        return;
    }
    if (typeof scene === 'undefined') {
        alert("La scène 3D n'a pas pu être trouvée.");
        return;
    }
    
    const exporter = new THREE.STLExporter();
    const stlString = exporter.parse(scene);
    const blob = new Blob([stlString], { type: 'text/plain' });
    
    const titleInput = document.getElementById('cartouche-title');
    let fileName = titleInput && titleInput.value.trim() !== "" ? titleInput.value.trim() : "Bouteille";
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName + '.stl';
    link.click();
    URL.revokeObjectURL(link.href);
});

// --- LOGIQUE EXPORT PDF ---
btnExport2D.addEventListener('click', () => {
    if (!window.jspdf) {
        alert("La librairie jsPDF n'est pas chargée.");
        return;
    }
    
    const canvas = document.getElementById('canvas-2d');
    const formatSelect = document.getElementById('paper-format-select');
    const formatVal = formatSelect ? formatSelect.value : 'A4_P';
    
    let orientation = 'p'; 
    let formatArgs = 'a4';
    let w = 210, h = 297;
    
    if (formatVal === 'A4_L') { orientation = 'l'; w = 297; h = 210; }
    if (formatVal === 'A3_P') { formatArgs = 'a3'; w = 297; h = 420; }
    if (formatVal === 'A3_L') { orientation = 'l'; formatArgs = 'a3'; w = 420; h = 297; }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: orientation, unit: 'mm', format: formatArgs });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
    
    const titleInput = document.getElementById('cartouche-title');
    let fileName = titleInput && titleInput.value.trim() !== "" ? titleInput.value.trim() : "Plan_Bouteille";
    
    pdf.save(fileName + '.pdf');
});


// ==========================================
// GESTION DES INPUTS ET ACCORDEONS
// ==========================================

let updateTimer;

function setupListeners() {
    const inputs = document.querySelectorAll('input[type=range], input[type=number], select, input[type=checkbox]');
    inputs.forEach(input => {
        if (input.classList.contains('gravure-y') || input.classList.contains('gravure-angle') || input.classList.contains('gravure-largeur') || input.classList.contains('gravure-profondeur')) return;

        input.addEventListener('input', () => {
            const controlGroup = input.closest('.control-group');
            if (controlGroup) {
                if (input.type === 'range') {
                    const num = controlGroup.querySelector('input[type=number]');
                    if (num && num !== input) num.value = input.value;
                } else if (input.type === 'number') {
                    const rng = controlGroup.querySelector('input[type=range]');
                    if (rng && rng !== input) rng.value = input.value;
                }
            }
            
            clearTimeout(updateTimer);
            updateTimer = setTimeout(() => {
                if (typeof updateBouteille === 'function') updateBouteille();
                if (typeof draw2D === 'function' && !document.getElementById('viewport-2d').classList.contains('hidden')) draw2D();
            }, 20); 
        });
    });
    
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
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
    }
}
