<!-- 组件使用 -->
<!-- <div :style="`width: ${dragWidth}px;position: relative;`">
    <DragLine :drag-width.sync="dragWidth" />
</div> -->
<template>
    <div ref="dragLine" class="drag-line" :class="{ isDrag: isDragLocal }" />
</template>
<script lang="ts">
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from '@vue/composition-api';

export default defineComponent({
    props: {
        dragWidth: {
            type: Number,
        },
    },
    setup(props, { emit }) {
        const dragWidthLocal: any = ref(props.dragWidth || 428);
        const isDragLocal = ref(false);
        const dragLine = ref(null);

        watch(
            () => isDragLocal.value,
            (val) => {
                document.body.style.userSelect = val ? 'none' : '';
                document.body.style.cursor = val ? 'ew-resize' : '';
            }
        );

        watch(
            () => props.dragWidth,
            () => {
                dragWidthLocal.value = props.dragWidth;
            }
        );
        const onMousedown = () => {
            isDragLocal.value = true;
            document.addEventListener(
                'mouseup',
                () => {
                    isDragLocal.value = false;
                },
                { once: true }
            );
        };
        const moveDrag = (e: { movementX: number }) => {
            if (!isDragLocal.value) return;
            // 左侧还是右侧
            const newData = dragWidthLocal.value + e.movementX;
            // 最大最小宽度改这里
            if (newData > 600 || newData < 240) return;
            dragWidthLocal.value = newData;
            emit('update:dragWidth', newData);
        };

        // 拖拽相关
        onMounted(() => {
            dragLine.value?.addEventListener('mousedown', onMousedown);
            document.addEventListener('mousemove', moveDrag);
        });
        onBeforeUnmount(() => {
            dragLine.value?.removeEventListener('mousedown', onMousedown);
            document.removeEventListener('mousemove', moveDrag);
        });

        return {
            dragLine,
            isDragLocal,
        };
    },
});
</script>
<style lang="less" scoped>
.drag-line {
    position: absolute;
    // 左侧还是右侧
    right: -6px;
    top: 0px;
    height: 100%;
    // 操作空间大小
    width: 12px;
    z-index: 1;
    cursor: ew-resize;
    &:hover,
    &.isDrag {
        &::after {
            content: '';
            position: absolute;
            left: 6px;
            top: 0px;
            height: 100%;
            width: 0px;
            border-left: 1px dashed #7cc6e7;
        }
    }
}
</style>
