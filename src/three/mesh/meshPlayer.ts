import * as THREE from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
// 创建一个人的碰撞体
const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1.35, 0),
  0.35
);

// 创建一个平面纹理 通过合并循环生成总物体
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
});

const geometry = [];
for (let i = 0; i < 12; i++) {
  const planeGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  const position = new THREE.Vector3(
    i % 3 === 0
      ? 10 * i - (i / 3) * 10
      : i % 3 === 1
      ? Math.floor(i / 3) * 20
      : Math.floor((i - 1) / 3) * 20, //红色
    i % 3 === 0 ? 0 : 10,
    i % 3 === 0 ? 0 : i % 3 === 1 ? 10 : -10 //蓝色
  );
  // 四元数表示旋转
  const quaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(i % 3 === 0 ? -Math.PI / 2 : 0, 0, 0)
  );
  const scale = new THREE.Vector3(1, 1, 1);
  let matrix = new THREE.Matrix4();
  matrix.compose(position, quaternion, scale);
  // plane.setMatrixAt(i, matrix)  不添加 合并材质
  planeGeometry.applyMatrix4(matrix);
  geometry.push(planeGeometry);
}
const mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(geometry);
const plane = new THREE.Mesh(mergeGeometry, planeMaterial);
plane.receiveShadow = true;
// 创建立方体叠楼梯的效果
for (let i = 0; i < 10; i++) {
  const boxGeometry = new THREE.BoxGeometry(1, 1, 0.15);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.y = 0.15 + i * 0.15;
  box.position.z = i * 0.3;
  plane.add(box);
}
// 创建一个墙体
const planeWallGeometry = new THREE.BoxGeometry(5, 5, 1, 1);
const planeWallMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#1de"),
  side: THREE.DoubleSide,
});
const planeWall = new THREE.Mesh(planeWallGeometry, planeWallMaterial);
planeWall.receiveShadow = true;
planeWall.position.set(5, 0.25, 5);

// 创建一个平面
const capsuleBodyGeometry = new THREE.PlaneGeometry(1, 0.5, 1, 1);
const capsuleBodyMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  side: THREE.DoubleSide,
});
const capsuleBody = new THREE.Mesh(capsuleBodyGeometry, capsuleBodyMaterial);
capsuleBody.position.set(0, 0.5, 0);

// 创建一个胶囊物体
const capsuleGeometry = new THREE.CapsuleGeometry(0.35, 1, 32);
const capsuleMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
});
const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
capsule.position.set(0, 0.85, 0);

// 多层次细节展示
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});
let lod = new THREE.LOD();
for (let i = 0; i < 5; i++) {
  const geometry = new THREE.SphereGeometry(1, 22 - i * 5, 22 - i * 5);

  const mesh = new THREE.Mesh(geometry, material);

  lod.addLevel(mesh, i * 5);
}
let mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
mesh.visible = false;
lod.addLevel(mesh, 25);
lod.position.set(10, 0, 10);
export { playerCollider, capsuleBody, capsule, plane, planeWall, lod };
