// Sélection des éléments UI
const pageLogin = document.getElementById('Page-login');
const pageMenu = document.getElementById('Page-menu');
const pageBouteille = document.getElementById('Page-Bouteille');
const passwordInput = document.getElementById('password-input');
const btnNewProject = document.getElementById('btn-new-project');
const btnBackMenu = document.getElementById('btn-back-menu');

// On définit viewport3D ici pour que viewer.js puisse le trouver
viewport3D = document.getElementById('viewport-3d');

// --- 1. LOGIN ---
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

// --- 2. NAVIGATION ENTRE PAGES ---
btnNewProject.addEventListener('click', () => {
    pageMenu.classList.add('hidden');
    pageBouteille.classList.remove('hidden');
    // On lance la 3D quand on arrive sur la page
    setTimeout(() => { initLogiciel(); }, 50);
});

btnBackMenu.addEventListener('click', () => {
    pageBouteille.classList.add('hidden');
    pageMenu.classList.remove('hidden');
});

// --- BRANCHEMENT DU BOUTON OUVRIR ---
const btnOpenProject = document.getElementById('btn-open-project');
const fileLoader = document.getElementById('file-loader');

btnOpenProject.addEventListener('click', () => {
    fileLoader.click(); 
});

fileLoader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    alert("Fichier sélectionné : " + file.name + "\nLe système de chargement complet arrive bientôt !");
    
    pageMenu.classList.add('hidden');
    pageBouteille.classList.remove('hidden');
    setTimeout(() => { initLogiciel(); }, 50);
});

// --- 3. ONGLETS VUES (3D, 2D, Outillage) ---
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
}

btn3D.addEventListener('click', () => switchView(btn3D, view3D));
btn2D.addEventListener('click', () => switchView(btn2D, view2D));
btnOutillage.addEventListener('click', () => switchView(btnOutillage, viewOutillage));

// --- 4. BOUTON GRAVURE ---
document.getElementById('btn-add-engraving').addEventListener('click', () => {
    alert("La fonctionnalité Gravure n'est pas encore programmée ! 🛠️");
});


// --- 5. SLIDERS ET MÉMOIRE (Blocage si géométrie impossible) ---
let lastValidState = {};

function saveValidState() {
    const inputs = document.querySelectorAll('input[type=range], input[type=number]');
    inputs.forEach(input => {
        lastValidState[input.id] = input.value;
    });
}

function setupListeners() {
    saveValidState(); // Première sauvegarde

    const inputs = document.querySelectorAll('input[type=range], input[type=number]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const isRange = input.type === 'range';
            const num = isRange ? input.parentElement.querySelector('input[type=number]') : input;
            const rng = isRange ? input : input.parentElement.parentElement.querySelector('input[type=range]');
            
            // On met à jour l'affichage
            if (num) num.value = input.value;
            if (rng) rng.value = input.value;

            // On tente de créer la 3D
            const success = updateBouteille();

            if (success) {
                // Si ça marche : On valide cette position
                saveValidState();
            } else {
                // SI ÇA CASSE : On remet les sliders à la position précédente
                if (rng && lastValidState[rng.id]) rng.value = lastValidState[rng.id];
                if (num && lastValidState[num.id]) num.value = lastValidState[num.id];
                
                // On redessine l'ancienne forme pour garder la 3D propre
                updateBouteille();
            }
        });
    });
    
    // Accordéons
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
                if (parentPanel) {
                    parentPanel.style.maxHeight = "2000px";
                }
            }
        };
    }
}
