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

// Quand on clique sur "OUVRIR", ça ouvre la fenêtre Windows/Mac
btnOpenProject.addEventListener('click', () => {
    fileLoader.click(); 
});

// Quand l'utilisateur a choisi un fichier
fileLoader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Alerte temporaire pour montrer que le fichier est bien lu
    alert("Fichier sélectionné : " + file.name + "\nLe système de chargement complet arrive bientôt !");
    
    // On passe quand même sur la page de travail
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
    // Désactive tout
    btn3D.classList.remove('active');
    btn2D.classList.remove('active');
    btnOutillage.classList.remove('active');
    view3D.classList.add('hidden');
    view2D.classList.add('hidden');
    viewOutillage.classList.add('hidden');
    
    // Active le bon
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
}

btn3D.addEventListener('click', () => switchView(btn3D, view3D));
btn2D.addEventListener('click', () => switchView(btn2D, view2D));
btnOutillage.addEventListener('click', () => switchView(btnOutillage, viewOutillage));

// --- 4. BOUTON GRAVURE (En cours de dev) ---
document.getElementById('btn-add-engraving').addEventListener('click', () => {
    alert("La fonctionnalité Gravure n'est pas encore programmée ! 🛠️");
});


// --- 5. SLIDERS & ACCORDÉONS ---
function setupListeners() {
    // Sliders
    const inputs = document.querySelectorAll('input[type=range], input[type=number]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.type === 'range') {
                const num = input.parentElement.querySelector('input[type=number]');
                if (num) num.value = input.value;
            } else {
                const rng = input.parentElement.parentElement.querySelector('input[type=range]');
                if (rng) rng.value = input.value;
            }
            updateBouteille();
        });
    });
    
    // Accordéons (Corrigé pour les sous-menus)
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            
            if (panel.style.maxHeight && panel.style.maxHeight !== "0px") {
                panel.style.maxHeight = "0px";
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                // L'astuce : dire au menu parent de s'agrandir aussi
                const parentPanel = this.parentElement.closest('.panel-controls');
                if (parentPanel) {
                    parentPanel.style.maxHeight = "2000px"; // On lui donne beaucoup de place
                }
            }
        };
    }
}
