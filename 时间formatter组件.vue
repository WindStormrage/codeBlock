<template>
  <div class="vc-date" v-html="date"></div>
</template>

<script>
import calendar from '@/utils/calendar';

export default {
  name: 'vc-date',
  props: {
    type: {
      type: String,
      default: 'solar',
    },
    formatter: {
      type: String,
      default: 'YYYY年M月D日',
    },
    timeZone: {
      type: Number,
      default: undefined,
    },
    serverTime: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      date: '',
      timeZoneOffset: 0,
      serverTimeOffset: 0,
      raf: 0,
    };
  },
  mounted() {
    this.getTimeZoneOffset();
    this.getServerTimeOffset();
    this.start();
  },
  watch: {
    timeZone() {
      this.getTimeZoneOffset();
    },
    serverTime() {
      this.getServerTimeOffset();
    }
  },
  methods: {
    getTimeZoneOffset() {
      if (this.timeZone !== undefined) {
        // 获得当前的时区
        const nowZone = 0 - new Date().getTimezoneOffset() / 60;
        this.timeZoneOffset = (nowZone - this.timeZone) * 60 * 60 * 1000;
      } else {
        this.timeZoneOffset = 0;
      }
    },
    getServerTimeOffset() {
      if (this.serverTime) {
        this.serverTimeOffset = new Date().getTime() - new Date(this.serverTime).getTime();
      } else {
        this.serverTimeOffset = 0;
      }
    },
    start() {
      const now = new Date(new Date().getTime() - this.timeZoneOffset - this.serverTimeOffset);
      if (this.type === 'solar') {
        this.date = this.solarFormat(now, this.formatter);
      } else if (this.type === 'lunar') {
        const y = this.solarFormat(now, 'YYYY');
        const m = this.solarFormat(now, 'M');
        const d = this.solarFormat(now, 'D');
        this.date = this.lunarFormat(calendar.solar2lunar(y, m, d), this.formatter);
      }
      this.raf = requestAnimationFrame(this.start);
    },
    stop() {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    },
    restart() {
      if (this.raf) {
        return;
      }
      this.raf = requestAnimationFrame(this.start);
    },
    lunarFormat(date, fmt) {
      date.year = date.lYear % 100;
      const o = {
        'A': 'Animal',
        'DDDD': 'IDayCn',
        'MMMM': 'IMonthCn',
        'D': 'gzDay',
        'M': 'gzMonth',
        'YYYY': 'lYear',
        'YY': 'year',
        'Y': 'gzYear',
        'dddd': 'ncWeek',
      };
      // 汇总一下关键字
      const keyMap = [];
      for (const k in o) {
        keyMap.push(k);
      }
      // 循环设置格式
      for (let index = 0; index < keyMap.length; index++) {
        const key = keyMap[index];
        if(new RegExp("("+ key +")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, date[o[key]]);
          // 如果匹配上了就重新匹配一下
          index = -1;
        }
      }
      return fmt;   
    },
    solarFormat(date, fmt) {
      const CMomth = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      const CDay = ['日', '一', '二', '三', '四', '五', '六'];
      const keys = ['MMMM', 'MMM', 'MM', 'M', 'Q', 'Do', 'DD', 'D', 'dddd', 'ddd', 'dd', 'd', 'YYYY', 'YY'];
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if(new RegExp("("+ key +")").test(fmt)) {
          let value = '';
          let clas = 'classname';
          switch (key) {
            case 'MMMM':
              value = CMomth[date.getMonth()];
              clas += "month";
              break;
            case 'MMM':
              value = (date.getMonth() + 1) + '月';
              clas += "month";
              break;
            case 'MM':
              value = date.getMonth() < 9 ? '0' + String(date.getMonth() + 1) : date.getMonth() + 1;
              clas += "month";
              break;
            case 'M':
              value = date.getMonth() + 1;
              clas += "month";
              break;
            case 'Q':
              value = Math.ceil((date.getMonth() + 1) / 3);
              clas += "quarter";
              break;
            case 'Do':
              value = date.getDate() + '日';
              clas += "rep_time";
              break;
            case 'DD':
              value = date.getDate() < 10 ? '0' + String(date.getDate()) : date.getDate();
              clas += "rep_time";
              break;
            case 'D':
              value = date.getDate();
              clas += "rep_time";
              break;
            case 'dddd':
              value = '星期' + CDay[date.getDay()];
              clas += "week";
              break;
            case 'ddd':
              value = '周' + CDay[date.getDay()];
              clas += "week";
              break;
            case 'dd':
              value = CDay[date.getDay()];
              clas += "week";
              break;
            case 'd':
              value = date.getDay();
              clas += "week";
              break;
            case 'YYYY':
              value = date.getFullYear();
              clas += "year";
              break;
            case 'YY':
              value = date.getFullYear() % 100;
              clas += "year";
              break;
            default:
              break;
          }
          // 如果匹配上了就重新匹配一下
          fmt = fmt.replace(RegExp.$1, `<p class="${clas}"><span>${String(value).split('').join('</span><span>')}</span></p>`);
          index = -1;
        }
      }
      fmt = fmt.replace(new RegExp('classname', 'g'), 'vc-date__');
      fmt = fmt.replace(new RegExp('rep_time', 'g'), 'date');
      return fmt;
    },
  },
};
</script>

<style lang="scss">
@import '@scss/theme/date';
</style>