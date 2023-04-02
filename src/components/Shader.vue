<template>
    <div>
        <div class="scene" ref="sceneDiv"></div>
    </div>
</template>
<script setup lang="ts">
import { ref, Ref, onMounted, reactive } from "vue";
import gsap from "gsap";
import * as THREE from "three";
// 场景
import scene from "@/three/scene";
// 相机
import camera from "@/three/camera";
// 控制器
// import controls from "@/three/controls";
// 导入辅助坐标轴
import axesHelper from "@/three/axesHelper";
// 导入渲染器
import renderer from "@/three/render";
// 导入渲染函数
import animate, { delta } from "@/three/animate";
import stats from '@/three/stats'

// 初始化调整屏幕
import "@/three/Init";
import {
    capsule,
    hemisphereLight,
    fadeToAction,
    lod
} from '@/three/mesh/meshPlayer'
import {
    group,
    keyStates,
    createFireworks,
    _octreeHelper,
    playerVelocity,
    playerDirection,
    modifyQuick
} from '@/three/modifyPlayer/player'
const sceneDiv: Ref = ref();
//  相机
scene.add(camera);
// scene.add(_octreeHelper);
scene.add(hemisphereLight)
let QuickSpeed: string[] = reactive([])
onMounted(() => {
    sceneDiv.value.appendChild(renderer.domElement);
    sceneDiv.value.appendChild(stats.domElement);
    // controls.update();
    // 将相机作为胶囊的子元素，就可以实现跟随
    scene.add(group)
    camera.position.set(0, 2, -5);
    camera.lookAt(capsule.position);
    // controls.target = capsule.position;
    capsule.add(camera);

    scene.add(capsule);

    // 根据键盘按下的键来更新键盘的状态
    document.addEventListener(
        "keydown",
        (event) => {
            // @ts-ignore
            keyStates[event.code] = true;
            keyStates.isDown = true;
        },
        false
    );
    const isV = ref(false)
    // 根据鼠标在屏幕移动，来旋转胶囊
    window.addEventListener(
        "mousemove",
        (event) => {
            capsule.rotation.y -= event.movementX * 0.003;
            // capsule.rotation.x += event.movementY * 0.001;
        },
        false
    );

    document.addEventListener(
        "keyup",
        (event) => {
            // @ts-ignore
            keyStates[event.code] = false;
            keyStates.isDown = false;
            if (event.code === "KeyV") {
                if (!isV.value) {
                    camera.position.set(0, .8, 0)
                    isV.value = true
                } else {
                    camera.position.set(0, 2, -5)
                    isV.value = false
                }
            }
            if (event.code === "KeyQ") {
                createFireworks(scene)
            }
            if (event.code === "KeyT") {
                fadeToAction('Wave')
            }
            if (event.code === "KeyW") {
                playerVelocity.z = 0
            }
            if (event.code === "KeyS") {
                playerVelocity.z = 0
            }
            if (event.code === "KeyA") {
                playerVelocity.x = 0
            }
            if (event.code === "KeyD") {
                playerVelocity.x = 0
            }
            if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
                QuickSpeed.length = 0
                modifyQuick(false)
            }


        },
        false
    );

    document.addEventListener("keydown", (event) => {
        if (event.code === "KeyQ") {
            createFireworks(scene)
        }
        if (event.code === "Space") {
            fadeToAction('Jump')
        }
        if (event.code === 'KeyW') {
            if (QuickSpeed.indexOf('Shift') === 0) {
                modifyQuick(true)
                playerDirection.z = 5;
                //获取胶囊的正前面方向
                const capsuleFront = new THREE.Vector3(0, 0, 0);
                capsule.getWorldDirection(capsuleFront);

                // 计算玩家的速度
                playerVelocity.add(capsuleFront.multiplyScalar(delta * 10));

            }
        }
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            if (QuickSpeed.indexOf('Shift') === -1) {
                QuickSpeed.push('Shift')
            }
        }

    })
    document.addEventListener(
        "mousedown",
        (event) => {
            // 锁定鼠标指针
            document.body.requestPointerLock();
        },
        false
    );
    scene.add(lod)
    animate();
});

</script>
<style>
.scene {
    width: 100vw;
    height: 100vh;
}
</style>