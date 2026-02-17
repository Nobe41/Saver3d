import { initViewer } from './viewer.js';
import { initUI } from './ui.js';

// On attend que tout soit chargé
window.addEventListener('DOMContentLoaded', () => {
    console.log("Démarrage de l'Atelier Bouteille Pro...");
    
    // 1. Initialiser l'interface (Boutons, Sliders)
    initUI();
    
    // 2. Initialiser la 3D
    // Petit délai pour être sûr que le DOM est prêt
    setTimeout(() => {
        initViewer();
    }, 100);
});