import * as THREE from "three";
import scene from "./scene";
import camera from "./camera";
import render from "./render";
import stats from "./stats";
import { mixer, capsule } from "./mesh/meshPlayer";
import {
  controlPlayer,
  updatePlayer,
  resetPlayer,
  fireworks,
} from "@/three/modifyPlayer/player";
import "tracking";
import "tracking/build/data/face";
// @ts-ignore
import * as handTrack from "handtrackjs";
import { Ref } from "vue";

const clock = new THREE.Clock();
export let delta: number;

// // 实例颜色检查器
// export const myTracker = new tracking.ObjectTracker("face");
// myTracker.setInitialScale(4);
// myTracker.setStepSize(2);
// myTracker.setEdgesDensity(0.1);
// let nextRx: number = 0,
//   oldRx: number;

// export const initMytack = (myCanvas: Ref<HTMLCanvasElement>) => {

// 监听颜色检查器
// myTracker.on("track", (event: tracking.TrackEvent) => {
//   const context = myCanvas.value?.getContext(
//     "2d"
//   ) as CanvasRenderingContext2D;
//   if (myCanvas.value) {
//     context.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height);
//   }
//   if (event.data.length === 0) {
//     console.log("没有捕获到内容");
//   } else {
//     event.data.forEach((rect: tracking.TrackRect) => {
//       const { x, y, width, height } = rect;
//       context.strokeStyle = "#fff";
//       context.strokeRect(x, y, width, height);
//       context.font = "11px Helvetica";
//       context.fillStyle = "#fff";
//       context.fillText(`x:${x}px`, x + width + 5, y + 11);
//       context.fillText(`y:${y}px`, x + width + 5, y + 22);
//       oldRx = nextRx;
//       if (x < 100) {
//         nextRx = ((100 - x) / 400 / 4) * 1920 * 0.003;
//       } else {
//         nextRx = ((x - 100) / 400 / 4) * 1920 * 0.003;
//       }
//     });
//   }
// });
// };

let status: string;
export const initMytack = (
  handModel: any,
  myCanvas: Ref<HTMLCanvasElement>,
  video: HTMLVideoElement
) => {
  const runDetection = () => {
    const context = myCanvas.value.getContext("2d");
    handModel.detect(video).then((predictions: any) => {
      if (predictions.length > 0) {
        status =
          predictions[0].label === undefined
            ? predictions[1]
              ? predictions[1].label
              : predictions[0].label
            : predictions[0].label;
      }
      handModel.renderPredictions(predictions, myCanvas.value, context, video);
      requestAnimationFrame(runDetection);
    });
  };
  runDetection();
};
export const animate = () => {
  delta = clock.getDelta();
  controlPlayer(delta);
  updatePlayer(delta);
  resetPlayer();
  if (mixer) {
    mixer.update(delta);
  }
  // if (nextRx !== 0) {
  //   capsule.rotation.y -= nextRx - oldRx;
  // }
  if (status === "closed") {
    capsule.rotation.y -= 0;
  } else if (status === "open") {
    capsule.rotation.y -= 0.003 * 50;
  }
  requestAnimationFrame(animate);
  stats.update();
  fireworks.forEach((item) => {
    item.update();
  });
  render.render(scene, camera);
};
