// 二维平面向量
class Vector2d {
  constructor(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  // 向量的加法运算
  static add(vec, vec2) {
    const vx = vec.vx + vec2.vx;
    const vy = vec.vy + vec2.vy;
    return new Vector2d(vx, vy);
  }

  // 向量的减法运算
  static sub(vec, vec2) {
    const vx = vec.vx - vec2.vx;
    const vy = vec.vy - vec2.vy;
    return new Vector2d(vx, vy);
  }

  // 获取向量长度
  length() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  // 向量的数量积
  static dot(vec, vec2) {
    return vec.vx * vec2.vx + vec.vy * vec2.vy;
  }

  // 向量的旋转 
  static rotate(vec, angle) {
    const cosVal = Math.cos(angle);
    const sinVal = Math.sin(angle);
    const vx = vec.vx * cosVal - vec.vy * sinVal;
    const vy = vec.vx * sinVal + vec.vy * cosVal;
    return new Vector2d(vx, vy);
  }
}

export class Rect {
  // x,y是矩形中心的坐标 w是宽 h是高 rotation是角度单位deg
  constructor({
    x = 0, y = 0, w = 1, h = 1, rotation = 0, 
  }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rotation = rotation;
  }

  get C() { 
    return new Vector2d(this.x, this.y); 
  }

  get _A1() {
    return new Vector2d(this.x - this.w / 2, this.y - this.h / 2); 
  }

  // 4角顶点
  get _A2() { 
    return new Vector2d(this.x + this.w / 2, this.y - this.h / 2); 
  }

  get _A3() { 
    return new Vector2d(this.x + this.w / 2, this.y + this.h / 2); 
  }

  get _A4() { 
    return new Vector2d(this.x - this.w / 2, this.y + this.h / 2); 
  }

  // eslint-disable-next-line class-methods-use-this
  get _axisX() { // 未旋转时的对称轴X
    return new Vector2d(1, 0); 
  }

  // eslint-disable-next-line class-methods-use-this
  get _axisY() { 
    return new Vector2d(0, 1); 
  }

  // 未旋转时的对称轴Y
  get _CA1() { 
    return Vector2d.sub(this._A1, this.C); 
  }

  get _CA2() { 
    return Vector2d.sub(this._A2, this.C); 
  }

  get _CA3() { 
    return Vector2d.sub(this._A3, this.C); 
  }

  get _CA4() { 
    return Vector2d.sub(this._A4, this.C); 
  }

  get _rotation() { 
    return this.rotation / 180 * Math.PI; 
  }

  get A1() { 
    return this.rotation % 360 === 0 ? this._A1 : Vector2d.add(this.C, Vector2d.rotate(this._CA1, this._rotation)); 
  }

  // 计算上旋转后4角顶点
  get A2() { 
    return this.rotation % 360 === 0 ? this._A2 : Vector2d.add(this.C, Vector2d.rotate(this._CA2, this._rotation)); 
  }

  get A3() { 
    return this.rotation % 360 === 0 ? this._A3 : Vector2d.add(this.C, Vector2d.rotate(this._CA3, this._rotation)); 
  }

  get A4() { 
    return this.rotation % 360 === 0 ? this._A4 : Vector2d.add(this.C, Vector2d.rotate(this._CA4, this._rotation)); 
  }

  get axisX() { 
    return this.rotation % 360 === 0 ? this._axisX : Vector2d.rotate(this._axisX, this._rotation); 
  }

  // 计算上旋转后的对称轴X
  get axisY() { 
    return this.rotation % 360 === 0 ? this._axisY : Vector2d.rotate(this._axisY, this._rotation); 
  }

  // 计算上旋转后的对称轴Y
  get _vertexs() { 
    return [this._A1, this._A2, this._A3, this._A4]; 
  }

  get vertexs() { 
    return [this.A1, this.A2, this.A3, this.A4]; 
  } // 4角顶点数组
}


function cross(rect1, rect2, axis) {
  const vertexs1ScalarProjection = rect1.vertexs.map(vex => Vector2d.dot(vex, axis)).sort((a, b) => a - b); // 矩形1的4个顶点投影并排序
  const vertexs2ScalarProjection = rect2.vertexs.map(vex => Vector2d.dot(vex, axis)).sort((a, b) => a - b); // 矩形2的4个顶点投影并排序
  const rect1Min = vertexs1ScalarProjection[0]; // 矩形1最小长度
  const rect1Max = vertexs1ScalarProjection[vertexs1ScalarProjection.length - 1]; // 矩形1最大长度
  const rect2Min = vertexs2ScalarProjection[0]; // 矩形2最小长度
  const rect2Max = vertexs2ScalarProjection[vertexs1ScalarProjection.length - 1]; // 矩形2最大长度
  return rect1Max >= rect2Min && rect2Max >= rect1Min; // 相交判断 
}

export function OBBrectRectIntersect(rect1, rect2) {
  const rect1AxisX = rect1.axisX;
  const rect1AxisY = rect1.axisY;
  const rect2AxisX = rect2.axisX;
  const rect2AxisY = rect2.axisY;
  if (!cross(rect1, rect2, rect1AxisX)) return false; // 一旦有不相交的轴就可以return false
  if (!cross(rect1, rect2, rect1AxisY)) return false;
  if (!cross(rect1, rect2, rect2AxisX)) return false;
  if (!cross(rect1, rect2, rect2AxisY)) return false;
  return true; // 4轴投影都相交 return true
}

export function AABBrectRectIntersect(rect1, rect2) {
  const P = rect2.C;
  const w2 = rect2.w; 
  const h2 = rect2.h; 
  const { 
    w, h, x, y, 
  } = rect1;
  const { C } = rect1;
  const A3 = new Vector2d(x + w / 2 + w2 / 2, y + h / 2 + h2 / 2); // 新矩形的半长
  const H = Vector2d.sub(A3, C);
  const v = new Vector2d(Math.abs(P.vx - C.vx), Math.abs(P.vy - C.vy));
  const u = new Vector2d(Math.max(v.vx - H.vx, 0), Math.max(v.vy - H.vy, 0));
  return u.length() === 0; // 点可以看成是半径为0的圆
} 
