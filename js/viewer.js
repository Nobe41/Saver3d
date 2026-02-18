var scene, camera, renderer, controls, bottleGroup;

function initViewer() {
    const container = document.getElementById('viewport-3d');
    
    // Scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Caméra (Orthographique pour le dessin technique)
    const aspect = container.clientWidth / container.clientHeight;
    const viewSize = 400;
    camera = new THREE.OrthographicCamera(
        -viewSize * aspect, viewSize * aspect, 
        viewSize, -viewSize, 
        1, 2000
    );
    camera.position.set(500, 300, 500); // Vue ISO

    // Rendu
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    // Contrôles (Souris)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Grille de sol
    const grid = new THREE.GridHelper(500, 20, 0xdddddd, 0xeeeeee);
    scene.add(grid);

    // Lancement
    updateGeometry();
    animate();
}

function updateGeometry() {
    // Nettoyage de l'ancienne bouteille
    if (bottleGroup) scene.remove(bottleGroup);
    bottleGroup = new THREE.Group();

    // 1. Générer le profil
    const points = generateBottleProfile();

    // 2. Créer le volume (Lathe = Révolution)
    const geometry = new THREE.LatheGeometry(points, 64); // 64 segments = lisse
    
    // 3. Matériau (Verre bleuâtre)
    const material = new THREE.MeshPhysicalMaterial({ 
        color: 0x7ca1ba, 
        metalness: 0.1, 
        roughness: 0.2, 
        transparent: true, 
        opacity: 0.9,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    bottleGroup.add(mesh);

    // 4. Ajouter les arêtes noires (Style dessin technique)
    const edgesGeom = new THREE.EdgesGeometry(geometry, 15); // 15° seuil
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true });
    const edges = new THREE.LineSegments(edgesGeom, edgesMat);
    bottleGroup.add(edges);

    // Centrer la caméra sur le milieu de la bouteille
    if (controls) controls.target.set(0, params.height / 2, 0);

    scene.add(bottleGroup);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    const box = document.getElementById('viewport-3d');
    const aspect = box.clientWidth / box.clientHeight;
    camera.left = -400 * aspect;
    camera.right = 400 * aspect;
    camera.top = 400;
    camera.bottom = -400;
    camera.updateProjectionMatrix();
    renderer.setSize(box.clientWidth, box.clientHeight);
});
