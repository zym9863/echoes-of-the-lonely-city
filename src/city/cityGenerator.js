import * as THREE from 'three';

/**
 * Creates a desolate city environment
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.LoadingManager} loadingManager - Loading manager for tracking progress
 * @returns {Object} City object with methods for interaction
 */
export function createCity(scene, loadingManager) {
  // Ground
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  // Buildings array
  const buildings = [];
  
  // Create random buildings
  for (let i = 0; i < 50; i++) {
    createRandomBuilding(scene, buildings);
  }
  
  // Create streets
  createStreets(scene);
  
  // Create debris and details
  createDebris(scene);
  
  return {
    buildings,
    update: (delta) => {
      // Any animations or updates to the city can go here
    }
  };
}

/**
 * Creates a random building
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Array} buildings - Array to store building references
 */
function createRandomBuilding(scene, buildings) {
  // Random position (grid-like arrangement with some randomness)
  const gridSize = 20;
  const x = Math.floor(Math.random() * 10 - 5) * gridSize + (Math.random() * 5 - 2.5);
  const z = Math.floor(Math.random() * 10 - 5) * gridSize + (Math.random() * 5 - 2.5);
  
  // Random size
  const width = 5 + Math.random() * 10;
  const depth = 5 + Math.random() * 10;
  const height = 10 + Math.random() * 40;
  
  // Create building geometry
  const geometry = new THREE.BoxGeometry(width, height, depth);
  
  // Create material with random color (dark, muted tones)
  const hue = 0.05 + Math.random() * 0.1; // Brownish/grayish
  const saturation = 0.1 + Math.random() * 0.2; // Low saturation
  const lightness = 0.1 + Math.random() * 0.2; // Dark
  
  const color = new THREE.Color().setHSL(hue, saturation, lightness);
  
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7 + Math.random() * 0.3,
    metalness: 0.1 + Math.random() * 0.2
  });
  
  // Create mesh
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  
  // Add some damage/destruction to buildings
  addBuildingDamage(building);
  
  // Add windows
  addWindows(building, width, height, depth);
  
  scene.add(building);
  buildings.push(building);
}

/**
 * Adds damage effects to buildings
 * @param {THREE.Mesh} building - The building mesh
 */
function addBuildingDamage(building) {
  // Randomly rotate building slightly to make it look unstable
  if (Math.random() > 0.7) {
    const tiltAmount = (Math.random() * 0.1) - 0.05;
    building.rotation.z = tiltAmount;
    building.rotation.x = (Math.random() * 0.05) - 0.025;
  }
  
  // TODO: Add more damage effects like holes, cracks, etc.
  // This would require custom geometry manipulation or additional meshes
}

/**
 * Adds windows to buildings
 * @param {THREE.Mesh} building - The building mesh
 * @param {number} width - Building width
 * @param {number} height - Building height
 * @param {number} depth - Building depth
 */
function addWindows(building, width, height, depth) {
  // Window parameters
  const windowSize = 0.8;
  const windowDepth = 0.1;
  const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, windowDepth);
  
  // Create window groups for each side of the building
  const windowGroups = [];
  
  // Calculate number of windows based on building dimensions
  const windowsPerFloor = {
    x: Math.floor(width / (windowSize * 2)),
    z: Math.floor(depth / (windowSize * 2))
  };
  
  const floors = Math.floor(height / (windowSize * 2));
  
  // Window material - mostly dark with some random lights
  const createWindowMaterial = () => {
    // Most windows are dark (broken/empty)
    if (Math.random() > 0.1) {
      return new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.5,
        metalness: 0.8,
        emissive: 0x000000
      });
    } else {
      // Some windows have a dim light
      const emissiveIntensity = 0.1 + Math.random() * 0.3;
      return new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.5,
        metalness: 0.2,
        emissive: new THREE.Color(0xffffaa),
        emissiveIntensity: emissiveIntensity
      });
    }
  };
  
  // Create windows for front and back sides
  for (let floor = 0; floor < floors; floor++) {
    for (let wx = 0; wx < windowsPerFloor.x; wx++) {
      // Skip some windows randomly to create more variation
      if (Math.random() > 0.8) continue;
      
      // Calculate position
      const xPos = (wx * windowSize * 2) - (width / 2) + windowSize;
      const yPos = (floor * windowSize * 2) - (height / 2) + windowSize * 3;
      
      // Front windows
      const frontWindow = new THREE.Mesh(windowGeometry, createWindowMaterial());
      frontWindow.position.set(xPos, yPos, depth / 2 + windowDepth / 2);
      building.add(frontWindow);
      
      // Back windows
      const backWindow = new THREE.Mesh(windowGeometry, createWindowMaterial());
      backWindow.position.set(xPos, yPos, -depth / 2 - windowDepth / 2);
      building.add(backWindow);
    }
  }
  
  // Create windows for left and right sides
  for (let floor = 0; floor < floors; floor++) {
    for (let wz = 0; wz < windowsPerFloor.z; wz++) {
      // Skip some windows randomly
      if (Math.random() > 0.8) continue;
      
      // Calculate position
      const zPos = (wz * windowSize * 2) - (depth / 2) + windowSize;
      const yPos = (floor * windowSize * 2) - (height / 2) + windowSize * 3;
      
      // Left windows
      const leftWindow = new THREE.Mesh(windowGeometry, createWindowMaterial());
      leftWindow.position.set(-width / 2 - windowDepth / 2, yPos, zPos);
      leftWindow.rotation.y = Math.PI / 2;
      building.add(leftWindow);
      
      // Right windows
      const rightWindow = new THREE.Mesh(windowGeometry, createWindowMaterial());
      rightWindow.position.set(width / 2 + windowDepth / 2, yPos, zPos);
      rightWindow.rotation.y = Math.PI / 2;
      building.add(rightWindow);
    }
  }
}

/**
 * Creates streets between buildings
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createStreets(scene) {
  // Main streets
  const streetWidth = 8;
  const streetLength = 200;
  
  // Street material
  const streetMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
    metalness: 0.1
  });
  
  // Create north-south streets
  for (let i = -2; i <= 2; i++) {
    const streetGeometry = new THREE.PlaneGeometry(streetWidth, streetLength);
    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.rotation.x = -Math.PI / 2;
    street.position.set(i * 20, 0.01, 0); // Slightly above ground to prevent z-fighting
    street.receiveShadow = true;
    scene.add(street);
  }
  
  // Create east-west streets
  for (let i = -2; i <= 2; i++) {
    const streetGeometry = new THREE.PlaneGeometry(streetLength, streetWidth);
    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, 0.01, i * 20); // Slightly above ground to prevent z-fighting
    street.receiveShadow = true;
    scene.add(street);
  }
  
  // Add street details like cracks and debris
  addStreetDetails(scene);
}

/**
 * Adds details to streets
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addStreetDetails(scene) {
  // Add cracks to streets
  const crackMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 1.0,
    metalness: 0.0
  });
  
  // Add some random cracks
  for (let i = 0; i < 30; i++) {
    const crackWidth = 0.2 + Math.random() * 0.8;
    const crackLength = 2 + Math.random() * 10;
    
    const crackGeometry = new THREE.PlaneGeometry(crackWidth, crackLength);
    const crack = new THREE.Mesh(crackGeometry, crackMaterial);
    
    // Random position on streets
    const x = (Math.random() * 200) - 100;
    const z = (Math.random() * 200) - 100;
    
    crack.rotation.x = -Math.PI / 2;
    crack.rotation.z = Math.random() * Math.PI;
    crack.position.set(x, 0.02, z); // Slightly above streets
    
    scene.add(crack);
  }
}

/**
 * Creates debris and small details
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createDebris(scene) {
  // Create various debris objects
  const debrisMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.9,
    metalness: 0.1
  });
  
  // Add concrete rubble piles
  for (let i = 0; i < 50; i++) {
    const size = 0.5 + Math.random() * 2;
    
    // Use different geometries for variety
    let geometry;
    const geoType = Math.floor(Math.random() * 3);
    
    if (geoType === 0) {
      geometry = new THREE.BoxGeometry(size, size * 0.5, size);
    } else if (geoType === 1) {
      geometry = new THREE.ConeGeometry(size * 0.7, size, 4);
    } else {
      geometry = new THREE.TetrahedronGeometry(size * 0.7);
    }
    
    const debris = new THREE.Mesh(geometry, debrisMaterial);
    
    // Random position
    const x = (Math.random() * 180) - 90;
    const z = (Math.random() * 180) - 90;
    
    debris.position.set(x, size * 0.25, z);
    debris.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    debris.castShadow = true;
    debris.receiveShadow = true;
    
    scene.add(debris);
  }
}
