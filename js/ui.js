const pageLogin = document.getElementById('Page-login');
const pageMenu = document.getElementById('Page-menu');
const pageBouteille = document.getElementById('Page-Bouteille');
const passwordInput = document.getElementById('password-input');
const btnNewProject = document.getElementById('btn-new-project');

viewport3D = document.getElementById('viewport-3d');

// ==========================================
// NAVIGATION GLOBALE (LOGIN & MENU)
// ==========================================

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

// Retour Menu depuis le menu "Fichier"
const btnBackMenu = document.getElementById('btn-back-menu');
if (btnBackMenu) {
    btnBackMenu.addEventListener('click', () => {
        pageBouteille.classList.add('hidden');
        pageMenu.classList.remove('hidden');
        document.getElementById('fichier-dropdown').classList.add('hidden');
    });
}

// ==========================================
// GESTION DU MENU DÉROULANT "FICHIER"
// ==========================================

const btnFichierMenu = document.getElementById('btn-fichier-menu');
const fichierDropdown = document.getElementById('fichier-dropdown');

if (btnFichierMenu && fichierDropdown) {
    btnFichierMenu.addEventListener('click', (e) => {
        e.stopPropagation(); 
        fichierDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!fichierDropdown.contains(e.target) && e.target !== btnFichierMenu) {
            fichierDropdown.classList.add('hidden');
        }
    });
}

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
