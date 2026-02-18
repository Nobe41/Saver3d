function initUI() {
    setupLogin();
    setupNavigation();
    setupSliders();
    setupAccordions();
}

// 1. GESTION DU LOGIN
function setupLogin() {
    const pwdInput = document.getElementById('password-input');
    const errorMsg = document.getElementById('login-error');

    pwdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (pwdInput.value.trim().toLowerCase() === 'axel') {
                // Succès
                document.getElementById('Page-login').classList.add('hidden');
                document.getElementById('Page-menu').classList.remove('hidden');
            } else {
                // Échec
                errorMsg.classList.remove('hidden');
                pwdInput.style.borderColor = 'red';
            }
        }
    });
}

// 2. NAVIGATION ENTRE LES PAGES
function setupNavigation() {
    // Bouton "Nouveau Projet"
    document.getElementById('btn-new-project').addEventListener('click', () => {
        document.getElementById('Page-menu').classList.add('hidden');
        document.getElementById('Page-Bouteille').classList.remove('hidden');
        // On force le redimensionnement 3D car le conteneur vient d'apparaître
        window.dispatchEvent(new Event('resize'));
    });

    // Bouton "Retour Menu"
    document.getElementById('btn-back-menu').addEventListener('click', () => {
        document.getElementById('Page-Bouteille').classList.add('hidden');
        document.getElementById('Page-menu').classList.remove('hidden');
    });
}

// 3. LIEN ENTRE SLIDERS ET PARAMÈTRES
function setupSliders() {
    // Liste des couples : ID HTML <-> Variable JS
    const mappings = [
        { id: 'height', param: 'height' },
        { id: 'body-height', param: 'bodyHeight' },
        { id: 'diameter', param: 'diameter' },
        { id: 'shoulder-curve', param: 'shoulderCurve' },
        { id: 'neck-height', param: 'neckHeight' },
        { id: 'neck-diameter', param: 'neckDiameter' },
        { id: 'finish-height', param: 'finishHeight' }
    ];

    mappings.forEach(map => {
        const slider = document.getElementById(map.id + '-slider');
        const input = document.getElementById(map.id + '-input');

        if (slider && input) {
            // Slider bouge -> Input change -> 3D change
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                input.value = val;
                params[map.param] = val;
                updateGeometry();
            });

            // Input change -> Slider bouge -> 3D change
            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                slider.value = val;
                params[map.param] = val;
                updateGeometry();
            });
        }
    });
}

// 4. ANIMATION DES ACCORDÉONS
function setupAccordions() {
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    }
}
