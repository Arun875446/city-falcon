// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// import GUI from "lil-gui";

// /**
//  * Base
//  */
// // Debug
// const gui = new GUI();

// // Canvas
// const canvas = document.querySelector("canvas.webgl");

// // Scene
// const scene = new THREE.Scene();

// /**
//  * Floor
//  */
// const floor = new THREE.Mesh(
//   new THREE.PlaneGeometry(30, 30),
//   new THREE.MeshStandardMaterial({
//     color: "pink",
//     metalness: 0,
//     roughness: 0.5,
//   })
// );
// floor.receiveShadow = true;
// floor.side = THREE.DoubleSide;
// floor.rotation.x = -Math.PI * 0.5;
// floor.position.y = -0.5;
// scene.add(floor);

// /**
//  * Lights
//  */
// const ambientLight = new THREE.AmbientLight("white", 1);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight("white", 3);
// directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.set(1024, 1024);
// directionalLight.shadow.camera.far = 15;
// directionalLight.shadow.camera.left = -7;
// directionalLight.shadow.camera.top = 7;
// directionalLight.shadow.camera.right = 7;
// directionalLight.shadow.camera.bottom = -7;
// directionalLight.position.set(0, 5, 3);
// scene.add(directionalLight);

// /**
//  * Sizes
//  */
// const sizes = {
//   width: window.innerWidth,
//   height: window.innerHeight,
// };

// window.addEventListener("resize", () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// });

// /**
//  * Camera
//  */
// // Base camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   100
// );
// camera.position.set(2, 2, 2);
// scene.add(camera);

// // Controls
// const controls = new OrbitControls(camera, canvas);

// controls.enableDamping = true;
// controls.enablePan = false;

// /**
//  * Renderer
//  */
// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
// });
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.setSize(sizes.width, sizes.height);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// const dracoLoader = new DRACOLoader();
// // dracoLoader.setDecoderPath("/draco/");
// const gltfLoader = new GLTFLoader();
// // gltfLoader.setDRACOLoader(dracoLoader);

// let city = null;
// gltfLoader.load("/models/VirtualCity/VirtualCity.gltf", (gltf) => {
//   scene.add(gltf.scene);
//   city = gltf.scene;
//   // gltf.scene.castShadow = true;

//   console.log(gltf.scene.scale);

//   // console.log(gltf.scene.castShadow);
// });

// /**
//  * Animate
//  */
// const clock = new THREE.Clock();
// let previousTime = 0;

// // const tick = () => {
// //   const elapsedTime = clock.getElapsedTime();
// //   const deltaTime = elapsedTime - previousTime;
// //   previousTime = elapsedTime;

// //   // Update controls
// //   controls.update();

// //   // Render
// //   renderer.render(scene, camera);

// //   // Call tick again on the next frame
// //   window.requestAnimationFrame(tick);
// // };

// // tick();

// // Particles
// const particleCount = 1000; // Number of particles
// const particleGeometry = new THREE.BufferGeometry();
// const particlePositions = new Float32Array(particleCount * 3); // x, y, z for each particle

// // Set random initial positions for the particles
// for (let i = 0; i < particleCount; i++) {
//   particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 30; // x
//   particlePositions[i * 3 + 1] = Math.random() * 10; // y
//   particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
// }

// particleGeometry.setAttribute(
//   "position",
//   new THREE.BufferAttribute(particlePositions, 3)
// );

// // Particle material
// const particleMaterial = new THREE.PointsMaterial({
//   size: 0.1,
//   sizeAttenuation: true,
//   color: "white",
//   transparent: true,
//   opacity: 0.8,
// });

// // Create the particle system
// const particles = new THREE.Points(particleGeometry, particleMaterial);
// scene.add(particles);

// // Animate particles
// const particleSpeed = 0.02;
// const tick = () => {
//   const elapsedTime = clock.getElapsedTime();
//   const deltaTime = elapsedTime - previousTime;
//   previousTime = elapsedTime;

//   // Update particle positions
//   const positions = particleGeometry.attributes.position.array;
//   for (let i = 0; i < particleCount; i++) {
//     positions[i * 3 + 1] -= particleSpeed; // Move particles downward

//     // Reset particle position if it goes below the floor
//     if (positions[i * 3 + 1] < -0.5) {
//       positions[i * 3 + 1] = Math.random() * 10; // Reset to a random height
//     }
//   }
//   particleGeometry.attributes.position.needsUpdate = true;

//   // Update controls
//   controls.update();

//   // Render
//   renderer.render(scene, camera);

//   // Call tick again on the next frame
//   window.requestAnimationFrame(tick);
// };

// tick();


import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";

// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: "pink",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(0, 5, 3);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const resizeHandler = () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", resizeHandler);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * GLTF Loader
 */
const gltfLoader = new GLTFLoader();
let city = null;

gltfLoader.load("/models/VirtualCity/VirtualCity.gltf", (gltf) => {
  city = gltf.scene;
  city.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(city);
});

/**
 * Particles
 */
const particleCount = 1000;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 30; // x
  particlePositions[i * 3 + 1] = Math.random() * 10; // y
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  color: "white",
  transparent: true,
  opacity: 0.8,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

/**
 * Animation
 */
const clock = new THREE.Clock();
const particleSpeed = 0.02;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= particleSpeed;
    if (positions[i * 3 + 1] < -0.5) {
      positions[i * 3 + 1] = Math.random() * 10;
    }
  }
  particleGeometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
