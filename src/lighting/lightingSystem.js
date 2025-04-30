import * as THREE from 'three';

/**
 * Creates a dynamic lighting system for the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Object} Lighting system with update method
 */
export function createLighting(scene) {
  // Ambient light (dim, bluish for night atmosphere)
  const ambientLight = new THREE.AmbientLight(0x202030, 0.3);
  scene.add(ambientLight);
  
  // Main directional light (moonlight)
  const moonLight = new THREE.DirectionalLight(0xc0c0ff, 0.5);
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
  
  scene.add(moonLight);
  
  // Add some point lights to simulate distant lights or fires
  const pointLights = [];
  
  // Create several point lights with different colors
  const lightColors = [
    0xff5500, // Orange/fire
    0xffffaa, // Warm yellow
    0x0066ff, // Blue
    0xff00ff  // Purple
  ];
  
  // Positions for the point lights
  const lightPositions = [
    new THREE.Vector3(30, 5, -40),
    new THREE.Vector3(-50, 10, 20),
    new THREE.Vector3(10, 3, 60),
    new THREE.Vector3(-20, 15, -30)
  ];
  
  // Create the point lights
  for (let i = 0; i < lightColors.length; i++) {
    const light = new THREE.PointLight(
      lightColors[i],
      0.8,  // Intensity
      50,   // Distance
      2     // Decay
    );
    
    light.position.copy(lightPositions[i]);
    light.castShadow = true;
    
    // Configure shadow properties
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;
    light.shadow.bias = -0.001;
    
    scene.add(light);
    pointLights.push({
      light,
      initialIntensity: light.intensity,
      flickerSpeed: 0.5 + Math.random() * 2
    });
  }
  
  // Spotlight to simulate a searchlight or helicopter light
  const spotLight = new THREE.SpotLight(0xffffff, 1.5, 100, Math.PI / 6, 0.5, 1);
  spotLight.position.set(0, 50, 0);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 100;
  spotLight.shadow.bias = -0.001;
  
  // Target for the spotlight
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(0, 0, 0);
  scene.add(spotLightTarget);
  spotLight.target = spotLightTarget;
  
  scene.add(spotLight);
  
  // Lightning effect variables
  let lightningTimer = 20 + Math.random() * 40; // Random time until first lightning
  let isLightning = false;
  let lightningDuration = 0;
  let lightningLight = null;
  
  // Create lightning flash light
  function createLightningEffect() {
    if (lightningLight === null) {
      lightningLight = new THREE.PointLight(0xaaccff, 0, 500, 1);
      lightningLight.position.set(
        (Math.random() * 200) - 100,
        100,
        (Math.random() * 200) - 100
      );
      scene.add(lightningLight);
    }
    
    return lightningLight;
  }
  
  // Update method for the lighting system
  function update(time) {
    // Update point lights (flicker effect)
    pointLights.forEach((pointLight, index) => {
      // Create a unique flicker pattern for each light
      const flicker = Math.sin(time * 0.001 * pointLight.flickerSpeed + index) * 0.2 + 0.8;
      pointLight.light.intensity = pointLight.initialIntensity * flicker;
    });
    
    // Move spotlight in a circular pattern
    const spotlightRadius = 80;
    const spotlightSpeed = 0.0002;
    const spotlightX = Math.sin(time * spotlightSpeed) * spotlightRadius;
    const spotlightZ = Math.cos(time * spotlightSpeed) * spotlightRadius;
    
    spotLightTarget.position.set(spotlightX, 0, spotlightZ);
    
    // Lightning effect
    if (isLightning) {
      lightningDuration -= 0.16;
      
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
      lightningTimer -= 0.16;
      
      if (lightningTimer <= 0) {
        // Start lightning flash
        isLightning = true;
        lightningDuration = 0.5 + Math.random() * 1.5;
        
        // Position the lightning at a random location
        const lightning = createLightningEffect();
        lightning.position.set(
          (Math.random() * 300) - 150,
          100,
          (Math.random() * 300) - 150
        );
        
        // Initial flash
        lightning.intensity = 2 + Math.random() * 2;
        
        // Increase ambient light briefly during lightning
        ambientLight.intensity = 0.6;
        
        // Play thunder sound (if audio system is implemented)
        // playThunderSound();
      }
    }
    
    // Gradually return ambient light to normal after lightning
    if (ambientLight.intensity > 0.3) {
      ambientLight.intensity -= 0.01;
      if (ambientLight.intensity < 0.3) {
        ambientLight.intensity = 0.3;
      }
    }
  }
  
  // Return the lighting system object
  return {
    ambientLight,
    moonLight,
    pointLights,
    spotLight,
    update
  };
}
