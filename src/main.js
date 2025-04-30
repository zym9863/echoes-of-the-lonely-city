import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Append renderer to DOM
document.getElementById('app').appendChild(renderer.domElement);

// Loading manager for tracking asset loading progress
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.querySelector('.loading-bar');
const infoElement = document.getElementById('info');
const compassElement = document.getElementById('compass');
const vignetteElement = document.getElementById('vignette');

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progress = (itemsLoaded / itemsTotal) * 100;
  loadingBar.style.width = progress + '%';
};

loadingManager.onLoad = () => {
  // Smooth transition from loading screen to game
  setTimeout(() => {
    loadingScreen.classList.add('hidden');

    // Show UI elements with a delay for a smoother transition
    setTimeout(() => {
      infoElement.classList.add('visible');
      compassElement.classList.add('visible');
      vignetteElement.classList.add('visible');

      // Start controls after loading is complete
      controls.lock();
    }, 500);
  }, 1500);
};

// Camera setup
camera.position.set(0, 1.7, 0); // Eye level height

// Controls setup
const controls = new PointerLockControls(camera, document.body);
controls.pointerSpeed = 0.2;

// Add event listeners for controls
document.addEventListener('click', () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

// Hide UI when controls are locked, show when unlocked
controls.addEventListener('lock', () => {
  infoElement.classList.add('visible');
  compassElement.classList.add('visible');
});

controls.addEventListener('unlock', () => {
  infoElement.classList.remove('visible');
  compassElement.classList.remove('visible');
});

// Movement variables
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const raycaster = new THREE.Raycaster(); // For collision detection
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;
let isJumping = false;

// Key event listeners
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = true;
      break;
    case 'KeyA':
      moveLeft = true;
      break;
    case 'KeyS':
      moveBackward = true;
      break;
    case 'KeyD':
      moveRight = true;
      break;
    // Space key jump functionality removed
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
  }
});

// Create basic city environment
function createBasicCity() {
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

  // Buildings array to return
  const buildings = [];
  const flickeringLights = [];

  // Create some buildings
  for (let i = 0; i < 50; i++) {
    // Random position
    const x = Math.floor(Math.random() * 10 - 5) * 20 + (Math.random() * 5 - 2.5);
    const z = Math.floor(Math.random() * 10 - 5) * 20 + (Math.random() * 5 - 2.5);

    // Random size
    const width = 5 + Math.random() * 10;
    const depth = 5 + Math.random() * 10;
    const height = 10 + Math.random() * 40;

    // Create building
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const color = new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.1 + Math.random() * 0.2, 0.1 + Math.random() * 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7 + Math.random() * 0.3,
      metalness: 0.1 + Math.random() * 0.2
    });

    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;

    // Randomly rotate building slightly to make it look unstable
    if (Math.random() > 0.7) {
      const tiltAmount = (Math.random() * 0.1) - 0.05;
      building.rotation.z = tiltAmount;
      building.rotation.x = (Math.random() * 0.05) - 0.025;
    }

    // Add windows with flickering lights
    const windowSize = 0.8;
    const windowDepth = 0.1;
    const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, windowDepth);

    // Calculate number of windows based on building dimensions
    const windowsPerFloor = {
      x: Math.floor(width / (windowSize * 2)),
      z: Math.floor(depth / (windowSize * 2))
    };

    const floors = Math.floor(height / (windowSize * 2));

    // Add windows to the building
    for (let floor = 0; floor < floors; floor++) {
      // Only add windows to some floors
      if (Math.random() > 0.3) {
        for (let wx = 0; wx < windowsPerFloor.x; wx++) {
          // Skip some windows randomly
          if (Math.random() > 0.7) {
            // Calculate position
            const xPos = (wx * windowSize * 2) - (width / 2) + windowSize;
            const yPos = (floor * windowSize * 2) - (height / 2) + windowSize * 3;

            // Create window
            let windowMaterial;

            // Most windows are dark (broken/empty)
            if (Math.random() > 0.1) {
              windowMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.5,
                metalness: 0.8,
                emissive: 0x000000
              });
            } else {
              // Some windows have a flickering light
              const emissiveColor = new THREE.Color(0xffffaa);
              const emissiveIntensity = 0.1 + Math.random() * 0.3;

              windowMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                roughness: 0.5,
                metalness: 0.2,
                emissive: emissiveColor,
                emissiveIntensity: emissiveIntensity
              });

              // Add to flickering lights array
              flickeringLights.push({
                material: windowMaterial,
                baseIntensity: emissiveIntensity,
                flickerSpeed: 0.5 + Math.random() * 2
              });
            }

            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(xPos, yPos, depth / 2 + windowDepth / 2);
            building.add(window);
          }
        }
      }
    }

    scene.add(building);
    buildings.push(building);
  }

  // Add some debris on the ground
  for (let i = 0; i < 100; i++) {
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

    const material = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.9,
      metalness: 0.1
    });

    const debris = new THREE.Mesh(geometry, material);

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

  return {
    buildings,
    flickeringLights,
    update: function(time) {
      // Update flickering lights
      flickeringLights.forEach((light, index) => {
        // Create a unique flicker pattern for each light
        const flicker = Math.sin(time * 0.001 * light.flickerSpeed + index) * 0.2 + 0.8;
        light.material.emissiveIntensity = light.baseIntensity * flicker;
      });
    }
  };
}

// Create enhanced lighting
function createBasicLighting() {
  // Ambient light - slightly bluer for night atmosphere
  const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
  scene.add(ambientLight);

  // Directional light (moonlight) - cooler blue tone
  const moonLight = new THREE.DirectionalLight(0xb0c0ff, 0.5);
  moonLight.position.set(50, 100, 50);
  moonLight.castShadow = true;

  // Configure shadow properties
  moonLight.shadow.mapSize.width = 2048;
  moonLight.shadow.mapSize.height = 2048;
  moonLight.shadow.camera.near = 0.5;
  moonLight.shadow.camera.far = 500;
  moonLight.shadow.camera.left = -100;
  moonLight.shadow.camera.right = 100;
  moonLight.shadow.camera.top = 100;
  moonLight.shadow.camera.bottom = -100;
  moonLight.shadow.bias = -0.0003;

  // Add subtle blue tint to shadows
  moonLight.shadow.bias = -0.0003;

  scene.add(moonLight);

  // Create a subtle hemisphere light for better ambient lighting
  const hemisphereLight = new THREE.HemisphereLight(0x606080, 0x080820, 0.2);
  scene.add(hemisphereLight);

  // Add a warmer point light for contrast
  const pointLight = new THREE.PointLight(0xff6a00, 0.8, 50, 2);
  pointLight.position.set(30, 5, -40);
  pointLight.castShadow = true;

  // Improve point light shadows
  pointLight.shadow.mapSize.width = 512;
  pointLight.shadow.mapSize.height = 512;
  pointLight.shadow.camera.near = 0.5;
  pointLight.shadow.camera.far = 50;

  scene.add(pointLight);

  // Lightning effect variables
  let lightningTimer = 20 + Math.random() * 40; // Random time until first lightning
  let isLightning = false;
  let lightningDuration = 0;
  let lightningLight = new THREE.PointLight(0xaaccff, 0, 500, 1);
  lightningLight.position.set(
    (Math.random() * 200) - 100,
    100,
    (Math.random() * 200) - 100
  );
  scene.add(lightningLight);

  return {
    ambientLight,
    moonLight,
    pointLight,
    lightningLight,
    update: function(delta, time) {
      // Lightning effect
      if (isLightning) {
        lightningDuration -= delta;

        if (lightningDuration <= 0) {
          // End lightning flash
          lightningLight.intensity = 0;
          isLightning = false;
          lightningTimer = 10 + Math.random() * 30; // Random time until next lightning
        } else {
          // Flicker the lightning
          lightningLight.intensity = Math.random() * 3 + 1;
        }
      } else {
        // Count down to next lightning
        lightningTimer -= delta;

        if (lightningTimer <= 0) {
          // Start lightning flash
          isLightning = true;
          lightningDuration = 0.5 + Math.random() * 1.5;

          // Position the lightning at a random location
          lightningLight.position.set(
            (Math.random() * 300) - 150,
            100,
            (Math.random() * 300) - 150
          );

          // Initial flash
          lightningLight.intensity = 2 + Math.random() * 2;

          // Increase ambient light briefly during lightning
          ambientLight.intensity = 0.6;
        }
      }

      // Gradually return ambient light to normal after lightning
      if (ambientLight.intensity > 0.3) {
        ambientLight.intensity -= 0.01;
        if (ambientLight.intensity < 0.3) {
          ambientLight.intensity = 0.3;
        }
      }

      // Make point light flicker slightly
      pointLight.intensity = 0.8 + Math.sin(time * 0.001) * 0.2;
    }
  };
}

// Create basic fog
function createBasicFog() {
  const fog = new THREE.FogExp2(0x101010, 0.005);
  scene.fog = fog;
  scene.background = new THREE.Color(0x101010);
}

// Create skybox with stars
function createSkybox() {
  // Create a large sphere for the sky
  const skyGeometry = new THREE.SphereGeometry(400, 32, 32);

  // Create a shader material for the sky with stars
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x000918) },
      bottomColor: { value: new THREE.Color(0x101010) },
      offset: { value: 400 },
      exponent: { value: 0.6 },
      time: { value: 0 }
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
      uniform float time;

      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition + offset).y;
        float t = max(0.0, min(1.0, pow(max(0.0, h), exponent)));

        // Add stars
        float stars = 0.0;
        if (h > 0.3) {
          // Simple procedural stars
          vec2 coord = vec2(
            fract(vWorldPosition.x * 0.1),
            fract(vWorldPosition.z * 0.1 + vWorldPosition.y * 0.1)
          );

          float starVal = fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
          stars = (starVal > 0.995) ? 0.8 : 0.0;

          // Make stars twinkle
          stars *= 0.5 + 0.5 * sin(time * 5.0 + starVal * 10.0);
        }

        // Mix colors based on height and add stars
        vec3 skyColor = mix(bottomColor, topColor, t);
        skyColor += vec3(stars);

        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide
  });

  // Create the sky mesh
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  // Add a moon
  const moonGeometry = new THREE.CircleGeometry(15, 32);
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaaaff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });

  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(100, 150, -200);
  moon.lookAt(0, 0, 0);
  scene.add(moon);

  // Add a subtle glow around the moon
  const moonGlowGeometry = new THREE.CircleGeometry(25, 32);
  const moonGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x4444aa,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
  moonGlow.position.copy(moon.position);
  moonGlow.lookAt(0, 0, 0);
  scene.add(moonGlow);

  // Return objects for animation
  return {
    sky,
    skyMaterial,
    moon,
    moonGlow
  };
}

// Create weather effects
function createWeatherEffects() {
  // Rain particles
  const rainCount = 5000;
  const rainGeometry = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  const rainVelocities = new Float32Array(rainCount);

  // Create rain particles with random positions
  for (let i = 0; i < rainCount; i++) {
    const i3 = i * 3;

    // Random position in a large box above the scene
    rainPositions[i3] = (Math.random() * 400) - 200;
    rainPositions[i3 + 1] = Math.random() * 200;
    rainPositions[i3 + 2] = (Math.random() * 400) - 200;

    // Random velocity for each raindrop
    rainVelocities[i] = 0.5 + Math.random() * 0.5;
  }

  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));

  // Rain material
  const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  // Create rain particle system
  const rain = new THREE.Points(rainGeometry, rainMaterial);
  scene.add(rain);

  // Dust particles floating in the air
  const dustCount = 1000;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  const dustVelocities = new Float32Array(dustCount * 3);

  // Create dust particles with random positions
  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;

    // Random position throughout the scene
    dustPositions[i3] = (Math.random() * 200) - 100;
    dustPositions[i3 + 1] = Math.random() * 50;
    dustPositions[i3 + 2] = (Math.random() * 200) - 100;

    // Random velocity for each dust particle (very slow movement)
    dustVelocities[i3] = (Math.random() * 0.2) - 0.1;
    dustVelocities[i3 + 1] = (Math.random() * 0.1) - 0.05;
    dustVelocities[i3 + 2] = (Math.random() * 0.2) - 0.1;
  }

  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute('velocity', new THREE.BufferAttribute(dustVelocities, 3));

  // Dust material
  const dustMaterial = new THREE.PointsMaterial({
    color: 0x555555,
    size: 0.2,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  // Create dust particle system
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  return {
    rain,
    rainGeometry,
    dust,
    dustGeometry,
    update: function(delta) {
      // Update rain particles
      const rainPositionAttribute = rain.geometry.getAttribute('position');
      const rainVelocityAttribute = rain.geometry.getAttribute('velocity');

      for (let i = 0; i < rainCount; i++) {
        const i3 = i * 3;

        // Move rain downward based on velocity
        rainPositionAttribute.array[i3 + 1] -= rainVelocityAttribute.array[i] * 20 * delta;

        // Reset rain particles that go below the ground
        if (rainPositionAttribute.array[i3 + 1] < 0) {
          rainPositionAttribute.array[i3] = (Math.random() * 400) - 200;
          rainPositionAttribute.array[i3 + 1] = 200;
          rainPositionAttribute.array[i3 + 2] = (Math.random() * 400) - 200;
        }
      }

      rainPositionAttribute.needsUpdate = true;

      // Update dust particles
      const dustPositionAttribute = dust.geometry.getAttribute('position');
      const dustVelocityAttribute = dust.geometry.getAttribute('velocity');

      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;

        // Move dust based on velocity
        dustPositionAttribute.array[i3] += dustVelocityAttribute.array[i3] * delta;
        dustPositionAttribute.array[i3 + 1] += dustVelocityAttribute.array[i3 + 1] * delta;
        dustPositionAttribute.array[i3 + 2] += dustVelocityAttribute.array[i3 + 2] * delta;

        // Keep dust within bounds
        if (Math.abs(dustPositionAttribute.array[i3]) > 100) {
          dustVelocityAttribute.array[i3] *= -1;
        }

        if (dustPositionAttribute.array[i3 + 1] < 0 || dustPositionAttribute.array[i3 + 1] > 50) {
          dustVelocityAttribute.array[i3 + 1] *= -1;
        }

        if (Math.abs(dustPositionAttribute.array[i3 + 2]) > 100) {
          dustVelocityAttribute.array[i3 + 2] *= -1;
        }
      }

      dustPositionAttribute.needsUpdate = true;
    }
  };
}

// Initialize basic environment
const city = createBasicCity();
const lighting = createBasicLighting();
createBasicFog();
const skybox = createSkybox();
const weatherEffects = createWeatherEffects();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Physics variables
let prevTime = performance.now();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Calculate delta time
  const time = performance.now();
  const delta = (time - prevTime) / 1000; // Convert to seconds

  // Apply physics
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  // Keep player at eye level height
  camera.position.y = 1.7; // Fixed height, no jumping

  // Calculate movement direction
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  // Apply movement
  if (moveForward || moveBackward) velocity.z -= direction.z * 20.0 * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * 20.0 * delta;

  // Collision detection
  const collisionDistance = 1.0; // Minimum distance to obstacles
  let canMoveForward = true;
  let canMoveRight = true;

  // Get movement direction vectors
  const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

  // Function to check collision in a specific direction
  function checkCollision(direction) {
    raycaster.set(camera.position, direction);
    const intersections = raycaster.intersectObjects(city.buildings);
    return intersections.length > 0 && intersections[0].distance < collisionDistance;
  }

  // Check forward/backward collision
  if (Math.abs(velocity.z) > 0.001) {
    const moveDirection = forwardVector.clone().multiplyScalar(Math.sign(-velocity.z));

    // Cast multiple rays for better collision detection (center, left, right)
    const centerCollision = checkCollision(moveDirection);

    // Offset rays to the sides to detect wider collisions
    const offsetAmount = 0.5; // Shoulder width
    const rightOffset = new THREE.Vector3().addVectors(
      moveDirection,
      rightVector.clone().multiplyScalar(offsetAmount)
    ).normalize();

    const leftOffset = new THREE.Vector3().addVectors(
      moveDirection,
      rightVector.clone().multiplyScalar(-offsetAmount)
    ).normalize();

    const rightCollision = checkCollision(rightOffset);
    const leftCollision = checkCollision(leftOffset);

    if (centerCollision || rightCollision || leftCollision) {
      canMoveForward = false;
    }
  }

  // Check left/right collision
  if (Math.abs(velocity.x) > 0.001) {
    const moveDirection = rightVector.clone().multiplyScalar(Math.sign(-velocity.x));

    // Cast multiple rays for better collision detection (center, front, back)
    const centerCollision = checkCollision(moveDirection);

    // Offset rays to front and back to detect wider collisions
    const offsetAmount = 0.5; // Body depth
    const frontOffset = new THREE.Vector3().addVectors(
      moveDirection,
      forwardVector.clone().multiplyScalar(offsetAmount)
    ).normalize();

    const backOffset = new THREE.Vector3().addVectors(
      moveDirection,
      forwardVector.clone().multiplyScalar(-offsetAmount)
    ).normalize();

    const frontCollision = checkCollision(frontOffset);
    const backCollision = checkCollision(backOffset);

    if (centerCollision || frontCollision || backCollision) {
      canMoveRight = false;
    }
  }

  // Check diagonal collisions
  if (Math.abs(velocity.x) > 0.001 && Math.abs(velocity.z) > 0.001) {
    // Create diagonal vector based on movement direction
    const diagonalVector = new THREE.Vector3(
      rightVector.x * Math.sign(-velocity.x),
      0,
      forwardVector.z * Math.sign(-velocity.z)
    ).normalize();

    if (checkCollision(diagonalVector)) {
      // If diagonal collision, prevent both movements
      canMoveForward = false;
      canMoveRight = false;
    }
  }

  // Update controls with collision detection
  if (canMoveRight) controls.moveRight(-velocity.x * delta);
  if (canMoveForward) controls.moveForward(-velocity.z * delta);

  // No vertical movement - player stays at eye level

  // Update skybox
  if (skybox && skybox.skyMaterial) {
    skybox.skyMaterial.uniforms.time.value += delta;

    // Subtle moon movement
    const skyTime = skybox.skyMaterial.uniforms.time.value;
    if (skybox.moon) {
      skybox.moon.position.y = 150 + Math.sin(skyTime * 0.05) * 5;
      if (skybox.moonGlow) {
        skybox.moonGlow.position.copy(skybox.moon.position);
      }
    }
  }

  // Update compass based on camera rotation
  if (compassElement) {
    // Get the camera's forward direction
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; // Ignore vertical component
    forward.normalize();

    // Calculate angle in degrees (0 is north, 90 is east, etc.)
    let angle = Math.atan2(forward.x, forward.z) * (180 / Math.PI);

    // Convert to 0-360 range
    angle = (angle + 360) % 360;

    // Map angle to compass position (0-180 degrees)
    const compassPosition = (angle / 360) * 180;

    // Update compass directions position
    const compassDirections = document.getElementById('compass-directions');
    if (compassDirections) {
      compassDirections.style.transform = `translateX(${-compassPosition}px)`;
    }
  }

  // Update weather effects
  if (weatherEffects && weatherEffects.update) {
    weatherEffects.update(delta);
  }

  // Update city (flickering lights)
  if (city && city.update) {
    city.update(time);
  }

  // Update lighting (lightning effects)
  if (lighting && lighting.update) {
    lighting.update(delta, time);
  }

  // Render scene
  renderer.render(scene, camera);

  prevTime = time;
}

// Manually trigger loading complete after a short delay
setTimeout(() => {
  loadingManager.onLoad();
}, 2000);

// Start animation loop
animate();
