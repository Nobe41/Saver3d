const pageLogin = document.getElementById('Page-login');
const pageMenu = document.getElementById('Page-menu');
const pageBouteille = document.getElementById('Page-Bouteille');
const passwordInput = document.getElementById('password-input');
const btnNewProject = document.getElementById('btn-new-project');
const btnBackMenu = document.getElementById('btn-back-menu');

viewport3D = document.getElementById('viewport-3d');

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
    pageMenu.classList.add('hidden');
    pageBouteille.classList.remove('hidden');
    // On pourrait réinitialiser les valeurs par défaut ici si besoin
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
// SYSTEME DE SAUVEGARDE ET CHARGEMENT
// ==========================================

// 1. Ouvrir un projet existant
const btnOpenProject = document.getElementById('btn-open-project');
const fileLoader = document.getElementById('file-loader');

btnOpenProject.addEventListener('click', () => {
    fileLoader.click(); 
});

fileLoader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const savedData = JSON.parse(e.target.result);
            
            // On applique toutes les données sauvegardées aux inputs
            for (const id in savedData) {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = savedData[id];
                    } else {
                        element.value = savedData[id];
                    }
                    // Déclenche l'événement 'input' pour synchroniser les sliders/nombres
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }

            // Basculer sur la page de travail
            pageMenu.classList.add('hidden');
            pageBouteille.classList.remove('hidden');
            
            // Mettre à jour la 3D et la 2D
            setTimeout(() => {
                if (typeof updateBouteille === 'function') updateBouteille();
                if (typeof draw2D === 'function' && !document.getElementById('viewport-2d').classList.contains('hidden')) draw2D();
            }, 50);

        } catch (err) {
            alert("Erreur : Le fichier sélectionné n'est pas un fichier de sauvegarde valide.");
            console.error(err);
        }
        // Reset le loader pour pouvoir re-sélectionner le même fichier si besoin
        fileLoader.value = "";
    };
    reader.readAsText(file);
});

// 2. Enregistrer le projet
const btnSaveMenu = document.getElementById('btn-save-menu');
const saveDropdown = document.getElementById('save-dropdown');
const btnSave = document.getElementById('btn-save');
const btnSaveAs = document.getElementById('btn-save-as');

// Afficher/Cacher le menu déroulant
btnSaveMenu.addEventListener('click', (e) => {
    e.stopPropagation(); // Évite que le clic ferme immédiatement le menu
    saveDropdown.classList.toggle('hidden');
});

// Fermer le menu si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!saveDropdown.contains(e.target) && e.target !== btnSaveMenu) {
        saveDropdown.classList.add('hidden');
    }
});

// Fonction principale pour générer le fichier JSON
function downloadProjectFile(promptForName = false) {
    saveDropdown.classList.add('hidden');

    // Récupérer toutes les données du panneau de gauche
    const inputs = document.querySelectorAll('#Panel-gauche input, #Panel-gauche select');
    const projectData = {};
    
    inputs.forEach(input => {
        if (input.id) { // On ne sauvegarde que les éléments qui ont un ID propre
            projectData[input.id] = input.type === 'checkbox' ? input.checked : input.value;
        }
    });

    // Définir le nom du fichier (basé sur le cartouche)
    const titleInput = document.getElementById('cartouche-title');
    let fileName = titleInput && titleInput.value.trim() !== "" ? titleInput.value.trim() : "Bouteille_SansNom";

    if (promptForName) {
        const userFileName = prompt("Entrez le nom de la sauvegarde :", fileName);
        if (!userFileName) return; // L'utilisateur a cliqué sur Annuler
        fileName = userFileName;
    }

    // Création du fichier JSON
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Téléchargement invisible
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + ".json";
    document.body.appendChild(a);
    a.click();
    
    // Nettoyage
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

btnSave.addEventListener('click', () => downloadProjectFile(false));
btnSaveAs.addEventListener('click', () => downloadProjectFile(true));


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
