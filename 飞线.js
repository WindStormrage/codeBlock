/**
 * @class 飞线父类
 * @param start 起始地理坐标[lng, lat]
 * @param end 终止地理坐标[lng, lat]
 * @param r 地球半径
 * @param staticAlt 飞线固定离地高度
 * @param theta 飞线偏离地面法向量的角度
 * @param speed 速度 一条飞线打完需要的秒数
 */
class Arcs {
  constructor ({
    start = [0, 90],
    end = [90, 0],
    r = 200,
    staticAlt,
    theta,
    speed = 4000,
    once = false,
  } = {}) {
    this.start = start;
    this.end = end;
    this.r = r;
    this.staticAlt = staticAlt;
    this.curve = null;
    this.points = [];
    this.flyLine = null;
    this.speed = speed;
    // this.theta = theta !== undefined ? theta : 60 * (Math.random() * 2 - 1);
    this.theta = theta || 0;
    this.once = once;
    this.needDestory = false;
  }
  Draw () {
    // 弧线添加的一个海拔(保证弧线不在球里面)
    const beginVector3 = coordinateToPositionVector(...this.start, this.r);
    const endVector3 = coordinateToPositionVector(...this.end, this.r);
    // 弧线离地高度在0~一个半径之间随机
    const CURVE_MIN_ALTITUDE = this.r / 10;
    const CURVE_MAX_ALTITUDE = this.r;
    let altitude = clamp(
      beginVector3.distanceTo(endVector3) * (Math.random() / 2 + 0.3),
      CURVE_MIN_ALTITUDE,
      CURVE_MAX_ALTITUDE
    );
    // 如果有固定的海拔就用固定的
    if (this.staticAlt) {
      altitude = this.staticAlt;
    }
    // 取到一个合适的位置
    const geoInterpolator = d3.geoInterpolate(this.start, this.end);
    const midCoord1 = geoInterpolator(0.25);
    const midCoord2 = geoInterpolator(0.75);
    // 贝塞尔曲线的两个标点
    let mid1 = coordinateToPositionVector(
      midCoord1[0],
      midCoord1[1],
      this.r + altitude
    );
    let mid2 = coordinateToPositionVector(
      midCoord2[0],
      midCoord2[1],
      this.r + altitude
    );
    // 旋转角度
    if (this.start !== 0) {
      // 把范围控制在-180到180
      this.theta = this.theta % 360;
      this.theta = this.theta > 180 ? this.theta - 360 : this.theta;
      const unitVector = getUnitVector(beginVector3, endVector3);
      mid1 = rotateByVector(
        mid1.x,
        mid1.y,
        mid1.z,
        unitVector.x,
        unitVector.y,
        unitVector.z,
        this.theta
      );
      mid2 = rotateByVector(
        mid2.x,
        mid2.y,
        mid2.z,
        unitVector.x,
        unitVector.y,
        unitVector.z,
        this.theta
      );
    }
    // 贝塞尔
    this.curve = new THREE.CubicBezierCurve3(
      beginVector3,
      mid1,
      mid2,
      endVector3
    );
  }

  append () {
    this.Draw();
    return this.CreateLineFly();
  }

  destory () {
    if (this.flyLine) {
      if (this.flyLine.material.map) {
        this.flyLine.material.map.dispose();
      }
      this.flyLine.material.map = null;
      this.flyLine.geometry.dispose();
      this.flyLine.geometry = null;
      this.flyLine.material.dispose();
      this.flyLine.material = null;
      this.flyLine.parent.remove(this.flyLine);
      this.flyLine = null;
    }
    this.needDestory = true;
  }
  CreateLineFly () {
    // 返回一组路径的点,细分为50个
    const points = this.curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xfc4200 });
    // 画贝塞尔曲线
    this.flyLine = new THREE.Line(geometry, material);
    return this.flyLine;
  }
}

// 管道飞线
class TubeArcs extends Arcs {
  constructor ({
    start = [0, 90],
    end = [90, 0],
    r = 200,
    staticAlt,
    theta,
    speed = 10,
    pointLength = 600,
    once = false,
  } = {}) {
    super({
      start,
      end,
      r,
      staticAlt,
      theta,
      speed,
    });
    this.pointCount = 500;
    this.beginPoint = -Math.floor(pointLength / 3) * 3;
    this.pointLength = pointLength;
    this.once = once;
  }
  CreateLineFly () {
    let geometry = new THREE.TubeGeometry(this.curve, 100, 0.6, 8, false);
    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    this.pointCount = geometry.attributes.position.count;
    geometry.setDrawRange(0, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x2ef4fa });
    this.flyLine = new THREE.Mesh(geometry, material);
    return this.flyLine;
  }

  render () {
    if (this.flyLine && this.flyLine.geometry) {
      // // 不知道为什么一定要是3的倍数
      const increment = Math.floor(this.pointCount / 60 / (this.speed * 3)) * 3 || 3;
      this.beginPoint = this.beginPoint + increment;
      if (this.beginPoint - this.pointCount > 0) {
        this.beginPoint = -Math.floor(this.pointLength / 3) * 3;
        if (this.once) {
          this.destory();
          return;
        }
      }
      this.flyLine.geometry.setDrawRange(this.beginPoint, this.pointLength);
    }
  }
}

// 纹理飞线
class TextureArcs extends Arcs {
  constructor ({
    start = [0, 90],
    end = [90, 0],
    r = 200,
    staticAlt,
    theta,
    speed = 4,
    texture = new THREE.TextureLoader().load('http://p1.qhimg.com/t01033ff790564dbf38.png'),
    once = false,
  } = {}) {
    super({
      start,
      end,
      r,
      staticAlt,
      theta,
      speed,
    });
    this.texture = texture;
    this.once = once;
  }
  CreateLineFly () {
    const geometry = new THREE.TubeGeometry(this.curve, 32, 0.8, 3, false);
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.offset.x = 1;
    const material = new THREE.MeshPhongMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    });
    this.flyLine = new THREE.Mesh(geometry, material);
    return this.flyLine;
  }
  render () {
    if (this.needDestory) return;
    if (this.flyLine !== undefined && this.flyLine.material) {
      let offset = this.flyLine.material.map.offset.x - 1.6 / (60 * this.speed);
      if (offset < -0.6) {
        if (this.once) {
          this.destory();
          return;
        }
        offset = 1;
      }
      this.flyLine.material.map.offset.x = offset;
    }
  }
}

// 对象飞线
class ObjectArcs extends Arcs {
  constructor ({
    start = [0, 90],
    end = [90, 0],
    r = 200,
    staticAlt,
    theta,
    speed = 4,
    object = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshPhongMaterial({ color: 0x2ef4fa })),
    once = false,
  } = {}) {
    super({
      start,
      end,
      r,
      staticAlt,
      theta,
      speed,
    });
    this.mesh = object;
    this.once = once;
    this.moveIndex = 0;
  }
  CreateLineFly () {
    this.points = this.curve.getPoints(60 * this.speed);
    this.flyLine = new THREE.Object3D().add(this.mesh);
    return this.flyLine;
  }
  render () {
    if (this.flyLine) {
      const moveTo = this.points[this.moveIndex];
      this.flyLine.position.set(moveTo.x, moveTo.y, moveTo.z);
      this.moveIndex += 1;
      if (this.moveIndex > this.points.length - 1) {
        if (this.once) {
          this.destory();
          return;
        }
        this.moveIndex = 0;
      }
    }
  }
}


const arena = new Arena();

// 飞线线段
const arcs = new Arcs();
// 管道飞线
const tubeArcs = new TubeArcs({
  theta: -15
});
// 纹理飞线
const textureArcs = new TextureArcs({
  theta: 15
});
// 对象飞线
const objectArcs = new ObjectArcs({
  theta: -10
});
arena.add(arcs);
arena.add(tubeArcs);
arena.add(textureArcs);
arena.add(objectArcs);

// 添加球体
const sphereGeometry = new THREE.SphereGeometry(200, 60, 60);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color("grey") });
const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
arena.add(earthMesh);

const light = new THREE.AmbientLight( 0x404040, 5 );
arena.add( light );

function loop () {
  arena.render();
  requestAnimationFrame(loop);
}
loop();