import * as THREE from 'three';

class MountainExplorer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.terrain = null;
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.playerVelocity = new THREE.Vector3();
        this.playerOnGround = false;
        this.clock = new THREE.Clock();
        
        this.init();
        this.createTerrain();
        this.createPlayer();
        this.createLighting();
        this.setupControls();
        this.animate();
    }
    
    init() {
        // Scène
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        // Caméra
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Masquer l'écran de chargement
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
    
    createTerrain() {
        // Géométrie du terrain
        const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // Déformer le terrain pour créer des montagnes
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Créer plusieurs pics de montagne
            let height = 0;
            height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 10;
            height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
            height += Math.sin(x * 0.02) * Math.cos(z * 0.02) * 15;
            
            // Ajouter du bruit pour plus de réalisme
            height += (Math.random() - 0.5) * 2;
            
            vertices[i + 1] = height;
        }
        
        geometry.computeVertexNormals();
        
        // Matériau du terrain
        const material = new THREE.MeshLambertMaterial({
            color: 0x3a5f3a,
            side: THREE.DoubleSide
        });
        
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
        
        // Ajouter des rochers
        this.addRocks();
        
        // Ajouter des arbres
        this.addTrees();
    }
    
    addRocks() {
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        for (let i = 0; i < 20; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 180,
                0,
                (Math.random() - 0.5) * 180
            );
            
            // Positionner sur le terrain
            const height = this.getTerrainHeight(rock.position.x, rock.position.z);
            rock.position.y = height + 0.5;
            
            rock.scale.set(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }
    
    addTrees() {
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        
        for (let i = 0; i < 30; i++) {
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            
            leaves.position.y = 2.5;
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            
            tree.position.set(
                (Math.random() - 0.5) * 180,
                0,
                (Math.random() - 0.5) * 180
            );
            
            // Positionner sur le terrain
            const height = this.getTerrainHeight(tree.position.x, tree.position.z);
            tree.position.y = height;
            
            tree.castShadow = true;
            tree.receiveShadow = true;
            this.scene.add(tree);
        }
    }
    
    createPlayer() {
        // Corps du personnage
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Tête
        const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        
        // Bras
        const armGeometry = new THREE.CapsuleGeometry(0.2, 0.8, 4, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.8, 0.5, 0);
        leftArm.rotation.z = Math.PI / 4;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.8, 0.5, 0);
        rightArm.rotation.z = -Math.PI / 4;
        
        // Jambes
        const legGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 4, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, -1.2, 0);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, -1.2, 0);
        
        // Grouper tous les éléments
        this.player = new THREE.Group();
        this.player.add(body);
        this.player.add(head);
        this.player.add(leftArm);
        this.player.add(rightArm);
        this.player.add(leftLeg);
        this.player.add(rightLeg);
        
        this.player.position.set(0, 5, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);
    }
    
    createLighting() {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Lumière directionnelle (soleil)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    setupControls() {
        // Gestion des touches
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Gestion de la souris
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Pointer lock pour les contrôles de caméra
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }
    
    getTerrainHeight(x, z) {
        // Calculer la hauteur du terrain à une position donnée
        const xPos = (x + 100) / 200;
        const zPos = (z + 100) / 200;
        
        if (xPos < 0 || xPos > 1 || zPos < 0 || zPos > 1) return 0;
        
        const height = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 10 +
                      Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5 +
                      Math.sin(x * 0.02) * Math.cos(z * 0.02) * 15;
        
        return height;
    }
    
    updatePlayer(deltaTime) {
        const speed = 10;
        const jumpForce = 15;
        const gravity = -30;
        
        // Mouvement horizontal
        const moveX = (this.keys['KeyA'] ? -1 : 0) + (this.keys['KeyD'] ? 1 : 0);
        const moveZ = (this.keys['KeyW'] ? -1 : 0) + (this.keys['KeyS'] ? 1 : 0);
        
        // Direction du mouvement basée sur l'orientation de la caméra
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        
        const moveVector = new THREE.Vector3();
        moveVector.addScaledVector(cameraDirection, -moveZ);
        moveVector.addScaledVector(rightVector, moveX);
        moveVector.normalize();
        
        this.playerVelocity.x = moveVector.x * speed;
        this.playerVelocity.z = moveVector.z * speed;
        
        // Saut
        if (this.keys['Space'] && this.playerOnGround) {
            this.playerVelocity.y = jumpForce;
            this.playerOnGround = false;
        }
        
        // Gravité
        this.playerVelocity.y += gravity * deltaTime;
        
        // Appliquer le mouvement
        this.player.position.x += this.playerVelocity.x * deltaTime;
        this.player.position.y += this.playerVelocity.y * deltaTime;
        this.player.position.z += this.playerVelocity.z * deltaTime;
        
        // Collision avec le terrain
        const terrainHeight = this.getTerrainHeight(this.player.position.x, this.player.position.z);
        if (this.player.position.y <= terrainHeight + 1) {
            this.player.position.y = terrainHeight + 1;
            this.playerVelocity.y = 0;
            this.playerOnGround = true;
        }
        
        // Rotation du personnage dans la direction du mouvement
        if (moveX !== 0 || moveZ !== 0) {
            const angle = Math.atan2(moveVector.x, moveVector.z);
            this.player.rotation.y = angle;
        }
        
        // Animation des jambes
        const time = this.clock.getElapsedTime();
        const legs = [this.player.children[4], this.player.children[5]];
        legs.forEach((leg, index) => {
            if (this.playerOnGround && (moveX !== 0 || moveZ !== 0)) {
                leg.rotation.x = Math.sin(time * 10 + index * Math.PI) * 0.3;
            } else {
                leg.rotation.x = 0;
            }
        });
    }
    
    updateCamera() {
        // Position de la caméra derrière le joueur
        const cameraOffset = new THREE.Vector3(0, 3, 8);
        const targetPosition = this.player.position.clone().add(cameraOffset);
        
        // Interpolation douce
        this.camera.position.lerp(targetPosition, 0.1);
        
        // Regarder vers le joueur
        this.camera.lookAt(this.player.position);
        
        // Rotation de la caméra avec la souris
        this.camera.rotation.y += this.mouse.x * 0.01;
        this.camera.rotation.x += this.mouse.y * 0.01;
        
        // Limiter la rotation verticale
        this.camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.camera.rotation.x));
    }
    
    updateUI() {
        const position = this.player.position;
        document.getElementById('position').textContent = 
            `${Math.round(position.x)}, ${Math.round(position.y)}, ${Math.round(position.z)}`;
        
        const speed = Math.sqrt(
            this.playerVelocity.x * this.playerVelocity.x + 
            this.playerVelocity.z * this.playerVelocity.z
        );
        document.getElementById('speed').textContent = Math.round(speed * 3.6); // Conversion en km/h
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        this.updatePlayer(deltaTime);
        this.updateCamera();
        this.updateUI();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer l'application
new MountainExplorer();