import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";

// Debug
const gui = new GUI();
gui.hide();

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
directionalLight.position.set(0, 5, 2);
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
camera.position.set(20, 13, 11.8);
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

let cesiumMan = null; // To store the CesiumMan model
let mixer = null;
let action1 = null;

// Load City Model
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

// Load CesiumMan Model
gltfLoader.load("/models/Man/CesiumMan.gltf", (gltf) => {
  cesiumMan = gltf.scene;
  cesiumMan.castShadow = true;
  cesiumMan.receiveShadow = true;
  mixer = new THREE.AnimationMixer(cesiumMan);
  action1 = mixer.clipAction(gltf.animations[0]);
  action1.play();

  scene.add(cesiumMan);

  // Set initial position for CesiumMan
  // cesiumMan.position.set(0, 0, 0); // You can modify this based on the city's coordinates

  cesiumMan.position.set(-11.7, 0, 0);
});

gltfLoader.load("/models/swat/scene.gltf", (gltf) => {
  const mesh = gltf.scene;
  scene.add(mesh);

  // Set initial position for the helicopter

  mesh.position.set(0, 11, 0);

  const clock = new THREE.Clock();

  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    mesh.position.z = Math.cos(elapsedTime * 0.1) * 8;
    mesh.position.x = -Math.sin(elapsedTime * 0.1) * 23;
    window.requestAnimationFrame(animate);
  };

  animate();
});

gltfLoader.load("/models/falcon/scene.gltf", (gltf) => {
  const mesh = gltf.scene;
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(mesh);
  mesh.position.set(0, 11, 0);

  const clock = new THREE.Clock();

  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    mesh.position.z = Math.cos(elapsedTime * 0.1) * 8;
    mesh.position.x = -Math.sin(elapsedTime * 0.1) * 23;
    window.requestAnimationFrame(animate);
  };

  animate();
});

// Particles
const particleCount = 500;
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
 * GUI for Camera Controls
 */
const cameraFolder = gui.addFolder("Camera Controls");

const swiper = cameraFolder.addFolder("Swiper");
swiper.add(camera.position, "x").min(-10).max(20).step(0.1).name("X Axis");

const elevate = cameraFolder.addFolder("Elevate");
elevate.add(camera.position, "y").min(-10).max(20).step(0.1).name("Y Axis");

const zoomer = cameraFolder.addFolder("Zoomer");
zoomer.add(camera.position, "z").min(-10).max(20).step(0.1).name("Z Axis");

// Close folders by default
swiper.close();
elevate.close();
zoomer.close();

cameraFolder.open();

let previousTime = 0;

// Function to move CesiumMan inside the city
const moveManInsideCity = () => {
  if (cesiumMan) {
    // Move man in the current direction
    cesiumMan.position.add(direction.clone().multiplyScalar(moveSpeed));

    // Optional: Add boundary checks to ensure the man stays inside the city
    const cityBounds = getCityBounds(); // Function to get the city's boundary (replace this with actual data)
    if (
      cesiumMan.position.x < cityBounds.minX ||
      cesiumMan.position.x > cityBounds.maxX ||
      cesiumMan.position.z < cityBounds.minZ ||
      cesiumMan.position.z > cityBounds.maxZ
    ) {
      // Reverse direction when hitting the boundary
      direction.negate();
    }
  }
};

// Helper function to get the city bounds
const getCityBounds = () => {
  // Replace this with actual logic to determine the city boundaries from the city model.
  return {
    minX: -15,
    maxX: 15,
    minZ: -15,
    maxZ: 15,
  };
};

// Particle movement speed
const particleSpeed = 0.01;
const clock = new THREE.Clock();
let direction = new THREE.Vector3(0, 0, 1); // Direction of movement (right along the x-axis)
const moveSpeed = 0.02; // Speed of the walking animation

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer !== null) {
    mixer.update(deltaTime);
  }

  // Move the man inside the city
  moveManInsideCity();

  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= particleSpeed;
    if (positions[i * 3 + 1] < -0.5) {
      positions[i * 3 + 1] = Math.random() * 10;
    }
  }
  particleGeometry.attributes.position.needsUpdate = true;

  camera.position.z = Math.cos(elapsedTime * 0.1) * 21;
  camera.position.x = -Math.sin(elapsedTime * 0.1) * 23;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
