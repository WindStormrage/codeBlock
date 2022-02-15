import { onBeforeUnmount, Ref, ref } from "vue";
/**
 *  点击其他dom改变状态的方法
 * @param unHiddenClass 不能取消的class,如果多个用数组
 * @returns 显示隐藏的状态的变量
 */
export default function popover(unHiddenClass: string | Array<string>): {
  popoverStatus: Ref<boolean>
} {
  const classList: Array<string> = typeof unHiddenClass === 'string' ? [unHiddenClass] : unHiddenClass

  const popoverStatus: Ref<boolean> = ref(false);
  const closePopover = (e: Event) => {
    // 在点击的path上如果有一项包括classList的任意一项都不会变成false
    if (
      !e.path.some((dom: HTMLDivElement) => classList.some(i => dom.className?.split(' ').includes(i)))
    ) {
      popoverStatus.value = false;
    }
  };
  window.addEventListener("click", closePopover);
  onBeforeUnmount(() => {
    window.removeEventListener("click", closePopover);
  });
  return {
    popoverStatus,
  }
}