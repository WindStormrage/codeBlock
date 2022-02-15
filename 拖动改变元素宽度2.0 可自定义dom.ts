import { Vue, Component, Watch } from "vue-property-decorator";
@Component
export default class ResizeMixin extends Vue {
    dragDom = document.createElement('div')
    dragWidth = 15
    movePreX = 0
    resizeDom = {} as HTMLDivElement
    resizeDomWidth = 0
    minWidth = 0
    maxWidth = 0
    // 盒模型padding和border的量
    resizeDomGap = 0
    // 当前是否显示滑块
    resizeVisible = false
    // 默认的样式设置
    defaultStyle = {
        zIndex: 'unset',
    }
    // 默认的变化宽度的dom
    defaultResizeDom = undefined
    // 位置, 在左边还是右边
    dragPosition: 'left' | 'right' = 'left'

    // TODO: 监听css,其他的容器宽度变化会影响他的变化
    mounted() {
        if (this.$refs.resizeDom || this.defaultResizeDom) {
            this.initResize()
        }
    }

    @Watch('resizeVisible')
    onResizeVisible(visible: boolean) {
        // 存在就创建不存在就销毁
        if (visible) {
            setTimeout(this.initResize, 1000);
        } else {
            this.destroyResize()
        }
    }

    // 创建滑块
    initResize() {
        // 如果有默认的dom就使用默认的dom
        this.resizeDom = this.defaultResizeDom || this.$refs.resizeDom as HTMLDivElement
        this.resizeDomWidth = this.resizeDom.offsetWidth
        // offsetWidth会包括padding和border
        // 在border-box的时候宽度就是offsetWidth
        // 在content-box的时候最后计算的宽度需要减去padding和border
        this.resizeDomGap = this.resizeDomWidth - this.clearPx(window.getComputedStyle(this.resizeDom).width)
        // 默认设置最小宽度和最大宽度
        this.minWidth = this.minWidth || this.resizeDomWidth
        this.maxWidth = this.maxWidth || this.resizeDomWidth * 2
        document.documentElement.appendChild(this.dragDom)
        this.setDragStyle()
        this.dragDom.addEventListener('mousedown', this.onMousedown)
        // 禁止框选文字
        document.addEventListener('selectstart', this.onSelectstart)
        // document.documentElement.style.userSelect = 'none'
        window.addEventListener('resize', this.setDragStyle)
        window.addEventListener('scroll', this.setDragStyle, true)
    }

    // 设置滑块的样式
    setDragStyle() {
        this.dragDom.style.height = `${this.resizeDom.offsetHeight}px`
        this.dragDom.style.width = `${this.dragWidth}px`
        this.dragDom.style.position = 'fixed'
        this.dragDom.style.top = `${window.scrollY + this.resizeDom.getBoundingClientRect().y}px`
        this.dragDom.style.background = `rgba(0,0,0,0)`
        this.dragDom.style.transition = `background .2s`
        this.dragDom.style.cursor = `ew-resize`
        // 左侧的不需要加宽度
        if (this.dragPosition === 'left') {
            this.dragDom.style.left = `${window.scrollX + this.resizeDom.getBoundingClientRect().x - this.dragWidth / 2}px`
            // 如果元素存在右边框滑块需要向左平移半个边框的距离
            this.dragDom.style.transform = `translateX(${this.clearPx(window.getComputedStyle(this.resizeDom).borderRightWidth) / 2}px)`
        } else {
            this.dragDom.style.left = `${window.scrollX + this.resizeDom.getBoundingClientRect().x + this.resizeDomWidth - this.dragWidth / 2}px`
            this.dragDom.style.transform = `translateX(-${this.clearPx(window.getComputedStyle(this.resizeDom).borderRightWidth) / 2}px)`
        }
        if (this.defaultStyle.zIndex) {
            this.dragDom.style.zIndex = this.defaultStyle.zIndex
        }
    }

    // 销毁
    destroyResize() {
        document.removeEventListener('mousedown', this.onMousedown)
        document.removeEventListener('selectstart', this.onSelectstart)
        document.removeEventListener('resize', this.setDragStyle)
        document.removeEventListener('scroll', this.setDragStyle, true)
        if (this.dragDom.parentElement) {
            document.documentElement.removeChild(this.dragDom)
        }
    }

    beforeDestroy() {
        this.destroyResize()
    }

    onSelectstart(e: Event) {
        e.preventDefault()
    }
    onMousemove(e: MouseEvent) {
        // 先计算出改变的距离, 当前减去上次距离
        let change = e.clientX - this.movePreX
        // 在左侧向左拉伸是正向, 所以偏移量是旧的减去新的, 所以相反
        if (this.dragPosition === 'left') {
            change = -change
        }
        // 如果加上位移比最小还要小, 或者比最大还要大, 位移设置成最小or最大到当前的距离
        if (this.resizeDomWidth + change < this.minWidth) {
            change = this.minWidth - this.resizeDomWidth
        } else if (this.resizeDomWidth + change > this.maxWidth) {
            change = this.maxWidth - this.resizeDomWidth
        }
        // 在左侧向左移动change为正数, 滑块需要减小, 所以减去change
        if (this.dragPosition === 'left') {
            // 当前的滑块距离的位移
            this.movePreX = this.movePreX - change
            // movePreX跟点击的位置有关, 所以不能作为滑块的left
            this.dragDom.style.left = `${this.clearPx(this.dragDom.style.left) - change}px`
        } else {
            this.movePreX = this.movePreX + change
            this.dragDom.style.left = `${this.clearPx(this.dragDom.style.left) + change}px`
        }
        // 容器的宽度的改变
        this.resizeDomWidth = this.resizeDomWidth + change
        this.resizeDom.style.width = `${this.resizeDomWidth - this.resizeDomGap}px`
    }
    onMousedown(e: MouseEvent) {
        this.movePreX = e.clientX
        // 设置高亮的样式
        this.dragDom.style.background = `rgba(0,0,255,.1)`
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', this.onMousemove)
            this.dragDom.style.background = `rgba(0,0,0,0)`
        }, { once: true })
        document.addEventListener('mousemove', this.onMousemove)
    }
    // 去除末尾的px
    clearPx(data: string) {
        return +data.slice(0, -2)
    }
}
