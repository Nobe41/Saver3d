function initLogiciel() {
    if (renderer) return; 

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Fond Blanc

    const w = viewport3D.clientWidth;
    const h = viewport3D.clientHeight;
    const aspect = w / h;
    const vs = 250; 
    camera = new THREE.OrthographicCamera(-vs * aspect, vs * aspect, vs, -vs, 1, 2000);
    camera.position.set(400, 300, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    viewport3D.appendChild(renderer.domElement);

    scene.add(new THREE.AxesHelper(100));
    
    // Grille
    const grid = new THREE.GridHelper(400, 20, 0x888888, 0xeeeeee);
    grid.material.opacity = 0.5; grid.material.transparent = true;
    scene.add(grid);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dL = new THREE.DirectionalLight(0xffffff, 0.6); dL.position.set(100, 500, 100);
    scene.add(dL);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Premier rendu
    updateBouteille();
    
    // Active les écouteurs UI
    setupListeners();

    function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
    animate();
}

function updateBouteille() {
    if (bottleGroup) scene.remove(bottleGroup);
    bottleGroup = new THREE.Group();

    const profil = generateBottleProfile();
    const geometry = new THREE.LatheGeometry(profil, 128); 
    
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0x7ca1ba, roughness: 0.6, metalness: 0.1, side: THREE.DoubleSide 
    });

    bottleGroup.add(new THREE.Mesh(geometry, mat));
    
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(profil[0].x, 64).rotateX(-Math.PI/2), mat);
    bottleGroup.add(bottom);

    // Arêtes noires pour bien voir les angles à 90°
    const edges = new THREE.EdgesGeometry(geometry, 40); 
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 });
    bottleGroup.add(new THREE.LineSegments(edges, lineMat));

    scene.add(bottleGroup);
    
    // NOUVEAU : La caméra lit la vraie hauteur finale pour toujours viser le milieu
    const topY = profil[profil.length - 1].y;
    controls.target.set(0, topY / 2, 0);
}
