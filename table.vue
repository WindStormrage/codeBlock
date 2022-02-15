<template>
  <div class="table" ref="table">
    <div class="table-header" ref="header">
      <div
        class="table-header__item"
        v-for="item in data.columnData"
        :key="item.prop"
        :style="`
          width: ${item.width ? getWidth(item.width) : '0px'};
          flex-grow: ${item.width ? '0' : item.col ? item.col : '1'};
          text-align: ${item.align ? item.align : 'left'};
        `"
      >
        <span class="table-header__text" :style="`margin: ${textMargin}`">
          {{ item.label }}
        </span>
      </div>
    </div>
    <div class="table-body" ref="body" @scroll="bodyScroll">
      <div
        class="table-body__tr"
        v-for="(tr, trIndex) in data.tableData"
        :key="trIndex"
      >
        <div
          class="table-body__td"
          v-for="(td, tdIndex) in data.columnData"
          :key="tdIndex"
          :style="`
            width: ${td.width ? getWidth(td.width) : '0px'};
            flex-grow: ${td.width ? '0' : td.col ? td.col : '1'};
            text-align: ${td.align ? td.align : 'left'};
          `"
        >
          <span class="table-body__text" :style="`margin: ${textMargin}`">
            <slot :name="td.prop" :row="tr">{{ tr[td.prop] }}</slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount, Ref } from "vue";
import TableData from "@/component/type";

export default defineComponent({
  props: {
    data: {
      type: Object as TableData,
      default: () => ({}),
    },
    textMargin: {
      type: String,
      default: "0",
    },
  },
  setup(_, { emit }) {
    const body: Ref<HTMLDivElement | null> = ref(null);
    const table: Ref<HTMLDivElement | null> = ref(null);
    const header: Ref<HTMLDivElement | null> = ref(null);
    // 宽度自动补充px
    const getWidth = (data: string) => {
      if (data.indexOf("px") > 0) {
        return data;
      }
      return data + "px";
    };

    // 暴露表格滚动事件
    const bodyScroll = () => {
      emit("bodyScroll");
    };

    // 监听resize改变表格body的高度
    const resizeBodyHeight = () => {
      if (body.value && table.value && header.value) {
        body.value.style.height = `${
          table.value.offsetHeight - header.value.offsetHeight
        }px`;
      }
    };
    window.addEventListener("resize", resizeBodyHeight);
    const removeResize = () => {
      window.removeEventListener("resize", resizeBodyHeight);
    };
    onMounted(resizeBodyHeight);
    onBeforeUnmount(removeResize);
    return {
      getWidth,
      body,
      table,
      header,
      bodyScroll,
    };
  },
});
</script>

<style lang="postcss" scoped>
.table {
  &-header {
    display: flex;
    min-height: 40px;
    box-shadow: 0px -1px 0px 0px rgba(255, 255, 255, 0.12) inset;
    &__item {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    &__text {
      width: 100%;
      color: rgba(255, 255, 255, 0.5);
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
  &-body {
    overflow-y: scroll;
    &__tr {
      display: flex;
      min-height: 40px;
      box-shadow: 0px -1px 0px 0px rgba(255, 255, 255, 0.12) inset;
      &:hover {
        background: rgba(204, 219, 255, 0.08);
      }
    }
    &__td {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    &__text {
      width: 100%;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>