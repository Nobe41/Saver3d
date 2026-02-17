var scene, camera, renderer, controls, bottleGroup;

function initViewer() {
    const container = document.getElementById('viewport-3d');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.OrthographicCamera(-250 * aspect, 250 * aspect, 250, -250, 1, 2000);
    camera.position.set(400, 300, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const grid = new THREE.GridHelper(400, 20, 0x888888, 0xeeeeee);
    scene.add(grid);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    updateGeometry();
    animate();
}

function updateGeometry() {
    if (bottleGroup) scene.remove(bottleGroup);
    bottleGroup = new THREE.Group();

    const profil = generateBottleProfile();
    const geometry = new THREE.LatheGeometry(profil, 128); 
    const mat = new THREE.MeshStandardMaterial({ color: 0x7ca1ba, roughness: 0.6, metalness: 0.1, side: THREE.DoubleSide });

    bottleGroup.add(new THREE.Mesh(geometry, mat));
    const edges = new THREE.EdgesGeometry(geometry, 40); 
    bottleGroup.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 })));

    scene.add(bottleGroup);
    controls.target.set(0, params.height / 2, 0);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
