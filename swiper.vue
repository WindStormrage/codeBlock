<template>
  <div class="swiper">
    <div class="swiper-dom" ref="swiper">
      <div class="swiper-container" ref="container">
        <div
          class="swiper-item"
          ref="swiperItem"
          v-for="(item, index) in swiperData"
          :key="index"
          :class="{ 'swiper-item--active': swiperActive === index }"
        >
          <div class="swiper-item__border"></div>
          <div class="swiper-item__body">
            <img
              class="swiper-item__img"
              src="https://i.postimg.cc/mD24RMZx/QQ20181021-202255-2x.png"
            />
            <div class="swiper-item__title">{{ item.title }}</div>
            <div class="swiper-item__content" v-html="item.content"></div>
            <div class="swiper-item__progress">
              <div class="swiper-item__progress--inner" ref="progress"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="swiper-dot">
      <img
        class="swiper-dot__item"
        :class="{ 'swiper-dot__item--active': swiperActive === index }"
        :src="swiperActive === index ? dotActive : dot"
        v-for="(item, index) in swiperData"
        :key="index"
        @click="changeSwiper(index)"
      />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dot: 'https://i.postimg.cc/JG2nJqzk/home-swiper-dot.png',
      dotActive: 'https://i.postimg.cc/gnJjn5mp/home-swiper-dot-active.png',
      swiperActive: -1,
      swiperData: [
        {
          icon: 'home-swiper-1.png',
          title: '标题标题标题标题',
          content:
            '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
        },
        {
          icon: 'home-swiper-2.png',
          title: '标题标题标题标题',
          content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
        },
        {
          icon: 'home-swiper-3.png',
          title: '标题标题',
          content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
        },
        {
          icon: 'home-swiper-4.png',
          title: '标题标题标题标题标题',
          content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
        },
        {
          icon: 'home-swiper-5.png',
          title: '标题标题标题',
          content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
        }
      ],
      swiperTime: 6000,
      swiperInterval: null,
      progressInterval: null,
      swiperGap: 200,
      swiperTransitonDuration: 0.8
    }
  },
  mounted () {
    if (this.$refs.swiper) {
      const swiperItemWidth =
        this.$refs.swiperItem[0].offsetWidth + this.swiperGap
      this.$refs.container.style.width = `${
        this.swiperData.length * swiperItemWidth
      }px`
      this.$refs.container.style.transition = `transform ${this.swiperTransitonDuration}s`
      this.swiperChange()
    }
  },
  beforeDestroy () {
    clearInterval(this.swiperInterval)
    clearInterval(this.progressInterval)
  },
  methods: {
    swiperChange (index) {
      // 如果是空就往后加一个,如果加到超过了就是第一个
      if (index === undefined) {
        index = (this.swiperActive + 1) % this.swiperData.length
      }
      const oldIndex = this.swiperActive
      this.swiperActive = index
      // 切换了tab就触发进度条的更新
      this.setProgressState(oldIndex, index)
      // 设置位移
      const swiperWidth = this.$refs.swiper.offsetWidth
      const swiperItemWidth =
        this.$refs.swiperItem[0].offsetWidth + this.swiperGap
      const swiperTranslate =
        (swiperWidth - swiperItemWidth) / 2 - index * swiperItemWidth
      this.$refs.container.style.transform = `translateX(${swiperTranslate}px)`
    },
    changeSwiper (index) {
      this.swiperChange(index)
    },
    setProgressState (oldIndex, newIndex) {
      if (!this.$refs.progress) return
      clearInterval(this.progressInterval)
      // 把上一个进度条设为0
      if (oldIndex >= 0) {
        this.$refs.progress[oldIndex].style.width = '0px'
      }
      const swiperItemWidth = this.$refs.swiperItem[0].offsetWidth
      // 每次累加的宽度
      const onceWidth = swiperItemWidth / (this.swiperTime / 30)
      this.progressInterval = setInterval(() => {
        // 新的长度为旧的长度加上累加的长度,如果长度超过了宽度就是宽度
        const newWidth = this.$refs.progress[newIndex].offsetWidth + onceWidth
        this.$refs.progress[newIndex].style.width = `${Math.min(
          newWidth,
          swiperItemWidth
        )}px`
        if (newWidth >= swiperItemWidth) {
          this.swiperChange()
        }
      }, 30)
    }
  }
}
</script>

<style lang="stylus" scoped>
.swiper {
  height 100vh
  width 100%
  padding-top 50px
  background #060823
  &-dom {
    height 486px
    width 100%
    overflow: hidden;
  }
  &-container {
    height 100%
    display flex
    justify-content space-around
    align-items center
    overflow visible
  }
  &-item {
    height 440px
    width 522px
    display inline-block
    flex-shrink 0
    transition transform .8s
    color #fff
    font-size 25px
    text-align center
    background-image: linear-gradient(180deg, RGBA(13, 41, 109, 0.7) 0%, RGBA(13, 35, 86, 0.7) 100%);
    box-shadow: 0 7px 14px 0 rgba(0,0,0,0.035), inset 0 0 30px 0 RGBA(45, 57, 161, 0.7);
    position relative
    &--active {
      transform scale(1.1, 1.1)
      & .swiper-item__border {
        background-image url('https://i.postimg.cc/JGBqjy4p/swiper-border.png')
      }
    }
    &__border {
      position absolute
      width 818px
      height 440px
      background-image url('https://i.postimg.cc/zyCFP9hW/swiper-border2.png')
      background-size 100% 106%
      background-position 0 -7px
      left -148px
      top 0px
      transition all .8s
    }
    &__body {
      height 100%
      width 100%
      position relative
      padding 24px 35px
      box-sizing border-box
    }
    &__img {
      height 173px
    }
    &__title {
      font-size: 18px;
      color: #FFFFFF;
      margin-top 18px
      margin-bottom 15px
    }
    &__content {
      font-family: PingFangSC-Light;
      font-size: 14px;
      color: #E4E7F8;
      line-height: 20px;
      text-align left
      text-indent: 2em;
    }
    &__progress {
      position absolute
      left 0
      bottom 0
      &--inner {
        height 2px
        width 0px
        background: RGBA(60, 145, 247, .6);
        border-radius: 2px;
      }
    }
  }
  &-dot {
    text-align center
    margin 70px 0
    &__item {
      height 12px
      width 12px
      border-radius 50%
      display inline-block
      margin 0 20px
      &--active {
        transform scale(1.33, 1.33)
      }
    }
  }
}
</style>
