// Variables globales
let scene, camera, renderer, player, mountain;
let keys = {};
let score = 0;
let health = 100;
let playerVelocity = new THREE.Vector3();
let playerOnGround = false;
let gameRunning = true;

// Initialisation
function init() {
    // Créer la scène
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    // Créer la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    
    // Créer le renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87CEEB);
    document.getElementById('gameContainer').appendChild(renderer.domElement);
    
    // Éclairage
    setupLighting();
    
    // Créer la montagne
    createMountain();
    
    // Créer le joueur
    createPlayer();
    
    // Créer l'environnement
    createEnvironment();
    
    // Événements
    setupEventListeners();
    
    // Démarrer la boucle de jeu
    animate();
}

// Configuration de l'éclairage
function setupLighting() {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Lumière directionnelle (soleil)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Lumière d'appoint pour les ombres
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);
}

// Créer la montagne complète
function createMountain() {
    const mountainGroup = new THREE.Group();
    
    // Géométrie de base de la montagne
    const mountainGeometry = new THREE.ConeGeometry(30, 60, 8);
    const mountainMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        transparent: true,
        opacity: 0.9
    });
    const mountainBase = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountainBase.position.y = 30;
    mountainBase.castShadow = true;
    mountainBase.receiveShadow = true;
    mountainGroup.add(mountainBase);
    
    // Couche de neige au sommet
    const snowGeometry = new THREE.ConeGeometry(15, 20, 8);
    const snowMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
    });
    const snowCap = new THREE.Mesh(snowGeometry, snowMaterial);
    snowCap.position.y = 70;
    snowCap.castShadow = true;
    snowCap.receiveShadow = true;
    mountainGroup.add(snowCap);
    
    // Rochers et détails
    for (let i = 0; i < 20; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.3, 0.3 + Math.random() * 0.2)
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 25 + 5;
        const height = Math.random() * 50 + 10;
        
        rock.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        mountainGroup.add(rock);
    }
    
    // Sentier d'escalade
    createClimbingPath(mountainGroup);
    
    mountain = mountainGroup;
    scene.add(mountain);
}

// Créer le sentier d'escalade
function createClimbingPath(mountainGroup) {
    const pathGeometry = new THREE.BufferGeometry();
    const pathVertices = [];
    const pathIndices = [];
    
    // Créer un chemin en spirale autour de la montagne
    for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 4;
        const radius = 25 - (i / 50) * 10;
        const height = (i / 50) * 50 + 5;
        
        pathVertices.push(
            Math.cos(angle) * radius, height, Math.sin(angle) * radius,
            Math.cos(angle) * (radius + 2), height, Math.sin(angle) * (radius + 2)
        );
        
        if (i > 0) {
            const base = i * 2;
            pathIndices.push(
                base - 2, base - 1, base,
                base - 1, base + 1, base
            );
        }
    }
    
    pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pathVertices, 3));
    pathGeometry.setIndex(pathIndices);
    pathGeometry.computeVertexNormals();
    
    const pathMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x654321,
        transparent: true,
        opacity: 0.7
    });
    
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.receiveShadow = true;
    mountainGroup.add(path);
}

// Créer le joueur
function createPlayer() {
    const playerGroup = new THREE.Group();
    
    // Corps du joueur
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerGroup.add(body);
    
    // Tête
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    playerGroup.add(head);
    
    // Bras
    const armGeometry = new THREE.CapsuleGeometry(0.2, 1, 4, 8);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.8, 1.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    playerGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.8, 1.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    playerGroup.add(rightArm);
    
    // Jambes
    const legGeometry = new THREE.CapsuleGeometry(0.25, 1, 4, 8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);
    
    // Casque
    const helmetGeometry = new THREE.SphereGeometry(0.45, 8, 6);
    const helmetMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFF4500,
        transparent: true,
        opacity: 0.8
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 2.6;
    helmet.castShadow = true;
    playerGroup.add(helmet);
    
    player = playerGroup;
    player.position.set(0, 5, 0);
    scene.add(player);
}

// Créer l'environnement
function createEnvironment() {
    // Sol
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x228B22,
        transparent: true,
        opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Arbres
    for (let i = 0; i < 30; i++) {
        createTree(
            (Math.random() - 0.5) * 180,
            (Math.random() - 0.5) * 180
        );
    }
    
    // Nuages
    for (let i = 0; i < 15; i++) {
        createCloud(
            (Math.random() - 0.5) * 300,
            Math.random() * 50 + 30,
            (Math.random() - 0.5) * 300
        );
    }
}

// Créer un arbre
function createTree(x, z) {
    const treeGroup = new THREE.Group();
    
    // Tronc
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Feuillage
    const foliageGeometry = new THREE.SphereGeometry(2, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 5;
    foliage.castShadow = true;
    treeGroup.add(foliage);
    
    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
}

// Créer un nuage
function createCloud(x, y, z) {
    const cloudGroup = new THREE.Group();
    
    for (let i = 0; i < 5; i++) {
        const cloudGeometry = new THREE.SphereGeometry(Math.random() * 3 + 2, 8, 6);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7
        });
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 4
        );
        cloudGroup.add(cloudPart);
    }
    
    cloudGroup.position.set(x, y, z);
    scene.add(cloudGroup);
}

// Configuration des événements
function setupEventListeners() {
    // Contrôles clavier
    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });
    
    document.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });
    
    // Redimensionnement
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Mise à jour du joueur
function updatePlayer(deltaTime) {
    const speed = 10;
    const jumpForce = 15;
    const gravity = -30;
    
    // Appliquer la gravité
    playerVelocity.y += gravity * deltaTime;
    
    // Contrôles de mouvement
    if (keys['KeyZ'] || keys['KeyW']) {
        playerVelocity.z = -speed;
    } else if (keys['KeyS']) {
        playerVelocity.z = speed;
    } else {
        playerVelocity.z *= 0.9;
    }
    
    if (keys['KeyQ'] || keys['KeyA']) {
        playerVelocity.x = -speed;
    } else if (keys['KeyD']) {
        playerVelocity.x = speed;
    } else {
        playerVelocity.x *= 0.9;
    }
    
    // Saut
    if ((keys['Space'] || keys['KeyW']) && playerOnGround) {
        playerVelocity.y = jumpForce;
        playerOnGround = false;
    }
    
    // Appliquer le mouvement
    player.position.add(playerVelocity.clone().multiplyScalar(deltaTime));
    
    // Collision avec le sol
    if (player.position.y <= 1) {
        player.position.y = 1;
        playerVelocity.y = 0;
        playerOnGround = true;
    }
    
    // Collision avec la montagne
    const mountainCenter = new THREE.Vector3(0, 30, 0);
    const distanceToMountain = player.position.distanceTo(mountainCenter);
    const mountainRadius = 30;
    
    if (distanceToMountain < mountainRadius) {
        const direction = player.position.clone().sub(mountainCenter).normalize();
        player.position.copy(mountainCenter.clone().add(direction.multiplyScalar(mountainRadius)));
    }
    
    // Mise à jour de la caméra
    updateCamera();
    
    // Mise à jour du score
    updateScore();
}

// Mise à jour de la caméra
function updateCamera() {
    const targetPosition = player.position.clone().add(new THREE.Vector3(0, 5, 15));
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 2, 0)));
}

// Mise à jour du score
function updateScore() {
    const height = Math.max(0, player.position.y - 1);
    score = Math.floor(height * 10);
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Mise à jour de la santé
    if (player.position.y < 0) {
        health = Math.max(0, health - 1);
        document.getElementById('healthValue').textContent = health;
        document.getElementById('healthFill').style.width = health + '%';
        
        if (health <= 0) {
            gameRunning = false;
            alert(`Game Over! Score final: ${score}`);
        }
    }
}

// Animation
function animate() {
    if (!gameRunning) return;
    
    requestAnimationFrame(animate);
    
    const deltaTime = 1/60; // 60 FPS fixe
    
    updatePlayer(deltaTime);
    
    // Animation de la montagne
    mountain.rotation.y += 0.001;
    
    renderer.render(scene, camera);
}

// Démarrer le jeu
init();