const pageLogin = document.getElementById('Page-login');
const pageMenu = document.getElementById('Page-menu');
const pageBouteille = document.getElementById('Page-Bouteille');
const passwordInput = document.getElementById('password-input');
const btnNewProject = document.getElementById('btn-new-project');
const btnBackMenu = document.getElementById('btn-back-menu');

viewport3D = document.getElementById('viewport-3d');

// Variable globale pour mémoriser le fichier ouvert ou sauvegardé
let currentFileHandle = null;

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
    currentFileHandle = null; // Nouveau projet = aucun fichier lié
    pageMenu.classList.add('hidden');
    pageBouteille.classList.remove('hidden');
    setTimeout(() => { 
        if(typeof initLogiciel === 'function') initLogiciel(); 
        if(typeof updateBouteille === 'function') updateBouteille();
    }, 50);
});

btnBackMenu.addEventListener('click', () => {
    pageBouteille.classList.add('hidden');
    pageMenu.classList.remove('hidden');
});

// ==========================================
// SYSTEME DE SAUVEGARDE ET CHARGEMENT AVANCÉ
// ==========================================

const btnOpenProject = document.getElementById('btn-open-project');
const fileLoader = document.getElementById('file-loader');

// Fonction commune pour appliquer les données JSON
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
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        pageMenu.classList.add('hidden');
        pageBouteille.classList.remove('hidden');
        
        setTimeout(() => {
            if (typeof updateBouteille === 'function') updateBouteille();
            if (typeof draw2D === 'function' && !document.getElementById('viewport-2d').classList.contains('hidden')) draw2D();
        }, 50);

    } catch (err) {
        alert("Erreur : Le fichier sélectionné n'est pas un fichier de sauvegarde valide.");
        console.error(err);
    }
}

// Ouvrir un projet (avec la nouvelle API si possible)
btnOpenProject.addEventListener('click', async () => {
    // Si le navigateur supporte l'ouverture de fichier native (Chrome, Edge...)
    if ('showOpenFilePicker' in window) {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Fichier Bouteille JSON',
                    accept: {'application/json': ['.json']},
                }],
            });
            currentFileHandle = fileHandle; // On mémorise le fichier
            const file = await fileHandle.getFile();
            const text = await file.text();
            loadProjectData(text);
        } catch (err) {
            console.log("Ouverture annulée ou erreur", err);
        }
    } else {
        // Méthode de secours pour les vieux navigateurs
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

// Fonction principale pour Sauvegarder
async function saveProject(isSaveAs = false) {
    saveDropdown.classList.add('hidden');

    // Récupérer les données
    const inputs = document.querySelectorAll('#Panel-gauche input, #Panel-gauche select');
    const projectData = {};
    inputs.forEach(input => {
        if (input.id) projectData[input.id] = input.type === 'checkbox' ? input.checked : input.value;
    });

    const titleInput = document.getElementById('cartouche-title');
    let fileName = titleInput && titleInput.value.trim() !== "" ? titleInput.value.trim() : "Bouteille_SansNom";
    const jsonString = JSON.stringify(projectData, null, 2);

    // Utilisation de la nouvelle API (Écrase le fichier existant)
    if ('showSaveFilePicker' in window) {
        try {
            // Si c'est "Enregistrer Sous" OU qu'aucun fichier n'est encore lié
            if (isSaveAs || !currentFileHandle) {
                currentFileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName + '.json',
                    types: [{
                        description: 'Fichier Bouteille JSON',
                        accept: {'application/json': ['.json']},
                    }],
                });
            }
            
            // Écriture silencieuse dans le fichier existant
            const writable = await currentFileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            
            // Petit bonus visuel pour confirmer la sauvegarde
            btnSaveMenu.innerText = "SAUVEGARDÉ ✓";
            setTimeout(() => { btnSaveMenu.innerText = "ENREGISTRER ▼"; }, 1500);

        } catch (err) {
            console.log("Sauvegarde annulée ou erreur", err);
        }
    } else {
        // Plan B : Ancienne méthode si l'API n'est pas supportée
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
        currentFileHandle = true; // Simule qu'un fichier existe pour la session
    }
}

btnSave.addEventListener('click', () => saveProject(false)); // Enregistrer (écrase)
btnSaveAs.addEventListener('click', () => saveProject(true)); // Enregistrer Sous (ouvre la fenêtre)


// ==========================================
// NAVIGATION ONGLETS (3D / 2D / OUTILLAGE)
// ==========================================

const btn3D = document.getElementById('btn-view-3d');
const btn2D = document.getElementById('btn-view-2d');
const btnOutillage = document.getElementById('btn-outillage');
const view3D = document.getElementById('viewport-3d');
const view2D = document.getElementById('viewport-2d');
const viewOutillage = document.getElementById('viewport-outillage');

function switchView(activeBtn, activeView) {
    btn3D.classList.remove('active');
    btn2D.classList.remove('active');
    btnOutillage.classList.remove('active');
    view3D.classList.add('hidden');
    view2D.classList.add('hidden');
    viewOutillage.classList.add('hidden');
    
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');

    if (activeBtn === btn2D) {
        if (typeof resizeCanvas2D === 'function') resizeCanvas2D();
        if (typeof draw2D === 'function') draw2D();
    }
}

btn3D.addEventListener('click', () => switchView(btn3D, view3D));
btn2D.addEventListener('click', () => switchView(btn2D, view2D));
btnOutillage.addEventListener('click', () => switchView(btnOutillage, viewOutillage));

// ==========================================
// GESTION DES INPUTS ET ACCORDEONS
// ==========================================

function setupListeners() {
    const inputs = document.querySelectorAll('input[type=range], input[type=number], select, input[type=checkbox]');
    inputs.forEach(input => {
        if (input.classList.contains('gravure-y') || input.classList.contains('gravure-angle') || input.classList.contains('gravure-largeur') || input.classList.contains('gravure-profondeur')) return;

        input.addEventListener('input', () => {
            if (input.type === 'range') {
                const num = input.parentElement.querySelector('input[type=number]');
                if (num) num.value = input.value;
            } else if (input.type === 'number') {
                const rng = input.parentElement.parentElement.querySelector('input[type=range]');
                if (rng) rng.value = input.value;
            }
            
            if (typeof updateBouteille === 'function') updateBouteille();
            if (typeof draw2D === 'function' && !view2D.classList.contains('hidden')) draw2D();
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
