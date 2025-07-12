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
        this.mountainPeaks = [];
        
        this.init();
        this.createMountain();
        this.createPlayer();
        this.createLighting();
        this.setupControls();
        this.animate();
    }
    
    init() {
        // Scène avec brouillard atmosphérique
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Caméra avec meilleur angle
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 15);
        
        // Renderer avec antialiasing et ombres
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Masquer l'écran de chargement
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
    
    createMountain() {
        // Créer plusieurs pics de montagne
        this.createMountainPeaks();
        
        // Créer le terrain de base avec plus de détail
        this.createDetailedTerrain();
        
        // Ajouter des éléments naturels
        this.addRocks();
        this.addTrees();
        this.addSnow();
        this.addClouds();
    }
    
    createMountainPeaks() {
        const mountainGeometry = new THREE.ConeGeometry(15, 40, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7355,
            transparent: true,
            opacity: 0.9
        });
        
        // Créer plusieurs pics de montagne
        const peakPositions = [
            { x: -30, z: -20, height: 35, scale: 1.2 },
            { x: 25, z: -35, height: 45, scale: 1.5 },
            { x: 40, z: 20, height: 30, scale: 1.0 },
            { x: -20, z: 40, height: 40, scale: 1.3 },
            { x: 0, z: -50, height: 50, scale: 1.8 }
        ];
        
        peakPositions.forEach((peak, index) => {
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(peak.x, peak.height / 2, peak.z);
            mountain.scale.set(peak.scale, peak.scale, peak.scale);
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            
            // Ajouter de la neige au sommet
            const snowGeometry = new THREE.SphereGeometry(peak.scale * 8, 8, 8);
            const snowMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            const snow = new THREE.Mesh(snowGeometry, snowMaterial);
            snow.position.y = peak.height / 2 + 5;
            mountain.add(snow);
            
            this.scene.add(mountain);
            this.mountainPeaks.push(mountain);
        });
    }
    
    createDetailedTerrain() {
        // Terrain de base plus détaillé
        const geometry = new THREE.PlaneGeometry(300, 300, 100, 100);
        
        // Déformer le terrain pour créer des vallées et collines
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            let height = 0;
            
            // Créer des vallées entre les montagnes
            height += Math.sin(x * 0.02) * Math.cos(z * 0.02) * 8;
            height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
            
            // Ajouter des collines plus petites
            height += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
            
            // Créer des chemins naturels
            height += Math.sin(x * 0.03) * 1;
            
            // Ajouter du bruit pour plus de réalisme
            height += (Math.random() - 0.5) * 1.5;
            
            vertices[i + 1] = height;
        }
        
        geometry.computeVertexNormals();
        
        // Matériau du terrain avec texture procédurale
        const material = new THREE.MeshLambertMaterial({
            color: 0x4A7C59,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
    }
    
    addRocks() {
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 50; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 250,
                0,
                (Math.random() - 0.5) * 250
            );
            
            // Positionner sur le terrain
            const height = this.getTerrainHeight(rock.position.x, rock.position.z);
            rock.position.y = height + 0.5;
            
            rock.scale.set(
                Math.random() * 1.5 + 0.5,
                Math.random() * 1.5 + 0.5,
                Math.random() * 1.5 + 0.5
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }
    
    addTrees() {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            transparent: true,
            opacity: 0.9
        });
        
        const leavesGeometry = new THREE.SphereGeometry(2.5, 8, 8);
        const leavesMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 80; i++) {
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            
            leaves.position.y = 3.5;
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            
            tree.position.set(
                (Math.random() - 0.5) * 250,
                0,
                (Math.random() - 0.5) * 250
            );
            
            // Positionner sur le terrain
            const height = this.getTerrainHeight(tree.position.x, tree.position.z);
            tree.position.y = height;
            
            // Éviter de placer des arbres sur les pics de montagne
            const distanceToPeaks = this.mountainPeaks.some(peak => {
                const distance = Math.sqrt(
                    Math.pow(tree.position.x - peak.position.x, 2) + 
                    Math.pow(tree.position.z - peak.position.z, 2)
                );
                return distance < 20;
            });
            
            if (!distanceToPeaks) {
                tree.scale.set(
                    Math.random() * 0.5 + 0.8,
                    Math.random() * 0.5 + 0.8,
                    Math.random() * 0.5 + 0.8
                );
                
                tree.castShadow = true;
                tree.receiveShadow = true;
                this.scene.add(tree);
            }
        }
    }
    
    addSnow() {
        // Ajouter de la neige sur les hauteurs
        const snowGeometry = new THREE.SphereGeometry(1, 6, 6);
        const snowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 200; i++) {
            const snow = new THREE.Mesh(snowGeometry, snowMaterial);
            snow.position.set(
                (Math.random() - 0.5) * 250,
                0,
                (Math.random() - 0.5) * 250
            );
            
            const height = this.getTerrainHeight(snow.position.x, snow.position.z);
            snow.position.y = height + Math.random() * 2;
            
            // Ne placer la neige qu'en altitude
            if (height > 5) {
                snow.scale.set(
                    Math.random() * 0.5 + 0.3,
                    Math.random() * 0.5 + 0.3,
                    Math.random() * 0.5 + 0.3
                );
                
                snow.receiveShadow = true;
                this.scene.add(snow);
            }
        }
    }
    
    addClouds() {
        const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 400,
                Math.random() * 30 + 20,
                (Math.random() - 0.5) * 400
            );
            
            cloud.scale.set(
                Math.random() * 2 + 1,
                Math.random() * 0.5 + 0.5,
                Math.random() * 2 + 1
            );
            
            this.scene.add(cloud);
        }
    }
    
    createPlayer() {
        // Corps du personnage amélioré
        const bodyGeometry = new THREE.CapsuleGeometry(0.6, 1.2, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1,
            transparent: true,
            opacity: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Tête
        const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFE4C4,
            transparent: true,
            opacity: 0.9
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        
        // Bras améliorés
        const armGeometry = new THREE.CapsuleGeometry(0.25, 1, 4, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFE4C4,
            transparent: true,
            opacity: 0.9
        });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.9, 0.6, 0);
        leftArm.rotation.z = Math.PI / 6;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.9, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 6;
        
        // Jambes améliorées
        const legGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x000080,
            transparent: true,
            opacity: 0.9
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.4, -1.4, 0);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.4, -1.4, 0);
        
        // Grouper tous les éléments
        this.player = new THREE.Group();
        this.player.add(body);
        this.player.add(head);
        this.player.add(leftArm);
        this.player.add(rightArm);
        this.player.add(leftLeg);
        this.player.add(rightLeg);
        
        this.player.position.set(0, 10, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);
    }
    
    createLighting() {
        // Lumière ambiante plus douce
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Lumière directionnelle principale (soleil)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        this.scene.add(directionalLight);
        
        // Lumière de remplissage
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
    }
    
    setupControls() {
        // Gestion des touches QZSD
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
        const xPos = (x + 150) / 300;
        const zPos = (z + 150) / 300;
        
        if (xPos < 0 || xPos > 1 || zPos < 0 || zPos > 1) return 0;
        
        const height = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 8 +
                      Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4 +
                      Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 +
                      Math.sin(x * 0.03) * 1;
        
        return height;
    }
    
    updatePlayer(deltaTime) {
        const speed = 12;
        const jumpForce = 18;
        const gravity = -35;
        
        // Mouvement horizontal avec QZSD
        const moveX = (this.keys['KeyQ'] ? -1 : 0) + (this.keys['KeyD'] ? 1 : 0);
        const moveZ = (this.keys['KeyZ'] ? -1 : 0) + (this.keys['KeyS'] ? 1 : 0);
        
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
        if (this.player.position.y <= terrainHeight + 1.5) {
            this.player.position.y = terrainHeight + 1.5;
            this.playerVelocity.y = 0;
            this.playerOnGround = true;
        }
        
        // Rotation du personnage dans la direction du mouvement
        if (moveX !== 0 || moveZ !== 0) {
            const angle = Math.atan2(moveVector.x, moveVector.z);
            this.player.rotation.y = angle;
        }
        
        // Animation des jambes et bras
        const time = this.clock.getElapsedTime();
        const legs = [this.player.children[4], this.player.children[5]];
        const arms = [this.player.children[2], this.player.children[3]];
        
        legs.forEach((leg, index) => {
            if (this.playerOnGround && (moveX !== 0 || moveZ !== 0)) {
                leg.rotation.x = Math.sin(time * 12 + index * Math.PI) * 0.4;
            } else {
                leg.rotation.x = 0;
            }
        });
        
        arms.forEach((arm, index) => {
            if (this.playerOnGround && (moveX !== 0 || moveZ !== 0)) {
                arm.rotation.x = Math.sin(time * 12 + index * Math.PI + Math.PI) * 0.3;
            } else {
                arm.rotation.x = 0;
            }
        });
    }
    
    updateCamera() {
        // Position de la caméra derrière le joueur avec meilleur angle
        const cameraOffset = new THREE.Vector3(0, 4, 10);
        const targetPosition = this.player.position.clone().add(cameraOffset);
        
        // Interpolation douce
        this.camera.position.lerp(targetPosition, 0.08);
        
        // Regarder vers le joueur
        this.camera.lookAt(this.player.position);
        
        // Rotation de la caméra avec la souris
        this.camera.rotation.y += this.mouse.x * 0.008;
        this.camera.rotation.x += this.mouse.y * 0.008;
        
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
        document.getElementById('speed').textContent = Math.round(speed * 3.6);
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