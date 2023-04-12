<template>
    <div id="container">
        <div class="scene" ref="sceneDiv"></div>
        <div class="videoBox">
            <canvas id="myCanvas" width="400" height="400" ref="myCanvas"></canvas>
            <video id="video" loadeddata width="400" height="400" style="width:400px;height:400px" ref="video"
                autoplay></video>
        </div>
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
import { animate, delta, initMytack } from "@/three/animate";
import stats from '@/three/stats'
import 'tracking'
import "tracking/build/data/face";

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

// 导入手势库
// @ts-ignore
import * as handTrack from "handtrackjs";

//  手势库
const modelParams = {
    flipHorizontal: true, // 翻转摄像头
    maxNumBoxes: 20, // 最大检测数量
    iouThreshold: 0.5, // 阈值
    scoreThreshold: 0.6,
    labelMap: {
        1: "open",
        2: "closed",
        3: "pinch",
        4: "point",
        6: "pointtip",
        7: "pinchtip",
    },
    modelType: "ssd320fpnlite",
};

const sceneDiv: Ref = ref();
//  相机
scene.add(camera);
// scene.add(_octreeHelper);
scene.add(hemisphereLight)
// 标识用的画布
const myCanvas = ref<HTMLCanvasElement | null>(null);
const video = ref<HTMLVideoElement | null>(null);


let QuickSpeed: string[] = reactive([])
// initMytack(myCanvas as Ref<HTMLCanvasElement>)

onMounted(async () => {
    // tracking.track('#video', myTracker, { camera: true })
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
    // 获取用户媒体,包含视频和音频
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            video.value!.srcObject = stream // 将捕获的视频流传递给video  放弃window.URL.createObjectURL(stream)的使用
            // video.value!.play() //  播放视频
        }).then(res => {
            handTrack.startVideo(document.getElementById('video') as HTMLVideoElement).then(function (data: { status: boolean }) {
                if (data.status) {
                    handTrack.load(modelParams).then((model: any) => {
                        initMytack(model, myCanvas as Ref<HTMLCanvasElement>, document.getElementById('video') as HTMLVideoElement)
                    })
                }
            });
        })
});

</script>
<style>
#container {
    position: relative
}

.scene {
    position: absolute;
    top: 0;
    left: 0%;
    width: 100vw;
    height: 100vh;
    z-index: 2;
}

.videoBox {
    position: absolute;
    top: 0;
    left: 0;
    width: 400px;
    height: 400px;
    z-index: 3;

}

#myCanvas {
    position: absolute;
    top: 0;
    left: 0;
}
</style>