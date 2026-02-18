// On attend que la page soit prête
window.addEventListener('DOMContentLoaded', () => {
    console.log("Atelier Bouteille - Démarrage...");
    
    // Initialiser l'interface
    initUI();
    
    // Initialiser la 3D (après un court délai pour être sûr)
    setTimeout(() => {
        initViewer();
    }, 100);
});
