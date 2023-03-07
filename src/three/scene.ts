import * as THREE from "three";
const scene:THREE.Scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 50);
export default scene;
