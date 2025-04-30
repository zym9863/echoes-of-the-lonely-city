import * as THREE from 'three';

/**
 * Creates weather effects for the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Object} Weather effects object with update method
 */
export function createWeatherEffects(scene) {
  // Rain particles
  const rainCount = 10000;
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
  
  // Fog particles (mist near the ground)
  const fogCount = 500;
  const fogGeometry = new THREE.BufferGeometry();
  const fogPositions = new Float32Array(fogCount * 3);
  
  // Create fog particles with random positions
  for (let i = 0; i < fogCount; i++) {
    const i3 = i * 3;
    
    // Random position near the ground
    fogPositions[i3] = (Math.random() * 300) - 150;
    fogPositions[i3 + 1] = Math.random() * 3; // Low to the ground
    fogPositions[i3 + 2] = (Math.random() * 300) - 150;
  }
  
  fogGeometry.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3));
  
  // Fog material
  const fogMaterial = new THREE.PointsMaterial({
    color: 0x444444,
    size: 5,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  
  // Create fog particle system
  const fog = new THREE.Points(fogGeometry, fogMaterial);
  scene.add(fog);
  
  // Dust particles floating in the air
  const dustCount = 2000;
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
  
  // Update method for the weather effects
  function update(delta) {
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
    
    // Animate fog (subtle movement)
    fog.rotation.y += 0.001 * delta;
  }
  
  // Return the weather effects object
  return {
    rain,
    fog,
    dust,
    update
  };
}
