/**
 * 向量旋转
 * @param {{x:Number,y:Number}} vector
 * @param {number} angle 旋转的角度 弧度制
 * @param {*} origin  旋转点 默认是 （0,0）,可传入 绕着的某点
 */
function vectorRotate(vectorX, vectorY, originX, originY, angle) {
	const r = (angle * Math.PI) / 180;
	const cosA = Math.cos(r);
	const sinA = Math.sin(r);
	var x1 = (vectorX - originX) * cosA - (vectorY - originY) * sinA;
	var y1 = (vectorX - originX) * sinA + (vectorY - originY) * cosA;
	return [originX + x1, originY + y1];
}

//两个向量的点积
function dotV2(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
}
//计算polyArr在轴线axis上的投影,polyArr是一系列点坐标的集合,数组表示
function calcProj(axis, polyArr) {
	var v = { x: polyArr[0], y: polyArr[1] };
	var d, min, max;
	min = max = dotV2(axis, v); //计算投影轴与第一个坐标点的点积
	for (var i = 2; i < polyArr.length - 1; i += 2) {
		v.x = polyArr[i];
		v.y = polyArr[i + 1];
		d = dotV2(axis, v); //计算v到投影轴的距离,遍历出最小和最大区间
		min = d < min ? d : min;
		max = d > max ? d : max;
	}
	return [min, max];
}
//计算同一个轴上线段的距离s1(min1,max1),s2(min2,max2),如果距离小于0则表示两线段有相交;
function segDist(min1, max1, min2, max2) {
	if (min1 < min2) {
		return min2 - max1;
	} else {
		return min1 - max2;
	}
}
//判断两个多边形是否相交碰撞,p1,p2用于保存多边形点的数组
function isCollide(p1, p2) {
	//定义法向量
	var e = { x: 0, y: 0 };
	var p = p1,
		idx = 0,
		len1 = p1.length,
		len2 = p2.length,
		px,
		py; //p缓存形状p1的数据
	for (
		var i = 0, len = len1 + len2;
		i < len - 1;
		i += 2 //遍历所有坐标点，i+=2代表xy轴两个坐标点
	) {
		idx = i;
		//计算两个多边形每条边
		if (i > len1) {
			//当p1遍历完毕后，p缓存形状p2的数据,从新遍历
			p = p2;
			idx = i - len1; //len2
		}
		if (i === p.length - 2) {
			//p包含的点数据组成的最后一个坐标点
			px = p[0] - p[idx]; //首尾的x轴相连
			py = p[1] - p[idx + 1]; //首尾的y轴相连
		} else {
			px = p[idx + 2] - p[idx]; //递增的x轴相连
			py = p[idx + 3] - p[idx + 1]; //递减的y轴相连
		}
		//得到边的法向量【垂直相交】，即投影轴
		e.x = -py;
		e.y = px;
		//计算两个多边形在法向量上的投影
		var pp1 = calcProj(e, p1); //涵盖到投影轴的最小值与最大值
		var pp2 = calcProj(e, p2);
		//计算两个线段在法向量上距离，如果大于0则可以退出，表示无相交
		if (segDist(pp1[0], pp1[1], pp2[0], pp2[1]) > 0) {
			return false;
		}
	}
	return true;
}

export function OBBrectRectIntersect(rect1, rect2) {
	const centerx = rect1.x + 0.5 * rect1.w;
	const centery = rect1.y + 0.5 * rect1.h;
	let pointers = [
		...vectorRotate(rect1.x, rect1.y, centerx, centery, rect1.rotation),
		...vectorRotate(
			rect1.x + rect1.w,
			rect1.y,
			centerx,
			centery,
			rect1.rotation
		),
		...vectorRotate(
			rect1.x + rect1.w,
			rect1.y + rect1.h,
			centerx,
			centery,
			rect1.rotation
		),
		...vectorRotate(
			rect1.x,
			rect1.y + rect1.h,
			centerx,
			centery,
			rect1.rotation
		),
	];
	return isCollide(pointers, [
		rect2.x,
		rect2.y,
		rect2.x + rect2.w,
		rect2.y,
		rect2.x + rect2.w,
		rect2.y + rect2.h,
		rect2.x,
		rect2.y + rect2.h,
	]);
}

export function AABBrectRectIntersect(rect1, rect2) {
	return (
		rect1.x < rect2.x + rect2.w &&
		rect1.x + rect1.w > rect2.x &&
		rect1.y < rect2.y + rect2.h &&
		rect1.h + rect1.y > rect2.y
	);
}
