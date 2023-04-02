import * as THREE from "three";
import {
  plane,
  planeWall,
  BoxWater,
  playerCollider,
  capsule,
  fadeToAction,
} from "@/three/mesh/meshPlayer";
import { Octree } from "three/examples/jsm/math/Octree.js";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";

import Fireworks from "@/three/createPoint";
import exp from "constants";

export const keyStates = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  Space: false,
  isDown: false,
};

let isQuick = false;
export let fireworks: Fireworks[] = [];
export const modifyQuick = (val: boolean) => {
  isQuick = val;
};
export let createFireworks = (scene: THREE.Scene) => {
  let color = `hsl(${Math.floor(Math.random() * 360)},100%,5%)`;
  // 颜色随机生成 位置
  // 获取相机朝向
  const capsuleFront = capsule.position.clone();
  const positionY = playerVelocity.clone().y;
  let toPosition = capsule.getWorldDirection(capsuleFront);
  capsuleFront.multiplyScalar(10);

  // 从哪开始？
  let from = new THREE.Vector3(
    capsule.position.clone().x,
    capsule.position.clone().y + 2,
    capsule.position.clone().z
  );
  // 去哪？
  let to = new THREE.Vector3(
    toPosition.x,
    Math.abs(positionY) + capsule.position.clone().y + 3,
    toPosition.z
  );
  let firework = new Fireworks(color, to, from);
  firework.addGroup(group);
  fireworks.push(firework);
};
export const group = new THREE.Group();
// @ts-ignore
group.add(plane);
group.add(planeWall);
group.add(BoxWater);
// scene.add(group);
const worldOctree = new Octree();
worldOctree.fromGraphNode(group);
export const _octreeHelper = new OctreeHelper(worldOctree, 0xff0);
// 设置重力
const gravity = -9.8;
// 玩家的速度
export const playerVelocity = new THREE.Vector3(0, 0, 0);
// 方向向量
export const playerDirection = new THREE.Vector3(0, 0, 0);

// 根据键盘状态更新玩家的速度
export function controlPlayer(deltaTime: number) {
  if (keyStates["KeyW"] && !isQuick) {
    playerDirection.z = 5;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(deltaTime));
  }
  if (keyStates["KeyS"]) {
    playerDirection.z = 5;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
  }
  if (keyStates["KeyA"]) {
    playerDirection.x = 5;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);

    // 侧方的方向，正前面的方向和胶囊的正上方求叉积，求出侧方的方向
    capsuleFront.cross(capsule.up);
    // console.log(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
  }
  if (keyStates["KeyD"]) {
    playerDirection.x = 5;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);

    // 侧方的方向，正前面的方向和胶囊的正上方求叉积，求出侧方的方向
    capsuleFront.cross(capsule.up);
    // console.log(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(deltaTime));
  }
  if (keyStates["Space"]) {
    playerVelocity.y = 5;
  }
}

// 玩家是否在地面上
let playerOnFloor = false;

export function updatePlayer(deltaTime: number) {
  let damping = -0.05;
  if (playerOnFloor) {
    playerVelocity.y = 0;

    keyStates.isDown || playerVelocity.addScaledVector(playerVelocity, damping);
  } else {
    playerVelocity.y += gravity * deltaTime;
  }

  // console.log(playerVelocity);
  // 计算玩家移动的距离
  const playerMoveDistance = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(playerMoveDistance);
  // 将胶囊的位置进行设置
  playerCollider.getCenter(capsule.position);
  // 进行碰撞检测
  playerCollisions();

  // 如果有水平的运动 则设置运动的动作
  if (
    Math.abs(playerVelocity.x) + Math.abs(playerVelocity.z) > 0.1 &&
    Math.abs(playerVelocity.x) + Math.abs(playerVelocity.z) <= 3
  ) {
    fadeToAction("Walking");
  } else if (Math.abs(playerVelocity.x) + Math.abs(playerVelocity.z) > 3) {
    fadeToAction("Running");
  } else {
    fadeToAction("Idle");
  }
}

export function playerCollisions() {
  // 人物碰撞检测
  const result = worldOctree.capsuleIntersect(playerCollider);
  // console.log(result);
  playerOnFloor = false;
  if (result) {
    playerOnFloor = result.normal.y > 0;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

export function resetPlayer() {
  if (capsule.position.y < -20) {
    playerCollider.start.set(0, 2.35, 0);
    playerCollider.end.set(0, 3.35, 0);
    playerCollider.radius = 0.35;
    playerVelocity.set(0, 0, 0);
    playerDirection.set(0, 0, 0);
  }
}
