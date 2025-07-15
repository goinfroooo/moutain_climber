import * as THREE from 'three';

class MountainExplorer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        // this.player = null; // On n'a plus besoin du joueur 3D
        this.terrain = null;
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.playerVelocity = new THREE.Vector3();
        this.playerOnGround = false;
        this.clock = new THREE.Clock();
        this.yaw = 0; // Pour la rotation horizontale
        this.pitch = 0; // Pour la rotation verticale
        this.playerPosition = new THREE.Vector3(0, 5, 0); // Position du joueur (caméra)

        this.init();
        this.createTerrain();
        // this.createPlayer(); // On supprime le bonhomme
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
    
    // --- Bruit simple type Perlin/Simplex pour relief naturel ---
    noise2D(x, y) {
        // Bruit pseudo-aléatoire lissé (simple, pour ne pas ajouter de dépendance)
        let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    createTerrain() {
        // Paramètres de la montagne
        const size = 200;
        const segments = 200;
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        const vertices = geometry.attributes.position.array;
        // Position du sommet de la montagne
        const peakX = 0;
        const peakZ = 40; // Devant la caméra
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            // Distance au sommet
            const dist = Math.sqrt((x - peakX) ** 2 + (z - peakZ) ** 2);
            // Forme générale : pic central, base large
            let height = 0;
            // Pic principal
            height += Math.max(0, 60 - dist * 1.2);
            // Relief secondaire (crêtes, plateaux)
            height += Math.sin(x * 0.08) * 2 + Math.cos(z * 0.09) * 2;
            height += Math.sin(x * 0.2 + z * 0.15) * 1.5;
            // Bruit pour détails fins
            height += (this.noise2D(x * 0.15, z * 0.15) - 0.5) * 6;
            height += (this.noise2D(x * 0.5, z * 0.5) - 0.5) * 2;
            // Plancher pour la plaine
            if (dist > 80) height = Math.max(height, 0);
            vertices[i + 1] = height;
        }
        geometry.computeVertexNormals();
        // Dégradé de couleurs selon l'altitude
        const colors = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const y = vertices[i + 1];
            let color;
            if (y > 45) color = new THREE.Color(0xf8f8ff); // Neige
            else if (y > 30) color = new THREE.Color(0x888888); // Roche
            else if (y > 10) color = new THREE.Color(0x3a5f3a); // Herbe foncée
            else color = new THREE.Color(0x7ec850); // Prairie
            colors.push(color.r, color.g, color.b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        // Matériau avec vertex colors
        const material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
        // Ajouter des rochers et arbres sur les flancs (optionnel, à améliorer ensuite)
        this.addRocks();
        this.addSkyDome(); // Ajout du ciel réaliste
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
    
    addSkyDome() {
        // SkyDome avec dégradé vertical
        const geometry = new THREE.SphereGeometry(500, 32, 15);
        // Shader material pour dégradé
        const material = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: {
                topColor: { value: new THREE.Color(0x4a90e2) }, // Bleu profond
                bottomColor: { value: new THREE.Color(0xbbefff) }, // Bleu clair
                offset: { value: 400 },
                exponent: { value: 0.8 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    float t = pow(max(h, 0.0), exponent);
                    gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
                }
            `
        });
        const sky = new THREE.Mesh(geometry, material);
        this.scene.add(sky);
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
        // Gestion de la souris (vue à la première personne)
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body) {
                this.yaw -= event.movementX * 0.002;
                this.pitch -= event.movementY * 0.002;
                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            }
        });
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
        // Calculer la direction à partir du yaw
        const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
        const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
        const moveVector = new THREE.Vector3();
        moveVector.addScaledVector(forward, moveZ);
        moveVector.addScaledVector(right, moveX);
        if (moveVector.length() > 0) moveVector.normalize();
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
        this.playerPosition.x += this.playerVelocity.x * deltaTime;
        this.playerPosition.y += this.playerVelocity.y * deltaTime;
        this.playerPosition.z += this.playerVelocity.z * deltaTime;
        // Collision avec le terrain
        const terrainHeight = this.getTerrainHeight(this.playerPosition.x, this.playerPosition.z);
        if (this.playerPosition.y <= terrainHeight + 1) {
            this.playerPosition.y = terrainHeight + 1;
            this.playerVelocity.y = 0;
            this.playerOnGround = true;
        }
    }
    
    updateCamera() {
        // La caméra prend la position du joueur
        this.camera.position.copy(this.playerPosition).add(new THREE.Vector3(0, 1.0, 0));
        // Calculer la direction de la caméra à partir du yaw et du pitch
        const direction = new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        );
        this.camera.lookAt(this.camera.position.clone().add(direction));
    }
    
    updateUI() {
        const position = this.playerPosition;
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
} // Fin de la classe
// Démarrer l'application
new MountainExplorer();