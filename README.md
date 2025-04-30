# Echoes of the Lonely City

[English](README.md) | [中文](README_zh.md)

## Overview

"Echoes of the Lonely City" is an atmospheric 3D web experience built with Three.js that immerses users in a desolate, abandoned cityscape. Navigate through the ruins of a once-thriving metropolis, now shrouded in darkness and mystery, as rain falls and distant lights flicker in the night.

## Features

- **Immersive 3D Environment**: Explore a detailed abandoned city with buildings, streets, and atmospheric elements
- **Dynamic Weather System**: Experience rain, fog, and dust particles that create a moody atmosphere
- **Day/Night Cycle**: A dark, night-time environment with a starry sky and subtle lighting
- **Realistic Lighting**: Dynamic lighting system with flickering lights, moonlight, and occasional lightning
- **First-Person Controls**: Navigate the environment using WASD keys and mouse look
- **Collision Detection**: Realistic movement with collision detection to prevent walking through buildings
- **Atmospheric UI**: Minimalist UI with a compass to help with navigation
- **Responsive Design**: Adapts to different screen sizes and resolutions

## Technical Details

- Built with Three.js for 3D rendering
- Uses Pointer Lock Controls for first-person camera movement
- Custom shaders for sky and weather effects
- Raycasting for collision detection
- Vite as the build tool for fast development and optimized production builds

## Controls

- **W, A, S, D** - Move forward, left, backward, right
- **Mouse** - Look around
- **Click** - Lock/unlock mouse pointer

## Installation

1. Clone the repository:
```bash
git clone https://github.com/zym9863/echoes-of-the-lonely-city.git
cd echoes-of-the-lonely-city
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview the production build:
```bash
npm run preview
```

## Project Structure

- `/src` - Source code
  - `/city` - City generation and building components
  - `/effects` - Weather and visual effects
  - `/lighting` - Lighting system components
  - `main.js` - Main application entry point
  - `style.css` - Global styles

## Technologies Used

- [Three.js](https://threejs.org/) - 3D library
- [Vite](https://vitejs.dev/) - Build tool
- JavaScript (ES6+)
- HTML5 & CSS3

## Performance Considerations

The application uses various optimization techniques:
- Efficient raycasting for collision detection
- Proper shadow map configurations
- Optimized particle systems for weather effects
- Responsive rendering based on device capabilities

## Future Enhancements

- More interactive elements in the environment
- Additional weather conditions and time-of-day variations
- Performance optimizations for mobile devices

## License

[MIT License](LICENSE)

## Acknowledgements

- Three.js community for documentation and examples
- Inspiration from post-apocalyptic urban environments in various media
