<template>
  <div class="screen-widget-select">
    <div
      ref="select"
      :class="[
        'screen-widget-select-item',
        `screen-widget-select-item-${domRandom}`,
        {
          optionShow: optionState,
          placeholder: getActiveName === undefined,
        },
      ]"
      @click="optionStateChange()"
      :style="getSelectStyle"
    >
      {{ getActiveName === undefined ? "请选择" : getActiveName }}
    </div>
    <div v-show="optionState" ref="option" class="screen-widget-select-option">
      <div
        v-for="item in value"
        @click="change(item.value)"
        :style="getOptionItemStyle"
        :class="[
          'screen-widget-select-option-item',
          { active: item.value === active },
        ]"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * External dependencies
 */
import { Component, Vue, Ref, Watch } from "vue-property-decorator";
import { WidgetEmit, WidgetSource, WidgetProp } from "@ks/screen-editor-api";

/**
 * Internal dependencies
 */

@Component({
  name: "screen-widget-select-renderer",
})
export default class extends Vue {
  @WidgetProp()
  width!: number;

  @WidgetProp()
  height!: number;

  
  value!: Array<{
    label: string;
    value: string;
  }>;

  @WidgetProp()
  defaultActive!: number;

  @WidgetProp()
  color!: {
    border: string;
    background: string;
  };

  @WidgetProp()
  font!: {
    size: number;
    color: string;
  };

  @Ref("select")
  selectDom!: HTMLSelectElement;

  @Ref("option")
  optionDom!: HTMLSelectElement;

  get getSelectStyle() {
    return {
      fontSize: `${this.font.size}px`,
      height: `${this.height}px`,
      lineHeight: `${this.height}px`,
      // background: this.color.background,
      // color: this.font.color,
      // borderColor: this.color.border,
    };
  }
  get getOptionItemStyle() {
    return {
      fontSize: `${this.font.size}px`,
      height: `${this.height}px`,
      lineHeight: `${this.height}px`,
    };
  }

  active = "";
  get getActiveName() {
    return this.value.find((i) => i.value === this.active)?.label;
  }

  optionState = false;
  // 打开关闭下拉框
  optionStateChange(state?: boolean) {
    if (state !== undefined) {
      this.optionState = state;
    } else {
      this.optionState = !this.optionState;
    }
  }

  // 下拉框选择
  change(val: string) {
    this.active = val;
    this.onSelectChange(val);
    this.optionStateChange();
  }

  @WidgetEmit({
    description: "下拉框选择事件",
  })
  onSelectChange(val: string) {
    return val;
  }

  // 随机数是防止同一个页面多个select
  domRandom = "";
  mounted() {
    this.domRandom = Math.floor(Math.random() * 10000) + "";
    window.addEventListener("click", this.closeOption);
  }
  beforeDestroy() {
    window.removeEventListener("click", this.closeOption);
  }
  // 点击到了非下拉框的地方, 隐藏下拉
  closeOption(e: any) {
    const clickClass = e?.path[0]?.className;
    if (
      clickClass === undefined ||
      clickClass.indexOf(`screen-widget-select-item-${this.domRandom}`) === -1
    ) {
      this.optionStateChange(false);
    }
  }
}
</script>

<style lang="less" scoped>
.screen-widget-select {
  width: 100%;
  height: 100%;
  user-select: none;
  &-item {
    width: 100%;
    background: rgba(205, 211, 255, 0.06);
    color: #fff;
    border: 1px solid rgba(205, 211, 255, 0.06);
    border-radius: 4px;
    padding: 0 12px;
    position: relative;
    cursor: pointer;
    &:hover {
      border-color: #3887ea;
    }
    &::after {
      content: "";
      position: absolute;
      right: 15px;
      top: calc(50% - 3px);
      border-top: 6px solid rgba(255, 255, 255, 0.6);
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      pointer-events: none;
      transition: transform 0.3s;
    }
    &.optionShow {
      border-color: #3887ea;
      &::after {
        transform: rotateZ(180deg);
      }
    }
    &.placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  &-option {
    margin-top: 6px;
    padding: 6px 0;
    background: #272832;
    border-radius: 2px;
    &-item {
      padding: 0 12px;
      cursor: pointer;
      color: #969ab4;
      &:hover {
        background: #2f303c;
        color: #fff;
      }
      &.active {
        background: #2f303c;
        color: #3887ea;
      }
    }
  }
}
</style>
