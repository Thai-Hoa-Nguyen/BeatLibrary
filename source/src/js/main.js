// DOM Elements
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const canvasContainer = document.getElementById('canvas-container');
const infoPanel = document.getElementById('info-panel');
const loadingScreen = document.querySelector('.loading-screen');

// Three.js Variables
let scene, camera, renderer, controls;
let logoObject, raycaster, mouse;
let objectsToUpdate = [];
let hoveredObject = null;
let clock = new THREE.Clock();

// CANNON.js Physics World
let world;
let lastCallTime;
const timeStep = 1/60;

// Artist and Song Objects
let artistObjects = [];
let songObjects = [];

// Initialize the application
function init() {
    // Initialize Three.js Scene
    initThree();
    
    // Initialize CANNON.js Physics
    initCannon();
    
    // Create the central logo
    createLogo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
    
    // Hide loading screen after initialization
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500);
}

// Initialize Three.js scene, camera, renderer
function initThree() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    canvasContainer.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x4285f4, 1, 100);
    pointLight1.position.set(10, 10, 10);
    pointLight1.castShadow = true;
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xea4335, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    pointLight2.castShadow = true;
    scene.add(pointLight2);
    
    // Setup raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize CANNON.js physics world
function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, 0, 0); // Zero gravity for space-like environment
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.contactEquationStiffness = 1e6;
    world.defaultContactMaterial.contactEquationRelaxation = 3;
    
    // Create a physics material
    const physicsMaterial = new CANNON.Material('physicsMaterial');
    const physicsContactMaterial = new CANNON.ContactMaterial(
        physicsMaterial,
        physicsMaterial,
        {
            friction: 0.0,
            restitution: 0.7
        }
    );
    world.addContactMaterial(physicsContactMaterial);
}

// Create the central logo (torus knot)
function createLogo() {
    const geometry = new THREE.TorusKnotGeometry(2, 0.6, 100, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4285f4,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x4285f4,
        emissiveIntensity: 0.2
    });
    
    logoObject = new THREE.Mesh(geometry, material);
    logoObject.castShadow = true;
    logoObject.receiveShadow = true;
    scene.add(logoObject);
    
    // Add a point light at the center of the logo
    const logoLight = new THREE.PointLight(0x4285f4, 2, 10);
    logoLight.position.set(0, 0, 0);
    scene.add(logoLight);
}

// Setup event listeners for user interaction
function setupEventListeners() {
    // Mouse move for hover effects
    window.addEventListener('mousemove', (event) => {
        // Update mouse position for raycasting
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Check for hover
        checkHover();
    });
    
    // Mouse click for object interaction
    window.addEventListener('click', (event) => {
        if (hoveredObject && hoveredObject.userData) {
            // Apply physics impulse to the clicked object
            if (hoveredObject.userData.body) {
                const impulseStrength = 5;
                const impulseVector = new CANNON.Vec3(
                    (Math.random() - 0.5) * impulseStrength,
                    (Math.random() - 0.5) * impulseStrength,
                    (Math.random() - 0.5) * impulseStrength
                );
                hoveredObject.userData.body.applyImpulse(impulseVector, hoveredObject.userData.body.position);
            }
            
            // Open URL if available
            if (hoveredObject.userData.url) {
                window.open(hoveredObject.userData.url, '_blank');
            }
        }
    });
    
    // Search input event
    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        updateSearch(searchTerm);
    });
    
    // Search button click
    searchButton.addEventListener('click', () => {
        const searchTerm = searchBar.value.toLowerCase();
        updateSearch(searchTerm);
    });
}

// Check if mouse is hovering over an object
function checkHover() {
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects([...artistObjects, ...songObjects]);
    
    // Reset previously hovered object
    if (hoveredObject) {
        hoveredObject.material.emissiveIntensity = 0.2;
        infoPanel.classList.remove('visible');
        hoveredObject = null;
    }
    
    // Set new hovered object
    if (intersects.length > 0) {
        hoveredObject = intersects[0].object;
        hoveredObject.material.emissiveIntensity = 0.5;
        
        // Show info panel with object details
        if (hoveredObject.userData) {
            showInfoPanel(hoveredObject.userData);
        }
    }
}

// Show info panel with object details
function showInfoPanel(data) {
    let html = '';
    
    if (data.type === 'artist') {
        html = `
            <h3>${data.name}</h3>
            <p>Artist</p>
            <p>Click to visit: ${data.urls.map(u => u.name).join(', ')}</p>
        `;
    } else if (data.type === 'song') {
        html = `
            <h3>${data.title}</h3>
            <p>By: ${data.artistName}</p>
            <p>Genre: ${data.genre}</p>
            <p>Duration: ${formatDuration(data.duration)}</p>
            <p>${data.hashtag}</p>
        `;
    }
    
    document.querySelector('.info-content').innerHTML = html;
    infoPanel.classList.add('visible');
}

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Create a 3D object for an artist
function createArtistObject(artist) {
    // Create sphere geometry for artists
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Create material with artist image as texture
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x4285f4,
        emissiveIntensity: 0.2
    });
    
    // Load artist avatar as texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        artist.avatar,
        (texture) => {
            material.map = texture;
            material.needsUpdate = true;
        },
        undefined,
        (err) => {
            console.error('Error loading texture:', err);
        }
    );
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store artist data in the mesh
    mesh.userData = {
        type: 'artist',
        artistId: artist.artistId,
        name: artist.name,
        urls: artist.urls,
        url: artist.urls[0].url // Use first URL as default
    };
    
    // Random position within a sphere
    const radius = 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    mesh.position.set(x, y, z);
    
    // Add to scene
    scene.add(mesh);
    artistObjects.push(mesh);
    
    // Create physics body
    const shape = new CANNON.Sphere(1);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(x, y, z),
        shape: shape,
        material: new CANNON.Material('physicsMaterial')
    });
    
    // Add some initial velocity
    body.velocity.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
    );
    
    world.addBody(body);
    
    // Connect the mesh and body
    mesh.userData.body = body;
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
    
    return mesh;
}

// Create a 3D object for a song
function createSongObject(song, artistName) {
    // Different geometries for songs based on genre
    let geometry;
    const size = 0.8;
    
    if (song.genre.includes('Drill')) {
        geometry = new THREE.TetrahedronGeometry(size);
    } else if (song.genre.includes('HyperPop')) {
        geometry = new THREE.OctahedronGeometry(size);
    } else if (song.genre.includes('Epic') || song.genre.includes('Cinematic')) {
        geometry = new THREE.DodecahedronGeometry(size);
    } else if (song.genre.includes('Jersey')) {
        geometry = new THREE.IcosahedronGeometry(size);
    } else {
        geometry = new THREE.BoxGeometry(size, size, size);
    }
    
    // Create material with color based on genre
    let color;
    if (song.genre.includes('Drill')) {
        color = 0xea4335; // Red
    } else if (song.genre.includes('HyperPop')) {
        color = 0xfbbc05; // Yellow
    } else if (song.genre.includes('Epic') || song.genre.includes('Cinematic')) {
        color = 0x4285f4; // Blue
    } else if (song.genre.includes('Jersey')) {
        color = 0x34a853; // Green
    } else {
        color = 0x9c27b0; // Purple
    }
    
    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.2
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store song data in the mesh
    mesh.userData = {
        type: 'song',
        songId: song.songId,
        artistId: song.artistId,
        artistName: artistName,
        title: song.title,
        genre: song.genre,
        hashtag: song.hashtag,
        duration: song.duration,
        url: song.youtubeUrl
    };
    
    // Random position within a sphere
    const radius = 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    mesh.position.set(x, y, z);
    
    // Add to scene
    scene.add(mesh);
    songObjects.push(mesh);
    
    // Create physics body based on geometry type
    let shape;
    if (geometry.type.includes('TetrahedronGeometry')) {
        shape = new CANNON.Box(new CANNON.Vec3(size, size, size));
    } else if (geometry.type.includes('OctahedronGeometry')) {
        shape = new CANNON.Box(new CANNON.Vec3(size, size, size));
    } else if (geometry.type.includes('DodecahedronGeometry')) {
        shape = new CANNON.Box(new CANNON.Vec3(size, size, size));
    } else if (geometry.type.includes('IcosahedronGeometry')) {
        shape = new CANNON.Box(new CANNON.Vec3(size, size, size));
    } else {
        shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
    }
    
    const body = new CANNON.Body({
        mass: 0.8,
        position: new CANNON.Vec3(x, y, z),
        shape: shape,
        material: new CANNON.Material('physicsMaterial')
    });
    
    // Add some initial velocity
    body.velocity.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
    );
    
    world.addBody(body);
    
    // Connect the mesh and body
    mesh.userData.body = body;
    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
    
    return mesh;
}

// Update search results based on search term
function updateSearch(searchTerm) {
    // Clear previous objects
    clearObjects();
    
    if (searchTerm.length < 2) {
        return;
    }
    
    // Update background mood based on search term
    updateBackgroundMood(searchTerm);
    
    // Filter artists and songs based on search term
    const filteredArtists = window.artists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm)
    );
    
    const filteredSongs = window.songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.genre.toLowerCase().includes(searchTerm) || 
        song.hashtag.toLowerCase().includes(searchTerm)
    );
    
    // Create 3D objects for filtered artists
    filteredArtists.forEach(artist => {
        createArtistObject(artist);
    });
    
    // Create 3D objects for filtered songs
    filteredSongs.forEach(song => {
        // Find artist name for the song
        const artist = window.artists.find(a => a.artistId === song.artistId);
        const artistName = artist ? artist.name : 'Unknown Artist';
        
        createSongObject(song, artistName);
    });
}

// Clear all 3D objects except the logo
function clearObjects() {
    // Remove artist objects
    artistObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.userData.body) {
            world.removeBody(obj.userData.body);
        }
    });
    
    // Remove song objects
    songObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.userData.body) {
            world.removeBody(obj.userData.body);
        }
    });
    
    // Clear arrays
    artistObjects = [];
    songObjects = [];
    objectsToUpdate = [];
}

// Update background mood based on search term
function updateBackgroundMood(searchTerm) {
    let color1, color2;
    
    if (searchTerm.includes('drill')) {
        color1 = 'rgba(30, 40, 70, 0.8)';
        color2 = 'rgba(10, 14, 23, 0.95)';
    } else if (searchTerm.includes('hyperpop') || searchTerm.includes('pop')) {
        color1 = 'rgba(70, 30, 70, 0.8)';
        color2 = 'rgba(23, 10, 23, 0.95)';
    } else if (searchTerm.includes('epic') || searchTerm.includes('cinematic')) {
        color1 = 'rgba(30, 70, 70, 0.8)';
        color2 = 'rgba(10, 23, 23, 0.95)';
    } else if (searchTerm.includes('jersey')) {
        color1 = 'rgba(70, 70, 30, 0.8)';
        color2 = 'rgba(23, 23, 10, 0.95)';
    } else {
        color1 = 'rgba(30, 40, 70, 0.8)';
        color2 = 'rgba(10, 14, 23, 0.95)';
    }
    
    document.querySelector('.background-gradient').style.background = 
        `radial-gradient(circle at center, ${color1} 0%, ${color2} 70%)`;
}

// Apply force field to keep objects near the center
function applyForceField() {
    objectsToUpdate.forEach(object => {
        const body = object.body;
        const position = body.position;
        
        // Calculate distance from center
        const distance = Math.sqrt(
            position.x * position.x + 
            position.y * position.y + 
            position.z * position.z
        );
        
        // Apply force towards center if too far
        if (distance > 12) {
            const forceMagnitude = 10 * (distance - 12);
            const forceVector = new CANNON.Vec3(
                -position.x * forceMagnitude / distance,
                -position.y * forceMagnitude / distance,
                -position.z * forceMagnitude / distance
            );
            
            body.applyForce(forceVector, body.position);
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update physics
    const time = performance.now() / 1000;
    if (!lastCallTime) {
        world.step(timeStep);
    } else {
        const dt = Math.min(time - lastCallTime, 0.1);
        world.step(timeStep, dt);
    }
    lastCallTime = time;
    
    // Apply force field to keep objects near center
    applyForceField();
    
    // Update 3D objects from physics
    objectsToUpdate.forEach(object => {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    });
    
    // Rotate logo
    if (logoObject) {
        logoObject.rotation.x += 0.005;
        logoObject.rotation.y += 0.01;
    }
    
    // Slowly rotate camera around the scene
    const cameraRadius = 15;
    const cameraSpeed = 0.1;
    const cameraAngle = clock.getElapsedTime() * cameraSpeed;
    
    camera.position.x = cameraRadius * Math.sin(cameraAngle);
    camera.position.z = cameraRadius * Math.cos(cameraAngle);
    camera.lookAt(0, 0, 0);
    
    // Render scene
    renderer.render(scene, camera);
}

// Initialize the application when the window loads
window.addEventListener('load', init); 