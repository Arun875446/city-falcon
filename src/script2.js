import * as THREE from "three";
import GUI from "lil-gui";
import CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
const group = new THREE.Group();

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const textureLoader = new THREE.TextureLoader();
const giftTexture = textureLoader.load("/textures/wrap.jpg");
giftTexture.colorSpace = THREE.SRGBColorSpace;

const gui = new GUI({
  width: 300,
  title: "tweaks",
  closeFolders: true,
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const boxMaterial = new THREE.MeshPhysicalMaterial();
const boxGeo = new THREE.BoxGeometry(2, 1.5, 2);
const boxMat = boxMaterial;
boxMat.map = giftTexture;
const box = new THREE.Mesh(boxGeo, boxMat);
box.castShadow = true;
box.position.y = 0.75;

const sphereMaterial = new THREE.MeshPhysicalMaterial();
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const sphereMat = sphereMaterial;
sphereMat.map = giftTexture;
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.castShadow = true;
sphere.position.set(3, 1, 0);

const planeMaterial = new THREE.MeshPhysicalMaterial();
const planeGeo = new THREE.PlaneGeometry(10, 10);
const planeMat = planeMaterial;
planeMat.side = THREE.DoubleSide;
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2; // Rotate to lay it flat
plane.position.y = 0; // Keep the plane at ground level

// Create a tin shape (cylinder)
const tinMaterial = new THREE.MeshPhysicalMaterial();
const tinGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32); // Radius top, Radius bottom, Height, Radial segments
const tinMat = tinMaterial;
tinMat.map = giftTexture;
const tin = new THREE.Mesh(tinGeo, tinMaterial);
tin.castShadow = true;

// Position the tin to the left of the box (adjust x-position)
tin.position.set(-3, 0.75, 0); // Placed to the left of the box, y = 0.75 for the tin height

group.add(box, sphere, plane, tin);
scene.add(group);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 9;
camera.position.y = 4;
camera.position.x = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

const ambientLight = new THREE.AmbientLight("white", 1.5);
scene.add(ambientLight);

const dL = new THREE.DirectionalLight("lightBlue", 3);
dL.castShadow = true;
dL.shadow.mapSize.width = 1024;
dL.shadow.mapSize.height = 1024;
dL.shadow.camera.near = -4;
dL.shadow.camera.far = 7;
dL.shadow.camera.left = -5;
dL.shadow.camera.right = 5;
dL.position.x = 0.7;
dL.position.y = 1.2;
dL.position.z = -1.02;

scene.add(dL);

const dLTweaks = gui.addFolder("dLTweaks");
dLTweaks.add(dL.position, "x").step(0.01).max(4).min(-4).name("swiper");
dLTweaks.add(dL.position, "y").step(0.01).max(4).min(-4).name("elevate");
dLTweaks.add(dL.position, "z").step(0.01).max(4).min(-4).name("zoomer");

const dLHelper = new THREE.DirectionalLightHelper(dL, 2);
scene.add(dLHelper);
dLHelper.visible = false;

const dLS = new THREE.CameraHelper(dL.shadow.camera);
scene.add(dLS);
dLS.visible = false;

const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.addContactMaterial(defaultContactMaterial);

const sphereShape = new CANNON.Sphere(1);

const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(3, 5, 0),
  shape: sphereShape,
  material: defaultMaterial,
});

world.addBody(sphereBody);

// Create a box physics body
const boxShape = new CANNON.Box(new CANNON.Vec3(1, 0.75, 1)); // Half-width, half-height, half-depth
const boxBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 5, 0), // Initial position of the box
  material: defaultMaterial,
});
boxBody.addShape(boxShape);
world.addBody(boxBody);

// Create a tin (cylinder) physics body
const tinShape = new CANNON.Cylinder(0.5, 0.5, 1.5, 32); // Radius, height
const tinBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(-3, 5, 0), // Initial position of the tin
  material: defaultMaterial,
});
tinBody.addShape(tinShape);
world.addBody(tinBody);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.material = defaultMaterial;
floorBody.mass = 0;
floorBody.addShape(floorShape);
world.addBody(floorBody);

floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

let car = null;
const gltfLoader = new GLTFLoader();
gltfLoader.load("/models/Car/Car.gltf", (gltf) => {
  scene.add(gltf.scene);
  car = gltf.scene;
  car.castShadow = true;
});

window.addEventListener("resize", () => {
  (sizes.width = window.innerWidth), (sizes.height = window.innerHeight);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
let oldElapsedTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  // Update physics
  world.step(1 / 60, deltaTime, 3);

  sphere.position.copy(sphereBody.position);
  box.position.copy(boxBody.position);
  tin.position.copy(tinBody.position);

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
