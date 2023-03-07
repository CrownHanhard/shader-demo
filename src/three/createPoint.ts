import * as THREE from "three";
import vertexShader from "../shader/startpoint/vertex.glsl?raw";
import fragmentShader from "../shader/startpoint/fragment.glsl?raw";
import fireworkVertexShader from "../shader/fireworks/vertex.glsl?raw";
import fireworkFragmentShader from "../shader/fireworks/fragment.glsl?raw";
export default class Fireworks {
  color: THREE.Color;
  startGeometry: THREE.BufferGeometry;
  startMaterial: THREE.ShaderMaterial;
  startPoint: THREE.Points<any, any>;
  clock: THREE.Clock;
  fireworkGeometry: THREE.BufferGeometry;
  fireworkCount: number;
  fireworkMaterial: THREE.ShaderMaterial;
  firePoint: THREE.Points<any, any>;
  group!: THREE.Group;
  constructor(
    color: string,
    to: { x: number; y: number; z: number },
    from: { x: number; y: number; z: number }
  ) {
    this.color = new THREE.Color(color);
    this.startGeometry = new THREE.BufferGeometry();
    const startPointCount = 50;
    const startPositionArray = new Float32Array(3 * startPointCount);
    const startPointScaleFireworkArray = new Float32Array(startPointCount);
    const startPointDirectionArray = new Float32Array(startPointCount * 3);
    for (let i = 0; i < startPointCount; i++) {
      // 一开始烟花的位置
      startPositionArray[i * 3 + 0] = from.x;
      startPositionArray[i * 3 + 1] = from.y;
      startPositionArray[i * 3 + 2] = from.z;
      // 设置烟花初始大小
      startPointScaleFireworkArray[i + 0] = Math.random();
      // 设置旋转角度
      let r = 1;

      startPointDirectionArray[i * 3 + 0] = r * from.x * 0.1;
      startPointDirectionArray[i * 3 + 1] = r * from.y * 0.1;
      startPointDirectionArray[i * 3 + 2] = r * from.z * 0.1;
    }

    this.startGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(startPositionArray, 3)
    );

    // this.startGeometry.setAttribute('aStep', new THREE.BufferAttribute(astepArray, 3))
    this.startGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(startPointDirectionArray, 3)
    );
    // 设置着色器材质
    this.startMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 2,
        },
        uColor: {
          value: this.color,
        },
      },
    });
    // 创建烟花点球
    this.startPoint = new THREE.Points(this.startGeometry, this.startMaterial);

    // 开始计时
    this.clock = new THREE.Clock();

    // 创建爆炸烟花

    this.fireworkGeometry = new THREE.BufferGeometry();
    this.fireworkCount = 180 + Math.floor(Math.random() * 180);
    const positionFireworksArray = new Float32Array(this.fireworkCount * 3);
    const scaleFireworkArray = new Float32Array(this.fireworkCount);
    const directionArray = new Float32Array(this.fireworkCount * 3);
    for (let i = 0; i < this.fireworkCount; i++) {
      // 一开始烟花的位置
      positionFireworksArray[i * 3 + 0] = to.x * 2;
      positionFireworksArray[i * 3 + 1] = to.y * 2;
      positionFireworksArray[i * 3 + 2] = to.z * 2;
      // 设置烟花初始大小
      scaleFireworkArray[i + 0] = Math.random();
      // 设置旋转角度
      let theta = Math.random() * 2 * Math.PI;
      let beta = Math.random() * 2 * Math.PI;
      let r = 1;

      directionArray[i * 3 + 0] = r * Math.sin(theta) + r * Math.sin(beta);
      directionArray[i * 3 + 1] = r * Math.cos(theta) + r * Math.cos(beta);
      directionArray[i * 3 + 2] = r * Math.sin(theta) + r * Math.cos(beta);
    }
    this.fireworkGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positionFireworksArray, 3)
    );
    this.fireworkGeometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(scaleFireworkArray, 1)
    );
    this.fireworkGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(directionArray, 3)
    );
    this.fireworkMaterial = new THREE.ShaderMaterial({
      vertexShader: fireworkVertexShader,
      fragmentShader: fireworkFragmentShader,
      transparent: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 0,
        },
        uColor: {
          value: this.color,
        },
      },
    });
    this.firePoint = new THREE.Points(
      this.fireworkGeometry,
      this.fireworkMaterial
    );
  }
  // 添加到场景
  addGroup(group: THREE.Group) {
    group.add(this.startPoint);
    group.add(this.firePoint);
    this.group = group;
  }
  // 更新变量
  update() {
    const elapseTime = this.clock.getElapsedTime();
    this.startMaterial.uniforms.uTime.value = elapseTime;
    this.startMaterial.uniforms.uSize.value = 10;
    if (elapseTime > 0.2 && elapseTime < 1) {
      this.startMaterial.uniforms.uTime.value = elapseTime;
      this.startMaterial.uniforms.uSize.value = 10;
    } else if (elapseTime >= 1) {
      const time = elapseTime - 1;
      // 让元素消失
      this.startMaterial.uniforms.uSize.value = 0;
      this.startPoint.clear();
      this.startGeometry.dispose();
      this.group.remove(this.startPoint);
      // 设置烟花显示
      this.fireworkMaterial.uniforms.uSize.value = 20;
      this.fireworkMaterial.uniforms.uTime.value = time;

      if (time > 5) {
        this.firePoint.clear();
        this.fireworkGeometry.dispose();
        this.fireworkMaterial.dispose();
        this.group.remove(this.firePoint);
        this.group.remove(this.startPoint);
      }
    }
  }
}
