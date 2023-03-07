import * as THREE from "three";
import scene from "./scene";
import camera from "./camera";
import render from "./render";
import stats from "./stats";
import {
  controlPlayer,
  updatePlayer,
  resetPlayer,
  fireworks,
} from "@/three/modifyPlayer/player";
const clock = new THREE.Clock();
const animate = () => {
  let delta = clock.getDelta();
  // console.log(delta);
  controlPlayer(delta);
  updatePlayer(delta);
  resetPlayer();
  requestAnimationFrame(animate);
  stats.update();
  fireworks.forEach(item=>{
    item.update()
  })
  render.render(scene, camera);
};
export default animate;
