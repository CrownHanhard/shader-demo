import * as THREE from "three";
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.001,
  1000
);
camera.position.set(0, 0, 0);
export default camera;
