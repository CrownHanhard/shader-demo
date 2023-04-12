import * as THREE from "three";
import gsap from "gsap";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import vertexShader from "@/shader/planeWall/vertex.glsl?raw";
import fragmentShader from "@/shader/planeWall/fragment.glsl?raw";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { PlaneGeometry } from "three";

// 创建一个人的碰撞体
const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1.35, 0),
  0.35
);

// 添加半球光源照亮机器人
export const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);

// 载入机器人
// 载入机器人模型
const loader = new GLTFLoader();
//  设置动作混合器
export let mixer: THREE.AnimationMixer;
let actions: { [key: string]: THREE.AnimationAction } = {};
// 设置激活动作
let activeAction: THREE.AnimationAction;
loader.load("./models/RobotExpressive.glb", (gltf) => {
  const robot = gltf.scene;
  robot.scale.set(0.4, 0.4, 0.4);
  robot.position.set(0, -0.85, 0);
  capsule.add(robot);
  mixer = new THREE.AnimationMixer(robot);
  for (let i = 0; i < gltf.animations.length; i++) {
    let name = gltf.animations[i].name;
    actions[name] = mixer.clipAction(gltf.animations[i]);

    if (
      name !== "Idle" &&
      name !== "Running" &&
      name !== "Walking" &&
      name !== "Jump"
    ) {
      actions[name].clampWhenFinished = true; // 结束自动暂停 保留最后一帧
      actions[name].loop = THREE.LoopOnce;
    } else {
      actions[name].clampWhenFinished = false;
      actions[name].loop = THREE.LoopRepeat;
    }
  }
  activeAction = actions["Idle"];
  activeAction.play();
});

export const fadeToAction = (actionName: string) => {
  let prevAction = activeAction;
  activeAction = actions[actionName];
  if (prevAction != activeAction) {
    prevAction.fadeOut(0.3);
    activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(0.3)
      .play();
    mixer.addEventListener("finished", () => {
      let prevAction = activeAction;
      activeAction = actions["Idle"];
      prevAction.fadeOut(0.3);
      activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play();
    });
  }
};
//  创建水平面
// const BoxWaterGeometry = new THREE.SphereGeometry(200,64,64)
const BoxWaterGeometry = new THREE.PlaneGeometry(2000, 2000, 64, 64);

// 创建一个平面纹理 通过合并循环生成总物体

const planeWaterMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthTest: false,
  uniforms: {
    iTime: {
      value: 0,
    },
    iResolution: {
      value: new THREE.Vector2(1920, 1080),
    },
  },
});
gsap.to(planeWaterMaterial.uniforms.iTime, {
  value: 3,
  duration: 10,
  repeat: -1,
  yoyo: true,
});
const BoxWater = new THREE.Mesh(BoxWaterGeometry, planeWaterMaterial);
BoxWater.rotation.x = -Math.PI / 2;
BoxWater.receiveShadow = true;
BoxWater.position.set(0, -20, 0);
const planeMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  side: THREE.DoubleSide,
  opacity: 0.3,
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
    i % 3 === 0 ? 0 : -10,
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
const capsule = new THREE.Object3D();
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

// 视频

export { playerCollider, capsule, plane, planeWall, lod, BoxWater };
