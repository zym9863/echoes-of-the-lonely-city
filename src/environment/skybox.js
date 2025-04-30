import * as THREE from 'three';

/**
 * Creates a skybox for the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Object} Skybox object with update method
 */
export function createSkybox(scene) {
  // Create a large sphere for the sky
  const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
  
  // Create a shader material for the sky
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
        
        // Add some subtle movement to simulate clouds
        float noise = sin(vWorldPosition.x * 0.01 + time * 0.05) * 
                      sin(vWorldPosition.z * 0.01 + time * 0.03) * 0.1;
        
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
        vec3 skyColor = mix(bottomColor, topColor, t + noise);
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
  
  // Update method for the skybox
  function update(delta) {
    // Update time uniform for sky shader
    skyMaterial.uniforms.time.value += delta;
    
    // Subtle moon movement
    const time = skyMaterial.uniforms.time.value;
    moon.position.y = 150 + Math.sin(time * 0.05) * 5;
    moonGlow.position.copy(moon.position);
  }
  
  // Return the skybox object
  return {
    sky,
    moon,
    update
  };
}
