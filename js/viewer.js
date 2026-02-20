function initLogiciel() {
    if (renderer) return; 

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef2f5);

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
    
    const grid = new THREE.GridHelper(400, 20, 0xaaaaaa, 0xcccccc);
    grid.material.opacity = 0.6; 
    grid.material.transparent = true;
    scene.add(grid);

    scene.add(camera); 
    
    // ====================================================
    // ÉCLAIRAGE SUBTIL (Projecteurs baissés)
    // ====================================================
    // Lumière 1 
    const dL1 = new THREE.DirectionalLight(0xe8f0f8, 0.4); 
    dL1.position.set(-1.5, 0, 3); 
    camera.add(dL1);

    // Lumière 2 
    const dL2 = new THREE.DirectionalLight(0xe8f0f8, 0.4); 
    dL2.position.set(1.5, 0, 3); 
    camera.add(dL2);
    
    // Lumière ambiante légèrement augmentée pour compenser
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    // ====================================================

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 150, 0); 
    
    updateBouteille();
    setupListeners();

    function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
    animate();
}

function updateBouteille() {
    if (bottleGroup) scene.remove(bottleGroup);
    bottleGroup = new THREE.Group();

    const profil = generateBottleProfile();
    const geometry = new THREE.LatheGeometry(profil, 128); 
    
    // ====================================================
    // MATÉRIAU "MAT AVEC LÉGER REFLET"
    // ====================================================
    const mat = new THREE.MeshPhongMaterial({ 
        color: 0x99ccff,     
        specular: 0x222222,  // Gris très sombre pour un reflet presque effacé
        shininess: 30,       // Reflet très diffus et doux
        side: THREE.DoubleSide 
    });
    // ====================================================

    bottleGroup.add(new THREE.Mesh(geometry, mat));
    
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(profil[0].x, 64).rotateX(-Math.PI/2), mat);
    bottleGroup.add(bottom);

    const edges = new THREE.EdgesGeometry(geometry, 40); 
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
    bottleGroup.add(new THREE.LineSegments(edges, lineMat));

    if (typeof getEngravingsData === 'function') {
        const engravings = getEngravingsData();
        const matGravure = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4 });
        
        engravings.forEach(eng => {
            const img = window.engravingImages[eng.id];
            if (!img) return;

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            const ratio = img.height / img.width;
            const physHeight = eng.width * ratio;
            
            const resX = Math.min(350, img.width);
            const resY = Math.min(350, img.height);
            const textGeo = new THREE.PlaneGeometry(eng.width, physHeight, resX, resY);
            
            const pos = textGeo.attributes.position;
            const uv = textGeo.attributes.uv;

            for (let i = 0; i < pos.count; i++) {
                const u = uv.getX(i);
                const v = uv.getY(i);

                let px = Math.floor(u * (canvas.width - 1));
                if (eng.flip) {
                    px = Math.floor((1 - u) * (canvas.width - 1));
                }
                
                const py = Math.floor((1 - v) * (canvas.height - 1));
                const idx = (py * canvas.width + px) * 4;
                
                const alpha = imgData[idx + 3];

                const vx = pos.getX(i); 
                const vy_base = pos.getY(i) + eng.y;

                const R_base = getRadiusAtHeight(vy_base, profil);
                
                const R_up = getRadiusAtHeight(vy_base + 0.1, profil);
                const R_down = getRadiusAtHeight(vy_base - 0.1, profil);
                const dx = R_up - R_down;
                const dy = 0.2; 
                const len = Math.sqrt(dx*dx + dy*dy);
                const nx = dy / len;  
                const ny = -dx / len; 

                const relief = -0.1 + (alpha / 255) * (eng.depth + 0.1);
                
                const finalR = R_base + relief * nx;
                const vy = vy_base + relief * ny;

                const theta = eng.angle + (vx / R_base); 
                
                const finalX = finalR * Math.sin(theta);
                const finalZ = finalR * Math.cos(theta);
                
                pos.setXYZ(i, finalX, vy, finalZ);
            }
            
            textGeo.computeVertexNormals();
            bottleGroup.add(new THREE.Mesh(textGeo, matGravure));
        });
    }

    scene.add(bottleGroup);
}
