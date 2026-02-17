import { params } from './state.js';
import { updateGeometry } from './viewer.js';

export function initUI() {
    setupLogin();
    setupNavigation();
    setupSliders();
    setupAccordions();
}

function setupLogin() {
    const passwordInput = document.getElementById('password-input');
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (passwordInput.value.trim().toLowerCase() === 'axel') {
                document.getElementById('Page-login').classList.add('hidden');
                document.getElementById('Page-menu').classList.remove('hidden');
            } else {
                passwordInput.style.borderColor = "#ff3333";
                setTimeout(() => { passwordInput.style.borderColor = "#ccc"; }, 500);
            }
        }
    });
}

function setupNavigation() {
    document.getElementById('btn-new-project').addEventListener('click', () => {
        document.getElementById('Page-menu').classList.add('hidden');
        document.getElementById('Page-Bouteille').classList.remove('hidden');
        // On déclenche un resize pour que Three.js prenne la bonne taille
        window.dispatchEvent(new Event('resize'));
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
        document.getElementById('Page-Bouteille').classList.add('hidden');
        document.getElementById('Page-menu').classList.remove('hidden');
    });
}

function setupSliders() {
    // Liste de correspondance ID HTML <-> Paramètre JS
    const mappings = [
        { id: 'height', param: 'height' },
        { id: 'diameter', param: 'diameter' },
        { id: 'base-radius', param: 'baseRadius' },
        { id: 'body-height', param: 'bodyHeight' },
        { id: 'shoulder-curve', param: 'shoulderCurve' },
        { id: 'neck-height', param: 'neckHeight' },
        { id: 'neck-curve', param: 'neckCurve' },
        { id: 'neck-top-diameter', param: 'neckTopDiameter' },
        { id: 'finish-height', param: 'finishHeight' },
        { id: 'finish-diameter', param: 'finishDiameter' }
    ];

    mappings.forEach(map => {
        const slider = document.getElementById(map.id + '-slider');
        const input = document.getElementById(map.id + '-input');

        if (slider && input) {
            // Slider bouge -> Input change -> Modèle change
            slider.addEventListener('input', (e) => {
                input.value = e.target.value;
                params[map.param] = parseFloat(e.target.value);
                updateGeometry();
            });

            // Input change -> Slider bouge -> Modèle change
            input.addEventListener('input', (e) => {
                slider.value = e.target.value;
                params[map.param] = parseFloat(e.target.value);
                updateGeometry();
            });
        }
    });
}

function setupAccordions() {
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            const p = this.nextElementSibling;
            // Astuce pour l'animation height
            if (p.style.maxHeight && p.style.maxHeight !== "0px") {
                 p.style.maxHeight = "0px";
            } else {
                 p.style.maxHeight = p.scrollHeight + "px";
                 // Si c'est un sous-menu, on agrandit aussi le parent
                 const parentPanel = this.parentElement.closest('.panel-controls');
                 if(parentPanel) parentPanel.style.maxHeight = "1000px"; 
            }
        };
    }
}