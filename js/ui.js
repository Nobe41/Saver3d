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

// --- 2. NAVIGATION ---
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

// --- 3. SLIDERS & INPUTS ---
function setupListeners() {
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
            // Met à jour la 3D à chaque mouvement
            updateBouteille();
        });
    });
    
    // Accordéons
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            const p = this.nextElementSibling;
            p.style.maxHeight = p.style.maxHeight && p.style.maxHeight !== "0px" ? "0px" : p.scrollHeight + "px";
        };
    }
}
