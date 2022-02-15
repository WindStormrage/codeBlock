<template>
	<div class="container">
		<div
			class="box"
			v-for="(item, index) in list"
			:key="index"
			:style="{
				height: `${item.h}px`,
				width: `${item.w}px`,
				left: `${item.x}px`,
				top: `${item.y}px`,
        borderColor: styleList[index],
        transform: `rotate(${item.rotation}deg)`
			}"
		></div>
    <div ref="move" class="move" @mousedown="beginMove" @mouseup="endMove"></div>
	</div>
</template>
<script>
import { OBBrectRectIntersect } from './aabb+obb'
export default {
	data() {
		return {
			list: [
				{
					x: 0,
					y: 0,
					h: 100,
					w: 100,
				},
			],
      position: [0, 0],
      styleList: [],
		};
	},
	mounted() {
    this.list = []
		for (let i = 0; i < 10; i++) {
      const x = parseInt(Math.random() * 500)
      const y = parseInt(Math.random() * 500)
			this.list.push({
				x,
				y,
				h: parseInt(Math.random() * (500 - y)),
				w: parseInt(Math.random() * (500 - x)),
        rotation: parseInt(Math.random() * 360)
			});
      this.$refs.move.style.left = '0px'
      this.$refs.move.style.top = '0px'
		}
	},
  methods: {
    beginMove(e) {
      this.position = [e.pageX, e.pageY]
      document.addEventListener('mousemove', this.move)
    },
    move (e) {
      const x = e.pageX, y = e.pageY
      const left = this.$refs.move.offsetLeft
      const top = this.$refs.move.offsetTop
      this.$refs.move.style.left = `${(left + x - this.position[0]).toFixed(0)}px`
      this.$refs.move.style.top = `${(top + y - this.position[1]).toFixed(0)}px`
      this.position = [x, y]
      this.findCollision()
    },
    endMove () {
      document.removeEventListener('mousemove', this.move)
    },
    findCollision () {
      this.list.forEach((item, index) => {
        const sum = OBBrectRectIntersect(item, {
          x: this.$refs.move.offsetLeft,
          y: this.$refs.move.offsetTop,
          w: 100,
          h: 100
        })
        if (sum) {
          this.$set(this.styleList, index, 'red')
        } else {
          this.$set(this.styleList, index, 'green')
        }
      })
    }
  }
};
</script>
<style>
.container {
	height: 500px;
	width: 500px;
	border: 1px solid red;
	position: relative;
}
.box {
	border: 1px solid green;
	position: absolute;
}
.move {
  height: 100px;
  width: 100px;
  border: 1px solid steelblue;
  position: absolute;
  left: 50px;
  top: 50px;
}
.dot {
  background: yellow;
  height: 2px;
  width: 2px;
  position: absolute;
}
</style>
