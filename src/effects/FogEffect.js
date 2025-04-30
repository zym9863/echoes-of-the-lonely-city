import * as THREE from 'three';

/**
 * Creates a dynamic fog effect for the scene
 */
export class FogEffect {
  /**
   * Constructor for the FogEffect class
   * @param {THREE.Scene} scene - The Three.js scene
   */
  constructor(scene) {
    this.scene = scene;
    this.fog = null;
    this.density = 0.005;
    this.fogColor = new THREE.Color(0x101010);
    this.targetDensity = this.density;
    this.densityChangeSpeed = 0.0001;
    this.time = 0;
  }
  
  /**
   * Sets the fog parameters
   * @param {number} density - Fog density
   * @param {number} near - Near distance where fog starts
   * @param {THREE.Color} color - Fog color
   */
  setFog(density, near, color) {
    this.density = density;
    this.targetDensity = density;
    this.fogColor = color;
    
    // Create exponential fog
    this.fog = new THREE.FogExp2(this.fogColor, this.density);
    this.scene.fog = this.fog;
    
    // Set background color to match fog
    this.scene.background = this.fogColor.clone();
  }
  
  /**
   * Updates the fog effect
   * @param {number} delta - Time delta
   */
  update(delta) {
    this.time += delta;
    
    // Subtle density variation over time
    const densityVariation = Math.sin(this.time * 0.05) * 0.001;
    this.fog.density = this.density + densityVariation;
    
    // Gradually change density to target
    if (this.fog.density !== this.targetDensity) {
      if (this.fog.density < this.targetDensity) {
        this.fog.density += this.densityChangeSpeed * delta;
        if (this.fog.density > this.targetDensity) {
          this.fog.density = this.targetDensity;
        }
      } else {
        this.fog.density -= this.densityChangeSpeed * delta;
        if (this.fog.density < this.targetDensity) {
          this.fog.density = this.targetDensity;
        }
      }
    }
    
    // Subtle color variation
    const hue = this.fogColor.getHSL({}).h;
    const saturation = this.fogColor.getHSL({}).s;
    const lightness = this.fogColor.getHSL({}).l + Math.sin(this.time * 0.1) * 0.02;
    
    this.fog.color.setHSL(hue, saturation, lightness);
    this.scene.background.copy(this.fog.color);
  }
  
  /**
   * Increases fog density
   * @param {number} amount - Amount to increase density
   */
  increaseDensity(amount) {
    this.targetDensity += amount;
    if (this.targetDensity > 0.05) {
      this.targetDensity = 0.05; // Maximum density
    }
  }
  
  /**
   * Decreases fog density
   * @param {number} amount - Amount to decrease density
   */
  decreaseDensity(amount) {
    this.targetDensity -= amount;
    if (this.targetDensity < 0.001) {
      this.targetDensity = 0.001; // Minimum density
    }
  }
}
